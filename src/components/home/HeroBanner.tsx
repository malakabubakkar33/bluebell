'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '@/context/ProductsContext';

interface HeroSlide {
  id: number;
  brandTag: string;
  heading: string;
  description: string;
  price: string;
  originalPrice?: string;
  specs: { label: string; value: string }[];
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  image: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    brandTag: 'OFFICIAL FLAGSHIP',
    heading: 'iPhone 16 Pro Max',
    description: 'A18 Pro chip, Grade 5 Titanium design, and advanced 48MP Fusion camera system.',
    price: 'Rs. 449,999',
    originalPrice: 'Rs. 489,999',
    specs: [
      { label: 'Chipset', value: 'A18 Pro (3nm)' },
      { label: 'Display', value: '6.9" Super Retina XDR' },
      { label: 'Battery', value: 'Up to 33 hrs playback' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?brand=Apple',
    secondaryCtaText: 'Explore Features',
    secondaryCtaLink: '/products?brand=Apple',
    image: '/banners/hero-slide-1.jpg',
    alt: 'iPhone 16 Pro Max Titanium Flagship Banner',
  },
  {
    id: 2,
    brandTag: 'GALAXY INTELLIGENCE',
    heading: 'Samsung Galaxy S24 Ultra',
    description: 'Galaxy AI is here. Epic 200MP camera zoom and built-in S-Pen in titanium casing.',
    price: 'Rs. 389,999',
    originalPrice: 'Rs. 419,999',
    specs: [
      { label: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { label: 'Camera', value: '200MP Quad Tele' },
      { label: 'AI Suite', value: 'Live Translate & Circle' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?brand=Samsung',
    secondaryCtaText: 'View Galaxy Lineup',
    secondaryCtaLink: '/products?brand=Samsung',
    image: '/banners/hero-slide-2.jpg',
    alt: 'Samsung Galaxy S24 Ultra Titanium Flagship Banner',
  },
  {
    id: 3,
    brandTag: 'FOLDABLE INNOVATION',
    heading: 'Galaxy Z Fold5 & Flip5',
    description: 'Massive immersive screen that folds to fit in your pocket. Dual-app multitasking perfected.',
    price: 'Rs. 349,999',
    originalPrice: 'Rs. 379,999',
    specs: [
      { label: 'Main Display', value: '7.6" Dynamic AMOLED 2X' },
      { label: 'Hinge', value: 'Zero-Gap Flex Hinge' },
      { label: 'Productivity', value: 'Multi-Window Taskbar' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?category=smartphones',
    secondaryCtaText: 'See Foldables',
    secondaryCtaLink: '/products?category=smartphones',
    image: '/banners/hero-slide-3.jpg',
    alt: 'Samsung Galaxy Foldable Showcase Banner',
  },
  {
    id: 4,
    brandTag: 'NEXT-GEN PERFORMANCE',
    heading: 'iPad Pro M4 Series',
    description: 'Outrageous power in an impossibly thin design with Ultra Retina XDR tandem OLED display.',
    price: 'Rs. 329,999',
    originalPrice: 'Rs. 359,999',
    specs: [
      { label: 'Processor', value: 'Apple M4 (3nm)' },
      { label: 'Display', value: 'Tandem OLED XDR' },
      { label: 'Thickness', value: '5.1mm Ultrathin' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?category=tablets',
    secondaryCtaText: 'Explore iPads',
    secondaryCtaLink: '/products?category=tablets',
    image: '/banners/hero-slide-4.jpg',
    alt: 'Apple iPad Pro M4 Ultra Retina Banner',
  },
];

export const HeroBanner: React.FC = () => {
  const { banners } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map slot overrides onto default HERO_SLIDES for clean ad artwork
  const displaySlides: HeroSlide[] = useMemo(() => {
    if (!banners || banners.length === 0) {
      return HERO_SLIDES;
    }

    const slides: HeroSlide[] = [];
    const usedCustomIds = new Set<string>();

    HERO_SLIDES.forEach((defaultSlide, idx) => {
      const slotNum = idx + 1;
      const matching = (banners || []).find(
        (b) => String(b.id) === `banner-${slotNum}` || String(b.id) === String(slotNum)
      );

      if (matching) {
        usedCustomIds.add(String(matching.id));
        if (matching.status === 'Active') {
          slides.push({
            id: slotNum,
            brandTag: matching.tag || matching.brand?.toUpperCase() || defaultSlide.brandTag,
            heading: matching.title || defaultSlide.heading,
            description: matching.subtitle || matching.tagline || defaultSlide.description,
            price: matching.price || defaultSlide.price,
            originalPrice: (matching as any).originalPrice || defaultSlide.originalPrice,
            specs: matching.specs && matching.specs.length > 0
              ? matching.specs.map((s: any) => ({ label: s.label, value: s.desc || s.value }))
              : defaultSlide.specs,
            primaryCtaText: 'Shop Now',
            primaryCtaLink: matching.link || defaultSlide.primaryCtaLink,
            secondaryCtaText: 'Explore',
            secondaryCtaLink: matching.link || defaultSlide.secondaryCtaLink,
            image: matching.image || defaultSlide.image,
            alt: matching.title || defaultSlide.alt,
          });
        }
      } else {
        slides.push(defaultSlide);
      }
    });

    (banners || []).forEach((b, idx) => {
      if (!usedCustomIds.has(String(b.id)) && b.status === 'Active') {
        slides.push({
          id: 100 + idx,
          brandTag: b.tag || b.brand?.toUpperCase() || 'ADVERTISEMENT',
          heading: b.title,
          description: b.subtitle || b.tagline || '',
          price: b.price || '',
          specs: [],
          primaryCtaText: 'Shop Now',
          primaryCtaLink: b.link || '/products',
          secondaryCtaText: 'Explore',
          secondaryCtaLink: b.link || '/products',
          image: b.image,
          alt: b.title,
        });
      }
    });

    return slides.length > 0 ? slides : HERO_SLIDES;
  }, [banners]);

  const totalSlides = displaySlides.length;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Touch swipe gesture handlers for mobile
  const minSwipeDistance = 40;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    setIsPaused(false);
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) nextSlide();
      else prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 30 },
        opacity: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 260, damping: 30 },
        opacity: { duration: 0.35 },
      },
    }),
  };

  const currentSlideSafe = currentSlide >= totalSlides ? 0 : currentSlide;
  const slide = displaySlides[currentSlideSafe] || displaySlides[0];

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-slate-950 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Promotional Ad Banner Showcase"
    >
      {/* Ad Banner Container - Clean Image Showcase */}
      <div className="relative w-full h-[220px] xs:h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] xl:h-[580px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Pure Ad Image with optional click navigation */}
            <Link
              href={slide.primaryCtaLink || '/products'}
              className="block w-full h-full relative group cursor-pointer"
              title={slide.heading || slide.alt}
            >
              <img
                src={slide.image}
                alt={slide.alt || 'Advertisement Banner'}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                loading={currentSlide === 0 ? 'eager' : 'lazy'}
                fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Floating Navigation Chevrons */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous advertisement"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next advertisement"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Slide Indicators (Clean Dots) */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          {displaySlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to ad slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideSafe
                  ? 'w-6 bg-[#0878F9] shadow-md shadow-[#0878F9]/50'
                  : 'w-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
