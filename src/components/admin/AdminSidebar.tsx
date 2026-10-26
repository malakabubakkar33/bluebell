'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/common/BrandLogo';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Boxes,
  Sparkles,
  BarChart3,
  Settings,
  Lock,
  X,
  ExternalLink,
} from 'lucide-react';
import { AdminLogoutButton } from './AdminLogoutButton';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  phase?: string;
  enabled: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    enabled: true,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    enabled: true,
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
    phase: 'Phase 5',
    enabled: false,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    phase: 'Phase 6',
    enabled: false,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    phase: 'Phase 7',
    enabled: false,
  },
  {
    name: 'Inventory',
    href: '/admin/inventory',
    icon: Boxes,
    phase: 'Phase 8',
    enabled: false,
  },
  {
    name: 'Deals & Banners',
    href: '/admin/promotions',
    icon: Sparkles,
    phase: 'Phase 9',
    enabled: false,
  },
  {
    name: 'Reports',
    href: '/admin/reports',
    icon: BarChart3,
    phase: 'Phase 11',
    enabled: false,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    phase: 'Phase 11',
    enabled: false,
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  adminName?: string;
  adminEmail?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  adminName = 'Administrator',
  adminEmail = 'admin@bluebell.pk',
}) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-[#102A50]/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-[#DCEBFA] flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[#DCEBFA] flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 group" onClick={onClose}>
            <BrandLogo variant="compact" />
            <div className="flex flex-col text-left leading-tight pl-2 border-l border-[#DCEBFA]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0866E8]">
                Admin Portal
              </span>
              <span className="text-xs font-bold text-[#102A50]">
                Management
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#647A98] hover:text-[#102A50] hover:bg-[#EDF6FF]"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[#647A98]">
            Main Menu
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            if (item.enabled) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0866E8] text-white shadow-md shadow-[#0866E8]/20'
                      : 'text-[#102A50] hover:bg-[#EDF6FF] hover:text-[#0866E8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#0866E8]'}`} />
                    <span>{item.name}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#EDF6FF] text-[#0866E8]'}`}>
                    Active
                  </span>
                </Link>
              );
            }

            // Disabled future module item (transparently shows Phase)
            return (
              <div
                key={item.name}
                title={`${item.name} will be activated in ${item.phase}`}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-[#8EA0B8] cursor-not-allowed bg-slate-50/70 border border-transparent select-none"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#A0B2C9]" />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-[#647A98]">
                    {item.phase}
                  </span>
                  <Lock className="w-3 h-3 text-[#A0B2C9]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Link to Storefront */}
        <div className="p-4 border-t border-[#DCEBFA] bg-[#F7FBFF]/70">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl text-xs font-bold text-[#0866E8] bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </div>
            <span className="text-[10px] text-[#647A98]">Live</span>
          </Link>
        </div>

        {/* Admin User Profile & Logout */}
        <div className="p-4 border-t border-[#DCEBFA] bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0866E8] text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#102A50] truncate">{adminName}</p>
              <p className="text-[10px] text-[#647A98] font-mono truncate">{adminEmail}</p>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>
    </>
  );
};
