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
  Home,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  Smartphone,
  Package,
  Wallet,
  Settings,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductsContext';
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

type MegaKey = string;

export const Header: React.FC = () => {
  const { totalItems, subtotal, wishlist, setIsDrawerOpen } = useCart();
  const { user } = useAuth();
  const { products: storeCatalogProducts, categories = [] } = useProducts();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSocialMarqueePaused, setIsSocialMarqueePaused] = useState(false);
  const socialResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSocialMarqueeClick = () => {
    setIsSocialMarqueePaused(true);
    if (socialResumeTimeoutRef.current) {
      clearTimeout(socialResumeTimeoutRef.current);
    }
    socialResumeTimeoutRef.current = setTimeout(() => {
      setIsSocialMarqueePaused(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (socialResumeTimeoutRef.current) {
        clearTimeout(socialResumeTimeoutRef.current);
      }
    };
  }, []);

  // Responsive screen detection for drawer animation direction
  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen, { passive: true });
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Lock body scroll when mobile search modal or drawer is open
  useEffect(() => {
    if (isMobileSearchOpen || isSideNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSearchOpen, isSideNavOpen]);

  // Close drawer and modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSideNavOpen(false);
        setIsMobileSearchOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll detection state:
  // - When at top of page (scrollY <= 15): social bar and header both show
  // - When scrolling down: both header and social bar hide immediately
  // - When scrolling up: ONLY header shows (social bar stays hidden until scrolled back to top)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const lastScrollYRef = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const prevScrollY = lastScrollYRef.current;
          const delta = currentScrollY - prevScrollY;

          if (currentScrollY <= 20) {
            setIsAtTop(true);
            setIsHeaderHidden(false);
          } else {
            setIsAtTop(false);
            if (delta > 5 && currentScrollY > 70) {
              // Scrolling down past 70px: hide header smoothly
              setIsHeaderHidden(true);
              setActiveHoverMenu(null);
              setIsSearchOpen(false);
            } else if (delta < -3) {
              // Scrolling up: reveal header smoothly!
              setIsHeaderHidden(false);
            }
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

  // Focus search input when slide-out search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isSearchOpen]);

  // Click outside to close search bar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  // Active database categories
  const activeDbCategories = (categories || []).filter((c) => c.isActive !== false);

  // Dynamic dropdown data linked directly with Supabase database categories and live products
  const getCategoryDropdownData = (slug: string) => {
    const foundCat = activeDbCategories.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase() === slug.toLowerCase()
    );

    if (foundCat) {
      const catProds = (storeCatalogProducts || []).filter((p) => {
        const pCat = (p.category || '').toLowerCase();
        const pBrand = (p.brand || '').toLowerCase();
        const targetSlug = foundCat.slug.toLowerCase();
        const targetName = foundCat.name.toLowerCase();
        return (
          pCat === targetSlug ||
          pCat === targetName ||
          pBrand === targetSlug ||
          pBrand === targetName ||
          pCat.includes(targetSlug) ||
          targetName.includes(pCat)
        );
      });

      return {
        title: `${foundCat.name} Collection`,
        tag: `${catProds.length} ${catProds.length === 1 ? 'Product' : 'Products'} in Catalog`,
        viewAllLink: `/products?category=${encodeURIComponent(foundCat.slug)}`,
        models:
          catProds.length > 0
            ? catProds.slice(0, 6).map((item) => ({
                id: item.id,
                name: item.name,
                subtitle: item.storageOptions?.[0] ? `${item.storageOptions[0]} • PTA Approved` : 'Official PTA Approved',
                price: item.price,
                badge: item.isFeatured ? 'Featured' : item.discountPercent ? 'Sale' : (item.badge || 'PTA Approved'),
                image: item.image || item.gallery?.[0] || foundCat.image || '/categories/iphone.svg',
              }))
            : ((MEGA_DROPDOWNS as any)[slug]?.models || []),
      };
    }

    // Fallback to predefined mega dropdown if applicable
    if ((MEGA_DROPDOWNS as any)[slug]) {
      return (MEGA_DROPDOWNS as any)[slug];
    }

    return null;
  };

  // Hover handlers with smooth grace delay
  const handleMouseEnter = (key: string) => {
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
      setIsSearchOpen(false);
    }
  };

  // Search filtering from live authoritative products catalog
  const searchResults = searchQuery.trim().length > 1
    ? (storeCatalogProducts || []).filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-300 ease-in-out will-change-transform transform ${
          isHeaderHidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* =========================================================================
            1. TOP SOCIAL / ANNOUNCEMENT BAR
            Only visible when at the very top of the page (scrollY <= 15).
            Hides immediately on scroll down and stays hidden on scroll up.
           ========================================================================= */}
        <AnimatePresence>
          {isAtTop && (
            <motion.div
              initial={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="relative overflow-hidden bg-white/70 backdrop-blur-xl border-b border-white/40 text-xs text-[#102A56] py-1.5 sm:py-2 select-none cursor-pointer"
              onClick={handleSocialMarqueeClick}
              onTouchStart={handleSocialMarqueeClick}
              onMouseEnter={() => setIsSocialMarqueePaused(true)}
              onMouseLeave={() => {
                if (!socialResumeTimeoutRef.current) {
                  setIsSocialMarqueePaused(false);
                }
              }}
            >
              {/* Edge Gradient Masks for Smooth Fading */}
              <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#F4F9FF] to-transparent pointer-events-none z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#EAF7FF] to-transparent pointer-events-none z-10" />

              {/* Infinite 1-Line Forward Motion Train Marquee (Faster 14s duration, click pauses for 3s) */}
              <motion.div
                className="flex items-center gap-8 sm:gap-12 whitespace-nowrap will-change-transform"
                animate={{
                  x: isSocialMarqueePaused ? undefined : ['0%', '-50%'],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: 'loop',
                    duration: 14,
                    ease: 'linear',
                  },
                }}
              >
                {[1, 2].map((loop) => (
                  <div key={loop} className="flex items-center gap-8 sm:gap-12 flex-shrink-0">
                    <div className="flex items-center gap-2 font-medium text-[#52749D]">
                      <Truck className="w-3.5 h-3.5 text-[#0756C9] flex-shrink-0" />
                      <span>
                        Free Express Delivery Across Pakistan on Orders Above{' '}
                        <strong className="text-[#0756C9] font-bold">Rs. 25,000</strong>
                      </span>
                    </div>

                    <span className="w-1.5 h-1.5 rounded-full bg-[#0756C9]/40" />

                    <a
                      href="tel:+923001234567"
                      className="flex items-center gap-1.5 text-[#102A56] hover:text-[#0756C9] transition-colors font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#0756C9] flex-shrink-0" />
                      <span>Official Helpline: +92 300 1234567</span>
                    </a>

                    <span className="w-1.5 h-1.5 rounded-full bg-[#0756C9]/40" />

                    <div className="flex items-center gap-2 font-medium text-[#52749D]">
                      <Sparkles className="w-3.5 h-3.5 text-[#0756C9] flex-shrink-0" />
                      <span>100% Genuine PTA Approved Flagship Devices with Official Warranty</span>
                    </div>

                    <span className="w-1.5 h-1.5 rounded-full bg-[#0756C9]/40" />

                    <div className="flex items-center gap-3">
                      <span className="text-[#8394AB] font-medium">Follow Us:</span>
                      <div className="flex items-center gap-2.5">
                        <a
                          href="https://facebook.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#52749D] hover:text-[#0756C9] transition-colors"
                          aria-label="Facebook"
                        >
                          <Facebook className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href="https://instagram.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#52749D] hover:text-[#0756C9] transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href="https://youtube.com"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#52749D] hover:text-[#0756C9] transition-colors"
                          aria-label="YouTube"
                        >
                          <Youtube className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =========================================================================
            2. MAIN HEADER BAR
            Brand Logo, Slide-Out Search, and Actions (Search, Wishlist, Cart, Account).
           ========================================================================= */}
        <div className="bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-[0_8px_32px_rgba(8,102,232,0.08)] transition-all duration-300 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
            {/* Left: Brand Logo (Transparent without background box) */}
            <div className="flex items-center gap-3">
              <BrandLogo variant="header" />
            </div>

            {/* Center: Slide-Out Expandable Search Bar */}
            <div ref={searchContainerRef} className="relative flex-1 max-w-xl flex items-center justify-end md:justify-center">
              <AnimatePresence mode="wait">
                {isSearchOpen ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '100%', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="relative w-full"
                  >
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearchSubmit(e);
                          if (e.key === 'Escape') setIsSearchOpen(false);
                        }}
                        placeholder="Search for iPhone 16, Samsung S24, iPad, Apple Watch..."
                        className="w-full bg-[#F4F9FF] border border-[#C7E5FF] rounded-full py-2.5 pl-5 pr-20 text-base sm:text-sm text-[#102A56] placeholder-[#8394AB] focus:outline-none focus:border-[#0756C9] focus:ring-4 focus:ring-[#0756C9]/10 shadow-xs transition-all"
                      />

                      <div className="absolute right-1.5 flex items-center gap-1">
                        <button
                          type="submit"
                          aria-label="Submit search"
                          className="w-8 h-8 rounded-full bg-[#0756C9] hover:bg-[#063B8E] text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSearchOpen(false)}
                          aria-label="Close search"
                          className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-[#52749D] flex items-center justify-center transition-colors border border-[#DFEBF8] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                    {/* Live Search Results Popup */}
                    {searchQuery.trim().length > 1 && searchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-[#DFEBF8] py-3 z-50 animate-fadeIn">
                        <div className="px-4 py-1.5 text-[11px] font-bold text-[#8394AB] uppercase tracking-wider">
                          Matching Devices
                        </div>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-[#EAF7FF] transition-colors"
                          >
                            <div className="w-9 h-9 rounded-lg bg-transparent flex items-center justify-center flex-shrink-0">
                              <img src={product.image} alt={product.name} className="w-8 h-8 object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[#102A56] truncate">{product.name}</h4>
                              <p className="text-[11px] text-[#8394AB] truncate">{product.subtitle}</p>
                            </div>
                            <span className="text-xs font-extrabold text-[#0756C9] font-mono">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Right: Actions Cluster (On Mobile: ONLY Search and Hamburger; Desktop: Search, Wishlist, Cart, Account) */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* 1. Search Icon Button */}
              {/* Desktop search toggle (slide-out in header) */}
              {!isSearchOpen && (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Open search bar"
                  className="hidden md:flex w-9 h-9 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] border border-[#DCEBFA] items-center justify-center transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                  title="Search products"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {/* Mobile search toggle: opens dedicated full-screen search screen */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                aria-label="Open search on mobile"
                className="flex md:hidden w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/60 backdrop-blur-md hover:bg-white/80 text-[#0866E8] border border-white/80 items-center justify-center transition-all shadow-xs cursor-pointer active:scale-95"
                title="Search products"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* 2. Wishlist Link Button (Desktop only) */}
              <Link
                href="/wishlist"
                className="hidden md:flex relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EDF6FF] hover:bg-rose-50 text-[#0866E8] hover:text-[#E5485B] border border-[#DCEBFA] hover:border-rose-200 items-center justify-center transition-all shadow-xs cursor-pointer"
                title="View My Wishlist"
              >
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E5485B] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* 3. Desktop Cart Pill with Drawer Open (Desktop only) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="hidden md:flex items-center gap-2 bg-[#EDF6FF] hover:bg-[#DCEBFA] border border-[#DCEBFA] rounded-full py-1.5 px-3 transition-all text-[#102A50] shadow-xs cursor-pointer group"
                title="View Shopping Cart"
              >
                <div className="relative w-7 h-7 rounded-full bg-white text-[#0866E8] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#E5485B] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="flex flex-col text-left leading-tight pr-1">
                  <span className="text-[9px] text-[#647A98] font-bold uppercase">Cart</span>
                  <span className="text-xs font-black text-[#102A50] font-mono group-hover:text-[#0866E8] transition-colors">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>
              </button>

              {/* 4. Account / Login Area (Desktop only) */}
              <Link
                href={user ? '/account' : '/auth/login'}
                className="hidden md:flex items-center gap-2 p-1 rounded-full hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] transition-colors"
                title={user ? 'My Account' : 'Sign In / Register'}
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight pr-1">
                  <span className="text-[9px] text-[#647A98] font-bold uppercase">Account</span>
                  <span className="text-xs font-bold text-[#102A50] truncate max-w-[90px]">
                    {user ? user.name.split(' ')[0] : 'Sign In'}
                  </span>
                </div>
              </Link>

              {/* 5. Mobile Hamburger Menu Trigger */}
              <button
                type="button"
                onClick={() => setIsSideNavOpen(true)}
                className="md:hidden flex flex-col justify-center items-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/60 backdrop-blur-md text-[#102A50] border border-white/80 p-1.5 gap-1 shadow-xs cursor-pointer hover:bg-white/80 active:scale-95"
                aria-label="Toggle navigation drawer"
              >
                <span className="w-4 h-[2px] bg-[#0866E8] rounded-full" />
                <span className="w-3.5 h-[2px] bg-[#18A8F8] rounded-full" />
                <span className="w-2.5 h-[2px] bg-[#0866E8] rounded-full" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              3. CATEGORY NAVIGATION BAR
              2-line hamburger icon on left, clean category tabs, removed extra labels.
             ========================================================================= */}
          <div className="border-t border-white/50 py-2 hidden md:block bg-white/60 backdrop-blur-xl relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                {/* 2-LINE HAMBURGER MENU BUTTON */}
                <button
                  type="button"
                  onClick={() => setIsSideNavOpen(true)}
                  className="group flex items-center gap-2.5 py-1.5 px-3.5 rounded-full bg-[#F4F9FF] hover:bg-[#EAF7FF] text-[#102A56] hover:text-[#0756C9] transition-all border border-[#C7E5FF] shadow-xs cursor-pointer"
                  title="Open Navigation Menu"
                >
                  <div className="flex flex-col gap-1 items-start">
                    <span className="w-4 h-[2px] bg-[#0756C9] rounded-full transition-all group-hover:w-5" />
                    <span className="w-3 h-[2px] bg-[#078BEE] rounded-full transition-all group-hover:w-5" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#102A56] group-hover:text-[#0756C9]">
                    MENU
                  </span>
                </button>

                {/* CATEGORY TABS WITH AUTO-HOVER DYNAMIC DROPDOWNS */}
                <nav className="flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#102A56]">
                  <Link href="/" className="hover:text-[#0756C9] py-2 transition-colors">
                    Home
                  </Link>

                  <Link href="/categories" className="hover:text-[#0756C9] py-2 transition-colors flex items-center gap-1">
                    <span>Categories</span>
                  </Link>

                  {/* Dynamic Database Connected Categories */}
                  {activeDbCategories.length > 0 ? (
                    activeDbCategories.slice(0, 5).map((cat) => (
                      <div
                        key={cat.id || cat.slug}
                        className="relative py-2 cursor-pointer"
                        onMouseEnter={() => handleMouseEnter(cat.slug)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <Link
                          href={`/products?category=${encodeURIComponent(cat.slug)}`}
                          className={`flex items-center gap-1 transition-colors ${
                            activeHoverMenu === cat.slug ? 'text-[#0756C9]' : 'hover:text-[#0756C9]'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              activeHoverMenu === cat.slug ? 'rotate-180 text-[#0756C9]' : ''
                            }`}
                          />
                        </Link>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="relative py-2 cursor-pointer" onMouseEnter={() => handleMouseEnter('iphone')} onMouseLeave={handleMouseLeave}>
                        <Link href="/products?brand=Apple" className={`flex items-center gap-1 transition-colors ${activeHoverMenu === 'iphone' ? 'text-[#0756C9]' : 'hover:text-[#0756C9]'}`}>
                          <span>iPhone</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'iphone' ? 'rotate-180 text-[#0756C9]' : ''}`} />
                        </Link>
                      </div>
                      <div className="relative py-2 cursor-pointer" onMouseEnter={() => handleMouseEnter('samsung')} onMouseLeave={handleMouseLeave}>
                        <Link href="/products?brand=Samsung" className={`flex items-center gap-1 transition-colors ${activeHoverMenu === 'samsung' ? 'text-[#0756C9]' : 'hover:text-[#0756C9]'}`}>
                          <span>Samsung</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'samsung' ? 'rotate-180 text-[#0756C9]' : ''}`} />
                        </Link>
                      </div>
                      <div className="relative py-2 cursor-pointer" onMouseEnter={() => handleMouseEnter('tablets')} onMouseLeave={handleMouseLeave}>
                        <Link href="/products?category=tablets" className={`flex items-center gap-1 transition-colors ${activeHoverMenu === 'tablets' ? 'text-[#0756C9]' : 'hover:text-[#0756C9]'}`}>
                          <span>iPad &amp; Tablets</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeHoverMenu === 'tablets' ? 'rotate-180 text-[#0756C9]' : ''}`} />
                        </Link>
                      </div>
                    </>
                  )}

                  <Link href="/track-order" className="hover:text-[#0756C9] py-2 transition-colors">
                    Track Order
                  </Link>
                  <Link href="/contact" className="hover:text-[#0756C9] py-2 transition-colors">
                    Contact Us
                  </Link>
                </nav>
              </div>
            </div>

            {/* AUTO-HOVER MEGA DROPDOWN PANEL (SYNCED WITH DATABASE) */}
            <AnimatePresence>
              {activeHoverMenu && getCategoryDropdownData(activeHoverMenu) && (() => {
                const dropData = getCategoryDropdownData(activeHoverMenu)!;
                return (
                  <motion.div
                    key={activeHoverMenu}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    onMouseEnter={() => {
                      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    }}
                    onMouseLeave={handleMouseLeave}
                    className="absolute left-0 right-0 top-full bg-white/95 backdrop-blur-2xl border-b border-[#DFEBF8] shadow-2xl z-50 py-6 px-4 sm:px-8"
                  >
                    <div className="max-w-7xl mx-auto">
                      {/* Header Info inside Dropdown */}
                      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DFEBF8]">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-[#102A56]">
                            {dropData.title}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#EAF7FF] text-[#0756C9] border border-[#C7E5FF]">
                            {dropData.tag}
                          </span>
                        </div>
                        <Link
                          href={dropData.viewAllLink}
                          onClick={() => setActiveHoverMenu(null)}
                          className="text-xs font-bold text-[#0756C9] hover:text-[#063B8E] flex items-center gap-1 group"
                        >
                          <span>Explore Full Catalog</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>

                      {/* Model Grid */}
                      {dropData.models && dropData.models.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                          {dropData.models.map((item: any, idx: number) => (
                            <Link
                              key={item.id || idx}
                              href={item.id ? `/products/${encodeURIComponent(item.id)}` : dropData.viewAllLink}
                              onClick={() => setActiveHoverMenu(null)}
                              className="group/item flex flex-col items-center text-center p-3 rounded-2xl hover:bg-[#EAF7FF]/60 border border-transparent hover:border-[#C7E5FF] transition-all duration-200"
                            >
                              <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                                <div className="absolute inset-0 rounded-full bg-[#0756C9]/10 blur-md opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="relative z-10 w-16 h-16 object-contain transition-transform duration-300 group-hover/item:scale-110 group-hover/item:-translate-y-1 drop-shadow-md"
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/categories/iphone.svg';
                                  }}
                                />
                              </div>

                              <span className="text-xs font-bold text-[#102A56] group-hover/item:text-[#0756C9] transition-colors block leading-tight line-clamp-1">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-[#8394AB] block mt-0.5 truncate max-w-[130px]">
                                {item.subtitle}
                              </span>
                              <span className="text-xs font-extrabold text-[#0756C9] block mt-1 font-mono">
                                Rs. {item.price ? item.price.toLocaleString() : 'Check Price'}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-xs text-[#8394AB]">No items in this category yet.</p>
                          <Link
                            href={dropData.viewAllLink}
                            onClick={() => setActiveHoverMenu(null)}
                            className="inline-block mt-2 px-4 py-1.5 rounded-full bg-[#0756C9] text-white text-xs font-bold"
                          >
                            Browse All Products
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 4. SLIDE-OUT SIDE NAVIGATION DRAWER (OPENS FROM LEFT)    */}
      {/* Matches the left-sided position of the hamburger icon    */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isSideNavOpen && (
          <div className={`fixed inset-0 z-50 flex ${isMobileScreen ? 'justify-end' : 'justify-start'}`}>
            {/* Dark Frosted Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsSideNavOpen(false)}
              className="fixed inset-0 bg-[#061838]/60 backdrop-blur-sm"
            />

            {/* Slide-In Panel from the SAME side where the active hamburger button is positioned:
                - On Desktop/Tablet: Hamburger is on LEFT -> Drawer slides in from LEFT
                - On Mobile: Hamburger is on RIGHT -> Drawer slides in from RIGHT
            */}
            <motion.div
              key={isMobileScreen ? 'drawer-right' : 'drawer-left'}
              initial={{ x: isMobileScreen ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isMobileScreen ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className={`relative w-[85vw] max-w-[320px] bg-white/95 backdrop-blur-2xl shadow-2xl h-full flex flex-col justify-between z-10 overflow-y-auto ${
                isMobileScreen ? 'border-l border-[#DFEBF8] rounded-l-3xl' : 'border-r border-[#DFEBF8] rounded-r-3xl'
              }`}
            >
              {/* Drawer Content Matching Screen 10 */}
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Top Bar: Logo & Close Button */}
                  <div className="p-4 border-b border-[#DCEBFA] flex items-center justify-between">
                    <BrandLogo variant="compact" />
                    <button
                      type="button"
                      onClick={() => setIsSideNavOpen(false)}
                      className="p-1.5 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] border border-[#DCEBFA] transition-colors cursor-pointer"
                      aria-label="Close Navigation"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Customer Profile Card */}
                  <Link
                    href={user ? '/account' : '/auth/login'}
                    onClick={() => setIsSideNavOpen(false)}
                    className="flex items-center gap-3 p-4 border-b border-[#DCEBFA] hover:bg-[#F7FBFF] transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#0866E8] text-white flex items-center justify-center font-bold text-base shadow-sm">
                      {user ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs font-black text-[#102A50] truncate">
                        {user ? user.name : 'Sign In / Register'}
                      </h3>
                      <p className="text-[11px] text-[#647A98] truncate">
                        {user ? user.email : 'Manage your orders & profile'}
                      </p>
                    </div>
                  </Link>

                  {/* Primary Nav Links */}
                  <div className="p-3 space-y-1">
                    <Link
                      href="/"
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <Home className="w-4 h-4 text-[#0866E8]" />
                      <span>Home</span>
                    </Link>

                    <Link
                      href="/products"
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <Smartphone className="w-4 h-4 text-[#0866E8]" />
                      <span>Shop All Devices</span>
                    </Link>

                    <Link
                      href="/categories"
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <LayoutGrid className="w-4 h-4 text-[#0866E8]" />
                      <span>Categories</span>
                    </Link>

                    {/* Dynamic categories quick list in drawer */}
                    {categories.length > 0 && (
                      <div className="pl-6 pr-2 py-1 space-y-0.5">
                        {categories
                          .filter((c) => c.isActive !== false)
                          .map((cat) => (
                            <Link
                              key={cat.id}
                              href={`/products?category=${encodeURIComponent(cat.slug)}`}
                              onClick={() => setIsSideNavOpen(false)}
                              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[#647A98] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                            >
                              <span className="truncate">{cat.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {cat.itemCount || 0}
                              </span>
                            </Link>
                          ))}
                      </div>
                    )}

                    <Link
                      href={user ? '/account' : '/auth/login'}
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#0866E8]" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-[#E5485B]" />
                        <span>Wishlist</span>
                      </div>
                      {wishlist.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-[#E5485B] border border-rose-200">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-[#0866E8]" />
                      <span>Wallet</span>
                    </Link>

                    <Link
                      href="/account"
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#0866E8]" />
                      <span>Settings</span>
                    </Link>

                    <Link
                      href="/contact"
                      onClick={() => setIsSideNavOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-[#102A50] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#0866E8]" />
                      <span>Help &amp; Support</span>
                    </Link>
                  </div>
                </div>

                {/* Bottom Promo Card Matching Screen 10 */}
                <div className="p-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0866E8] to-[#18A8F8] text-white shadow-md shadow-[#0866E8]/20 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black leading-tight">Free Delivery Across Pakistan</h4>
                      <p className="text-[10px] text-white/90 mt-0.5">On orders above Rs. 25,000</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 5. FULL-SCREEN MOBILE SEARCH MODAL / OVERLAY            */}
      {/* Opens directly on the mobile screen with fast suggestions*/}
      {/* ======================================================== */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-white flex flex-col overflow-hidden"
          >
            {/* Top Bar with Chevron, Search Input & Cancel Matching Screen 9 */}
            <div className="p-3 sm:p-4 border-b border-[#DCEBFA] flex items-center gap-2.5 bg-white shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                className="w-9 h-9 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] flex items-center justify-center transition-colors border border-[#DCEBFA] flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#0866E8] pointer-events-none" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (searchQuery.trim().length > 0) {
                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                        setIsMobileSearchOpen(false);
                      }
                    }
                  }}
                  placeholder="Search products..."
                  className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-2xl py-2.5 pl-10 pr-9 text-base text-[#102A50] placeholder-[#647A98] focus:outline-none focus:border-[#0866E8] focus:ring-4 focus:ring-[#0866E8]/10"
                />
                {searchQuery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-[#0866E8] hover:text-[#0645B5] px-2 py-2 cursor-pointer flex-shrink-0"
              >
                Cancel
              </button>
            </div>

            {/* Suggestions & Results Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Screen 9: Recent Searches & Popular Searches */}
              {searchQuery.trim().length === 0 && (
                <div className="space-y-6">
                  {/* Recent Searches */}
                  <div>
                    <span className="text-xs font-black text-[#102A50] block mb-2.5">
                      Recent Searches
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['iPhone 15', 'Samsung S24', 'Airpods'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setSearchQuery(tag)}
                          className="px-3.5 py-1.5 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#102A50] text-xs font-semibold border border-[#DCEBFA] transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular Searches */}
                  <div>
                    <span className="text-xs font-black text-[#102A50] block mb-2">
                      Popular Searches
                    </span>
                    <div className="space-y-1">
                      {[
                        'iPhone 15 Pro Max',
                        'Samsung Galaxy S24 Ultra',
                        'iPad Air',
                        'Smart Watches',
                        'Mobile Accessories',
                      ].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            if (item === 'Smart Watches') {
                              router.push('/products?category=smart-watches');
                            } else if (item === 'Mobile Accessories') {
                              router.push('/products?category=accessories');
                            } else {
                              router.push(`/products?search=${encodeURIComponent(item)}`);
                            }
                            setIsMobileSearchOpen(false);
                          }}
                          className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl text-xs font-medium text-[#647A98] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors text-left"
                        >
                          <Search className="w-3.5 h-3.5 text-[#647A98] flex-shrink-0" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Fast Instant Predictive Suggestions */}
              {searchResults.length > 0 && (
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#8394AB] block mb-3">
                    Matching Devices ({searchResults.length})
                  </span>
                  <div className="space-y-2">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => {
                          setIsMobileSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAFD] hover:bg-[#EAF7FF] border border-[#DFEBF8] transition-colors"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-[#DFEBF8] flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#102A56] truncate">{product.name}</h4>
                          <p className="text-[10px] text-[#52749D] truncate">{product.subtitle}</p>
                          <span className="text-xs font-black text-[#0756C9] font-mono block mt-0.5">
                            Rs. {product.price.toLocaleString()}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#8394AB] flex-shrink-0" />
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery.trim().length > 0) {
                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                        setIsMobileSearchOpen(false);
                      }
                    }}
                    className="w-full mt-4 py-3 rounded-2xl bg-[#0756C9] hover:bg-[#063B8E] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#0756C9]/25 cursor-pointer"
                  >
                    <span>View All Results for &quot;{searchQuery}&quot;</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xs font-semibold text-[#52749D]">
                    No devices found matching &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
