import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/home/HeroBanner';
import { CategoryShortcuts } from '@/components/home/CategoryShortcuts';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PartnershipShowcase } from '@/components/home/PartnershipShowcase';
import { PromoBanner } from '@/components/home/PromoBanner';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* 1. Header with Utility Bar, Search, and Category Nav */}
      <Header />

      {/* 2. Hero Promotional Carousel with Dual iPhone Showcase */}
      <HeroBanner />

      {/* 3. Category Shortcuts Grid (8 Items) */}
      <CategoryShortcuts />

      {/* 4. Best Selling Featured Products */}
      <FeaturedProducts />

      {/* 5. Blue Bell x Mercantile Cinematic Partnership Showcase */}
      <PartnershipShowcase />

      {/* 6. Samsung Promotional Campaign Banner */}
      <PromoBanner />

      {/* 6. Why Choose Blue Bell? Trust Pillars */}
      <WhyChooseUs />

      {/* 7. Deep Navy Comprehensive Footer */}
      <Footer />
    </main>
  );
}
