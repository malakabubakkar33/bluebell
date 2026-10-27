'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Truck, MessageSquare, ArrowRight, ShieldCheck, ShoppingBag, Copy, Check } from 'lucide-react';
import { playOrderSuccessSound } from '@/lib/sound';

interface AnimatedSuccessProps {
  orderId: string;
  trackingNumber: string;
  customerName?: string;
  total: number | string;
  onContinueShopping?: () => void;
  showContinueButton?: boolean;
}

export const AnimatedSuccessTick: React.FC<AnimatedSuccessProps> = ({
  orderId,
  trackingNumber,
  customerName = 'Valued Customer',
  total,
  onContinueShopping,
  showContinueButton = true,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    // Play celebratory success chime
    playOrderSuccessSound();
  }, []);

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedTotal = typeof total === 'number'
    ? total.toLocaleString()
    : Number(total || 0).toLocaleString();

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl p-6 sm:p-8 text-center animate-fadeIn relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Animated SVG Checkmark Icon with expanding wave rings */}
      <div className="relative w-24 h-24 mx-auto mb-5 flex items-center justify-center">
        {/* Pulse ring 1 */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
        {/* Pulse ring 2 */}
        <div className="absolute -inset-2 rounded-full bg-emerald-500/10 animate-pulse" />

        {/* Main Circle */}
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              className="animate-checkmark"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* Badges & Headings */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-wider mb-2">
        <span>Order Confirmed &bull; Cash on Delivery</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
        Thank You, {customerName}!
      </h2>

      <p className="text-xs sm:text-sm text-emerald-600 font-bold mt-1">
        Aapka Order Kamiyabi Se Book Ho Gaya Hai!
      </p>

      <p className="text-xs text-[#647A98] mt-1.5 leading-relaxed max-w-sm mx-auto">
        Our dispatch team at Saddar Peshawar has received your order and is preparing your official sealed pack box for shipment.
      </p>

      {/* Order Summary Receipt Box */}
      <div className="mt-5 bg-[#F7FBFF] border border-[#DCEBFA] rounded-2xl p-4 text-left space-y-2.5">
        <div className="flex justify-between items-center text-xs pb-2 border-b border-[#DCEBFA]">
          <span className="font-semibold text-[#647A98]">Order Code:</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-sm text-[#0866E8]">{orderId}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
              title="Copy Order ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs pb-2 border-b border-[#DCEBFA]">
          <span className="font-semibold text-[#647A98]">Courier Tracking:</span>
          <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded-md border border-[#DCEBFA] text-[#102A50]">
            {trackingNumber}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs pb-2 border-b border-[#DCEBFA]">
          <span className="font-semibold text-[#647A98]">Total Payable (COD):</span>
          <span className="font-mono font-black text-sm sm:text-base text-[#102A50]">
            Rs. {formattedTotal}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-[#647A98]">Estimated Delivery:</span>
          <span className="font-bold text-[#102A50]">2 - 4 Business Days</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2.5">
        <a
          href={`https://wa.me/923005902425?text=${encodeURIComponent(
            `Hi Blue Bell Mobile Shop! I just placed order ${orderId} for Rs. ${formattedTotal}. Can you please confirm the dispatch timeline?`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer active:scale-98"
        >
          <MessageSquare className="w-4 h-4 fill-white stroke-none" />
          <span>Confirm on WhatsApp (0300 5902425)</span>
        </a>

        <Link
          href={`/track-order?id=${orderId}`}
          className="w-full py-3 px-4 bg-[#0866E8] hover:bg-[#0645B5] text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#0866E8]/20 transition-all cursor-pointer"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </Link>

        {showContinueButton && (
          <Link
            href="/"
            onClick={onContinueShopping}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#F7FBFF] border border-[#DCEBFA] text-[#102A50] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#0866E8]" />
            <span>Continue Shopping</span>
          </Link>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-[#EDF2F7] flex items-center justify-center gap-2 text-[11px] text-[#647A98]">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>100% PTA Approved &bull; 7 Days Replacement &bull; Official Sealed Box</span>
      </div>
    </div>
  );
};
