'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { useProducts, BannerItem } from '@/context/ProductsContext';

interface HeroSlide {
  id: number;
  tag?: string;
  brand: string;
  titlePrefix: string;
  titleHighlight: string;
  tagline: string;
  subtitle: string;
  specs: { label: string; desc: string }[];
  price: string;
  image: string;
  link: string;
  themeColor: string;
}

const HIGH_RES_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: 'FLAGSHIP TABLET',
    brand: 'Apple iPad',
    titlePrefix: 'iPad ',
    titleHighlight: 'Pro',
    tagline: 'Power to do more.',
    subtitle: 'The ultimate iPad experience with groundbreaking M4 performance.',
    specs: [
      { label: 'M4 Chip', desc: 'Breakthrough speed' },
      { label: '11" / 13"', desc: 'Ultra Retina XDR' },
      { label: 'Apple Pencil', desc: 'Pro Precision' },
    ],
    price: 'Rs. 229,999',
    image: '/banners/hero-ipad-pro.jpg',
    link: '/products?category=ipad',
    themeColor: '#0284c7',
  },
  {
    id: 2,
    tag: 'NEW ARRIVAL',
    brand: 'Apple iPhone',
    titlePrefix: 'iPhone ',
    titleHighlight: '18 Pro Max',
    tagline: 'Bigger. Smarter. More Powerful.',
    subtitle: 'The next generation of titanium smartphone innovation is here.',
    specs: [
      { label: 'A20 Pro Chip', desc: '3nm Architecture' },
      { label: '48MP Pro', desc: 'Fusion Telephoto' },
      { label: '6.9" Display', desc: 'Super Retina XDR' },
    ],
    price: 'Rs. 449,999',
    image: '/banners/hero-iphone-18.jpg',
    link: '/products?search=iPhone%2018',
    themeColor: '#0284c7',
  },
  {
    id: 3,
    tag: 'GALAXY AI IS HERE',
    brand: 'SAMSUNG',
    titlePrefix: 'Galaxy ',
    titleHighlight: 'S24 Ultra',
    tagline: 'Smarter. Faster. More Powerful.',
    subtitle: 'Unleash mobile AI capabilities with integrated S-Pen and titanium frame.',
    specs: [
      { label: '200MP Camera', desc: 'Nightography Zoom' },
      { label: 'Snapdragon 8 Gen 3', desc: 'Extreme Speed' },
      { label: '6.8" Screen', desc: 'Dynamic AMOLED 2X' },
    ],
    price: 'Rs. 289,999',
    image: '/banners/hero-samsung-s24.jpg',
    link: '/products?search=S24',
    themeColor: '#0284c7',
  },
  {
    id: 4,
    tag: 'BEST SELLER',
    brand: 'Apple iPhone',
    titlePrefix: 'iPhone ',
    titleHighlight: '17 Pro Max',
    tagline: 'Pro Power. Pro Performance.',
    subtitle: 'A more powerful iPhone with aerospace-grade desert titanium design.',
    specs: [
      { label: 'A19 Pro Chip', desc: 'Hardware Ray Tracing' },
      { label: '48MP Pro', desc: 'Macro & Spatial' },
      { label: '6.9" Display', desc: 'ProMotion 120Hz' },
    ],
    price: 'Rs. 389,999',
    image: '/banners/hero-iphone-17.jpg',
    link: '/products?search=iPhone%2017',
    themeColor: '#0284c7',
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

  // Active banners only with fallback to defaults
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
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Touch swipe support for mobile
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
      x: dir > 0 ? '40%' : '-40%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 220, damping: 28 },
        opacity: { duration: 0.4 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-40%' : '40%',
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 220, damping: 28 },
        opacity: { duration: 0.4 },
      },
    }),
  };

  const currentSlideSafe = currentSlide >= totalSlides ? 0 : currentSlide;
  const rawSlide = slides[currentSlideSafe] || HIGH_RES_SLIDES[0];

  // Harmonized slide object
  const slide = {
    id: rawSlide.id,
    tag: rawSlide.tag || 'FLAGSHIP SPECIAL',
    brand: rawSlide.brand || 'BLUE BELL MOBILE',
    titlePrefix: rawSlide.titlePrefix !== undefined ? rawSlide.titlePrefix : rawSlide.title,
    titleHighlight: rawSlide.titleHighlight || '',
    tagline: rawSlide.tagline || 'Official PTA Approved & Warranted',
    subtitle: rawSlide.subtitle || 'Premium genuine smartphone with official brand warranty.',
    specs: rawSlide.specs && rawSlide.specs.length > 0 ? rawSlide.specs : [
      { label: 'PTA Approved', desc: 'Official' },
      { label: 'Warranty', desc: '1 Year Brand' },
      { label: 'Authentic', desc: 'Sealed Box' },
    ],
    price: rawSlide.price || 'Rs. 99,999',
    image: rawSlide.image || '/banners/hero-ipad-pro.jpg',
    link: rawSlide.link || '/products',
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe]/40 to-white border-b border-sky-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label="Flagship Hero Showcase"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-6 lg:py-12">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center"
          >
            {/* Left Column (Desktop) / Main Content (Mobile): Compact, Balanced Typography */}
            <div className="lg:col-span-7 space-y-2 sm:space-y-4 text-center lg:text-left order-1">
              {/* Badge & Brand */}
              <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-wider bg-sky-500 text-white shadow-xs">
                  {slide.tag}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {slide.brand}
                </span>
              </div>

              {/* Tagline & Main Title */}
              <div className="space-y-0.5">
                <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-sky-600 tracking-wide uppercase">
                  {slide.tagline}
                </p>
                <h1 className="text-xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  <span>{slide.titlePrefix}</span>
                  <span className="text-sky-500">{slide.titleHighlight}</span>
                </h1>
                <p className="text-[11px] sm:text-sm text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal line-clamp-1 sm:line-clamp-none">
                  {slide.subtitle}
                </p>
              </div>

              {/* Mobile-Only Product Image: Fully contained inside its rounded frame, perfectly proportioned */}
              <div className="block lg:hidden my-1.5 sm:my-3">
                <Link href={slide.link} className="relative block group max-w-[260px] sm:max-w-sm mx-auto">
                  <div className="relative aspect-[16/9] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-50 via-white to-sky-100/50 shadow-md border border-sky-100/80 p-2 flex items-center justify-center">
                    <img
                      src={slide.image}
                      alt={`${slide.brand} ${slide.titleHighlight}`}
                      className="w-full h-full object-contain object-center rounded-xl group-hover:scale-102 transition-transform duration-500"
                      loading={currentSlide === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                </Link>
              </div>

              {/* Spec Chips (Hidden on small mobile to fit in single screen, visible on sm and above) */}
              <div className="hidden sm:grid grid-cols-3 gap-2 sm:gap-3 max-w-sm sm:max-w-md mx-auto lg:mx-0">
                {slide.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="p-1.5 sm:p-2.5 rounded-xl bg-white border border-sky-100 shadow-xs text-center"
                  >
                    <p className="text-[10px] sm:text-xs font-black text-slate-900 truncate">
                      {spec.label}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">
                      {spec.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price & CTA Button (Compact inline row on mobile) */}
              <div className="pt-1 flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-5">
                <div className="text-left">
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Starting From
                  </span>
                  <span className="text-base sm:text-2xl font-black text-slate-900 font-mono">
                    {slide.price}
                  </span>
                </div>

                <Link
                  href={slide.link}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-7 py-2 sm:py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 sm:pt-3 border-t border-sky-100 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[9px] sm:text-[11px] font-semibold text-slate-500">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" />
                  <span>100% Original PTA Approved</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-500" />
                  <span>Official Warranty</span>
                </div>
              </div>
            </div>

            {/* Desktop-Only Right Column: Complete High-Res Product Inside Container */}
            <div className="hidden lg:flex lg:col-span-5 order-2 items-center justify-center">
              <Link href={slide.link} className="relative block group w-full max-w-lg">
                <div className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-gradient-to-tr from-sky-50 via-white to-sky-100/50 shadow-xl shadow-sky-100/80 border border-sky-100 p-3 flex items-center justify-center">
                  <img
                    src={slide.image}
                    alt={`${slide.brand} ${slide.titleHighlight}`}
                    className="w-full h-full object-contain object-center rounded-2xl group-hover:scale-105 transition-transform duration-700"
                    loading={currentSlide === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Subtle Clean Vignette */}
                  <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-inset ring-sky-500/10" />
                </div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Clean Pill Carousel Indicators */}
        <div className="mt-2.5 sm:mt-6 flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlideSafe
                  ? 'w-6 sm:w-8 bg-sky-500 shadow-md shadow-sky-500/40'
                  : 'w-1.5 sm:w-2.5 bg-sky-200 hover:bg-sky-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
