'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Zap, Tag, ShieldCheck } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';

interface PromoDeal {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  discount: string;
  subtitle: string;
  brand: string;
  image: string;
  link: string;
  bgGradient: string;
}

const DEALS: PromoDeal[] = [
  {
    id: 1,
    badge: 'EXCLUSIVE GALAXY DEAL',
    badgeColor: 'bg-sky-500 text-white',
    title: 'Samsung Galaxy S24 Series',
    discount: 'Up To 25% OFF',
    subtitle: 'Free 45W GaN Fast Charger + Official Samsung Pakistan Warranty included.',
    brand: 'SAMSUNG',
    image: '/categories/samsung.svg',
    link: '/products?brand=Samsung',
    bgGradient: 'from-sky-100/90 via-sky-50/70 to-white',
  },
  {
    id: 2,
    badge: 'APPLE FLAGSHIP FEST',
    badgeColor: 'bg-slate-900 text-white',
    title: 'iPhone 16 Pro & 15 Pro Max',
    discount: 'Official PTA Approved',
    subtitle: 'Complimentary MagSafe Case + 1 Year Official Apple Warranty.',
    brand: 'APPLE',
    image: '/categories/iphone.svg',
    link: '/products?brand=Apple',
    bgGradient: 'from-blue-100/80 via-white to-sky-50/70',
  },
  {
    id: 3,
    badge: 'CREATIVE WORKSTATION',
    badgeColor: 'bg-emerald-500 text-white',
    title: 'iPad Pro (M4) & iPad Air',
    discount: 'Bundle Savings',
    subtitle: 'Special educational bundle with Apple Pencil Pro & Smart Folio.',
    brand: 'APPLE IPAD',
    image: '/categories/ipad.svg',
    link: '/products?category=ipad',
    bgGradient: 'from-cyan-100/80 via-sky-50/70 to-white',
  },
  {
    id: 4,
    badge: 'WEARABLES SALE',
    badgeColor: 'bg-amber-500 text-white',
    title: 'Apple Watch Ultra 2 & Galaxy Watch',
    discount: 'Flat 15% OFF',
    subtitle: 'Precision titanium fitness tracking & ECG sensors.',
    brand: 'SMARTWATCHES',
    image: '/categories/smartwatches.svg',
    link: '/products?category=smart-watches',
    bgGradient: 'from-sky-100/90 via-white to-slate-50',
  },
];

export const PromoBanner: React.FC = () => {
  const { deals } = useProducts();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="promo" className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header with Left/Right Controls */}
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-[11px] font-black tracking-widest text-sky-600 uppercase flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-sky-500" />
              Limited Time Deals
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hot Promotional Offers
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center transition-all border border-sky-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 flex items-center justify-center transition-all border border-sky-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Snap Scroll Deals Row */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 sm:gap-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {(deals && deals.length > 0 ? deals : DEALS).map((deal) => (
            <div
              key={deal.id}
              className={`flex-shrink-0 w-[300px] sm:w-[380px] md:w-[440px] rounded-3xl bg-gradient-to-br ${deal.bgGradient} border border-sky-100/90 p-5 sm:p-7 shadow-sm hover:shadow-lg transition-all duration-300 snap-start flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${deal.badgeColor} shadow-sm`}>
                    {deal.badge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {deal.brand}
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
                  {deal.title}
                </h3>

                <p className="text-sm sm:text-base font-extrabold text-sky-600 mb-2">
                  {deal.discount}
                </p>

                <p className="text-xs text-slate-600 font-medium line-clamp-2">
                  {deal.subtitle}
                </p>
              </div>

              {/* Bottom Image & CTA */}
              <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-sky-100/60">
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
                  <img
                    src={deal.image}
                    alt={deal.title}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>

                <Link
                  href={deal.link}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:scale-105 transition-all"
                >
                  <span>Claim Deal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
