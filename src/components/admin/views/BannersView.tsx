'use client';

import React, { useState, useRef } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  ExternalLink,
  UploadCloud,
  Sparkles,
  Tag,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { BannerItem, PromoDeal } from '@/context/ProductsContext';

interface BannersViewProps {
  bannersList: BannerItem[];
  onAddBanner: (banner: BannerItem) => void;
  onUpdateBanner: (id: string | number, updates: Partial<BannerItem>) => void;
  onDeleteBanner: (id: string | number) => void;
  dealsList?: PromoDeal[];
  onAddDeal?: (deal: PromoDeal) => void;
  onUpdateDeal?: (id: string | number, updates: Partial<PromoDeal>) => void;
  onDeleteDeal?: (id: string | number) => void;
}

export const BannersView: React.FC<BannersViewProps> = ({
  bannersList,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
  dealsList = [],
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
}) => {
  // Main Tab State
  const [activeSubTab, setActiveSubTab] = useState<'banners' | 'deals'>('banners');

  // Banner Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImage, setBannerImage] = useState('/banners/hero-ipad-pro.jpg');
  const [bannerLink, setBannerLink] = useState('/products?category=ipad');
  const [bannerStatus, setBannerStatus] = useState<'Active' | 'Inactive'>('Active');
  const [bannerPeriod, setBannerPeriod] = useState('Apr 20 - May 20');

  // Deal Modal State
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<PromoDeal | null>(null);
  const [dealTitle, setDealTitle] = useState('');
  const [dealDiscount, setDealDiscount] = useState('Up To 25% OFF');
  const [dealBadge, setDealBadge] = useState('SPECIAL OFFER');
  const [dealBrand, setDealBrand] = useState('SAMSUNG');
  const [dealSubtitle, setDealSubtitle] = useState('');
  const [dealImage, setDealImage] = useState('/categories/samsung.svg');
  const [dealLink, setDealLink] = useState('/products?brand=Samsung');

  // File Input Refs
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const dealFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Image Upload for Banner
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setBannerImage(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Image Upload for Deal
  const handleDealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setDealImage(loadEvt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Open Add Banner
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerTitle('');
    setBannerImage('/banners/hero-ipad-pro.jpg');
    setBannerLink('/products?category=ipad');
    setBannerStatus('Active');
    setBannerPeriod('Apr 20 - May 20');
    setShowBannerModal(true);
  };

  // Open Edit Banner
  const handleOpenEditBanner = (b: BannerItem) => {
    setEditingBanner(b);
    setBannerTitle(b.title);
    setBannerImage(b.image);
    setBannerLink(b.link || '/products');
    setBannerStatus(b.status);
    setBannerPeriod(b.validPeriod);
    setShowBannerModal(true);
  };

  // Save Banner Submit
  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle) return;

    if (editingBanner) {
      onUpdateBanner(editingBanner.id, {
        title: bannerTitle,
        image: bannerImage,
        link: bannerLink,
        status: bannerStatus,
        validPeriod: bannerPeriod,
      });
    } else {
      const newBanner: BannerItem = {
        id: Date.now(),
        title: bannerTitle,
        image: bannerImage,
        link: bannerLink,
        status: bannerStatus,
        validPeriod: bannerPeriod,
      };
      onAddBanner(newBanner);
    }
    setShowBannerModal(false);
  };

  // Open Add Deal
  const handleOpenAddDeal = () => {
    setEditingDeal(null);
    setDealTitle('');
    setDealDiscount('Up To 25% OFF');
    setDealBadge('HOT PROMO');
    setDealBrand('APPLE');
    setDealSubtitle('Official 1 Year Warranty + Free PTA Verification included.');
    setDealImage('/categories/iphone.svg');
    setDealLink('/products?brand=Apple');
    setShowDealModal(true);
  };

  // Open Edit Deal
  const handleOpenEditDeal = (d: PromoDeal) => {
    setEditingDeal(d);
    setDealTitle(d.title);
    setDealDiscount(d.discount);
    setDealBadge(d.badge);
    setDealBrand(d.brand);
    setDealSubtitle(d.subtitle);
    setDealImage(d.image);
    setDealLink(d.link);
    setShowDealModal(true);
  };

  // Save Deal Submit
  const handleDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle) return;

    if (editingDeal && onUpdateDeal) {
      onUpdateDeal(editingDeal.id, {
        title: dealTitle,
        discount: dealDiscount,
        badge: dealBadge,
        brand: dealBrand,
        subtitle: dealSubtitle,
        image: dealImage,
        link: dealLink,
      });
    } else if (onAddDeal) {
      const newDeal: PromoDeal = {
        id: Date.now(),
        title: dealTitle,
        discount: dealDiscount,
        badge: dealBadge,
        brand: dealBrand,
        subtitle: dealSubtitle,
        image: dealImage,
        link: dealLink,
        badgeColor: 'bg-sky-500 text-white',
        bgGradient: 'from-sky-100/90 via-sky-50/70 to-white',
      };
      onAddDeal(newDeal);
    }
    setShowDealModal(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header with Tab Switcher & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Banners &amp; Promotional Deals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage homepage hero slider banners and promotional deal campaigns with real-time sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'banners' ? (
            <button
              onClick={handleOpenAddBanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hero Banner</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddDeal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Promotional Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs: Banners vs Deals */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('banners')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'banners'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-500" />
          <span>Hero Slider Banners ({bannersList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('deals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeSubTab === 'deals'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>Promotional Deals ({dealsList.length})</span>
        </button>
      </div>

      {/* 2. Content: Banners Table */}
      {activeSubTab === 'banners' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold border-b border-slate-200/70 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Banner Preview</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4">Target Link</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Valid Period</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bannersList.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center p-1">
                        <img src={b.image} alt={b.title} className="w-full h-full object-contain" />
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <p className="font-black text-slate-900">{b.title}</p>
                      {b.subtitle && <p className="text-[11px] text-slate-400 truncate max-w-xs">{b.subtitle}</p>}
                    </td>

                    {/* Target Link */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-sky-600">
                      {b.link}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          b.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {b.status === 'Active' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{b.status}</span>
                      </span>
                    </td>

                    {/* Valid Period */}
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {b.validPeriod}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditBanner(b)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteBanner(b.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Content: Deals Table */}
      {activeSubTab === 'deals' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold border-b border-slate-200/70 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Deal Product</th>
                  <th className="py-3.5 px-4">Title &amp; Brand</th>
                  <th className="py-3.5 px-4">Discount Tag</th>
                  <th className="py-3.5 px-4">Perks / Description</th>
                  <th className="py-3.5 px-4">Store Link</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dealsList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center p-1.5">
                        <img src={d.image} alt={d.title} className="w-full h-full object-contain" />
                      </div>
                    </td>

                    {/* Title & Brand */}
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-black uppercase text-sky-600 block">{d.brand}</span>
                      <p className="font-black text-slate-900">{d.title}</p>
                    </td>

                    {/* Discount */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-sky-50 text-sky-600 border border-sky-200">
                        {d.discount}
                      </span>
                    </td>

                    {/* Subtitle */}
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {d.subtitle}
                    </td>

                    {/* Target Link */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-sky-600">
                      {d.link}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditDeal(d)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                          title="Edit Deal"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {onDeleteDeal && (
                          <button
                            onClick={() => onDeleteDeal(d.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Deal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Banner Modal (with Live Image File Upload) */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
              </h3>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. Apple iPad Pro M4 Mega Launch"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              {/* Image Upload System */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Image (File Upload or URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="/banners/hero-ipad-pro.jpg or image URL"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 font-bold hover:bg-sky-100 flex items-center gap-1.5 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Instant Live Preview */}
                <div className="mt-2.5 w-full h-32 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-tr from-sky-50 via-white to-sky-100/50 flex items-center justify-center p-2 relative group">
                  <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-contain rounded-xl" />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                    Live Preview
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Storefront Target Link</label>
                  <input
                    type="text"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    placeholder="/products?category=ipad"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valid Period</label>
                  <input
                    type="text"
                    value={bannerPeriod}
                    onChange={(e) => setBannerPeriod(e.target.value)}
                    placeholder="Apr 20 - May 20"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Status</label>
                <select
                  value={bannerStatus}
                  onChange={(e) => setBannerStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="Active">Active (Visible in Hero Slider)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-md shadow-sky-500/25 transition-all"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Deal Modal (with Live Image File Upload) */}
      {showDealModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-base sm:text-lg text-slate-900">
                {editingDeal ? 'Edit Promotional Deal' : 'Add New Promotional Deal'}
              </h3>
              <button
                onClick={() => setShowDealModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDealSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deal Title *</label>
                  <input
                    type="text"
                    value={dealTitle}
                    onChange={(e) => setDealTitle(e.target.value)}
                    placeholder="e.g. Samsung Galaxy S24 Series"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    value={dealBrand}
                    onChange={(e) => setDealBrand(e.target.value)}
                    placeholder="SAMSUNG / APPLE"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Tag *</label>
                  <input
                    type="text"
                    value={dealDiscount}
                    onChange={(e) => setDealDiscount(e.target.value)}
                    placeholder="Up To 25% OFF"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={dealBadge}
                    onChange={(e) => setDealBadge(e.target.value)}
                    placeholder="EXCLUSIVE DEAL"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Free Perks</label>
                <textarea
                  rows={2}
                  value={dealSubtitle}
                  onChange={(e) => setDealSubtitle(e.target.value)}
                  placeholder="Free 45W Fast Charger + Official Brand Warranty included."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none resize-none"
                />
              </div>

              {/* Image Upload for Deal */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Deal Image (Upload File)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dealImage}
                    onChange={(e) => setDealImage(e.target.value)}
                    placeholder="/categories/samsung.svg or data image"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => dealFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 font-bold hover:bg-sky-100 flex items-center gap-1.5 transition-colors"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    ref={dealFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDealFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Instant Live Preview */}
                <div className="mt-2.5 w-full h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 relative">
                  <img src={dealImage} alt="Deal Preview" className="h-full object-contain" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Storefront Link</label>
                <input
                  type="text"
                  value={dealLink}
                  onChange={(e) => setDealLink(e.target.value)}
                  placeholder="/products?brand=Samsung"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDealModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-md shadow-sky-500/25 transition-all"
                >
                  {editingDeal ? 'Save Deal' : 'Publish Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
