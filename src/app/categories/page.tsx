'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ArrowRight, Sparkles, Smartphone, Tablet, Watch, Headphones, Cable, ShieldCheck, ShoppingBag } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { doesProductBelongToCategory } from '@/lib/categoryUtils';

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, products } = useProducts();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically calculate actual product count per category from live database
  const categoriesWithCounts = useMemo(() => {
    return categories.map((cat) => {
      const count = products.filter((p) =>
        doesProductBelongToCategory(p.categorySlug, p.brand, cat.slug)
      ).length;

      return {
        ...cat,
        calculatedCount: count,
      };
    });
  }, [categories, products]);

  // Filter categories by user search input
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categoriesWithCounts;
    const q = searchQuery.toLowerCase();
    return categoriesWithCounts.filter((c) =>
      c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categoriesWithCounts, searchQuery]);

  return (
    <main className="min-h-screen bg-[#F7FBFF] text-[#102A50] flex flex-col">
      {/* Top Header Bar Matching Screen 2 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#DCEBFA] shadow-xs">
        <div className="max-w-md md:max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Back Action */}
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go Back"
            className="w-9 h-9 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] flex items-center justify-center transition-colors cursor-pointer border border-[#DCEBFA]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Centered Brand Logo */}
          <div className="flex-1 flex justify-center">
            <BrandLogo variant="compact" />
          </div>

          {/* Cart Icon with Live Count */}
          <Link
            href="/cart"
            aria-label="View Cart"
            className="relative w-9 h-9 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] flex items-center justify-center transition-colors border border-[#DCEBFA]"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E5485B] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Search Categories Input Field */}
        <div className="max-w-md md:max-w-4xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#647A98] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-2xl py-2.5 pl-10 pr-4 text-base md:text-sm text-[#102A50] placeholder-[#647A98] focus:outline-none focus:border-[#0866E8] focus:ring-4 focus:ring-[#0866E8]/10 transition-all"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-md md:max-w-4xl mx-auto w-full px-4 py-4 space-y-5">
        {/* Promotional Hero Card Matching Screen 2 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0866E8] via-[#0645B5] to-[#18A8F8] p-5 text-white shadow-lg shadow-[#0866E8]/20 flex items-center justify-between">
          {/* Subtle Ambient Shapes */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-1 z-10 max-w-[65%]">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/25">
              100% Genuine
            </span>
            <h2 className="text-xl font-black tracking-tight leading-tight pt-1">
              Premium Devices
            </h2>
            <p className="text-xs text-white/90 font-medium">
              Top Brands • Official Warranty • Best Prices
            </p>
          </div>

          {/* Decorative Device Graphics */}
          <div className="relative z-10 w-24 h-24 flex items-center justify-center flex-shrink-0">
            <img
              src="/categories/iphone.svg"
              alt="Premium Phones"
              className="w-16 h-16 object-contain transform -rotate-12 translate-x-2 drop-shadow-lg"
            />
            <img
              src="/categories/samsung.svg"
              alt="Samsung Phones"
              className="w-16 h-16 object-contain transform rotate-6 -translate-x-2 drop-shadow-xl"
            />
          </div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-lg font-black text-[#102A50] tracking-tight">
              All Categories
            </h1>
            <p className="text-xs text-[#647A98] font-medium">
              Find exactly what you are looking for
            </p>
          </div>
          <span className="text-xs font-bold text-[#0866E8] bg-[#EDF6FF] px-2.5 py-1 rounded-full border border-[#DCEBFA]">
            {filteredCategories.length} Categories
          </span>
        </div>

        {/* 2-Column Grid of Category Cards Matching Screen 2 */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-4 pb-6">
          {filteredCategories.map((cat) => {
            const targetUrl = `/products?category=${encodeURIComponent(cat.slug)}`;

            return (
              <Link
                key={cat.id}
                href={targetUrl}
                className="group relative bg-white hover:bg-[#F7FBFF] border border-[#DCEBFA] hover:border-[#0866E8] rounded-2xl p-4 flex flex-col items-center justify-between text-center shadow-xs hover:shadow-md transition-all duration-200 min-h-[170px]"
              >
                {/* Visual Image inside soft light blue container */}
                <div className="relative w-20 h-20 rounded-2xl bg-[#EDF6FF] group-hover:bg-[#DCEBFA]/60 flex items-center justify-center my-1 transition-colors">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-14 h-14 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                  />
                </div>

                {/* Name & Count */}
                <div className="space-y-0.5 mt-2 w-full">
                  <h3 className="text-sm font-black text-[#102A50] group-hover:text-[#0866E8] transition-colors truncate">
                    {cat.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-[#647A98] group-hover:text-[#0866E8] transition-colors block">
                    {cat.calculatedCount} {cat.calculatedCount === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
