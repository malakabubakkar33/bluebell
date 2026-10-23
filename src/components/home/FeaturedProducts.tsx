'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, ArrowRight, ShoppingCart, Check } from 'lucide-react';
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
        return 'bg-[#0878F9] text-white';
      case 'Best Seller':
        return 'bg-emerald-500 text-white';
      case 'Sale':
        return 'bg-rose-500 text-white';
      case 'Hot':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-[#102A56] text-white';
    }
  };

  // Top 6 featured best sellers matching reference
  const displayProducts = products.slice(0, 6);

  return (
    <section id="products" className="py-8 sm:py-14 bg-white border-b border-[#DFEBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-8 gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#102A56] tracking-tight">
              Best Selling Flagships
            </h2>
            <p className="text-xs sm:text-sm text-[#52749D] font-medium mt-1">
              Top requested smartphones in Pakistan with PTA approval and warranty
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0756C9] hover:text-[#063B8E] transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2 Products Per Row on Mobile (Compact), 3 on Tablet, 6 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3.5 lg:gap-4">
          {displayProducts.map((product) => {
            const inWishlist = isInWishlist(product.id);
            const isJustAdded = addedId === product.id;
            const isOutOfStock = (product.stock ?? 10) <= 0;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`group relative bg-white/90 backdrop-blur-md border border-[#DFEBF8] hover:border-[#0878F9] rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-[#0878F9]/10 transition-all duration-300 ${
                  isOutOfStock ? 'opacity-85' : ''
                }`}
              >
                {/* Top Badge & Wishlist Action */}
                <div className="flex justify-between items-start mb-1 z-10">
                  {isOutOfStock ? (
                    <span className="text-[8px] sm:text-[10px] font-black tracking-wide px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
                      Out of Stock
                    </span>
                  ) : product.badge ? (
                    <span
                      className={`text-[8px] sm:text-[10px] font-black tracking-wide px-1.5 sm:px-2 py-0.5 rounded-full ${getBadgeStyle(
                        product.badge
                      )} shadow-xs`}
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
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      inWishlist
                        ? 'bg-rose-50 text-rose-500'
                        : 'bg-[#F2F8FF] hover:bg-rose-50 text-[#8394AB] hover:text-rose-500'
                    }`}
                  >
                    <Heart
                      className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                        inWishlist ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Product Image */}
                <div className="relative w-full aspect-square my-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-50/50 p-1">
                  <div className="absolute inset-0 rounded-full bg-[#0878F9]/5 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <img
                    src={product.image}
                    alt={product.name}
                    className="relative z-10 w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
                    loading="lazy"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-0.5 my-1.5 text-left">
                  <h3
                    className="font-bold text-xs sm:text-sm text-[#102A56] group-hover:text-[#0878F9] transition-colors line-clamp-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-[9px] sm:text-xs text-[#8394AB] line-clamp-1 font-medium">
                    {product.subtitle}
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1 pt-0.5">
                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                    <span className="text-[9px] sm:text-xs font-bold text-[#102A56]">
                      {product.rating}
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-[#8394AB]">
                      ({product.reviewCount})
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="pt-0.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                    <span className="text-[11px] sm:text-sm font-black text-[#102A56] font-mono">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[9px] text-[#8394AB] line-through font-mono hidden sm:inline">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Solid Bright Blue Add to Cart Button (Compact for Mobile) */}
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full py-1.5 px-2 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed mt-1 select-none"
                  >
                    <span>Out of Stock</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAdd(product, e)}
                    disabled={isJustAdded}
                    className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all mt-1 shadow-xs cursor-pointer ${
                      isJustAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#0878F9] hover:bg-[#0665D0] text-white active:scale-95'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>Add to Cart</span>
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
