'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import {
  X,
  ExternalLink,
  Edit,
  Package,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Tag,
  Boxes,
} from 'lucide-react';
import Link from 'next/link';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [activeImage, setActiveImage] = useState<string>('');

  if (!isOpen || !product) return null;

  const displayImage = activeImage || product.image || '/categories/iphone.svg';
  const allImages = Array.from(new Set([product.image, ...(product.gallery || [])])).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DCEBFA] flex items-center justify-between bg-gradient-to-r from-white to-[#F7FBFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A50]">Product Specifications</h2>
              <p className="text-xs text-[#647A98] font-mono">ID: {product.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#647A98] hover:text-[#102A50] hover:bg-[#EDF6FF] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info Hero */}
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Image Gallery */}
            <div className="w-48 shrink-0 flex flex-col items-center">
              <div className="w-48 h-48 rounded-2xl border border-[#DCEBFA] bg-[#F7FBFF] p-3 flex items-center justify-center overflow-hidden shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {allImages.length > 1 && (
                <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                  {allImages.map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`w-10 h-10 rounded-lg border overflow-hidden transition-all ${
                        displayImage === imgUrl
                          ? 'border-[#0866E8] ring-2 ring-[#0866E8]/30'
                          : 'border-[#DCEBFA] opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EDF6FF] text-[#0866E8] border border-[#DCEBFA]">
                  {product.brand}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                  {product.categorySlug || product.category}
                </span>
                {product.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {product.badge}
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-xl font-black text-[#102A50] tracking-tight">
                {product.name}
              </h1>

              {product.subtitle && (
                <p className="text-xs text-[#647A98] font-medium leading-relaxed">
                  {product.subtitle}
                </p>
              )}

              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-2xl font-black text-[#0866E8]">
                  Rs. {Number(product.price || 0).toLocaleString('en-PK')}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm font-semibold text-[#647A98] line-through">
                    Rs. {Number(product.originalPrice).toLocaleString('en-PK')}
                  </span>
                )}
              </div>

              {/* Status Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Published (Storefront Active)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      <XCircle className="w-3.5 h-3.5" /> Unpublished (Hidden)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                      product.stock <= 5
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : product.stock <= 15
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Stock: {product.stock} units</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="rounded-2xl border border-[#DCEBFA] overflow-hidden text-xs">
            <div className="bg-[#F7FBFF] px-4 py-2.5 font-bold text-[#102A50] border-b border-[#DCEBFA]">
              Authoritative Database Properties
            </div>
            <div className="divide-y divide-[#F0F5FA]">
              <div className="grid grid-cols-3 px-4 py-2.5">
                <span className="text-[#647A98] font-semibold">SKU</span>
                <span className="col-span-2 font-mono font-bold text-[#102A50]">
                  {product.sku || product.id}
                </span>
              </div>
              <div className="grid grid-cols-3 px-4 py-2.5">
                <span className="text-[#647A98] font-semibold">Warranty</span>
                <span className="col-span-2 text-[#102A50]">{product.warranty || 'None'}</span>
              </div>
              <div className="grid grid-cols-3 px-4 py-2.5">
                <span className="text-[#647A98] font-semibold">Store Rating</span>
                <span className="col-span-2 text-[#102A50]">
                  &#9733; {product.rating || 5.0} ({product.reviewCount || 0} reviews)
                </span>
              </div>
              {product.description && (
                <div className="grid grid-cols-3 px-4 py-2.5">
                  <span className="text-[#647A98] font-semibold">Description</span>
                  <span className="col-span-2 text-[#102A50] leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#DCEBFA] bg-[#F7FBFF] flex items-center justify-between gap-3">
          <Link
            href={`/products/${product.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#DCEBFA] bg-white text-xs font-bold text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View on Customer Website</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-white hover:text-[#102A50] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(product);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0866E8] text-white text-xs font-bold hover:bg-[#0645B5] transition-colors shadow-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
