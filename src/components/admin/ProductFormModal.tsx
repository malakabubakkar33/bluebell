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
  HardDrive,
  ShieldCheck,
  Palette,
  Plus,
  Trash2,
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

const POPULAR_COLORS = [
  { name: 'Space Black', hex: '#1C1C1E' },
  { name: 'Deep Purple', hex: '#483D8B' },
  { name: 'Natural Titanium', hex: '#9E9E9E' },
  { name: 'Silver', hex: '#E0E0E0' },
  { name: 'Gold', hex: '#F5E6C8' },
  { name: 'Sierra Blue', hex: '#6993B8' },
  { name: 'Alpine Green', hex: '#3F5D4D' },
  { name: 'Midnight', hex: '#191970' },
  { name: 'Starlight', hex: '#F8F9FA' },
  { name: 'Phantom Black', hex: '#111111' },
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

  // Mobile Specific Attributes
  const [storageGb, setStorageGb] = useState<string>('256');
  const [ptaStatus, setPtaStatus] = useState<'PTA Approved' | 'Non-PTA' | 'Blocked' | 'JV'>('PTA Approved');
  const [colorOptions, setColorOptions] = useState<Array<{ name: string; hex: string; image?: string }>>([
    { name: 'Space Black', hex: '#1C1C1E' },
    { name: 'Deep Purple', hex: '#483D8B' },
  ]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#0866E8');

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

      const rawStorage = product.storageGb !== undefined
        ? String(product.storageGb)
        : (product.storageOptions?.[0] ? String(product.storageOptions[0]).replace(/[^0-9]/g, '') : '256');
      setStorageGb(rawStorage || '256');
      setPtaStatus((product.ptaStatus as any) || (product.specs?.ptaStatus as any) || 'PTA Approved');

      if (product.colorOptions && Array.isArray(product.colorOptions) && product.colorOptions.length > 0) {
        setColorOptions(product.colorOptions.map((c) => ({
          name: c.name,
          hex: c.hex || '#1C1C1E',
          image: c.image || '',
        })));
      } else {
        setColorOptions([
          { name: 'Space Black', hex: '#1C1C1E' },
          { name: 'Deep Purple', hex: '#483D8B' },
        ]);
      }
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
      setStorageGb('256');
      setPtaStatus('PTA Approved');
      setColorOptions([
        { name: 'Space Black', hex: '#1C1C1E' },
        { name: 'Deep Purple', hex: '#483D8B' },
      ]);
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
        gallery: (() => {
          const combined = [...gallery];
          if (image.trim() && !combined.includes(image.trim())) {
            combined.unshift(image.trim());
          }
          colorOptions.forEach((c) => {
            if (c.image && c.image.trim() && !combined.includes(c.image.trim())) {
              combined.push(c.image.trim());
            }
          });
          return combined.length > 0 ? combined : [image.trim()];
        })(),
        storageGb: storageGb.trim().replace(/[^0-9]/g, '') || '256',
        storageOptions: storageGb.trim() ? [`${storageGb.trim().replace(/[^0-9]/g, '')}GB`] : ['128GB', '256GB', '512GB'],
        ptaStatus,
        colorOptions,
        specs: {
          ...(product?.specs || {}),
          storageGb: storageGb.trim().replace(/[^0-9]/g, '') || '256',
          ptaStatus,
        },
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

          {/* Section 2b: Mobile Specifications (Storage GB & PTA Status) */}
          <div className="space-y-4 pt-4 border-t border-[#EDF2F7]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0866E8] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Storage (Memory GB) &amp; PTA Verification Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Storage / Memory GB */}
              <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA]">
                <label className="block text-xs font-bold text-[#102A50] mb-1">
                  Memory / Storage Capacity (GB) *
                </label>
                <p className="text-[10px] text-[#647A98] mb-2.5">
                  Enter storage number (e.g. 128, 256, 512, 1024). Will display under &quot;Memory / Storage&quot; on customer page.
                </p>
                <div className="relative mb-2.5">
                  <input
                    type="number"
                    min="1"
                    placeholder="256"
                    value={storageGb}
                    onChange={(e) => setStorageGb(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-black text-[#0866E8]">
                    GB
                  </span>
                </div>
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {['64', '128', '256', '512', '1024'].map((gb) => (
                    <button
                      key={gb}
                      type="button"
                      onClick={() => setStorageGb(gb)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        storageGb === gb
                          ? 'bg-[#0866E8] text-white shadow-xs'
                          : 'bg-white border border-[#DCEBFA] text-[#647A98] hover:text-[#102A50]'
                      }`}
                    >
                      {gb === '1024' ? '1 TB (1024GB)' : `${gb} GB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* PTA Status */}
              <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA]">
                <label className="block text-xs font-bold text-[#102A50] mb-1">
                  PTA Registration Status *
                </label>
                <p className="text-[10px] text-[#647A98] mb-2.5">
                  Official Pakistan Telecommunication Authority compliance tag.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PTA Approved', label: 'PTA Approved', sub: '100% Tax Paid', color: 'border-emerald-300 text-emerald-800 bg-emerald-50' },
                    { id: 'Non-PTA', label: 'Non-PTA', sub: 'Factory Unlocked', color: 'border-amber-300 text-amber-800 bg-amber-50' },
                    { id: 'Blocked', label: 'Blocked', sub: 'Non-PTA SIM Off', color: 'border-rose-300 text-rose-800 bg-rose-50' },
                    { id: 'JV', label: 'JV Sim Lock', sub: 'Joint Venture', color: 'border-blue-300 text-blue-800 bg-blue-50' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPtaStatus(item.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        ptaStatus === item.id
                          ? `${item.color} ring-2 ring-[#0866E8] font-bold shadow-xs`
                          : 'bg-white border-[#DCEBFA] text-[#647A98] hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold block leading-tight">{item.label}</span>
                      <span className="text-[9px] opacity-80 block">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2c: Available Colors & Multi-Color Images */}
          <div className="space-y-4 pt-4 border-t border-[#EDF2F7]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0866E8] flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Available Colors &amp; Color-Specific Photos</span>
                </h3>
                <p className="text-[10px] text-[#647A98] mt-0.5">
                  Attach specific photos to each color so customer can switch colors live on product page.
                </p>
              </div>
            </div>

            {/* Popular Color Preset Buttons */}
            <div>
              <span className="text-[11px] font-bold text-[#647A98] block mb-1.5">
                Quick Add Popular Colors:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_COLORS.map((c) => {
                  const alreadyAdded = colorOptions.some((existing) => existing.name.toLowerCase() === c.name.toLowerCase());
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        if (alreadyAdded) {
                          setColorOptions(colorOptions.filter((item) => item.name.toLowerCase() !== c.name.toLowerCase()));
                        } else {
                          setColorOptions([...colorOptions, { name: c.name, hex: c.hex, image: '' }]);
                        }
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        alreadyAdded
                          ? 'bg-[#EDF6FF] border-[#0866E8] text-[#0866E8] shadow-xs'
                          : 'bg-white border-[#DCEBFA] text-[#647A98] hover:border-slate-300'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                      {alreadyAdded && <Check className="w-3 h-3 text-[#0866E8]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Creator */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F7FBFF] border border-[#DCEBFA]">
              <input
                type="color"
                value={customColorHex}
                onChange={(e) => setCustomColorHex(e.target.value)}
                className="w-8 h-8 rounded-lg border border-[#DCEBFA] cursor-pointer p-0.5 bg-white"
                title="Pick custom hex color"
              />
              <input
                type="text"
                placeholder="Custom color name (e.g. Desert Titanium)"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:border-[#0866E8]"
              />
              <button
                type="button"
                onClick={() => {
                  if (customColorName.trim()) {
                    setColorOptions([...colorOptions, { name: customColorName.trim(), hex: customColorHex, image: '' }]);
                    setCustomColorName('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0866E8] text-white text-xs font-bold hover:bg-[#0645B5] transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color</span>
              </button>
            </div>

            {/* Configured Colors with Photo Inputs */}
            {colorOptions.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[#102A50] block">
                  Configured Product Colors ({colorOptions.length}):
                </span>
                <div className="space-y-2">
                  {colorOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl border border-[#DCEBFA] bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-[140px]">
                        <span
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-xs"
                          style={{ backgroundColor: opt.hex }}
                        />
                        <div>
                          <span className="text-xs font-bold text-[#102A50] block">{opt.name}</span>
                          <span className="text-[10px] font-mono text-[#647A98]">{opt.hex}</span>
                        </div>
                      </div>

                      {/* Photo URL for this Color */}
                      <div className="flex-1 flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="url"
                          placeholder="Paste image URL for this specific color..."
                          value={opt.image || ''}
                          onChange={(e) => {
                            const newColors = [...colorOptions];
                            newColors[idx].image = e.target.value;
                            setColorOptions(newColors);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#DCEBFA] bg-[#F7FBFF] focus:bg-white focus:outline-none focus:border-[#0866E8]"
                        />
                        {opt.image && (
                          <div className="w-8 h-8 rounded-lg border border-[#DCEBFA] bg-[#F7FBFF] overflow-hidden shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.image} alt={opt.name} className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {opt.image && (
                          <button
                            type="button"
                            onClick={() => setImage(opt.image!)}
                            title="Set as Main Product Image"
                            className="px-2 py-1 rounded-lg border border-[#DCEBFA] bg-[#EDF6FF] text-[10px] font-bold text-[#0866E8] hover:bg-[#0866E8] hover:text-white transition-all cursor-pointer"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setColorOptions(colorOptions.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove color"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              <span className="animate-pulse font-bold">Saving to Database...</span>
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
