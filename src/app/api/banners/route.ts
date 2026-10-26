import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SupabaseDbService } from '@/lib/supabase/service';
import { serverCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await serverCache.getOrSet(
      'banners:list',
      120, // 2 minutes fresh
      () => SupabaseDbService.getBanners(),
      300 // 5 minutes stale grace
    );

    return new NextResponse(
      JSON.stringify({ success: true, count: banners.length, data: banners }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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

    // Invalidate caches
    serverCache.invalidatePrefix('banners');
    serverCache.invalidatePrefix('bootstrap');

    try {
      revalidatePath('/', 'page');
      revalidatePath('/api/banners');
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
