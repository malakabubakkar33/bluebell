'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { user } = useAuth();

  // Hide on admin routes or full-screen checkout flows if needed
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Categories',
      href: '/categories',
      icon: LayoutGrid,
      isActive: pathname.startsWith('/categories') || pathname.startsWith('/products?category='),
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingCart,
      badge: totalItems,
      isActive: pathname === '/cart',
    },
    {
      label: 'Account',
      href: user ? '/account' : '/auth/login',
      icon: User,
      isActive: pathname.startsWith('/account') || pathname.startsWith('/auth'),
    },
  ];

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 md:hidden flex justify-center pointer-events-none px-4 safe-bottom-nav">
      <nav
        aria-label="Mobile Bottom Navigation"
        className="pointer-events-auto w-full max-w-sm bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_12px_36px_rgba(8,102,232,0.18),0_2px_12px_rgba(0,0,0,0.06)] rounded-full px-2 py-1.5 transition-all duration-300"
      >
        <div className="grid grid-cols-4 items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-full group select-none transition-all duration-200 active:scale-90 ${
                  active
                    ? 'text-[#0866E8] bg-[#0866E8]/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]'
                    : 'text-[#647A98] hover:text-[#0866E8] hover:bg-white/40'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active ? 'text-[#0866E8] stroke-[2.4]' : 'text-[#647A98] group-hover:text-[#0866E8]'
                    }`}
                  />

                  {/* Real Cart Count Badge */}
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E5485B] text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-fadeIn">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold tracking-tight transition-colors duration-200 mt-0.5 ${
                    active ? 'text-[#0866E8]' : 'text-[#647A98] group-hover:text-[#102A50]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
