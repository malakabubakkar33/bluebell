'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PartnershipShowcase: React.FC = () => {
  return (
    <section
      id="partnership"
      className="py-10 md:py-16 bg-white border-b border-[#DFEBF8]"
      aria-label="Blue Bell and Mercantile Partnership"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Wide Landscape Banner Card matching reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-[#DFEBF8] overflow-hidden bg-gradient-to-r from-white via-[#F2F8FF] to-[#DFEEFF] shadow-lg shadow-sky-900/5 grid grid-cols-1 lg:grid-cols-12 items-center"
        >
          {/* Subtle Background Ribbons SVG overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
              <path
                d="M0,200 C300,120 500,280 800,160 C1000,80 1100,240 1200,180 L1200,400 L0,400 Z"
                fill="url(#blueWave)"
              />
              <defs>
                <linearGradient id="blueWave" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0878F9" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10A9F4" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Left Column: Logos, Heading, Subtitle, CTA */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 relative z-10 text-center lg:text-left space-y-4 sm:space-y-6">
            {/* Dual Brand Logos: Blue Bell × Mercantile */}
            <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 flex-wrap">
              {/* Blue Bell Logo */}
              <div className="h-12 sm:h-14 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="Blue Bell Mobile Shop"
                  width={160}
                  height={50}
                  className="h-10 sm:h-12 w-auto object-contain"
                  priority
                />
              </div>

              {/* Clean Multiplication Symbol */}
              <span className="text-xl sm:text-2xl font-light text-[#8394AB]">×</span>

              {/* Official Mercantile Logo */}
              <div className="h-12 sm:h-14 flex items-center justify-center">
                <Image
                  src="/mercantile-logo.svg"
                  alt="Mercantile Official Partner"
                  width={150}
                  height={45}
                  className="h-9 sm:h-11 w-auto object-contain"
                />
              </div>
            </div>

            {/* Partnership Headline matching reference */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                <span className="text-[#102A56]">Two Brands. </span>
                <span className="text-[#0878F9]">One Partnership.</span>
              </h2>

              <p className="text-sm sm:text-base text-[#536780] font-medium max-w-lg mx-auto lg:mx-0">
                Connected by partnership. Focused on bringing technology closer to you.
              </p>
            </div>

            {/* Primary Partnership CTA */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0878F9] hover:bg-[#0665D0] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#0878F9]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Explore Blue Bell</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Handshake Visual matching reference */}
          <div className="lg:col-span-5 relative h-56 sm:h-72 lg:h-full min-h-[260px] lg:min-h-[340px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-white via-transparent to-transparent z-10 pointer-events-none w-full lg:w-32" />
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
