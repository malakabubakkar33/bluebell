'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const whatsappNumber = '923005902425';
  const defaultMessage = encodeURIComponent(
    'Assalam-o-Alaikum Blue Bell Mobile Shop! I am interested in placing an order / inquiring about your mobile phones and stock.'
  );

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center group">
      {/* Tooltip badge */}
      <span className="hidden sm:inline-flex items-center mr-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none translate-x-2 group-hover:translate-x-0">
        Order on WhatsApp &bull; 0300 5902425
      </span>

      <a
        href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Blue Bell Mobile Shop on WhatsApp"
        className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
      >
        {/* Pulse radar ping */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white stroke-none relative z-10" />
      </a>
    </aside>
  );
};
