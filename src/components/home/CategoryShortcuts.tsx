'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import { ArrowRight, ChevronRight, Sparkles } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useProducts();

  return (
    <section id="categories" className="py-10 sm:py-16 bg-white border-b border-[#DFEBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10 gap-3">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0878F9] flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-[#0878F9]" />
              Official Collections
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#102A56] tracking-tight">
              Explore By Category
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0878F9] hover:text-[#0665D0] transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 8 Category Cards: 1 Balanced Row on Desktop (8 cols), 4 cols on tablet, smooth scroll / 2 cols on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-white border border-[#DFEBF8] hover:border-[#0878F9] rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-lg hover:shadow-[#0878F9]/10 hover:-translate-y-1"
            >
              {/* Product Device Cutout centered with hover zoom */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center my-1.5">
                <div className="absolute inset-0 rounded-full bg-[#0878F9]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                  loading="lazy"
                />
              </div>

              {/* Title & Items Count */}
              <div className="space-y-0.5 my-1">
                <span className="text-xs sm:text-sm font-bold text-[#102A56] group-hover:text-[#0878F9] transition-colors block truncate max-w-[110px]">
                  {cat.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#8394AB] font-medium block">
                  {cat.itemCount}+ Items
                </span>
              </div>

              {/* Small Circular Arrow Button matching reference */}
              <div className="mt-2 w-7 h-7 rounded-full bg-[#F2F8FF] group-hover:bg-[#0878F9] text-[#0878F9] group-hover:text-white flex items-center justify-center transition-colors text-xs shadow-xs">
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
