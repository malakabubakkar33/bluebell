'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Phone,
  MessageCircle,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function AuthRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Peshawar');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsapp(val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your passwords.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name,
      phone,
      whatsapp: whatsapp || phone,
      email,
      city,
      address,
      password,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Account created successfully! Welcome to Blue Bell Mobile Shop.');
      setTimeout(() => {
        router.push('/account');
      }, 800);
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#e0f2fe]/60 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 -right-20 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <BrandLogo variant="header" />
        <Link
          href="/auth/login"
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1.5"
        >
          <span>Already registered? Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto my-auto z-10 pt-4 pb-8">
        <div className="bg-white/85 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-sky-900/10 rounded-3xl p-6 sm:p-9 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100 text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Customer Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join Blue Bell for fast checkout, official PTA warranty tracking &amp; exclusive deals.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Muhammad Usman"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Phone & WhatsApp Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+92 300 1234567"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    WhatsApp Number
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-500 font-semibold select-none">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setWhatsapp(phone);
                      }}
                      className="rounded text-sky-500 focus:ring-sky-500 w-3 h-3"
                    />
                    <span>Same</span>
                  </label>
                </div>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => {
                      setWhatsapp(e.target.value);
                      if (sameAsPhone && e.target.value !== phone) {
                        setSameAsPhone(false);
                      }
                    }}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* City & Delivery Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Peshawar, Lahore..."
                  className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Delivery Address (Optional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Street/Town Address"
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Creating Your Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link back to Sign In */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-black text-sky-600 hover:text-sky-700 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>256-Bit SSL Protection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Official Warranty Support</span>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400 font-medium z-10">
        © 2026 Blue Bell Mobile Shop • Official Authorized Store
      </div>
    </div>
  );
}
