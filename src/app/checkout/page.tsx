'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Plus,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Smartphone,
  Truck,
  Edit2,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { AnimatedSuccessTick } from '@/components/common/AnimatedSuccessTick';
import { playOrderSuccessSound } from '@/lib/sound';

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
    city: user?.city || 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    postalCode: '25000',
    notes: '',
    paymentMethod: 'cod' as 'cod' | 'easypaisa' | 'card',
  });

  const [isEditingAddress, setIsEditingAddress] = useState(!user?.address);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state when user profile is loaded
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        whatsapp: prev.whatsapp || user.whatsapp || user.phone || '',
        email: prev.email || user.email || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || 'Peshawar',
      }));
      if (user.address) {
        setIsEditingAddress(false);
      }
    }
  }, [user]);

  // Delivery Charges: Free on orders above Rs. 25,000
  const isFreeDelivery = subtotal >= 25000 || subtotal === 0;
  const shippingFee = isFreeDelivery ? 0 : 500;
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
      setErrorMessage('Aapka cart khali hai. Order dene ke liye pehle items add karein.');
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMessage('Apna Mukammal Naam (Full Name) darj karein.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage('Apna Phone Number darj karein.');
      return;
    }

    if (!formData.address.trim()) {
      setErrorMessage('Apna Mukammal Delivery Address (House / Street / Area) darj karein.');
      setIsEditingAddress(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanPhone = formData.phone.trim();
      const whatsappNumber = formData.whatsapp.trim() || cleanPhone;
      const customerEmail = user?.email || (formData.email.includes('@')
        ? formData.email.trim()
        : `${cleanPhone.replace(/[^0-9]/g, '') || 'guest'}@bluebell.pk`);

      // Map payment methods strictly to DB constraints
      let paymentMethod = formData.paymentMethod;
      if (paymentMethod === 'card') {
        paymentMethod = 'bank_transfer' as any;
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.fullName.trim(),
          customer_phone: cleanPhone,
          customer_whatsapp: whatsappNumber,
          customer_email: customerEmail,
          shipping_address: formData.address.trim(),
          city: formData.city.trim() || 'Peshawar',
          province: formData.province || 'Khyber Pakhtunkhwa',
          postal_code: formData.postalCode || '25000',
          payment_method: paymentMethod,
          items: cart,
          subtotal,
          shipping_fee: shippingFee,
          total: grandTotal,
          notes: formData.notes.trim(),
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        clearCart();
        setPlacedOrder(result.data);
        playOrderSuccessSound();

        // Broadcast new order to Admin Panel & other tabs
        try {
          const syncChan = new BroadcastChannel('bluebell_store_sync');
          syncChan.postMessage({
            type: 'ORDER_UPDATED',
            orderId: result.data.id,
            customerName: formData.fullName,
            total: grandTotal,
            timestamp: Date.now(),
          });
          syncChan.close();
        } catch (e) {
          // BroadcastChannel fallback
        }

        // Scroll to top to see animated success checkmark
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        throw new Error(result.error || 'Failed to submit order');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred while creating order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State 1: Order Placed Successfully - Render Animated Success Tick with Sound
  if (placedOrder) {
    return (
      <main className="min-h-screen flex flex-col bg-[#F7FBFF] text-[#102A50]">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 sm:py-16 flex items-center justify-center">
          <AnimatedSuccessTick
            orderId={placedOrder.id}
            trackingNumber={placedOrder.tracking_number}
            customerName={placedOrder.customer_name}
            total={placedOrder.total}
            showContinueButton={true}
          />
        </div>
        <Footer />
      </main>
    );
  }

  // State 2: Cart is Empty
  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-[#F7FBFF] text-[#102A50]">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="max-w-md mx-auto my-auto text-center py-20 px-4">
          <div className="w-16 h-16 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center mx-auto mb-4 border border-[#DCEBFA]">
            <Truck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#102A50] mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-[#647A98] mb-6">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0866E8] hover:bg-[#0645B5] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // State 3: Checkout Form (Instant & Guest Friendly)
  return (
    <main className="min-h-screen bg-[#F7FBFF] text-[#102A50] flex flex-col">
      {/* Mobile Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#DCEBFA] shadow-xs md:hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center border border-[#DCEBFA] active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex justify-center">
            <BrandLogo variant="compact" />
          </div>

          <div className="w-9" />
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 max-w-md md:max-w-3xl mx-auto w-full px-4 py-5 space-y-6">
        {/* User Account / Guest Status Banner */}
        {user ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed in as <strong>{user.name || user.email}</strong></span>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Profile Saved
            </span>
          </div>
        ) : (
          <div className="p-3 bg-[#EDF6FF] border border-[#DCEBFA] rounded-2xl flex items-center justify-between text-xs text-[#0866E8]">
            <span>
              Have an account?{' '}
              <Link href="/auth/login?redirect=/checkout" className="font-bold underline hover:text-[#0645B5]">
                Sign In
              </Link>{' '}
              or continue as Guest below.
            </span>
            <span className="text-[10px] bg-white text-[#0866E8] px-2.5 py-0.5 rounded-full border border-[#DCEBFA] font-bold">
              Instant Checkout
            </span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#E5485B] text-xs font-bold animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0866E8]" />
                <h2 className="text-sm font-black text-[#102A50]">Delivery Address</h2>
              </div>

              {user?.address && (
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] text-xs font-bold border border-[#DCEBFA] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingAddress ? 'Use Saved Address' : 'Change Address'}</span>
                </button>
              )}
            </div>

            {/* Saved Address Summary Card (for logged-in users with saved address) */}
            {!isEditingAddress && user?.address ? (
              <div className="bg-white border-2 border-[#0866E8] rounded-2xl p-4 shadow-xs relative">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-[#0866E8] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0866E8]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#102A50]">{formData.fullName || user.name || 'Saved Address'}</span>
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="text-xs font-bold text-[#0866E8] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                    </div>

                    <p className="text-xs text-[#647A98] mt-1 leading-relaxed">
                      {formData.address}, {formData.city}, {formData.province}
                    </p>
                    <p className="text-[11px] text-[#647A98] mt-0.5">
                      Phone: <span className="font-semibold text-[#102A50]">{formData.phone || 'Not set'}</span>
                      {formData.whatsapp && formData.whatsapp !== formData.phone && (
                        <span> • WhatsApp: <span className="font-semibold text-[#102A50]">{formData.whatsapp}</span></span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Editable Address Form */
              <div className="bg-white border border-[#DCEBFA] rounded-2xl p-4 shadow-xs space-y-3.5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#102A50] block mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Malik Abubakar"
                      className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#102A50] block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0300 1234567"
                      className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#102A50]">WhatsApp Number</label>
                    <span className="text-[11px] text-[#647A98]">Optional (same as phone if blank)</span>
                  </div>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="0300 1234567"
                    className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">Street / House Delivery Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House/Shop #, Street, Mohallah, Area, Landmark"
                    className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#102A50] block mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Peshawar / Islamabad / Lahore"
                      className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#102A50] block mb-1">Province *</label>
                    <select
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    >
                      <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Sindh">Sindh</option>
                      <option value="Balochistan">Balochistan</option>
                      <option value="Islamabad Capital">Islamabad Capital</option>
                    </select>
                  </div>
                </div>

                {/* City quick chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-[#647A98] font-semibold">Quick Select:</span>
                  {['Peshawar', 'Islamabad', 'Rawalpindi', 'Lahore', 'Karachi'].map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => setFormData((p) => ({
                        ...p,
                        city: cityName,
                        province: cityName === 'Peshawar' ? 'Khyber Pakhtunkhwa' : cityName === 'Islamabad' ? 'Islamabad Capital' : cityName === 'Karachi' ? 'Sindh' : 'Punjab',
                      }))}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                        formData.city === cityName
                          ? 'bg-[#0866E8] text-white border-[#0866E8]'
                          : 'bg-white text-[#647A98] border-[#DCEBFA] hover:border-[#0866E8]'
                      }`}
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0866E8]" />
              <h2 className="text-sm font-black text-[#102A50]">Payment Method</h2>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Cash on Delivery */}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  formData.paymentMethod === 'cod'
                    ? 'border-[#0866E8] bg-[#EDF6FF]/60 ring-2 ring-[#0866E8]/10'
                    : 'border-[#DCEBFA] bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'cod' }))}
                  className="w-4 h-4 text-[#0866E8] focus:ring-[#0866E8]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#102A50]">Cash on Delivery (COD)</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded">Recommended</span>
                  </div>
                  <span className="text-[11px] text-[#647A98] block mt-0.5">Pay in cash when rider delivers your package</span>
                </div>
                <Banknote className="w-5 h-5 text-[#0866E8]" />
              </label>

              {/* Option 2: JazzCash / Easypaisa */}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  formData.paymentMethod === 'easypaisa'
                    ? 'border-[#0866E8] bg-[#EDF6FF]/60 ring-2 ring-[#0866E8]/10'
                    : 'border-[#DCEBFA] bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="easypaisa"
                  checked={formData.paymentMethod === 'easypaisa'}
                  onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'easypaisa' }))}
                  className="w-4 h-4 text-[#0866E8] focus:ring-[#0866E8]"
                />
                <div className="flex-1">
                  <span className="text-xs font-black text-[#102A50] block">JazzCash / Easypaisa</span>
                  <span className="text-[11px] text-[#647A98] block">Pay via mobile wallet account</span>
                </div>
                <Smartphone className="w-5 h-5 text-[#0866E8]" />
              </label>

              {/* Option 3: Bank Transfer */}
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  formData.paymentMethod === 'card'
                    ? 'border-[#0866E8] bg-[#EDF6FF]/60 ring-2 ring-[#0866E8]/10'
                    : 'border-[#DCEBFA] bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'card' }))}
                  className="w-4 h-4 text-[#0866E8] focus:ring-[#0866E8]"
                />
                <div className="flex-1">
                  <span className="text-xs font-black text-[#102A50] block">Direct Bank Transfer / Card</span>
                  <span className="text-[11px] text-[#647A98] block">Meezan / HBL / MCB account transfer</span>
                </div>
                <CreditCard className="w-5 h-5 text-[#0866E8]" />
              </label>
            </div>
          </div>

          {/* Section 3: Delivery Notes (Optional) */}
          <div className="bg-white border border-[#DCEBFA] rounded-2xl p-4 shadow-xs">
            <label className="text-xs font-bold text-[#102A50] block mb-1">
              Order Notes / Delivery Instructions (Optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="e.g. Please call before arriving or deliver after 2 PM"
              className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
            />
          </div>

          {/* Section 4: Order Summary Card */}
          <div className="bg-white border border-[#DCEBFA] rounded-3xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-black text-[#102A50] uppercase tracking-wider">
              Order Summary ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
            </h3>

            <div className="divide-y divide-[#DCEBFA] text-xs">
              {cart.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded-lg bg-[#EDF6FF] p-1 flex-shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-bold text-[#102A50] block truncate">{item.name}</span>
                      <span className="text-[10px] text-[#647A98]">
                        Qty: {item.quantity} {item.selectedStorage ? `• ${item.selectedStorage}` : ''} {item.selectedColor ? `• ${item.selectedColor}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold font-mono text-[#102A50] flex-shrink-0">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#DCEBFA] space-y-1.5 text-xs text-[#647A98]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="font-bold font-mono text-[#102A50]">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Charges</span>
                <span className="font-bold font-mono text-emerald-600">
                  {shippingFee === 0 ? 'Free Delivery' : `Rs. ${shippingFee}`}
                </span>
              </div>
              <div className="pt-2 border-t border-[#DCEBFA] flex items-center justify-between text-sm font-black text-[#102A50]">
                <span>Total Amount</span>
                <span className="text-base font-black text-[#0866E8] font-mono">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isSubmitting
                ? 'bg-[#0866E8]/70 cursor-wait'
                : 'bg-[#0866E8] hover:bg-[#0645B5] shadow-[#0866E8]/25 active:scale-98'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Booking Your Order Securely...</span>
              </>
            ) : (
              <>
                <span>Confirm & Place Order (Rs. {grandTotal.toLocaleString()})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 flex items-center justify-center gap-2 text-center text-[11px] text-[#647A98]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% PTA Approved &bull; 7 Days Replacement &bull; Official Sealed Box</span>
          </div>
        </form>
      </div>

      <Footer />
    </main>
  );
}
