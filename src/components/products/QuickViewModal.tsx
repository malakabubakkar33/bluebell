'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Heart,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ProductVariant } from '@/types';

export const QuickViewModal: React.FC = () => {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    toggleWishlist,
    isInWishlist,
  } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [activeImage, setActiveImage] = useState<string>('');
  const [justAdded, setJustAdded] = useState(false);

  // Initialize or reset on product change
  React.useEffect(() => {
    if (quickViewProduct) {
      setQuantity(1);
      const defaultVar = quickViewProduct.variants?.[0];
      setSelectedVariant(defaultVar);
      setActiveImage(quickViewProduct.image);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const inWishlist = isInWishlist(quickViewProduct.id);
  const currentPrice = selectedVariant ? selectedVariant.price : quickViewProduct.price;
  const currentOriginalPrice = selectedVariant?.originalPrice || quickViewProduct.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : quickViewProduct.stock;

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, selectedVariant);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      closeQuickView();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={closeQuickView}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={closeQuickView}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Gallery Column */}
            <div className="space-y-4">
              <div className="aspect-square bg-transparent rounded-2xl p-6 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-500/10 via-blue-400/10 to-transparent blur-2xl pointer-events-none scale-110" />
                <img
                  src={activeImage || quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_16px_24px_rgba(2,132,199,0.2)]"
                />
              </div>

              {/* Thumbnails */}
              {quickViewProduct.gallery && quickViewProduct.gallery.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveImage(quickViewProduct.image)}
                    className={`w-14 h-14 rounded-xl p-1 bg-slate-50 border-2 transition-all ${
                      activeImage === quickViewProduct.image ? 'border-brand-500' : 'border-slate-200'
                    }`}
                  >
                    <img src={quickViewProduct.image} alt="Main" className="w-full h-full object-contain" />
                  </button>
                  {quickViewProduct.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-xl p-1 bg-slate-50 border-2 transition-all ${
                        activeImage === img ? 'border-brand-500' : 'border-slate-200'
                      }`}
                    >
                      <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Column */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block">
                  {quickViewProduct.brand}
                </span>
                <h3 className="text-2xl font-black text-slate-900 leading-snug">
                  {quickViewProduct.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{quickViewProduct.subtitle}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <span className="text-xs font-bold text-slate-800">{quickViewProduct.rating}</span>
                <span className="text-xs text-slate-400">({quickViewProduct.reviewCount} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-brand-600">
                  Rs. {currentPrice.toLocaleString()}
                </span>
                {currentOriginalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    Rs. {currentOriginalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Variants Selector */}
              {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">Select Variant / Storage:</label>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-brand-500 bg-brand-50 text-brand-600 shadow-sm'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {v.storage} {v.color && `(${v.color})`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Warranty & Delivery info */}
              <div className="py-2.5 border-y border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>{quickViewProduct.warranty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>In Stock ({currentStock} available)</span>
                </div>
              </div>

              {/* Quantity & CTA */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-brand-600"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-brand-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20 active:scale-95'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  aria-label="Wishlist"
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors ${
                    inWishlist
                      ? 'border-red-200 bg-red-50 text-red-500'
                      : 'border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
