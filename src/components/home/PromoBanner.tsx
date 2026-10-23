'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  const [activeDot, setActiveDot] = useState(0);

  return (
    <section id="promo" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#e3eefd] via-[#ebf3fd] to-[#f4f8fe] border border-blue-100/80 p-8 sm:p-12 shadow-sm">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/3 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Offer Details */}
            <div className="lg:col-span-5 space-y-4 text-center lg:text-left">
              <span className="text-xs font-extrabold tracking-widest text-brand-600 uppercase flex items-center justify-center lg:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-brand-500" />
                Special Offer
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Get Up To 30% Off
              </h2>

              <p className="text-sm sm:text-base text-slate-600 font-medium">
                On Selected Samsung Smartphones &amp; Accessories
              </p>

              <div className="pt-2">
                <Link
                  href="/products?brand=Samsung"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 hover:shadow-lg transition-all duration-200 group"
                >
                  <span>Explore Deals</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Dots */}
              <div className="flex items-center justify-center lg:justify-start gap-1.5 pt-4">
                {[0, 1, 2, 3].map((dot) => (
                  <button
                    key={dot}
                    onClick={() => setActiveDot(dot)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeDot === dot ? 'w-6 bg-brand-500' : 'w-2 bg-blue-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Center Device Cluster */}
            <div className="lg:col-span-4 flex items-center justify-center">
              <div className="relative group max-w-sm">
                <img
                  src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=700&q=85"
                  alt="Samsung Galaxy Ecosystem"
                  className="w-full h-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Samsung Brand Tagline */}
            <div className="lg:col-span-3 text-center lg:text-left space-y-2 lg:pl-6 border-t lg:border-t-0 lg:border-l border-blue-200/60 pt-4 lg:pt-0">
              <h3 className="text-2xl sm:text-3xl font-black tracking-widest text-slate-900">
                SAMSUNG
              </h3>
              <p className="text-sm sm:text-base text-brand-600 font-medium">
                Innovation for a better tomorrow
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
