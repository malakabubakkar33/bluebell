'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Phone } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || 'Islamabad',
    province: 'Punjab',
    postalCode: '',
    notes: '',
    paymentMethod: 'cod' as 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash',
  });

  // Prefill when user loads or updates
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        whatsapp: prev.whatsapp || user.whatsapp || user.phone || '',
        email: prev.email || user.email || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || 'Islamabad',
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const shippingFee = subtotal > 100 || subtotal === 0 ? 0 : 10;
  const grandTotal = subtotal + shippingFee;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.whatsapp || !formData.address) {
      setErrorMessage('Please fill in your name, contact phone, active WhatsApp number, and delivery address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.fullName,
          customer_phone: formData.phone,
          customer_whatsapp: formData.whatsapp,
          customer_email: formData.email || 'customer@bluebell.pk',
          shipping_address: formData.address,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postalCode,
          payment_method: formData.paymentMethod,
          items: cart,
          subtotal,
          shipping_fee: shippingFee,
          total: grandTotal,
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        clearCart();
        router.push(
          `/order-success?id=${result.data.id}&track=${result.data.tracking_number || ''}&name=${encodeURIComponent(
            formData.fullName
          )}&total=${grandTotal}`
        );
      } else {
        throw new Error(result.error || 'Failed to submit order');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while creating order.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-white w-full max-w-full overflow-x-hidden">
        <PageHeader title="Checkout" />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-600 flex items-center justify-center mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Your Cart is Currently Empty</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            Looks like you haven't added any smartphones or accessories to your cart yet. Explore our genuine collection to get started.
          </p>
          <Link
            href="/products"
            className="mt-6 px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20"
          >
            Explore Phones & Accessories
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 w-full max-w-full overflow-x-hidden">
      <PageHeader title="Checkout" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6 font-medium">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-brand-600">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">Secure Checkout</span>
        </div>

        <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Order Checkout
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete your order details with verified official warranty and nationwide courier shipping.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <Lock className="w-4 h-4" />
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Customer & Shipping & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Information */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span>Contact & Customer Info</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ali Ahmed"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Phone (For Calls & Courier) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                  />
                </div>

                <div className="sm:col-span-2 bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>WhatsApp Number (Required for Bill & Invoice)</span>
                      <span className="text-rose-600 font-bold">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide bg-emerald-100/90 px-2 py-0.5 rounded-md">
                      Instant WhatsApp Bill
                    </span>
                  </div>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <p className="text-[11px] text-emerald-900 mt-1.5">
                    Blue Bell admin team will send your complete order confirmation, warranty receipt, and official invoice directly to this WhatsApp number.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ali@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Delivery Address (Pakistan)</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Street Address / House / Flat / Sector <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House 12, Street 4, Sector G-11/3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Islamabad / Lahore / Karachi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Province <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad Capital Territory">Islamabad Capital</option>
                      <option value="Azad Kashmir">Azad Kashmir</option>
                      <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Postal Code (Optional)
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="44000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="e.g. Call before delivering, or deliver between 2 PM and 6 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-base sm:text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-brand-600 bg-blue-50/40 ring-2 ring-brand-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'cod' }))}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Cash on Delivery (COD)</span>
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay safely in cash to the rider upon receiving your parcel.
                    </p>
                  </div>
                </label>

                {/* Direct Bank Transfer */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'bank_transfer'
                      ? 'border-brand-600 bg-blue-50/40 ring-2 ring-brand-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'bank_transfer' }))}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-600" />
                      <span>Direct Online Bank Transfer (Meezan / HBL / Alfalah)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Transfer directly to our official corporate account. Bank details provided on next page.
                    </p>
                  </div>
                </label>

                {/* EasyPaisa / JazzCash */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.paymentMethod === 'easypaisa' || formData.paymentMethod === 'jazzcash'
                      ? 'border-brand-600 bg-blue-50/40 ring-2 ring-brand-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="easypaisa"
                    checked={formData.paymentMethod === 'easypaisa' || formData.paymentMethod === 'jazzcash'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'easypaisa' }))}
                    className="mt-1 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-900">
                      EasyPaisa / JazzCash Mobile Account
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Instant mobile wallet transfer with receipt verification.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm">Order Summary ({cart.length} items)</h3>
                <Link href="/products" className="text-xs text-brand-600 hover:underline font-bold">
                  Edit Cart
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={`${item.productId}-${item.selectedColor || ''}-${item.selectedStorage || ''}`} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 p-1 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {item.selectedStorage || ''} {item.selectedColor ? `• ${item.selectedColor}` : ''} • Qty: {item.quantity}
                      </p>
                      <span className="text-xs font-extrabold text-slate-900">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Nationwide Courier Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-600 uppercase text-[11px]">Free</span>
                  ) : (
                    <span className="font-bold text-slate-900">${shippingFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-slate-900 font-black text-base pt-3 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-brand-600">${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  isSubmitting
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/25 active:scale-98'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Confirming Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Place Order</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PTA Approved • Official Warranty Included</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
