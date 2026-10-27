'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { AnimatedSuccessTick } from '@/components/common/AnimatedSuccessTick';
import { playOrderSuccessSound } from '@/lib/sound';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItems,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Free shipping threshold in PKR: Rs. 25,000
  const freeShippingThreshold = 25000;
  const progressPercent = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountNeeded = Math.max(freeShippingThreshold - subtotal, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'BLUEBELL10') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponMessage('10% discount applied!');
    } else {
      setCouponMessage('Invalid coupon code. Try BLUEBELL10');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrderError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const address = String(formData.get('address') || '').trim();

    if (!name || !phone || !address) {
      setOrderError('Name, phone number aur delivery address darj karein.');
      return;
    }

    if (cart.length === 0) {
      setOrderError('Aapka cart khali hai.');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const shippingCharge = amountNeeded === 0 ? 0 : 500;
      const finalTotal = subtotal - appliedDiscount + shippingCharge;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          customer_whatsapp: phone,
          customer_email: `${phone.replace(/[^0-9]/g, '') || 'guest'}@bluebell.pk`,
          shipping_address: address,
          city: 'Peshawar',
          province: 'Khyber Pakhtunkhwa',
          payment_method: 'cod',
          items: cart,
          subtotal: subtotal - appliedDiscount,
          shipping_fee: shippingCharge,
          total: finalTotal,
        }),
      });

      const result = await res.json();

      if (result.success && result.data) {
        clearCart();
        setIsCheckingOut(false);
        setPlacedOrder(result.data);
        playOrderSuccessSound();

        // Broadcast to admin dashboard
        try {
          const chan = new BroadcastChannel('bluebell_store_sync');
          chan.postMessage({
            type: 'ORDER_UPDATED',
            orderId: result.data.id,
            customerName: name,
            total: finalTotal,
            timestamp: Date.now(),
          });
          chan.close();
        } catch {}
      } else {
        throw new Error(result.error || 'Order place karne me masla hua. Dobara koshish karein.');
      }
    } catch (err: any) {
      setOrderError(err.message || 'Network error occurred while booking order.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleWhatsAppCartOrder = () => {
    if (!cart || cart.length === 0) return;
    const itemsList = cart
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.name}*` +
          (it.selectedStorage ? ` (${it.selectedStorage}` + (it.selectedColor ? `, ${it.selectedColor}` : '') + `)` : '') +
          ` - Qty: ${it.quantity} - Rs. ${(it.price * it.quantity).toLocaleString()}`
      )
      .join('\n');
    const finalTotal = subtotal - appliedDiscount + (amountNeeded === 0 ? 0 : 500);
    const message = encodeURIComponent(
      `Hello Blue Bell Mobile Shop! I want to order from my cart:\n\n${itemsList}\n\n*Total Bill: Rs. ${finalTotal.toLocaleString()}*\n\nPlease confirm availability and dispatch details.`
    );
    window.open(`https://wa.me/923005902425?text=${message}`, '_blank');
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => {
          setIsDrawerOpen(false);
          setPlacedOrder(null);
        }}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slideInRight">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-base text-slate-900">Your Cart ({totalItems})</h3>
            </div>
            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setPlacedOrder(null);
              }}
              className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          {cart.length > 0 && !placedOrder && (
            <div className="px-5 py-3 bg-brand-50/40 border-b border-brand-100/40">
              <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                <span className="text-slate-600">
                  {amountNeeded === 0 ? (
                    <strong className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" /> You unlocked FREE Delivery!
                    </strong>
                  ) : (
                    <>
                      Add <strong className="text-brand-600 font-bold">Rs. {amountNeeded.toLocaleString()}</strong> for Free Delivery
                    </>
                  )}
                </span>
                <span className="text-[11px] font-bold text-slate-400">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List / Checkout / Success View */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {placedOrder ? (
              <div className="py-2 animate-fadeIn">
                <AnimatedSuccessTick
                  orderId={placedOrder.id}
                  trackingNumber={placedOrder.tracking_number}
                  customerName={placedOrder.customer_name}
                  total={placedOrder.total}
                  onContinueShopping={() => {
                    setIsDrawerOpen(false);
                    setPlacedOrder(null);
                  }}
                  showContinueButton={true}
                />
              </div>
            ) : isCheckingOut ? (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-800">Quick Cash On Delivery</h4>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-brand-600 hover:underline cursor-pointer"
                  >
                    Back to Cart
                  </button>
                </div>

                {orderError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#E5485B] text-xs font-bold animate-fadeIn">
                    {orderError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Malik Abubakar"
                    className="w-full text-base sm:text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="0300 1234567"
                    className="w-full text-base sm:text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Delivery Address *</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    placeholder="House/Apartment #, Street, Area, City"
                    className="w-full text-base sm:text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-brand-50 rounded-xl text-xs text-brand-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Pay with Cash upon delivery after inspecting package.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className={`w-full py-3.5 rounded-full font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmittingOrder
                      ? 'bg-brand-400 cursor-wait'
                      : 'bg-brand-500 hover:bg-brand-600 active:scale-98'
                  }`}
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Booking Your Order...</span>
                    </>
                  ) : (
                    <span>Confirm Order (Rs. {(subtotal - appliedDiscount + (amountNeeded === 0 ? 0 : 500)).toLocaleString()})</span>
                  )}
                </button>
              </form>
            ) : cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Your cart is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Explore our selection of iPhones, Samsung flagships, and premium accessories.
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-brand-500 text-white font-bold text-xs"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.variantId || idx}`}
                    className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200 flex-shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.selectedStorage && (
                        <p className="text-[11px] text-slate-500">{item.selectedStorage}</p>
                      )}

                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-1 border border-slate-200 bg-white rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-brand-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-brand-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-slate-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {!placedOrder && !isCheckingOut && cart.length > 0 && (
            <div className="p-5 border-t border-slate-100 bg-white space-y-4">
              {/* Promo input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Coupon (Try BLUEBELL10)"
                    className="w-full text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl py-2 pl-8 pr-3 focus:outline-none focus:border-brand-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </form>

              {couponMessage && (
                <p className="text-[11px] font-medium text-brand-600 -mt-2">{couponMessage}</p>
              )}

              {/* Price summary */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount (10%)</span>
                    <span>- Rs. {appliedDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">
                    {amountNeeded === 0 ? 'FREE' : 'Rs. 500'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-brand-600">
                    Rs. {(subtotal - appliedDiscount + (amountNeeded === 0 ? 0 : 500)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 group transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Order on WhatsApp Button */}
              <button
                type="button"
                onClick={handleWhatsAppCartOrder}
                className="w-full py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                <span>Order via WhatsApp (0300 5902425)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
