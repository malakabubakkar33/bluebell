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

  // Click or touch pauses the train animation and restarts it automatically after 3 seconds
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

  // Duplicate for seamless 100% infinite marquee loop
  const marqueeItems = [...BENEFITS, ...BENEFITS];

  return (
    <section
      aria-label="Trust and Reliability Guarantees"
      className="relative w-full bg-gradient-to-r from-white via-[#F8FBFE] to-white border-b border-[#DFEBF8] py-3.5 sm:py-4 overflow-hidden select-none cursor-pointer"
      onClick={handlePauseWithResume}
      onTouchStart={handlePauseWithResume}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        // If not already in a click 3s timeout, resume immediately
        if (!resumeTimeoutRef.current) {
          setIsPaused(false);
        }
      }}
    >
      {/* Edge Gradient Masks for Silky Fade In / Fade Out */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />

      {/* Infinite Train-like Forward Marquee (Accelerated duration from 28s to 15s for lively responsive speed) */}
      <motion.div
        className="flex items-center gap-4 sm:gap-6 whitespace-nowrap will-change-transform"
        animate={{
          x: isPaused ? undefined : ['0%', '-50%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 15,
            ease: 'linear',
          },
        }}
      >
        {marqueeItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={`${item.id}-${idx}`}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/90 hover:bg-[#EAF7FF] border border-[#DFEBF8] hover:border-[#0756C9] shadow-xs transition-all duration-200 group flex-shrink-0 cursor-default"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F0F7FF] group-hover:bg-[#0756C9] text-[#0756C9] group-hover:text-white flex items-center justify-center transition-colors duration-200 border border-[#DFEBF8] flex-shrink-0">
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform group-hover:scale-110" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-black text-[#102A56] group-hover:text-[#0756C9] transition-colors leading-tight">
                  {item.title}
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#52749D] font-medium leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
};
