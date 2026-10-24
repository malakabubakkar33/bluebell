import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ success: true, users: [] });
    }

    const { data: users, error } = await (adminClient as any)
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching app_users:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: users || [],
    });
  } catch (error: any) {
    console.error('GET /api/auth/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
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
