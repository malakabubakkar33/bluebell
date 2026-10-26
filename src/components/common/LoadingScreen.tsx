'use client';

import React from 'react';

export const LoadingScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Render children immediately without blocking loading overlays
  return <>{children}</>;
};
