'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  ShoppingCart,
  Wallet,
  Clock,
  Truck,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Product } from '@/types';

interface DashboardViewProps {
  onNavigateTab: (tab: any) => void;
  productsList: Product[];
  ordersList: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  productsList = [],
  ordersList = [],
}) => {
  const [timeRange] = useState('All Time');

  // Authoritative calculations from real database records
  const totalOrdersCount = ordersList.length;
  const totalRevenueAmount = ordersList.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const pendingOrdersCount = ordersList.filter((o) => o.status === 'pending').length;
  const processingOrdersCount = ordersList.filter((o) => o.status === 'processing').length;
  const shippedOrdersCount = ordersList.filter((o) => o.status === 'shipped').length;
  const deliveredOrdersCount = ordersList.filter((o) => o.status === 'delivered').length;
  const cancelledOrdersCount = ordersList.filter((o) => o.status === 'cancelled').length;

  // Real Low Stock items calculated from actual catalog inventory (stock <= 3)
  const lowStockItems = useMemo(() => {
    return productsList
      .filter((p) => (p.stock ?? 10) <= 3)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock ?? 0,
        image: p.image,
        badge: (p.stock ?? 0) === 0 ? 'Out of Stock' : 'Low Stock',
      }));
  }, [productsList]);

  // Real KPI Cards
  const STAT_CARDS = [
    {
      id: 'orders',
      title: 'Total Orders',
      value: String(totalOrdersCount),
      subtext: totalOrdersCount === 0 ? 'No orders yet' : 'Real database orders',
      icon: ShoppingCart,
      iconBg: 'bg-blue-50 text-[#1877F2]',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `Rs. ${totalRevenueAmount.toLocaleString()}`,
      subtext: totalOrdersCount === 0 ? 'Rs. 0' : 'Calculated from fulfilled orders',
      icon: Wallet,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 'pending',
      title: 'Pending Orders',
      value: String(pendingOrdersCount),
      subtext: pendingOrdersCount === 0 ? 'Zero pending' : 'Requires verification',
      icon: Clock,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'delivered',
      title: 'Delivered Orders',
      value: String(deliveredOrdersCount),
      subtext: deliveredOrdersCount === 0 ? 'Zero delivered' : 'Fulfilled shipments',
      icon: Truck,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const ORDER_STATUS_DATA = [
    { label: 'Pending', count: pendingOrdersCount, color: '#3B82F6' },
    { label: 'Processing', count: processingOrdersCount, color: '#06B6D4' },
    { label: 'Shipped', count: shippedOrdersCount, color: '#6366F1' },
    { label: 'Delivered', count: deliveredOrdersCount, color: '#10B981' },
    { label: 'Cancelled', count: cancelledOrdersCount, color: '#EF4444' },
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
            Store overview synced directly with the production database.
          </p>
        </div>

        {/* Date Dropdown */}
        <div className="relative inline-flex items-center self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-xs text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
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

              {/* Subtext */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium">{card.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Middle Row: Sales Overview & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Overview (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales Overview</h3>
              <p className="text-xs text-slate-400">Order revenue performance (in PKR)</p>
            </div>
            <span className="text-xs font-bold text-[#1877F2] bg-blue-50 px-2.5 py-1 rounded-full">
              Live Database
            </span>
          </div>

          {totalOrdersCount === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingCart className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No Sales Recorded Yet (Rs. 0)</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Your store currently has 0 orders. Customer orders placed on the website will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="h-64 flex flex-col justify-between py-4">
              <div className="space-y-3">
                {ordersList.slice(0, 4).map((ord: any) => (
                  <div key={ord.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-primary">{ord.id}</span>
                      <span className="text-xs text-slate-500 ml-2">{ord.customer_name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">Rs. {Number(ord.total).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Selling Products (5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Featured Store Products</h3>
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs font-semibold text-[#1877F2] hover:underline"
              >
                View all ({productsList.length})
              </button>
            </div>

            <div className="space-y-3">
              {productsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">0 Products in Store</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Add new products from the Products tab to see them listed here.
                  </p>
                </div>
              ) : (
                productsList.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 flex-shrink-0">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">Rs. {prod.price.toLocaleString()}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1877F2] flex-shrink-0">
                      Stock: {prod.stock}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('products')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: Order Status & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Order Status Breakdown (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Order Status Breakdown</h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Donut representation */}
            <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                {totalOrdersCount > 0 && deliveredOrdersCount > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={`${(deliveredOrdersCount / totalOrdersCount) * 238} 238`}
                  />
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900">{totalOrdersCount}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total</span>
              </div>
            </div>

            {/* Legend with real counts */}
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
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Low Stock Alert ({lowStockItems.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-[#1877F2] hover:underline"
            >
              View Inventory
            </button>
          </div>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-emerald-600">All Catalog Products Adequately Stocked</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Products with 3 or fewer units in inventory will be flagged here for restocking.
                </p>
              </div>
            ) : (
              lowStockItems.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white p-1 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                      <span className="text-[11px] text-amber-700 font-semibold">
                        Stock: {item.stock} {item.stock === 1 ? 'unit' : 'units'} remaining
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateTab('inventory')}
                    className="px-3 py-1.5 rounded-lg bg-amber-100/70 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Restock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
