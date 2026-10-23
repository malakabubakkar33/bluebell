'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Bell,
  ExternalLink,
  ChevronDown,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AdminTopBarProps {
  onToggleMobileSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({
  onToggleMobileSidebar,
  searchQuery,
  setSearchQuery,
  onLogout,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions & User Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-200 transition-colors"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-bold text-slate-900">
                <span>Recent Notifications</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px]">
                  3 New
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-2 rounded-xl bg-blue-50/50 border border-blue-100/50">
                  <p className="font-semibold text-slate-800">New Order #BB-10024</p>
                  <p className="text-[11px] text-slate-500">iPhone 15 Pro Max • Rs. 349,999</p>
                  <span className="text-[10px] text-blue-600 font-medium">10 mins ago</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100/50">
                  <p className="font-semibold text-slate-800">Low Stock Alert</p>
                  <p className="text-[11px] text-slate-500">AirPods Pro (2nd Gen) has only 1 unit left</p>
                  <span className="text-[10px] text-amber-600 font-medium">1 hour ago</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                  <p className="font-semibold text-slate-800">New Customer Registered</p>
                  <p className="text-[11px] text-slate-500">Ahmed Khan joined from Lahore</p>
                  <span className="text-[10px] text-emerald-600 font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-100">
              AD
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">Admin</span>
              <span className="text-[10px] text-slate-500">Super Admin</span>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2.5 border-b border-slate-100">
                <p className="font-bold text-slate-900">Admin Account</p>
                <p className="text-[11px] text-slate-500 truncate">admin@bluebells.pk</p>
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Supabase Connected
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>View Storefront</span>
                </Link>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
