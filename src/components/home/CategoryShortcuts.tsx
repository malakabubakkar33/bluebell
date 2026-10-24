'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import { ChevronRight } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useProducts();

  return (
    <section id="categories" className="py-6 sm:py-10 bg-white border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-brand-dark tracking-tight">
              Explore By Category
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted hidden sm:block mt-0.5">
              Browse genuine flagships, tablets, wearables, and premium accessories
            </p>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-deep transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 Columns on Mobile (Screen 1 Layout), 4 on Tablet, 8 on Desktop */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3.5">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-white hover:bg-brand-surface border border-brand-border/80 hover:border-brand-primary rounded-2xl p-2.5 sm:p-4 flex flex-col items-center justify-between text-center transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer min-h-[130px] sm:min-h-[160px]"
            >
              {/* Product Device Cutout */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-brand-surface group-hover:bg-brand-light/60 flex items-center justify-center my-1 transition-colors flex-shrink-0">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Title & Items Count */}
              <div className="space-y-0.5 my-1 w-full flex flex-col items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-brand-dark group-hover:text-brand-primary transition-colors block truncate w-full">
                  {cat.name}
                </span>
                <span className="text-[10px] text-brand-muted">
                  {cat.itemCount} {cat.itemCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
