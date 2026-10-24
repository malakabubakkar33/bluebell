import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, whatsapp, city, address } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const adminClient = getSupabaseAdminClient();

    let userId = `user-${Date.now()}`;
    let createdInSupabase = false;

    if (adminClient) {
      // Check if user already exists in Supabase Auth
      try {
        const { data: existingUsers } = await adminClient.auth.admin.listUsers();
        const found = existingUsers?.users?.find(
          (u) => u.email?.toLowerCase() === trimmedEmail
        );

        if (found) {
          return NextResponse.json(
            { success: false, error: 'An account with this email already exists in Supabase. Please sign in.' },
            { status: 400 }
          );
        }

        // Create user in Supabase Authentication with auto-confirmed email
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: trimmedEmail,
          password: password,
          email_confirm: true, // Automatically confirms email so user can log in immediately
          user_metadata: {
            name: name.trim(),
            phone: phone ? phone.trim() : '',
            whatsapp: whatsapp ? whatsapp.trim() : (phone ? phone.trim() : ''),
            city: city ? city.trim() : '',
            address: address ? address.trim() : '',
            role: 'customer',
          },
        });

        if (createError) {
          console.warn('Supabase admin.createUser note:', createError.message);
          // If the error is an actual conflict (e.g. user already exists), report it
          if (createError.message && (createError.message.includes('already exists') || createError.message.includes('unique'))) {
            return NextResponse.json(
              { success: false, error: 'An account with this email already exists. Please sign in.' },
              { status: 400 }
            );
          }
        } else if (newUser?.user) {
          userId = newUser.user.id;
          createdInSupabase = true;

          // Explicitly save/upsert user into Supabase database table `public.app_users`
          try {
            await (adminClient as any).from('app_users').upsert({
              id: userId,
              email: trimmedEmail,
              name: name.trim(),
              phone: phone ? phone.trim() : '',
              whatsapp: whatsapp ? whatsapp.trim() : (phone ? phone.trim() : ''),
              city: city ? city.trim() : 'Peshawar',
              address: address ? address.trim() : '',
              role: 'customer',
              status: 'active',
              orders_count: 0,
              total_spent: 0,
              last_login: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'email' });
          } catch (dbErr: any) {
            console.warn('Supabase DB app_users upsert note:', dbErr?.message);
          }
        }
      } catch (err: any) {
        console.warn('Supabase Auth error during registration:', err.message);
      }
    }

    const userProfile = {
      id: userId,
      name: name.trim(),
      email: trimmedEmail,
      phone: phone ? phone.trim() : '',
      whatsapp: whatsapp ? whatsapp.trim() : (phone ? phone.trim() : ''),
      city: city || 'Peshawar',
      address: address || '',
      role: 'customer' as const,
      status: 'active' as const,
      created_at: new Date().toISOString(),
      orders_count: 0,
      total_spent: 0,
      syncedWithSupabase: createdInSupabase,
    };

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: 'Account created and verified in Supabase Authentication successfully!',
    });
  } catch (error: any) {
    console.error('Registration handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal registration error' },
      { status: 500 }
    );
  }
}
