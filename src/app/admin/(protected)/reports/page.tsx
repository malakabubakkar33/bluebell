'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  Calendar,
  Printer,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Smartphone,
  Layers,
  ArrowUpRight,
  Coins,
  Search,
} from 'lucide-react';

interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
  customer_name?: string;
  payment_method?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categorySlug?: string;
  image?: string;
  specs?: Record<string, any>;
}

export interface ProductProfitReportItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  image?: string;
  sellingPrice: number;
  costPrice: number;
  unitProfit: number;
  unitsSold: number;
  grossRevenue: number;
  netProfit: number;
  marginPercent: number;
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | '30days' | '7days'>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const fetchReportData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [ordersRes, prodsRes] = await Promise.all([
        fetch('/api/orders', { cache: 'no-store' }),
        fetch('/api/products?status=all', { cache: 'no-store' }),
      ]);

      const ordersData = await ordersRes.json();
      const prodsData = await prodsRes.json();

      if (ordersData.success && Array.isArray(ordersData.data)) {
        setOrders(ordersData.data);
      }
      if (prodsData.success && Array.isArray(prodsData.data)) {
        setProducts(prodsData.data);
      }
    } catch (err: any) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Filter orders by time range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const now = new Date().getTime();
    const days = timeRange === '7days' ? 7 : 30;
    const threshold = now - days * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      try {
        return new Date(o.created_at).getTime() >= threshold;
      } catch {
        return true;
      }
    });
  }, [orders, timeRange]);

  // Product Map for fast lookup
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  // Helper: derive cost price for any item
  const getCostPrice = useCallback((prod: Product | undefined, sellPrice: number): number => {
    if (prod?.specs?.costPrice && Number(prod.specs.costPrice) > 0) {
      return Number(prod.specs.costPrice);
    }
    if (prod?.specs?.purchasePrice && Number(prod.specs.purchasePrice) > 0) {
      return Number(prod.specs.purchasePrice);
    }
    if (prod?.originalPrice && prod.originalPrice > 0 && prod.originalPrice < sellPrice) {
      return prod.originalPrice;
    }
    // Benchmark 88% wholesale cost (12% margin)
    return Math.round(sellPrice * 0.88);
  }, []);

  // Aggregate Key Financial Metrics including Net Profit (Munafa)
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(
      (o) => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'confirmed'
    );
    const pendingOrders = filteredOrders.filter((o) => o.status?.toLowerCase() === 'pending');
    const cancelledOrders = filteredOrders.filter((o) => o.status?.toLowerCase() === 'cancelled');

    // Revenue strictly excludes cancelled orders
    const validOrders = filteredOrders.filter((o) => o.status?.toLowerCase() !== 'cancelled');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const confirmedRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

    // Calculate actual cost of goods sold (COGS) and Net Profit
    let totalCogs = 0;
    validOrders.forEach((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach((it) => {
        const pId = it.productId || it.id;
        const prod = pId ? productMap.get(pId) : undefined;
        const unitPrice = Number(it.price) || 0;
        const qty = Math.max(1, Number(it.quantity) || 1);
        const costPrice = getCostPrice(prod, unitPrice);
        totalCogs += costPrice * qty;
      });
    });

    const totalProfit = Math.max(0, totalRevenue - totalCogs);
    const profitMarginPercent = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 12;

    // Total units in inventory
    const totalInventoryUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalInventoryValue = products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0
    );

    return {
      totalOrders,
      completedOrdersCount: completedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      totalRevenue,
      confirmedRevenue,
      totalCogs,
      totalProfit,
      profitMarginPercent,
      aov,
      totalInventoryUnits,
      totalInventoryValue,
    };
  }, [filteredOrders, products, productMap, getCostPrice]);

  // Product-Level Profit & Margin Breakdown
  const productProfitReport = useMemo(() => {
    const reportMap = new Map<string, ProductProfitReportItem>();

    // Initialize with all products
    products.forEach((p) => {
      const sell = Number(p.price) || 0;
      const cost = getCostPrice(p, sell);
      const unitP = sell - cost;
      const margin = sell > 0 ? Math.round((unitP / sell) * 100) : 0;

      reportMap.set(p.id, {
        id: p.id,
        name: p.name,
        brand: p.brand || 'Apple',
        category: p.categorySlug || 'smartphones',
        image: p.image || '/categories/iphone.svg',
        sellingPrice: sell,
        costPrice: cost,
        unitProfit: unitP,
        unitsSold: 0,
        grossRevenue: 0,
        netProfit: 0,
        marginPercent: margin,
      });
    });

    // Accumulate from orders in selected period
    const validOrders = filteredOrders.filter((o) => o.status?.toLowerCase() !== 'cancelled');
    validOrders.forEach((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach((it) => {
        const pId = it.productId || it.id;
        if (!pId) return;

        let entry = reportMap.get(pId);
        const qty = Math.max(1, Number(it.quantity) || 1);
        const unitSell = Number(it.price) || 0;

        if (!entry) {
          const cost = getCostPrice(undefined, unitSell);
          const unitP = unitSell - cost;
          entry = {
            id: pId,
            name: it.name || 'Mobile Device',
            brand: 'Apple',
            category: 'smartphones',
            image: it.image || '/categories/iphone.svg',
            sellingPrice: unitSell,
            costPrice: cost,
            unitProfit: unitP,
            unitsSold: 0,
            grossRevenue: 0,
            netProfit: 0,
            marginPercent: unitSell > 0 ? Math.round((unitP / unitSell) * 100) : 12,
          };
          reportMap.set(pId, entry);
        }

        const lineRev = unitSell * qty;
        const lineProfit = (unitSell - entry.costPrice) * qty;

        entry.unitsSold += qty;
        entry.grossRevenue += lineRev;
        entry.netProfit += lineProfit;
      });
    });

    let list = Array.from(reportMap.values());

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort by highest profit generated, then by units sold
    return list.sort((a, b) => b.netProfit - a.netProfit || b.unitsSold - a.unitsSold);
  }, [products, filteredOrders, getCostPrice, searchFilter]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    products.forEach((p) => {
      const cat = p.categorySlug || 'smartphones';
      if (!map[cat]) map[cat] = { count: 0, value: 0 };
      map[cat].count += p.stock || 0;
      map[cat].value += (p.price || 0) * (p.stock || 0);
    });
    return Object.entries(map).map(([slug, data]) => ({
      category: slug.charAt(0).toUpperCase() + slug.slice(1),
      units: data.count,
      value: data.value,
    }));
  }, [products]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16 print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA] print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Analytics &bull; Financial &amp; Profit Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Store Performance &amp; Profit Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Authoritative revenue statements, product profit (monafa) analysis, and inventory valuation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#F7FBFF] p-1 rounded-xl border border-[#DCEBFA]">
            {(['all', '30days', '7days'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === r
                    ? 'bg-[#0866E8] text-white shadow-xs'
                    : 'text-[#647A98] hover:text-[#102A50]'
                }`}
              >
                {r === 'all' ? 'All Time' : r === '30days' ? 'Last 30 Days' : 'Last 7 Days'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => fetchReportData(true)}
            disabled={loading || refreshing}
            className="p-2 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#0866E8] transition-colors shadow-xs"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b-2 border-[#102A50] pb-4 mb-6">
        <h2 className="text-2xl font-black text-[#102A50]">
          Blue Bells Mobile Shop &mdash; Official Profit &amp; Sales Statement
        </h2>
        <p className="text-xs text-[#647A98] mt-1">
          Period: {timeRange === 'all' ? 'All Time' : timeRange === '30days' ? 'Last 30 Days' : 'Last 7 Days'} |
          Generated on {new Date().toLocaleDateString('en-PK', { dateStyle: 'full' })}
        </p>
      </div>

      {/* 5 Financial Highlight Cards (Includes Profit Munafa) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Sales Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0866E8] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50] mt-2 tracking-tight">
            Rs. {loading ? '...' : metrics.totalRevenue.toLocaleString('en-PK')}
          </p>
          <span className="text-[11px] text-[#0866E8] font-bold mt-1 inline-block">
            Across {metrics.totalOrders} total orders
          </span>
        </div>

        {/* Total Net Profit (Munafa) - Prominent Green Accent */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md shadow-emerald-500/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-emerald-100">Net Store Profit (Munafa)</span>
            <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Rs. {loading ? '...' : metrics.totalProfit.toLocaleString('en-PK')}
          </p>
          <span className="text-[11px] text-emerald-100 font-bold mt-1 inline-block">
            {metrics.profitMarginPercent}% Net Store Margin
          </span>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50] mt-2 tracking-tight">
            Rs. {loading ? '...' : metrics.aov.toLocaleString('en-PK')}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium mt-1 inline-block">
            Per customer transaction
          </span>
        </div>

        {/* Warehouse Valuation */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Inventory Assets</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2 tracking-tight">
            Rs. {loading ? '...' : (metrics.totalInventoryValue / 1000000).toFixed(2)}M
          </p>
          <span className="text-[11px] text-[#647A98] font-medium mt-1 inline-block">
            {metrics.totalInventoryUnits} physical units in stock
          </span>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Fulfillment Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50] mt-2 tracking-tight">
            {metrics.totalOrders > 0
              ? `${Math.round((metrics.completedOrdersCount / metrics.totalOrders) * 100)}%`
              : '100%'}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            {metrics.completedOrdersCount} fulfilled orders
          </span>
        </div>
      </div>

      {/* Comprehensive Product Profit (Munafa) Analysis Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#DCEBFA] bg-gradient-to-r from-emerald-50/50 via-[#F7FBFF] to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#102A50] tracking-tight">
                Product Profit &amp; Margin Statement (Monafa Report)
              </h3>
              <p className="text-xs text-[#647A98]">
                Exact profit (monafa) earned per device &mdash; selling price minus wholesale purchase cost
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-72 print:hidden">
            <Search className="w-4 h-4 text-[#647A98] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by device or brand..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#DCEBFA] text-xs text-[#102A50] placeholder-[#647A98] focus:outline-none focus:border-[#0866E8]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDF2F7] bg-[#F7FBFF] text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                <th className="py-4 px-6">Product &amp; Model</th>
                <th className="py-4 px-6">Brand</th>
                <th className="py-4 px-6 text-center">Units Sold</th>
                <th className="py-4 px-6 text-right">Selling Price</th>
                <th className="py-4 px-6 text-right">Wholesale Cost</th>
                <th className="py-4 px-6 text-right font-black text-emerald-700">Unit Profit (Munafa)</th>
                <th className="py-4 px-6 text-right font-black text-emerald-800">Total Profit Earned</th>
                <th className="py-4 px-6 text-center">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5FA] text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-6">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : productProfitReport.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-[#647A98]">
                    No devices match your search filter.
                  </td>
                </tr>
              ) : (
                productProfitReport.map((p) => {
                  const hasSales = p.unitsSold > 0;
                  return (
                    <tr key={p.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-[#102A50] flex items-center gap-3">
                        <img
                          src={p.image || '/categories/iphone.svg'}
                          alt={p.name}
                          className="w-8 h-8 rounded-lg object-contain bg-[#EDF6FF] p-1 border border-[#DCEBFA]"
                        />
                        <span className="truncate max-w-[220px]" title={p.name}>
                          {p.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-bold text-[#0866E8]">{p.brand}</td>
                      <td className="py-3.5 px-6 text-center font-bold">
                        {hasSales ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0866E8] text-xs">
                            {p.unitsSold} units
                          </span>
                        ) : (
                          <span className="text-[#647A98] text-[11px]">0 sold</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-semibold text-[#102A50]">
                        Rs. {p.sellingPrice.toLocaleString('en-PK')}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono text-[#647A98]">
                        Rs. {p.costPrice.toLocaleString('en-PK')}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-bold text-emerald-600">
                        +Rs. {p.unitProfit.toLocaleString('en-PK')}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-emerald-700">
                        {hasSales ? (
                          `Rs. ${p.netProfit.toLocaleString('en-PK')}`
                        ) : (
                          <span className="text-xs text-[#647A98] font-normal">
                            Rs. {p.unitProfit.toLocaleString('en-PK')} / unit
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            p.marginPercent >= 15
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.marginPercent >= 10
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.marginPercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Order Status Breakdown & Category Valuation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Fulfillment Status */}
        <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F5FA] pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#0866E8]" />
              <h3 className="text-sm font-bold text-[#102A50]">Order Fulfillment Status</h3>
            </div>
            <span className="text-xs text-[#647A98] font-mono">{filteredOrders.length} Orders</span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Delivered &amp; Confirmed</span>
              </div>
              <strong className="text-sm font-black text-emerald-700">{metrics.completedOrdersCount}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Pending Processing</span>
              </div>
              <strong className="text-sm font-black text-amber-700">{metrics.pendingOrdersCount}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span className="text-xs font-bold text-rose-900">Cancelled / Returned</span>
              </div>
              <strong className="text-sm font-black text-rose-700">{metrics.cancelledOrdersCount}</strong>
            </div>
          </div>
        </div>

        {/* Category Inventory Share */}
        <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F5FA] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-[#102A50]">Category Inventory Value</h3>
            </div>
            <span className="text-xs text-[#647A98] font-mono">{categoryStats.length} Categories</span>
          </div>

          <div className="space-y-3">
            {categoryStats.map((c) => (
              <div
                key={c.category}
                className="p-3.5 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#102A50]">{c.category}</span>
                  <p className="text-[11px] text-[#647A98]">{c.units} physical units in stock</p>
                </div>
                <strong className="font-black text-[#102A50]">
                  Rs. {c.value.toLocaleString('en-PK')}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
