'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Read URL query errors (e.g. redirected from middleware with ?error=forbidden)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'forbidden') {
      setErrorMessage(
        'Access Denied: Your account does not have administrator privileges. Only authorized store managers can access this portal.'
      );
    } else if (errorParam === 'session_expired') {
      setErrorMessage('Your session has expired. Please log in again to continue.');
    } else if (errorParam === 'unauthorized') {
      setErrorMessage('Please authenticate with administrator credentials to access the Admin Panel.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.error || 'Authentication failed. Please verify your administrator credentials.'
        );
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Administrator verified. Opening Admin Portal...');
      // Instant full navigation to ensure session cookies are immediately available to server layout
      window.location.href = '/admin';
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMessage('Unable to connect to the authentication server. Please check your network.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-[0_20px_50px_rgba(8,102,232,0.08)] p-6 sm:p-10 relative overflow-hidden">
        {/* Top subtle blue highlight line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0866E8] via-[#18A8F8] to-[#0645B5]" />

        {/* Brand & Security Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <BrandLogo variant="header" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Staff Portal • Verified Access</span>
          </div>
          <h1 className="text-2xl font-black text-[#102A50] tracking-tight">Admin Sign In</h1>
          <p className="text-xs text-[#647A98] mt-1">
            Enter authorized store management credentials to access inventory, orders, and system settings.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#E5485B]" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#16A675]" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-[#102A50] uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-[#647A98] pointer-events-none" />
              <input
                type="email"
                autoComplete="email"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bluebell.pk"
                required
                className="w-full bg-[#F7FBFF] border border-[#DCEBFA] rounded-2xl py-3 pl-10 pr-4 text-sm text-[#102A50] placeholder-[#647A98]/60 focus:outline-none focus:border-[#0866E8] focus:bg-white focus:ring-4 focus:ring-[#0866E8]/10 transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#102A50] uppercase tracking-wider">
                Admin Password
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#647A98] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-[#F7FBFF] border border-[#DCEBFA] rounded-2xl py-3 pl-10 pr-11 text-sm text-[#102A50] placeholder-[#647A98]/60 focus:outline-none focus:border-[#0866E8] focus:bg-white focus:ring-4 focus:ring-[#0866E8]/10 transition-all disabled:opacity-60 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 p-1 rounded-lg text-[#647A98] hover:text-[#0866E8] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0866E8] to-[#0645B5] hover:from-[#0645B5] hover:to-[#04358C] text-white font-bold text-sm shadow-lg shadow-[#0866E8]/25 hover:shadow-xl hover:shadow-[#0866E8]/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Storefront Footer */}
        <div className="mt-8 pt-6 border-t border-[#DCEBFA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#647A98]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-[#0866E8] hover:text-[#0645B5] transition-colors"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>

          <span className="text-[11px] text-[#647A98]/80">
            Protected by Supabase Auth &amp; RLS
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-8 bg-gradient-to-b from-[#F7FBFF] via-white to-[#EDF6FF] relative selection:bg-[#0866E8] selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#0866E8]/5 to-transparent pointer-events-none blur-3xl" />

      <Suspense fallback={<div className="text-xs text-[#647A98]">Loading login form...</div>}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
