import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let trimmedEmail = email.trim().toLowerCase();
    // Shorthand convenience mapping
    if (trimmedEmail === 'admin') {
      trimmedEmail = 'admin@bluebell.pk';
    }

    // 1. Initialize Supabase Server Client (stores session in cookies)
    const serverClient = await createSupabaseServerClient();
    if (!serverClient) {
      return NextResponse.json(
        { success: false, error: 'Database server client not configured' },
        { status: 500 }
      );
    }

    // 2. Authenticate credentials against real Supabase Auth
    const { data: authData, error: authError } = await serverClient.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authError || !authData?.user) {
      return NextResponse.json(
        {
          success: false,
          error:
            authError?.message === 'Invalid login credentials'
              ? 'Invalid administrator email or password. Please verify your credentials.'
              : authError?.message || 'Authentication failed',
        },
        { status: 401 }
      );
    }

    // 3. Authorize: Verify that this account possesses legitimate administrator role in public.app_users
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { success: false, error: 'Privileged database connection not configured' },
        { status: 500 }
      );
    }

    const { data: dbUser, error: dbError } = await (adminClient as any)
      .from('app_users')
      .select('id, email, name, role, status, phone')
      .or(`id.eq.${authData.user.id},email.eq.${trimmedEmail}`)
      .maybeSingle();

    if (dbError || !dbUser) {
      // User is in auth.users but has no profile in app_users
      await serverClient.auth.signOut();
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied: No administrative profile found for this account.',
        },
        { status: 403 }
      );
    }

    if (dbUser.status !== 'active') {
      await serverClient.auth.signOut();
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied: This administrator account is suspended.',
        },
        { status: 403 }
      );
    }

    if (dbUser.role !== 'admin') {
      // User is a valid customer, but NOT an administrator!
      await serverClient.auth.signOut();
      return NextResponse.json(
        {
          success: false,
          error:
            'Access denied: Customer accounts do not have administrator permissions.',
        },
        { status: 403 }
      );
    }

    // 4. Update last_login in public.app_users
    try {
      await (adminClient as any)
        .from('app_users')
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', dbUser.id);
    } catch (updateErr) {
      console.warn('Could not update admin last_login timestamp:', updateErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Administrator authenticated successfully',
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name || 'Administrator',
        role: 'admin',
        phone: dbUser.phone || undefined,
      },
    });
  } catch (error: any) {
    console.error('Admin login API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error during authentication' },
      { status: 500 }
    );
  }
}
