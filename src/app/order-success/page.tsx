'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Truck, MessageSquare, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { BrandLogo } from '@/components/common/BrandLogo';

import { AnimatedSuccessTick } from '@/components/common/AnimatedSuccessTick';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'BB-849102';
  const trackingNumber = searchParams.get('track') || 'TRK-90412849';
  const customerName = searchParams.get('name') || 'Valued Customer';
  const total = searchParams.get('total') || '0';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <AnimatedSuccessTick
        orderId={orderId}
        trackingNumber={trackingNumber}
        customerName={customerName}
        total={total}
        showContinueButton={true}
      />
    </div>
  );
}

import { BlueDotLoader } from '@/components/common/BlueDotLoader';

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden">
      <PageHeader title="Order Confirmed" />
      <Suspense fallback={<BlueDotLoader fullScreen={false} label="Loading Order..." size="sm" />}>
        <OrderSuccessContent />
      </Suspense>
      <Footer />
    </main>
  );
}
