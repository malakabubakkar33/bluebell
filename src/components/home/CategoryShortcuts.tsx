'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useProducts();

  return (
    <section id="categories" className="py-8 sm:py-14 bg-white border-b border-[#DFEBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0878F9] flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 fill-[#0878F9]" />
              Official Collections
            </span>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#102A56] tracking-tight">
              Explore By Category
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0878F9] hover:text-[#0665D0] transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories: Smooth Horizontal Scroll on Mobile (snap), 8-col grid on Desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-2.5 sm:gap-3.5 lg:gap-3.5 lg:grid-cols-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="w-[96px] sm:w-[120px] lg:w-auto flex-shrink-0 snap-start group bg-white/90 backdrop-blur-md border border-[#DFEBF8] hover:border-[#0878F9] rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-lg hover:shadow-[#0878F9]/10 hover:-translate-y-1"
            >
              {/* Product Device Cutout centered with hover zoom */}
              <div className="relative w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center my-1">
                <div className="absolute inset-0 rounded-full bg-[#0878F9]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="relative z-10 w-12 h-12 sm:w-16 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                  loading="lazy"
                />
              </div>

              {/* Title & Items Count */}
              <div className="space-y-0.5 my-1">
                <span className="text-xs sm:text-sm font-bold text-[#102A56] group-hover:text-[#0878F9] transition-colors block truncate max-w-[85px] sm:max-w-[110px]">
                  {cat.name}
                </span>
                <span className="text-[10px] text-[#8394AB] font-medium block">
                  {cat.itemCount}+ Items
                </span>
              </div>

              {/* Small Circular Arrow Button matching reference */}
              <div className="mt-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F2F8FF] group-hover:bg-[#0878F9] text-[#0878F9] group-hover:text-white flex items-center justify-center transition-colors text-xs shadow-xs">
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
