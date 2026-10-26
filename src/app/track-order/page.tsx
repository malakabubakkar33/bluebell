'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BrandLogo } from '@/components/common/BrandLogo';
import { BlueDotLoader } from '@/components/common/BlueDotLoader';

function TrackOrderContent() {
  const router = useRouter();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 md:py-12">
      {/* Mobile Top App Bar */}
      <div className="md:hidden flex items-center justify-between pb-4 mb-4 border-b border-brand-border">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-brand-dark hover:bg-white transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <BrandLogo variant="header" />
        <div className="w-9" />
      </div>

      <div className="text-center max-w-lg mx-auto mb-8">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-brand-light px-3 py-1 rounded-full">
          Live Logistics Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-dark tracking-tight mt-2">
          Track Your Mobile Order
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Enter your Order ID (e.g. ORD-98241) or phone number to check live order and delivery status.
        </p>
      </div>

      {/* Tracking Search Input */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-brand-border shadow-xs focus-within:border-brand-primary">
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. ORD-98241)"
            className="flex-1 px-4 py-2.5 text-base sm:text-sm text-brand-dark placeholder:text-brand-muted/70 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="font-bold text-xs animate-pulse">Searching...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="max-w-xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2.5 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Status Display */}
      {orderData && (
        <div className="bg-white rounded-3xl border border-brand-border shadow-sm p-5 sm:p-8 space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-5 border-b border-brand-border/60">
            <div>
              <span className="text-[11px] text-brand-muted font-medium">Order Reference:</span>
              <h2 className="text-lg font-bold text-brand-dark font-mono">{orderData.id}</h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Recipient: <strong className="text-brand-dark">{orderData.customer_name}</strong> • {orderData.city}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {orderData.status}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-2">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.label} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                        isCurrent
                          ? 'bg-brand-primary text-white ring-4 ring-brand-primary/20 scale-105'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-brand-surface text-brand-muted'
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-brand-dark">{step.label}</span>
                    <span className="text-[10px] text-brand-muted mt-0.5">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items & Shipping Address Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-brand-border/60">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">
                Items in Package
              </h4>
              <div className="space-y-2 bg-brand-surface/50 p-3.5 rounded-2xl border border-brand-border/60">
                {Array.isArray(orderData.items) ? (
                  orderData.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-semibold text-brand-dark">{item.name}</span>
                        <span className="text-brand-muted text-[11px] block">
                          Qty: {item.quantity} {item.selectedStorage ? `• ${item.selectedStorage}` : ''}
                        </span>
                      </div>
                      <span className="font-bold text-brand-dark">Rs. {((item.price || 0) * item.quantity).toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-brand-muted">Order package items verified.</span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-dark mb-2">
                Courier Destination
              </h4>
              <div className="bg-brand-surface/50 p-3.5 rounded-2xl border border-brand-border/60 text-xs space-y-1 text-brand-muted">
                <p>
                  <strong className="text-brand-dark">{orderData.customer_name}</strong> ({orderData.customer_phone})
                </p>
                <p>{orderData.shipping_address}</p>
                <p>{orderData.city}, Pakistan</p>
                <p className="pt-1 text-[11px] text-brand-dark font-medium">
                  Payment Mode: <span className="font-bold uppercase text-brand-primary">{orderData.payment_method}</span>
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
    <main className="min-h-screen flex flex-col bg-brand-surface/20 w-full max-w-full overflow-x-hidden pb-20 md:pb-0">
      <Header />
      <Suspense fallback={<BlueDotLoader fullScreen={false} label="Loading Tracker..." size="sm" />}>
        <TrackOrderContent />
      </Suspense>
      <Footer />
    </main>
  );
}
