import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  phone?: string;
  created_at?: string;
}

export interface AdminAuthResult {
  authenticated: boolean;
  isAdmin: boolean;
  user: AdminUser | null;
  error?: string;
}

/**
 * Server-side helper to verify that the incoming session belongs to a legitimate administrator.
 * Checks both Supabase Auth session and authoritative role in public.app_users table.
 */
export async function getAdminSession(request?: NextRequest | Request): Promise<AdminAuthResult> {
  try {
    const supabaseServer = await createSupabaseServerClient();
    if (!supabaseServer) {
      return {
        authenticated: false,
        isAdmin: false,
        user: null,
        error: 'Supabase server client not configured',
      };
    }

    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !authUser || !authUser.email) {
      return {
        authenticated: false,
        isAdmin: false,
        user: null,
        error: authError?.message || 'Not authenticated',
      };
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      if (authUser.user_metadata?.role === 'admin') {
        return {
          authenticated: true,
          isAdmin: true,
          user: {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || 'Administrator',
            role: 'admin',
            phone: authUser.phone || authUser.user_metadata?.phone || undefined,
            created_at: authUser.created_at || undefined,
          },
        };
      }
      return {
        authenticated: true,
        isAdmin: false,
        user: null,
        error: 'Database admin client not configured',
      };
    }

    // Query trusted public.app_users table for authoritative role and active status
    const { data: dbUser, error: dbError } = await (adminClient as any)
      .from('app_users')
      .select('id, email, name, role, status, phone, created_at')
      .or(`id.eq.${authUser.id},email.eq.${authUser.email.toLowerCase()}`)
      .maybeSingle();

    if (dbError || !dbUser) {
      if (authUser.user_metadata?.role === 'admin') {
        return {
          authenticated: true,
          isAdmin: true,
          user: {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name || 'Administrator',
            role: 'admin',
            phone: authUser.phone || authUser.user_metadata?.phone || undefined,
            created_at: authUser.created_at || undefined,
          },
        };
      }
      return {
        authenticated: true,
        isAdmin: false,
        user: null,
        error: 'User profile not found in database',
      };
    }

    if (dbUser.status !== 'active') {
      return {
        authenticated: true,
        isAdmin: false,
        user: null,
        error: 'Account is suspended',
      };
    }

    if (dbUser.role !== 'admin') {
      return {
        authenticated: true,
        isAdmin: false,
        user: null,
        error: 'User does not possess administrator privileges',
      };
    }

    return {
      authenticated: true,
      isAdmin: true,
      user: {
        id: dbUser.id || authUser.id,
        email: dbUser.email || authUser.email,
        name: dbUser.name || 'Administrator',
        role: 'admin',
        phone: dbUser.phone || undefined,
        created_at: dbUser.created_at || undefined,
      },
    };
  } catch (err: any) {
    console.error('[getAdminSession] exception:', err);
    return {
      authenticated: false,
      isAdmin: false,
      user: null,
      error: err.message || 'Authentication error',
    };
  }
}

/**
 * Enforces admin authorization on API routes.
 * Returns null if authorized, or a ready-to-return NextResponse (401 or 403) if unauthorized.
 */
export async function requireAdminApi(
  request?: NextRequest | Request
): Promise<{ user: AdminUser } | { response: NextResponse }> {
  const result = await getAdminSession(request);

  if (!result.authenticated) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: result.error || 'Authentication required to access administrative resource',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 }
      ),
    };
  }

  if (!result.isAdmin || !result.user) {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: 'Access denied: Administrator permissions required',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
    };
  }

  return { user: result.user };
}
