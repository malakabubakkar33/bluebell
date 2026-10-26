import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;
    const query = searchParams.get('q') || undefined;
    const isBestSeller = searchParams.get('bestSeller') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const statusParam = searchParams.get('status') as 'all' | 'published' | 'unpublished' | null;

    const products = await SupabaseDbService.getProducts({
      categorySlug: category,
      brand,
      query,
      isBestSeller,
      isFeatured,
      status: statusParam || undefined,
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
    // 1. Authorize: Enforce administrator permission on server
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const body = await req.json();

    // 2. Validate Required Fields
    const name = body.name?.trim();
    const brand = body.brand?.trim();
    const categorySlug = (body.categorySlug || body.category)?.trim();
    const price = Number(body.price);

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Product name is required (minimum 2 characters).' },
        { status: 400 }
      );
    }

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Brand is required.' },
        { status: 400 }
      );
    }

    if (!categorySlug) {
      return NextResponse.json(
        { success: false, error: 'Category is required.' },
        { status: 400 }
      );
    }

    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid selling price (greater than 0 PKR) is required.' },
        { status: 400 }
      );
    }

    // 3. Check for Duplicate SKU if SKU is provided
    const sku = body.sku?.trim();
    if (sku) {
      const adminClient = getSupabaseAdminClient();
      if (adminClient) {
        const { data: existingSku } = await (adminClient as any)
          .from('products')
          .select('id, name, sku')
          .ilike('sku', sku)
          .limit(1);

        if (existingSku && existingSku.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `A product with SKU "${sku}" already exists (${existingSku[0].name}).`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 4. Create authoritative product in PostgreSQL database
    const created = await SupabaseDbService.createProduct({
      ...body,
      name,
      brand,
      categorySlug,
      price,
      sku: sku || undefined,
      stock: body.stock !== undefined ? Math.max(0, parseInt(body.stock, 10)) : 10,
      inStock: body.inStock !== undefined ? Boolean(body.inStock) : true,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/products] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product in database.' },
      { status: 500 }
    );
  }
}
