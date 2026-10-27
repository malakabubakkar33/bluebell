import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAdminApi } from '@/lib/auth/adminGuard';
import { serverCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export interface ProductProfitStats {
  id: string;
  name: string;
  brand: string;
  categorySlug?: string;
  image?: string;
  sellingPrice: number;
  costPrice: number;
  unitProfit: number;
  unitsSold: number;
  totalRevenue: number;
  totalProfit: number;
  marginPercent: number;
}

export async function GET(req: NextRequest) {
  try {
    // 1. Authorize: Enforce administrator permission on server
    const auth = await requireAdminApi(req);
    if ('response' in auth) {
      return auth.response;
    }

    const isRefresh = req.nextUrl.searchParams.get('refresh') === 'true';
    const cacheKey = 'admin:dashboard:stats';

    if (isRefresh) {
      serverCache.delete(cacheKey);
    }

    const payload = await serverCache.getOrSet(
      cacheKey,
      30, // 30s fresh TTL
      async () => {
        // 2. Obtain database client with resilient fallback
        let dbClient = getSupabaseAdminClient();
        if (!dbClient) {
          dbClient = (await createSupabaseServerClient()) as any;
        }

        if (!dbClient) {
          throw new Error('Unable to connect to database. Please check Supabase configuration.');
        }

        const LOW_STOCK_THRESHOLD = 15;

    // 3. Fetch authoritative database counts and records concurrently
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
      allOrdersRes,
      recentOrdersRes,
      allProductsRes,
    ] = await Promise.all([
      // A. Total Products
      (dbClient as any).from('products').select('*', { count: 'exact', head: true }),
      // B. Published / In Stock Products
      (dbClient as any).from('products').select('*', { count: 'exact', head: true }).eq('in_stock', true),
      // C. Low Stock Products Count
      (dbClient as any).from('products').select('*', { count: 'exact', head: true }).lte('stock_count', LOW_STOCK_THRESHOLD),
      // D. Low Stock Items List
      (dbClient as any)
        .from('products')
        .select('id, name, brand, category_slug, price, stock_count, in_stock, image')
        .lte('stock_count', LOW_STOCK_THRESHOLD)
        .order('stock_count', { ascending: true })
        .limit(6),
      // E. Total Active Categories
      (dbClient as any).from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
      // F. Registered Customers
      (dbClient as any).from('app_users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      // G. Total Orders
      (dbClient as any).from('orders').select('*', { count: 'exact', head: true }),
      // H. Pending Orders
      (dbClient as any).from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      // I. Completed / Delivered Orders
      (dbClient as any).from('orders').select('*', { count: 'exact', head: true }).in('status', ['delivered', 'confirmed']),
      // J. Cancelled Orders
      (dbClient as any).from('orders').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
      // K. All orders for revenue & profit analytics (excluding cancelled)
      (dbClient as any)
        .from('orders')
        .select('id, total, status, items, created_at')
        .neq('status', 'cancelled'),
      // L. Recent Orders List
      (dbClient as any)
        .from('orders')
        .select('id, customer_name, customer_email, payment_method, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(8),
      // M. Products map for accurate cost & profit calculation
      (dbClient as any)
        .from('products')
        .select('id, name, brand, category_slug, price, original_price, specs, image, stock_count'),
    ]);

    const allProducts = Array.isArray(allProductsRes.data) ? allProductsRes.data : [];
    const productMap = new Map<string, any>();
    allProducts.forEach((p: any) => {
      productMap.set(p.id, p);
      if (p.sku) productMap.set(p.sku, p);
    });

    // Helper: calculate cost price (purchase price) for a product
    const getProductCostPrice = (prod: any, sellingPrice: number): number => {
      if (prod?.specs?.costPrice && Number(prod.specs.costPrice) > 0) {
        return Number(prod.specs.costPrice);
      }
      if (prod?.specs?.purchasePrice && Number(prod.specs.purchasePrice) > 0) {
        return Number(prod.specs.purchasePrice);
      }
      // If original_price is lower than price, it represents wholesale cost
      if (prod?.original_price && Number(prod.original_price) > 0 && Number(prod.original_price) < sellingPrice) {
        return Number(prod.original_price);
      }
      // Standard electronics wholesale margin benchmark in Pakistan: ~88% cost, 12% profit
      return Math.round(sellingPrice * 0.88);
    };

    // 4. Calculate authoritative Revenue, Cost, and Profit (Munafa)
    const validOrders = Array.isArray(allOrdersRes.data) ? allOrdersRes.data : [];
    let totalRevenue = 0;
    let totalCost = 0;

    // Track per-product sales and profit
    const productSalesMap = new Map<
      string,
      {
        id: string;
        name: string;
        brand: string;
        categorySlug?: string;
        image?: string;
        sellingPrice: number;
        costPrice: number;
        unitsSold: number;
        totalRevenue: number;
        totalProfit: number;
      }
    >();

    validOrders.forEach((o: any) => {
      totalRevenue += Number(o.total) || 0;
      const items = Array.isArray(o.items) ? o.items : [];

      items.forEach((it: any) => {
        const pId = it.productId || it.id;
        const qty = Math.max(1, Number(it.quantity) || 1);
        const itemPrice = Number(it.price) || 0;
        const dbProd = productMap.get(pId);

        const costPrice = getProductCostPrice(dbProd, itemPrice);
        const lineRevenue = itemPrice * qty;
        const lineCost = costPrice * qty;
        const lineProfit = lineRevenue - lineCost;

        totalCost += lineCost;

        const existing = productSalesMap.get(pId);
        if (existing) {
          existing.unitsSold += qty;
          existing.totalRevenue += lineRevenue;
          existing.totalProfit += lineProfit;
        } else {
          productSalesMap.set(pId, {
            id: pId,
            name: dbProd?.name || it.name || 'Mobile Device',
            brand: dbProd?.brand || 'Apple',
            categorySlug: dbProd?.category_slug || 'smartphones',
            image: dbProd?.image || it.image || '/categories/iphone.svg',
            sellingPrice: itemPrice,
            costPrice,
            unitsSold: qty,
            totalRevenue: lineRevenue,
            totalProfit: lineProfit,
          });
        }
      });
    });

    // Also populate remaining products so admin sees profit margin for all inventory items
    allProducts.forEach((p: any) => {
      if (!productSalesMap.has(p.id)) {
        const unitSelling = Number(p.price) || 0;
        const unitCost = getProductCostPrice(p, unitSelling);
        const unitProfit = unitSelling - unitCost;
        productSalesMap.set(p.id, {
          id: p.id,
          name: p.name,
          brand: p.brand || 'Apple',
          categorySlug: p.category_slug,
          image: p.image || '/categories/iphone.svg',
          sellingPrice: unitSelling,
          costPrice: unitCost,
          unitsSold: 0,
          totalRevenue: 0,
          totalProfit: unitProfit, // potential unit profit
        });
      }
    });

    const totalProfit = Math.max(0, totalRevenue - totalCost);
    const profitMarginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 12;

    // Sort products by highest profit generated, then by units sold
    const productProfitList: ProductProfitStats[] = Array.from(productSalesMap.values())
      .map((p) => ({
        ...p,
        unitProfit: p.sellingPrice - p.costPrice,
        marginPercent: p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100) : 0,
      }))
      .sort((a, b) => b.totalProfit - a.totalProfit);

    // Generate sales & profit chart data for past 7 days
    const daysMap = new Map<string, { date: string; revenue: number; profit: number; orders: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      daysMap.set(dateKey, { date: displayLabel, revenue: 0, profit: 0, orders: 0 });
    }

    validOrders.forEach((o: any) => {
      if (o.created_at) {
        const orderDate = new Date(o.created_at).toISOString().split('T')[0];
        if (daysMap.has(orderDate)) {
          const entry = daysMap.get(orderDate)!;
          const orderTotal = Number(o.total) || 0;
          entry.revenue += orderTotal;
          entry.profit += Math.round(orderTotal * 0.12); // ~12% net profit margin
          entry.orders += 1;
        }
      }
    });

    const salesChartData = Array.from(daysMap.values());

        return {
          success: true,
          timestamp: new Date().toISOString(),
          metrics: {
            totalProducts: totalProductsRes.count ?? allProducts.length,
            publishedProducts: publishedProductsRes.count ?? allProducts.filter((p: any) => p.in_stock).length,
            totalCategories: categoriesCountRes.count ?? 0,
            registeredCustomers: customersCountRes.count ?? 0,
            totalOrders: totalOrdersCountRes.count ?? validOrders.length,
            pendingOrders: pendingOrdersCountRes.count ?? 0,
            completedOrders: completedOrdersCountRes.count ?? 0,
            cancelledOrders: cancelledOrdersCountRes.count ?? 0,
            lowStockProductsCount: lowStockCountRes.count ?? 0,
            lowStockThreshold: LOW_STOCK_THRESHOLD,
            totalRevenue,
            totalCost,
            totalProfit, // Net Profit (Munafa)
            profitMarginPercent,
          },
          productProfitList, // Individual product profit & margin breakdown
          lowStockItems: Array.isArray(lowStockItemsRes.data) ? lowStockItemsRes.data : [],
          recentOrders: Array.isArray(recentOrdersRes.data) ? recentOrdersRes.data : [],
          salesChartData,
        };
      },
      180 // 3 min stale TTL (SWR)
    );

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('[GET /api/admin/dashboard/stats] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
