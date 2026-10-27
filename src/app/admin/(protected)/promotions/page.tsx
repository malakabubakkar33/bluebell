'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product, Category } from '@/types';
import { useAdminData } from '@/context/AdminDataContext';
import {
  Sparkles,
  Tag,
  Percent,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
  Save,
  X,
  Layers,
  ArrowRight,
  Upload,
  Check,
  FolderTree,
  Package,
  ShoppingBag,
  Eye,
  Sliders,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import Image from 'next/image';

export interface AdminBanner {
  id: string;
  slotNumber?: number;
  title: string;
  titlePrefix?: string;
  titleHighlight?: string;
  brand?: string;
  tag?: string;
  subtitle?: string;
  price?: string;
  originalPrice?: string;
  image: string;
  link: string;
  status: 'Active' | 'Inactive';
  validPeriod?: string;
}

export interface AdminDeal {
  id: string;
  badge: string;
  badgeColor?: string;
  title: string;
  discount: string;
  subtitle: string;
  brand?: string;
  image: string;
  link: string;
  bgGradient?: string;
  price?: number | string;
  originalPrice?: number | string;
  categorySlug?: string;
  products?: { id: string; name: string; price: number; originalPrice?: number; image?: string }[];
  status: 'Active' | 'Inactive';
}

const LIVE_DEFAULT_BANNERS: AdminBanner[] = [
  {
    id: 'banner-1',
    slotNumber: 1,
    title: 'iPhone 16 Pro Max',
    brand: 'Apple',
    tag: 'APPLE TITANIUM SERIES',
    subtitle: 'Engineered with Grade 5 Titanium, A18 Pro chip, and advanced 48MP Pro camera system.',
    price: 'Rs. 449,999',
    originalPrice: 'Rs. 479,999',
    image: '/banners/hero-slide-1.jpg',
    link: '/products?brand=Apple',
    status: 'Active',
    validPeriod: 'Ongoing',
  },
  {
    id: 'banner-2',
    slotNumber: 2,
    title: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    tag: 'SAMSUNG GALAXY SERIES',
    subtitle: 'Powerful performance, Galaxy AI photography, titanium durability, and precision S Pen.',
    price: 'Rs. 289,999',
    originalPrice: 'Rs. 319,999',
    image: '/banners/hero-slide-2.jpg',
    link: '/products?brand=Samsung',
    status: 'Active',
    validPeriod: 'Ongoing',
  },
  {
    id: 'banner-3',
    slotNumber: 3,
    title: 'Galaxy Z Fold5 Ultra',
    brand: 'Samsung',
    tag: 'NEXT-GEN FOLDABLE SERIES',
    subtitle: 'Unfold limitless possibilities with expansive 7.6-inch Dynamic AMOLED 2X screen and flagship camera.',
    price: 'Rs. 389,999',
    originalPrice: 'Rs. 419,999',
    image: '/banners/hero-slide-3.jpg',
    link: '/products?category=smartphones',
    status: 'Active',
    validPeriod: 'Ongoing',
  },
  {
    id: 'banner-4',
    slotNumber: 4,
    title: 'iPad Pro (M4) & Watch Ultra',
    brand: 'Apple',
    tag: 'APPLE PRO WORKSTATION',
    subtitle: 'Outrageous power with Apple M4 Silicon, Tandem OLED Ultra Retina display, and aerospace titanium.',
    price: 'Rs. 349,999',
    originalPrice: 'Rs. 379,999',
    image: '/banners/hero-slide-4.jpg',
    link: '/products?brand=Apple',
    status: 'Active',
    validPeriod: 'Ongoing',
  },
];

export default function AdminPromotionsPage() {
  const { products, categories, mutateProducts, refreshProducts } = useAdminData();

  // Active Tab: 'banners' or 'deals'
  const [activeTab, setActiveTab] = useState<'banners' | 'deals'>('banners');

  const [banners, setBanners] = useState<AdminBanner[]>(LIVE_DEFAULT_BANNERS);
  const [deals, setDeals] = useState<AdminDeal[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ----------------------------------------------------
  // Banner Modal State
  // ----------------------------------------------------
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBanner | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('banner-1');
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerBrandTag, setBannerBrandTag] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerPrice, setBannerPrice] = useState('');
  const [bannerLink, setBannerLink] = useState('/products');
  const [bannerImage, setBannerImage] = useState('/banners/hero-slide-1.jpg');
  const [bannerStatus, setBannerStatus] = useState<'Active' | 'Inactive'>('Active');
  const [uploadingBannerImg, setUploadingBannerImg] = useState(false);

  // ----------------------------------------------------
  // Deal Modal State
  // ----------------------------------------------------
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<AdminDeal | null>(null);
  const [dealTitle, setDealTitle] = useState('');
  const [dealBadge, setDealBadge] = useState('EXCLUSIVE DEAL');
  const [dealSubtitle, setDealSubtitle] = useState('');
  const [dealImage, setDealImage] = useState('/categories/samsung.svg');
  const [dealOriginalPrice, setDealOriginalPrice] = useState<number>(0);
  const [dealPrice, setDealPrice] = useState<number>(0);
  const [dealDiscountText, setDealDiscountText] = useState('');
  const [dealCategorySlug, setDealCategorySlug] = useState<string>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [applyPriceToStore, setApplyPriceToStore] = useState<boolean>(true);
  const [dealStatus, setDealStatus] = useState<'Active' | 'Inactive'>('Active');
  const [uploadingDealImg, setUploadingDealImg] = useState(false);
  const [savingDeal, setSavingDeal] = useState(false);

  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const dealFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Broadcast sync helper
  const broadcastSync = () => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const ch = new BroadcastChannel('bluebell_store_sync');
        ch.postMessage({ type: 'STORE_SYNC' });
        ch.close();
      }
    } catch {}
  };

  // Fetch Banners & Deals from Supabase API
  const fetchPromotionsData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [bansRes, dealsRes] = await Promise.all([
        fetch('/api/banners', { cache: 'no-store' }),
        fetch('/api/deals', { cache: 'no-store' }),
      ]);

      // Process Banners
      if (bansRes.ok) {
        const data = await bansRes.json();
        if (data.success && Array.isArray(data.data)) {
          const fetchedBanners: AdminBanner[] = data.data;

          // Merge fetched banners with the 4 live default slots
          const merged: AdminBanner[] = LIVE_DEFAULT_BANNERS.map((def, idx) => {
            const slotNum = idx + 1;
            const match = fetchedBanners.find(
              (b) => String(b.id) === `banner-${slotNum}` || String(b.id) === String(slotNum)
            );
            if (match) {
              return {
                id: `banner-${slotNum}`,
                slotNumber: slotNum,
                title: match.title || def.title,
                brand: match.brand || def.brand,
                tag: match.tag || def.tag,
                subtitle: match.subtitle || def.subtitle,
                price: match.price || def.price,
                image: match.image || def.image,
                link: match.link || def.link,
                status: match.status === 'Inactive' ? 'Inactive' : 'Active',
                validPeriod: match.validPeriod || 'Ongoing',
              };
            }
            return def;
          });

          // Append any extra custom banners created by admin
          const usedIds = new Set(['banner-1', 'banner-2', 'banner-3', 'banner-4', '1', '2', '3', '4']);
          fetchedBanners.forEach((b, idx) => {
            if (!usedIds.has(String(b.id))) {
              merged.push({
                id: String(b.id),
                slotNumber: 5 + idx,
                title: b.title,
                brand: b.brand,
                tag: b.tag || 'CUSTOM BANNER',
                subtitle: b.subtitle,
                price: b.price,
                image: b.image,
                link: b.link,
                status: b.status === 'Inactive' ? 'Inactive' : 'Active',
                validPeriod: b.validPeriod || 'Ongoing',
              });
            }
          });

          setBanners(merged);
        }
      }

      // Process Deals
      if (dealsRes.ok) {
        const data = await dealsRes.json();
        if (data.success && Array.isArray(data.data)) {
          setDeals(data.data);
        }
      }
    } catch (err: any) {
      console.error('[AdminPromotions] Fetch error:', err);
      showToast('error', 'Failed to load banners and deals from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotionsData();
  }, [fetchPromotionsData]);

  // ----------------------------------------------------
  // Banner Image Upload Handler
  // ----------------------------------------------------
  const handleUploadBannerImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBannerImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload banner image');
      }

      setBannerImage(data.url);
      showToast('success', 'Banner image uploaded successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Image upload failed');
    } finally {
      setUploadingBannerImg(false);
    }
  };

  // Open Banner Modal
  const handleOpenEditBanner = (b: AdminBanner) => {
    setEditingBanner(b);
    setSelectedSlot(b.id);
    setBannerTitle(b.title);
    setBannerBrandTag(b.tag || b.brand?.toUpperCase() || 'OFFICIAL FLAGSHIP');
    setBannerSubtitle(b.subtitle || '');
    setBannerPrice(b.price || '');
    setBannerLink(b.link || '/products');
    setBannerImage(b.image);
    setBannerStatus(b.status || 'Active');
    setIsBannerModalOpen(true);
  };

  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setSelectedSlot('banner-1');
    setBannerTitle('');
    setBannerBrandTag('OFFICIAL FLAGSHIP');
    setBannerSubtitle('');
    setBannerPrice('Rs. 249,999');
    setBannerLink('/products');
    setBannerImage('/banners/hero-slide-1.jpg');
    setBannerStatus('Active');
    setIsBannerModalOpen(true);
  };

  // Save Banner
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImage.trim()) {
      showToast('error', 'Banner title and image are required.');
      return;
    }

    const targetId = editingBanner ? editingBanner.id : selectedSlot;

    const payload = {
      id: targetId,
      title: bannerTitle.trim(),
      tag: bannerBrandTag.trim(),
      brand: bannerBrandTag.split(' ')[0] || 'Flagship',
      subtitle: bannerSubtitle.trim(),
      price: bannerPrice.trim(),
      image: bannerImage.trim(),
      link: bannerLink.trim() || '/products',
      status: bannerStatus,
      validPeriod: 'Ongoing',
    };

    // Optimistic UI update
    setBanners((prev) => {
      const idx = prev.findIndex((b) => b.id === targetId);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], ...payload };
        return next;
      }
      return [{ ...payload, slotNumber: prev.length + 1 }, ...prev];
    });

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save banner');
      }

      broadcastSync();
      showToast('success', `Banner for ${targetId} saved and synchronized with live storefront!`);
      setIsBannerModalOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update banner in database');
      await fetchPromotionsData(true);
    }
  };

  // ----------------------------------------------------
  // Deal Image Upload Handler
  // ----------------------------------------------------
  const handleUploadDealImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDealImg(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload deal image');
      }

      setDealImage(data.url);
      showToast('success', 'Deal image uploaded successfully!');
    } catch (err: any) {
      showToast('error', err.message || 'Deal image upload failed');
    } finally {
      setUploadingDealImg(false);
    }
  };

  // Open Deal Modal
  const handleOpenAddDeal = () => {
    setEditingDeal(null);
    setDealTitle('');
    setDealBadge('EXCLUSIVE DEAL');
    setDealSubtitle('Limited-time special price reduction with 1 Year Warranty');
    setDealImage('/categories/samsung.svg');
    setDealOriginalPrice(249999);
    setDealPrice(199999);
    setDealDiscountText('20% OFF');
    setDealCategorySlug(categories[0]?.slug || 'all');
    setSelectedProductIds([]);
    setApplyPriceToStore(true);
    setDealStatus('Active');
    setIsDealModalOpen(true);
  };

  const handleOpenEditDeal = (d: AdminDeal) => {
    setEditingDeal(d);
    setDealTitle(d.title);
    setDealBadge(d.badge || 'SPECIAL OFFER');
    setDealSubtitle(d.subtitle || '');
    setDealImage(d.image || '/categories/samsung.svg');
    const orig = Number(d.originalPrice) || Number(d.price) || 0;
    const nowP = Number(d.price) || 0;
    setDealOriginalPrice(orig);
    setDealPrice(nowP);
    setDealDiscountText(d.discount || 'Special Price');
    setDealCategorySlug(d.categorySlug || 'all');
    setSelectedProductIds(d.products ? d.products.map((p) => p.id) : []);
    setApplyPriceToStore(true);
    setDealStatus(d.status || 'Active');
    setIsDealModalOpen(true);
  };

  // Products filtered by currently selected deal category
  const categoryProducts = useMemo(() => {
    if (!dealCategorySlug || dealCategorySlug === 'all') {
      return products;
    }
    return products.filter((p) => {
      const pCat = (p.categorySlug || p.category || '').toLowerCase();
      const targetCat = dealCategorySlug.toLowerCase();
      return pCat === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat);
    });
  }, [products, dealCategorySlug]);

  // Toggle product selection in Deal Modal
  const handleToggleProductSelection = (product: Product) => {
    const isSelected = selectedProductIds.includes(product.id);
    let nextIds: string[];

    if (isSelected) {
      nextIds = selectedProductIds.filter((id) => id !== product.id);
    } else {
      nextIds = [...selectedProductIds, product.id];

      // Auto-populate prices and images if it's the first product selected
      if (selectedProductIds.length === 0) {
        const prodOrig = product.originalPrice || product.price || 0;
        const prodPrice = product.price || 0;
        setDealOriginalPrice(prodOrig);
        // Suggest a 15% discount price
        const suggestedDealPrice = Math.round(prodPrice * 0.85);
        setDealPrice(suggestedDealPrice);
        setDealDiscountText('15% OFF');
        if (product.image) setDealImage(product.image);
        if (!dealTitle) setDealTitle(`${product.name} Mega Deal`);
      }
    }
    setSelectedProductIds(nextIds);
  };

  // Auto-calculate discount label when prices change
  const handleOriginalPriceChange = (val: number) => {
    setDealOriginalPrice(val);
    if (val > 0 && dealPrice > 0 && val >= dealPrice) {
      const pct = Math.round(((val - dealPrice) / val) * 100);
      setDealDiscountText(`${pct}% OFF`);
    }
  };

  const handleDealPriceChange = (val: number) => {
    setDealPrice(val);
    if (dealOriginalPrice > 0 && val > 0 && dealOriginalPrice >= val) {
      const pct = Math.round(((dealOriginalPrice - val) / dealOriginalPrice) * 100);
      setDealDiscountText(`${pct}% OFF`);
    }
  };

  // Save Deal
  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle.trim()) {
      showToast('error', 'Deal title is required.');
      return;
    }
    if (dealPrice <= 0) {
      showToast('error', 'Please enter a valid deal price.');
      return;
    }

    setSavingDeal(true);
    const dealId = editingDeal ? String(editingDeal.id) : `deal-${Date.now()}`;

    // Selected products payload
    const selectedProdsData = products
      .filter((p) => selectedProductIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: dealPrice,
        originalPrice: dealOriginalPrice > 0 ? dealOriginalPrice : p.price,
        image: p.image,
      }));

    const dealPayload = {
      id: dealId,
      badge: dealBadge.trim() || 'SPECIAL OFFER',
      badgeColor: 'bg-[#0866E8] text-white',
      title: dealTitle.trim(),
      discount: dealDiscountText.trim() || 'Special Price',
      subtitle: dealSubtitle.trim(),
      brand: selectedProdsData[0]?.name?.split(' ')[0] || 'Official',
      image: dealImage.trim(),
      link: selectedProductIds.length === 1 ? `/products/${selectedProductIds[0]}` : '/products',
      bgGradient: 'from-[#F2F8FF] via-white to-[#EBF4FE]',
      price: dealPrice,
      originalPrice: dealOriginalPrice,
      categorySlug: dealCategorySlug,
      products: selectedProdsData,
      status: dealStatus,
    };

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dealPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save deal');
      }

      // If requested, apply Deal Price directly to the selected products in database and store!
      if (applyPriceToStore && selectedProductIds.length > 0) {
        const discountPct = dealOriginalPrice > dealPrice
          ? Math.round(((dealOriginalPrice - dealPrice) / dealOriginalPrice) * 100)
          : undefined;

        // Update each product
        await Promise.all(
          selectedProductIds.map(async (pId) => {
            await fetch(`/api/products/${encodeURIComponent(pId)}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                price: dealPrice,
                originalPrice: dealOriginalPrice > 0 ? dealOriginalPrice : undefined,
                discountPercent: discountPct,
              }),
            });
          })
        );

        // Optimistically update products context
        mutateProducts((prev) =>
          prev.map((p) =>
            selectedProductIds.includes(p.id)
              ? {
                  ...p,
                  price: dealPrice,
                  originalPrice: dealOriginalPrice > 0 ? dealOriginalPrice : p.originalPrice,
                  discountPercent: discountPct,
                }
              : p
          )
        );
      }

      broadcastSync();
      showToast(
        'success',
        `Deal "${dealTitle}" saved successfully! Live store and cart prices have been updated.`
      );
      setIsDealModalOpen(false);
      await fetchPromotionsData(true);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save deal to database');
    } finally {
      setSavingDeal(false);
    }
  };

  // Delete Deal
  const handleDeleteDeal = async (id: string | number) => {
    if (!confirm('Are you sure you want to remove this promotional deal?')) return;

    // Optimistic UI update
    setDeals((prev) => prev.filter((d) => String(d.id) !== String(id)));

    try {
      const res = await fetch(`/api/deals/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete deal');
      }

      broadcastSync();
      showToast('success', 'Deal removed from storefront promotions.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete deal');
      await fetchPromotionsData(true);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-rose-600 text-white border-rose-500'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Storefront Promotions &amp; Hero Sliders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Deals &amp; Banners Management
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Replace live hero slider banners (Slots 1-4) and set manual category product deals with real cart price sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchPromotionsData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0866E8] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {activeTab === 'banners' ? (
            <button
              type="button"
              onClick={handleOpenAddBanner}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add / Replace Banner</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAddDeal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 border-b border-[#DCEBFA]">
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`pb-3 px-2 text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'banners'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Homepage Hero Banners ({banners.length} Slots)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deals')}
          className={`pb-3 px-2 text-sm font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'deals'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Category &amp; Product Deals ({deals.length})</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: BANNERS MANAGEMENT (Slots 1, 2, 3, 4)
         ========================================================================= */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA] flex items-center justify-between text-xs text-[#102A50]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#0866E8] shrink-0" />
              <span>
                <strong>Live Synchronized Slots:</strong> These 4 banner slots correspond directly to the hero banner slider running on the live website. Replacing a slot instantly updates the live image!
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden flex flex-col justify-between group hover:border-[#0866E8] transition-all"
              >
                <div>
                  {/* Banner Image Preview */}
                  <div className="relative aspect-16/7 w-full bg-[#102A50] overflow-hidden">
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#0866E8] text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                        {b.slotNumber ? `Slot ${b.slotNumber}` : `Slot ${idx + 1}`}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-white'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#93C5FD] block mb-0.5">
                        {b.tag || b.brand}
                      </span>
                      <h3 className="text-lg font-black tracking-tight leading-snug">{b.title}</h3>
                      <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{b.subtitle}</p>
                    </div>
                  </div>

                  {/* Banner Metadata */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#647A98] font-bold">Display Price:</span>
                      <span className="font-mono font-black text-[#102A50]">{b.price || 'Rs. 249,999'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#647A98] font-bold">Target Link:</span>
                      <span className="font-mono text-[#0866E8] truncate max-w-[200px]">{b.link}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 border-t border-[#F2F8FF] mt-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#647A98] font-medium">
                    ID: <code className="font-mono text-[#102A50]">{b.id}</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenEditBanner(b)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EDF6FF] hover:bg-[#0866E8] text-[#0866E8] hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Replace / Edit Slot</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: DEALS MANAGEMENT (Manual Category & Products Setup)
         ========================================================================= */}
      {activeTab === 'deals' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA] flex items-center justify-between text-xs text-[#102A50]">
            <div className="flex items-center gap-3">
              <Tag className="w-5 h-5 text-[#0866E8] shrink-0" />
              <span>
                <strong>Manual Flagship Deals:</strong> Select any category, choose products for the deal, set the First Price (Original) vs Current Deal Price, and check the sync box to update real cart checkout pricing!
              </span>
            </div>
          </div>

          {deals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#DCEBFA] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center mx-auto">
                <Tag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-[#102A50]">No Promotional Deals Configured Yet</h3>
              <p className="text-xs text-[#647A98] max-w-md mx-auto">
                Create your first promotional discount offer. Select a category, choose products, set the original and deal prices, and make it live in the storefront.
              </p>
              <button
                type="button"
                onClick={handleOpenAddDeal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Deal</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deals.map((d) => (
                <div
                  key={d.id}
                  className="bg-white rounded-3xl border border-[#DCEBFA] p-6 shadow-xs flex flex-col justify-between hover:border-[#0866E8] transition-all group"
                >
                  <div className="space-y-4">
                    {/* Top Badge & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#0866E8] text-white text-[11px] font-black uppercase tracking-wider shadow-xs">
                        {d.badge || 'PROMOTIONAL DEAL'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'
                        }`}
                      >
                        {d.status || 'Active'}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="relative aspect-16/9 w-full bg-[#F2F8FF] rounded-2xl overflow-hidden flex items-center justify-center p-3 border border-[#DCEBFA]">
                      <img
                        src={d.image || '/categories/samsung.svg'}
                        alt={d.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Deal Title & Subtitle */}
                    <div>
                      <h3 className="text-base font-black text-[#102A50] tracking-tight">{d.title}</h3>
                      <p className="text-xs text-[#647A98] mt-0.5 line-clamp-2">{d.subtitle}</p>
                    </div>

                    {/* Prices Breakdown */}
                    <div className="p-3.5 rounded-xl bg-[#F7FBFF] border border-[#DCEBFA] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#647A98] font-bold">First Price (Was):</span>
                        <span className="font-mono text-gray-400 line-through">
                          Rs. {Number(d.originalPrice || d.price || 0).toLocaleString('en-PK')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#102A50] font-black">Deal Price (Now):</span>
                        <span className="font-mono font-black text-emerald-600 text-sm">
                          Rs. {Number(d.price || 0).toLocaleString('en-PK')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#DCEBFA]">
                        <span className="text-[#0866E8] font-bold">Discount Tag:</span>
                        <span className="font-black text-[#0866E8]">{d.discount || 'Special Price'}</span>
                      </div>
                    </div>

                    {/* Selected Products Count */}
                    {d.products && d.products.length > 0 && (
                      <div className="text-[11px] text-[#647A98] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#0866E8]" />
                        <span>
                          Applied to <strong>{d.products.length}</strong> catalog devices
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-[#F2F8FF] mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDeal(d)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EDF6FF] hover:bg-[#0866E8] text-[#0866E8] hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Deal</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteDeal(d.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Deal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          BANNER EDIT / REPLACE MODAL
         ========================================================================= */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061838]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#DCEBFA] max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCEBFA]">
              <div>
                <h3 className="text-xl font-black text-[#102A50]">
                  {editingBanner ? `Edit Banner (${editingBanner.id})` : 'Add / Replace Hero Banner'}
                </h3>
                <p className="text-xs text-[#647A98] mt-0.5">
                  Update live homepage hero slide images, titles, and highlight tags.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1 rounded-full text-[#647A98] hover:bg-[#EDF6FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Slot Target Selector */}
              <div>
                <label className="text-xs font-bold text-[#102A50] block mb-1.5">
                  Choose Live Hero Slot to Replace *
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DCEBFA] bg-white text-xs font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                >
                  <option value="banner-1">Slot 1 (Hero Main - iPhone 16 Pro Max)</option>
                  <option value="banner-2">Slot 2 (Hero Slide 2 - Galaxy S24 Ultra)</option>
                  <option value="banner-3">Slot 3 (Hero Slide 3 - Galaxy Z Fold5)</option>
                  <option value="banner-4">Slot 4 (Hero Slide 4 - iPad Pro M4)</option>
                  <option value={`banner-${Date.now()}`}>Additional Custom Slot</option>
                </select>
              </div>

              {/* Banner Image Upload & Preview */}
              <div>
                <label className="text-xs font-bold text-[#102A50] block mb-1.5">
                  Banner Image *
                </label>
                <div className="space-y-3">
                  <div className="relative aspect-16/7 w-full rounded-2xl bg-[#102A50] overflow-hidden border border-[#DCEBFA]">
                    <img
                      src={bannerImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={bannerFileInputRef}
                      onChange={handleUploadBannerImage}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => bannerFileInputRef.current?.click()}
                      disabled={uploadingBannerImg}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EDF6FF] hover:bg-[#0866E8] text-[#0866E8] hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{uploadingBannerImg ? 'Uploading...' : 'Upload New Photo'}</span>
                    </button>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={bannerImage}
                        onChange={(e) => setBannerImage(e.target.value)}
                        placeholder="Or enter image URL (/banners/hero-slide-1.jpg)"
                        className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs font-mono text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                      />
                    </div>
                  </div>

                  {/* Preset Banner Selector */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[#647A98]">
                    <span>Presets:</span>
                    {['1', '2', '3', '4'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBannerImage(`/banners/hero-slide-${num}.jpg`)}
                        className="px-2 py-0.5 rounded-md bg-[#EDF6FF] text-[#0866E8] font-bold hover:bg-[#0866E8] hover:text-white transition-colors"
                      >
                        Slide {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title & Brand Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    value={bannerTitle}
                    onChange={(e) => setBannerTitle(e.target.value)}
                    placeholder="e.g. iPhone 16 Pro Max"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">
                    Brand Tag / Sub-Badge
                  </label>
                  <input
                    type="text"
                    value={bannerBrandTag}
                    onChange={(e) => setBannerBrandTag(e.target.value)}
                    placeholder="e.g. APPLE TITANIUM SERIES"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-bold text-[#102A50] block mb-1">
                  Tagline / Description
                </label>
                <textarea
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  rows={2}
                  placeholder="Engineered with Grade 5 Titanium, A18 Pro chip, and advanced 48MP Pro camera system."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              {/* Display Price & Target Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">
                    Highlight Price
                  </label>
                  <input
                    type="text"
                    value={bannerPrice}
                    onChange={(e) => setBannerPrice(e.target.value)}
                    placeholder="e.g. Rs. 449,999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-mono font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">
                    Target Store Link
                  </label>
                  <input
                    type="text"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    placeholder="/products?brand=Apple"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-mono text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7FBFF] border border-[#DCEBFA]">
                <span className="text-xs font-bold text-[#102A50]">Banner Display Status</span>
                <button
                  type="button"
                  onClick={() => setBannerStatus((prev) => (prev === 'Active' ? 'Inactive' : 'Active'))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    bannerStatus === 'Active' ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'
                  }`}
                >
                  {bannerStatus === 'Active' ? 'Active & Live' : 'Inactive (Hidden)'}
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCEBFA]">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#647A98] hover:bg-[#EDF6FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
                >
                  Save &amp; Update Live Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DEAL ADD / EDIT MODAL
         ========================================================================= */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#061838]/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#DCEBFA] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCEBFA]">
              <div>
                <h3 className="text-xl font-black text-[#102A50]">
                  {editingDeal ? 'Edit Promotional Deal' : 'Add New Manual Deal'}
                </h3>
                <p className="text-xs text-[#647A98] mt-0.5">
                  Pick a category, select 1 or more products, set first price vs deal price, and sync live cart.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDealModalOpen(false)}
                className="p-1 rounded-full text-[#647A98] hover:bg-[#EDF6FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-bold text-[#102A50] block mb-1.5 flex items-center justify-between">
                  <span>1. Choose Category for Deal *</span>
                  <span className="text-[11px] text-[#647A98]">
                    {categoryProducts.length} devices available
                  </span>
                </label>
                <select
                  value={dealCategorySlug}
                  onChange={(e) => setDealCategorySlug(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#DCEBFA] bg-white text-xs font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                >
                  <option value="all">All Categories (Full Catalog)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Multi-Selection Area */}
              <div>
                <label className="text-xs font-bold text-[#102A50] block mb-1.5 flex items-center justify-between">
                  <span>2. Select Product(s) for this Deal *</span>
                  <span className="text-[11px] font-black text-[#0866E8]">
                    {selectedProductIds.length} Selected
                  </span>
                </label>

                <div className="border border-[#DCEBFA] rounded-2xl p-3 max-h-52 overflow-y-auto space-y-2 bg-[#FBFDFF]">
                  {categoryProducts.length === 0 ? (
                    <p className="text-xs text-[#647A98] p-3 text-center">
                      No products found in this category.
                    </p>
                  ) : (
                    categoryProducts.map((p) => {
                      const isSelected = selectedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleProductSelection(p)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#EDF6FF] border-[#0866E8] shadow-xs'
                              : 'bg-white border-[#DCEBFA] hover:bg-[#F2F8FF]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-md border flex items-center justify-center transition-colors">
                              {isSelected ? (
                                <div className="w-full h-full bg-[#0866E8] rounded-md flex items-center justify-center text-white">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-full h-full bg-white rounded-md border border-[#DCEBFA]" />
                              )}
                            </div>

                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-[#DCEBFA]"
                            />

                            <div>
                              <h4 className="text-xs font-bold text-[#102A50] line-clamp-1">{p.name}</h4>
                              <p className="text-[10px] text-[#647A98]">
                                {p.brand} &bull; Stock: {p.stock}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-xs font-black text-[#102A50]">
                              Rs. {p.price?.toLocaleString('en-PK')}
                            </span>
                            {p.originalPrice && (
                              <span className="block text-[10px] font-mono text-gray-400 line-through">
                                Rs. {p.originalPrice.toLocaleString('en-PK')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Pricing Breakdown: First Price vs Now Price */}
              <div className="p-4 rounded-2xl bg-[#F2F8FF] border border-[#DCEBFA] space-y-3">
                <span className="text-xs font-black uppercase text-[#0866E8] block tracking-wider">
                  3. Deal Pricing (First Price vs Current Deal Price)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#647A98] block mb-1">
                      First Price (Was) *
                    </label>
                    <input
                      type="number"
                      value={dealOriginalPrice}
                      onChange={(e) => handleOriginalPriceChange(Number(e.target.value))}
                      placeholder="249999"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] bg-white text-xs font-mono font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#102A50] block mb-1">
                      Deal Price (Now) *
                    </label>
                    <input
                      type="number"
                      value={dealPrice}
                      onChange={(e) => handleDealPriceChange(Number(e.target.value))}
                      placeholder="199999"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[#0866E8] bg-white text-xs font-mono font-black text-emerald-600 focus:outline-none focus:ring-1 focus:ring-[#0866E8]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#647A98] block mb-1">
                      Discount Badge / Label
                    </label>
                    <input
                      type="text"
                      value={dealDiscountText}
                      onChange={(e) => setDealDiscountText(e.target.value)}
                      placeholder="20% OFF"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] bg-white text-xs font-bold text-[#0866E8] focus:outline-none focus:border-[#0866E8]"
                    />
                  </div>
                </div>

                {/* Apply Directly to Store Checkbox */}
                <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyPriceToStore}
                    onChange={(e) => setApplyPriceToStore(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0866E8] focus:ring-[#0866E8] mt-0.5"
                  />
                  <span className="text-xs font-bold text-[#102A50]">
                    Apply this Deal Price directly to selected products in live store and cart
                    <span className="block text-[11px] text-[#647A98] font-normal mt-0.5">
                      When checked, the product catalog and customer cart will immediately reflect this exact discounted deal price!
                    </span>
                  </span>
                </label>
              </div>

              {/* Deal Info: Title, Badge, Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S24 Series Mega Deal"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#102A50] block mb-1">
                    Badge Text
                  </label>
                  <input
                    type="text"
                    value={dealBadge}
                    onChange={(e) => setDealBadge(e.target.value)}
                    placeholder="EXCLUSIVE DEAL"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#102A50] block mb-1">
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  value={dealSubtitle}
                  onChange={(e) => setDealSubtitle(e.target.value)}
                  placeholder="Premium Performance. Unmatched Value with 1 Year Warranty."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              {/* Deal Image Upload & URL */}
              <div>
                <label className="text-xs font-bold text-[#102A50] block mb-1">
                  Deal Featured Image
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border border-[#DCEBFA] bg-[#F2F8FF] p-1 shrink-0 flex items-center justify-center">
                    <img src={dealImage} alt="Deal" className="max-h-full max-w-full object-contain" />
                  </div>

                  <input
                    type="file"
                    ref={dealFileInputRef}
                    onChange={handleUploadDealImage}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => dealFileInputRef.current?.click()}
                    disabled={uploadingDealImg}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EDF6FF] hover:bg-[#0866E8] text-[#0866E8] hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingDealImg ? 'Uploading...' : 'Upload Image'}</span>
                  </button>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={dealImage}
                      onChange={(e) => setDealImage(e.target.value)}
                      placeholder="/categories/samsung.svg"
                      className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs font-mono text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                    />
                  </div>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7FBFF] border border-[#DCEBFA]">
                <span className="text-xs font-bold text-[#102A50]">Deal Status</span>
                <button
                  type="button"
                  onClick={() => setDealStatus((prev) => (prev === 'Active' ? 'Inactive' : 'Active'))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    dealStatus === 'Active' ? 'bg-emerald-600 text-white' : 'bg-gray-400 text-white'
                  }`}
                >
                  {dealStatus === 'Active' ? 'Active & Live' : 'Inactive (Hidden)'}
                </button>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCEBFA]">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#647A98] hover:bg-[#EDF6FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingDeal}
                  className="px-6 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer disabled:opacity-60"
                >
                  {savingDeal ? 'Saving & Syncing...' : 'Save & Publish Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
