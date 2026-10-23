'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  Heart,
  ShoppingCart,
  X,
  Phone,
  Truck,
  Facebook,
  Instagram,
  Youtube,
  ChevronDown,
  Sparkles,
  Home,
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { PRODUCTS, CATEGORIES } from '@/lib/data/mockData';
import { BrandLogo } from '@/components/common/BrandLogo';

// Mega Dropdown Data for Categories
const MEGA_DROPDOWNS = {
  iphone: {
    title: 'Apple iPhone Lineup',
    tag: 'A18 Pro & Titanium Flagships',
    viewAllLink: '/products?brand=Apple',
    models: [
      { name: 'iPhone 16 Pro Max', subtitle: 'A18 Pro • Desert Titanium', price: 389999, badge: 'New Flagship', image: '/categories/iphone.svg' },
      { name: 'iPhone 16 Pro', subtitle: 'A18 Pro • Natural Titanium', price: 349999, badge: 'Popular', image: '/categories/iphone.svg' },
      { name: 'iPhone 15 Pro Max', subtitle: 'A17 Pro • Titanium Blue', price: 349999, badge: 'Best Seller', image: '/categories/iphone.svg' },
      { name: 'iPhone 15', subtitle: 'Dynamic Island • 128GB', price: 239999, badge: 'Sale', image: '/categories/iphone.svg' },
      { name: 'iPhone 14 Pro Max', subtitle: 'A16 Bionic • Deep Purple', price: 279999, badge: 'In Stock', image: '/categories/iphone.svg' },
      { name: 'iPhone 13', subtitle: 'Official PTA Approved', price: 179999, badge: 'Hot Deal', image: '/categories/iphone.svg' },
    ],
  },
  samsung: {
    title: 'Samsung Galaxy Series',
    tag: 'Galaxy AI Mobile Intelligence',
    viewAllLink: '/products?brand=Samsung',
    models: [
      { name: 'Galaxy S24 Ultra', subtitle: 'Galaxy AI • Titanium Violet', price: 289999, badge: 'Best Seller', image: '/categories/samsung.svg' },
      { name: 'Galaxy S24+', subtitle: 'Dynamic AMOLED 2X • 256GB', price: 239999, badge: 'AI Powered', image: '/categories/samsung.svg' },
      { name: 'Galaxy S23 Ultra', subtitle: '200MP Zoom • Phantom Black', price: 249999, badge: 'Sale', image: '/categories/samsung.svg' },
      { name: 'Galaxy Z Fold 5', subtitle: 'Unfold Your World • 512GB', price: 379999, badge: 'Flagship', image: '/categories/samsung.svg' },
      { name: 'Galaxy Z Flip 5', subtitle: 'Flex Window • Mint', price: 219999, badge: 'Trending', image: '/categories/samsung.svg' },
      { name: 'Galaxy A55 5G', subtitle: 'Metal Frame • Awesome Navy', price: 124999, badge: 'Hot', image: '/categories/samsung.svg' },
    ],
  },
  tablets: {
    title: 'iPads & Android Tablets',
    tag: 'Liquid Retina & S-Pen Productivity',
    viewAllLink: '/products?category=tablets',
    models: [
      { name: 'iPad Pro 13-inch (M4)', subtitle: 'Ultra Retina XDR OLED', price: 389999, badge: 'M4 Beast', image: '/categories/ipad.svg' },
      { name: 'iPad Air 11-inch (M2)', subtitle: 'Liquid Retina • 128GB', price: 199999, badge: 'New', image: '/categories/ipad.svg' },
      { name: 'iPad 10th Gen', subtitle: 'A14 Bionic • Silver 64GB', price: 119999, badge: 'Popular', image: '/categories/ipad.svg' },
      { name: 'Galaxy Tab S9 Ultra', subtitle: '14.6" Dynamic AMOLED 2X', price: 269999, badge: 'Pro Stylus', image: '/categories/tablets.svg' },
    ],
  },
  watches: {
    title: 'Smart Watches & Wearables',
    tag: 'Advanced ECG & Fitness Tracking',
    viewAllLink: '/products?category=smart-watches',
    models: [
      { name: 'Apple Watch Ultra 2', subtitle: 'Titanium • Precision GPS', price: 239999, badge: 'Rugged', image: '/categories/smartwatches.svg' },
      { name: 'Apple Watch Series 9', subtitle: '45mm • S9 Double Tap', price: 89999, badge: 'Best Seller', image: '/categories/smartwatches.svg' },
      { name: 'Galaxy Watch 6 Classic', subtitle: 'Rotating Bezel • 47mm', price: 68999, badge: 'Sale', image: '/categories/smartwatches.svg' },
    ],
  },
  accessories: {
    title: 'Audio, Chargers & Covers',
    tag: '100% Genuine Box Pack Accessories',
    viewAllLink: '/products?category=accessories',
    models: [
      { name: 'AirPods Pro (2nd Gen)', subtitle: 'Active Noise Cancellation', price: 59999, badge: 'Hot', image: '/categories/accessories.svg' },
      { name: 'Apple 20W USB-C Adapter', subtitle: 'Official Fast Charger', price: 6499, badge: 'Best Seller', image: '/categories/chargers.svg' },
      { name: 'MagSafe Silicone Case', subtitle: 'Drop Protection • Storm Blue', price: 8999, badge: 'Official', image: '/categories/cases.svg' },
      { name: 'Samsung 45W GaN Charger', subtitle: 'Super Fast Charging 2.0', price: 7999, badge: 'Fast GaN', image: '/categories/chargers.svg' },
    ],
  },
};

type MegaKey = 'iphone' | 'samsung' | 'tablets' | 'watches' | 'accessories';

export const Header: React.FC = () => {
  const { totalItems, subtotal, wishlist, setIsDrawerOpen } = useCart();
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  // Auto-hover dropdown states
  const [activeHoverMenu, setActiveHoverMenu] = useState<MegaKey | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection state: hide entire header on scroll down, restore on scroll up
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    let isHiddenState = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const prevScrollY = lastScrollYRef.current;
          const delta = currentScrollY - prevScrollY;

          if (currentScrollY > 60) {
            if (delta > 10 && !isHiddenState) {
              isHiddenState = true;
              setIsHeaderHidden(true);
              setActiveHoverMenu(null);
            } else if (delta < -10 && isHiddenState) {
              isHiddenState = false;
              setIsHeaderHidden(false);
            }
          } else if (isHiddenState) {
            isHiddenState = false;
            setIsHeaderHidden(false);
          }

          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hover handlers with smooth grace delay
  const handleMouseEnter = (key: MegaKey) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveHoverMenu(key);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveHoverMenu(null);
    }, 180);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim().length > 0) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  // Search filtering
  const searchResults = searchQuery.trim().length > 1
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isHeaderHidden
            ? '-translate-y-full opacity-0 pointer-events-none'
            : 'translate-y-0 opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.06)]'
        }`}
      >
        {/* 1. TOP UTILITY BAR (Frosted Glass Type) */}
        <div className="bg-white border-b border-[#DFEBF8] text-xs text-[#102A56] px-4 sm:px-8 py-2 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="flex items-center gap-2 font-medium text-slate-700">
              <Truck className="w-4 h-4 text-[#0878F9]" />
              <span>
                Free Express Delivery on Orders Above <strong className="text-[#0878F9] font-bold">Rs. 25,000</strong>
              </span>
            </div>

            <div className="flex items-center gap-5">
              <a
                href="tel:+923001234567"
                className="flex items-center gap-1.5 text-[#102A56] hover:text-[#0878F9] transition-colors font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-[#0878F9]" />
                <span>+92 300 1234567</span>
              </a>

              <div className="flex items-center gap-2.5 border-l border-[#DFEBF8] pl-4">
                <span className="text-[#8394AB] font-medium">Follow Us</span>
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-[#536780] hover:text-[#0878F9] transition-colors" aria-label="Facebook">
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-[#536780] hover:text-[#0878F9] transition-colors" aria-label="Instagram">
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-[#536780] hover:text-[#0878F9] transition-colors" aria-label="YouTube">
                  <Youtube className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MAIN HEADER BAR (Pure Frosted Glasstype Backdrop) */}
        <div className="bg-white border-b border-[#DFEBF8] shadow-xs transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4 sm:gap-8">
            {/* Brand Logo */}
            <BrandLogo variant="header" />

            {/* Search Bar with live popup */}
            <div ref={searchRef} className="relative flex-1 max-w-2xl hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit(e);
                  }}
                  placeholder="Search for iPhone 17, Samsung S24, iPad, Accessories..."
                  className="w-full bg-white border border-[#DFEBF8] rounded-full py-2.5 pl-5 pr-14 text-sm text-[#102A56] placeholder-[#8394AB] focus:outline-none focus:border-[#0878F9] focus:ring-4 focus:ring-[#0878F9]/10 transition-all duration-200 shadow-xs"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1.5 w-9 h-9 rounded-full bg-[#0878F9] hover:bg-[#0665D0] text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Live Search Results Popup */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/50 py-3 z-50 animate-fadeIn">
                  <div className="px-4 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Matching Devices
                  </div>
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50/60 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-transparent flex items-center justify-center flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-8 h-8 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{product.subtitle}</p>
                      </div>
                      <span className="text-xs font-extrabold text-brand-600">Rs. {product.price.toLocaleString()}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Account / Login Area matching reference */}
              <Link
                href={user ? (isAdmin ? '/admin' : '/account') : '/auth/login'}
                className="hidden sm:flex items-center gap-2.5 p-1.5 rounded-xl text-[#102A56] hover:text-[#0878F9] transition-colors"
                title={user ? (isAdmin ? 'Admin Dashboard' : 'My Account') : 'Sign In / Register'}
              >
                <div className="w-9 h-9 rounded-full bg-[#F2F8FF] border border-[#DFEBF8] text-[#0878F9] flex items-center justify-center transition-colors shadow-xs">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] text-[#8394AB] font-medium leading-tight">Account</span>
                  <span className="text-xs font-bold text-[#102A56] leading-tight">
                    {user ? (isAdmin ? 'Admin Panel' : user.name.split(' ')[0]) : 'Login / Register'}
                  </span>
                </div>
              </Link>

              {/* Wishlist Link */}
              <Link
                href="/products"
                className="relative p-2 text-slate-600 hover:text-rose-500 transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart Trigger */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2.5 bg-white hover:bg-[#F2F8FF]/60 border border-[#DFEBF8] hover:border-[#0878F9] rounded-xl py-1.5 px-3 transition-all text-[#102A56] shadow-xs group cursor-pointer"
              >
                <div className="relative w-8 h-8 rounded-lg bg-[#F2F8FF] text-[#0878F9] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                  <ShoppingCart className="w-4 h-4" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0878F9] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[10px] text-[#8394AB] font-medium leading-tight">Cart</span>
                  <span className="text-xs font-bold text-[#102A56] leading-tight font-mono group-hover:text-[#0878F9] transition-colors">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
              </button>

              {/* Mobile 2-Line Hamburger Menu Trigger */}
              <button
                onClick={() => setIsSideNavOpen(true)}
                className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-white/70 text-slate-800 border border-white/60 p-2 gap-1.5"
                aria-label="Toggle navigation drawer"
              >
                <span className="w-5 h-[2.5px] bg-slate-800 rounded-full" />
                <span className="w-3.5 h-[2.5px] bg-brand-500 rounded-full" />
              </button>
            </div>
          </div>

          {/* 3. CATEGORY NAVIGATION BAR (Positioned Slightly Lower with Floating Glass Shelf & 2-Line Hamburger) */}
          <div className="border-t border-[#DFEBF8] mt-0 py-2 hidden md:block bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-7">
                {/* A. SLEEK 2-LINE HAMBURGER ICON BUTTON (Replaces bulky button) */}
                <button
                  onClick={() => setIsSideNavOpen(true)}
                  className="group flex items-center gap-2 py-1.5 px-3.5 rounded-lg bg-white hover:bg-[#F2F8FF] text-[#102A56] hover:text-[#0878F9] transition-all border border-[#DFEBF8] shadow-xs cursor-pointer"
                  title="Open Navigation Menu"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <span className="w-4 h-[2px] bg-[#102A56] group-hover:bg-[#0878F9] rounded-full transition-all" />
                    <span className="w-3 h-[2px] bg-[#0878F9] rounded-full transition-all" />
                    <span className="w-4 h-[2px] bg-[#102A56] group-hover:bg-[#0878F9] rounded-full transition-all" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#102A56] group-hover:text-[#0878F9]">
                    MENU
                  </span>
                </button>

                {/* B. CATEGORY ITEMS WITH AUTO-HOVER MEGA DROPDOWNS */}
                <nav className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#102A56]">
                  <Link href="/" className="hover:text-brand-600 py-2.5 transition-colors">
                    Home
                  </Link>

                  {/* 1. iPhone Auto-Hover Item */}
                  <div
                    className="relative py-2.5 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter('iphone')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/products?brand=Apple"
                      className={`flex items-center gap-1 transition-colors ${
                        activeHoverMenu === 'iphone' ? 'text-brand-600' : 'hover:text-brand-600'
                      }`}
                    >
                      <span>iPhone</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'iphone' ? 'rotate-180 text-brand-600' : ''}`} />
                    </Link>
                  </div>

                  {/* 2. Samsung Auto-Hover Item */}
                  <div
                    className="relative py-2.5 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter('samsung')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/products?brand=Samsung"
                      className={`flex items-center gap-1 transition-colors ${
                        activeHoverMenu === 'samsung' ? 'text-brand-600' : 'hover:text-brand-600'
                      }`}
                    >
                      <span>Samsung</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'samsung' ? 'rotate-180 text-brand-600' : ''}`} />
                    </Link>
                  </div>

                  {/* 3. iPad & Tablets Auto-Hover Item */}
                  <div
                    className="relative py-2.5 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter('tablets')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/products?category=tablets"
                      className={`flex items-center gap-1 transition-colors ${
                        activeHoverMenu === 'tablets' ? 'text-brand-600' : 'hover:text-brand-600'
                      }`}
                    >
                      <span>iPad &amp; Tablets</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'tablets' ? 'rotate-180 text-brand-600' : ''}`} />
                    </Link>
                  </div>

                  {/* 4. Smart Watches Auto-Hover Item */}
                  <div
                    className="relative py-2.5 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter('watches')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/products?category=smart-watches"
                      className={`flex items-center gap-1 transition-colors ${
                        activeHoverMenu === 'watches' ? 'text-brand-600' : 'hover:text-brand-600'
                      }`}
                    >
                      <span>Smart Watches</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'watches' ? 'rotate-180 text-brand-600' : ''}`} />
                    </Link>
                  </div>

                  {/* 5. Accessories Auto-Hover Item */}
                  <div
                    className="relative py-2.5 cursor-pointer"
                    onMouseEnter={() => handleMouseEnter('accessories')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href="/products?category=accessories"
                      className={`flex items-center gap-1 transition-colors ${
                        activeHoverMenu === 'accessories' ? 'text-brand-600' : 'hover:text-brand-600'
                      }`}
                    >
                      <span>Accessories</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'accessories' ? 'rotate-180 text-brand-600' : ''}`} />
                    </Link>
                  </div>

                  <Link href="/products" className="hover:text-brand-600 py-2.5 transition-colors">
                    All Products
                  </Link>
                  <Link href="/track-order" className="hover:text-brand-600 py-2.5 transition-colors">
                    Track Order
                  </Link>
                  <Link href="/contact" className="hover:text-brand-600 py-2.5 transition-colors">
                    Contact Us
                  </Link>
                </nav>
              </div>

              {/* Right Live Stock Pulse */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F8FF] border border-[#DFEBF8] text-[11px] font-bold text-[#0878F9]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0878F9]" />
                <span className="text-[#102A56]">100% Genuine PTA Stock</span>
              </div>
            </div>

            {/* C. AUTO-HOVER MEGA DROPDOWN PANEL */}
            <AnimatePresence>
              {activeHoverMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  }}
                  onMouseLeave={handleMouseLeave}
                  className="absolute left-0 right-0 top-full bg-white/95 backdrop-blur-2xl border-b border-slate-200/80 shadow-2xl z-50 py-6 px-4 sm:px-8"
                >
                  <div className="max-w-7xl mx-auto">
                    {/* Header Info inside Dropdown */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-slate-900">
                          {MEGA_DROPDOWNS[activeHoverMenu].title}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-brand-600 border border-blue-100">
                          {MEGA_DROPDOWNS[activeHoverMenu].tag}
                        </span>
                      </div>
                      <Link
                        href={MEGA_DROPDOWNS[activeHoverMenu].viewAllLink}
                        onClick={() => setActiveHoverMenu(null)}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
                      >
                        <span>View All {activeHoverMenu.toUpperCase()} Models</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Model Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {MEGA_DROPDOWNS[activeHoverMenu].models.map((item, idx) => (
                        <Link
                          key={idx}
                          href={MEGA_DROPDOWNS[activeHoverMenu].viewAllLink}
                          onClick={() => setActiveHoverMenu(null)}
                          className="group/item flex flex-col items-center text-center p-3 rounded-2xl hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all duration-200"
                        >
                          {/* Transparent Cutout Thumbnail with Hover Scale */}
                          <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                            <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-md opacity-0 group-hover/item:opacity-100 transition-opacity" />
                            <img
                              src={item.image}
                              alt={item.name}
                              className="relative z-10 w-16 h-16 object-contain transition-transform duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-1 drop-shadow-md"
                            />
                          </div>

                          <span className="text-xs font-bold text-slate-900 group-hover/item:text-brand-600 transition-colors block leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[130px]">
                            {item.subtitle}
                          </span>
                          <span className="text-xs font-extrabold text-brand-600 block mt-1 font-mono">
                            Rs. {item.price.toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 4. SLIDE-OUT SIDE NAVIGATION DRAWER (Activated by 2-Line Icon) */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isSideNavOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Dark Frosted Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsSideNavOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            {/* Slide-In Panel from Right */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-[80vw] max-w-[280px] bg-white/95 backdrop-blur-2xl shadow-2xl h-full flex flex-col justify-between z-10 border-l border-sky-100 rounded-l-3xl overflow-y-auto"
            >
              {/* Drawer Top Header */}
              <div>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <BrandLogo variant="header" />
                  <button
                    onClick={() => setIsSideNavOpen(false)}
                    className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    aria-label="Close Navigation"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Primary Nav Links */}
                <div className="p-4 space-y-1 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 px-2">
                    Menu
                  </span>

                  <Link
                    href="/"
                    onClick={() => setIsSideNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-slate-800 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    <Home className="w-4 h-4 text-sky-500" />
                    <span>Home Page</span>
                  </Link>

                  <Link
                    href="/products"
                    onClick={() => setIsSideNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-slate-800 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-sky-500" />
                    <span>Shop All</span>
                  </Link>

                  <Link
                    href="/track-order"
                    onClick={() => setIsSideNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-slate-800 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    <Truck className="w-4 h-4 text-sky-500" />
                    <span>Track Order</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={() => setIsSideNavOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl font-bold text-xs text-slate-800 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-sky-500" />
                    <span>Contact &amp; Store</span>
                  </Link>
                </div>

                {/* Categories Shortcuts */}
                <div className="p-4 space-y-2 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1 px-2">
                    Collections
                  </span>

                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.slice(0, 6).map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        onClick={() => setIsSideNavOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-sky-50 border border-slate-100 text-[11px] font-bold text-slate-700 transition-colors"
                      >
                        <img src={cat.image} alt={cat.name} className="w-5 h-5 object-contain" />
                        <span className="truncate">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account / Admin Portal Links */}
                <div className="p-4 space-y-1.5">
                  <Link
                    href={user ? (isAdmin ? '/admin' : '/account') : '/auth/login'}
                    onClick={() => setIsSideNavOpen(false)}
                    className="flex items-center justify-between p-3 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-100 text-sky-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-bold block truncate max-w-[140px]">
                          {user ? user.name : 'Sign In / Register'}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {user ? (isAdmin ? 'Admin Dashboard' : 'My Orders & Profile') : 'Access your account'}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-sky-500" />
                  </Link>
                </div>
              </div>

              {/* Drawer Bottom Support */}
              <div className="p-4 bg-slate-50/90 border-t border-slate-100 space-y-2">
                <a
                  href="https://wa.me/923001234567?text=Hello%20Blue%20Bell%20Mobile%20Shop"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Shop</span>
                </a>

                <div className="text-center">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Blue Bell Mobile Shop • Official PTA Approved
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
