import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/adminGuard';

import { serverCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await serverCache.getOrSet(
      `product:${id}`,
      60,
      async () => {
        return await SupabaseDbService.getProductBySlugOrId(id);
      },
      300
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found in catalog.' },
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ success: true, data: product }),
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
      { success: false, error: error.message || 'Failed to fetch product.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authorize: Enforce administrator permission on server
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    const updates = await req.json();

    // 2. Validate Price & Stock if provided
    if (updates.price !== undefined) {
      const price = Number(updates.price);
      if (isNaN(price) || price <= 0) {
        return NextResponse.json(
          { success: false, error: 'Price must be a valid positive number.' },
          { status: 400 }
        );
      }
      updates.price = price;
    }

    if (updates.stock !== undefined) {
      const stock = parseInt(updates.stock, 10);
      if (isNaN(stock) || stock < 0) {
        return NextResponse.json(
          { success: false, error: 'Stock must be a non-negative integer.' },
          { status: 400 }
        );
      }
      updates.stock = stock;
    }

    // 3. Validate SKU uniqueness if SKU is being updated
    if (updates.sku?.trim()) {
      const sku = updates.sku.trim();
      const adminClient = getSupabaseAdminClient();
      if (adminClient) {
        const { data: existingSku } = await (adminClient as any)
          .from('products')
          .select('id, name, sku')
          .ilike('sku', sku)
          .neq('id', id)
          .limit(1);

        if (existingSku && existingSku.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Another product already uses SKU "${sku}" (${existingSku[0].name}).`,
            },
            { status: 400 }
          );
        }
      }
      updates.sku = sku;
    }

    const updated = await SupabaseDbService.updateProduct(id, updates);

    // Invalidate product & bootstrap caches so changes are immediately live
    serverCache.invalidatePrefix('products');
    serverCache.invalidatePrefix('bootstrap');

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(`[PATCH /api/products/[id]] error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authorize: Enforce administrator permission on server
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    const result = await SupabaseDbService.deleteProduct(id);

    // Invalidate product & bootstrap caches so removal is immediately live
    serverCache.invalidatePrefix('products');
    serverCache.invalidatePrefix('bootstrap');

    return NextResponse.json({
      success: true,
      archived: result.archived,
      message: result.message,
    });
  } catch (error: any) {
    console.error(`[DELETE /api/products/[id]] error:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product.' },
      { status: 500 }
    );
  }
}
