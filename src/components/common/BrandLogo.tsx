import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'admin' | 'compact' | 'checkout';
  className?: string;
  showLink?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
  showLink = true,
}) => {
  // Sizing and styling based on context
  let containerClasses = '';
  let imgClasses = '';
  let imgHeight = 48;
  let imgWidth = 140;

  switch (variant) {
    case 'header':
      containerClasses = 'flex items-center group py-0.5';
      imgClasses = 'h-12 sm:h-13 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-[1.03] drop-shadow-sm';
      imgHeight = 56;
      imgWidth = 180;
      break;

    case 'footer':
      // Styled in an ultra-clean, frosted capsule badge so the authentic logo shines on deep navy
      containerClasses = 'inline-flex items-center bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-lg shadow-blue-950/40 ring-1 ring-white/20 transition-all duration-300 hover:bg-white hover:shadow-brand-500/20 hover:scale-[1.02]';
      imgClasses = 'h-12 w-auto object-contain';
      imgHeight = 48;
      imgWidth = 150;
      break;

    case 'admin':
      containerClasses = 'flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10';
      imgClasses = 'h-10 w-auto object-contain';
      imgHeight = 40;
      imgWidth = 130;
      break;

    case 'compact':
      containerClasses = 'flex items-center';
      imgClasses = 'h-9 w-auto object-contain';
      imgHeight = 36;
      imgWidth = 110;
      break;

    case 'checkout':
      containerClasses = 'inline-flex items-center';
      imgClasses = 'h-11 w-auto object-contain';
      imgHeight = 44;
      imgWidth = 140;
      break;
  }

  const logoElement = (
    <div className={`${containerClasses} ${className}`} title="Blue Bells Mobile Shop">
      <div className="relative flex items-center justify-center">
        <Image
          src="/logo-transparent.png"
          alt="Blue Bells Mobile Shop Official Logo"
          width={imgWidth}
          height={imgHeight}
          priority={variant === 'header'}
          className={`${imgClasses} select-none`}
        />
      </div>
    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="inline-block transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
};
