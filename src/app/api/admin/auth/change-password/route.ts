import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth/adminGuard';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Authorize: Enforce administrator session
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'New password and confirmation do not match.' },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from your current password.' },
        { status: 400 }
      );
    }

    const adminEmail = auth.user.email.toLowerCase();

    // 2. Verify current password against Supabase Auth
    const serverClient = await createSupabaseServerClient();
    if (!serverClient) {
      return NextResponse.json(
        { success: false, error: 'Authentication service unavailable.' },
        { status: 500 }
      );
    }

    const { data: signInData, error: verifyError } = await serverClient.auth.signInWithPassword({
      email: adminEmail,
      password: currentPassword,
    });

    if (verifyError || !signInData?.session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password is incorrect. Please verify your existing password.',
        },
        { status: 400 }
      );
    }

    const accessToken = signInData.session.access_token;
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      'https://duujhipnbythezqtmdbk.supabase.co';
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'sb_publishable_eyt1FI5cXiT0oF-DKPQ_Qw_-DbWkiif';

    let passwordUpdated = false;

    // Strategy 1: Update directly via the authenticated user's Bearer token
    if (accessToken) {
      try {
        const updateRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ password: newPassword }),
        });

        const updateJson = await updateRes.json();
        if (updateRes.ok) {
          passwordUpdated = true;
        } else {
          console.warn('[ChangePassword] /auth/v1/user PUT note:', updateJson);
        }
      } catch (err) {
        console.warn('[ChangePassword] Error updating user via Bearer token:', err);
      }
    }

    // Strategy 2: If strategy 1 failed, check if we have a valid service_role secret key
    if (!passwordUpdated) {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
      const isRealServiceKey = Boolean(
        serviceRoleKey &&
        !serviceRoleKey.startsWith('sb_publishable') &&
        serviceRoleKey !== anonKey
      );

      if (isRealServiceKey) {
        const adminClient = getSupabaseAdminClient();
        if (adminClient) {
          const { error: adminUpdateError } = await adminClient.auth.admin.updateUserById(
            auth.user.id,
            { password: newPassword }
          );

          if (!adminUpdateError) {
            passwordUpdated = true;
          } else {
            console.error('[ChangePassword] Admin API update error:', adminUpdateError);
            return NextResponse.json(
              { success: false, error: adminUpdateError.message || 'Failed to update administrator password.' },
              { status: 500 }
            );
          }
        }
      }
    }

    if (!passwordUpdated) {
      return NextResponse.json(
        { success: false, error: 'Could not update password. Please check your credentials.' },
        { status: 500 }
      );
    }

    // 4. Update last_password_change in public.app_users
    try {
      const adminClient = getSupabaseAdminClient();
      if (adminClient) {
        await (adminClient as any)
          .from('app_users')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('id', auth.user.id);
      }
    } catch (e) {
      console.warn('[ChangePassword] User table update note:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Administrator password updated successfully! Previous password has been revoked.',
    });
  } catch (error: any) {
    console.error('[POST /api/admin/auth/change-password] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An error occurred while changing password.' },
      { status: 500 }
    );
  }
}
