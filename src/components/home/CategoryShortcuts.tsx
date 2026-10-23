'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import { ChevronRight } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useProducts();
  return (
    <section id="categories" className="py-8 sm:py-14 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-10 gap-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-sky-600 block mb-1">
              Official Collections
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore By Category
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal Smooth Scroll on Mobile without scrollbar line / Grid on Desktop */}
        <div className="flex md:grid overflow-x-auto md:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-2 md:pb-0 gap-4 sm:gap-6 lg:gap-5 md:grid-cols-4 lg:grid-cols-8 scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center transition-all duration-300 flex-shrink-0 w-20 sm:w-24 md:w-auto"
            >
              {/* Product Device Silhouette Container without rectangular box */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center mb-2">
                {/* Soft ambient radial glow on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400/10 via-sky-300/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scale-125" />

                {/* Floating Transparent Device Cutout */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain transition-all duration-300 group-hover:scale-115 group-hover:-translate-y-1.5 filter group-hover:drop-shadow-[0_12px_16px_rgba(2,132,199,0.22)]"
                  loading="lazy"
                />
              </div>

              {/* Title & Items Count */}
              <div className="space-y-0.5">
                <span className="text-[11px] sm:text-xs md:text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors block truncate max-w-[85px] sm:max-w-none">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-sky-500 transition-colors block">
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
