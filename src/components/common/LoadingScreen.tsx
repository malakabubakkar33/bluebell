'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show splash for 1.8 seconds (fast, smooth)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
            style={{
              background: 'linear-gradient(145deg, #e0f2fe 0%, #bae6fd 45%, #f0f9ff 100%)',
            }}
          >
            {/* Ambient soft glow aura */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute w-[600px] h-[600px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
                  top: '-15%',
                  right: '-10%',
                }}
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
                  bottom: '-10%',
                  left: '-10%',
                }}
                animate={{
                  scale: [1.15, 1, 1.15],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Logo & Content Container */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center"
            >
              {/* Bigger Logo Without Any Background Box */}
              <motion.div
                className="relative mb-5"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img
                  src="/logo.png"
                  alt="Blue Bells Mobile Shop"
                  className="w-36 h-36 sm:w-44 sm:h-44 object-contain filter drop-shadow-[0_12px_24px_rgba(2,132,199,0.25)]"
                />
              </motion.div>

              {/* Shop Name */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider uppercase font-sans text-center"
              >
                BLUE BELLS
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-xs sm:text-sm font-extrabold text-sky-600 tracking-[0.25em] uppercase mt-1 text-center"
              >
                MOBILE SHOP
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="text-[11px] text-slate-500 font-medium tracking-wide mt-1 text-center"
              >
                Premium Official Devices &amp; Accessories
              </motion.p>

              {/* Sleek Loading Bar */}
              <div className="w-48 sm:w-56 h-1.5 bg-sky-200/80 rounded-full overflow-hidden mt-6 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};
