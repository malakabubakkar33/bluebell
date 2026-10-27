'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

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
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Free shipping threshold in PKR: Rs. 25,000 (roughly $100 equivalent)
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

  const handleCheckoutSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderNumber = `BB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderSuccess(orderNumber);
    clearCart();
    setIsCheckingOut(false);
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => {
          setIsDrawerOpen(false);
          setOrderSuccess(null);
        }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-500 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Your Cart</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsDrawerOpen(false);
                setOrderSuccess(null);
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-5 py-3 bg-[#f8faff] border-b border-blue-50">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              {amountNeeded > 0 ? (
                <span className="text-slate-700">
                  Add <strong className="text-brand-600 font-bold">Rs. {amountNeeded.toLocaleString()}</strong> for Free Delivery
                </span>
              ) : (
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  You unlocked Free Delivery!
                </span>
              )}
              <span className="text-slate-400 font-normal">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-blue-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {orderSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-slate-900">Order Placed Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Thank you for shopping with Blue Bell Mobile Shop. Your Cash on Delivery order has been registered.
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-slate-100 font-mono text-sm font-bold text-slate-800">
                  Order ID: {orderSuccess}
                </div>
                <div>
                  <button
                    onClick={() => {
                      setOrderSuccess(null);
                      setIsDrawerOpen(false);
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : isCheckingOut ? (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900">Cash on Delivery Checkout</h4>
                  <button
                    type="button"
                    onClick={() => setIsCheckingOut(false)}
                    className="text-xs text-brand-600 font-medium hover:underline"
                  >
                    Back to Cart
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                    <input
                      name="fullName"
                      required
                      placeholder="e.g. Muhammad Usman"
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-base sm:text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Phone Number *</label>
                    <input
                      name="phone"
                      required
                      placeholder="+92 300 1234567"
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-base sm:text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">City *</label>
                    <input
                      name="city"
                      required
                      placeholder="Islamabad / Lahore / Karachi"
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-base sm:text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Shipping Address *</label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      placeholder="Street, House No, Sector/Area"
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-base sm:text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 rounded-xl flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>Pay with Cash upon delivery after inspecting package.</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md transition-all"
                >
                  Confirm Order (Rs. {(subtotal - appliedDiscount).toLocaleString()})
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
          {!orderSuccess && !isCheckingOut && cart.length > 0 && (
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
