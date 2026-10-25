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
  Layers,
  ArrowRight,
  Database,
  Store,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardResponse {
  success: boolean;
  timestamp: string;
  metrics: DashboardMetrics;
  lowStockItems: LowStockProduct[];
  recentOrders: RecentOrder[];
  salesChartData: DailySalesData[];
  error?: string;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [salesChartData, setSalesChartData] = useState<DailySalesData[]>([]);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch('/api/admin/dashboard/stats', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with status ${res.status}`
        );
      }

      const data: DashboardResponse = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }

      setMetrics(data.metrics);
      setLowStockItems(data.lowStockItems || []);
      setRecentOrders(data.recentOrders || []);
      setSalesChartData(data.salesChartData || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('[AdminDashboard] Fetch error:', err);
      setError(err.message || 'An unexpected error occurred while contacting database');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Section: Header & Live Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phase 3 Live &bull; Authoritative Database Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Real-time e-commerce metrics and database synchronization for Blue Bells Mobile Shop.
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
            onClick={() => fetchDashboardData(true)}
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

      {/* 1. Summary Cards (9 Verified Metrics) */}
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

      {/* 3. Operational Grid: Recent Orders & Low-Stock Alerts */}
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

      {/* 4. Architecture & Roadmap Notice Card */}
      <div className="rounded-3xl bg-white border border-[#DCEBFA] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0866E8] mb-1">
              <Database className="w-4 h-4 text-[#0866E8]" />
              <span>Phase 3 Foundation Active</span>
            </div>
            <h3 className="text-lg font-bold text-[#102A50]">
              Next Phase: Phase 4 &mdash; Product Management Rebuild
            </h3>
            <p className="text-xs text-[#647A98] mt-1 leading-relaxed">
              Phase 3 establishes real database metrics and verified admin controls. In accordance with strict project guidelines, full CRUD workflows for products (Phase 4), categories (Phase 5), orders (Phase 6), customers (Phase 7), and inventory (Phase 8) will be unlocked in their respective phases upon approval.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] hover:bg-[#EDF6FF] hover:text-[#0866E8] transition-colors"
            >
              <Store className="w-4 h-4 text-[#0866E8]" />
              <span>Visit Customer Store</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
