import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET() {
  try {
    const deals = await SupabaseDbService.getDeals();
    return NextResponse.json({ success: true, count: deals.length, data: deals });
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
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save deal' },
      { status: 500 }
    );
  }
}
