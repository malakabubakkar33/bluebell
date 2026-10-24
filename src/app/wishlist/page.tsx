'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ArrowRight, ChevronLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';
import { ProductCard } from '@/components/products/ProductCard';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist } = useCart();
  const { products } = useProducts();

  // Find all products that are in the user's wishlist
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <main className="min-h-screen flex flex-col bg-brand-surface/30 w-full max-w-full overflow-x-hidden pb-20 md:pb-0">
      <Header />

      {/* Mobile Top App Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-brand-border sticky top-0 z-30">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-brand-dark hover:bg-brand-surface transition-colors"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <BrandLogo variant="header" />
        <div className="w-9" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-10 flex-1 w-full">
        {/* Page Heading */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 mb-6 border-b border-brand-border/60">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-brand-dark tracking-tight">
              My Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
              Keep track of your favorite smartphones, flagships &amp; accessories
            </p>
          </div>

          <div className="text-xs font-bold text-brand-primary bg-white px-3.5 py-1.5 rounded-full border border-brand-border shadow-xs">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>

        {/* EMPTY STATE */}
        {wishlistProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-brand-border/60 shadow-sm p-8 sm:p-14 text-center max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-brand-light border border-brand-border text-brand-primary flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-brand-dark mb-1.5">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto mb-6 leading-relaxed">
              You haven&apos;t saved any devices yet. Explore our genuine Apple iPhones, Samsung Galaxy flagships, and accessories.
            </p>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-primary hover:bg-brand-deep text-white font-bold text-xs sm:text-sm shadow-md shadow-brand-primary/20 transition-all cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* PRODUCT GRID matching Screen 3 */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
