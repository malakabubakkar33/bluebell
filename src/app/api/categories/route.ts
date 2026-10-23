import { NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET() {
  try {
    const categories = await SupabaseDbService.getCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
