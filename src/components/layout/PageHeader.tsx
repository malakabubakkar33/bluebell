'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface PageHeaderProps {
  title?: string;
  showCart?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, showCart = true }) => {
  const router = useRouter();
  const { totalItems, setIsDrawerOpen } = useCart();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 glass-header border-b border-slate-100/80 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Back Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          {/* Home Button */}
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Go home"
          >
            <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Page Title */}
          {title && (
            <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate max-w-[180px] sm:max-w-none">
              {title}
            </h1>
          )}
        </div>

        {/* Right: Cart */}
        {showCart && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        )}
      </div>
    </motion.header>
  );
};
