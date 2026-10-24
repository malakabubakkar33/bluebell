import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { INITIAL_DEALS } from '@/context/ProductsContext';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('deals').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, count: data.length, data });
      }
    }
    return NextResponse.json({ success: true, count: INITIAL_DEALS.length, data: INITIAL_DEALS });
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
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('deals').upsert(deal).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ success: true, data: deal }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save deal' },
      { status: 500 }
    );
  }
}
