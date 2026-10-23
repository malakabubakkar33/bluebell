'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Sparkles,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function AuthLoginPage() {
  const router = useRouter();
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success && result.user) {
      if (result.user.role === 'admin') {
        setSuccessMessage('Admin verified successfully! Launching Admin Panel...');
        setTimeout(() => {
          router.push('/admin');
        }, 700);
      } else {
        setSuccessMessage(`Welcome back, ${result.user.name}! Redirecting...`);
        setTimeout(() => {
          router.push('/account');
        }, 700);
      }
    } else {
      setErrorMessage(result.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    if (!forgotEmail.trim()) {
      setForgotStatus({ type: 'error', message: 'Please enter your registered email address.' });
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(forgotEmail);
    setIsResetting(false);

    if (res.success) {
      setForgotStatus({
        type: 'success',
        message: 'Password reset instructions have been sent to your email address.',
      });
    } else {
      setForgotStatus({
        type: 'error',
        message: res.error || 'Failed to send reset link. Please check the email address.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] via-white to-[#e0f2fe]/60 flex flex-col justify-between py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar / Brand Anchor */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <BrandLogo variant="header" />
        <Link
          href="/"
          className="text-xs sm:text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1.5"
        >
          <span>Return to Store</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Full-Screen Sign In Container */}
      <div className="max-w-md w-full mx-auto my-auto z-10 pt-4 pb-8">
        {/* Card Box with Frosted Glassmorphism */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-sky-900/10 rounded-3xl p-6 sm:p-9 relative overflow-hidden">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-100 text-[11px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Store Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Blue Bell
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter your credentials to manage orders, wishlist &amp; warranty.
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

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotStatus(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-50/80 border border-slate-200/90 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-sky-500 w-4 h-4"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Account...' : 'Sign In to Store'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Clean Callout: Switch to Dedicated Register Page */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Don't have an account yet?{' '}
              <Link
                href="/auth/register"
                className="font-black text-sky-600 hover:text-sky-700 hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Security & Warranty Assurance */}
        <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>256-Bit SSL Protection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            <span>Official PTA Warranty</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Attribution */}
      <div className="text-center text-xs text-slate-400 font-medium z-10">
        © 2026 Blue Bell Mobile Shop • Official Authorized Store
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">Reset Password</h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email address. We will send you instructions to securely reset your password.
            </p>

            {forgotStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  forgotStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {forgotStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                )}
                <span>{forgotStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 disabled:opacity-50"
                >
                  {isResetting ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
