import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SupabaseDbService } from '@/lib/supabase/service';
import { serverCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await serverCache.getOrSet(
      'deals:list',
      120, // 2 minutes fresh
      () => SupabaseDbService.getDeals(),
      300 // 5 minutes stale grace
    );

    return new NextResponse(
      JSON.stringify({ success: true, count: deals.length, data: deals }),
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
      { success: false, error: error.message || 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const deal = await req.json();
    const data = await SupabaseDbService.createDeal(deal);

    // Invalidate caches
    serverCache.invalidatePrefix('deals');
    serverCache.invalidatePrefix('bootstrap');

    try {
      revalidatePath('/', 'page');
      revalidatePath('/api/deals');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save deal' },
      { status: 500 }
    );
  }
}
