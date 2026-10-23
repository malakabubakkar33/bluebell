'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Handshake, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Award, Zap } from 'lucide-react';

export const PartnershipShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Scroll-driven progress across this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Scroll animations for desktop
  const leftX = useTransform(scrollYProgress, [0.1, 0.45], shouldReduceMotion ? [0, 0] : [-50, 0]);
  const rightX = useTransform(scrollYProgress, [0.1, 0.45], shouldReduceMotion ? [0, 0] : [50, 0]);
  const opacityAnim = useTransform(scrollYProgress, [0.08, 0.35], [0.3, 1]);
  const centerScale = useTransform(scrollYProgress, [0.2, 0.5], shouldReduceMotion ? [1, 1] : [0.85, 1]);
  const ribbonGlow = useTransform(scrollYProgress, [0.25, 0.55], [0.4, 1]);

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById('products');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 800, behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      id="partnership"
      className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-white via-sky-50/40 to-white overflow-hidden border-y border-sky-100/70"
      aria-label="Blue Bell and Mercantile Partnership"
    >
      {/* Background Ambient Radial Lights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Micro-Tag */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600 fill-sky-500" />
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-700">
              Authorized Alliance
            </span>
          </motion.div>
        </div>

        {/* Cinematic Dual Brand Convergence Arena */}
        <div className="relative max-w-4xl mx-auto mb-10 sm:mb-14">
          <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 md:gap-4">
            {/* Brand 1: Blue Bell (Reveals from Left) */}
            <motion.div
              style={{ x: leftX, opacity: opacityAnim }}
              className="md:col-span-5 flex flex-col items-center md:items-end text-center md:text-right"
            >
              <div className="w-full max-w-xs p-6 sm:p-7 rounded-3xl bg-white/90 backdrop-blur-xl border border-sky-100/90 shadow-xl shadow-sky-900/5 hover:border-sky-300 transition-all duration-500 group">
                <div className="h-16 flex items-center justify-center md:justify-end mb-3">
                  <Image
                    src="/logo.png"
                    alt="Blue Bell Mobile Shop"
                    width={180}
                    height={56}
                    className="h-12 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    priority
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">Blue Bell Mobile Shop</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Peshawar&apos;s trusted destination for genuine premium smartphones &amp; tech devices.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-sky-50 flex items-center justify-center md:justify-end gap-1.5 text-[10px] font-bold text-sky-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Authorized Retailer</span>
                </div>
              </div>
            </motion.div>

            {/* Center: Cinematic Interlocking Glass Ribbons & Handshake Symbol */}
            <motion.div
              style={{ scale: centerScale }}
              className="md:col-span-1 flex flex-col items-center justify-center relative my-2 md:my-0"
            >
              {/* Interlocking Glowing Glass Ribbon Aura */}
              <motion.div
                style={{ opacity: ribbonGlow }}
                className="relative flex items-center justify-center"
              >
                {/* Luminous Pulsing Halo */}
                <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400/20 via-blue-500/20 to-sky-300/30 blur-xl animate-pulse pointer-events-none" />

                {/* Central Handshake Crest */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-0.5 shadow-xl shadow-sky-500/30">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center relative overflow-hidden group">
                    {/* Animated Interlocking Glass Ribbons (SVG) */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="38"
                        cy="50"
                        r="26"
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="5"
                        strokeDasharray="140"
                        strokeDashoffset="25"
                      />
                      <circle
                        cx="62"
                        cy="50"
                        r="26"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="5"
                        strokeDasharray="140"
                        strokeDashoffset="95"
                      />
                    </svg>

                    <Handshake className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600 relative z-10 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </motion.div>

              <span className="text-[11px] font-black text-sky-700 tracking-widest mt-2 uppercase">
                &times;
              </span>
            </motion.div>

            {/* Brand 2: Mercantile (Reveals from Right) */}
            <motion.div
              style={{ x: rightX, opacity: opacityAnim }}
              className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="w-full max-w-xs p-6 sm:p-7 rounded-3xl bg-white/90 backdrop-blur-xl border border-sky-100/90 shadow-xl shadow-sky-900/5 hover:border-sky-300 transition-all duration-500 group">
                <div className="h-16 flex items-center justify-center md:justify-start mb-3">
                  <img
                    src="/mercantile-logo.svg"
                    alt="Mercantile Official Logo"
                    className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900">Mercantile</h3>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Official Apple Authorized Distributor in Pakistan, ensuring authentic warranty &amp; PTA compliance.
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-sky-50 flex items-center justify-center md:justify-start gap-1.5 text-[10px] font-bold text-sky-600">
                  <Award className="w-3.5 h-3.5" />
                  <span>Authorized Distributor</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Centered Composition & Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto text-center space-y-4"
        >
          {/* Centered Brand Composition */}
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-black tracking-wide shadow-md">
            <span>Blue Bell</span>
            <span className="text-sky-400 font-light">&times;</span>
            <span>Mercantile</span>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Two Brands.{' '}
            <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              One Partnership.
            </span>
          </h2>

          {/* Supporting Line */}
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl mx-auto">
            Connected by partnership. Focused on bringing technology closer to you.
          </p>

          {/* Three Genuine Partnership Value Badges */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-xl mx-auto text-left">
            <div className="p-3 rounded-2xl bg-white border border-sky-100/80 shadow-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span className="text-[11px] font-bold text-slate-800">100% PTA Approved Genuine Stock</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-sky-100/80 shadow-xs flex items-center gap-2.5">
              <Award className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span className="text-[11px] font-bold text-slate-800">Official Brand 1-Year Warranty</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-sky-100/80 shadow-xs flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span className="text-[11px] font-bold text-slate-800">Verified IMEI &amp; Authentic Sealed Box</span>
            </div>
          </div>

          {/* CTA: Explore Blue Bell */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={scrollToProducts}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Blue Bell</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
