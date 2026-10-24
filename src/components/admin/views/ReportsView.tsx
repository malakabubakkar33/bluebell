'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Inbox,
} from 'lucide-react';

interface ReportsViewProps {
  ordersList?: any[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ ordersList = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'products' | 'customers' | 'orders'>('sales');
  const [dateRange] = useState('All Time (Live DB)');

  // Authoritative calculations from real database orders
  const validOrders = useMemo(() => {
    return ordersList.filter((o) => o.status !== 'cancelled');
  }, [ordersList]);

  const totalSales = useMemo(() => {
    return validOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  }, [validOrders]);

  const totalOrdersCount = ordersList.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  // Real daily breakdown from actual order dates
  const dailySalesData = useMemo(() => {
    const map = new Map<string, number>();
    ordersList.forEach((o) => {
      const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today';
      map.set(dateStr, (map.get(dateStr) || 0) + (Number(o.total) || 0));
    });
    return Array.from(map.entries()).map(([date, amount]) => ({ date, amount }));
  }, [ordersList]);

  const REPORT_KPIS = [
    {
      title: 'Gross Revenue',
      value: `Rs. ${totalSales.toLocaleString()}`,
      subtext: totalOrdersCount === 0 ? 'No completed orders' : `${validOrders.length} fulfilled orders`,
      icon: DollarSign,
      iconBg: 'bg-blue-50 text-[#1877F2]',
    },
    {
      title: 'Total Order Volume',
      value: `${totalOrdersCount}`,
      subtext: totalOrdersCount === 0 ? 'Zero orders recorded' : 'Real database orders',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Average Order Value (AOV)',
      value: `Rs. ${aov.toLocaleString()}`,
      subtext: totalOrdersCount === 0 ? 'Rs. 0 per order' : 'Calculated from valid orders',
      icon: CreditCard,
      iconBg: 'bg-sky-50 text-sky-600',
    },
  ];

  const handleExport = () => {
    if (ordersList.length === 0) {
      alert('No database orders available to export.');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Order ID,Customer,Phone,Total,Status,Date', ...ordersList.map((o) => `"${o.id}","${o.customer_name}","${o.customer_phone}",${o.total},"${o.status}","${o.created_at || 'Today'}"`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bluebell_sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Reports &amp; Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Store performance and financial summaries calculated purely from database orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{dateRange}</span>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['sales', 'products', 'customers', 'orders'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
              activeSubTab === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {REPORT_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">{kpi.title}</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
                <span>{kpi.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Sales Progression Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue Progression</h3>
            <p className="text-xs text-slate-400">Order revenue recorded across date periods (PKR)</p>
          </div>
          <span className="text-xs font-bold text-[#1877F2] bg-blue-50 px-2.5 py-1 rounded-full">
            Authoritative DB
          </span>
        </div>

        {totalOrdersCount === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Inbox className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-700">No Sales History Recorded (Rs. 0)</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              As orders are created and verified through the customer website, daily revenue trends will automatically visualize here.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full flex flex-col justify-end space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 items-end h-48 pt-4">
              {dailySalesData.map((d, i) => {
                const maxVal = Math.max(...dailySalesData.map((it) => it.amount), 1);
                const heightPercent = Math.max(15, Math.round((d.amount / maxVal) * 100));

                return (
                  <div key={i} className="flex flex-col items-center h-full justify-end gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-600">
                      Rs. {d.amount >= 1000 ? `${Math.round(d.amount / 1000)}k` : d.amount}
                    </span>
                    <div
                      className="w-full bg-[#1877F2] rounded-t-xl hover:bg-blue-600 transition-all"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-400">{d.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
