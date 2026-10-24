'use client';

import React, { useState } from 'react';
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
  const { user, logout, isAdmin, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    city: user?.city || 'Peshawar',
    address: user?.address || '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
        city: user.city || 'Peshawar',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);

    if (!formData.name.trim()) {
      setSaveError('Please enter your full name.');
      return;
    }

    updateProfile({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      whatsapp: formData.whatsapp.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
    });

    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden">
        <PageHeader title="My Account" />
        <div className="max-w-md mx-auto my-auto text-center py-20 px-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Account Required</h2>
          <p className="text-sm text-slate-500 mb-6">
            Please sign in to view your orders, saved addresses, and profile details.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition-all"
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
    <main className="min-h-screen flex flex-col bg-[#f8faff] w-full max-w-full overflow-x-hidden">
      <PageHeader title="My Account" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 md:py-12 w-full flex-1">
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-sky-500/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-sky-50 text-sky-600 border border-sky-100">
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all"
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

        {/* Feedback Alert for Profile Update */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Profile information successfully updated and synced with your account!</span>
          </div>
        )}

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Contact & Editable Profile Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-500" />
                  <span>Profile Information</span>
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
                  {saveError && (
                    <p className="text-rose-600 font-bold text-[11px]">{saveError}</p>
                  )}
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-base sm:text-xs outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-base sm:text-xs outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-base sm:text-xs outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-base sm:text-xs outline-none focus:border-sky-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street, House No, Area"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-base sm:text-xs outline-none focus:border-sky-500 focus:bg-white resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email</span>
                      <span className="text-xs font-bold text-slate-800 break-all">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Phone</span>
                      <span className="text-xs font-bold text-slate-800">{user.phone || 'Not added'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp</span>
                      <span className="text-xs font-bold text-slate-800">{user.whatsapp || 'Not added'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">City &amp; Address</span>
                      <span className="text-xs font-bold text-slate-800 block">
                        {user.city || 'Peshawar'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {user.address || 'No saved delivery address'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Warranty & Guarantee Card */}
            <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl p-6 text-white shadow-lg shadow-sky-500/20">
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-200" />
                <h4 className="text-sm font-black">Official PTA Verified</h4>
              </div>
              <p className="text-xs text-sky-100 leading-relaxed mb-4">
                All devices purchased from Blue Bell Mobile Shop come with 1 Year Official Brand Warranty and authentic sealed box packaging.
              </p>
              <Link
                href="/products"
                className="inline-block px-4 py-2 rounded-xl bg-white text-sky-600 font-bold text-xs hover:bg-sky-50 transition-colors shadow-sm"
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
