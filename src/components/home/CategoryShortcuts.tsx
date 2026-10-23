'use client';

import React from 'react';
import Link from 'next/link';
import { useProducts } from '@/context/ProductsContext';
import { ChevronRight } from 'lucide-react';

export const CategoryShortcuts: React.FC = () => {
  const { categories } = useProducts();

  return (
    <section id="categories" className="py-8 sm:py-14 bg-white border-b border-[#DFEBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#102A56] tracking-tight">
              Explore By Category
            </h2>
            <p className="text-xs sm:text-sm text-[#52749D] font-medium mt-1">
              Browse genuine flagships, tablets, wearables, and premium accessories
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#0756C9] hover:text-[#063B8E] transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories: Responsive Grid (2-col on small mobile, 4-col on modern mobile & tablet, 8-col on desktop) */}
        <div className="grid grid-cols-2 xs:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-gradient-to-b from-white to-[#F8FBFE] hover:to-[#F0F7FF] border border-[#DFEBF8] hover:border-[#0756C9] rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-300 hover:shadow-xl hover:shadow-[#0756C9]/10 hover:-translate-y-1.5 cursor-pointer min-h-[175px] sm:min-h-[190px]"
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
