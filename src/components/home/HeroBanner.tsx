'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, Truck, ArrowRight, Cpu, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSlides = HIGH_RES_SLIDES.length;

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
      x: dir > 0 ? '60%' : '-60%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 220, damping: 28 },
        opacity: { duration: 0.5 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-60%' : '60%',
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 220, damping: 28 },
        opacity: { duration: 0.5 },
      },
    }),
  };

  const slide = HIGH_RES_SLIDES[currentSlide];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Left Column: Crisp Vector Typography & Badges */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
              {/* Badge & Brand */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-sky-500 text-white shadow-sm shadow-sky-500/30">
                  {slide.tag}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest">
                  {slide.brand}
                </span>
              </div>

              {/* Tagline & Main Title */}
              <div className="space-y-1 sm:space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-sky-600 tracking-wide uppercase">
                  {slide.tagline}
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  <span>{slide.titlePrefix}</span>
                  <span className="text-sky-500">{slide.titleHighlight}</span>
                </h1>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto lg:mx-0 font-normal">
                  {slide.subtitle}
                </p>
              </div>

              {/* Spec Chips */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
                {slide.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="p-2 sm:p-2.5 rounded-xl bg-white border border-sky-100 shadow-sm text-center"
                  >
                    <p className="text-[11px] sm:text-xs font-black text-slate-900 truncate">
                      {spec.label}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {spec.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price & CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Starting From
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {slide.price}
                  </span>
                </div>

                <Link
                  href={slide.link}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-sky-100 flex items-center justify-center lg:justify-start gap-4 sm:gap-6 text-[11px] font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span>100% Original Products</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sky-500" />
                  <span>Official Warranty</span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-500" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Column: High-Res 4K Studio Image */}
            <div className="lg:col-span-5 order-1 lg:order-2 flex items-center justify-center">
              <Link href={slide.link} className="relative block group w-full max-w-md lg:max-w-none">
                <div className="relative aspect-[16/10] sm:aspect-[16/10] lg:aspect-[16/11] rounded-3xl overflow-hidden bg-white shadow-xl shadow-sky-100 border border-sky-100 p-2 sm:p-3">
                  <img
                    src={slide.image}
                    alt={`${slide.brand} ${slide.titleHighlight}`}
                    className="w-full h-full object-cover object-center rounded-2xl group-hover:scale-105 transition-transform duration-700"
                    loading={currentSlide === 0 ? 'eager' : 'lazy'}
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-sky-900/10 via-transparent to-transparent pointer-events-none" />
                </div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Clean Pill Indicators (No Slide Buttons as requested!) */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2">
          {HIGH_RES_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'w-8 bg-sky-500 shadow-md shadow-sky-500/40'
                  : 'w-2.5 bg-sky-200 hover:bg-sky-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
