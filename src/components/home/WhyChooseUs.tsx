'use client';

import React from 'react';
import { ShieldCheck, Truck, Headphones, RotateCcw, CheckCircle2, Award, Zap } from 'lucide-react';

interface Pillar {
  id: number;
  icon: any;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  gradient: string;
  image: string;
}

const PILLARS: Pillar[] = [
  {
    id: 1,
    icon: ShieldCheck,
    title: '100% Official PTA Approved',
    tagline: 'Zero Tax Liability',
    description: 'Every iPhone, Samsung, and iPad sold is officially PTA approved with authentic IMEI verification.',
    badge: 'Certified Genuine',
    gradient: 'from-sky-500/10 via-white to-sky-100/40',
    image: '/categories/iphone.svg',
  },
  {
    id: 2,
    icon: Award,
    title: '1 Year Brand Warranty',
    tagline: 'Full Replacement Support',
    description: 'Authorized local & global warranty coverage directly backed by Apple, Samsung, and certified service centers.',
    badge: '100% Peace of Mind',
    gradient: 'from-blue-500/10 via-white to-sky-100/40',
    image: '/categories/ipad.svg',
  },
  {
    id: 3,
    icon: Truck,
    title: 'Express Insured Delivery',
    tagline: '24-48h Across Pakistan',
    description: 'Tamper-proof transit insurance with real-time live SMS/WhatsApp tracking right to your doorstep.',
    badge: 'Fast & Safe',
    gradient: 'from-cyan-500/10 via-white to-sky-100/40',
    image: '/categories/accessories.svg',
  },
  {
    id: 4,
    icon: Headphones,
    title: '24/7 Mobile Specialist Care',
    tagline: 'Dedicated WhatsApp Team',
    description: 'Have a question before buying? Our verified technicians assist you before and after your purchase.',
    badge: 'Always Available',
    gradient: 'from-sky-500/10 via-white to-blue-50/50',
    image: '/categories/smartwatches.svg',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="why-choose-us" className="py-12 sm:py-16 bg-gradient-to-b from-white via-sky-50/30 to-white border-b border-sky-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <span className="text-[11px] font-black uppercase tracking-widest text-sky-600 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full inline-block mb-2">
            The Blue Bell Advantage
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Shop at Blue Bells?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
            Peshawar's most trusted premium smartphone destination with nationwide delivery.
          </p>
        </div>

        {/* Classic Gallery Slide Grid: Smooth Horizontal Scroll on Mobile, 4-Col Grid on Desktop */}
        <div className="flex lg:grid overflow-x-auto lg:overflow-visible gap-4 sm:gap-6 lg:grid-cols-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex-shrink-0 w-[270px] sm:w-[300px] lg:w-auto rounded-3xl bg-gradient-to-br ${item.gradient} border border-sky-100 p-5 sm:p-6 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 snap-start flex flex-col justify-between group`}
              >
                <div>
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-white text-sky-600 shadow-sm border border-sky-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-white/90 border border-sky-100 px-2 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  </div>

                  {/* Device Illustration Preview */}
                  <div className="w-full h-24 sm:h-28 flex items-center justify-center my-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-sm group-hover:scale-115 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & Tagline */}
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
                      {item.tagline}
                    </span>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Assurance check */}
                <div className="mt-5 pt-3 border-t border-sky-100/70 flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
                  <span>Guaranteed by Blue Bell</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
