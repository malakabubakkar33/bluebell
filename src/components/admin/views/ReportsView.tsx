'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CreditCard,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'products' | 'customers' | 'orders'>('sales');
  const [dateRange, setDateRange] = useState('Apr 1, 2026 - Apr 30, 2026');

  // KPIs initialized to 0 for initial store launch
  const REPORT_KPIS = [
    {
      title: 'Total Sales',
      value: 'Rs. 0',
      change: '0%',
      icon: DollarSign,
      iconBg: 'bg-blue-50 text-[#1877F2]',
    },
    {
      title: 'Total Orders',
      value: '0',
      change: '0%',
      icon: ShoppingBag,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Average Order Value',
      value: 'Rs. 0',
      change: '0%',
      icon: CreditCard,
      iconBg: 'bg-sky-50 text-sky-600',
    },
  ];

  const handleExport = () => {
    alert('Generating Blue Bells Monthly Financial Report for ' + dateRange);
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
            View sales reports and export data.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{dateRange}</span>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
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
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{kpi.change} vs previous month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Large Sales Trend Graph */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue Progression</h3>
            <p className="text-xs text-slate-400">Daily gross revenue curve (PKR)</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            +18% Growth
          </span>
        </div>

        <div className="h-72 w-full pt-4 pb-2 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 240" preserveAspectRatio="none">
            <defs>
              <linearGradient id="reportGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1877F2" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1877F2" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid */}
            <line x1="50" y1="20" x2="680" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="50" y1="80" x2="680" y2="80" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="50" y1="140" x2="680" y2="140" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="50" y1="200" x2="680" y2="200" stroke="#f1f5f9" strokeWidth="1" />

            {/* Y Labels */}
            <text x="5" y="24" fill="#94a3b8" fontSize="11">Rs. 300K</text>
            <text x="5" y="84" fill="#94a3b8" fontSize="11">Rs. 200K</text>
            <text x="5" y="144" fill="#94a3b8" fontSize="11">Rs. 100K</text>
            <text x="25" y="204" fill="#94a3b8" fontSize="11">Rs. 0</text>

            {/* Path */}
            <path
              d="M 60 180 Q 180 130, 260 160 T 420 100 T 560 70 T 670 110 L 670 200 L 60 200 Z"
              fill="url(#reportGrad)"
            />
            <path
              d="M 60 180 Q 180 130, 260 160 T 420 100 T 560 70 T 670 110"
              fill="none"
              stroke="#1877F2"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* X Labels */}
            <text x="60" y="225" fill="#64748b" fontSize="11" fontWeight="600">Apr 23</text>
            <text x="160" y="225" fill="#64748b" fontSize="11" fontWeight="600">Apr 24</text>
            <text x="260" y="225" fill="#64748b" fontSize="11" fontWeight="600">Apr 25</text>
            <text x="360" y="225" fill="#64748b" fontSize="11" fontWeight="600">Apr 26</text>
            <text x="460" y="225" fill="#64748b" fontSize="11" fontWeight="600">Apr 27</text>
            <text x="560" y="225" fill="#64748b" fontSize="11" fontWeight="600">Apr 28</text>
            <text x="660" y="225" fill="#64748b" fontSize="11" fontWeight="600">Apr 29</text>
          </svg>
        </div>
      </div>
    </div>
  );
};
