'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function AuthLoginPage() {
  const router = useRouter();
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot password modal
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
      setSuccessMessage(`Welcome back, ${result.user.name}!`);
      setTimeout(() => router.push('/account'), 600);
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
    <div className="min-h-screen bg-[#F7FBFF] text-[#102A50] flex flex-col justify-center px-4 py-8">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Centered Logo Matching Screen 7 */}
        <div className="flex justify-center">
          <BrandLogo variant="header" />
        </div>

        {/* Welcome Back Card Matching Screen 7 */}
        <div className="bg-white border border-[#DCEBFA] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-[#102A50] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-[#647A98] font-medium">
              Login to your account to continue
            </p>
          </div>

          {/* Segmented Control / Tabs Matching Screen 7 */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA]">
            <button
              type="button"
              className="py-2.5 rounded-xl bg-[#0866E8] text-white text-xs font-black shadow-xs transition-all"
            >
              Login
            </button>
            <Link
              href="/auth/register"
              className="py-2.5 rounded-xl text-[#647A98] hover:text-[#102A50] text-xs font-bold text-center transition-all"
            >
              Sign Up
            </Link>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-[#E5485B] text-xs font-bold animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A675] text-xs font-bold animate-fadeIn">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone Input Matching Screen 7 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A50] block">Email or Phone</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#647A98]" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email or phone"
                  className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-2xl py-3 pl-10 pr-4 text-base sm:text-xs text-[#102A50] placeholder-[#647A98] focus:outline-none focus:border-[#0866E8] focus:ring-4 focus:ring-[#0866E8]/10"
                />
              </div>
            </div>

            {/* Password Input Matching Screen 7 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#102A50] block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#647A98]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-2xl py-3 pl-10 pr-10 text-base sm:text-xs text-[#102A50] placeholder-[#647A98] focus:outline-none focus:border-[#0866E8] focus:ring-4 focus:ring-[#0866E8]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#647A98] hover:text-[#102A50]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-bold text-[#0866E8] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Login Button Matching Screen 7 */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-[#0866E8]/25 transition-all cursor-pointer ${
                isLoading ? 'bg-[#0866E8]/70' : 'bg-[#0866E8] hover:bg-[#0645B5] active:scale-98'
              }`}
            >
              {isLoading ? <span>Verifying...</span> : <span>Login</span>}
            </button>
          </form>

          {/* Footer Prompt */}
          <p className="text-center text-xs text-[#647A98] pt-2">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-bold text-[#0866E8] hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs font-bold text-[#647A98] hover:text-[#0866E8]">
            ← Return to Store
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061838]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#102A50]">Reset Password</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full text-[#647A98] hover:bg-[#EDF6FF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#647A98]">
              Enter your registered email address and we&apos;ll send you instructions to reset your password.
            </p>
            {forgotStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  forgotStatus.type === 'success'
                    ? 'bg-emerald-50 text-[#16A675] border border-emerald-200'
                    : 'bg-rose-50 text-[#E5485B] border border-rose-200'
                }`}
              >
                {forgotStatus.message}
              </div>
            )}
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-[#EDF6FF] border border-[#DCEBFA] rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
              />
              <button
                type="submit"
                disabled={isResetting}
                className="w-full py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-black transition-colors"
              >
                {isResetting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
