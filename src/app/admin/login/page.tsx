'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, ShieldCheck, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 800));

    const trimmedEmail = email.trim().toLowerCase();
    if (
      (trimmedEmail === 'admin@bluebell.com' || trimmedEmail === 'admin@bluebells.pk') &&
      (password === 'admin123' || password === 'BlueBells@2026')
    ) {
      // Store admin session
      localStorage.setItem('bluebell_admin_session', JSON.stringify({
        email: trimmedEmail,
        role: 'admin',
        loginAt: new Date().toISOString(),
      }));
      router.push('/admin');
    } else {
      setError('Invalid email or password. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col items-center justify-center p-12"
        style={{
          background: 'linear-gradient(160deg, #0A2A57 0%, #0969DA 60%, #3b82f6 100%)',
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 -top-20 -right-20" />
          <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 bottom-10 -left-10" />
          <div className="absolute w-[200px] h-[200px] rounded-full bg-blue-400/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-center"
        >
          {/* Logo */}
          <div className="w-32 h-32 mx-auto mb-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
            <img src="/logo.png" alt="Blue Bells" className="w-28 h-28 object-contain" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            BLUE BELLS
          </h1>
          <p className="text-lg font-semibold text-blue-200 tracking-[0.15em] uppercase mb-4">
            Mobile Shop
          </p>

          <div className="w-16 h-0.5 bg-blue-300/40 mx-auto mb-6" />

          <h2 className="text-xl font-bold text-white/90 mb-2">Admin Panel</h2>
          <p className="text-sm text-blue-200/70 max-w-xs mx-auto leading-relaxed">
            Manage Your Store, Grow Your Business
          </p>
          <p className="text-xs text-blue-300/50 mt-2">
            Sign in to your admin account to continue
          </p>

          {/* Feature badges */}
          <div className="mt-10 space-y-3">
            {[
              { icon: '📦', text: 'Product Management' },
              { icon: '📊', text: 'Sales Analytics' },
              { icon: '👥', text: 'Customer Management' },
              { icon: '🔒', text: 'Secure Admin Access' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 text-sm text-blue-100/80"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-[#f8faff]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo (shown on small screens) */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-brand-50 rounded-2xl border border-brand-100 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Blue Bells" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-xl font-black text-slate-900">BLUE BELLS</h1>
            <p className="text-xs font-semibold text-brand-600 tracking-[0.2em] uppercase">Mobile Shop Admin</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            {/* Welcome */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome Back</h2>
              <p className="text-sm text-slate-500">Sign in to your admin account</p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bluebells.pk"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/30"
                  />
                  <span className="text-xs text-slate-600 font-medium">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Supabase Auth Button (Placeholder) */}
            <button
              type="button"
              className="w-full py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint0_linear)"/>
                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#paint1_linear)" fillOpacity="0.2"/>
                <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
                <defs>
                  <linearGradient id="paint0_linear" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#249361"/>
                    <stop offset="1" stopColor="#3ECF8E"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
                    <stop/>
                    <stop offset="1" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>Continue with Supabase</span>
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Admin Access</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
