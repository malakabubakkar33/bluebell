import React from 'react';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustBenefitsStrip } from '@/components/home/TrustBenefitsStrip';
import { CategoryShortcuts } from '@/components/home/CategoryShortcuts';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PartnershipShowcase } from '@/components/home/PartnershipShowcase';
import { PromoBanner } from '@/components/home/PromoBanner';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* 1. Header with Announcement Bar, Search, Account, Cart, and Category Nav */}
      <Header />

      {/* 2. Hero Promotional Carousel with Dual iPhone Pedestal Showcase */}
      <HeroBanner />

      {/* 3. Horizontal Trust Benefits Strip with 6 Guarantee Pillars */}
      <TrustBenefitsStrip />

      {/* 4. Explore By Category (8 Card Grid) */}
      <CategoryShortcuts />

      {/* 5. Best Selling Flagships (6 Product Cards with Add to Cart) */}
      <FeaturedProducts />

      {/* 6. Blue Bell × Mercantile Landscape Partnership Showcase */}
      <PartnershipShowcase />

      {/* 7. Hot Promotional Offers (3 Campaign Cards) */}
      <PromoBanner />

      {/* 8. Why Shop at Blue Bells? (5 Benefit Pillars) */}
      <WhyChooseUs />

      {/* 9. Deep Navy Comprehensive 5-Column Footer with Trust Strip */}
      <Footer />
    </main>
  );
}
