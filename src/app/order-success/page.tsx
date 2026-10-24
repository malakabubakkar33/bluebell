'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, MessageSquare, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { BrandLogo } from '@/components/common/BrandLogo';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'BB-849102';
  const trackingNumber = searchParams.get('track') || 'TRK-90412849';
  const customerName = searchParams.get('name') || 'Valued Customer';
  const total = searchParams.get('total') || '1199';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-8 sm:p-12 text-center">
        {/* Celebration Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          Order Successfully Placed
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
          Thank You, {customerName}!
        </h1>

        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          Your order has been recorded in our system. Our dispatch team is preparing your official sealed package for dispatch.
        </p>

        {/* Order Details Card */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3.5 max-w-lg mx-auto">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
            <span className="font-semibold text-slate-500">Order Reference ID:</span>
            <span className="font-black text-brand-600 font-mono text-sm">{orderId}</span>
          </div>

          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
            <span className="font-semibold text-slate-500">Courier Tracking Number:</span>
            <span className="font-black text-slate-900 font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
              {trackingNumber}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-200">
            <span className="font-semibold text-slate-500">Total Payable:</span>
            <span className="font-black text-slate-900 text-sm">${total}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-500">Estimated Delivery:</span>
            <span className="font-bold text-slate-800">2 - 4 Business Days</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link
            href={`/track-order?id=${orderId}`}
            className="w-full sm:w-auto px-6 py-3 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>

          <a
            href={`https://wa.me/923001234567?text=${encodeURIComponent(
              `Hi Blue Bells Mobile Shop, I just placed order ${orderId}. Can you please confirm the dispatch timeline?`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Support</span>
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>Includes Official Blue Bells Warranty Card & Sales Tax Invoice</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden">
      <PageHeader title="Order Confirmed" />
      <Suspense fallback={<div className="p-12 text-center text-sm">Loading order details...</div>}>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
