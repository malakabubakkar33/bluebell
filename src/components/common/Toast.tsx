'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  const isWarning =
    toastMessage.toLowerCase().includes('out of stock') ||
    toastMessage.toLowerCase().includes('unavailable') ||
    toastMessage.toLowerCase().includes('error') ||
    toastMessage.toLowerCase().includes('failed');

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-200 pointer-events-none max-w-sm">
      <div
        className={`backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold ${
          isWarning
            ? 'bg-rose-950/95 text-white border-2 border-rose-500/70 shadow-rose-900/40'
            : 'bg-slate-900/95 text-white border border-slate-800'
        }`}
      >
        {isWarning ? (
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pulse" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        )}
        <span className="leading-snug">{toastMessage}</span>
      </div>
    </div>
  );
};
