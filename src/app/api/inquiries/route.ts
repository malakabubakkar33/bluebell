import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET() {
  try {
    const inquiries = await SupabaseDbService.getInquiries();
    return NextResponse.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const inquiry = await SupabaseDbService.createInquiry({
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject || 'Website General Inquiry',
      message: body.message,
    });

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
