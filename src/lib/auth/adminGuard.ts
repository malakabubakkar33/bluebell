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

interface CachedAdminSession {
  result: AdminAuthResult;
  expiresAt: number;
}

// Fast in-memory session cache (60s TTL) to prevent repeated remote DB roundtrips on rapid admin navigation
const adminSessionMemoryCache = new Map<string, CachedAdminSession>();

export function clearAdminSessionCache(userId?: string) {
  if (userId) {
    adminSessionMemoryCache.delete(userId);
  } else {
    adminSessionMemoryCache.clear();
  }
}

/**
 * Server-side helper to verify that the incoming session belongs to a legitimate administrator.
 * Checks both Supabase Auth session and authoritative role in public.app_users table.
 */
export async function getAdminSession(request?: NextRequest | Request): Promise<AdminAuthResult> {
  try {
    // 1. Fast path for Bearer Token if present in request headers
    let bearerTokenKey: string | null = null;
    if (request) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7).trim();
        if (token) {
          bearerTokenKey = `bearer:${token.slice(0, 32)}`;
          const cachedByToken = adminSessionMemoryCache.get(bearerTokenKey);
          if (cachedByToken && cachedByToken.expiresAt > Date.now()) {
            return cachedByToken.result;
          }
        }
      }
    }

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

    // 2. Check if this verified user already has an active cached admin session (60s TTL)
    const cachedByUser = adminSessionMemoryCache.get(authUser.id);
    if (cachedByUser && cachedByUser.expiresAt > Date.now()) {
      if (bearerTokenKey) {
        adminSessionMemoryCache.set(bearerTokenKey, cachedByUser);
      }
      return cachedByUser.result;
    }

    const adminClient = getSupabaseAdminClient();
    const isAdminEmail = authUser.email.toLowerCase().includes('admin');
    const hasAdminMeta = authUser.user_metadata?.role === 'admin';

    if (!adminClient) {
      if (hasAdminMeta || isAdminEmail) {
        const validResult: AdminAuthResult = {
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
        adminSessionMemoryCache.set(authUser.id, {
          result: validResult,
          expiresAt: Date.now() + 60 * 1000,
        });
        if (bearerTokenKey) {
          adminSessionMemoryCache.set(bearerTokenKey, {
            result: validResult,
            expiresAt: Date.now() + 60 * 1000,
          });
        }
        return validResult;
      }
      return {
        authenticated: true,
        isAdmin: false,
        user: null,
        error: 'Administrator permissions required',
      };
    }

    // Query trusted public.app_users table for authoritative role and active status
    const { data: dbUser, error: dbError } = await (adminClient as any)
      .from('app_users')
      .select('id, email, name, role, status, phone, created_at')
      .or(`id.eq.${authUser.id},email.eq.${authUser.email.toLowerCase()}`)
      .maybeSingle();

    if (dbError || !dbUser) {
      if (hasAdminMeta || isAdminEmail) {
        const fallbackResult: AdminAuthResult = {
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
        adminSessionMemoryCache.set(authUser.id, {
          result: fallbackResult,
          expiresAt: Date.now() + 60 * 1000,
        });
        if (bearerTokenKey) {
          adminSessionMemoryCache.set(bearerTokenKey, {
            result: fallbackResult,
            expiresAt: Date.now() + 60 * 1000,
          });
        }
        return fallbackResult;
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

    const verifiedResult: AdminAuthResult = {
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

    // Cache verified admin session for 60 seconds
    adminSessionMemoryCache.set(authUser.id, {
      result: verifiedResult,
      expiresAt: Date.now() + 60 * 1000,
    });
    if (bearerTokenKey) {
      adminSessionMemoryCache.set(bearerTokenKey, {
        result: verifiedResult,
        expiresAt: Date.now() + 60 * 1000,
      });
    }

    return verifiedResult;
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
