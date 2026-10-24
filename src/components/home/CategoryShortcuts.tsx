'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" className="py-8 sm:py-14 bg-white border-b border-[#DFEBF8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Left/Right Controls for Mobile */}
        <div className="flex items-center justify-between mb-5 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#102A56] tracking-tight">
              Explore By Category
            </h2>
            <p className="text-xs sm:text-sm text-[#52749D] font-medium mt-1">
              Browse genuine flagships, tablets, wearables, and premium accessories
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile / Tablet Scroll Buttons */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                type="button"
                onClick={scrollLeft}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full bg-[#F4F9FF] hover:bg-[#EAF7FF] text-[#0756C9] border border-[#C7E5FF] flex items-center justify-center transition-colors active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={scrollRight}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full bg-[#F4F9FF] hover:bg-[#EAF7FF] text-[#0756C9] border border-[#C7E5FF] flex items-center justify-center transition-colors active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0756C9] hover:text-[#063B8E] transition-colors group flex-shrink-0 ml-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Categories: Smooth Horizontal Scroll on Mobile, 8-Col Grid on Desktop */}
        <div
          ref={scrollContainerRef}
          className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-4 overflow-x-auto md:overflow-visible pb-3 pt-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory scroll-smooth"
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="w-[136px] sm:w-[155px] md:w-auto flex-shrink-0 snap-start group bg-gradient-to-b from-white to-[#F8FBFE] hover:to-[#F0F7FF] border border-[#DFEBF8] hover:border-[#0756C9] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:shadow-[#0756C9]/10 hover:-translate-y-1.5 cursor-pointer min-h-[175px] sm:min-h-[190px]"
            >
              {/* Product Device Cutout centered inside soft illuminated pill */}
              <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#F0F7FF] group-hover:bg-[#E2F0FF] flex items-center justify-center my-1 transition-colors duration-300 flex-shrink-0">
                <div className="absolute inset-0 rounded-2xl bg-[#0756C9]/5 blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                  loading="lazy"
                />
              </div>

              {/* Title & Items Count */}
              <div className="space-y-1 my-1 w-full flex flex-col items-center justify-center">
                <span className="text-xs sm:text-sm font-black text-[#102A56] group-hover:text-[#0756C9] transition-colors block truncate w-full">
                  {cat.name}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-[#52749D] group-hover:text-[#0756C9] bg-white group-hover:bg-[#EAF7FF] border border-[#DFEBF8] px-2.5 py-0.5 rounded-full inline-block transition-colors">
                  {cat.itemCount}+ Items
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
