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
  Sparkles,
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
    <footer id="footer" className="bg-[#07172f] text-slate-300 pt-14 pb-8 border-t border-sky-950 relative overflow-hidden">
      {/* Subtle Sky Blue Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Top Trust Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-10 border-b border-slate-800/80 mb-10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">100% Genuine</p>
              <p className="text-[11px] text-slate-400">Official PTA Approved</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">Express Delivery</p>
              <p className="text-[11px] text-slate-400">Nationwide Safe Transit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">WhatsApp Care</p>
              <p className="text-[11px] text-slate-400">Direct Technician Support</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white">COD Available</p>
              <p className="text-[11px] text-slate-400">Cash on Delivery &amp; Bank</p>
            </div>
          </div>
        </div>

        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="footer" />

            <p className="text-xs sm:text-sm text-sky-200 font-semibold max-w-sm">
              Your Dream Device, Our Priority.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Authorized mobile store for certified Apple iPhones, Samsung Galaxy flagships, iPads, and genuine accessories with guaranteed warranty across Pakistan.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white tracking-widest uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/" className="hover:text-sky-400 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-sky-400 transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-sky-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sky-400 transition-colors">
                  Contact &amp; Location
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-sky-400 transition-colors">
                  My Profile &amp; History
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-sky-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-black text-white tracking-widest uppercase">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li>
                <Link href="/products?category=iphone" className="hover:text-sky-400 transition-colors">
                  Apple iPhone
                </Link>
              </li>
              <li>
                <Link href="/products?category=samsung" className="hover:text-sky-400 transition-colors">
                  Samsung Galaxy
                </Link>
              </li>
              <li>
                <Link href="/products?category=ipad" className="hover:text-sky-400 transition-colors">
                  iPads &amp; Tablets
                </Link>
              </li>
              <li>
                <Link href="/products?category=smart-watches" className="hover:text-sky-400 transition-colors">
                  Smart Watches
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-sky-400 transition-colors">
                  Chargers &amp; Cases
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-black text-white tracking-widest uppercase">
              Store Support
            </h4>
            <div className="space-y-2 text-xs text-slate-400 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <span>Blue Bell Mobile Shop, Saddar Road, Peshawar, Pakistan</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <a href="tel:+923001234567" className="hover:text-sky-400 font-mono">
                  +92 300 1234567
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <a href="mailto:info@bluebells.pk" className="hover:text-sky-400">
                  info@bluebells.pk
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 mb-2">Subscribe for discounts &amp; stock alerts:</p>
              <form onSubmit={handleSubscribe} className="relative max-w-sm">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-full py-2 pl-3.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1 top-1 bottom-1 w-7 h-7 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition-colors shadow-sm"
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
        </div>

        {/* Bottom Bar */}
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
