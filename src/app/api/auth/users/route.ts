import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/adminGuard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ success: true, users: [] });
    }

    // 1. Fetch from public.app_users
    const { data: dbUsers, error } = await (adminClient as any)
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching app_users:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 2. Fetch from Supabase Auth admin to ensure all registered accounts appear
    let authUsersList: any[] = [];
    try {
      const { data: authData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 100 });
      if (authData && Array.isArray(authData.users)) {
        authUsersList = authData.users;
      }
    } catch (authErr) {
      console.warn('Auth admin.listUsers note:', authErr);
    }

    // 3. Fetch distinct customer accounts from orders table to ensure all ordering shoppers appear
    let orderShoppers: any[] = [];
    try {
      const { data: ordersData } = await (adminClient as any)
        .from('orders')
        .select('customer_name, customer_email, customer_phone, customer_whatsapp, city, shipping_address, total, created_at');
      if (ordersData && Array.isArray(ordersData)) {
        orderShoppers = ordersData;
      }
    } catch (orderErr) {
      console.warn('Orders query note in users endpoint:', orderErr);
    }

    const existingEmails = new Set((dbUsers || []).map((u: any) => u.email?.toLowerCase()));
    const missingUsers: any[] = [];

    // Reconcile from Auth users
    for (const au of authUsersList) {
      const email = au.email?.toLowerCase();
      if (email && !existingEmails.has(email)) {
        existingEmails.add(email);
        const meta = au.user_metadata || {};
        const newUserRow = {
          id: au.id,
          email: email,
          name: meta.name || email.split('@')[0],
          phone: meta.phone || au.phone || '',
          whatsapp: meta.whatsapp || meta.phone || au.phone || '',
          city: meta.city || 'Peshawar',
          address: meta.address || '',
          role: meta.role || 'customer',
          status: meta.status || 'active',
          orders_count: 0,
          total_spent: 0,
          created_at: au.created_at || new Date().toISOString(),
          updated_at: au.updated_at || new Date().toISOString(),
        };
        missingUsers.push(newUserRow);
        try {
          await (adminClient as any).from('app_users').upsert(newUserRow, { onConflict: 'email' });
        } catch (insertErr) {
          console.warn('Failed to upsert missing auth user to app_users:', insertErr);
        }
      }
    }

    // Reconcile from Orders customers
    for (const ord of orderShoppers) {
      const email = ord.customer_email?.toLowerCase();
      if (email && email.includes('@') && !existingEmails.has(email)) {
        existingEmails.add(email);
        const shopperRow = {
          id: `cust-ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          email: email,
          name: ord.customer_name || email.split('@')[0],
          phone: ord.customer_phone || '',
          whatsapp: ord.customer_whatsapp || ord.customer_phone || '',
          city: ord.city || 'Peshawar',
          address: ord.shipping_address || '',
          role: 'customer',
          status: 'active',
          orders_count: 1,
          total_spent: Number(ord.total) || 0,
          created_at: ord.created_at || new Date().toISOString(),
          updated_at: ord.created_at || new Date().toISOString(),
        };
        missingUsers.push(shopperRow);
        try {
          await (adminClient as any).from('app_users').upsert(shopperRow, { onConflict: 'email' });
        } catch (upsertErr) {
          console.warn('Failed to upsert order shopper into app_users:', upsertErr);
        }
      }
    }

    const combined = [...(dbUsers || []), ...missingUsers];

    return new NextResponse(
      JSON.stringify({
        success: true,
        users: combined,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('GET /api/auth/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const body = await req.json();
    const { id, email, status, role, name, phone, whatsapp, city, address } = body;

    if (!id && !email) {
      return NextResponse.json({ success: false, error: 'User ID or Email is required' }, { status: 400 });
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'Supabase admin client not available' }, { status: 500 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (role !== undefined) updates.role = role;
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (whatsapp !== undefined) updates.whatsapp = whatsapp;
    if (city !== undefined) updates.city = city;
    if (address !== undefined) updates.address = address;

    let query = (adminClient as any).from('app_users').update(updates);
    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    const { data, error } = await query.select().single();

    if (error) {
      console.error('Error updating app_user in DB:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Also update Supabase Auth metadata if applicable
    if (id && !id.startsWith('usr-') && !id.startsWith('user-')) {
      try {
        await adminClient.auth.admin.updateUserById(id, {
          user_metadata: {
            ...(status ? { status } : {}),
            ...(role ? { role } : {}),
            ...(name ? { name } : {}),
            ...(phone ? { phone } : {}),
          },
        });
      } catch (authErr: any) {
        console.warn('Auth user_metadata update note:', authErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error: any) {
    console.error('PATCH /api/auth/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ success: false, error: 'User ID or Email is required' }, { status: 400 });
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'Supabase admin client not available' }, { status: 500 });
    }

    // 1. Delete from app_users table
    let query = (adminClient as any).from('app_users').delete();
    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    const { error: dbError } = await query;
    if (dbError) {
      console.error('Error deleting from app_users:', dbError);
    }

    // 2. Delete from Supabase Auth if UUID
    if (id && !id.startsWith('usr-') && !id.startsWith('user-')) {
      try {
        await adminClient.auth.admin.deleteUser(id);
      } catch (authErr: any) {
        console.warn('Auth deleteUser note:', authErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User removed from Supabase successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/auth/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
