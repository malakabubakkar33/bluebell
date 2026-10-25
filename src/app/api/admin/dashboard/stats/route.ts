import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { requireAdminApi } from '@/lib/auth/adminGuard';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Authorize: Enforce administrator permission on server
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const adminClient = getSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        { success: false, error: 'Database admin client not configured' },
        { status: 500 }
      );
    }

    const LOW_STOCK_THRESHOLD = 15;

    // 2. Fetch authoritative database counts and records concurrently
    const [
      totalProductsRes,
      publishedProductsRes,
      lowStockCountRes,
      lowStockItemsRes,
      categoriesCountRes,
      customersCountRes,
      totalOrdersCountRes,
      pendingOrdersCountRes,
      completedOrdersCountRes,
      cancelledOrdersCountRes,
      revenueOrdersRes,
      recentOrdersRes,
    ] = await Promise.all([
      // A. Total Products
      (adminClient as any).from('products').select('*', { count: 'exact', head: true }),
      // B. Published / In Stock Products
      (adminClient as any).from('products').select('*', { count: 'exact', head: true }).eq('in_stock', true),
      // C. Low Stock Products Count
      (adminClient as any).from('products').select('*', { count: 'exact', head: true }).lte('stock_count', LOW_STOCK_THRESHOLD),
      // D. Low Stock Items List
      (adminClient as any)
        .from('products')
        .select('id, name, brand, category_slug, price, stock_count, in_stock, image')
        .lte('stock_count', LOW_STOCK_THRESHOLD)
        .order('stock_count', { ascending: true })
        .limit(6),
      // E. Total Active Categories
      (adminClient as any).from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
      // F. Registered Customers
      (adminClient as any).from('app_users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      // G. Total Orders
      (adminClient as any).from('orders').select('*', { count: 'exact', head: true }),
      // H. Pending Orders
      (adminClient as any).from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      // I. Completed / Delivered Orders
      (adminClient as any).from('orders').select('*', { count: 'exact', head: true }).in('status', ['delivered', 'confirmed']),
      // J. Cancelled Orders
      (adminClient as any).from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      // K. Revenue eligible orders (strictly excludes cancelled orders)
      (adminClient as any)
        .from('orders')
        .select('id, total, status, created_at')
        .neq('status', 'cancelled'),
      // L. Recent Orders List
      (adminClient as any)
        .from('orders')
        .select('id, customer_name, customer_email, payment_method, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    // Calculate authoritative revenue (in PKR)
    const revenueOrders = Array.isArray(revenueOrdersRes.data) ? revenueOrdersRes.data : [];
    const totalRevenue = revenueOrders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);

    // Generate sales chart data for past 7 days from real order timestamps
    const daysMap = new Map<string, { date: string; revenue: number; orders: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      daysMap.set(dateKey, { date: displayLabel, revenue: 0, orders: 0 });
    }

    revenueOrders.forEach((o: any) => {
      if (o.created_at) {
        const orderDate = new Date(o.created_at).toISOString().split('T')[0];
        if (daysMap.has(orderDate)) {
          const entry = daysMap.get(orderDate)!;
          entry.revenue += Number(o.total) || 0;
          entry.orders += 1;
        }
      }
    });

    const salesChartData = Array.from(daysMap.values());

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalProducts: totalProductsRes.count ?? 0,
        publishedProducts: publishedProductsRes.count ?? 0,
        totalCategories: categoriesCountRes.count ?? 0,
        registeredCustomers: customersCountRes.count ?? 0,
        totalOrders: totalOrdersCountRes.count ?? 0,
        pendingOrders: pendingOrdersCountRes.count ?? 0,
        completedOrders: completedOrdersCountRes.count ?? 0,
        cancelledOrders: cancelledOrdersCountRes.count ?? 0,
        lowStockProductsCount: lowStockCountRes.count ?? 0,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        totalRevenue,
      },
      lowStockItems: Array.isArray(lowStockItemsRes.data) ? lowStockItemsRes.data : [],
      recentOrders: Array.isArray(recentOrdersRes.data) ? recentOrdersRes.data : [],
      salesChartData,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/dashboard/stats] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
