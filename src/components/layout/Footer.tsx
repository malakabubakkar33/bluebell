'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Phone,
  Mail,
  MessageSquare,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
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
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer id="footer" className="bg-[#0a192f] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="footer" />

            <p className="text-sm text-slate-400 font-medium max-w-sm">
              Your Dream Device, Our Priority.
            </p>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Official smartphone retailer providing genuine Apple, Samsung, iPads, and certified accessories with verified warranty across Pakistan.
            </p>
          </div>

          {/* Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#products" className="hover:text-brand-400 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="#why-choose-us" className="hover:text-brand-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#footer" className="hover:text-brand-400 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-brand-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Categories
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="#products" className="hover:text-brand-400 transition-colors">
                  iPhone
                </Link>
              </li>
              <li>
                <Link href="#products" className="hover:text-brand-400 transition-colors">
                  Samsung
                </Link>
              </li>
              <li>
                <Link href="#products" className="hover:text-brand-400 transition-colors">
                  iPad
                </Link>
              </li>
              <li>
                <Link href="#categories" className="hover:text-brand-400 transition-colors">
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="#categories" className="hover:text-brand-400 transition-colors">
                  Smart Watches
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="tel:+923001234567" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>+92 300 1234567</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@bluebell.pk" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>support@bluebell.pk</span>
                </a>
              </li>
              <li>
                <a href="#chat" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>Live Chat</span>
                </a>
              </li>
              <li>
                <a href="#faq" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                  <span>FAQs</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Stay Connected & Newsletter (2 cols / remainder) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">
              Stay Connected
            </h4>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-brand-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>

            {/* Newsletter form */}
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-full py-2.5 pl-4 pr-11 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {subscribed && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Thank you for subscribing!</span>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2025 Blue Bell Mobile Shop. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <Link href="#privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="#terms" className="hover:text-slate-300 transition-colors">
              Terms &amp; Conditions
            </Link>
            <span>|</span>
            <Link href="#shipping" className="hover:text-slate-300 transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
