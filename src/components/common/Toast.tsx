'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle2 } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none">
      <div className="bg-slate-900/95 text-white backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
