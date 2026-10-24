'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    // Only show on the very first start of the website in this session
    try {
      if (sessionStorage.getItem('bluebell_site_initialized') === 'true') {
        setIsLoading(false);
        return;
      }
    } catch {
      // sessionStorage might not be available in certain environments
    }

    setIsLoading(true);

    // Fast and smooth initial branding pulse
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          clearInterval(interval);
          return 94;
        }
        return prev + Math.floor(Math.random() * 25 + 18);
      });
    }, 90);

    const timer = setTimeout(() => {
      setProgress(100);
      try {
        sessionStorage.setItem('bluebell_site_initialized', 'true');
      } catch {}
      setTimeout(() => {
        setIsLoading(false);
      }, 250);
    }, 750);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="bluebell-loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-between select-none overflow-hidden bg-gradient-to-b from-[#FFFFFF] via-[#F4F9FF] to-[#EAF7FF]"
            style={{ width: '100vw', height: '100dvh' }}
          >
            {/* Top-Left Sweeping Curved Blue Wave Artwork matching reference */}
            <svg
              className="absolute top-0 left-0 w-52 h-52 sm:w-80 sm:h-80 md:w-96 md:h-96 pointer-events-none select-none z-0"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="tlGrad" x1="0" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0756C9" />
                  <stop offset="55%" stopColor="#078BEE" />
                  <stop offset="100%" stopColor="#21B8F3" />
                </linearGradient>
                <linearGradient id="tlLine" x1="0" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#21B8F3" stopOpacity="0.15" />
                </linearGradient>
              </defs>
              <path
                d="M-50 -50 L270 -50 C240 70, 170 170, 60 240 C-5 280, -50 290, -50 290 Z"
                fill="url(#tlGrad)"
              />
              <path
                d="M270 -50 C240 70, 170 170, 60 240 C-5 280, -50 290, -50 290"
                stroke="url(#tlLine)"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>

            {/* Bottom-Right Layered Flowing Curved Blue Waves Artwork matching reference */}
            <svg
              className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] pointer-events-none select-none z-0"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="brGrad1" x1="550" y1="550" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#063B8E" />
                  <stop offset="50%" stopColor="#0756C9" />
                  <stop offset="100%" stopColor="#078BEE" />
                </linearGradient>
                <linearGradient id="brGrad2" x1="550" y1="550" x2="200" y2="250" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0756C9" />
                  <stop offset="50%" stopColor="#078BEE" />
                  <stop offset="100%" stopColor="#21B8F3" />
                </linearGradient>
                <linearGradient id="brLine" x1="550" y1="550" x2="100" y2="150" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="80%" stopColor="#21B8F3" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Outer wave */}
              <path
                d="M550 550 L550 170 C410 210, 270 290, 170 390 C120 440, 100 490, 90 550 Z"
                fill="url(#brGrad1)"
              />
              {/* Inner glowing wave */}
              <path
                d="M550 550 L550 240 C430 270, 330 340, 250 420 C210 460, 190 500, 180 550 Z"
                fill="url(#brGrad2)"
              />
              {/* White contour highlights */}
              <path
                d="M550 170 C410 210, 270 290, 170 390 C120 440, 100 490, 90 550"
                stroke="url(#brLine)"
                strokeWidth="3"
                fill="none"
              />
              <path
                d="M550 240 C430 270, 330 340, 250 420 C210 460, 190 500, 180 550"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>

            {/* Central Soft Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] sm:w-[600px] sm:h-[600px] bg-radial from-[#21B8F3]/15 via-[#078BEE]/05 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

            {/* Spacer Top for vertical balance */}
            <div className="h-6 sm:h-12" />

            {/* Central Content Column */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-md w-full">
              {/* Logo Disc with Glowing Glass Halo matching reference */}
              <motion.div
                initial={{ scale: 0.88, opacity: 0, y: 12 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative mb-6"
              >
                {/* Soft Glowing Circular Disc */}
                <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-white/80 backdrop-blur-md shadow-[0_20px_50px_rgba(7,86,201,0.10)] border border-white/90 flex items-center justify-center p-3 sm:p-4">
                  {/* Subtle inner radial gradient */}
                  <div className="absolute inset-2 rounded-full bg-gradient-to-b from-white/95 via-sky-50/40 to-white/90 pointer-events-none" />

                  {/* Metallic Butterfly Symbol */}
                  <motion.img
                    src="/logo-symbol.png"
                    alt="Blue Bells Symbol"
                    className="relative z-10 w-28 sm:w-36 h-auto object-contain drop-shadow-[0_8px_16px_rgba(7,86,201,0.22)] select-none"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>

              {/* Brand Typography: BLUE BELLS */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-1.5"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0756C9] tracking-[0.16em] uppercase font-sans drop-shadow-xs">
                  BLUE BELLS
                </h1>

                {/* Subtitle: — MOBILE SHOP — */}
                <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm font-black text-[#078BEE] tracking-[0.25em] uppercase">
                  <span className="w-6 h-[1.5px] bg-[#078BEE]/60 inline-block" />
                  <span>MOBILE SHOP</span>
                  <span className="w-6 h-[1.5px] bg-[#078BEE]/60 inline-block" />
                </div>

                {/* Tagline */}
                <p className="text-xs sm:text-sm text-[#52749D] font-medium tracking-wide pt-1">
                  Your Dream Device, Our Priority
                </p>
              </motion.div>

              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="w-full max-w-xs sm:max-w-sm mt-7 space-y-2.5 flex flex-col items-center"
              >
                <div className="w-56 sm:w-64 h-2 bg-[#E2F0FC] rounded-full overflow-hidden p-0.5 border border-[#C7E5FF]/70 shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#21B8F3] via-[#078BEE] to-[#0756C9] rounded-full shadow-[0_0_10px_rgba(33,184,243,0.6)]"
                    initial={{ width: '18%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                  />
                </div>

                <span className="text-[11px] sm:text-xs text-[#52749D] font-medium tracking-widest block">
                  Loading...
                </span>
              </motion.div>
            </div>

            {/* Bottom Category Row matching reference */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="relative z-10 pb-6 sm:pb-8 px-4"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-6 text-[#52749D]">
                {/* Smartphones */}
                <div className="flex flex-col items-center gap-1.5 px-2 sm:px-4">
                  <svg className="w-5 h-5 text-[#0756C9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                  </svg>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-tight">Smartphones</span>
                </div>

                <div className="h-6 w-[1px] bg-[#C7E5FF]" />

                {/* Tablets */}
                <div className="flex flex-col items-center gap-1.5 px-2 sm:px-4">
                  <svg className="w-5 h-5 text-[#0756C9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="16" x="3" y="4" rx="2" />
                    <path d="M12 17h.01" />
                  </svg>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-tight">Tablets</span>
                </div>

                <div className="h-6 w-[1px] bg-[#C7E5FF]" />

                {/* Smart Watches */}
                <div className="flex flex-col items-center gap-1.5 px-2 sm:px-4">
                  <svg className="w-5 h-5 text-[#0756C9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="12" height="12" x="6" y="6" rx="3" />
                    <path d="M10 2h4" />
                    <path d="M10 22h4" />
                  </svg>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-tight">Smart Watches</span>
                </div>

                <div className="h-6 w-[1px] bg-[#C7E5FF]" />

                {/* Accessories */}
                <div className="flex flex-col items-center gap-1.5 px-2 sm:px-4">
                  <svg className="w-5 h-5 text-[#0756C9]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 16.5a3.5 3.5 0 0 0 5 0V6a2 2 0 0 0-4 0v10" />
                    <path d="M18 16.5a3.5 3.5 0 0 1-5 0V6a2 2 0 0 1 4 0v10" />
                  </svg>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-tight">Accessories</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};
