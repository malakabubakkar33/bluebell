'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdSlide {
  id: number;
  title: string;
  image: string;
  link: string;
}

const AD_SLIDES: AdSlide[] = [
  {
    id: 1,
    title: 'Apple iPhone 18 Pro Max - Bigger. Smarter. More Powerful.',
    image: '/banners/ad-iphone-18.jpg',
    link: '/products?search=iPhone%2018',
  },
  {
    id: 2,
    title: 'Samsung Galaxy S24 Ultra - Galaxy AI is here',
    image: '/banners/ad-samsung-s24.jpg',
    link: '/products?search=S24',
  },
  {
    id: 3,
    title: 'Apple iPhone 17 Pro Max - Pro Power. Pro Performance.',
    image: '/banners/ad-iphone-17.jpg',
    link: '/products?search=iPhone%2017',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = AD_SLIDES.length;

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
    const timer = setInterval(nextSlide, 6500);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Touch swipe gesture handlers for mobile
  const minSwipeDistance = 40;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
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
  const slide = AD_SLIDES[currentSlideSafe];

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#F4F9FF] via-[#EAF7FF] to-white border-b border-[#DFEBF8]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Promotional Showcase"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0756C9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#21B8F3]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Left Arrow Carousel Button */}
      <button
        onClick={prevSlide}
        aria-label="Previous banner"
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#0756C9] border border-[#DFEBF8] shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Floating Right Arrow Carousel Button */}
      <button
        onClick={nextSlide}
        aria-label="Next banner"
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/90 hover:bg-white text-[#0756C9] border border-[#DFEBF8] shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Main Banner Container:
          On mobile: Full width edge-to-edge with generous, impactful height (h-[300px] sm:h-[380px])
          On desktop: Elegant max-w-7xl centered container with crisp widescreen 1024x572 aspect ratio
      */}
      <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 lg:py-8 relative z-10">
        <div className="relative w-full overflow-hidden sm:rounded-3xl shadow-sm sm:shadow-xl sm:border border-[#DFEBF8] bg-white">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={slide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <Link
                href={slide.link}
                aria-label={`Shop ${slide.title}`}
                className="relative block w-full group cursor-pointer"
              >
                {/* Responsive Image Presentation:
                    On mobile: Extra height for clear, impactful presence with full edge-to-edge width
                    On desktop: Clean widescreen presentation preserving full artwork details
                */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  width={1024}
                  height={572}
                  className="w-full h-[290px] xs:h-[330px] sm:h-[400px] md:h-[460px] lg:h-[520px] xl:h-[560px] object-cover sm:object-contain object-center bg-[#EAF7FF]"
                  loading={currentSlide === 0 ? 'eager' : 'lazy'}
                  fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
                />

                <span className="sr-only">{slide.title} - Click to explore</span>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators (Clean Luminous Dots) */}
        <div className="mt-3 sm:mt-5 flex items-center justify-center gap-2 pb-2">
          {AD_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideSafe
                  ? 'w-8 bg-[#0756C9] shadow-md shadow-[#0756C9]/40'
                  : 'w-2.5 bg-[#C7E5FF] hover:bg-sky-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
