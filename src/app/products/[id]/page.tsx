'use client';

import React, { useState, use, useEffect } from 'react';
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
  ChevronLeft,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Cpu,
  Camera,
  BatteryCharging,
  Award,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BrandLogo } from '@/components/common/BrandLogo';
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

  const { products, getProductById, isLoading } = useProducts();
  const { addToCart, toggleWishlist, isInWishlist, totalItems } = useCart();

  // Find product dynamically from real-time products store
  const matchedProduct =
    getProductById(productId) ||
    products.find(
      (p) =>
        p.id === productId ||
        p.slug === productId ||
        p.id.toLowerCase() === productId.toLowerCase()
    );

  if (!matchedProduct && !isLoading) {
    return (
      <main className="min-h-screen bg-[#F7FBFF] text-[#102A50] flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center border border-[#DCEBFA] shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center mx-auto mb-4 border border-[#DCEBFA]">
            <RotateCcw className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-[#102A50] mb-2">Product Not Found</h1>
          <p className="text-xs text-[#647A98] mb-6">
            The requested device could not be found or is no longer listed in the active store catalog.
          </p>
          <Link
            href="/products"
            className="w-full py-3 px-4 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white font-bold text-xs shadow-md transition-all inline-block"
          >
            Browse Store Catalog
          </Link>
        </div>
      </main>
    );
  }

  const product: Product = matchedProduct || products[0];
  if (!product) return null;

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

  // Gallery Images List
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

  const activeImageIndex = Math.max(0, allImages.indexOf(selectedImage));

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
    const message = encodeURIComponent(
      `Hello Blue Bell Mobile Shop! I want to order:\n\n*${product.name}*\nStorage: ${selectedStorage}\nColor: ${selectedColor?.name || 'Default'}\nPrice: Rs. ${product.price.toLocaleString()}\nQuantity: ${quantity}\n\nPlease confirm availability and payment details.`
    );
    const phoneNumber = '923001234567';
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

  const isOutOfStock = (product.stock || 1) <= 0;

  return (
    <main className="min-h-screen flex flex-col bg-[#F7FBFF] text-[#102A50] w-full max-w-full overflow-x-hidden">
      {/* Mobile Top Navigation Matching Screen 4 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-[#DCEBFA] shadow-xs md:hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center border border-[#DCEBFA] active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex justify-center">
            <BrandLogo variant="compact" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className={`w-9 h-9 rounded-full flex items-center justify-center border border-[#DCEBFA] transition-colors cursor-pointer ${
                inWish ? 'bg-rose-50 text-[#E5485B]' : 'bg-[#EDF6FF] text-[#0866E8]'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWish ? 'fill-[#E5485B]' : ''}`} />
            </button>

            <Link
              href="/cart"
              aria-label="Cart"
              className="relative w-9 h-9 rounded-full bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center border border-[#DCEBFA] active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E5485B] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        {/* Breadcrumb Navigation on Desktop */}
        <nav className="hidden sm:flex items-center gap-2 text-xs text-[#647A98] mb-5 font-semibold">
          <Link href="/" className="hover:text-[#0866E8] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#DCEBFA]" />
          <Link href="/products" className="hover:text-[#0866E8] transition-colors">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#DCEBFA]" />
          <span className="text-[#0866E8]">{product.brand}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#DCEBFA]" />
          <span className="text-[#102A50] font-bold truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Card Container Matching Screen 4 */}
        <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs p-4 sm:p-6 lg:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            
            {/* LEFT COLUMN: Gallery with Vertical Thumbnails on Left Matching Screen 4 */}
            <div className="lg:col-span-6 flex gap-3 sm:gap-4 items-start w-full min-w-0">
              {/* Vertical Thumbnails Column */}
              {allImages.length > 1 && (
                <div className="flex flex-col gap-2.5 w-14 sm:w-16 flex-shrink-0">
                  {allImages.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-square rounded-xl bg-[#F7FBFF] border-2 p-1 transition-all flex items-center justify-center cursor-pointer ${
                        selectedImage === img
                          ? 'border-[#0866E8] ring-2 ring-[#0866E8]/20 shadow-xs scale-102'
                          : 'border-[#DCEBFA] hover:border-slate-300 opacity-80'
                      }`}
                    >
                      <img src={img} alt={`Pose ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image Showcase with 1/5 Indicator Badge */}
              <div className="relative flex-1 aspect-square bg-[#F7FBFF] rounded-2xl border border-[#DCEBFA] p-4 sm:p-8 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="max-h-[260px] sm:max-h-[380px] w-auto max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />

                {/* 1/5 Pill Indicator Matching Screen 4 */}
                <div className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black tracking-wider shadow-sm">
                  {activeImageIndex + 1}/{allImages.length}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Details Matching Screen 4 */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-[#647A98] uppercase tracking-wider block">
                  {product.brand}
                </span>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#102A50] tracking-tight mt-1 leading-snug">
                  {product.name}
                </h1>

                {/* Rating & Review Count */}
                <div className="flex items-center gap-1.5 pt-1.5">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#102A50]">{product.rating}</span>
                  <span className="text-xs text-[#647A98]">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price & In Stock Row Matching Screen 4 */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#102A50] font-mono">
                  Rs. {product.price.toLocaleString()}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#16A675] text-xs font-black border border-emerald-200 shadow-xs">
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </span>
              </div>

              {/* Trust Indicators Matching Screen 4 */}
              <div className="flex flex-wrap items-center gap-4 py-2 text-xs font-bold text-[#647A98] border-y border-[#DCEBFA]/60">
                <div className="flex items-center gap-1.5 text-[#102A50]">
                  <ShieldCheck className="w-4 h-4 text-[#0866E8]" />
                  <span>100% Original</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#102A50]">
                  <Award className="w-4 h-4 text-[#0866E8]" />
                  <span>Official Warranty</span>
                </div>
              </div>

              {/* Select Color Swatches Matching Screen 4 */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#102A50] uppercase tracking-wider block">
                    Select Color
                  </label>
                  <div className="flex items-center gap-3">
                    {product.colorOptions.map((color) => {
                      const isSelected = selectedColor?.name === color.name;
                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          title={color.name}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'border-[#0866E8] ring-4 ring-[#0866E8]/20 scale-110'
                              : 'border-slate-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3] drop-shadow-sm" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Storage Variant Pills Matching Screen 4 */}
              {product.storageOptions && product.storageOptions.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#102A50] uppercase tracking-wider block">
                    Storage
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {product.storageOptions.map((storage) => {
                      const isSelected = selectedStorage === storage;
                      return (
                        <button
                          key={storage}
                          type="button"
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#EDF6FF] text-[#0866E8] border-2 border-[#0866E8] font-black shadow-xs'
                              : 'bg-white border border-[#DCEBFA] text-[#647A98] hover:border-slate-300'
                          }`}
                        >
                          {storage}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Selector Matching Screen 4 */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-black text-[#102A50] uppercase tracking-wider block">
                  Quantity
                </label>
                <div className="inline-flex items-center bg-[#EDF6FF] rounded-full p-1 border border-[#DCEBFA]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 rounded-full bg-white text-[#102A50] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors shadow-xs font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 font-black text-xs text-[#102A50] min-w-[24px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="w-8 h-8 rounded-full bg-white text-[#102A50] hover:bg-[#DCEBFA] flex items-center justify-center transition-colors shadow-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Purchase CTA Buttons Matching Screen 4 */}
              <div className="space-y-2.5 pt-3">
                {/* 1. Add to Cart Button (Primary Solid Blue) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdded}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-[#16A675] text-white'
                      : isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#0866E8] hover:bg-[#0645B5] text-white shadow-[#0866E8]/25 active:scale-98'
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

                {/* 2. Buy Now Button (Secondary Light Blue) */}
                {!isOutOfStock && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-[#EDF6FF] hover:bg-[#DCEBFA] text-[#0866E8] border border-[#DCEBFA] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    <Zap className="w-4 h-4 fill-current text-[#0866E8]" />
                    <span>Buy Now</span>
                  </button>
                )}

                {/* WhatsApp Order Button */}
                <button
                  type="button"
                  onClick={handleWhatsAppOrder}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Order directly on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Features & Specifications Tabs */}
        <div className="bg-white rounded-3xl border border-[#DCEBFA] p-4 sm:p-8 mb-8 shadow-xs">
          <div className="flex items-center gap-4 sm:gap-8 border-b border-[#DCEBFA] pb-px overflow-x-auto scrollbar-none">
            {[
              { id: 'features', label: 'Description' },
              { id: 'specs', label: 'Specifications' },
              { id: 'warranty', label: 'Warranty & Delivery' },
              { id: 'reviews', label: `Reviews (${product.reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs sm:text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-[#0866E8] border-b-2 border-[#0866E8]'
                    : 'text-[#647A98] hover:text-[#102A50]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'features' && (
              <div className="space-y-4 text-xs sm:text-sm text-[#647A98] leading-relaxed">
                <p>
                  {product.description ||
                    `${product.name} brings high-performance flagship power with official brand warranty, genuine box pack seal, and permanent PTA approval.`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="p-4 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA] flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#0866E8] flex-shrink-0" />
                    <div>
                      <h4 className="font-black text-xs text-[#102A50]">100% Genuine</h4>
                      <p className="text-[11px] text-[#647A98]">Official sealed box</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA] flex items-center gap-3">
                    <Award className="w-6 h-6 text-[#0866E8] flex-shrink-0" />
                    <div>
                      <h4 className="font-black text-xs text-[#102A50]">PTA Approved</h4>
                      <p className="text-[11px] text-[#647A98]">DIRBS verified</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA] flex items-center gap-3">
                    <Truck className="w-6 h-6 text-[#0866E8] flex-shrink-0" />
                    <div>
                      <h4 className="font-black text-xs text-[#102A50]">Express Delivery</h4>
                      <p className="text-[11px] text-[#647A98]">Across Pakistan</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-[#F7FBFF] rounded-2xl border border-[#DCEBFA] overflow-hidden divide-y divide-[#DCEBFA]">
                {Object.entries(specsList).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs">
                    <span className="font-black text-[#102A50] uppercase tracking-wider">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="sm:col-span-2 text-[#647A98] font-medium mt-0.5 sm:mt-0">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="space-y-4 text-xs sm:text-sm text-[#647A98]">
                <div className="p-5 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA]">
                  <h4 className="font-black text-sm text-[#102A50] mb-1">Official Brand Warranty</h4>
                  <p>
                    {product.warranty || '1 Year Official Manufacturer Warranty'} covered through authorized service centers in Lahore, Karachi, Islamabad, and Peshawar.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <h4 className="font-black text-sm text-[#16A675] mb-1">PTA Approved Guarantee</h4>
                  <p className="text-emerald-900">
                    All cellular devices are 100% tax-paid and permanent PTA approved. Both SIM slots and eSIM function reliably on all local networks.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-black text-[#102A50]">Ali Raza Malik</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Verified Buyer</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-[#647A98]">
                    Alhamdulillah received 100% original sealed pack. IMEI verified on PTA 8484 immediately. Fast delivery!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-black text-[#102A50] mb-3">Related Flagships</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
