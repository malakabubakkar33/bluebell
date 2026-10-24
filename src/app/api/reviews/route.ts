import { NextRequest, NextResponse } from 'next/server';
import { SupabaseDbService } from '@/lib/supabase/service';

export async function GET() {
  try {
    const reviews = await SupabaseDbService.getReviews();
    return NextResponse.json({ success: true, count: reviews.length, data: reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.comment || !body.customer_name) {
      return NextResponse.json({ success: false, error: 'Customer name and comment are required' }, { status: 400 });
    }
    const review = await SupabaseDbService.createReview(body);
    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}
