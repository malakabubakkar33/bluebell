'use client';

import React from 'react';

interface BlueDotLoaderProps {
  /** If true, renders a non-intrusive slim top progress line */
  fullScreen?: boolean;
  /** Custom label */
  label?: string;
  /** Size multiplier: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
}

export const BlueDotLoader: React.FC<BlueDotLoaderProps> = ({
  fullScreen = false,
  label = 'Loading...',
}) => {
  if (fullScreen) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-[#EDF6FF] overflow-hidden pointer-events-none">
        <div className="h-full bg-[#0866E8] animate-pulse w-full origin-left" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Loading content"
      className="w-full py-8 flex flex-col items-center justify-center select-none"
    >
      <div className="w-40 h-1 bg-[#EDF6FF] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#0756C9] to-[#21B8F3] rounded-full animate-pulse w-full" />
      </div>
      {label && (
        <span className="text-[11px] font-bold tracking-wider uppercase text-[#0756C9] mt-2.5">
          {label}
        </span>
      )}
    </div>
  );
};
