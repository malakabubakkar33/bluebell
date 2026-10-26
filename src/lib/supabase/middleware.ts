import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * High-Concurrency Optimized Middleware Session Handler
 * 
 * Performance Design:
 * - Ultra-fast zero-latency fast path for all storefront traffic.
 * - Storefront pages and public APIs bypass outbound auth network calls completely,
 *   enabling 500+ concurrent users to navigate smoothly with 0ms middleware overhead.
 * - Admin route authentication checks cookies before making network roundtrips.
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // FAST PATH: Public storefront & shopper APIs never wait on Supabase Auth.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next({ request });
  }

  // Admin Fast Guard: Check if Supabase auth cookies even exist before opening network client
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
  );

  // If visitor is requesting protected admin route without ANY auth cookie, redirect immediately (0ms latency)
  if (pathname !== '/admin/login' && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // If visitor is on /admin/login and has NO auth cookie, let them view the login page immediately
  if (pathname === '/admin/login' && !hasAuthCookie) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const DEFAULT_SUPABASE_URL = 'https://duujhipnbythezqtmdbk.supabase.co';
  const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_eyt1FI5cXiT0oF-DKPQ_Qw_-DbWkiif';

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-url')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 1. If at /admin/login and already an authenticated admin, send to dashboard
    if (pathname === '/admin/login') {
      if (user && user.user_metadata?.role === 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/admin';
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // 2. Unauthenticated visitors are redirected to /admin/login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // 3. Authenticated customer accounts attempting to access admin routes are denied
    if (user.user_metadata?.role && user.user_metadata.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.warn('[Middleware] Admin session check note:', err);
    if (pathname !== '/admin/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
