'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { ProductImageUploader } from './ProductImageUploader';
import {
  X,
  Loader2,
  Check,
  Package,
  DollarSign,
  Tag,
  Shield,
  FileText,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => Promise<void>;
  product?: Product | null; // If provided, Edit mode; else Add mode
  categories: Category[];
}

const COMMON_BRANDS = [
  'Apple',
  'Samsung',
  'Google',
  'Xiaomi',
  'OnePlus',
  'Infinix',
  'Tecno',
  'Realme',
  'Vivo',
  'Anker',
  'Sony',
  'Huawei',
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  categories,
}) => {
  const isEdit = Boolean(product);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Apple');
  const [categorySlug, setCategorySlug] = useState('smartphones');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('10');
  const [inStock, setInStock] = useState<boolean>(true);
  const [badge, setBadge] = useState<string>('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [warranty, setWarranty] = useState('1 Year Official Brand Warranty (PTA Approved)');
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync form when product prop changes or modal opens
  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || 'Apple');
      setCategorySlug(product.categorySlug || product.category || 'smartphones');
      setSku(product.sku || product.id || '');
      setPrice(product.price ? product.price.toString() : '');
      setOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
      setStock(product.stock !== undefined ? product.stock.toString() : '10');
      setInStock(product.inStock !== undefined ? product.inStock : (product.stock || 0) > 0);
      setBadge(product.badge || '');
      setSubtitle(product.subtitle || '');
      setDescription(product.description || '');
      setWarranty(product.warranty || '1 Year Official Brand Warranty (PTA Approved)');
      setImage(product.image || '');
      setGallery(product.gallery || []);
      setIsFeatured(Boolean(product.isFeatured));
      setIsBestSeller(Boolean(product.isBestSeller));
    } else {
      // Reset defaults for Add mode
      setName('');
      setBrand('Apple');
      setCategorySlug(categories[0]?.slug || 'smartphones');
      setSku('');
      setPrice('');
      setOriginalPrice('');
      setStock('10');
      setInStock(true);
      setBadge('');
      setSubtitle('');
      setDescription('');
      setWarranty('1 Year Official Brand Warranty (PTA Approved)');
      setImage('/categories/iphone.svg');
      setGallery([]);
      setIsFeatured(true);
      setIsBestSeller(false);
    }
    setFormError(null);
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  // Auto-generate a clean SKU
  const handleGenerateSku = () => {
    const brandPrefix = (brand.substring(0, 3) || 'BB').toUpperCase();
    const namePart = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 5)
      .toUpperCase();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    setSku(`${brandPrefix}-${namePart || 'PROD'}-${randomHex}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    if (!name.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (!brand.trim()) {
      setFormError('Brand is required.');
      return;
    }
    if (!categorySlug) {
      setFormError('Category is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Please enter a valid selling price greater than 0 PKR.');
      return;
    }
    const numStock = parseInt(stock, 10);
    if (isNaN(numStock) || numStock < 0) {
      setFormError('Stock quantity cannot be negative.');
      return;
    }
    if (!image.trim()) {
      setFormError('Primary product image is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<Product> = {
        name: name.trim(),
        brand: brand.trim(),
        categorySlug,
        category: categorySlug,
        sku: sku.trim() || undefined,
        price: numPrice,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        stock: numStock,
        inStock,
        badge: badge.trim() || undefined,
        subtitle: subtitle.trim(),
        description: description.trim(),
        warranty: warranty.trim(),
        image: image.trim(),
        gallery: gallery.length > 0 ? gallery : [image.trim()],
        isFeatured,
        isBestSeller,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      console.error('ProductForm submit error:', err);
      setFormError(err.message || 'Failed to save product in database.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#DCEBFA] flex items-center justify-between bg-gradient-to-r from-white to-[#F7FBFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#102A50]">
                {isEdit ? `Edit Product: ${product?.name}` : 'Add New Product'}
              </h2>
              <p className="text-xs text-[#647A98]">
                {isEdit
                  ? 'Update authoritative specifications, stock, and pricing in PostgreSQL'
                  : 'Create a new catalog item with live database synchronization'}
              </p>
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

        {/* Error Banner */}
        {formError && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0866E8] flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              <span>General Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 16 Pro Max 256GB"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8] font-medium"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                  Brand *
                </label>
                <div className="flex gap-2">
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8] font-medium cursor-pointer"
                  >
                    {COMMON_BRANDS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    {!COMMON_BRANDS.includes(brand) && (
                      <option value={brand}>{brand}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                  Category *
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8] font-medium cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* SKU */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#102A50]">
                    SKU (Stock Keeping Unit)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[10px] font-bold text-[#0866E8] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>Auto-generate</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. APL-IP16PM-256"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-xs font-mono uppercase rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
                />
              </div>

              {/* Promotional Badge */}
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                  Promotional Badge
                </label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8] font-medium cursor-pointer"
                >
                  <option value="">None</option>
                  <option value="New">New Arrival</option>
                  <option value="Sale">Sale / Discount</option>
                  <option value="Hot">Hot Item</option>
                  <option value="Official PTA">Official PTA Approved</option>
                  <option value="Featured">Featured</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Pricing and Inventory */}
          <div className="space-y-4 pt-4 border-t border-[#EDF2F7]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0866E8] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pricing &amp; Inventory</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Selling Price */}
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                  Selling Price (PKR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#647A98]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="489999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-bold rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
                  />
                </div>
              </div>

              {/* Compare / Original Price */}
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                  Original Price (PKR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#647A98]">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="519999"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                  Inventory Stock Count *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
                />
              </div>
            </div>

            {/* Publication & Visibility Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA]">
              {/* Publication Status */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 text-[#0866E8] rounded border-[#DCEBFA] focus:ring-[#0866E8]"
                />
                <div>
                  <span className="text-xs font-bold text-[#102A50] block">
                    Published &amp; Active
                  </span>
                  <span className="text-[10px] text-[#647A98] block">
                    Eligible for customer purchase
                  </span>
                </div>
              </label>

              {/* Featured */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#0866E8] rounded border-[#DCEBFA] focus:ring-[#0866E8]"
                />
                <div>
                  <span className="text-xs font-bold text-[#102A50] block">
                    Featured Product
                  </span>
                  <span className="text-[10px] text-[#647A98] block">
                    Highlight on homepage
                  </span>
                </div>
              </label>

              {/* Best Seller */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 text-[#0866E8] rounded border-[#DCEBFA] focus:ring-[#0866E8]"
                />
                <div>
                  <span className="text-xs font-bold text-[#102A50] block">
                    Best Seller Flag
                  </span>
                  <span className="text-[10px] text-[#647A98] block">
                    Show in top sellers grid
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Section 3: Media Upload */}
          <div className="space-y-4 pt-4 border-t border-[#EDF2F7]">
            <ProductImageUploader
              image={image}
              gallery={gallery}
              onImageChange={(newUrl) => setImage(newUrl)}
              onGalleryChange={(newGallery) => setGallery(newGallery)}
            />
          </div>

          {/* Section 4: Details & Descriptions */}
          <div className="space-y-4 pt-4 border-t border-[#EDF2F7]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0866E8] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Details &amp; Specifications</span>
            </h3>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                Short Subtitle / Highlight
              </label>
              <input
                type="text"
                placeholder="e.g. Titanium Finish • A18 Pro Chip • 48MP Camera"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
              />
            </div>

            {/* Warranty */}
            <div>
              <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                Warranty &amp; Guarantee Terms
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-[#102A50] mb-1.5">
                Detailed Product Description
              </label>
              <textarea
                rows={4}
                placeholder="Enter full specifications, box contents, and product features..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#DCEBFA] bg-[#F7FBFF] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-white hover:text-[#102A50] transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
