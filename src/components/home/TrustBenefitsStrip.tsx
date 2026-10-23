'use client';

import React from 'react';
import {
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  CreditCard,
  Headphones,
} from 'lucide-react';

interface BenefitItem {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
}

const BENEFITS: BenefitItem[] = [
  {
    id: 1,
    icon: ShieldCheck,
    title: '100% Original Products',
    subtitle: 'PTA Approved IMEI',
  },
  {
    id: 2,
    icon: Award,
    title: 'Official Warranty',
    subtitle: 'Brand Replacement Support',
  },
  {
    id: 3,
    icon: Truck,
    title: 'Fast & Secure Delivery',
    subtitle: 'Insured Transit Pakistan',
  },
  {
    id: 4,
    icon: RotateCcw,
    title: '14 Days Easy Return',
    subtitle: 'Hassle-Free Exchange',
  },
  {
    id: 5,
    icon: CreditCard,
    title: 'Cash on Delivery',
    subtitle: 'Pay at Your Doorstep',
  },
  {
    id: 6,
    icon: Headphones,
    title: '24/7 Customer Support',
    subtitle: 'WhatsApp & Call Assistance',
  },
];

export const TrustBenefitsStrip: React.FC = () => {
  return (
    <section
      aria-label="Trust and Reliability Guarantees"
      className="w-full bg-white border-b border-[#DFEBF8] py-3.5 sm:py-5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: 6 items in single row with vertical dividers; Mobile: smooth scrollable row */}
        <div className="flex md:grid md:grid-cols-6 items-center justify-between overflow-x-auto md:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden divide-x-0 md:divide-x divide-[#DFEBF8] gap-4 sm:gap-6 md:gap-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {BENEFITS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 sm:gap-3 px-3 lg:px-4 py-1 flex-shrink-0 group"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F2F8FF] group-hover:bg-[#0878F9] text-[#0878F9] group-hover:text-white flex items-center justify-center transition-all duration-200 flex-shrink-0 border border-[#DFEBF8]">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#102A56] group-hover:text-[#0878F9] transition-colors whitespace-nowrap">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-[#8394AB] font-medium hidden lg:block truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
