import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { SupabaseDbService } from '@/lib/supabase/service';
import { serverCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const updated = await SupabaseDbService.updateBanner(id, updates);

    serverCache.clear();

    try {
      revalidatePath('/', 'page');
      revalidatePath('/api/banners');
      revalidatePath('/api/bootstrap');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await SupabaseDbService.deleteBanner(id);

    serverCache.clear();

    try {
      revalidatePath('/', 'page');
      revalidatePath('/api/banners');
      revalidatePath('/api/bootstrap');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }
    return NextResponse.json({ success: true, message: `Banner ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete banner' },
      { status: 500 }
    );
  }
}
