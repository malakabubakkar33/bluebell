'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';

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
          className="relative rounded-3xl border border-[#DFEBF8] overflow-hidden bg-gradient-to-br from-white via-[#F4F9FF] to-[#E8F3FF] shadow-lg shadow-sky-900/5 grid grid-cols-1 lg:grid-cols-12 items-center"
        >
          {/* Subtle Background Glow Circles */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#0756C9]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#10A9F4]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Column: Logos, Heading, Subtitle, CTA */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 relative z-10 text-center lg:text-left space-y-4 sm:space-y-6">
            {/* Top Partnership Trust Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#C7E5FF] shadow-xs text-[10px] sm:text-xs font-bold text-[#0756C9] mx-auto lg:mx-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0756C9]" />
              <span>Official Authorized Distribution Partner</span>
            </div>

            {/* Dual Brand Logos: Blue Bell × Mercantile */}
            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-5 flex-wrap">
              {/* Blue Bell Logo in Frosted Card */}
              <div className="h-11 sm:h-12 px-3.5 py-1.5 rounded-xl bg-white/90 border border-[#DFEBF8] flex items-center justify-center shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Blue Bell Mobile Shop"
                  width={130}
                  height={40}
                  className="h-7 sm:h-9 w-auto object-contain"
                  priority
                />
              </div>

              {/* Clean Multiplication Symbol */}
              <span className="text-base sm:text-xl font-light text-[#8394AB]">×</span>

              {/* Official Mercantile Logo in Frosted Card */}
              <div className="h-11 sm:h-12 px-3.5 py-1.5 rounded-xl bg-white/90 border border-[#DFEBF8] flex items-center justify-center shadow-xs">
                <Image
                  src="/mercantile-logo.svg"
                  alt="Mercantile Official Partner"
                  width={130}
                  height={38}
                  className="h-6 sm:h-8 w-auto object-contain"
                />
              </div>
            </div>

            {/* Partnership Headline */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                <span className="text-[#102A56]">Two Brands. </span>
                <span className="text-[#0756C9]">One Partnership.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#52749D] font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Empowering Pakistan with 100% genuine PTA-approved flagship devices, official brand warranties, and premium nationwide support.
              </p>
            </div>

            {/* Primary Partnership CTA */}
            <div className="pt-1 flex items-center justify-center lg:justify-start">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-[#0756C9] hover:bg-[#063B8E] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#0756C9]/25 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>Explore Official Devices</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Handshake Visual with Clean Framing on Mobile */}
          <div className="lg:col-span-5 p-4 sm:p-6 lg:p-8">
            <div className="relative h-48 sm:h-60 lg:h-72 rounded-2xl overflow-hidden border border-[#DFEBF8] shadow-md group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#102A56]/40 via-transparent to-transparent z-10 pointer-events-none" />
              <img
                src="/partnership-handshake.jpg"
                alt="Blue Bell and Mercantile Business Collaboration Handshake"
                className="w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-white text-[11px] font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/30">
                <span>Direct Authorized Channels</span>
                <span>100% PTA Approved</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

