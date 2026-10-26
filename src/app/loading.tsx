import React from 'react';

export default function Loading() {
  // Sleek top progress bar instead of disruptive circular overlay
  return (
    <div className="w-full fixed top-0 left-0 right-0 z-[9999] h-1 bg-[#EDF6FF] overflow-hidden pointer-events-none">
      <div className="h-full bg-[#0866E8] animate-pulse w-full origin-left" />
    </div>
  );
}
