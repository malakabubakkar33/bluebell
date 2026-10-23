'use client';

import React from 'react';
import { ShieldCheck, Award, Truck, RotateCcw, Headphones } from 'lucide-react';

interface BenefitCard {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const BENEFIT_CARDS: BenefitCard[] = [
  {
    id: 1,
    icon: ShieldCheck,
    title: 'Certified Genuine',
    description: '100% original products',
  },
  {
    id: 2,
    icon: Award,
    title: '1 Year Brand Warranty',
    description: 'Official brand warranty',
  },
  {
    id: 3,
    icon: Truck,
    title: 'Fast & Safe Delivery',
    description: 'Across Pakistan',
  },
  {
    id: 4,
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '14 days hassle free',
  },
  {
    id: 5,
    icon: Headphones,
    title: 'Always Available',
    description: '24/7 customer support',
  },
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section id="why-choose-us" className="py-10 sm:py-16 bg-white border-b border-[#DFEBF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0878F9] block mb-1.5">
            The Blue Bell Advantage
          </span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#102A56] tracking-tight">
            Why Shop at Blue Bells?
          </h2>
          <p className="text-xs sm:text-sm text-[#536780] font-medium mt-1">
            Peshawar&apos;s trusted premium mobile destination with nationwide delivery.
          </p>
        </div>

        {/* Horizontal Snap Scroll on Mobile, 5-col Grid on Desktop */}
        <div className="flex lg:grid lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
          {BENEFIT_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="w-[155px] sm:w-[200px] lg:w-auto flex-shrink-0 snap-start bg-white/90 backdrop-blur-md border border-[#DFEBF8] hover:border-[#0878F9] rounded-2xl p-3.5 sm:p-5 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-[#0878F9]/10 hover:-translate-y-1 group"
              >
                {/* Circular Blue Icon Badge */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F2F8FF] group-hover:bg-[#0878F9] text-[#0878F9] group-hover:text-white flex items-center justify-center transition-colors mb-2.5 sm:mb-3 border border-[#DFEBF8]">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110" />
                </div>

                {/* Card Title */}
                <h3 className="text-xs sm:text-sm font-bold text-[#102A56] group-hover:text-[#0878F9] transition-colors mb-1 line-clamp-1">
                  {item.title}
                </h3>

                {/* Short Explanation */}
                <p className="text-[10px] sm:text-xs text-[#8394AB] font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
