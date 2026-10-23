import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET() {
  try {
    const orders = await SupabaseDbService.getOrders();
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

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
