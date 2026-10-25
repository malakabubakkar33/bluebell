'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar, Info } from 'lucide-react';

export interface DailySalesData {
  date: string;
  revenue: number;
  orders: number;
}

interface DashboardSalesChartProps {
  data: DailySalesData[];
  loading: boolean;
  totalRevenue: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const revenue = payload[0]?.value || 0;
    const orders = payload[0]?.payload?.orders || 0;
    return (
      <div className="bg-white border border-[#DCEBFA] p-3 rounded-xl shadow-lg text-xs">
        <p className="font-bold text-[#102A50] mb-1">{label}</p>
        <p className="text-[#0866E8] font-semibold">
          Revenue: <span className="font-bold">Rs. {revenue.toLocaleString('en-PK')}</span>
        </p>
        <p className="text-[#647A98]">
          Orders placed: <span className="font-bold text-[#102A50]">{orders}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const DashboardSalesChart: React.FC<DashboardSalesChartProps> = ({
  data,
  loading,
  totalRevenue,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 shadow-xs h-[380px] flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between">
          <div className="w-40 h-5 rounded bg-slate-200" />
          <div className="w-24 h-4 rounded bg-slate-100" />
        </div>
        <div className="flex-1 my-6 rounded-2xl bg-slate-50 flex items-center justify-center text-xs text-slate-400">
          Loading sales chart data...
        </div>
      </div>
    );
  }

  const hasAnyActivity = data.some((d) => d.revenue > 0 || d.orders > 0);

  return (
    <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A50]">Sales &amp; Revenue Overview</h2>
              <p className="text-xs text-[#647A98]">Past 7 days database order transactions</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[11px] font-bold text-[#0866E8]">
            <Calendar className="w-3 h-3" />
            <span>7-Day Trajectory</span>
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Total: Rs. {totalRevenue.toLocaleString('en-PK')}
          </span>
        </div>
      </div>

      {/* Chart Body */}
      <div className="w-full h-[280px]">
        {!hasAnyActivity ? (
          <div className="w-full h-full rounded-2xl border border-dashed border-[#DCEBFA] bg-[#F7FBFF] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCEBFA] flex items-center justify-center text-[#647A98] mb-3 shadow-xs">
              <Info className="w-6 h-6 text-[#0866E8]" />
            </div>
            <h3 className="text-sm font-bold text-[#102A50]">No Order Activity Yet</h3>
            <p className="text-xs text-[#647A98] mt-1 max-w-sm">
              The chart automatically groups transactions by day as customer orders are placed and confirmed in the database.
            </p>
            <div className="mt-4 px-3 py-1.5 rounded-lg bg-white border border-[#DCEBFA] text-[11px] text-[#647A98] font-mono">
              Database Orders Count: 0 • Revenue: Rs. 0
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0866E8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0866E8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBF2FA" />
              <XAxis
                dataKey="date"
                stroke="#647A98"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#647A98"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : `${val}`)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0866E8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Chart Footer Notice */}
      <div className="mt-4 pt-3 border-t border-[#F0F5FA] flex items-center justify-between text-[11px] text-[#647A98]">
        <span>Aggregated from authoritative <code className="font-mono text-[#0866E8]">public.orders</code> records</span>
        <span className="font-semibold text-emerald-700">Cancelled orders excluded</span>
      </div>
    </div>
  );
};
