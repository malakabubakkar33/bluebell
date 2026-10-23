'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, ArrowRight, ShoppingCart, Check, Eye } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

export const FeaturedProducts: React.FC = () => {
  const { products } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'New':
        return 'bg-sky-500 text-white';
      case 'Best Seller':
        return 'bg-emerald-500 text-white';
      case 'Sale':
        return 'bg-rose-500 text-white';
      case 'Hot':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  // Display top 6 featured best sellers
  const displayProducts = products.slice(0, 6);

  return (
    <section id="products" className="py-10 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-[11px] font-black tracking-wider text-sky-600 uppercase block mb-1">
              Top Rated Devices
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Best Selling Flagships
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 hover:underline group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2-Column Grid on Mobile, 3 on Tablet, 6 on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-4">
          {displayProducts.map((product) => {
            const inWishlist = isInWishlist(product.id);
            const isJustAdded = addedId === product.id;
            const isOutOfStock = (product.stock ?? 10) <= 0;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`group relative bg-white border border-slate-100 hover:border-sky-300 rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 ${isOutOfStock ? 'opacity-85' : ''}`}
              >
                {/* Top Badge & Wishlist */}
                <div className="flex justify-between items-start mb-1.5 z-10">
                  {isOutOfStock ? (
                    <span className="text-[9px] sm:text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                      Out of Stock
                    </span>
                  ) : product.badge ? (
                    <span
                      className={`text-[9px] sm:text-[10px] font-black tracking-wide px-2 py-0.5 rounded-full ${getBadgeStyle(
                        product.badge
                      )} shadow-sm`}
                    >
                      {product.badge}
                    </span>
                  ) : (
                    <div />
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    title="Wishlist"
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all ${
                      inWishlist
                        ? 'bg-rose-50 text-rose-500'
                        : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-500'
                    }`}
                  >
                    <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Product Image with Center Hover View Icon */}
                <div className="relative w-full aspect-square my-1.5 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/50">
                  {/* Subtle hover radial glow */}
                  <div className="absolute inset-0 rounded-full bg-sky-400/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <img
                    src={product.image}
                    alt={product.name}
                    className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 object-contain transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                    loading="lazy"
                  />

                  {/* Center Floating View Icon on Hover */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-xl">
                    <span className="w-9 h-9 rounded-full bg-white text-sky-600 shadow-lg flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-200">
                      <Eye className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Product Information */}
                <div className="space-y-0.5 sm:space-y-1 my-2">
                  <h3
                    className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1 font-medium">
                    {product.subtitle}
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 pt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">{product.rating}</span>
                    <span className="text-[9px] sm:text-[10px] text-slate-400">({product.reviewCount})</span>
                  </div>

                  {/* Pricing */}
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                    <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-slate-400 line-through font-mono">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add Button or Out of Stock */}
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full py-2 px-2.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed mt-1 select-none"
                  >
                    <span>Out of Stock</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAdd(product, e)}
                    disabled={isJustAdded}
                    className={`w-full py-2 px-2.5 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all mt-1 ${
                      isJustAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-sky-50 hover:bg-sky-500 text-sky-600 hover:text-white'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
