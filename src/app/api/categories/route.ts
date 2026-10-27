import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SupabaseDbService } from '@/lib/supabase/service';
import { serverCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('all') === 'true';
    const categories = await serverCache.getOrSet(
      `categories:${includeInactive}`,
      60,
      () => SupabaseDbService.getCategories(includeInactive),
      300
    );

    return new NextResponse(
      JSON.stringify({
        success: true,
        count: categories.length,
        data: categories,
      }),
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
      { success: false, error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const created = await SupabaseDbService.createCategory(body);

    // Invalidate caches
    serverCache.invalidatePrefix('categories');
    serverCache.invalidatePrefix('bootstrap');
    serverCache.invalidatePrefix('admin:dashboard');

    // Revalidate affected storefront pages and cache
    try {
      revalidatePath('/', 'page');
      revalidatePath('/categories', 'page');
      revalidatePath('/products', 'page');
      revalidatePath('/api/categories');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
