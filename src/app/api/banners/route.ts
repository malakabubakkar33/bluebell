import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SupabaseDbService } from '@/lib/supabase/service';
import { serverCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch directly from database for 100% fresh live banners
    const banners = await SupabaseDbService.getBanners();

    return NextResponse.json(
      { success: true, count: banners.length, data: banners },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const banner = await req.json();
    const data = await SupabaseDbService.createBanner(banner);

    // Invalidate all server caches completely
    serverCache.clear();

    try {
      revalidatePath('/', 'page');
      revalidatePath('/api/banners');
      revalidatePath('/api/bootstrap');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save banner' },
      { status: 500 }
    );
  }
}
