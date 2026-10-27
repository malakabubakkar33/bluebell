'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, totalItems, subtotal } = useCart();

  // Free delivery threshold: Rs. 25,000
  const isFreeDelivery = subtotal >= 25000 || subtotal === 0;
  const deliveryCharges = isFreeDelivery ? 0 : 500;
  const grandTotal = subtotal + deliveryCharges;

  return (
    <main className="min-h-screen bg-[#F7FBFF] text-[#102A50] flex flex-col">
      {/* Top Header Bar Matching Screen 5 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#DCEBFA] shadow-xs">
        <div className="max-w-md md:max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go Back"
            className="w-9 h-9 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] flex items-center justify-center transition-colors cursor-pointer border border-[#DCEBFA]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex justify-center">
            <BrandLogo variant="compact" />
          </div>

          <div className="w-9" /> {/* Visual Balance spacer */}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-md md:max-w-4xl mx-auto w-full px-4 py-4 space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-[#102A50] tracking-tight">
            My Cart ({totalItems})
          </h1>
          {cart.length > 0 && (
            <Link
              href="/products"
              className="text-xs font-bold text-[#0866E8] hover:underline"
            >
              Continue Shopping
            </Link>
          )}
        </div>

        {/* EMPTY STATE */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#DCEBFA] p-8 sm:p-12 text-center my-6 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center mx-auto mb-4 border border-[#DCEBFA]">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <h2 className="text-lg font-black text-[#102A50] mb-1">Your Cart is Empty</h2>
            <p className="text-xs text-[#647A98] max-w-xs mx-auto mb-6">
              Looks like you haven&apos;t added any devices to your cart yet. Browse our PTA approved smartphones and genuine accessories.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-black shadow-md shadow-[#0866E8]/20 transition-all cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="space-y-3">
              {cart.map((item) => {
                const variantKey = item.variantId || 'default';
                const variantText = [item.selectedStorage, item.selectedColor]
                  .filter(Boolean)
                  .join(' • ');

                return (
                  <div
                    key={`${item.productId}-${variantKey}`}
                    className="bg-white border border-[#DCEBFA] rounded-2xl p-3.5 shadow-xs flex items-center gap-3.5 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#EDF6FF] p-2 flex items-center justify-center flex-shrink-0 border border-[#DCEBFA]/50">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.productId}`}
                          className="text-xs sm:text-sm font-bold text-[#102A50] hover:text-[#0866E8] transition-colors truncate block"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          aria-label={`Remove ${item.name}`}
                          className="p-1 text-[#647A98] hover:text-[#E5485B] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {variantText && (
                        <p className="text-[10px] sm:text-xs text-[#647A98] truncate mt-0.5">
                          {variantText}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2 pt-1">
                        {/* Price */}
                        <span className="text-xs sm:text-sm font-black text-[#102A50] font-mono">
                          Rs. {item.price.toLocaleString()}
                        </span>

                        {/* Quantity Pill Controls */}
                        <div className="flex items-center gap-2 bg-[#EDF6FF] rounded-full p-1 border border-[#DCEBFA]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            aria-label="Decrease quantity"
                            className="w-6 h-6 rounded-full bg-white text-[#102A50] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-[#102A50] min-w-[16px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            aria-label="Increase quantity"
                            className="w-6 h-6 rounded-full bg-white text-[#102A50] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary Card Matching Screen 5 */}
            <div className="bg-white border border-[#DCEBFA] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#647A98]">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#102A50] font-mono">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#647A98]">
                  <div className="flex items-center gap-1.5">
                    <span>Delivery Charges</span>
                    {isFreeDelivery && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A675] text-[10px] font-black border border-emerald-200">
                        Free Delivery
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-[#102A50] font-mono">
                    {deliveryCharges === 0 ? 'Rs. 0' : `Rs. ${deliveryCharges.toLocaleString()}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#DCEBFA] flex items-center justify-between">
                  <span className="text-sm font-black text-[#102A50]">Total</span>
                  <span className="text-base sm:text-lg font-black text-[#0866E8] font-mono">
                    Rs. {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA Button */}
              <Link
                href="/checkout"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-[#0866E8]/25 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={handleWhatsAppCartOrder}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                <span>Order via WhatsApp (0300 5902425)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
