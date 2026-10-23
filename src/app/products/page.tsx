'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/context/ProductsContext';
import {
  SlidersHorizontal,
  Search,
  X,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

function ProductsContent() {
  const { products: storeProducts, categories: storeCategories } = useProducts();
  const productsList = storeProducts && storeProducts.length > 0 ? storeProducts : [];
  const categoriesList = storeCategories && storeCategories.length > 0 ? storeCategories : [];

  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialBrand = searchParams.get('brand') || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>(initialBrand);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(500000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

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
      if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) return false;
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
      return 0; // featured default
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

  // Reusable Filter Controls for both Desktop Sidebar & Mobile Drawer
  const renderFilterBody = () => (
    <div className="space-y-6">
      {/* Search Input */}
      <div>
        <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
          Search Devices
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="iPhone 16, Galaxy S24, iPad..."
            className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-8 text-base sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block">
            Category
          </label>
          <span className="text-[10px] font-bold text-brand-600 bg-sky-50 px-2 py-0.5 rounded-full">
            {categoriesList.length + 1}
          </span>
        </div>
        <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Categories</span>
            <span className={`text-[10px] ${selectedCategory === 'all' ? 'text-white/90' : 'text-slate-400'}`}>
              {productsList.length}
            </span>
          </button>
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <img src={cat.image} alt={cat.name} className="w-4 h-4 object-contain" />
                <span className="truncate">{cat.name}</span>
              </div>
              <span className={`text-[10px] ${selectedCategory === cat.slug ? 'text-white/90' : 'text-slate-400'}`}>
                {cat.itemCount}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider block mb-2">
          Brand
        </label>
        <div className="flex flex-wrap gap-1.5">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedBrand === brand
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
          <span>Max Price</span>
          <span className="text-brand-600 font-black text-xs">
            Rs. {priceRange.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max="500000"
          step="5000"
          value={priceRange}
          onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full accent-brand-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
        />
        <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1.5">
          <span>Rs. 5,000</span>
          <span>Rs. 500,000</span>
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pt-4 border-t border-slate-200">
        <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-700 select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12">
      {/* Page Title & Breadcrumb */}
      <div className="mb-6">
        <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
          Official Store Collection
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
          Smartphones & Accessories
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Browse our certified collection of genuine Apple iPhones, Samsung Galaxy flagships, iPads, and original accessories with verified warranty.
        </p>
      </div>

      {/* Top Mobile Bar: Filter Trigger & Sorting */}
      <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 text-brand-600 border border-brand-200 hover:bg-brand-500 hover:text-white font-bold text-xs shadow-sm transition-all"
            aria-label="Open Filter Drawer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs font-bold text-slate-500">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> products
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort products"
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 shadow-sm"
          >
            <option value="featured">Featured & Recommended</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active:
          </span>
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-brand-700 text-xs font-bold border border-sky-100">
              Category: {selectedCategory}
              <button onClick={() => setSelectedCategory('all')} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedBrand !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-brand-700 text-xs font-bold border border-sky-100">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand('all')} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-brand-700 text-xs font-bold border border-sky-100">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {priceRange < 500000 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-brand-700 text-xs font-bold border border-sky-100">
              Under Rs. {priceRange.toLocaleString()}
              <button onClick={() => setPriceRange(500000)} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-brand-700 text-xs font-bold border border-sky-100">
              "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-rose-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 underline underline-offset-2 ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters (Hidden on Mobile) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sticky top-28 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-brand-500" />
                <span>Filters</span>
              </div>
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Reset All
              </button>
            </div>
            {renderFilterBody()}
          </div>
        </aside>

        {/* Products Grid: 2 Columns on Mobile, 2 on Tablet, 3 on Desktop */}
        <section className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/70 rounded-3xl border border-slate-100 p-6">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
              <h3 className="text-base font-black text-slate-800">No products match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your price range, clearing your search query, or selecting different categories.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 bg-sky-500 text-white text-xs font-bold rounded-xl hover:bg-sky-600 shadow-md shadow-sky-500/20 transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Classic, Compact Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Classic Compact Drawer from Right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-[85vw] max-w-[320px] bg-white h-full flex flex-col justify-between z-10 rounded-l-3xl shadow-2xl overflow-hidden border-l border-sky-100"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-sky-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shadow-xs">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm text-slate-900">Filter &amp; Sort</h3>
                    <p className="text-[10px] text-slate-400">{filteredProducts.length} devices found</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-7 h-7 rounded-full bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200 transition-colors"
                  aria-label="Close Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Scrollable Compact Filter Body */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* 1. Quick Sort Tabs / Tarteeb */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Sort Order / Tarteeb
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => setSortBy('price-low')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center border transition-all ${
                        sortBy === 'price-low'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      Low Price
                    </button>
                    <button
                      onClick={() => setSortBy('price-high')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center border transition-all ${
                        sortBy === 'price-high'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      High Price
                    </button>
                    <button
                      onClick={() => setSortBy('featured')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center border transition-all ${
                        sortBy === 'featured'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      New Model
                    </button>
                    <button
                      onClick={() => setSortBy('rating')}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center border transition-all ${
                        sortBy === 'rating'
                          ? 'bg-sky-500 text-white border-sky-500 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                      }`}
                    >
                      Top Rated
                    </button>
                  </div>
                </div>

                {/* 2. Categories Chips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                      Category
                    </label>
                    <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-full">
                      {categoriesList.length + 1}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        selectedCategory === 'all'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All
                    </button>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                          selectedCategory === cat.slug
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Brand Selection */}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-2">
                    Brand
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((brand) => (
                      <button
                        key={brand}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold capitalize transition-all ${
                          selectedBrand === brand
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Price Slider */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">
                    <span>Max Budget</span>
                    <span className="text-sky-600 font-black text-xs font-mono">
                      Rs. {priceRange.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="500000"
                    step="5000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                    <span>Rs. 5,000</span>
                    <span>Rs. 500,000</span>
                  </div>
                </div>

                {/* 5. In Stock Toggle */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-sky-500 focus:ring-sky-500 w-4 h-4"
                    />
                    <span>PTA In Stock Devices Only</span>
                  </label>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-[2] py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-sky-500/25 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Show {filteredProducts.length} Results</span>
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
    <main className="min-h-screen flex flex-col bg-white">
      <PageHeader title="Products" />
      <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-sm font-medium text-slate-400">Loading catalog...</div>}>
        <ProductsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
