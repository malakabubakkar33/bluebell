'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts, BannerItem } from '@/context/ProductsContext';

interface DisplaySlide {
  id: string | number;
  image: string;
  link: string;
  alt: string;
}

const DEFAULT_FALLBACK_SLIDES: DisplaySlide[] = [
  {
    id: 'default-1',
    image: '/banners/hero-slide-1.jpg',
    link: '/products?brand=Apple',
    alt: 'iPhone 16 Pro Max Flagship Showcase',
  },
  {
    id: 'default-2',
    image: '/banners/hero-slide-2.jpg',
    link: '/products?brand=Samsung',
    alt: 'Samsung Galaxy S24 Ultra Flagship Showcase',
  },
  {
    id: 'default-3',
    image: '/banners/hero-slide-3.jpg',
    link: '/products?category=smartphones',
    alt: 'Galaxy Z Foldable Innovation Showcase',
  },
  {
    id: 'default-4',
    image: '/banners/hero-slide-4.jpg',
    link: '/products?category=tablets',
    alt: 'Apple iPad Pro M4 Showcase',
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

  // If active banners exist in database/context, display ONLY those active banners!
  // No old hardcoded default slides will remain once custom active banners exist.
  const displaySlides: DisplaySlide[] = useMemo(() => {
    // 1. Try context banners
    const activeFromContext = (banners || []).filter((b) => b && b.status === 'Active' && b.image);
    if (activeFromContext.length > 0) {
      return activeFromContext.map((b, idx) => ({
        id: b.id || idx + 1,
        image: b.image,
        link: b.link || '/products',
        alt: b.title || `Advertisement Banner ${idx + 1}`,
      }));
    }

    // 2. Try localStorage cache for instant hydration
    if (typeof window !== 'undefined') {
      try {
        const cachedRaw = localStorage.getItem('bluebell_cached_banners');
        if (cachedRaw) {
          const parsed: BannerItem[] = JSON.parse(cachedRaw);
          const activeFromCache = (parsed || []).filter((b) => b && b.status === 'Active' && b.image);
          if (activeFromCache.length > 0) {
            return activeFromCache.map((b, idx) => ({
              id: b.id || idx + 1,
              image: b.image,
              link: b.link || '/products',
              alt: b.title || `Advertisement Banner ${idx + 1}`,
            }));
          }
        }
      } catch {}
    }

    // 3. Fallback only if database is completely empty
    return DEFAULT_FALLBACK_SLIDES;
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
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused, totalSlides]);

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
      {/* Full Advertisement Banner Container */}
      <div className="relative w-full h-[220px] xs:h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] xl:h-[580px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={String(slide.id)}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <Link
              href={slide.link || '/products'}
              className="block w-full h-full relative group cursor-pointer"
              title={slide.alt}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                onError={(e) => {
                  // Fallback in case of broken external image URL
                  (e.target as HTMLImageElement).src = '/banners/hero-slide-1.jpg';
                }}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                loading={currentSlideSafe === 0 ? 'eager' : 'lazy'}
                fetchPriority={currentSlideSafe === 0 ? 'high' : 'auto'}
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Floating Navigation Chevrons */}
        {totalSlides > 1 && (
          <>
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

            {/* Slide Indicators */}
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
          </>
        )}
      </div>
    </section>
  );
};
