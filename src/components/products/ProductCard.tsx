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

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100/80 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 hover:border-brand-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top badges & Wishlist */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
        {product.badge ? (
          <span
            className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm ${getBadgeStyle(
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
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            inWish
              ? 'bg-rose-50 text-rose-500'
              : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWish ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Product Image: Clean & Boxless without background */}
      <Link href={`/products/${product.id}`} className="relative block aspect-square p-6 flex items-center justify-center">
        {/* Ambient radial glow on hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/10 via-blue-400/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scale-110" />

        <img
          src={product.image}
          alt={product.name}
          className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 object-contain transition-all duration-300 group-hover:scale-115 group-hover:-translate-y-2 filter group-hover:drop-shadow-[0_12px_16px_rgba(2,132,199,0.22)]"
        />

        {/* View Details hover action */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
          <span className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg shadow-brand-500/30 hover:bg-brand-700 transition-all">
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Details</span>
          </span>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-brand-600 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          <Link href={`/products/${product.id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 text-sm sm:text-base">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
            {product.subtitle || 'Official PTA Approved device with manufacturer warranty'}
          </p>

          <div className="flex items-center gap-1 mt-2 text-[11px] text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{product.warranty || '1 Year Official Warranty'}</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Rs. {product.price.toLocaleString()}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-slate-400 line-through">
                Rs. {product.originalPrice.toLocaleString()}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            type="button"
            disabled={isAdded}
            className={`h-9 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all duration-200 shadow-sm ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20 active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
