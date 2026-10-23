'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import { ChevronRight } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useProducts();
  return (
    <section id="categories" className="py-12 sm:py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-600 block mb-1">
              Official Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Explore By Category
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors group"
          >
            <span>View All Devices &amp; Accessories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Clean Boxless Category Row (Transparent device cutouts without rectangular background boxes) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 sm:gap-6 lg:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center transition-all duration-300"
            >
              {/* Product Device Silhouette Container without rectangular box */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-3">
                {/* Soft ambient radial glow on hover */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/10 via-blue-400/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scale-125" />

                {/* Floating Transparent Device Cutout */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 object-contain transition-all duration-300 group-hover:scale-115 group-hover:-translate-y-2 filter group-hover:drop-shadow-[0_12px_16px_rgba(2,132,199,0.22)]"
                  loading="lazy"
                />
              </div>

              {/* Title & Items Count */}
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors block">
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-400 group-hover:text-brand-500 transition-colors block">
                  {cat.itemCount}+ Products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
