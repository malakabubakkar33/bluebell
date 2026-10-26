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
} from 'lucide-react';

interface OrderItem {
  id: string;
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
  stock: number;
  categorySlug?: string;
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | '30days' | '7days'>('all');

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

  // Aggregate Key Financial Metrics
  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(
      (o) => o.status?.toLowerCase() === 'delivered' || o.status?.toLowerCase() === 'confirmed'
    );
    const pendingOrders = filteredOrders.filter((o) => o.status?.toLowerCase() === 'pending');
    const cancelledOrders = filteredOrders.filter((o) => o.status?.toLowerCase() === 'cancelled');

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const confirmedRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Total units in inventory
    const totalInventoryUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0), 0);

    return {
      totalOrders,
      completedOrdersCount: completedOrders.length,
      pendingOrdersCount: pendingOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      totalRevenue,
      confirmedRevenue,
      aov,
      totalInventoryUnits,
      totalInventoryValue,
    };
  }, [filteredOrders, products]);

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

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 print:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA] print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Analytics &bull; Financial &amp; Sales Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Store Performance &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Authoritative financial reports, inventory valuation, and order performance for Blue Bells Mobile Shop.
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
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] text-xs font-bold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={() => fetchReportData(true)}
            disabled={loading || refreshing}
            className="p-2 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#0866E8] transition-colors"
            title="Refresh Report"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b-2 border-[#102A50] pb-4 mb-6">
        <h2 className="text-2xl font-black text-[#102A50]">Blue Bells Mobile Shop &mdash; Official Store Report</h2>
        <p className="text-xs text-[#647A98] mt-1">
          Generated on {new Date().toLocaleDateString('en-PK', { dateStyle: 'full' })} | Authoritative PostgreSQL Data
        </p>
      </div>

      {/* 4 Financial Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50] mt-2">
            Rs. {loading ? '...' : metrics.totalRevenue.toLocaleString('en-PK')}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">
            Confirmed: Rs. {metrics.confirmedRevenue.toLocaleString('en-PK')}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Average Order Value</span>
            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0866E8] mt-2">
            Rs. {loading ? '...' : metrics.aov.toLocaleString('en-PK')}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium mt-1 inline-block">
            Across {metrics.totalOrders} total orders
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Warehouse Valuation</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2">
            Rs. {loading ? '...' : (metrics.totalInventoryValue / 1000000).toFixed(2)}M
          </p>
          <span className="text-[11px] text-[#647A98] font-medium mt-1 inline-block">
            {metrics.totalInventoryUnits} physical mobile units
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Fulfillment Rate</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50] mt-2">
            {metrics.totalOrders > 0
              ? `${Math.round((metrics.completedOrdersCount / metrics.totalOrders) * 100)}%`
              : '100%'}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium mt-1 inline-block">
            {metrics.completedOrdersCount} fulfilled orders
          </span>
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

      {/* Top Value Devices in Catalog */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#DCEBFA] bg-[#F7FBFF] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#102A50]">Flagship Inventory Assets</h3>
            <p className="text-xs text-[#647A98]">Top premium devices and stock held in Blue Bells warehouse</p>
          </div>
          <span className="font-mono text-xs text-[#0866E8] font-bold">PostgreSQL Real Catalog</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#EDF2F7] bg-white text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                <th className="py-4 px-6">Device Name</th>
                <th className="py-4 px-6">Brand</th>
                <th className="py-4 px-6 text-right">Unit Price</th>
                <th className="py-4 px-6 text-center">Stock Count</th>
                <th className="py-4 px-6 text-right">Total Asset Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F5FA] text-xs">
              {products
                .slice()
                .sort((a, b) => (b.price || 0) * (b.stock || 0) - (a.price || 0) * (a.stock || 0))
                .slice(0, 10)
                .map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-[#102A50]">{p.name}</td>
                    <td className="py-4 px-6 text-[#0866E8] font-semibold">{p.brand}</td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-[#102A50]">
                      Rs. {Number(p.price || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-4 px-6 text-center font-bold">{p.stock || 0}</td>
                    <td className="py-4 px-6 text-right font-black text-emerald-600">
                      Rs. {((p.price || 0) * (p.stock || 0)).toLocaleString('en-PK')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
