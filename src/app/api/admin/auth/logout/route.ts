import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const serverClient = await createSupabaseServerClient();
    if (serverClient) {
      await serverClient.auth.signOut();
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    console.error('Admin logout API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Logout error' },
      { status: 500 }
    );
  }
}
