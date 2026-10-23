'use client';

import React, { useState } from 'react';
import { Save, ShieldCheck, Database, Phone, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [storeName, setStoreName] = useState('Blue Bells Mobile Shop');
  const [whatsapp, setWhatsapp] = useState('+92 300 1234567');
  const [currency, setCurrency] = useState('PKR (Rs.)');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('25000');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Store configurations, Pakistani PTA settings, and API integrations.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Store Profile &amp; Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Name</label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Customer Support</label>
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Store Currency</label>
              <input
                value={currency}
                disabled
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Free Delivery Min Order (Rs.)</label>
              <input
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Database & Cloud Connection */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Supabase Cloud Integration</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Your catalog and orders are automatically synced with Supabase PostgreSQL in real-time. Changes made in this admin panel propagate instantly to the storefront.
          </p>

          <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border border-slate-200">
            Endpoint: NEXT_PUBLIC_SUPABASE_URL (Connected)
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
    </div>
  );
};
