import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { Toast } from '@/components/common/Toast';
import { LoadingScreen } from '@/components/common/LoadingScreen';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Blue Bells Mobile Shop | Official iPhones, Samsung & Mobile Accessories',
  description: 'Shop genuine Apple iPhones, Samsung Galaxy flagships, iPads, smartwatches, chargers, and premium mobile accessories with official warranty and fast secure delivery in Pakistan.',
  keywords: [
    'Blue Bells Mobile Shop',
    'iPhone 15 Pro Max Pakistan',
    'Samsung Galaxy S24 Ultra',
    'Apple Watch Series 9',
    'AirPods Pro 2',
    'Mobile Accessories Pakistan',
    'PTA Approved Phones',
  ],
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'Blue Bells Mobile Shop - Your Dream Device, Our Priority',
    description: 'Experience genuine Apple, Samsung, and official mobile devices with warranty.',
    type: 'website',
    locale: 'en_PK',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 800,
        alt: 'Blue Bells Mobile Shop Official Logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased"
        suppressHydrationWarning
      >
        <ProductsProvider>
          <AuthProvider>
            <CartProvider>
              <LoadingScreen>
                {children}
              </LoadingScreen>
              <CartDrawer />
              <QuickViewModal />
              <Toast />
            </CartProvider>
          </AuthProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
