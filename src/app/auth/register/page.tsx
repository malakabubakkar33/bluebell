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
