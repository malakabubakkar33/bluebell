'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Settings,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { user, logout, isAdmin, updateProfile } = useAuth();
  const { wishlist } = useCart();

  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'edit_profile'>('menu');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || '',
    city: user?.city || 'Peshawar',
    address: user?.address || '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Fetch live orders for this customer from database
  React.useEffect(() => {
    if (user?.email) {
      setOrdersLoading(true);
      fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setUserOrders(res.data);
          }
        })
        .catch((err) => console.error('Failed to load user orders:', err))
        .finally(() => setOrdersLoading(false));
    }
  }, [user?.email]);

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
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('menu');
    }, 1500);
  };

  // Unauthenticated State
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-light/30 flex flex-col justify-center items-center px-4 py-12">
        <div className="w-full max-w-[430px] bg-white rounded-3xl shadow-sm border border-brand-border/60 p-8 text-center">
          <div className="flex justify-center mb-6">
            <BrandLogo variant="header" />
          </div>
          <div className="w-16 h-16 rounded-full bg-brand-light text-brand-primary flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Welcome to Blue Bells</h1>
          <p className="text-sm text-brand-muted mb-6">
            Sign in to access your orders, saved addresses, wishlist, and warranty status.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-brand-deep text-white font-bold text-sm shadow-md shadow-brand-primary/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-brand-surface text-brand-muted hover:text-brand-dark text-xs font-semibold block transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-light/30 pb-24 md:pb-12">
      {/* Container matching Screen 8 */}
      <div className="max-w-[480px] md:max-w-3xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Top App Bar matching Screen 8 */}
        <div className="flex items-center justify-between py-2 mb-4">
          <button
            onClick={() => {
              if (activeTab !== 'menu') {
                setActiveTab('menu');
              } else {
                router.back();
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-dark hover:bg-white transition-colors"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <BrandLogo variant="header" />

          <button
            onClick={() => setActiveTab(activeTab === 'edit_profile' ? 'menu' : 'edit_profile')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-brand-muted hover:text-brand-dark hover:bg-white transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Section */}
        <div className="flex flex-col items-center text-center my-4">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center text-brand-primary text-2xl font-bold shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
          <h2 className="text-xl font-bold text-brand-dark tracking-tight">{user.name}</h2>
          <p className="text-xs text-brand-muted mt-0.5">{user.email}</p>
          <button
            onClick={() => setActiveTab(activeTab === 'edit_profile' ? 'menu' : 'edit_profile')}
            className="mt-3 px-4 py-1.5 rounded-full border border-brand-border bg-white text-xs font-semibold text-brand-primary hover:bg-brand-surface shadow-xs transition-colors cursor-pointer"
          >
            {activeTab === 'edit_profile' ? 'View Menu' : 'Edit Profile'}
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark text-white text-[11px] font-bold shadow-xs hover:bg-black transition-colors"
            >
              <span>Admin Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* 3-Column Stats Row matching Screen 8 */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <button
            onClick={() => setActiveTab('orders')}
            className="bg-white rounded-2xl p-3 border border-brand-border/60 text-center shadow-xs hover:border-brand-primary/40 transition-all cursor-pointer"
          >
            <span className="block text-lg font-bold text-brand-dark">{userOrders.length}</span>
            <span className="text-[11px] font-medium text-brand-muted">Orders</span>
          </button>

          <Link
            href="/wishlist"
            className="bg-white rounded-2xl p-3 border border-brand-border/60 text-center shadow-xs hover:border-brand-primary/40 transition-all block"
          >
            <span className="block text-lg font-bold text-brand-primary">{wishlist.length}</span>
            <span className="text-[11px] font-medium text-brand-muted">Wishlist</span>
          </Link>

          <div className="bg-white rounded-2xl p-3 border border-brand-border/60 text-center shadow-xs">
            <span className="block text-lg font-bold text-brand-dark">Rs. 0</span>
            <span className="text-[11px] font-medium text-brand-muted">Wallet</span>
          </div>
        </div>

        {/* Active Tab View */}
        {activeTab === 'edit_profile' ? (
          <div className="bg-white rounded-3xl border border-brand-border/60 p-6 shadow-sm mb-6 animate-fadeIn">
            <h3 className="text-base font-bold text-brand-dark mb-4">Edit Profile</h3>

            {saveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-base text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-base text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-base text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-base text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-base text-brand-dark focus:outline-none focus:border-brand-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-primary text-white font-bold text-xs rounded-xl shadow-sm hover:bg-brand-deep transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('menu')}
                  className="px-4 py-2.5 border border-brand-border text-brand-muted hover:text-brand-dark text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="bg-white rounded-3xl border border-brand-border/60 p-5 shadow-sm mb-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60 mb-4">
              <h3 className="text-base font-bold text-brand-dark flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-primary" />
                <span>My Orders</span>
              </h3>
              <Link href="/track-order" className="text-xs font-bold text-brand-primary hover:underline">
                Track by ID
              </Link>
            </div>

            {ordersLoading ? (
              <div className="py-8 text-center text-xs text-brand-muted">Loading your orders...</div>
            ) : userOrders.length === 0 ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-brand-light text-brand-primary flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-brand-dark">No orders placed yet</p>
                <p className="text-[11px] text-brand-muted mt-1 max-w-xs mx-auto">
                  When you purchase items from Blue Bells Mobile Shop, your orders will appear here.
                </p>
                <Link
                  href="/products"
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-deep transition-colors"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {userOrders.map((order) => {
                  const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
                    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
                    confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', icon: CheckCircle2 },
                    processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: Clock },
                    shipped: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Clock },
                    delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle2 },
                    cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', icon: AlertCircle },
                  };
                  const statusConf = statusColors[order.status] || statusColors.pending;
                  const StatusIcon = statusConf.icon;

                  return (
                    <div
                      key={order.id}
                      className="border border-brand-border/70 rounded-2xl p-4 bg-brand-surface/40 hover:border-brand-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-brand-primary">{order.id}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusConf.bg} ${statusConf.text} capitalize`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{order.status}</span>
                        </span>
                      </div>
                      <div className="text-xs text-brand-dark font-semibold">
                        {order.items && order.items.length > 0
                          ? order.items
                              .map((it: any) => `${it.product?.name || it.name || 'Product'} (x${it.quantity || 1})`)
                              .join(', ')
                          : 'Order items'}
                      </div>
                      {order.shipping_address && (
                        <div className="text-[11px] text-brand-muted mt-0.5">
                          {order.shipping_address}, {order.city || ''}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/50 text-xs">
                        <span className="text-brand-muted">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString('en-PK', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-brand-dark">
                            Rs. {Number(order.total || 0).toLocaleString()}
                          </span>
                          <Link
                            href={`/track-order?id=${order.id}`}
                            className="text-[11px] font-bold text-brand-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>Track</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Menu List matching Screen 8 */
          <div className="bg-white rounded-3xl border border-brand-border/60 shadow-sm overflow-hidden mb-6">
            <div className="divide-y divide-brand-border/40">
              {/* My Orders */}
              <button
                onClick={() => setActiveTab('orders')}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-surface transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <Package className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">My Orders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-dark transition-colors" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-surface transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">Wishlist</span>
                </div>
                <div className="flex items-center gap-2">
                  {wishlist.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary text-white">
                      {wishlist.length}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-dark transition-colors" />
                </div>
              </Link>

              {/* Addresses */}
              <button
                onClick={() => setActiveTab('edit_profile')}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-surface transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">Addresses</span>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-dark transition-colors" />
              </button>

              {/* Wallet */}
              <div className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-surface transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">Wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-muted font-medium">Rs. 0</span>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-dark transition-colors" />
                </div>
              </div>

              {/* Settings */}
              <button
                onClick={() => setActiveTab('edit_profile')}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-surface transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <Settings className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-dark transition-colors" />
              </button>

              {/* Privacy & Security */}
              <Link
                href="/privacy"
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-surface transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">Privacy &amp; Security</span>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-dark transition-colors" />
              </Link>

              {/* Help & Support */}
              <Link
                href="/contact"
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-surface transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-brand-dark">Help &amp; Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-dark transition-colors" />
              </Link>

              {/* Log Out */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-rose-50/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-rose-600">Log Out</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
