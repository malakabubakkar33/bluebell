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

    const { error: verifyError } = await serverClient.auth.signInWithPassword({
      email: adminEmail,
      password: currentPassword,
    });

    if (verifyError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current password is incorrect. Please verify your existing password.',
        },
        { status: 400 }
      );
    }

    // 3. Update password via Supabase Admin API
    const adminClient = getSupabaseAdminClient();
    if (adminClient) {
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        auth.user.id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('[ChangePassword] Supabase update error:', updateError);
        return NextResponse.json(
          { success: false, error: updateError.message || 'Failed to update administrator password.' },
          { status: 500 }
        );
      }

      // Also update last_password_change in public.app_users
      try {
        await (adminClient as any)
          .from('app_users')
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq('id', auth.user.id);
      } catch (e) {
        console.warn('[ChangePassword] User table update note:', e);
      }
    } else {
      // Fallback via user session client
      const { error: updateError } = await serverClient.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return NextResponse.json(
          { success: false, error: updateError.message || 'Failed to update password.' },
          { status: 500 }
        );
      }
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
