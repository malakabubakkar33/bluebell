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
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function AuthLoginPage() {
  const router = useRouter();
  const { login, register, user, isAdmin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsApp, setRegWhatsApp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Auto-sync WhatsApp if sameAsPhone
  const handlePhoneChange = (val: string) => {
    setRegPhone(val);
    if (sameAsPhone) {
      setRegWhatsApp(val);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);

    if (result.success && result.user) {
      if (result.user.role === 'admin') {
        setSuccessMessage('Admin verified successfully! Redirecting to Admin Panel...');
        setTimeout(() => {
          router.push('/admin');
        }, 800);
      } else {
        setSuccessMessage(`Welcome back, ${result.user.name}! Redirecting...`);
        setTimeout(() => {
          router.push('/account');
        }, 800);
      }
    } else {
      setErrorMessage(result.error || 'Invalid credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!regPhone.trim()) {
      setErrorMessage('Please enter your mobile phone number.');
      return;
    }
    if (!regWhatsApp.trim()) {
      setErrorMessage('Please enter your WhatsApp number.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: regName,
      phone: regPhone,
      whatsapp: regWhatsApp,
      email: regEmail,
      password: regPassword,
    });
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Account created successfully! Welcome to Blue Bell Mobile Shop.');
      setTimeout(() => {
        router.push('/account');
      }, 1000);
    } else {
      setErrorMessage(result.error || 'Registration failed.');
    }
  };

  const fillAdminCredentials = () => {
    setMode('login');
    setLoginEmail('admin@bluebell.com');
    setLoginPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f6ff] via-[#ffffff] to-[#e8f1fd] flex flex-col justify-between py-10 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto my-auto">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-3">
            <BrandLogo variant="header" />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Your Dream Device, Our Priority — Official Portal
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          {/* Top Decorative Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-300/20 rounded-full blur-2xl pointer-events-none" />

          {/* Tab Switcher */}
          <div className="flex bg-slate-100/80 p-1.5 rounded-2xl mb-6 relative z-10 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-brand-600 shadow-md shadow-brand-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In (User / Admin)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-white text-brand-600 shadow-md shadow-brand-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode 1: LOGIN (Supports both regular customers and Admin credentials) */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com or admin@bluebell.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In To Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Admin Demo Credentials Pill */}
              <div className="pt-4 border-t border-slate-100">
                <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="text-left">
                    <span className="text-[11px] font-bold text-brand-800 block flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-brand-500" />
                      Shop Admin Credentials
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      admin@bluebell.com • admin123
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="px-3 py-1.5 bg-white hover:bg-brand-50 text-brand-600 border border-blue-200 rounded-lg text-xs font-bold shadow-sm transition-all whitespace-nowrap"
                  >
                    Auto Fill
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Mode 2: REGISTER (Full details: Name, Phone, WhatsApp, Email, Password) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 relative z-10 text-left">
              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 2. Mobile Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 3. WhatsApp Number */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-500 font-medium">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => {
                        setSameAsPhone(e.target.checked);
                        if (e.target.checked) setRegWhatsApp(regPhone);
                      }}
                      className="rounded text-brand-600 focus:ring-0"
                    />
                    <span>Same as Phone</span>
                  </label>
                </div>
                <div className="relative">
                  <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={regWhatsApp}
                    onChange={(e) => {
                      setRegWhatsApp(e.target.value);
                      if (sameAsPhone && e.target.value !== regPhone) {
                        setSameAsPhone(false);
                      }
                    }}
                    placeholder="e.g. +92 300 1234567"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 4. Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* 5. Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Footer Security Badges */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-6 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
              <span>Official Warranty Shop</span>
            </div>
          </div>
        </div>

        {/* Back to Store Link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
