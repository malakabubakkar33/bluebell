'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  MessageCircle,
  Package,
  Calendar,
  ShieldCheck,
  LogOut,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-50">
        <PageHeader title="My Account" />
        <div className="max-w-md mx-auto my-auto text-center py-20 px-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Account Required</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please sign in to view your orders, saved addresses, and profile details.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all"
          >
            <span>Sign In / Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#f8faff]">
      <PageHeader title="My Account" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 w-full flex-1">
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-brand-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-brand-700">
                  {user.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Enter Admin Panel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600 bg-white text-xs font-bold transition-all shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Contact & Security Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-500" />
                <span>Contact Details</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Email</span>
                    <span className="text-xs font-bold text-slate-800 break-all">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">Mobile Phone</span>
                    <span className="text-xs font-bold text-slate-800">{user.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">WhatsApp</span>
                    <span className="text-xs font-bold text-slate-800">{user.whatsapp}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warranty & Guarantee Card */}
            <div className="bg-gradient-to-br from-brand-600 to-blue-500 rounded-3xl p-6 text-white shadow-lg shadow-brand-500/20">
              <div className="flex items-center gap-2.5 mb-3">
                <ShieldCheck className="w-5 h-5 text-blue-200" />
                <h4 className="text-sm font-black">Official PTA Verified</h4>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed mb-4">
                All phones purchased at Blue Bell Mobile Shop come with 1 Year Official Warranty and genuine sealed packaging.
              </p>
              <Link
                href="/products"
                className="inline-block px-4 py-2 rounded-xl bg-white text-brand-600 font-bold text-xs hover:bg-blue-50 transition-colors shadow-sm"
              >
                Browse Latest Flagships
              </Link>
            </div>
          </div>

          {/* Right Column: Order History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-500" />
                  <span>My Orders &amp; Shipments</span>
                </h3>
                <Link
                  href="/track-order"
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  Track By Tracking ID
                </Link>
              </div>

              {/* Sample Order Entry */}
              <div className="space-y-4">
                <div className="border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-blue-200 transition-colors bg-[#fbfdff]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-600">ORD-98241</span>
                      <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                        Placed on Oct 20, 2026
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Delivered</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center">
                        <img src="/categories/iphone.svg" alt="iPhone" className="w-9 h-9 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Apple iPhone 15 Pro Max</h4>
                        <p className="text-[11px] text-slate-500">256GB • Natural Titanium (Qty: 1)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">Rs. 349,999</span>
                      <span className="text-[11px] text-slate-400">Cash on Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Additional Sample Order */}
                <div className="border border-slate-100 rounded-2xl p-4 sm:p-5 hover:border-blue-200 transition-colors bg-[#fbfdff]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-600">ORD-98242</span>
                      <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                        Placed on Oct 21, 2026
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-brand-800 self-start sm:self-auto">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-1 flex items-center justify-center">
                        <img src="/categories/samsung.svg" alt="Samsung" className="w-9 h-9 object-contain" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">Samsung Galaxy S24 Ultra</h4>
                        <p className="text-[11px] text-slate-500">512GB • Titanium Violet (Qty: 1)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">Rs. 289,999</span>
                      <span className="text-[11px] text-slate-400">Direct Bank Transfer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
