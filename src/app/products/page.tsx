'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  RotateCcw,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/context/ProductsContext';
import { doesProductBelongToCategory } from '@/lib/categoryUtils';

function ProductsContent() {
  const router = useRouter();
  const { products: storeProducts, categories: storeCategories } = useProducts();
  const productsList = storeProducts && storeProducts.length > 0 ? storeProducts : [];
  const categoriesList = storeCategories && storeCategories.length > 0 ? storeCategories : [];

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialBrand = searchParams.get('brand') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(500000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Sync with URL params if they change
  React.useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialBrand) setSelectedBrand(initialBrand);
    if (initialSearch) setSearchQuery(initialSearch);
  }, [initialCategory, initialBrand, initialSearch]);

  const brands = useMemo(() => {
    const list = Array.from(new Set(productsList.map((p) => p.brand)));
    return ['all', ...list];
  }, [productsList]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedBrand !== 'all') count++;
    if (inStockOnly) count++;
    if (priceRange < 500000) count++;
    if (searchQuery.trim().length > 0) count++;
    return count;
  }, [selectedCategory, selectedBrand, inStockOnly, priceRange, searchQuery]);

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      if (selectedCategory !== 'all') {
        if (!doesProductBelongToCategory(p.categorySlug, p.brand, selectedCategory)) {
          return false;
        }
      }
      if (selectedBrand !== 'all' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (p.price > priceRange) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [productsList, selectedCategory, selectedBrand, inStockOnly, priceRange, searchQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setInStockOnly(false);
    setPriceRange(500000);
    setSortBy('featured');
  };

  // Determine dynamic title for page matching Screen 3
  const pageTitle = useMemo(() => {
    if (selectedBrand !== 'all') {
      return `${selectedBrand} Mobiles`;
    }
    if (selectedCategory !== 'all') {
      const match = categoriesList.find((c) => c.slug === selectedCategory);
      return match ? match.name : 'Category Devices';
    }
    if (searchQuery.trim()) {
      return `Results for "${searchQuery}"`;
    }
    return 'All Mobile Devices';
  }, [selectedBrand, selectedCategory, searchQuery, categoriesList]);

  // Series Banner details matching Screen 3
  const bannerInfo = useMemo(() => {
    if (selectedCategory !== 'all') {
      const match = categoriesList.find((c) => c.slug === selectedCategory);
      if (match) {
        return {
          title: match.name,
          subtitle: match.description || '100% Genuine PTA Approved with Official Warranty',
          image: match.image || '/categories/iphone.svg',
        };
      }
    }
    if (selectedBrand.toLowerCase() === 'samsung') {
      return {
        title: 'SAMSUNG Galaxy Series',
        subtitle: 'Galaxy AI Mobile Intelligence',
        image: '/categories/samsung.svg',
      };
    }
    if (selectedBrand.toLowerCase() === 'apple') {
      return {
        title: 'Apple iPhone Lineup',
        subtitle: 'A18 Pro Titanium Flagships',
        image: '/categories/iphone.svg',
      };
    }
    return {
      title: 'Flagship Collection',
      subtitle: '100% Genuine PTA Approved with Official Warranty',
      image: '/categories/iphone.svg',
    };
  }, [selectedCategory, selectedBrand, categoriesList]);

  return (
    <div className="min-h-screen bg-[#F7FBFF] text-[#102A50] flex flex-col">
      {/* Mobile Top App Bar Matching Screen 3 */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#DCEBFA] shadow-xs md:hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center border border-[#DCEBFA] active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <BrandLogo variant="compact" />

          <Link
            href="/categories"
            aria-label="Categories"
            className="w-9 h-9 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center border border-[#DCEBFA] active:scale-95"
          >
            <Search className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1">
        {/* Title and Item Count Matching Screen 3 */}
        <div className="mb-3.5">
          <h1 className="text-xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs text-[#647A98] font-medium mt-0.5">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
          </p>
        </div>

        {/* Series Banner Matching Screen 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0866E8] via-[#0645B5] to-[#18A8F8] p-4 sm:p-6 text-white shadow-md shadow-[#0866E8]/15 mb-4 flex items-center justify-between">
          <div className="space-y-1 z-10 max-w-[70%]">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
              Official Dealer
            </span>
            <h2 className="text-base sm:text-xl font-black tracking-tight pt-0.5">
              {bannerInfo.title}
            </h2>
            <p className="text-xs text-white/90 font-medium">
              {bannerInfo.subtitle}
            </p>
          </div>

          <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
            <img
              src={bannerInfo.image}
              alt={bannerInfo.title}
              className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Controls Row: Filter & Sort Buttons Matching Screen 3 */}
        <div className="flex items-center gap-2 mb-4">
          {/* Filter Pill Button */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-[#DCEBFA] hover:border-[#0866E8] text-xs font-black text-[#102A50] flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0866E8] text-white text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Pill Button */}
          <div className="relative flex-1">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full py-2.5 px-3 rounded-xl bg-white border border-[#DCEBFA] hover:border-[#0866E8] text-xs font-black text-[#102A50] flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-95 cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#0866E8]" />
              <span>Sort By</span>
              <ChevronDown className="w-3 h-3 text-[#647A98]" />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-[#DCEBFA] rounded-2xl shadow-xl py-2 z-40 animate-fadeIn">
                {[
                  { label: 'Featured', value: 'featured' },
                  { label: 'Price: Low to High', value: 'price-low' },
                  { label: 'Price: High to Low', value: 'price-high' },
                  { label: 'Highest Rated', value: 'rating' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value as any);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                      sortBy === opt.value
                        ? 'text-[#0866E8] bg-[#EDF6FF]'
                        : 'text-[#102A50] hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-[#0866E8]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <span className="text-[10px] font-bold text-[#647A98] uppercase">Active:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDF6FF] text-[#0866E8] text-xs font-bold border border-[#DCEBFA]">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBrand !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDF6FF] text-[#0866E8] text-xs font-bold border border-[#DCEBFA]">
                Brand: {selectedBrand}
                <button onClick={() => setSelectedBrand('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EDF6FF] text-[#0866E8] text-xs font-bold border border-[#DCEBFA]">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs font-bold text-[#E5485B] hover:underline ml-1 cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Layout: Desktop Sidebar + Product Grid Matching Screen 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Desktop Filter Sidebar (hidden on mobile) */}
          <aside className="hidden lg:block bg-white border border-[#DCEBFA] rounded-2xl p-5 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCEBFA]">
              <h3 className="text-sm font-black text-[#102A50]">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-[#E5485B] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div>
              <label className="text-xs font-bold text-[#102A50] block mb-2">Brand</label>
              <div className="space-y-1">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold capitalize flex items-center justify-between ${
                      selectedBrand === brand
                        ? 'bg-[#0866E8] text-white font-bold'
                        : 'text-[#647A98] hover:bg-[#EDF6FF]'
                    }`}
                  >
                    <span>{brand === 'all' ? 'All Brands' : brand}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold text-[#102A50] block mb-2">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-[#0866E8] text-white font-bold'
                      : 'text-[#647A98] hover:bg-[#EDF6FF]'
                  }`}
                >
                  <span>All Categories</span>
                </button>
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-[#0866E8] text-white font-bold'
                        : 'text-[#647A98] hover:bg-[#EDF6FF]'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#102A50] mb-1">
                <span>Max Budget</span>
                <span className="font-mono text-[#0866E8]">Rs. {priceRange.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#0866E8]"
              />
            </div>

            {/* Stock status */}
            <div className="pt-2 border-t border-[#DCEBFA]">
              <label className="flex items-center gap-2 text-xs font-bold text-[#102A50] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-[#0866E8] focus:ring-[#0866E8] w-4 h-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area Matching Screen 3 */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#DCEBFA] p-10 text-center shadow-xs">
                <p className="text-sm font-bold text-[#647A98] mb-3">
                  No devices found matching your active filter criteria.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-5 py-2 rounded-full bg-[#0866E8] text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* 2-Column Responsive Product Grid on Mobile */
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet Modal */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-[#061838]/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="relative w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Sheet Header */}
              <div className="p-4 border-b border-[#DCEBFA] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#0866E8]" />
                  <h3 className="text-sm font-black text-[#102A50]">Filter Devices</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1 rounded-full text-[#647A98] hover:bg-[#EDF6FF]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sheet Body */}
              <div className="p-4 overflow-y-auto space-y-5 flex-1">
                {/* Brand Selection */}
                <div>
                  <label className="text-xs font-black text-[#102A50] block mb-2">Brand</label>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBrand(b)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                          selectedBrand === b
                            ? 'bg-[#0866E8] text-white shadow-xs'
                            : 'bg-[#EDF6FF] text-[#102A50] border border-[#DCEBFA]'
                        }`}
                      >
                        {b === 'all' ? 'All Brands' : b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-black text-[#102A50] block mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-[#0866E8] text-white shadow-xs'
                          : 'bg-[#EDF6FF] text-[#102A50] border border-[#DCEBFA]'
                      }`}
                    >
                      All
                    </button>
                    {categoriesList.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                          selectedCategory === c.slug
                            ? 'bg-[#0866E8] text-white shadow-xs'
                            : 'bg-[#EDF6FF] text-[#102A50] border border-[#DCEBFA]'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Budget */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#102A50] mb-1">
                    <span>Max Price</span>
                    <span className="font-mono text-[#0866E8]">Rs. {priceRange.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#0866E8]"
                  />
                </div>

                {/* In Stock */}
                <label className="flex items-center gap-2 text-xs font-bold text-[#102A50] cursor-pointer pt-2 border-t border-[#DCEBFA]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded text-[#0866E8] w-4 h-4"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Sheet Footer */}
              <div className="p-3.5 border-t border-[#DCEBFA] bg-[#F7FBFF] flex items-center gap-2 safe-bottom-nav">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-xs font-black text-[#102A50] transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-[2] py-2.5 rounded-xl bg-[#0866E8] text-white text-xs font-black shadow-md shadow-[#0866E8]/25 transition-all"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F7FBFF] w-full max-w-full overflow-x-hidden">
      <div className="hidden md:block">
        <Header />
      </div>
      <Suspense fallback={<div className="p-12 text-center text-sm font-medium text-slate-400">Loading catalog...</div>}>
        <ProductsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
