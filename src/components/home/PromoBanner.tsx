'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
    badgeColor: 'bg-[#0878F9] text-white',
    title: 'Samsung Galaxy S24 Series',
    discount: 'Up To 25% OFF',
    subtitle: 'Premium Performance. Unmatched Value.',
    image: '/categories/samsung.svg',
    link: '/products?brand=Samsung',
    bgGradient: 'from-[#F2F8FF]/90 via-white to-[#EBF4FE]/80',
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
    bgGradient: 'from-[#F7FAFD]/90 via-[#F2F8FF]/80 to-white',
  },
  {
    id: 3,
    badge: 'CREATIVE WORKSTATION',
    badgeColor: 'bg-[#0878F9] text-white',
    title: 'iPad Pro (M4) & iPad Air',
    discount: 'Bundle Savings',
    subtitle: 'More Power. More Possibilities.',
    image: '/categories/ipad.svg',
    link: '/products?category=ipad',
    bgGradient: 'from-[#F2F8FF]/90 via-white to-[#E8F3FF]/80',
  },
];

export const PromoBanner: React.FC = () => {
  const { deals } = useProducts();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const activeDeals = deals && deals.length > 0 ? deals : DEALS;

  return (
    <section id="promo" className="py-8 sm:py-14 bg-white border-b border-[#DFEBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left/Right Controls */}
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#0878F9] uppercase flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-[#0878F9]" />
              Limited Time Deals
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#102A56] tracking-tight">
              Hot Promotional Offers
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2F8FF] text-[#102A56] hover:text-[#0878F9] flex items-center justify-center transition-all border border-[#DFEBF8] shadow-xs cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-[#F2F8FF] text-[#102A56] hover:text-[#0878F9] flex items-center justify-center transition-all border border-[#DFEBF8] shadow-xs cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Snap Scroll Deals Row on Mobile, 3 Cards on Desktop */}
        <div
          ref={scrollRef}
          className="flex md:grid md:grid-cols-3 gap-3.5 sm:gap-6 overflow-x-auto md:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {activeDeals.slice(0, 3).map((deal) => (
            <div
              key={deal.id}
              className={`w-[275px] sm:w-[350px] md:w-auto flex-shrink-0 snap-start rounded-3xl bg-gradient-to-br ${deal.bgGradient} backdrop-blur-md border border-[#DFEBF8] p-4 sm:p-6 shadow-xs hover:shadow-xl hover:shadow-[#0878F9]/10 transition-all duration-300 flex flex-col justify-between group`}
            >
              <div>
                {/* Badge */}
                <div className="mb-2.5">
                  <span
                    className={`text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2.5 sm:px-3 py-1 rounded-full ${deal.badgeColor} shadow-xs inline-block`}
                  >
                    {deal.badge}
                  </span>
                </div>

                {/* Offer Title */}
                <h3 className="text-base sm:text-xl font-black text-[#102A56] tracking-tight mb-1">
                  {deal.title}
                </h3>

                {/* Discount / Highlight */}
                <p className="text-xs sm:text-base font-extrabold text-[#0878F9] mb-1">
                  {deal.discount}
                </p>

                {/* Short Description */}
                <p className="text-[11px] sm:text-xs text-[#536780] font-medium leading-relaxed">
                  {deal.subtitle}
                </p>
              </div>

              {/* Bottom Row: Product Image & CTA */}
              <div className="flex items-center justify-between gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#DFEBF8]/70">
                <Link
                  href={deal.link}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#0878F9] hover:bg-[#0665D0] text-white font-bold text-xs shadow-md shadow-[#0878F9]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
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
