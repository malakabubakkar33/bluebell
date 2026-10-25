import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await getAdminSession();

  if (!result.authenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthenticated', code: 'UNAUTHENTICATED' },
      { status: 401 }
    );
  }

  if (!result.isAdmin || !result.user) {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Administrator privileges required', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    user: result.user,
  });
}
