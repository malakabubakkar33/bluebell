'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Store, ShieldCheck } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminLogoutButton } from './AdminLogoutButton';
import { AdminOrderNotification } from './AdminOrderNotification';

interface AdminLayoutShellProps {
  children: React.ReactNode;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const AdminLayoutShell: React.FC<AdminLayoutShellProps> = ({ children, user }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 5-Minute Inactivity & Reopen Security Guard
  useEffect(() => {
    const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    const lastActiveStr = localStorage.getItem('bluebell_admin_last_active');

    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (!isNaN(lastActive) && now - lastActive > INACTIVITY_TIMEOUT_MS) {
        // Tab closed or inactive for > 5 minutes: force re-authentication
        localStorage.removeItem('bluebell_admin_last_active');
        fetch('/api/admin/auth/logout', { method: 'POST' }).finally(() => {
          window.location.href = '/admin/login?error=session_timeout';
        });
        return;
      }
    }

    // Refresh active session timestamp
    localStorage.setItem('bluebell_admin_last_active', now.toString());

    let lastRecorded = now;
    const updateActivity = () => {
      const cur = Date.now();
      if (cur - lastRecorded > 4000) {
        lastRecorded = cur;
        localStorage.setItem('bluebell_admin_last_active', cur.toString());
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    // Periodic check every 10 seconds while tab is open
    const interval = setInterval(() => {
      const curStr = localStorage.getItem('bluebell_admin_last_active');
      if (curStr) {
        const curTime = parseInt(curStr, 10);
        if (!isNaN(curTime) && Date.now() - curTime > INACTIVITY_TIMEOUT_MS) {
          clearInterval(interval);
          localStorage.removeItem('bluebell_admin_last_active');
          fetch('/api/admin/auth/logout', { method: 'POST' }).finally(() => {
            window.location.href = '/admin/login?error=session_timeout';
          });
        }
      }
    }, 10000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F7FBFF] text-[#102A50] selection:bg-[#0866E8] selection:text-white print:bg-white print:text-black print:block print:p-0">
      {/* Sidebar (Desktop persistent, Mobile drawer) */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        adminName={user.name}
        adminEmail={user.email}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 print:w-full print:block">
        {/* Top Professional Admin Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-[#DCEBFA] shadow-xs print:hidden">
          <div className="px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Mobile hamburger & breadcrumb title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#DCEBFA] text-[#102A50] hover:bg-[#EDF6FF] transition-colors"
                aria-label="Open navigation sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#102A50]">
                  Blue Bells Mobile Shop
                </span>
                <span className="text-[10px] font-mono font-bold text-[#0866E8]">
                  Production Administration Portal
                </span>
              </div>
            </div>

            {/* Right: Storefront, Admin Badge, and Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Storefront Link */}
              <Link
                href="/"
                target="_blank"
                title="Open Live Customer Storefront"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DCEBFA] bg-white hover:bg-[#EDF6FF] text-xs font-semibold text-[#102A50] hover:text-[#0866E8] transition-colors shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-[#0866E8]" />
                <span className="hidden sm:inline">Storefront</span>
              </Link>

              {/* Live Order Audio & Notification Bell */}
              <AdminOrderNotification />

              {/* Admin Profile Chip */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EDF6FF] border border-[#DCEBFA]">
                <div className="w-6 h-6 rounded-full bg-[#0866E8] text-white flex items-center justify-center text-xs font-black shadow-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left leading-tight pr-1">
                  <span className="text-xs font-bold text-[#102A50] truncate max-w-[130px]">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-[#0866E8] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Verified Admin</span>
                  </span>
                </div>
              </div>

              {/* Secure Logout Trigger */}
              <AdminLogoutButton />
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none print:w-full print:block">
          {children}
        </main>

        {/* Professional Footer */}
        <footer className="border-t border-[#DCEBFA] bg-white py-4 px-4 sm:px-8 text-center text-xs text-[#647A98] print:hidden">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              &copy; {new Date().getFullYear()} Blue Bells Mobile Shop &bull; Admin Console (Phase 3 Verified)
            </span>
            <span className="text-[11px] font-mono text-[#0866E8]">
              Authoritative Supabase PostgreSQL &bull; RBAC Active
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};
