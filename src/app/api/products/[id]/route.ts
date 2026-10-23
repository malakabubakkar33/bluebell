import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await SupabaseDbService.getProductBySlugOrId(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
