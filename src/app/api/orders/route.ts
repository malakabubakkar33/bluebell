import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';
import { requireAdminApi } from '@/lib/auth/adminGuard';
import { serverCache } from '@/lib/cache';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;

    // If requesting all orders without customer email filter, enforce administrator authorization
    if (!email) {
      const auth = await requireAdminApi(req);
      if ('response' in auth) {
        return auth.response;
      }
    }

    const cacheKey = `orders:${email || 'all'}`;
    const orders = await serverCache.getOrSet(
      cacheKey,
      15, // 15s fresh TTL
      async () => {
        return await SupabaseDbService.getOrders(email);
      },
      60 // 60s stale SWR
    );

    return NextResponse.json({ success: true, count: orders.length, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.customer_name || !body.customer_phone || !body.shipping_address || !body.items || !body.total) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, address, and items are required' },
        { status: 400 }
      );
    }

    const order = await SupabaseDbService.createOrder({
      customer_name: body.customer_name,
      customer_email: body.customer_email || 'guest@bluebell.pk',
      customer_phone: body.customer_phone,
      customer_whatsapp: body.customer_whatsapp || body.customer_phone,
      shipping_address: body.shipping_address,
      city: body.city || 'Islamabad',
      province: body.province || 'Punjab',
      postal_code: body.postal_code,
      payment_method: body.payment_method || 'cod',
      items: body.items,
      subtotal: body.subtotal || body.total,
      shipping_fee: body.shipping_fee || 0,
      total: body.total,
      notes: body.notes,
    });

    // Invalidate caches so admin dashboard, orders, and stats are refreshed
    serverCache.invalidatePrefix('orders');
    serverCache.invalidatePrefix('admin:dashboard');
    serverCache.invalidatePrefix('bootstrap');

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
