'use client';

import React, { useState, use, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  ChevronRight,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Cpu,
  Smartphone,
  Camera,
  BatteryCharging,
  Wifi,
  ShieldAlert,
  Award,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { products, getProductById } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  // Find product dynamically from real-time products store
  const matchedProduct = getProductById(productId) ||
    products.find(
      (p) =>
        p.id === productId ||
        p.slug === productId ||
        p.id.toLowerCase() === productId.toLowerCase()
    );

  const product: Product = matchedProduct || products[0] || {
    id: productId,
    name: 'Blue Bell Smartphone',
    slug: productId,
    brand: 'Blue Bell',
    category: 'Smartphones',
    categorySlug: 'smartphones',
    subtitle: 'Official PTA Approved Flagship Device',
    description: 'High-end smartphone with official warranty and guarantee.',
    price: 199999,
    originalPrice: 229999,
    rating: 4.9,
    reviewCount: 42,
    stock: 12,
    warranty: '1 Year Official Manufacturer Warranty',
    guarantee: '7 Days Replacement Guarantee',
    image: '/categories/iphone.svg',
    gallery: ['/categories/iphone.svg'],
  };

  const [selectedImage, setSelectedImage] = useState<string>(product.image);
  const [selectedStorage, setSelectedStorage] = useState<string>(
    product.storageOptions?.[0] || '256GB'
  );
  const [selectedColor, setSelectedColor] = useState<any>(
    product.colorOptions?.[0] || { name: 'Titanium Black', hex: '#222222' }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'features' | 'specs' | 'warranty' | 'reviews'>('features');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync selected image if product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      if (product.storageOptions && product.storageOptions.length > 0) {
        setSelectedStorage(product.storageOptions[0]);
      }
      if (product.colorOptions && product.colorOptions.length > 0) {
        setSelectedColor(product.colorOptions[0]);
      }
    }
  }, [product.id]);

  const inWish = isInWishlist(product.id);

  // Poses / Gallery Images
  const allImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.gallery && Array.isArray(product.gallery)) {
      product.gallery.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ['/categories/iphone.svg'];
  }, [product]);

  const handleAddToCart = () => {
    const variant = {
      id: `var-${selectedStorage}-${selectedColor?.name || 'standard'}`,
      sku: `${product.sku || 'BB'}-${selectedStorage}`,
      storage: selectedStorage,
      color: selectedColor?.name,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
    };
    addToCart(product, quantity, variant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    const variant = {
      id: `var-${selectedStorage}-${selectedColor?.name || 'standard'}`,
      sku: `${product.sku || 'BB'}-${selectedStorage}`,
      storage: selectedStorage,
      color: selectedColor?.name,
      price: product.price,
      originalPrice: product.originalPrice,
      stock: product.stock,
    };
    addToCart(product, quantity, variant);
    router.push('/checkout');
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = '923001234567';
    const message = encodeURIComponent(
      `Hello Blue Bell Mobile Shop!\nI would like to order:\n\n*Product:* ${product.name}\n*Storage:* ${selectedStorage}\n*Color:* ${selectedColor?.name || 'Default'}\n*Price:* Rs. ${product.price.toLocaleString()}\n*Quantity:* ${quantity}\n\nPlease confirm availability and delivery details.`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  // Specifications list
  const specsList = product.specs || {
    Chipset: product.name.includes('iPhone') ? 'Apple A18 Pro / A17 Pro (3nm)' : 'Snapdragon 8 Gen 3 for Galaxy',
    Display: '6.8" Dynamic AMOLED 2X / Super Retina XDR (120Hz ProMotion)',
    Camera: '200MP Quad Pro Camera / 48MP Fusion Triple Camera with 5x Periscope',
    Battery: '5000mAh with 45W Fast Charging / All-Day Battery Life',
    PTA_Status: '100% Tax-Paid Official PTA Approved (Verified on DIRBS)',
    Warranty: product.warranty || '1 Year Official Brand Warranty',
    Guarantee: product.guarantee || '7 Days Replacement Guarantee',
    Condition: '100% Brand New Original Sealed Pack Box',
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image.startsWith('http') ? product.image : `https://bluebells.pk${product.image}`,
    description: product.description || product.subtitle || `${product.name} official PTA approved with warranty at Blue Bell Mobile Shop`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Apple',
    },
    offers: {
      '@type': 'Offer',
      url: `https://bluebells.pk/products/${encodeURIComponent(product.id)}`,
      priceCurrency: 'PKR',
      price: product.price,
      priceValidUntil: '2026-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: (product.stock || 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Blue Bell Mobile Shop',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.8,
      reviewCount: product.reviewCount || 36,
      bestRating: '5',
      worstRating: '1',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bluebells.pk',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category || 'Smartphones',
        item: `https://bluebells.pk/products?category=${encodeURIComponent(product.categorySlug || 'smartphones')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://bluebells.pk/products/${encodeURIComponent(product.id)}`,
      },
    ],
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#fafcff] w-full max-w-full overflow-x-hidden">
      {/* Product & Breadcrumb Schema.org JSON-LD for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Product Details" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 flex-1 w-full">
        {/* Top Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/products" className="hover:text-brand-600 transition-colors">
            Shop Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-brand-600 font-semibold">{product.category || product.brand}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Dedicated Product View Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm sm:shadow-xl sm:shadow-blue-500/5 p-4 sm:p-6 lg:p-10 mb-8 sm:mb-12 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Multi-Pose Interactive Gallery (6 cols) */}
            <div className="lg:col-span-6 flex flex-col space-y-3 sm:space-y-4 w-full min-w-0">
              {/* Main Image Showcase */}
              <div className="relative aspect-square bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl sm:rounded-3xl border border-slate-100 p-4 sm:p-8 flex items-center justify-center overflow-hidden group shadow-inner">
                {/* Badges */}
                <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-10 flex flex-col gap-1.5 sm:gap-2">
                  {product.badge && (
                    <span className="bg-brand-600 text-white text-[10px] sm:text-[11px] font-black tracking-wider uppercase px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-md shadow-brand-500/20">
                      {product.badge}
                    </span>
                  )}
                  <span className="bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-sm">
                    PTA APPROVED
                  </span>
                </div>

                {/* Wishlist & Share buttons */}
                <div className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 z-10 flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleShare}
                    type="button"
                    title="Share product link"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-500 hover:text-brand-600 flex items-center justify-center shadow-md transition-all hover:scale-105"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    type="button"
                    aria-label="Wishlist"
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 ${
                      inWish ? 'bg-rose-50 text-rose-500' : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWish ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Large Product Display */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="max-h-[260px] xs:max-h-[320px] sm:max-h-[420px] w-auto max-w-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-[0_16px_24px_rgba(2,132,199,0.18)]"
                  />
                </div>
              </div>

              {/* Multi-Pose Thumbnails (Front, Back, Side Angles) */}
              {allImages.length > 1 && (
                <div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5 block">
                    Product Poses & Angles ({allImages.length} Views):
                  </span>
                  <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white border-2 p-1.5 sm:p-2 flex-shrink-0 transition-all flex items-center justify-center ${
                          selectedImage === img
                            ? 'border-brand-600 ring-2 sm:ring-4 ring-brand-500/20 shadow-md scale-105'
                            : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Pose ${i + 1}`}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute bottom-1 right-1 text-[8px] sm:text-[9px] font-black bg-slate-900/80 text-white px-1 rounded">
                          {i === 0 ? 'Front' : i === 1 ? 'Back' : `P${i + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Verified Highlights */}
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 pt-1">
                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">100% Original Sealed</p>
                    <p className="text-[10px] text-emerald-600">Factory packed unit</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-50/60 border border-blue-100 text-blue-800">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">PTA Tax Paid</p>
                    <p className="text-[10px] text-blue-600">Sims work permanently</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Title, Features, Specs, Warranty & Actions (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div>
                {/* Brand & Stock Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-100 px-3 py-1 rounded-lg">
                    {product.brand} Official
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    SKU: {product.sku || `BB-${product.id.slice(0, 8).toUpperCase()}`}
                  </span>
                </div>

                {/* Product Main Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mt-2.5 leading-snug">
                  {product.name}
                </h1>

                {/* Subtitle */}
                <p className="text-sm text-slate-600 mt-2 font-medium leading-relaxed">
                  {product.subtitle || 'Official authentic smartphone with manufacturer warranty and guaranteed PTA approval.'}
                </p>

                {/* Rating & In-Stock Status */}
                <div className="flex flex-wrap items-center gap-4 mt-3.5 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/60">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-extrabold text-amber-800 text-sm">{product.rating}</span>
                    <span className="text-slate-400 text-xs">({product.reviewCount} Reviews)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{product.stock > 0 ? `In Stock (${product.stock} Units Available)` : 'Out of Stock'}</span>
                  </div>
                </div>

                {/* Price Display in PKR (Pakistani Rupees) */}
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-white border border-blue-100/80">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Special Official Offer
                  </span>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <>
                        <span className="text-lg text-slate-400 line-through font-semibold">
                          Rs. {product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                          Save {product.discountPercent || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Inclusive of all taxes & PTA duties. Cash on delivery available.
                  </p>
                </div>

                {/* Storage Capacity Selector */}
                {product.storageOptions && product.storageOptions.length > 0 && (
                  <div className="mt-6">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2.5">
                      Select Storage Capacity:
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {product.storageOptions.map((storage) => (
                        <button
                          key={storage}
                          type="button"
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            selectedStorage === storage
                              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 ring-2 ring-brand-600'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Swatch Selector */}
                {product.colorOptions && product.colorOptions.length > 0 && (
                  <div className="mt-6">
                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2.5">
                      Color Variant: <span className="font-bold text-brand-600">{selectedColor.name}</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {product.colorOptions.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          title={color.name}
                          className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor.name === color.name
                              ? 'border-brand-600 scale-110 shadow-lg ring-4 ring-brand-500/20'
                              : 'border-slate-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {selectedColor.name === color.name && (
                            <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 font-black text-sm transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 font-bold text-sm text-slate-900 bg-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-200 font-black text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Official Warranty & Guarantee Badges */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <ShieldCheck className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        {product.warranty || '1 Year Official Warranty'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Brand direct claim with official receipt
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                    <RotateCcw className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        {product.guarantee || '7 Days Replacement Guarantee'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Full money-back or replacement on defect
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action CTA Buttons */}
                <div className="mt-8 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.stock <= 0 ? (
                      <button
                        type="button"
                        disabled
                        className="py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 bg-slate-200 text-slate-500 cursor-not-allowed select-none"
                      >
                        <span>Out of Stock</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={isAdded}
                        className={`py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/25 active:scale-98'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    )}

                    {product.stock <= 0 ? (
                      <button
                        type="button"
                        disabled
                        className="py-3.5 px-6 rounded-2xl font-black text-sm bg-slate-100 text-slate-400 cursor-not-allowed select-none flex items-center justify-center gap-2"
                      >
                        <span>Temporarily Unavailable</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBuyNow}
                        className="py-3.5 px-6 rounded-2xl font-black text-sm bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 transition-all active:scale-98"
                      >
                        <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>Buy Now (Instant Checkout)</span>
                      </button>
                    )}
                  </div>

                  {/* 1-Click WhatsApp Direct Order */}
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-[#25D366] text-white hover:bg-[#20ba5a] flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/20 transition-all active:scale-98"
                  >
                    <PhoneCall className="w-4 h-4 fill-white" />
                    <span>Order on WhatsApp (Instant Confirmation)</span>
                  </button>
                </div>

                {/* Trust Footer Badges */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-5 h-5 text-brand-600" />
                    <span className="text-[11px] font-bold text-slate-800">100% Genuine</span>
                    <span className="text-[10px] text-slate-400">Direct importer</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-x border-slate-100">
                    <Truck className="w-5 h-5 text-brand-600" />
                    <span className="text-[11px] font-bold text-slate-800">Express Delivery</span>
                    <span className="text-[10px] text-slate-400">All Pakistan</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RotateCcw className="w-5 h-5 text-brand-600" />
                    <span className="text-[11px] font-bold text-slate-800">7 Days Guarantee</span>
                    <span className="text-[10px] text-slate-400">Hassle-free return</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Features & Specifications Tabs */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xl shadow-blue-500/5 p-4 sm:p-8 lg:p-10 mb-12">
          <div className="flex items-center gap-4 sm:gap-8 border-b border-slate-200 pb-px overflow-x-auto scrollbar-none -mx-2 px-2 sm:mx-0 sm:px-0">
            <button
              onClick={() => setActiveTab('features')}
              className={`pb-4 text-sm font-extrabold uppercase tracking-wider transition-all whitespace-nowrap relative ${
                activeTab === 'features'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Key Features & Highlights
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-sm font-extrabold uppercase tracking-wider transition-all whitespace-nowrap relative ${
                activeTab === 'specs'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTab('warranty')}
              className={`pb-4 text-sm font-extrabold uppercase tracking-wider transition-all whitespace-nowrap relative ${
                activeTab === 'warranty'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Warranty & PTA Policy
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm font-extrabold uppercase tracking-wider transition-all whitespace-nowrap relative ${
                activeTab === 'reviews'
                  ? 'text-brand-600 border-b-2 border-brand-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Customer Reviews ({product.reviewCount})
            </button>
          </div>

          <div className="py-8">
            {/* Features View */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <p className="text-slate-700 leading-relaxed font-normal text-sm sm:text-base">
                  {product.description ||
                    `${product.name} delivers breakthrough mobile performance with premium build quality, cutting-edge cameras, and next-generation battery efficiency. Guaranteed 100% genuine sealed box with tax-paid PTA approval.`}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
                    <Cpu className="w-8 h-8 text-brand-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Next-Gen Processing</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        High efficiency chipset delivering hyper-fast multitasking and console-level gaming.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-4">
                    <Camera className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Pro-Grade Optics</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Ultra-clear sensor system with night photography, 4K/8K video recording and optical stabilization.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-4">
                    <BatteryCharging className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">All-Day Power</h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Intelligent battery optimization supporting fast wired and wireless charging.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Specifications View */}
            {activeTab === 'specs' && (
              <div className="max-w-4xl bg-slate-50/80 rounded-2xl border border-slate-200/80 overflow-hidden">
                <div className="divide-y divide-slate-200/70">
                  {Object.entries(specsList).map(([key, val]) => (
                    <div key={key} className="grid grid-cols-1 sm:grid-cols-3 p-4 hover:bg-white transition-colors">
                      <span className="font-black text-xs text-slate-700 uppercase tracking-wider">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="sm:col-span-2 text-xs sm:text-sm font-semibold text-slate-800 mt-1 sm:mt-0">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty & PTA View */}
            {activeTab === 'warranty' && (
              <div className="max-w-3xl space-y-5">
                <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start gap-4">
                  <ShieldCheck className="w-8 h-8 text-brand-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-base text-slate-900">1-Year Official Warranty Included</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Every phone purchased through Blue Bell Mobile Shop comes with an authentic manufacturer warranty receipt. In case of hardware failures, free repairs or replacements are handled through authorized brand service centers in Lahore, Karachi, and Islamabad.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-base text-slate-900">Guaranteed 100% PTA Approved (DIRBS Verified)</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      We strictly sell authentic tax-paid handsets. You can verify the IMEI on the official PTA 8484 portal. Both physical SIM and eSIM remain permanently active without blockades.
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-4">
                  <RotateCcw className="w-8 h-8 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-base text-slate-900">7-Day Replacement Guarantee</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      If you receive a defective unit or damaged packaging, Blue Bell Mobile Shop offers an instant exchange or full refund within 7 days of package delivery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews View */}
            {activeTab === 'reviews' && (
              <div className="max-w-3xl space-y-4">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">Ali Raza Malik</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Verified Buyer (Lahore)
                      </span>
                    </div>
                    <span className="text-slate-400">2 days ago</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Alhamdulillah received 100% original sealed pack. IMEI verified on PTA 8484 immediately. Fast 24-hour delivery in Lahore!
                  </p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-sm">Usman Tariq</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Verified Buyer (Islamabad)
                      </span>
                    </div>
                    <span className="text-slate-400">1 week ago</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    Customer service on WhatsApp was super cooperative. Provided live video of the sealed box before shipping. Blue Bell is the most trusted shop!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Showcase */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Similar Flagship Devices</h3>
                <p className="text-xs text-slate-500 mt-1">Explore other authentic flagships available at Blue Bell</p>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5 lg:gap-4 w-full">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
