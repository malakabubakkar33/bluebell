import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { Toast } from '@/components/common/Toast';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { FloatingWhatsApp } from '@/components/common/FloatingWhatsApp';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bluebells.pk';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0756C9',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Blue Bell Mobile Shop | Official iPhones, Samsung & Mobile Accessories Pakistan',
    template: '%s | Blue Bell Mobile Shop',
  },
  description:
    'Shop 100% original Apple iPhones, Samsung Galaxy devices, iPads, Apple Watches, chargers, and premium mobile accessories in Pakistan. Official warranty, PTA approved phones & fast nationwide delivery in Peshawar, Lahore, Karachi & Islamabad.',
  keywords: [
    'Blue Bell Mobile Shop',
    'iPhone prices in Pakistan',
    'iPhone 16 Pro Max price Pakistan',
    'Samsung Galaxy S24 Ultra Pakistan',
    'iPad Pro M4 price Pakistan',
    'PTA Approved iPhones Peshawar',
    'Mobile Shop Saddar Peshawar',
    'Original Apple Accessories Pakistan',
    'Official Samsung Dealer Peshawar',
  ],
  alternates: {
    canonical: '/',
  },
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
    title: 'Blue Bell Mobile Shop - Your Dream Device, Our Priority',
    description:
      'Buy 100% genuine Apple iPhones, Samsung Galaxy phones, iPads, and accessories with official warranty in Pakistan.',
    url: siteUrl,
    siteName: 'Blue Bell Mobile Shop',
    type: 'website',
    locale: 'en_PK',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Blue Bell Mobile Shop Official Brand Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blue Bell Mobile Shop | Official iPhones & Samsung Pakistan',
    description: 'Official PTA approved devices with manufacturer warranty in Pakistan.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ElectronicsStore',
  name: 'Blue Bell Mobile Shop',
  image: `${siteUrl}/logo.png`,
  '@id': siteUrl,
  url: siteUrl,
  telephone: '+92-300-5902425',
  priceRange: 'PKR',
  currenciesAccepted: 'PKR',
  paymentAccepted: 'Cash, Bank Transfer, Credit Card',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Shop #33, Sattagadai Plaza, 32 The Mall Road, Peshawar Cantt',
    addressLocality: 'Peshawar',
    addressRegion: 'Khyber Pakhtunkhwa',
    postalCode: '25000',
    addressCountry: 'PK',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 34.008,
    longitude: 71.557,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '21:00',
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased w-full max-w-full overflow-x-hidden relative"
        suppressHydrationWarning
      >
        {/* Organization / LocalBusiness Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <ProductsProvider>
          <AuthProvider>
            <CartProvider>
              <LoadingScreen>
                <div className="flex-1 flex flex-col w-full pb-20 md:pb-0">
                  {children}
                </div>
              </LoadingScreen>
              <MobileBottomNav />
              <CartDrawer />
              <QuickViewModal />
              <Toast />
              <FloatingWhatsApp />
            </CartProvider>
          </AuthProvider>
        </ProductsProvider>
      </body>
    </html>
  );
}
