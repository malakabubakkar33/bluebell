import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const query = searchParams.get('q') || undefined;
    const isBestSeller = searchParams.get('bestSeller') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';

    const products = await SupabaseDbService.getProducts({
      categorySlug: category,
      brand,
      query,
      isBestSeller,
      isFeatured,
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_PRODUCTS_FAILED',
          message: error.message || 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.price || !body.brand) {
      return NextResponse.json(
        { success: false, error: 'Product name, brand, and price are required' },
        { status: 400 }
      );
    }

    const created = await SupabaseDbService.createProduct(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
