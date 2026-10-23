'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Camera,
  Smartphone,
} from 'lucide-react';
import { useProducts, BannerItem } from '@/context/ProductsContext';

interface HeroSlide {
  id: number;
  tag: string;
  brand: string;
  titlePrefix: string;
  titleHighlight: string;
  titleSuffix?: string;
  tagline: string;
  subtitle: string;
  scriptText?: string;
  specs: { label: string; desc: string; icon?: string }[];
  price: string;
  image: string;
  mobileImage?: string;
  link: string;
  themeColor: string;
}

const HIGH_RES_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: 'Latest & Best',
    brand: 'Apple iPhone',
    titlePrefix: 'iPhone ',
    titleHighlight: '18',
    titleSuffix: ' Pro Max',
    tagline: 'The next generation of iPhone is here.',
    subtitle: 'The next generation of iPhone is here.',
    scriptText: 'iPhone 18 Pro Max\nPower. Pro. Perfection.',
    specs: [
      { label: 'A20 Pro Chip', desc: 'Next-Gen Performance', icon: 'cpu' },
      { label: '48MP Pro Camera', desc: 'Pro-Level Photos', icon: 'camera' },
      { label: '6.9" Super Retina XDR', desc: 'Stunning Display', icon: 'screen' },
    ],
    price: 'Rs. 449,999',
    image: '/banners/iphone-hero-pedestal.jpg',
    mobileImage: '/banners/slide-1.png',
    link: '/products?search=iPhone%2018',
    themeColor: '#0878F9',
  },
  {
    id: 2,
    tag: 'Galaxy AI Is Here',
    brand: 'Samsung Galaxy',
    titlePrefix: 'Galaxy ',
    titleHighlight: 'S24',
    titleSuffix: ' Ultra',
    tagline: 'Smarter. Faster. More Powerful.',
    subtitle: 'Unleash mobile AI capabilities with integrated S-Pen and titanium frame.',
    scriptText: 'Galaxy S24 Ultra\nGalaxy AI Mobile Intelligence.',
    specs: [
      { label: '200MP Camera', desc: 'Nightography Zoom', icon: 'camera' },
      { label: 'Snapdragon 8 Gen 3', desc: 'Extreme Speed', icon: 'cpu' },
      { label: '6.8" Screen', desc: 'Dynamic AMOLED 2X', icon: 'screen' },
    ],
    price: 'Rs. 289,999',
    image: '/banners/hero-samsung-s24.jpg',
    mobileImage: '/banners/slide-2.png',
    link: '/products?search=S24',
    themeColor: '#0878F9',
  },
  {
    id: 3,
    tag: 'Flagship Tablet',
    brand: 'Apple iPad',
    titlePrefix: 'iPad ',
    titleHighlight: 'Pro',
    titleSuffix: ' (M4)',
    tagline: 'Thinpossible. Ultra Retina XDR.',
    subtitle: 'The ultimate iPad experience with groundbreaking M4 performance.',
    scriptText: 'iPad Pro (M4)\nThinpossible. Incredible Speed.',
    specs: [
      { label: 'M4 Silicon', desc: 'Breakthrough Speed', icon: 'cpu' },
      { label: '11" / 13"', desc: 'Ultra Retina OLED', icon: 'screen' },
      { label: 'Apple Pencil Pro', desc: 'Haptic Feedback', icon: 'camera' },
    ],
    price: 'Rs. 229,999',
    image: '/banners/hero-ipad-pro.jpg',
    mobileImage: '/banners/slide-3.png',
    link: '/products?category=ipad',
    themeColor: '#0878F9',
  },
  {
    id: 4,
    tag: 'Best Seller',
    brand: 'Apple iPhone',
    titlePrefix: 'iPhone ',
    titleHighlight: '17',
    titleSuffix: ' Pro Max',
    tagline: 'Pro Power. Pro Performance.',
    subtitle: 'A more powerful iPhone with aerospace-grade desert titanium design.',
    scriptText: 'iPhone 17 Pro Max\nTitanium. Pro Performance.',
    specs: [
      { label: 'A19 Pro Chip', desc: 'Hardware Ray Tracing', icon: 'cpu' },
      { label: '48MP Pro', desc: 'Spatial Video Capture', icon: 'camera' },
      { label: '6.9" ProMotion', desc: '120Hz Refresh Rate', icon: 'screen' },
    ],
    price: 'Rs. 389,999',
    image: '/banners/hero-iphone-17.jpg',
    mobileImage: '/banners/slide-4.png',
    link: '/products?search=iPhone%2017',
    themeColor: '#0878F9',
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

  // Active banners only with fallback to high res slides
  const activeBanners = banners && banners.length > 0 ? banners.filter((b) => b.status !== 'Inactive') : [];
  const slides: (BannerItem | HeroSlide)[] = activeBanners.length > 0 ? activeBanners : HIGH_RES_SLIDES;
  const totalSlides = slides.length;

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
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Touch swipe support
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
      x: dir > 0 ? '30%' : '-30%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 240, damping: 28 },
        opacity: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-30%' : '30%',
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 240, damping: 28 },
        opacity: { duration: 0.35 },
      },
    }),
  };

  const currentSlideSafe = currentSlide >= totalSlides ? 0 : currentSlide;
  const rawSlide = slides[currentSlideSafe] || HIGH_RES_SLIDES[0];

  // Harmonized slide object
  const slide = {
    id: rawSlide.id,
    tag: rawSlide.tag || 'Latest & Best',
    brand: rawSlide.brand || 'Apple iPhone',
    titlePrefix: (rawSlide as any).titlePrefix !== undefined ? (rawSlide as any).titlePrefix : ((rawSlide as any).title || ''),
    titleHighlight: rawSlide.titleHighlight || '18',
    titleSuffix: (rawSlide as any).titleSuffix || '',
    tagline: rawSlide.tagline || 'The next generation of iPhone is here.',
    subtitle: rawSlide.subtitle || 'The next generation of iPhone is here.',
    scriptText: (rawSlide as any).scriptText || 'iPhone 18 Pro Max\nPower. Pro. Perfection.',
    specs: rawSlide.specs && rawSlide.specs.length > 0 ? rawSlide.specs : [
      { label: 'A20 Pro Chip', desc: 'Next-Gen Performance', icon: 'cpu' },
      { label: '48MP Pro Camera', desc: 'Pro-Level Photos', icon: 'camera' },
      { label: '6.9" Super Retina XDR', desc: 'Stunning Display', icon: 'screen' },
    ],
    price: rawSlide.price || 'Rs. 449,999',
    image: rawSlide.image || '/banners/iphone-hero-pedestal.jpg',
    mobileImage: (rawSlide as any).mobileImage || (rawSlide.id === 1 ? '/banners/slide-1.png' : rawSlide.id === 2 ? '/banners/slide-2.png' : rawSlide.id === 3 ? '/banners/slide-3.png' : rawSlide.id === 4 ? '/banners/slide-4.png' : rawSlide.image),
    link: rawSlide.link || '/products',
  };

  const getSpecIcon = (iconName?: string) => {
    switch (iconName) {
      case 'cpu':
        return <Cpu className="w-4 h-4 text-[#0878F9] flex-shrink-0" />;
      case 'camera':
        return <Camera className="w-4 h-4 text-[#0878F9] flex-shrink-0" />;
      default:
        return <Smartphone className="w-4 h-4 text-[#0878F9] flex-shrink-0" />;
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-r from-[#F2F8FF] via-[#EBF4FE] to-[#F7FAFD] border-b border-[#DFEBF8]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Flagship Hero Showcase"
    >
      {/* Background Soft Blue Ambient Rings matching reference */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0878F9]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#10A9F4]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Left Arrow Carousel Button */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/90 sm:bg-white/95 hover:bg-white text-[#102A56] hover:text-[#0878F9] border border-[#DFEBF8] shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* Floating Right Arrow Carousel Button */}
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-2 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-white/90 sm:bg-white/95 hover:bg-white text-[#102A56] hover:text-[#0878F9] border border-[#DFEBF8] shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      <div className="max-w-7xl mx-auto px-3 sm:px-10 lg:px-16 py-3 sm:py-8 lg:py-14 relative z-10">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {/* =========================================================================
                1. MOBILE VIEW (< lg): ONE COMPLETE PREPARED BACKGROUND ARTWORK IMAGE
                Zero duplicate text, zero duplicate spec cards, zero duplicate prices,
                and zero second product image layered over it.
                The supplied artwork contains the complete composition and is fully clickable.
               ========================================================================= */}
            <div className="block lg:hidden w-full">
              <Link
                href={slide.link}
                aria-label={`Shop ${slide.brand} ${slide.titleHighlight} - Special Offer`}
                className="relative block w-full overflow-hidden rounded-2xl shadow-sm border border-[#DFEBF8]/90 group transition-transform duration-300 active:scale-[0.99]"
              >
                <picture>
                  <source media="(max-width: 1023px)" srcSet={slide.mobileImage || slide.image} />
                  <img
                    src={slide.mobileImage || slide.image}
                    alt={`${slide.brand} ${slide.titleHighlight} - Blue Bell Mobile Shop`}
                    width={530}
                    height={292}
                    className="w-full h-auto aspect-[16/9] sm:aspect-[1.8/1] object-contain sm:object-cover bg-white"
                    loading={currentSlide === 0 ? 'eager' : 'lazy'}
                    fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
                  />
                </picture>
                <span className="sr-only">
                  {slide.brand} {slide.titleHighlight} - {slide.price} - Shop Now
                </span>
              </Link>
            </div>

            {/* =========================================================================
                2. DESKTOP VIEW (>= lg): COMPLETE PRESERVED PEDESTAL DUAL PHONE SHOWCASE
                Left Column: Tag badge, H1 with highlight, Subtitle, 3 Spec chips, Starting price, Shop Now CTA, 3 Trust indicators.
                Right Column: Pedestal dual-device frame with script typography accent.
               ========================================================================= */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Heading, Specs, Price, Shop Now, Trust */}
              <div className="lg:col-span-7 space-y-4 text-left order-1">
                {/* Badge: "Latest & Best" */}
                <div className="flex items-center justify-start">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#0878F9] text-white shadow-xs">
                    {slide.tag}
                  </span>
                </div>

                {/* Main Heading: "iPhone 18 Pro Max" with "18" in bright blue */}
                <div className="space-y-1">
                  <h1 className="text-4xl lg:text-6xl font-black text-[#102A56] tracking-tight leading-[1.15]">
                    <span>{slide.titlePrefix}</span>
                    <span className="text-[#0878F9]">{slide.titleHighlight}</span>
                    {slide.titleSuffix && <span>{slide.titleSuffix}</span>}
                  </h1>
                  <p className="text-base text-[#536780] font-medium max-w-xl line-clamp-2">
                    {slide.subtitle}
                  </p>
                </div>

                {/* Three Compact Spec Highlights */}
                <div className="grid grid-cols-3 gap-3 max-w-xl pt-0.5">
                  {slide.specs.slice(0, 3).map((spec, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-[#DFEBF8] shadow-xs flex flex-row items-start text-left gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#F2F8FF] border border-[#DFEBF8] flex items-center justify-center flex-shrink-0">
                        {getSpecIcon((spec as any).icon || (i === 0 ? 'cpu' : i === 1 ? 'camera' : 'screen'))}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#102A56] truncate">
                          {spec.label}
                        </p>
                        <p className="text-[10px] text-[#8394AB] font-medium truncate">
                          {spec.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price & Primary CTA */}
                <div className="pt-2 flex flex-row items-center justify-start gap-6">
                  <div className="text-left">
                    <span className="text-xs font-bold text-[#8394AB] uppercase tracking-wider block">
                      Starting From
                    </span>
                    <span className="text-2xl lg:text-3xl font-black text-[#102A56] font-mono">
                      {slide.price}
                    </span>
                  </div>

                  <Link
                    href={slide.link}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0878F9] hover:bg-[#0665D0] text-white font-extrabold text-sm shadow-md shadow-[#0878F9]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* 3 Compact Trust Indicators */}
                <div className="pt-3 border-t border-[#DFEBF8]/80 flex items-center justify-start gap-6 text-xs font-semibold text-[#536780]">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0878F9]" />
                    <span>100% Original Products</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#0878F9]" />
                    <span>Official Warranty</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#0878F9]" />
                    <span>Fast &amp; Secure Delivery</span>
                  </div>
                </div>
              </div>

              {/* Desktop-Only Right Column: Pedestal Showcase with Script Typography */}
              <div className="lg:col-span-5 order-2 flex flex-col items-center justify-center relative">
                {/* Script Typography Accent matching reference */}
                <div className="absolute top-2 right-4 z-20 text-right pointer-events-none select-none">
                  <p className="font-serif italic text-lg lg:text-xl font-medium text-[#0878F9]/90 drop-shadow-xs">
                    {slide.titlePrefix} {slide.titleHighlight} {slide.titleSuffix}
                  </p>
                  <p className="font-serif italic text-xs lg:text-sm text-[#102A56]/75">
                    Power. Pro. Perfection.
                  </p>
                </div>

                {/* Product Frame with Pedestal visual */}
                <Link href={slide.link} className="relative block group w-full max-w-lg mt-6">
                  <div className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-white/60 p-2 border border-[#DFEBF8] shadow-xl shadow-sky-900/5 flex items-center justify-center">
                    <img
                      src={slide.image}
                      alt={`${slide.brand} ${slide.titleHighlight}`}
                      className="w-full h-full object-contain object-center rounded-2xl group-hover:scale-105 transition-transform duration-700"
                      loading={currentSlide === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators matching reference (small blue dots) */}
        <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideSafe
                  ? 'w-7 bg-[#0878F9] shadow-md shadow-[#0878F9]/30'
                  : 'w-2 bg-[#DFEBF8] hover:bg-sky-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
