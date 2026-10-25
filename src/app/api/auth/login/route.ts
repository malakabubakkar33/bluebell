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

        // Fetch or create user record in Supabase Database `public.app_users`
        let dbUser: any = null;
        try {
          const { data: existingDbUser } = await (adminClient as any)
            .from('app_users')
            .select('*')
            .eq('email', trimmedEmail)
            .single();

          if (existingDbUser) {
            dbUser = existingDbUser;
            // Update last_login timestamp
            await (adminClient as any)
              .from('app_users')
              .update({
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('email', trimmedEmail);
          } else {
            // First time login or missed sync: Insert into public.app_users
            const { data: insertedUser } = await (adminClient as any)
              .from('app_users')
              .upsert(
                {
                  id: signInData.user.id,
                  email: trimmedEmail,
                  name: meta.name || trimmedEmail.split('@')[0],
                  phone: meta.phone || '',
                  whatsapp: meta.whatsapp || meta.phone || '',
                  city: meta.city || 'Peshawar',
                  address: meta.address || '',
                  role: meta.role === 'admin' ? 'admin' : 'customer',
                  status: 'active',
                  orders_count: 0,
                  total_spent: 0,
                  last_login: new Date().toISOString(),
                  created_at: signInData.user.created_at || new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'email' }
              )
              .select()
              .single();
            dbUser = insertedUser;
          }
        } catch (dbErr: any) {
          console.warn('DB app_users login sync note:', dbErr?.message);
        }

        // Check if user is suspended in database
        if (dbUser?.status === 'suspended') {
          return NextResponse.json(
            {
              success: false,
              error: 'Your account is currently suspended. Please contact store support on WhatsApp.',
            },
            { status: 403 }
          );
        }

        const profile = {
          id: dbUser?.id || signInData.user.id,
          name: dbUser?.name || meta.name || trimmedEmail.split('@')[0],
          email: dbUser?.email || signInData.user.email || trimmedEmail,
          phone: dbUser?.phone || meta.phone || '',
          whatsapp: dbUser?.whatsapp || meta.whatsapp || meta.phone || '',
          city: dbUser?.city || meta.city || 'Peshawar',
          address: dbUser?.address || meta.address || '',
          role: (dbUser?.role || (meta.role === 'admin' ? 'admin' : 'customer')) as 'admin' | 'customer',
          status: (dbUser?.status || 'active') as 'active' | 'suspended',
          created_at: dbUser?.created_at || signInData.user.created_at || new Date().toISOString(),
          orders_count: dbUser?.orders_count || 0,
          total_spent: dbUser?.total_spent || 0,
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
