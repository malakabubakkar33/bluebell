'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const PartnershipShowcase: React.FC = () => {
  return (
    <section
      id="partnership"
      className="py-8 sm:py-14 bg-white border-b border-[#DFEBF8]"
      aria-label="Blue Bell and Mercantile Partnership"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wide Landscape Banner Card with Frosted Glassmorphism & Mobile Cleanliness */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-white/60 overflow-hidden bg-gradient-to-r from-white/95 via-[#F2F8FF]/85 to-[#DFEEFF]/85 backdrop-blur-2xl shadow-lg shadow-sky-900/5 grid grid-cols-1 lg:grid-cols-12 items-center"
        >
          {/* Subtle Background Ribbons SVG overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path
                d="M0,200 C300,120 500,280 800,160 C1000,80 1100,240 1200,180 L1200,400 L0,400 Z"
                fill="url(#blueWave)"
              />
              <defs>
                <linearGradient id="blueWave" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0878F9" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10A9F4" stopOpacity="0.08" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Left Column: Logos, Heading, Subtitle, CTA */}
          <div className="lg:col-span-7 p-5 sm:p-10 lg:p-14 relative z-10 text-center lg:text-left space-y-3.5 sm:space-y-6">
            {/* Dual Brand Logos: Blue Bell × Mercantile */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-6 flex-wrap">
              {/* Blue Bell Logo */}
              <div className="h-10 sm:h-12 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Blue Bell Mobile Shop"
                  width={150}
                  height={45}
                  className="h-8 sm:h-11 w-auto object-contain"
                  priority
                />
              </div>

              {/* Clean Multiplication Symbol */}
              <span className="text-lg sm:text-2xl font-light text-[#8394AB]">×</span>

              {/* Official Mercantile Logo */}
              <div className="h-10 sm:h-12 flex items-center justify-center">
                <Image
                  src="/mercantile-logo.svg"
                  alt="Mercantile Official Partner"
                  width={140}
                  height={40}
                  className="h-7 sm:h-10 w-auto object-contain"
                />
              </div>
            </div>

            {/* Partnership Headline matching reference */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                <span className="text-[#102A56]">Two Brands. </span>
                <span className="text-[#0878F9]">One Partnership.</span>
              </h2>

              <p className="text-xs sm:text-base text-[#536780] font-medium max-w-lg mx-auto lg:mx-0">
                Connected by partnership. Focused on bringing technology closer to you.
              </p>
            </div>

            {/* Primary Partnership CTA */}
            <div className="pt-1">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full bg-[#0878F9] hover:bg-[#0665D0] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0878F9]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Explore Blue Bell</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Handshake Visual (Clean & Proportionate on Mobile & Desktop) */}
          <div className="lg:col-span-5 relative h-48 sm:h-64 lg:h-full min-h-[200px] sm:min-h-[260px] lg:min-h-[340px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white/90 lg:from-white via-transparent to-transparent z-10 pointer-events-none w-full lg:w-32" />
            <img
              src="/partnership-handshake.jpg"
              alt="Blue Bell and Mercantile Business Collaboration Handshake"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
