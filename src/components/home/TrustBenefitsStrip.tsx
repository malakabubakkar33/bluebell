'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  Truck,
  RotateCcw,
  CreditCard,
  Headphones,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BenefitItem {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}

const BENEFITS: BenefitItem[] = [
  {
    id: 1,
    icon: ShieldCheck,
    title: '100% Original Products',
    subtitle: 'PTA Approved IMEI Guaranteed',
  },
  {
    id: 2,
    icon: Award,
    title: 'Official Warranty',
    subtitle: 'Authorized Brand Replacement',
  },
  {
    id: 3,
    icon: Truck,
    title: 'Fast & Secure Delivery',
    subtitle: 'Insured Transit Across Pakistan',
  },
  {
    id: 4,
    icon: RotateCcw,
    title: '14 Days Easy Return',
    subtitle: 'Hassle-Free Exchange Policy',
  },
  {
    id: 5,
    icon: CreditCard,
    title: 'Cash on Delivery',
    subtitle: 'Pay Safely at Your Doorstep',
  },
  {
    id: 6,
    icon: Headphones,
    title: '24/7 Customer Support',
    subtitle: 'Dedicated WhatsApp Helpline',
  },
  {
    id: 7,
    icon: Sparkles,
    title: 'Best Price Guarantee',
    subtitle: 'Verified Market-Leading Rates',
  },
  {
    id: 8,
    icon: CheckCircle2,
    title: 'Pre-Activated Safety',
    subtitle: 'Factory Sealed Brand Pack',
  },
];

export const TrustBenefitsStrip: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePauseWithResume = () => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  React.useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  const marqueeItems = [...BENEFITS, ...BENEFITS];

  return (
    <section
      aria-label="Trust and Reliability Guarantees"
      className="relative w-full bg-white border-b border-brand-border/60 py-3 sm:py-4 overflow-hidden select-none"
    >
      {/* Mobile 3-Card Strip matching Screen 1 */}
      <div className="grid grid-cols-3 gap-2 px-4 sm:hidden">
        <div className="bg-white rounded-2xl border border-brand-border/80 p-2.5 flex flex-col items-center text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-brand-dark">Best Deals</span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border/80 p-2.5 flex flex-col items-center text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary mb-1">
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-brand-dark">Fast Delivery</span>
        </div>

        <div className="bg-white rounded-2xl border border-brand-border/80 p-2.5 flex flex-col items-center text-center shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-brand-light flex items-center justify-center text-brand-primary mb-1">
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-brand-dark">Secure Payment</span>
        </div>
      </div>

      {/* Desktop / Tablet Smooth Marquee */}
      <div
        className="hidden sm:block cursor-pointer relative"
        onClick={handlePauseWithResume}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          if (!resumeTimeoutRef.current) {
            setIsPaused(false);
          }
        }}
      >
        {/* Edge Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />

        <motion.div
          className="flex items-center gap-6 whitespace-nowrap will-change-transform"
          animate={{
            x: isPaused ? undefined : ['0%', '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 16,
              ease: 'linear',
            },
          }}
        >
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/90 hover:bg-brand-light/60 border border-brand-border hover:border-brand-primary shadow-xs transition-all duration-200 group flex-shrink-0 cursor-default"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-light group-hover:bg-brand-primary text-brand-primary group-hover:text-white flex items-center justify-center transition-colors duration-200 border border-brand-border flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-bold text-brand-dark group-hover:text-brand-primary transition-colors leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-brand-muted font-medium leading-tight mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
