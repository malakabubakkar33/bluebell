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
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-2xl border-t border-[#DCEBFA] shadow-[0_-4px_24px_rgba(8,102,232,0.08)] transition-transform duration-300 safe-bottom-nav"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 px-2 pt-2 pb-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-1 group select-none transition-colors"
            >
              {/* Active top pill indicator */}
              {active && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#0866E8] shadow-[0_2px_8px_rgba(8,102,232,0.5)]" />
              )}

              <div className="relative flex items-center justify-center p-1 rounded-xl transition-transform active:scale-90">
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    active ? 'text-[#0866E8] stroke-[2.4]' : 'text-[#647A98] group-hover:text-[#0866E8]'
                  }`}
                />

                {/* Real Cart Count Badge */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E5485B] text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-fadeIn">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-bold tracking-tight transition-colors duration-200 mt-0.5 ${
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
  );
};
