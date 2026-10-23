import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { supabase } from '@/lib/supabase/client';

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

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Check Admin Credentials
    if (
      (trimmedEmail === 'admin@bluebells.pk' ||
        trimmedEmail === 'admin@bluebell.com' ||
        trimmedEmail === 'admin') &&
      (password === 'admin123' || password === 'admin' || password === 'BlueBells@2026')
    ) {
      const adminProfile = {
        id: 'user-admin-1',
        name: 'Blue Bell Admin',
        email: 'admin@bluebells.pk',
        phone: '+92 300 1234567',
        whatsapp: '+92 300 1234567',
        city: 'Peshawar',
        address: 'Saddar Road, Blue Bell Mobile Shop',
        role: 'admin' as const,
        status: 'active' as const,
        created_at: '2026-01-01T00:00:00.000Z',
        orders_count: 0,
        total_spent: 0,
      };

      return NextResponse.json({
        success: true,
        user: adminProfile,
      });
    }

    const adminClient = getSupabaseAdminClient();

    if (adminClient) {
      // Find user in Supabase Auth
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      const existingUser = usersData?.users?.find(
        (u) => u.email?.toLowerCase() === trimmedEmail
      );

      // If user exists in Supabase but their email is not confirmed, auto-confirm it now
      if (existingUser && !existingUser.email_confirmed_at) {
        await adminClient.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true,
        });
      }

      // Try signInWithPassword
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (signInData?.user && !signInError) {
        const meta = signInData.user.user_metadata || {};
        const profile = {
          id: signInData.user.id,
          name: meta.name || trimmedEmail.split('@')[0],
          email: signInData.user.email || trimmedEmail,
          phone: meta.phone || '',
          whatsapp: meta.whatsapp || meta.phone || '',
          city: meta.city || 'Peshawar',
          address: meta.address || '',
          role: (meta.role === 'admin' ? 'admin' : 'customer') as 'admin' | 'customer',
          status: 'active' as const,
          created_at: signInData.user.created_at || new Date().toISOString(),
          orders_count: 0,
          total_spent: 0,
        };

        return NextResponse.json({
          success: true,
          user: profile,
        });
      }

      if (signInError) {
        // If password failed or not found in Supabase Auth
        return NextResponse.json(
          {
            success: false,
            error: signInError.message === 'Invalid login credentials'
              ? 'Invalid email or password. Please check your credentials or click Sign Up.'
              : signInError.message,
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid email or password. Please check your credentials.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
