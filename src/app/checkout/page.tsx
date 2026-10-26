'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    whatsapp: user?.whatsapp || user?.phone || '',
    email: user?.email || '',
    address: user?.address || 'House No. 123, Street 4, GT Road, Saddar',
    city: user?.city || 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    postalCode: '25000',
    notes: '',
    paymentMethod: 'cod' as 'cod' | 'easypaisa' | 'card',
  });

  const [isEditingAddress, setIsEditingAddress] = useState(!user?.address);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state if user loads
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '',
        whatsapp: prev.whatsapp || user.whatsapp || user.phone || '',
        email: prev.email || user.email || '',
        address: prev.address || user.address || 'House No. 123, Street 4, GT Road, Saddar',
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
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    const outOfStockItem = cart.find(
      (item) => item.maxStock !== undefined && item.maxStock <= 0
    );
    if (outOfStockItem) {
      setErrorMessage(
        `Out of Stock: "${outOfStockItem.name}" is currently unavailable. Please remove it from your cart before placing your order.`
      );
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.whatsapp || !formData.address) {
      setErrorMessage('Please provide your name, phone, WhatsApp number, and delivery address.');
      setIsEditingAddress(true);
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0866E8] hover:bg-[#0645B5] text-white font-bold text-xs shadow-md transition-all"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7FBFF] text-[#102A50] flex flex-col">
      {/* Mobile Header Bar Matching Screen 6 */}
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
        <form onSubmit={handleSubmitOrder} className="space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-[#E5485B] text-xs font-bold animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* Section 1: Delivery Address Matching Screen 6 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0866E8]" />
                <h2 className="text-sm font-black text-[#102A50]">Delivery Address</h2>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] text-xs font-bold border border-[#DCEBFA] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isEditingAddress ? 'Done Editing' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Address Selection Card Matching Screen 6 */}
            {!isEditingAddress ? (
              <div className="bg-white border-2 border-[#0866E8] rounded-2xl p-4 shadow-xs relative">
                <div className="flex items-start gap-3">
                  {/* Selected Radio Indicator */}
                  <div className="w-5 h-5 rounded-full border-2 border-[#0866E8] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0866E8]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#102A50]">{formData.fullName || 'Home'}</span>
                        <span className="px-2 py-0.5 rounded-md bg-[#EDF6FF] text-[#0866E8] text-[10px] font-black uppercase">
                          Home
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(true)}
                        className="text-xs font-bold text-[#0866E8] hover:underline"
                      >
                        Change
                      </button>
                    </div>

                    <p className="text-xs text-[#647A98] mt-1 leading-relaxed">
                      {formData.address}, {formData.city}, {formData.province}
                    </p>
                    <p className="text-[11px] text-[#647A98] mt-0.5">
                      Phone: <span className="font-semibold text-[#102A50]">{formData.phone || 'Not set'}</span> • WhatsApp: <span className="font-semibold text-[#102A50]">{formData.whatsapp || 'Not set'}</span>
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
                      placeholder="+92 300 1234567"
                      className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">WhatsApp Number (For Invoice & Updates) *</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House No., Street, Area, LandMark"
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

                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="w-full py-2.5 rounded-xl bg-[#0866E8] text-white text-xs font-black shadow-sm"
                >
                  Save Address
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Payment Method Matching Screen 6 */}
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
                  <span className="text-xs font-black text-[#102A50] block">Cash on Delivery</span>
                  <span className="text-[11px] text-[#647A98] block">Pay when you receive</span>
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
                  <span className="text-[11px] text-[#647A98] block">Pay via mobile wallet</span>
                </div>
                <Smartphone className="w-5 h-5 text-[#0866E8]" />
              </label>

              {/* Option 3: Credit / Debit Card */}
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
                  <span className="text-xs font-black text-[#102A50] block">Credit / Debit Card</span>
                  <span className="text-[11px] text-[#647A98] block">Secure online payment</span>
                </div>
                <CreditCard className="w-5 h-5 text-[#0866E8]" />
              </label>
            </div>
          </div>

          {/* Section 3: Order Summary Card Matching Screen 6 */}
          <div className="bg-white border border-[#DCEBFA] rounded-3xl p-4 space-y-3 shadow-xs">
            <h3 className="text-xs font-black text-[#102A50] uppercase tracking-wider">
              Order Summary ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
            </h3>

            <div className="divide-y divide-[#DCEBFA] text-xs">
              {cart.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt={item.name} className="w-9 h-9 object-contain rounded-lg bg-[#EDF6FF] p-1 flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-bold text-[#102A50] block truncate">{item.name}</span>
                      <span className="text-[10px] text-[#647A98]">Qty: {item.quantity}</span>
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

          {/* Place Order CTA Matching Screen 6 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isSubmitting
                ? 'bg-[#0866E8]/70 cursor-wait'
                : 'bg-[#0866E8] hover:bg-[#0645B5] shadow-[#0866E8]/25 active:scale-98'
            }`}
          >
            {isSubmitting ? (
              <span>Placing Order Securely...</span>
            ) : (
              <>
                <span>Place Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <Footer />
    </main>
  );
}
