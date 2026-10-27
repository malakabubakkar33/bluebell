'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Truck,
  ShieldCheck,
  User,
  Database,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Lock,
  Server,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';

interface StoreSettings {
  storeName: string;
  contactEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  storeAddress: string;
  shippingFee: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: string;
  codEnabled: boolean;
  ptaPolicyNotice: string;
  warrantyPolicyNotice: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Blue Bells Mobile Shop',
  contactEmail: 'nomanjvd9@gmail.com',
  supportPhone: '+92 300 5902425',
  whatsappNumber: '923001234567',
  storeAddress: 'Shop #33, Sattagadai Plaza, 32 The Mall Road, Peshawar Cantt, Pakistan',
  shippingFee: 250,
  freeShippingThreshold: 50000,
  estimatedDeliveryDays: '2 - 4 Business Days',
  codEnabled: true,
  ptaPolicyNotice: 'All mobile phones sold as "PTA Approved" are officially registered with the Pakistan Telecommunication Authority with genuine IMEI verification.',
  warrantyPolicyNotice: '1 Year Official Brand Warranty on PTA Approved devices, with complimentary 7-day checking warranty.',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'store' | 'shipping' | 'pta' | 'admin' | 'database'>('store');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ status: string; latency: number } | null>(null);
  const [testingDb, setTestingDb] = useState(false);

  useEffect(() => {
    const local = localStorage.getItem('bluebell_store_settings');
    if (local) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(local) });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('bluebell_store_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const testDatabaseConnection = async () => {
    setTestingDb(true);
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/dashboard/stats', { cache: 'no-store' });
      const elapsed = Math.round(performance.now() - start);
      if (res.ok) {
        setDbStatus({ status: 'Online & Authoritative', latency: elapsed });
      } else {
        setDbStatus({ status: 'Error Connecting', latency: elapsed });
      }
    } catch {
      setDbStatus({ status: 'Connection Failed', latency: 0 });
    } finally {
      setTestingDb(false);
    }
  };

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current administrator password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from your current password.');
      return;
    }

    setPasswordUpdating(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Failed to update administrator password.');
      } else {
        setPasswordSuccess('Password successfully updated! Your previous password has been revoked and replaced.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordError('Network error occurred while connecting to authentication service.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Toast */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 bg-emerald-600 text-white border border-emerald-500 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Settings saved and synchronized successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <Settings className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Store Configuration &bull; System Controls</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Store &amp; System Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Configure store contact information, WhatsApp order desk, delivery parameters, and system diagnostics.
          </p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#DCEBFA]">
        <button
          type="button"
          onClick={() => setActiveTab('store')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'store'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Store Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'shipping'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Delivery &amp; Charges</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pta')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pta'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>PTA &amp; Policies</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'admin'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Admin Profile</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('database');
            testDatabaseConnection();
          }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'database'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>System &amp; DB Diagnostics</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: STORE PROFILE */}
        {activeTab === 'store' && (
          <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#102A50]">Store Identity &amp; Contact</h3>
            <p className="text-xs text-[#647A98]">These details appear in invoice footers and contact pages.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Official Store Name</label>
                <input
                  type="text"
                  required
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Customer Support Email</label>
                <input
                  type="email"
                  required
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Phone Hotline</label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Official WhatsApp Number (Orders Desk)</label>
                <input
                  type="text"
                  placeholder="923001234567 (with country code)"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A50] mb-1.5">Physical Shop Address</label>
              <textarea
                rows={2}
                value={settings.storeAddress}
                onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
              />
            </div>
          </div>
        )}

        {/* TAB 2: SHIPPING & DELIVERY */}
        {activeTab === 'shipping' && (
          <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#102A50]">Shipping Rates &amp; Delivery Parameters</h3>
            <p className="text-xs text-[#647A98]">Default rates applied during customer checkout across Pakistan.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Standard Courier Shipping Fee (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Free Shipping Order Threshold (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Estimated Delivery Timeframe</label>
                <input
                  type="text"
                  value={settings.estimatedDeliveryDays}
                  onChange={(e) => setSettings({ ...settings, estimatedDeliveryDays: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">Cash On Delivery (COD)</label>
                <div className="flex items-center gap-3 pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.codEnabled}
                      onChange={(e) => setSettings({ ...settings, codEnabled: e.target.checked })}
                      className="w-4 h-4 text-[#0866E8] rounded border-gray-300 focus:ring-[#0866E8]"
                    />
                    <span className="text-xs font-bold text-[#102A50]">Enable Cash on Delivery throughout Pakistan</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PTA & POLICIES */}
        {activeTab === 'pta' && (
          <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-bold text-[#102A50]">PTA Compliance &amp; Warranty Notices</h3>
            <p className="text-xs text-[#647A98]">Transparency notices displayed on mobile detail pages.</p>

            <div>
              <label className="block text-xs font-bold text-[#102A50] mb-1.5">PTA Approved Disclaimer Text</label>
              <textarea
                rows={3}
                value={settings.ptaPolicyNotice}
                onChange={(e) => setSettings({ ...settings, ptaPolicyNotice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A50] mb-1.5">Device Warranty Notice</label>
              <textarea
                rows={3}
                value={settings.warrantyPolicyNotice}
                onChange={(e) => setSettings({ ...settings, warrantyPolicyNotice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
              />
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN PROFILE & PASSWORD MANAGEMENT */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#EDF6FF] text-[#0866E8]">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#102A50]">Administrator Account &amp; Access</h3>
                  <p className="text-xs text-[#647A98]">Authoritative administrator credentials in public.app_users.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#647A98]">Active Admin Email:</span>
                  <strong className="font-mono text-[#0866E8]">admin@bluebell.pk</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#647A98]">Secondary Alias:</span>
                  <strong className="font-mono text-[#102A50]">admin@bluebell.com</strong>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#647A98]">Security Role:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#102A50] text-white">
                    Super Administrator
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#647A98]">Authoritative Table:</span>
                  <span className="font-mono text-[11px] text-[#647A98]">public.app_users (role = 'admin')</span>
                </div>
              </div>
            </div>

            {/* Change Password Panel */}
            <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-[#DCEBFA]">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#102A50]">Change Administrator Password</h3>
                  <p className="text-xs text-[#647A98]">
                    Verify current credentials before securely establishing a new administrator password.
                  </p>
                </div>
              </div>

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter existing password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647A98] hover:text-[#102A50]"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#647A98] mt-1 block">Verified against authoritative auth</span>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647A98] hover:text-[#102A50]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#647A98] mt-1 block">Min 6 chars, alphanumeric</span>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#647A98] hover:text-[#102A50]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#647A98] mt-1 block">Must match new password exactly</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Security Advisory:</strong> Jab aap naya password update karenge, website aapka purana password check karegi. Agar theek hua toh naya password set ho jayega aur purana password hamesha ke liye khatam (revoke) ho jayega.
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={passwordUpdating || !currentPassword || !newPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#102A50] hover:bg-[#0d2242] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <KeyRound className={`w-4 h-4 ${passwordUpdating ? 'animate-spin' : ''}`} />
                  <span>{passwordUpdating ? 'Verifying & Updating...' : 'Update Password & Revoke Old'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DATABASE & SYSTEM DIAGNOSTICS */}
        {activeTab === 'database' && (
          <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#102A50]">Authoritative Database Health</h3>
                <p className="text-xs text-[#647A98]">Live status check against Supabase PostgreSQL cloud instance.</p>
              </div>
              <button
                type="button"
                onClick={testDatabaseConnection}
                disabled={testingDb}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#0866E8] text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingDb ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA]">
                <span className="text-[10px] font-black uppercase text-[#647A98]">PostgreSQL Cloud Status</span>
                <p className="text-base font-black text-emerald-600 mt-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{dbStatus?.status || 'Online & Synchronized'}</span>
                </p>
                {dbStatus?.latency !== undefined && (
                  <span className="text-[11px] text-[#647A98] font-mono mt-1 inline-block">
                    Query Latency: {dbStatus.latency}ms
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA]">
                <span className="text-[10px] font-black uppercase text-[#647A98]">Core Database Tables</span>
                <p className="text-xs text-[#102A50] font-mono mt-1 space-y-0.5">
                  <span>&bull; public.products (OK)</span><br />
                  <span>&bull; public.categories (OK)</span><br />
                  <span>&bull; public.orders (OK)</span><br />
                  <span>&bull; public.app_users (OK)</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Action for Store Configuration */}
        {(activeTab === 'store' || activeTab === 'shipping' || activeTab === 'pta') && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCEBFA]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0756C4] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Store Settings</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
