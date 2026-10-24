import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { INITIAL_BANNERS } from '@/context/ProductsContext';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, count: data.length, data });
      }
    }
    return NextResponse.json({ success: true, count: INITIAL_BANNERS.length, data: INITIAL_BANNERS });
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
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase.from('banners').upsert(banner).select().single();
      if (!error && data) {
        return NextResponse.json({ success: true, data }, { status: 201 });
      }
    }
    return NextResponse.json({ success: true, data: banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save banner' },
      { status: 500 }
    );
  }
}
