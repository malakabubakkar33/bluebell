'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DashboardSummaryCards,
  DashboardMetrics,
} from '@/components/admin/DashboardSummaryCards';
import {
  DashboardSalesChart,
  DailySalesData,
} from '@/components/admin/DashboardSalesChart';
import {
  RecentOrdersTable,
  RecentOrder,
} from '@/components/admin/RecentOrdersTable';
import {
  LowStockAlertTable,
  LowStockProduct,
} from '@/components/admin/LowStockAlertTable';
import {
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Store,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  Sparkles,
  BarChart3,
  Settings as SettingsIcon,
  Coins,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

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

interface DashboardResponse {
  success: boolean;
  timestamp: string;
  metrics: DashboardMetrics;
  lowStockItems: LowStockProduct[];
  recentOrders: RecentOrder[];
  salesChartData: DailySalesData[];
  productProfitList?: ProductProfitStats[];
  error?: string;
}

import { useAdminData } from '@/context/AdminDataContext';

export default function AdminDashboardPage() {
  const { dashboardData, refreshDashboard, isRefreshing, isInitialLoading, error: contextError } = useAdminData();
  const [localRefreshing, setLocalRefreshing] = useState<boolean>(false);

  const metrics = dashboardData?.metrics || null;
  const lowStockItems = dashboardData?.lowStockItems || [];
  const recentOrders = dashboardData?.recentOrders || [];
  const salesChartData = dashboardData?.salesChartData || [];
  const productProfits = dashboardData?.productProfitList || [];
  const loading = !dashboardData && isInitialLoading;
  const refreshing = isRefreshing || localRefreshing;
  const lastUpdated = dashboardData?.timestamp
    ? new Date(dashboardData.timestamp).toLocaleTimeString()
    : null;
  const error = contextError;

  const handleRefresh = async () => {
    setLocalRefreshing(true);
    await refreshDashboard();
    setLocalRefreshing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Section: Header & Live Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 3 Live &bull; Pre-Warmed Fast Engine Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Real-time e-commerce metrics, net profit analytics, and instant pre-warmed synchronization.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {lastUpdated && (
            <span className="hidden sm:inline-block text-[11px] font-mono text-[#647A98]">
              Updated: {lastUpdated}
            </span>
          )}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            title="Refresh metrics from authoritative database"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#0866E8] ${
                refreshing ? 'animate-spin' : ''
              }`}
            />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert (if database or API fails) */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Failed to load live database metrics</h4>
              <p className="text-xs text-rose-700 mt-0.5 font-mono">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 1. Summary Cards (Now Includes Net Profit Munafa Card) */}
      <section aria-label="Dashboard Key Performance Metrics">
        <DashboardSummaryCards metrics={metrics} loading={loading} />
      </section>

      {/* 2. Sales Chart (7-Day Trend) */}
      <section aria-label="7-Day Sales Trend">
        <DashboardSalesChart
          data={salesChartData}
          loading={loading}
          totalRevenue={metrics?.totalRevenue ?? 0}
        />
      </section>

      {/* 3. Product-Wise Profit (Munafa) Breakdown Table */}
      <section aria-label="Product Profit Breakdown">
        <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#DCEBFA] bg-gradient-to-r from-emerald-50/50 via-[#F7FBFF] to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#102A50] tracking-tight">
                  Product Profit &amp; Margin Breakdown (Monafa Report)
                </h3>
                <p className="text-xs text-[#647A98]">
                  Detailed profit generated per device &mdash; selling price vs wholesale purchase cost
                </p>
              </div>
            </div>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors self-start sm:self-auto"
            >
              <span>Full Financial Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF2F7] bg-[#F7FBFF] text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                  <th className="py-3.5 px-6">Device Name</th>
                  <th className="py-3.5 px-6">Brand</th>
                  <th className="py-3.5 px-6 text-center">Units Sold</th>
                  <th className="py-3.5 px-6 text-right">Selling Price</th>
                  <th className="py-3.5 px-6 text-right">Cost Price</th>
                  <th className="py-3.5 px-6 text-right font-black text-emerald-700">Unit Profit (Munafa)</th>
                  <th className="py-3.5 px-6 text-right font-black text-emerald-800">Total Profit Generated</th>
                  <th className="py-3.5 px-6 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA] text-xs">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={8} className="py-4 px-6">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : productProfits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-xs text-[#647A98]">
                      No product sales recorded yet. Profits will calculate automatically as orders are placed.
                    </td>
                  </tr>
                ) : (
                  productProfits.slice(0, 8).map((p) => {
                    const hasSales = p.unitsSold > 0;
                    return (
                      <tr key={p.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-[#102A50] flex items-center gap-3">
                          <img
                            src={p.image || '/categories/iphone.svg'}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-contain bg-[#EDF6FF] p-1 border border-[#DCEBFA]"
                          />
                          <span className="truncate max-w-[200px]" title={p.name}>
                            {p.name}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-[#0866E8] font-bold">{p.brand}</td>
                        <td className="py-3.5 px-6 text-center font-bold">
                          {hasSales ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">
                              {p.unitsSold} sold
                            </span>
                          ) : (
                            <span className="text-[#647A98] text-[11px]">0 sold</span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-right font-mono text-[#102A50] font-semibold">
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
                            `Rs. ${p.totalProfit.toLocaleString('en-PK')}`
                          ) : (
                            <span className="text-xs text-[#647A98] font-normal">
                              Rs. {p.unitProfit.toLocaleString('en-PK')} / unit
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
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
      </section>

      {/* 4. Operational Grid: Recent Orders & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <section aria-label="Recent Database Orders">
          <RecentOrdersTable orders={recentOrders} loading={loading} />
        </section>

        {/* Low-Stock Alerts Table */}
        <section aria-label="Low-Stock Inventory Warnings">
          <LowStockAlertTable
            products={lowStockItems}
            loading={loading}
            threshold={metrics?.lowStockThreshold ?? 15}
          />
        </section>
      </div>

      {/* 5. Real Management Modules Quick Access */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#102A50]">Store Management Modules</h3>
            <p className="text-xs text-[#647A98]">Authoritative CRUD controls connected to live PostgreSQL tables</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] hover:bg-[#EDF6FF] hover:text-[#0866E8] transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Storefront</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Products &amp; Mobiles
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                Add mobiles, multi-colors, storage GB, PTA status &amp; variants.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-[#0866E8]">
              <span>Manage Products</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Categories
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                Organize phones, accessories, brands &amp; display ordering.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600">
              <span>Manage Categories</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Orders &amp; Sales
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                Process customer bookings, update tracking numbers &amp; dispatch.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-teal-600">
              <span>Manage Orders</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/customers"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Customers
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                View shopper profiles, order histories, phone numbers &amp; cities.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600">
              <span>View Customers</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/inventory"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Inventory &amp; Stock
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                Real-time physical stock counts, threshold alerts &amp; restock.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600">
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/promotions"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Deals &amp; Banners
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                Hero carousel banners, flash sale ribbons &amp; deal badges.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-rose-600">
              <span>Manage Deals</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/reports"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Financial Reports
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                Sales volume, AOV, category shares &amp; printable invoices.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
              <span>View Reports</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="group p-5 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#0866E8] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A50] group-hover:text-[#0866E8] transition-colors">
                Store Settings
              </h4>
              <p className="text-xs text-[#647A98] mt-1">
                Shop profile, WhatsApp order desk, delivery fee &amp; database.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-slate-700">
              <span>Configure Settings</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
