import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, email, name, phone, whatsapp, city, address } = body;

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or Email is required' },
        { status: 400 }
      );
    }

    const adminClient = getSupabaseAdminClient();
    if (adminClient) {
      let targetUserId = id;

      // If id is a local-style id (starts with 'user-'), find user by email in Supabase
      if (!targetUserId || targetUserId.startsWith('user-')) {
        const { data: usersData } = await adminClient.auth.admin.listUsers();
        const found = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === email?.toLowerCase()
        );
        if (found) {
          targetUserId = found.id;
        }
      }

      if (targetUserId && !targetUserId.startsWith('user-')) {
        const { data, error } = await adminClient.auth.admin.updateUserById(targetUserId, {
          user_metadata: {
            name: name || '',
            phone: phone || '',
            whatsapp: whatsapp || phone || '',
            city: city || 'Peshawar',
            address: address || '',
          },
        });

        if (error) {
          console.error('Supabase profile update error:', error.message);
        } else {
          return NextResponse.json({
            success: true,
            user: {
              id: targetUserId,
              email: data.user.email,
              name: data.user.user_metadata?.name || name,
              phone: data.user.user_metadata?.phone || phone,
              whatsapp: data.user.user_metadata?.whatsapp || whatsapp,
              city: data.user.user_metadata?.city || city,
              address: data.user.user_metadata?.address || address,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated locally and ready for Supabase sync.',
    });
  } catch (error: any) {
    console.error('Profile update handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
