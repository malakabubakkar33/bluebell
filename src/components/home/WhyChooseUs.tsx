'use client';

import React from 'react';
import { ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% Original Products',
      description: 'Genuine products with official warranty.',
    },
    {
      icon: Truck,
      title: 'Fast & Secure Delivery',
      description: 'Safe and reliable delivery at your doorstep.',
    },
    {
      icon: Headphones,
      title: '24/7 Customer Support',
      description: 'We are always here to help you.',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: 'Hassle-free return policy within 7 days.',
    },
  ];

  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Title */}
        <div className="text-left mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            Why Choose Blue Bells?
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Your trusted mobile shop for the best devices and accessories.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50/80 group-hover:bg-brand-500 text-brand-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                  <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
