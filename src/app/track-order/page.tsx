'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [orderQuery, setOrderQuery] = useState(initialId);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrderData(data.data);
      } else {
        setOrderData(null);
        setError('No order found with this Reference ID. Please check your tracking number and try again.');
      }
    } catch (err: any) {
      setOrderData(null);
      setError('Failed to query order tracking server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderQuery);
  };

  const steps = [
    { label: 'Order Placed', statusKey: 'pending', desc: 'Received & Queued' },
    { label: 'Confirmed', statusKey: 'confirmed', desc: 'PTA & Stock Verified' },
    { label: 'Processing', statusKey: 'processing', desc: 'Sealed & Packaged' },
    { label: 'Dispatched', statusKey: 'shipped', desc: 'With Courier Partner' },
    { label: 'Delivered', statusKey: 'delivered', desc: 'Handed to Customer' },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'pending':
        return 0;
      case 'confirmed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStep = orderData ? getStepIndex(orderData.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 md:py-16">
      <div className="text-center max-w-lg mx-auto mb-10">
        <span className="text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
          Live Logistics Portal
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
          Track Your Mobile Order
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your Blue Bells Order ID (e.g. BB-98241) to check live packaging, courier status, and estimated delivery.
        </p>
      </div>

      {/* Tracking Search Input */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10">
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. BB-98241 or BB-98242)"
            className="flex-1 px-4 py-2.5 text-base sm:text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-brand-500/20"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Track</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Status Display */}
      {orderData && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10 space-y-8 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs text-slate-400 font-semibold">Order Reference:</span>
              <h2 className="text-xl font-black text-slate-900 font-mono">{orderData.id}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recipient: <strong className="text-slate-800">{orderData.customer_name}</strong> • {orderData.city}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Tracking Number</span>
                <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md">
                  {orderData.tracking_number || 'TRK-PENDING'}
                </span>
              </div>
              <span className="text-xs font-black uppercase px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {orderData.status}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-4">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.label} className="flex flex-col items-center text-center relative">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-500/20 scale-110 shadow-md'
                          : isPassed
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{step.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items & Shipping Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Items in Package
              </h4>
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {Array.isArray(orderData.items) ? (
                  orderData.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-slate-400 text-[11px] block">
                          Qty: {item.quantity} {item.selectedStorage ? `• ${item.selectedStorage}` : ''}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">${item.price * item.quantity}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">Order package items verified.</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                Courier Destination
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                <p>
                  <strong className="text-slate-900">{orderData.customer_name}</strong> ({orderData.customer_phone})
                </p>
                <p>{orderData.shipping_address}</p>
                <p>{orderData.city}, {orderData.province} {orderData.postal_code || ''}</p>
                <p className="pt-2 text-slate-400 text-[11px]">
                  Payment Mode: <span className="font-bold uppercase text-slate-700">{orderData.payment_method}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden">
      <PageHeader title="Track Order" />
      <Suspense fallback={<div className="p-12 text-center text-sm">Loading tracker...</div>}>
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </main>
  );
}
