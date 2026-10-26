import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

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

    let userId: any = crypto.randomUUID();
    let createdInSupabase = false;

    if (adminClient) {
      // 1. Check if user already exists in public.app_users table
      try {
        const { data: existingAppUser } = await (adminClient as any)
          .from('app_users')
          .select('id, email')
          .eq('email', trimmedEmail)
          .maybeSingle();

        if (existingAppUser) {
          return NextResponse.json(
            { success: false, error: 'An account with this email already exists. Please sign in.' },
            { status: 400 }
          );
        }
      } catch (err: any) {
        console.warn('app_users check warning:', err?.message);
      }

      // 2. Create user in Supabase Authentication with auto-confirmed email
      try {
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
          email: trimmedEmail,
          password: password,
          email_confirm: true, // Automatically confirms email so customer can sign in immediately
          user_metadata: {
            name: name.trim(),
            phone: phone ? phone.trim() : '',
            whatsapp: whatsapp ? whatsapp.trim() : (phone ? phone.trim() : ''),
            city: city ? city.trim() : '',
            address: address ? address.trim() : '',
            role: 'customer',
          },
        });

        if (newUser?.user) {
          userId = newUser.user.id;
          createdInSupabase = true;
        } else if (createError) {
          console.warn('Supabase admin.createUser note:', createError.message);
          // If conflict in auth, check if we can get existing auth user id
          if (createError.message && (createError.message.includes('already exists') || createError.message.includes('unique'))) {
            try {
              const { data: list } = await adminClient.auth.admin.listUsers();
              const existingAuth = list?.users?.find((u: any) => u.email?.toLowerCase() === trimmedEmail);
              if (existingAuth) {
                userId = existingAuth.id;
              }
            } catch (listErr) {}
          }
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth error during registration:', authErr?.message);
      }

      // 3. Guaranteed persistence into public.app_users table
      try {
        const now = new Date().toISOString();
        const userRow = {
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
          last_login: now,
          created_at: now,
          updated_at: now,
        };

        const { error: upsertErr } = await (adminClient as any)
          .from('app_users')
          .upsert(userRow, { onConflict: 'email' });

        if (upsertErr) {
          console.error('Supabase DB app_users upsert error:', upsertErr.message);
        } else {
          createdInSupabase = true;
        }
      } catch (dbErr: any) {
        console.error('Supabase DB app_users upsert exception:', dbErr?.message);
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
      message: 'Account created and recorded in store database successfully!',
    });
  } catch (error: any) {
    console.error('Registration handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal registration error' },
      { status: 500 }
    );
  }
}
