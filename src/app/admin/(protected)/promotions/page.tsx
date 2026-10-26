'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '@/types';
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
  Flame,
  Star,
  RefreshCw,
  Image as ImageIcon,
  Save,
  X,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkUrl: string;
  active: boolean;
  buttonText: string;
}

const DEFAULT_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'iPhone 16 Pro Max',
    subtitle: 'Titanium Design & A18 Pro Chip. PTA Approved with 1 Year Warranty.',
    badge: 'Exclusive Flagship',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80',
    linkUrl: '/products',
    buttonText: 'Shop Flagship',
    active: true,
  },
  {
    id: 'banner-2',
    title: 'Samsung Galaxy S24 Ultra',
    subtitle: 'Next-Gen Galaxy AI & 200MP Quad Camera System.',
    badge: 'Mega Sale',
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&q=80',
    linkUrl: '/products',
    buttonText: 'Order Galaxy',
    active: true,
  },
  {
    id: 'banner-3',
    title: 'Original Mobile Accessories',
    subtitle: 'Genuine Fast Chargers, MagSafe Cases & Premium Screen Protectors.',
    badge: '20% Off',
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1200&q=80',
    linkUrl: '/categories',
    buttonText: 'Explore Accessories',
    active: true,
  },
];

export default function AdminPromotionsPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'banners' | 'deals'>('banners');

  // Modal State for Banner
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({});

  // Discount / Badge updates on product
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load banners from storage and products from Supabase
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Load Banners from LocalStorage / Default
      const savedBanners = localStorage.getItem('bluebell_admin_banners');
      if (savedBanners) {
        try {
          setBanners(JSON.parse(savedBanners));
        } catch {
          setBanners(DEFAULT_BANNERS);
        }
      } else {
        setBanners(DEFAULT_BANNERS);
      }

      // 2. Load Products from real database
      const res = await fetch('/api/products?status=all', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err: any) {
      console.error('Failed to load promotions:', err);
      showToast('error', 'Failed to load promotions and products.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save banners to localStorage
  const saveBanners = (newBanners: Banner[]) => {
    setBanners(newBanners);
    localStorage.setItem('bluebell_admin_banners', JSON.stringify(newBanners));
  };

  // Toggle banner active state
  const handleToggleBanner = (id: string) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
    saveBanners(updated);
    showToast('success', 'Banner display status updated.');
  };

  // Delete banner
  const handleDeleteBanner = (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    saveBanners(updated);
    showToast('success', 'Banner removed from storefront rotation.');
  };

  // Open Banner Modal
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerForm({
      title: '',
      subtitle: '',
      badge: 'Special Offer',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80',
      linkUrl: '/products',
      buttonText: 'Shop Now',
      active: true,
    });
    setIsBannerModalOpen(true);
  };

  const handleOpenEditBanner = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm(b);
    setIsBannerModalOpen(true);
  };

  // Save Banner Modal
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title?.trim() || !bannerForm.imageUrl?.trim()) {
      showToast('error', 'Title and Banner Image URL are required.');
      return;
    }

    if (editingBanner) {
      const updated = banners.map((b) =>
        b.id === editingBanner.id ? ({ ...b, ...bannerForm } as Banner) : b
      );
      saveBanners(updated);
      showToast('success', 'Banner updated successfully.');
    } else {
      const newBanner: Banner = {
        id: `banner-${Date.now()}`,
        title: bannerForm.title.trim(),
        subtitle: bannerForm.subtitle || '',
        badge: bannerForm.badge || 'Sale',
        imageUrl: bannerForm.imageUrl.trim(),
        linkUrl: bannerForm.linkUrl || '/products',
        buttonText: bannerForm.buttonText || 'Shop Now',
        active: bannerForm.active !== false,
      };
      saveBanners([newBanner, ...banners]);
      showToast('success', 'New promotional banner created.');
    }
    setIsBannerModalOpen(false);
  };

  // Toggle Featured or Best Seller on product with live DB update
  const handleToggleProductAttribute = async (
    product: Product,
    attr: 'isFeatured' | 'isBestSeller'
  ) => {
    setUpdatingProductId(product.id);
    const newValue = !product[attr];

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [attr]: newValue }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update deal product');
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, [attr]: newValue } : p))
      );
      showToast('success', `Updated deal status for "${product.name}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update product deal flag.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  // Set custom deal badge on product
  const handleSetBadge = async (product: Product, badge: string | null) => {
    setUpdatingProductId(product.id);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badge }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to set product badge');
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, badge: badge || undefined } : p))
      );
      showToast('success', `Badge updated for "${product.name}".`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update badge.');
    } finally {
      setUpdatingProductId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
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
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Marketing &bull; Deals &amp; Banners</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Deals &amp; Banners Management
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Configure homepage hero banners, flash sale ribbons, and featured deal badges across Blue Bells.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'banners' ? (
            <button
              type="button"
              onClick={handleOpenAddBanner}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0756C4] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Banner</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fetchData(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#0866E8] ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Deals</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#DCEBFA]">
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'banners'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Homepage Banners ({banners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deals')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'deals'
              ? 'border-[#0866E8] text-[#0866E8]'
              : 'border-transparent text-[#647A98] hover:text-[#102A50]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Product Deals &amp; Badges ({products.filter((p) => p.badge || p.isFeatured || p.isBestSeller).length})</span>
        </button>
      </div>

      {/* TAB 1: BANNERS */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-[#DCEBFA] overflow-hidden shadow-xs flex flex-col justify-between group hover:shadow-md transition-all"
              >
                {/* Banner Image Preview */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={b.imageUrl}
                    alt={b.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0866E8] text-white shadow-xs">
                      {b.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-black text-sm truncate">{b.title}</h3>
                    <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">{b.subtitle}</p>
                  </div>
                </div>

                {/* Banner Controls */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#647A98]">Button CTA:</span>
                    <strong className="text-[#102A50] font-mono">{b.buttonText}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#647A98]">Destination:</span>
                    <span className="text-[#0866E8] font-mono text-[11px] truncate max-w-[160px]">{b.linkUrl}</span>
                  </div>

                  <div className="pt-3 border-t border-[#DCEBFA] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleBanner(b.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                        b.active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-[#8EA0B8] border-slate-200'
                      }`}
                    >
                      {b.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{b.active ? 'Active' : 'Hidden'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBanner(b)}
                        className="p-1.5 rounded-lg border border-[#DCEBFA] text-[#0866E8] hover:bg-[#EDF6FF]"
                        title="Edit Banner"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT DEALS & BADGES */}
      {activeTab === 'deals' && (
        <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#DCEBFA] bg-[#F7FBFF] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#102A50]">Catalog Deal &amp; Badge Assignment</h3>
              <p className="text-xs text-[#647A98]">Assign promotional tags like "Hot", "Sale", or "Deal" directly to products</p>
            </div>
            <span className="text-xs font-bold text-[#0866E8] bg-white px-3 py-1 rounded-xl border border-[#DCEBFA]">
              {products.length} Total Devices
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF2F7] bg-white text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Active Badge</th>
                  <th className="py-4 px-6 text-center">Featured Deal</th>
                  <th className="py-4 px-6 text-center">Best Seller</th>
                  <th className="py-4 px-6 text-right">Quick Badges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA] text-xs">
                {products.slice(0, 25).map((p) => (
                  <tr key={p.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-[#DCEBFA] overflow-hidden flex items-center justify-center shrink-0 p-1">
                          <Image
                            src={p.image || '/categories/iphone.svg'}
                            alt={p.name}
                            width={40}
                            height={40}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <p className="font-bold text-[#102A50] truncate">{p.name}</p>
                          <span className="text-[11px] text-[#647A98]">{p.brand}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-[#102A50]">
                      Rs. {Number(p.price || 0).toLocaleString('en-PK')}
                    </td>

                    {/* Active Badge */}
                    <td className="py-4 px-6">
                      {p.badge ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                          <Tag className="w-3 h-3" />
                          {p.badge}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#8EA0B8] italic">No Badge</span>
                      )}
                    </td>

                    {/* Toggle Featured */}
                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleProductAttribute(p, 'isFeatured')}
                        disabled={updatingProductId === p.id}
                        className={`p-1.5 rounded-xl border transition-all ${
                          p.isFeatured
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-white text-[#8EA0B8] border-[#DCEBFA] hover:text-[#102A50]'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-amber-500' : ''}`} />
                      </button>
                    </td>

                    {/* Toggle Best Seller */}
                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleProductAttribute(p, 'isBestSeller')}
                        disabled={updatingProductId === p.id}
                        className={`p-1.5 rounded-xl border transition-all ${
                          p.isBestSeller
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : 'bg-white text-[#8EA0B8] border-[#DCEBFA] hover:text-[#102A50]'
                        }`}
                        title="Toggle Best Seller"
                      >
                        <Flame className={`w-4 h-4 ${p.isBestSeller ? 'fill-purple-600' : ''}`} />
                      </button>
                    </td>

                    {/* Quick Badge Chips */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {['Sale', 'Hot', 'Deal', 'New'].map((badgeName) => (
                          <button
                            key={badgeName}
                            type="button"
                            onClick={() => handleSetBadge(p, p.badge === badgeName ? null : badgeName)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                              p.badge === badgeName
                                ? 'bg-[#0866E8] text-white border-[#0866E8]'
                                : 'bg-[#F7FBFF] text-[#647A98] border-[#DCEBFA] hover:border-[#0866E8]'
                            }`}
                          >
                            {badgeName}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BANNER MODAL */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="p-6 border-b border-[#DCEBFA] flex items-center justify-between">
              <h3 className="text-base font-bold text-[#102A50]">
                {editingBanner ? 'Edit Banner' : 'Create New Promotional Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1.5 rounded-lg text-[#647A98] hover:text-[#102A50] hover:bg-[#EDF6FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 16 Pro Max Flash Sale"
                  value={bannerForm.title || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">Subtitle / Marketing Hook</label>
                <input
                  type="text"
                  placeholder="e.g. Official PTA Approved with 1 Year Warranty"
                  value={bannerForm.subtitle || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    placeholder="Mega Sale"
                    value={bannerForm.badge || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">Button Text</label>
                  <input
                    type="text"
                    placeholder="Shop Now"
                    value={bannerForm.buttonText || ''}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={bannerForm.imageUrl || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">Link Destination URL</label>
                <input
                  type="text"
                  placeholder="/products or /categories"
                  value={bannerForm.linkUrl || ''}
                  onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div className="pt-4 border-t border-[#DCEBFA] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-[#EDF6FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0866E8] hover:bg-[#0756C4] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
