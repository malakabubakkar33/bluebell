import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SupabaseDbService } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const banners = await SupabaseDbService.getBanners();
    return NextResponse.json(
      { success: true, count: banners.length, data: banners },
      { headers: { 'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate' } }
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
