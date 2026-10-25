import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SupabaseDbService } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await SupabaseDbService.getDeals();
    return NextResponse.json(
      { success: true, count: deals.length, data: deals },
      { headers: { 'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate' } }
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
