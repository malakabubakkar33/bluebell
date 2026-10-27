import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await SupabaseDbService.getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

import { requireAdminApi } from '@/lib/auth/adminGuard';
import { serverCache } from '@/lib/cache';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json({ success: false, error: 'Status is required' }, { status: 400 });
    }

    const updated = await SupabaseDbService.updateOrderStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    serverCache.invalidatePrefix('orders');
    serverCache.invalidatePrefix('admin:dashboard');

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update order status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const { id } = await params;
    await SupabaseDbService.deleteOrder(id);

    serverCache.invalidatePrefix('orders');
    serverCache.invalidatePrefix('admin:dashboard');

    return NextResponse.json({ success: true, message: `Order ${id} removed` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
