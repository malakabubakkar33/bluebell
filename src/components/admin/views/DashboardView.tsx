'use client';

import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wallet,
  Clock,
  Truck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Product } from '@/types';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  productsList: Product[];
  ordersList: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  productsList,
  ordersList,
}) => {
  const [timeRange, setTimeRange] = useState('Last 7 days');

  const totalOrdersCount = ordersList?.length || 0;
  const totalRevenueAmount = ordersList?.reduce((acc, o) => acc + (o.total || 0), 0) || 0;
  const pendingOrdersCount = ordersList?.filter((o) => o.status === 'pending').length || 0;
  const deliveredOrdersCount = ordersList?.filter((o) => o.status === 'delivered').length || 0;

  // Real data points initialized to 0 for fresh store
  const STAT_CARDS = [
    {
      id: 'orders',
      title: 'Total Orders',
      value: String(totalOrdersCount),
      change: '0%',
      isPositive: true,
      subtext: 'Store Initialized',
      icon: ShoppingCart,
      iconBg: 'bg-blue-50 text-[#1877F2]',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `Rs. ${totalRevenueAmount.toLocaleString()}`,
      change: '0%',
      isPositive: true,
      subtext: 'Store Initialized',
      icon: Wallet,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'pending',
      title: 'Pending Orders',
      value: String(pendingOrdersCount),
      change: '0%',
      isPositive: false,
      subtext: 'Store Initialized',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'delivered',
      title: 'Delivered Orders',
      value: String(deliveredOrdersCount),
      change: '0%',
      isPositive: true,
      subtext: 'Store Initialized',
      icon: Truck,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const TOP_PRODUCTS: any[] = [];

  const ORDER_STATUS_DATA = [
    { label: 'Pending', count: pendingOrdersCount, color: '#3B82F6' },
    { label: 'Processing', count: ordersList?.filter((o) => o.status === 'processing').length || 0, color: '#06B6D4' },
    { label: 'Shipped', count: ordersList?.filter((o) => o.status === 'shipped').length || 0, color: '#6366F1' },
    { label: 'Delivered', count: deliveredOrdersCount, color: '#10B981' },
    { label: 'Cancelled', count: ordersList?.filter((o) => o.status === 'cancelled').length || 0, color: '#EF4444' },
  ];

  const LOW_STOCK_ITEMS = [
    {
      name: 'iPhone 15 Pro (128GB)',
      stock: 3,
      image: '/categories/iphone.svg',
      badge: 'Low Stock',
    },
    {
      name: 'Samsung Galaxy S24 (256GB)',
      stock: 3,
      image: '/categories/samsung.svg',
      badge: 'Low Stock',
    },
    {
      name: 'AirPods Pro (2nd Gen)',
      stock: 1,
      image: '/categories/accessories.svg',
      badge: 'Critical',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Date Dropdown */}
        <div className="relative inline-flex items-center self-start sm:self-auto">
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500">{card.title}</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
                    {card.value}
                  </h3>
                </div>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Trend Pill */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                {card.isPositive ? (
                  <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {card.change}
                  </span>
                ) : (
                  <span className="font-bold text-rose-500 flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {card.change}
                  </span>
                )}
                <span className="text-slate-400 font-medium">{card.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Row: Sales Overview & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Overview Chart (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales Overview</h3>
              <p className="text-xs text-slate-400">Weekly sales curve (in PKR)</p>
            </div>
            <span className="text-xs font-bold text-[#1877F2] bg-blue-50 px-2.5 py-1 rounded-full">
              Live Tracker
            </span>
          </div>

          {/* SVG Line / Area Graph */}
          <div className="h-64 sm:h-72 w-full pt-4 pb-2 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1877F2" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#1877F2" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="50" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="80" x2="680" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="140" x2="680" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="50" y1="200" x2="680" y2="200" stroke="#f1f5f9" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="5" y="24" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Rs. 300K</text>
              <text x="5" y="84" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Rs. 200K</text>
              <text x="5" y="144" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Rs. 100K</text>
              <text x="25" y="204" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">Rs. 0</text>

              {/* Area Fill */}
              <path
                d="M 60 170 Q 150 140, 240 160 T 420 110 T 540 80 T 670 120 L 670 200 L 60 200 Z"
                fill="url(#salesGradient)"
              />

              {/* Spline Line */}
              <path
                d="M 60 170 Q 150 140, 240 160 T 420 110 T 540 80 T 670 120"
                fill="none"
                stroke="#1877F2"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interactive Points */}
              {[
                { x: 60, y: 170, label: 'Rs. 75K' },
                { x: 160, y: 145, label: 'Rs. 110K' },
                { x: 260, y: 160, label: 'Rs. 95K' },
                { x: 360, y: 125, label: 'Rs. 160K' },
                { x: 460, y: 100, label: 'Rs. 210K' },
                { x: 560, y: 80, label: 'Rs. 260K' },
                { x: 670, y: 120, label: 'Rs. 185K' },
              ].map((pt, idx) => (
                <g key={idx} className="cursor-pointer group">
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke="#1877F2" strokeWidth="3" />
                </g>
              ))}

              {/* X Axis Labels */}
              <text x="50" y="230" fill="#64748b" fontSize="11" fontWeight="600">Apr 23</text>
              <text x="150" y="230" fill="#64748b" fontSize="11" fontWeight="600">Apr 24</text>
              <text x="250" y="230" fill="#64748b" fontSize="11" fontWeight="600">Apr 25</text>
              <text x="350" y="230" fill="#64748b" fontSize="11" fontWeight="600">Apr 26</text>
              <text x="450" y="230" fill="#64748b" fontSize="11" fontWeight="600">Apr 27</text>
              <text x="550" y="230" fill="#64748b" fontSize="11" fontWeight="600">Apr 28</text>
              <text x="650" y="230" fill="#64748b" fontSize="11" fontWeight="600">Apr 29</text>
            </svg>
          </div>
        </div>

        {/* Top Selling Products (5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Top Selling Products</h3>
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs font-semibold text-[#1877F2] hover:underline"
              >
                View all
              </button>
            </div>

            <div className="space-y-3.5">
              {TOP_PRODUCTS.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-bold text-slate-700">No Sales Recorded Yet (0)</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Store is in initial state. Best-selling phones will be ranked here when orders are placed.
                  </p>
                </div>
              ) : (
                TOP_PRODUCTS.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 flex-shrink-0">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[11px] text-slate-500">{prod.price}</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#1877F2] flex-shrink-0">
                      {prod.sold}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Sales Insights Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Order Status Donut & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Order Status Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Order Status</h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="14" />
                {/* Delivered: 98 (58%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="14"
                  strokeDasharray="138 238"
                  strokeDashoffset="0"
                />
                {/* Shipped: 36 (21%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#6366F1"
                  strokeWidth="14"
                  strokeDasharray="50 238"
                  strokeDashoffset="-138"
                />
                {/* Pending: 18 (11%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="14"
                  strokeDasharray="26 238"
                  strokeDashoffset="-188"
                />
                {/* Processing: 12 (7%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#06B6D4"
                  strokeWidth="14"
                  strokeDasharray="17 238"
                  strokeDashoffset="-214"
                />
                {/* Cancelled: 4 (2%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray="7 238"
                  strokeDashoffset="-231"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900">168</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {ORDER_STATUS_DATA.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 font-medium">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Low Stock Alert</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-[#1877F2] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {LOW_STOCK_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                    <span className="text-[11px] text-amber-700 font-semibold">
                      Stock: {item.stock} units remaining
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('inventory')}
                  className="px-3 py-1.5 rounded-lg bg-amber-100/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
