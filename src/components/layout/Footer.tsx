'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
  CreditCard,
  Truck,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer id="footer" className="bg-[#0A192F] text-slate-300 pt-12 pb-8 border-t border-[#102A56] relative overflow-hidden">
      {/* Soft Blue Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#0878F9]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1. Top Trust Strip Above Footer Columns matching reference */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-8 border-b border-[#1A3660] mb-10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0878F9]/15 text-[#0878F9] flex items-center justify-center flex-shrink-0 border border-[#0878F9]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">100% Genuine</p>
              <p className="text-[11px] text-slate-400">Official PTA Approved</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0878F9]/15 text-[#0878F9] flex items-center justify-center flex-shrink-0 border border-[#0878F9]/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Express Delivery</p>
              <p className="text-[11px] text-slate-400">Nationwide Safe Transit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0878F9]/15 text-[#0878F9] flex items-center justify-center flex-shrink-0 border border-[#0878F9]/20">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">WhatsApp Care</p>
              <p className="text-[11px] text-slate-400">Direct Support Hotline</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0878F9]/15 text-[#0878F9] flex items-center justify-center flex-shrink-0 border border-[#0878F9]/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Cash on Delivery</p>
              <p className="text-[11px] text-slate-400">Available Across Pakistan</p>
            </div>
          </div>
        </div>

        {/* 2. Main 5-Column Grid matching reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-[#1A3660]">
          {/* Column 1: Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="footer" />

            <p className="text-xs sm:text-sm text-[#0878F9] font-bold">
              Your Dream Device, Our Priority.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Authorized mobile store for certified Apple iPhones, Samsung Galaxy flagships, iPads, and genuine accessories with official warranty across Pakistan.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#102A56] hover:bg-[#0878F9] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#102A56] hover:bg-[#0878F9] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-[#102A56] hover:bg-[#0878F9] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white tracking-widest uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-[#0878F9] transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#0878F9] transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#0878F9] transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0878F9] transition-colors">
                  Warranty Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0878F9] transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0878F9] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Collections (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white tracking-widest uppercase">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/products?category=iphone" className="hover:text-[#0878F9] transition-colors">
                  Apple iPhone
                </Link>
              </li>
              <li>
                <Link href="/products?category=samsung" className="hover:text-[#0878F9] transition-colors">
                  Samsung Galaxy
                </Link>
              </li>
              <li>
                <Link href="/products?category=ipad" className="hover:text-[#0878F9] transition-colors">
                  iPad &amp; Tablets
                </Link>
              </li>
              <li>
                <Link href="/products?category=smart-watches" className="hover:text-[#0878F9] transition-colors">
                  Smart Watches
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-[#0878F9] transition-colors">
                  Accessories &amp; Cases
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Store Support (4 cols on tablet, 2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white tracking-widest uppercase">
              Store Support
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400 font-medium">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0878F9] flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Shop #33, Sattagadai Plaza, 32 The Mall Road, Peshawar Cantt, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0878F9] flex-shrink-0" />
                <a href="tel:+923005902425" className="hover:text-[#0878F9] font-mono">
                  +92 300 5902425
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0878F9] flex-shrink-0" />
                <a href="mailto:nomanjvd9@gmail.com" className="hover:text-[#0878F9]">
                  nomanjvd9@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 5: Newsletter (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white tracking-widest uppercase">
              Newsletter
            </h4>
            <p className="text-[11px] text-slate-400 leading-tight">
              Get the latest updates and exclusive offers.
            </p>

            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full bg-[#102A56]/60 border border-[#1A3660] rounded-full py-2 pl-3.5 pr-10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#0878F9]"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 top-1 bottom-1 w-7 h-7 rounded-full bg-[#0878F9] hover:bg-[#0665D0] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {subscribed && (
              <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Subscribed successfully!</span>
              </p>
            )}
          </div>
        </div>

        {/* 3. Bottom Footer Legal Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            &copy; 2026 Blue Bell Mobile Shop. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/products" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/products" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/track-order" className="hover:text-slate-300 transition-colors">
              PTA Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
