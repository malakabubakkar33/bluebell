'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuth } from '@/context/AuthContext';

export default function AuthRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Peshawar');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      setErrorMessage('Passwords do not match.');
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
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/account');
      }, 700);
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-light/30 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      {/* Container matching Screen 7 */}
      <div className="w-full max-w-[430px] bg-white rounded-3xl shadow-sm border border-brand-border/60 p-6 sm:p-8">
        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <BrandLogo variant="header" />
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">Create Account</h1>
          <p className="text-sm text-brand-muted mt-1">Join Blue Bells for fast checkout and official warranty tracking</p>
        </div>

        {/* Segmented Control matching Screen 7 */}
        <div className="flex bg-[#F0F5FA] p-1 rounded-2xl mb-6">
          <Link
            href="/auth/login"
            className="flex-1 py-2 text-center text-sm font-semibold rounded-xl text-brand-muted hover:text-brand-dark transition-all"
          >
            Login
          </Link>
          <div className="flex-1 py-2 text-center text-sm font-semibold rounded-xl bg-brand-primary text-white shadow-sm transition-all">
            Sign Up
          </div>
        </div>

        {/* Error / Success Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border/80 rounded-xl text-base text-brand-dark placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border/80 rounded-xl text-base text-brand-dark placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
              Mobile Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0300 1234567"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border/80 rounded-xl text-base text-brand-dark placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Peshawar"
                className="w-full px-3 py-2.5 bg-brand-surface border border-brand-border/80 rounded-xl text-base text-brand-dark placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-dark mb-1.5">
                Delivery Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-brand-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street / Area"
                  className="w-full pl-8 pr-2 py-2.5 bg-brand-surface border border-brand-border/80 rounded-xl text-base text-brand-dark placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                className="w-full pl-10 pr-10 py-2.5 bg-brand-surface border border-brand-border/80 rounded-xl text-base text-brand-dark placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-dark cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-brand-dark mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border/80 rounded-xl text-base text-brand-dark placeholder:text-brand-muted/70 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-brand-primary hover:bg-brand-deep active:bg-brand-deep text-white font-bold text-sm rounded-xl shadow-md shadow-brand-primary/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-border/60" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-brand-muted font-medium">or</span>
          </div>
        </div>

        {/* Social Auth Buttons matching Screen 7 */}
        <div className="space-y-2.5">
          <button
            type="button"
            className="w-full py-2.5 px-4 bg-white border border-brand-border hover:bg-brand-surface rounded-xl text-xs sm:text-sm font-semibold text-brand-dark flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
          <button
            type="button"
            className="w-full py-2.5 px-4 bg-white border border-brand-border hover:bg-brand-surface rounded-xl text-xs sm:text-sm font-semibold text-brand-dark flex items-center justify-center gap-3 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Bottom Link */}
        <p className="text-center text-xs text-brand-muted mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-brand-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
