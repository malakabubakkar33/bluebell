'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { products } = useProducts();

  // Find all products that are in the user's wishlist
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <main className="min-h-screen flex flex-col bg-[#F8FAFD] w-full max-w-full overflow-x-hidden">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-[#8394AB] mb-6">
          <Link href="/" className="hover:text-[#0756C9] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#C7E5FF]" />
          <span className="text-[#0756C9]">My Wishlist</span>
        </nav>

        {/* Page Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#DFEBF8] gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF7FF] text-[#0756C9] flex items-center justify-center border border-[#C7E5FF]">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#102A56] tracking-tight">
                My Saved Wishlist
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#52749D] font-medium mt-1">
              Keep track of your favorite smartphones, flagships &amp; accessories.
            </p>
          </div>

          <div className="text-xs font-bold text-[#0756C9] bg-white px-4 py-2 rounded-full border border-[#DFEBF8] shadow-xs self-start sm:self-auto">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'} Saved
          </div>
        </div>

        {/* EMPTY STATE */}
        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#DFEBF8] shadow-sm p-8 sm:p-16 text-center max-w-xl mx-auto my-8">
            <div className="w-20 h-20 rounded-full bg-[#EAF7FF] border border-[#C7E5FF] text-[#0756C9] flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Heart className="w-9 h-9" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-[#102A56] mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#52749D] font-medium max-w-md mx-auto mb-8 leading-relaxed">
              You haven&apos;t added any devices to your wishlist yet. Explore our genuine Apple iPhones, Samsung Galaxy devices, and accessories with official warranty.
            </p>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#0756C9] hover:bg-[#063B8E] text-white font-extrabold text-sm shadow-md shadow-[#0756C9]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#DFEBF8] hover:border-[#078BEE]/40 shadow-xs hover:shadow-lg transition-all duration-300 p-4 flex flex-col justify-between group relative"
              >
                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-500 border border-[#DFEBF8] flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="Remove from wishlist"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Top: Image & Badge */}
                <div>
                  <Link href={`/products/${product.id}`} className="relative block aspect-square rounded-xl bg-[#F8FAFD] p-4 mb-3 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[#0756C9] text-white px-2 py-0.5 rounded-full">
                        PTA APPROVED
                      </span>
                    </div>
                  </Link>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#078BEE] uppercase tracking-wider block">
                      {product.brand}
                    </span>
                    <Link
                      href={`/products/${product.id}`}
                      className="text-sm font-black text-[#102A56] hover:text-[#0756C9] transition-colors line-clamp-1 block"
                    >
                      {product.name}
                    </Link>
                    <p className="text-[11px] text-[#52749D] font-medium line-clamp-1">
                      {product.subtitle || '100% Original Sealed Box Pack'}
                    </p>
                  </div>
                </div>

                {/* Bottom: Price & Add to Cart */}
                <div className="pt-4 mt-4 border-t border-[#DFEBF8]">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[9px] font-bold text-[#8394AB] block uppercase">Price</span>
                      <span className="text-base font-black text-[#102A56] font-mono">
                        Rs. {product.price.toLocaleString()}
                      </span>
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-[#8394AB] line-through font-mono">
                        Rs. {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => addToCart(product, 1)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0756C9] hover:bg-[#063B8E] text-white text-xs font-black shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
