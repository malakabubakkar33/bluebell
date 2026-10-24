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
    <div
      className={`group relative bg-white rounded-2xl border border-slate-100/90 hover:border-brand-300 shadow-xs hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden min-w-0 w-full ${
        isOutOfStock ? 'opacity-85' : ''
      }`}
    >
      {/* Top badges & Wishlist */}
      <div className="absolute top-2.5 inset-x-2.5 sm:top-3 sm:inset-x-3 flex items-center justify-between z-10 pointer-events-none">
        {isOutOfStock ? (
          <span className="text-[9px] sm:text-[10px] font-black tracking-wide uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs bg-rose-600 text-white pointer-events-auto">
            Out of Stock
          </span>
        ) : product.badge ? (
          <span
            className={`text-[9px] sm:text-[10px] font-black tracking-wide uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs truncate max-w-[95px] sm:max-w-none pointer-events-auto ${getBadgeStyle(
              product.badge
            )}`}
          >
            {product.badge}
          </span>
        ) : (
          <span />
        )}

        <button
          onClick={handleWishlist}
          type="button"
          aria-label="Add to wishlist"
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all pointer-events-auto shrink-0 ${
            inWish
              ? 'bg-rose-50 text-rose-500 ring-1 ring-rose-200'
              : 'bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${inWish ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image: Clean, Responsive without background distortion */}
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square p-2.5 sm:p-4 flex items-center justify-center bg-slate-50/40 group-hover:bg-sky-50/30 transition-colors"
      >
        {/* Ambient radial glow on hover */}
        {!isOutOfStock && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/10 via-blue-400/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scale-110" />
        )}

        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`relative z-10 w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 max-w-[85%] max-h-[85%] object-contain transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-1 filter group-hover:drop-shadow-[0_10px_14px_rgba(2,132,199,0.2)] ${
            isOutOfStock ? 'grayscale-[50%]' : ''
          }`}
        />

        {/* View Details hover action (Desktop only) */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-3 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <span className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all">
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Details</span>
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs text-slate-400 mb-1 min-w-0">
            <span className="font-bold text-brand-600 uppercase tracking-wider text-[9px] sm:text-[11px] truncate">
              {product.brand}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 font-bold shrink-0 text-[10px] sm:text-xs">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal hidden xs:inline">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 text-xs sm:text-sm leading-snug sm:leading-normal min-h-[2rem] sm:min-h-[2.5rem]">
              {product.name}
            </h3>
          </Link>

          {/* Subtitle (Tablet/Desktop only) */}
          <p className="hidden sm:block text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
            {product.subtitle || 'Official PTA Approved device with manufacturer warranty'}
          </p>

          {/* Warranty / Stock line */}
          <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 text-[10px] sm:text-[11px] min-w-0 border-t border-slate-50">
            <div className="flex items-center gap-1 text-emerald-600 font-medium truncate min-w-0">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">
                {product.warranty ? product.warranty.replace(' Official Warranty', ' Warranty') : 'PTA Approved'}
              </span>
            </div>
            {isOutOfStock ? (
              <span className="shrink-0 font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">
                Out of Stock
              </span>
            ) : (
              <span className="shrink-0 font-medium text-slate-400 text-[9px] sm:text-[10px]">
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <div className="text-xs xs:text-sm sm:text-base lg:text-lg font-black text-slate-900 tracking-tight truncate">
              Rs. {product.price.toLocaleString()}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-[10px] sm:text-xs text-slate-400 line-through truncate">
                Rs. {product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="h-7 sm:h-9 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none shrink-0"
            >
              <span className="hidden sm:inline">Out of Stock</span>
              <span className="sm:hidden">Sold</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              type="button"
              disabled={isAdded}
              aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
              className={`h-7 sm:h-9 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-200 shadow-xs shrink-0 active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="hidden sm:inline">Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
