'use client';

import React from 'react';

interface BlueDotLoaderProps {
  /** If true, renders fixed across the full viewport with a translucent backdrop */
  fullScreen?: boolean;
  /** Custom label beneath the spinner */
  label?: string;
  /** Size multiplier: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
}

export const BlueDotLoader: React.FC<BlueDotLoaderProps> = ({
  fullScreen = true,
  label = 'Loading...',
  size = 'md',
}) => {
  // 8 circular dots with staggered animation delays
  const dots = [
    { rotate: 0, delay: '0s' },
    { rotate: 45, delay: '0.12s' },
    { rotate: 90, delay: '0.24s' },
    { rotate: 135, delay: '0.36s' },
    { rotate: 180, delay: '0.48s' },
    { rotate: 225, delay: '0.6s' },
    { rotate: 270, delay: '0.72s' },
    { rotate: 315, delay: '0.84s' },
  ];

  const sizeClasses = {
    sm: { container: 'w-10 h-10', dot: 'w-2 h-2', translate: 'translate-y-[-14px]', text: 'text-[11px]' },
    md: { container: 'w-16 h-16', dot: 'w-2.5 h-2.5', translate: 'translate-y-[-24px]', text: 'text-xs' },
    lg: { container: 'w-24 h-24', dot: 'w-3.5 h-3.5', translate: 'translate-y-[-36px]', text: 'text-sm' },
  }[size];

  const content = (
    <div
      role="status"
      aria-label="Loading content"
      className="flex flex-col items-center justify-center select-none"
    >
      {/* Animated Circular Dots Ring */}
      <div className={`relative ${sizeClasses.container} flex items-center justify-center`}>
        {/* Glowing Central Pulse Core */}
        <div className="absolute w-3 h-3 rounded-full bg-[#0756C9]/30 blur-[2px] animate-ping pointer-events-none" />
        <div className="absolute w-2 h-2 rounded-full bg-[#0756C9] pointer-events-none" />

        {/* 8 Circular Dots */}
        {dots.map((d, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${d.rotate}deg)` }}
          >
            <span
              className={`rounded-full bg-gradient-to-tr from-[#0756C9] to-[#21B8F3] shadow-[0_0_8px_rgba(7,86,201,0.6)] ${sizeClasses.dot} ${sizeClasses.translate} animate-blueDotPulse`}
              style={{
                animationDelay: d.delay,
              }}
            />
          </div>
        ))}
      </div>

      {/* Elegant Label with Subtle Pulse */}
      {label && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <span className={`font-bold tracking-wider uppercase text-[#0756C9] ${sizeClasses.text} animate-pulse`}>
            {label}
          </span>
          <span className="text-[10px] text-[#52749D] font-medium tracking-tight">
            Blue Bell Mobile Shop
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-white/85 backdrop-blur-md transition-opacity duration-200">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-16 flex items-center justify-center">
      {content}
    </div>
  );
};
