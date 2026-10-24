'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/context/ProductsContext';

interface PromoDeal {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  discount: string;
  subtitle: string;
  image: string;
  link: string;
  bgGradient: string;
}

const DEALS: PromoDeal[] = [
  {
    id: 1,
    badge: 'EXCLUSIVE DEAL',
    badgeColor: 'bg-[#0756C9] text-white',
    title: 'Samsung Galaxy S24 Series',
    discount: 'Up To 25% OFF',
    subtitle: 'Premium Performance. Unmatched Value.',
    image: '/categories/samsung.svg',
    link: '/products?brand=Samsung',
    bgGradient: 'from-[#F2F8FF] via-white to-[#EBF4FE]',
  },
  {
    id: 2,
    badge: 'APPLE SPECIAL',
    badgeColor: 'bg-[#102A56] text-white',
    title: 'iPhone 16 Pro & 15 Pro Max',
    discount: 'Official PTA Approved',
    subtitle: 'Top Performance. Extraordinary Style.',
    image: '/categories/iphone.svg',
    link: '/products?brand=Apple',
    bgGradient: 'from-[#F7FAFD] via-[#F2F8FF] to-white',
  },
  {
    id: 3,
    badge: 'CREATIVE WORKSTATION',
    badgeColor: 'bg-[#0756C9] text-white',
    title: 'iPad Pro (M4) & iPad Air',
    discount: 'Bundle Savings',
    subtitle: 'More Power. More Possibilities.',
    image: '/categories/ipad.svg',
    link: '/products?category=ipad',
    bgGradient: 'from-[#F2F8FF] via-white to-[#E8F3FF]',
  },
];

export const PromoBanner: React.FC = () => {
  const { deals } = useProducts();
  const filteredDeals = (deals || []).filter((d) => d.status !== 'Inactive');
  const activeDeals = filteredDeals.length > 0 ? filteredDeals : DEALS;
  const totalDeals = activeDeals.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextDeal = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalDeals);
  }, [totalDeals]);

  const prevDeal = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? totalDeals - 1 : prev - 1));
  }, [totalDeals]);

  // Auto Slider every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextDeal, 4500);
    return () => clearInterval(timer);
  }, [nextDeal, isPaused]);

  // Touch swipe support for mobile
  const minSwipeDistance = 40;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) nextDeal();
      else prevDeal();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 280, damping: 30 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 280, damping: 30 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  const currentDeal = activeDeals[currentIndex] || activeDeals[0];

  return (
    <section id="promo" className="py-8 sm:py-14 bg-white border-b border-[#DFEBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#102A56] tracking-tight">
              Hot Promotional Offers
            </h2>
            <p className="text-xs sm:text-sm text-[#52749D] font-medium mt-1">
              Limited-time verified flagship bundles with official warranty
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevDeal}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2F8FF] text-[#102A56] hover:text-[#0756C9] flex items-center justify-center transition-all border border-[#DFEBF8] shadow-xs cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Previous promotional deal"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextDeal}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2F8FF] text-[#102A56] hover:text-[#0756C9] flex items-center justify-center transition-all border border-[#DFEBF8] shadow-xs cursor-pointer hover:scale-105 active:scale-95"
              aria-label="Next promotional deal"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            MOBILE VIEW (md:hidden): Exactly 1 Box on screen with Auto Slider & Swipe
           ========================================================================= */}
        <div
          className="block md:hidden relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentDeal.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <div
                className={`w-full rounded-3xl bg-gradient-to-br ${currentDeal.bgGradient} border border-[#DFEBF8] p-5 shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="mb-3">
                    <span
                      className={`text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full ${currentDeal.badgeColor} shadow-xs inline-block`}
                    >
                      {currentDeal.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#102A56] tracking-tight mb-1">
                    {currentDeal.title}
                  </h3>

                  <p className="text-sm font-black text-[#0756C9] mb-1">
                    {currentDeal.discount}
                  </p>

                  <p className="text-xs text-[#52749D] font-medium leading-relaxed">
                    {currentDeal.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#DFEBF8]">
                  <Link
                    href={currentDeal.link}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0756C9] hover:bg-[#063B8E] text-white font-extrabold text-xs shadow-md shadow-[#0756C9]/25 cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={currentDeal.image}
                      alt={currentDeal.title}
                      className="w-full h-full object-contain filter drop-shadow-md"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Clean Pagination Dots on Mobile */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {activeDeals.slice(0, 3).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to deal ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 bg-[#0756C9] shadow-xs'
                    : 'w-2 bg-[#C7E5FF] hover:bg-[#0756C9]/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* =========================================================================
            DESKTOP VIEW (hidden md:grid): 3 Cards Grid with Hover Polish
           ========================================================================= */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {activeDeals.slice(0, 3).map((deal) => (
            <div
              key={deal.id}
              className={`rounded-3xl bg-gradient-to-br ${deal.bgGradient} border border-[#DFEBF8] hover:border-[#0756C9] p-6 shadow-sm hover:shadow-xl hover:shadow-[#0756C9]/10 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1`}
            >
              <div>
                <div className="mb-3">
                  <span
                    className={`text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full ${deal.badgeColor} shadow-xs inline-block`}
                  >
                    {deal.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#102A56] tracking-tight mb-1">
                  {deal.title}
                </h3>

                <p className="text-base font-extrabold text-[#0756C9] mb-1">
                  {deal.discount}
                </p>

                <p className="text-xs text-[#52749D] font-medium leading-relaxed">
                  {deal.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[#DFEBF8]/70">
                <Link
                  href={deal.link}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0756C9] hover:bg-[#063B8E] text-white font-extrabold text-xs shadow-md shadow-[#0756C9]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
