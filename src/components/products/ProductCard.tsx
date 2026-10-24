'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, Eye, ShoppingCart, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, openQuickView } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'New':
        return 'bg-brand-500 text-white';
      case 'Best Seller':
        return 'bg-emerald-500 text-white';
      case 'Sale':
        return 'bg-rose-500 text-white';
      case 'Hot':
      case 'Hot Flagship':
        return 'bg-amber-500 text-white';
      case 'AI Powered':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const inWish = isInWishlist(product.id);
  const isOutOfStock = (product.stock ?? 10) <= 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group relative bg-white/95 backdrop-blur-md border border-[#DFEBF8] hover:border-[#0878F9] rounded-2xl p-2 sm:p-3 flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-[#0878F9]/10 transition-all duration-300 w-full min-w-0 ${
        isOutOfStock ? 'opacity-85' : ''
      }`}
    >
      {/* Top Badge & Wishlist Action */}
      <div className="flex justify-between items-start mb-1 z-10 w-full">
        {isOutOfStock ? (
          <span className="text-[8px] sm:text-[10px] font-black tracking-wide px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-xs">
            Out of Stock
          </span>
        ) : product.badge ? (
          <span
            className={`text-[8px] sm:text-[10px] font-black tracking-wide px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs truncate max-w-[95px] sm:max-w-none ${getBadgeStyle(
              product.badge
            )}`}
          >
            {product.badge}
          </span>
        ) : (
          <div />
        )}

        <button
          onClick={handleWishlist}
          type="button"
          aria-label="Add to wishlist"
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            inWish
              ? 'bg-rose-50 text-rose-500'
              : 'bg-[#F2F8FF] hover:bg-rose-50 text-[#8394AB] hover:text-rose-500'
          }`}
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
              inWish ? 'fill-rose-500 text-rose-500' : ''
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
          className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-0.5 my-1.5 text-left min-w-0 w-full">
        <h3
          className="font-bold text-xs sm:text-sm text-[#102A56] group-hover:text-[#0878F9] transition-colors line-clamp-1"
          title={product.name}
        >
          {product.name}
        </h3>

        <p className="text-[9px] sm:text-xs text-[#8394AB] line-clamp-1 font-medium">
          {product.subtitle || 'PTA Approved Flagship'}
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
        <div className="pt-0.5 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5 min-w-0">
          <span className="text-[11px] sm:text-sm font-black text-[#102A56] font-mono truncate">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[9px] text-[#8394AB] line-through font-mono hidden sm:inline truncate">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Solid Bright Blue Add to Cart Button (Full width, clean like Home Page) */}
      {isOutOfStock ? (
        <button
          type="button"
          disabled
          className="w-full py-1.5 px-2 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed mt-1 select-none"
        >
          <span>Out of Stock</span>
        </button>
      ) : (
        <button
          onClick={handleAddToCart}
          type="button"
          disabled={isAdded}
          aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
          className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1 transition-all mt-1 shadow-xs cursor-pointer ${
            isAdded
              ? 'bg-emerald-500 text-white'
              : 'bg-[#0878F9] hover:bg-[#0665D0] text-white active:scale-95'
          }`}
        >
          {isAdded ? (
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
};
