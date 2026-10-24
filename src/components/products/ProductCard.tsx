'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
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

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'New':
        return 'bg-[#0866E8] text-white';
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
      className={`group relative bg-white border border-[#DCEBFA] hover:border-[#0866E8] rounded-2xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-200 w-full min-w-0 ${
        isOutOfStock ? 'opacity-80' : ''
      }`}
    >
      {/* Top Badge & Wishlist Action */}
      <div className="flex justify-between items-start mb-1 z-10 w-full">
        {isOutOfStock ? (
          <span className="text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full bg-[#E5485B] text-white shadow-xs">
            Out of Stock
          </span>
        ) : product.badge ? (
          <span
            className={`text-[9px] font-black tracking-wide px-2 py-0.5 rounded-full shadow-xs truncate max-w-[85px] sm:max-w-none ${getBadgeStyle(
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
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
            inWish
              ? 'bg-rose-50 text-[#E5485B]'
              : 'bg-[#EDF6FF] hover:bg-rose-50 text-[#647A98] hover:text-[#E5485B]'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              inWish ? 'fill-[#E5485B] text-[#E5485B]' : ''
            }`}
          />
        </button>
      </div>

      {/* Product Image */}
      <div className="relative w-full aspect-square my-1.5 flex items-center justify-center overflow-hidden rounded-xl bg-[#F7FBFF] p-2">
        <img
          src={product.image}
          alt={product.name}
          className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 object-contain transition-all duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-0.5 mt-1 text-left min-w-0 w-full">
        <h3
          className="font-bold text-xs sm:text-sm text-[#102A50] group-hover:text-[#0866E8] transition-colors truncate"
          title={product.name}
        >
          {product.name}
        </h3>

        <p className="text-[10px] sm:text-xs text-[#647A98] truncate font-medium">
          {product.subtitle || 'PTA Approved Flagship'}
        </p>
      </div>

      {/* Pricing, Rating & Bottom Right Cart Button Matching Screen 3 */}
      <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-[#DCEBFA]/50">
        <div className="min-w-0 flex-1 pr-1.5">
          <div className="text-xs sm:text-sm font-black text-[#102A50] font-mono truncate">
            Rs. {product.price.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] sm:text-xs font-bold text-[#102A50]">
              {product.rating}
            </span>
            <span className="text-[9px] text-[#647A98]">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Circular Blue Shopping Cart Button */}
        <button
          onClick={handleAddToCart}
          type="button"
          disabled={isOutOfStock || isAdded}
          aria-label={isAdded ? 'Added to cart' : 'Add to cart'}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-xs cursor-pointer ${
            isAdded
              ? 'bg-[#16A675] text-white scale-105'
              : isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-[#0866E8] hover:bg-[#0645B5] text-white active:scale-90 hover:scale-105'
          }`}
        >
          {isAdded ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </Link>
  );
};
