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

    if (!body.customer_name || !body.customer_phone || !body.shipping_address || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer name, phone, delivery address, and at least one item are required.' },
        { status: 400 }
      );
    }

    // Sanitize phone and create clean fallback email
    const cleanPhone = String(body.customer_phone).trim().replace(/[^0-9+]/g, '');
    const cleanEmail = (body.customer_email && body.customer_email.includes('@'))
      ? body.customer_email.trim().toLowerCase()
      : `${cleanPhone.replace(/[^0-9]/g, '') || 'guest'}@bluebell.pk`;

    // Map payment method strictly to PostgreSQL check constraint
    let method = String(body.payment_method || 'cod').toLowerCase().trim();
    if (method.includes('cod') || method.includes('cash')) method = 'cod';
    else if (method.includes('bank') || method.includes('card')) method = 'bank_transfer';
    else if (method.includes('easy')) method = 'easypaisa';
    else if (method.includes('jazz')) method = 'jazzcash';
    else method = 'cod';

    const order = await SupabaseDbService.createOrder({
      customer_name: String(body.customer_name).trim(),
      customer_email: cleanEmail,
      customer_phone: cleanPhone || String(body.customer_phone).trim(),
      customer_whatsapp: body.customer_whatsapp ? String(body.customer_whatsapp).trim() : cleanPhone,
      shipping_address: String(body.shipping_address).trim(),
      city: body.city?.trim() || 'Peshawar',
      province: body.province?.trim() || 'Khyber Pakhtunkhwa',
      postal_code: body.postal_code || undefined,
      payment_method: method,
      items: body.items,
      subtotal: Number(body.subtotal) || undefined,
      shipping_fee: Number(body.shipping_fee) || 0,
      total: Number(body.total) || undefined,
      notes: body.notes?.trim() || '',
    });

    // Invalidate caches so admin dashboard, orders, and stats are refreshed
    serverCache.invalidatePrefix('orders');
    serverCache.invalidatePrefix('admin:dashboard');
    serverCache.invalidatePrefix('bootstrap');

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/orders POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
