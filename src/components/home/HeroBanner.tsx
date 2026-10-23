'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Truck, Award } from 'lucide-react';

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
    brandTag: 'APPLE TITANIUM SERIES',
    heading: 'iPhone 16 Pro Max',
    description: 'Engineered with Grade 5 Titanium, the revolutionary A18 Pro chip, and advanced 48MP Pro camera system.',
    price: 'Rs. 449,999',
    originalPrice: 'Rs. 479,999',
    specs: [
      { label: 'Processor', value: 'A18 Pro Chip' },
      { label: 'Display', value: '6.9" Super Retina XDR' },
      { label: 'Camera', value: '48MP 5x Optical Telephoto' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?search=iPhone',
    secondaryCtaText: 'Explore Features',
    secondaryCtaLink: '/products/p-1',
    image: '/banners/hero-slide-1.jpg',
    alt: 'Apple iPhone 16 Pro Max on Frosted Glass Pedestal',
  },
  {
    id: 2,
    brandTag: 'SAMSUNG GALAXY SERIES',
    heading: 'Galaxy S24 Ultra',
    description: 'Experience powerful performance, advanced Galaxy AI photography, titanium durability, and precision S Pen.',
    price: 'Rs. 289,999',
    originalPrice: 'Rs. 319,999',
    specs: [
      { label: 'Intelligence', value: 'Galaxy AI Built-in' },
      { label: 'Main Camera', value: '200MP Quad Tele System' },
      { label: 'Processor', value: 'Snapdragon 8 Gen 3' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?brand=Samsung',
    secondaryCtaText: 'Explore Features',
    secondaryCtaLink: '/products?search=S24',
    image: '/banners/hero-slide-2.jpg',
    alt: 'Samsung Galaxy S24 Ultra with S-Pen on Reflective Pedestal',
  },
  {
    id: 3,
    brandTag: 'NEXT-GEN FOLDABLE SERIES',
    heading: 'Galaxy Z Fold5 Ultra',
    description: 'Unfold limitless possibilities with expansive 7.6-inch Dynamic AMOLED 2X screen, seamless multitasking, and flagship camera.',
    price: 'Rs. 389,999',
    originalPrice: 'Rs. 419,999',
    specs: [
      { label: 'Main Screen', value: '7.6" 120Hz Dynamic AMOLED' },
      { label: 'Hinge Tech', value: 'Flex Mode Zero Gap' },
      { label: 'Durability', value: 'Armor Aluminum Frame' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?category=smartphones',
    secondaryCtaText: 'Explore Features',
    secondaryCtaLink: '/products?brand=Samsung',
    image: '/banners/hero-slide-3.jpg',
    alt: 'Next-Gen Foldable Ultra Flagship on Crystal Stage',
  },
  {
    id: 4,
    brandTag: 'APPLE PRO WORKSTATION',
    heading: 'iPad Pro (M4) & Watch Ultra',
    description: 'Outrageous power with breakthrough Apple M4 Silicon, Tandem OLED Ultra Retina display, and rugged aerospace titanium.',
    price: 'Rs. 349,999',
    originalPrice: 'Rs. 379,999',
    specs: [
      { label: 'Chipset', value: 'Apple M4 Silicon' },
      { label: 'Display', value: 'Tandem OLED Ultra Retina' },
      { label: 'Durability', value: 'Grade 5 Titanium Chassis' },
    ],
    primaryCtaText: 'Shop Now',
    primaryCtaLink: '/products?brand=Apple',
    secondaryCtaText: 'Explore Features',
    secondaryCtaLink: '/products?category=ipad',
    image: '/banners/hero-slide-4.jpg',
    alt: 'Apple Pro Ecosystem: iPad Pro M4, iPhone, and Watch Ultra',
  },
];

export const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = HERO_SLIDES.length;

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
    const timer = setInterval(nextSlide, 6000);
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
  const slide = HERO_SLIDES[currentSlideSafe];

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-[#0A182F] select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Flagship Technology Showcase"
    >
      {/* =========================================================================
          FULL-SCREEN WIDTH SLIDER CONTAINER (NO SIDE GAPS, NO BOXING, NO ROUNDED CARD)
         ========================================================================= */}
      <div className="relative w-full h-[520px] xs:h-[560px] sm:h-[600px] md:h-[640px] lg:h-[680px] xl:h-[720px] overflow-hidden">
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
            {/* 1. Full-Bleed Background Image */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover object-center lg:object-[70%_center] xl:object-[75%_center] transform scale-105 transition-transform duration-1000 ease-out"
                loading={currentSlide === 0 ? 'eager' : 'lazy'}
                fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
              />
            </div>

            {/* 2. Sophisticated Gradient Overlay (Keeps left text readable, preserves right phone glow) */}
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#03132B]/95 via-[#03132B]/75 to-transparent sm:via-[#03132B]/60 sm:to-transparent lg:w-[65%] xl:w-[58%] pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0A182F] to-transparent pointer-events-none z-10" />

            {/* 3. Real HTML / React Text Overlay (Left Aligned on PC View) */}
            <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col justify-center">
              <div className="max-w-xl lg:max-w-2xl space-y-3 sm:space-y-4 pt-4 sm:pt-0">
                {/* Brand Category Tag */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#21B8F3] text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#21B8F3] animate-pulse" />
                  <span>{slide.brandTag}</span>
                </div>

                {/* Main Product Heading */}
                <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-md">
                  {slide.heading}
                </h1>

                {/* Descriptive Subtitle */}
                <p className="text-xs sm:text-base text-slate-200/90 font-medium leading-relaxed drop-shadow-sm max-w-lg">
                  {slide.description}
                </p>

                {/* Starting Price Block */}
                <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-4 pt-1">
                  <span className="text-[11px] sm:text-xs uppercase font-extrabold text-sky-300 tracking-wider">
                    Starting From
                  </span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono tracking-tight drop-shadow-sm">
                    {slide.price}
                  </span>
                  {slide.originalPrice && (
                    <span className="text-xs sm:text-sm font-semibold text-slate-400 line-through font-mono">
                      {slide.originalPrice}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] sm:text-xs font-bold">
                    Official PTA Approved
                  </span>
                </div>

                {/* Specification Badges (Visible on tablet & desktop) */}
                <div className="hidden sm:flex flex-wrap gap-2 pt-1">
                  {slide.specs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white"
                    >
                      <span className="text-slate-300 font-medium">{spec.label}:</span>
                      <strong className="text-white font-bold">{spec.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Action Buttons (Primary & Secondary CTA) */}
                <div className="flex items-center gap-3 pt-2 sm:pt-3">
                  <Link
                    href={slide.primaryCtaLink}
                    className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#0878F9] hover:bg-[#0665D0] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-[#0878F9]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={slide.secondaryCtaLink}
                    className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{slide.secondaryCtaText}</span>
                  </Link>
                </div>

                {/* Trust Guarantee Badges */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] sm:text-xs text-slate-300/90 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#21B8F3]" />
                    <span>100% Original Products</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#21B8F3]" />
                    <span>Official Brand Warranty</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#21B8F3]" />
                    <span>Fast Nationwide Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating PC View Navigation Chevrons */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xl items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md shadow-xl items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        {/* Slide Indicators (Clean Luminous Dots / Pills) */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideSafe
                  ? 'w-8 bg-[#0878F9] shadow-lg shadow-[#0878F9]/50'
                  : 'w-2.5 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
