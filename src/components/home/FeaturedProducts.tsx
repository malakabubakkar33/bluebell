'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';
import { ProductCard } from '@/components/products/ProductCard';

export const FeaturedProducts: React.FC = () => {
  const { products } = useProducts();

  // Top 6 featured best sellers matching reference
  const displayProducts = products.slice(0, 6);

  return (
    <section id="products" className="py-6 sm:py-10 bg-brand-surface/30 border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-brand-dark tracking-tight">
              Best Selling Flagships
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted hidden sm:block mt-0.5">
              Top requested smartphones in Pakistan with PTA approval and warranty
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-primary hover:text-brand-deep transition-colors group flex-shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 2-Column Mobile Grid (Screen 1 & Screen 3 layout), 3 on Tablet, 6 on Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
