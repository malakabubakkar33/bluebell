'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  Image as ImageIcon,
  Star,
  BarChart3,
  Settings,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';

export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'banners'
  | 'reviews'
  | 'reports'
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onLogout: () => void;
  ordersCount?: number;
  productsCount?: number;
  lowStockCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onLogout,
  ordersCount,
  productsCount,
  lowStockCount,
}) => {
  const NAV_ITEMS: { id: AdminTab; label: string; icon: React.ElementType; badge?: number | string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package, badge: productsCount },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'inventory', label: 'Inventory', icon: Boxes, badge: lowStockCount ? `${lowStockCount} low` : undefined },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: ordersCount },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'banners', label: 'Banners', icon: ImageIcon },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A192F] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#152B4D] lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Logo & Store Header */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-[#152B4D]">
            <Link
              href="/admin"
              className="flex items-center gap-3 group"
              onClick={() => setIsOpenMobile(false)}
            >
              {/* Double-B Cyan Logo Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0077F2] to-[#00C6FF] flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                </svg>
              </div>

              <div>
                <div className="text-sm font-black tracking-wide text-white uppercase font-sans">
                  BLUE BELLS
                </div>
                <div className="text-[10px] font-bold tracking-[0.2em] text-[#00C6FF] uppercase">
                  MOBILE SHOP
                </div>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] no-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-[#1877F2] text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : typeof item.badge === 'string' && item.badge.includes('low')
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Admin User Profile Card & Quick Actions */}
        <div className="p-3 border-t border-[#152B4D] bg-[#071224]/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                  AD
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A192F]" />
              </div>

              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">Admin</span>
                <span className="text-[10px] text-slate-400 font-medium">Super Admin</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/"
                target="_blank"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="View Live Storefront"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
