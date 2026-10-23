'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Heart, ArrowRight, ShoppingCart, Check } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

export const FeaturedProducts: React.FC = () => {
  const { products } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [addedId, setAddedId] = React.useState<string | null>(null);

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  // Badge color mapping
  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'New':
        return 'bg-brand-500 text-white';
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

  // Display top 5 featured best sellers in real time
  const displayProducts = products.slice(0, 5);

  return (
    <section id="products" className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <span className="text-xs font-extrabold tracking-wider text-brand-600 uppercase block mb-1">
              Featured Products
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Best Selling Products
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 hover:underline group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {displayProducts.map((product) => {
            const inWishlist = isInWishlist(product.id);
            const isJustAdded = addedId === product.id;

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative bg-white/80 hover:bg-white backdrop-blur-md border border-slate-100 hover:border-brand-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 block"
              >
                {/* Top Badge & Wishlist */}
                <div className="flex justify-between items-start mb-2">
                  {product.badge ? (
                    <span
                      className={`text-[10px] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full ${getBadgeStyle(
                        product.badge
                      )} shadow-sm`}
                    >
                      {product.badge}
                    </span>
                  ) : <div />}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    title="Wishlist"
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      inWishlist
                        ? 'bg-rose-50 text-rose-500'
                        : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-500 text-slate-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Product Image: Clean & Boxless without background */}
                <div className="relative w-full aspect-square my-2 flex items-center justify-center">
                  {/* Ambient radial glow on hover */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/10 via-blue-400/10 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none scale-110" />

                  <img
                    src={product.image}
                    alt={product.name}
                    className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 object-contain transition-all duration-300 group-hover:scale-115 group-hover:-translate-y-2 filter group-hover:drop-shadow-[0_12px_16px_rgba(2,132,199,0.22)]"
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="space-y-1 mb-4">
                  <h3
                    className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-1 font-medium">
                    {product.subtitle}
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{product.rating}</span>
                    <span className="text-xs text-slate-400">({product.reviewCount})</span>
                  </div>

                  {/* Pricing */}
                  <div className="pt-2 flex items-baseline gap-2">
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-slate-400 line-through font-mono">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add Button */}
                <button
                  onClick={(e) => handleAdd(product, e)}
                  disabled={isJustAdded}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isJustAdded
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 hover:bg-brand-500 text-slate-700 hover:text-white'
                  }`}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

