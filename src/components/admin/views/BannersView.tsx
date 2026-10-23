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
  DollarSign,
  Package,
  Check,
  Loader2,
} from 'lucide-react';
import { BannerItem, PromoDeal } from '@/context/ProductsContext';
import { Product } from '@/types';

interface BannersViewProps {
  bannersList: BannerItem[];
  onAddBanner: (banner: BannerItem) => void;
  onUpdateBanner: (id: string | number, updates: Partial<BannerItem>) => void;
  onDeleteBanner: (id: string | number) => void;
  dealsList?: PromoDeal[];
  onAddDeal?: (deal: PromoDeal) => void;
  onUpdateDeal?: (id: string | number, updates: Partial<PromoDeal>) => void;
  onDeleteDeal?: (id: string | number) => void;
  productsList?: Product[];
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
  productsList = [],
}) => {
  // Main Tab State
  const [activeSubTab, setActiveSubTab] = useState<'banners' | 'deals'>('banners');

  // Upload Loading States
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingDeal, setIsUploadingDeal] = useState(false);

  // Banner Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerTitlePrefix, setBannerTitlePrefix] = useState('iPad ');
  const [bannerTitleHighlight, setBannerTitleHighlight] = useState('Pro');
  const [bannerBrand, setBannerBrand] = useState('Apple iPad');
  const [bannerTag, setBannerTag] = useState('FLAGSHIP TABLET');
  const [bannerTagline, setBannerTagline] = useState('Power to do more.');
  const [bannerSubtitle, setBannerSubtitle] = useState('The ultimate iPad experience with groundbreaking M4 performance.');
  const [bannerPrice, setBannerPrice] = useState('Rs. 229,999');
  const [bannerImage, setBannerImage] = useState('/banners/hero-ipad-pro.jpg');
  const [bannerLink, setBannerLink] = useState('/products?category=ipad');
  const [bannerStatus, setBannerStatus] = useState<'Active' | 'Inactive'>('Active');
  const [bannerPeriod, setBannerPeriod] = useState('Apr 20 - May 20');

  // Deal Modal State
  const [showDealModal, setShowDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<PromoDeal | null>(null);
  const [dealTitle, setDealTitle] = useState('');
  const [dealDiscount, setDealDiscount] = useState('Up To 25% OFF');
  const [dealPrice, setDealPrice] = useState('Rs. 289,999');
  const [dealBadge, setDealBadge] = useState('SPECIAL OFFER');
  const [dealBrand, setDealBrand] = useState('SAMSUNG');
  const [dealSubtitle, setDealSubtitle] = useState('');
  const [dealImage, setDealImage] = useState('/categories/samsung.svg');
  const [dealLink, setDealLink] = useState('/products?brand=Samsung');
  const [dealSelectedProductIds, setDealSelectedProductIds] = useState<string[]>([]);

  // File Input Refs
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const dealFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Cloudinary Image Upload for Banner
  const handleBannerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setBannerImage(data.url);
      } else {
        // Fallback to local base64 reader
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          if (loadEvt.target?.result) setBannerImage(loadEvt.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Handle Cloudinary Image Upload for Deal
  const handleDealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDeal(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setDealImage(data.url);
      } else {
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
          if (loadEvt.target?.result) setDealImage(loadEvt.target.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploadingDeal(false);
    }
  };

  // Open Add Banner
  const handleOpenAddBanner = () => {
    setEditingBanner(null);
    setBannerTitlePrefix('Galaxy ');
    setBannerTitleHighlight('S25 Ultra');
    setBannerBrand('SAMSUNG');
    setBannerTag('NEW ARRIVAL');
    setBannerTagline('Galaxy AI is here.');
    setBannerSubtitle('Smarter. Faster. More Powerful with 200MP Quad Camera.');
    setBannerPrice('Rs. 329,999');
    setBannerImage('/banners/hero-samsung-s24.jpg');
    setBannerLink('/products?brand=Samsung');
    setBannerStatus('Active');
    setBannerPeriod('Current Season');
    setShowBannerModal(true);
  };

  // Open Edit Banner
  const handleOpenEditBanner = (b: BannerItem) => {
    setEditingBanner(b);
    setBannerTitlePrefix(b.titlePrefix !== undefined ? b.titlePrefix : b.title);
    setBannerTitleHighlight(b.titleHighlight || '');
    setBannerBrand(b.brand || 'Apple iPhone');
    setBannerTag(b.tag || 'FLAGSHIP');
    setBannerTagline(b.tagline || 'Official PTA Approved');
    setBannerSubtitle(b.subtitle || '');
    setBannerPrice(b.price || 'Rs. 249,999');
    setBannerImage(b.image);
    setBannerLink(b.link || '/products');
    setBannerStatus(b.status);
    setBannerPeriod(b.validPeriod || 'Ongoing');
    setShowBannerModal(true);
  };

  // Save Banner Submit
  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullTitle = `${bannerTitlePrefix}${bannerTitleHighlight}`.trim() || 'Hero Banner';

    if (editingBanner) {
      onUpdateBanner(editingBanner.id, {
        title: fullTitle,
        titlePrefix: bannerTitlePrefix,
        titleHighlight: bannerTitleHighlight,
        brand: bannerBrand,
        tag: bannerTag,
        tagline: bannerTagline,
        subtitle: bannerSubtitle,
        price: bannerPrice,
        image: bannerImage,
        link: bannerLink,
        status: bannerStatus,
        validPeriod: bannerPeriod,
      });
    } else {
      const newBanner: BannerItem = {
        id: Date.now(),
        title: fullTitle,
        titlePrefix: bannerTitlePrefix,
        titleHighlight: bannerTitleHighlight,
        brand: bannerBrand,
        tag: bannerTag,
        tagline: bannerTagline,
        subtitle: bannerSubtitle,
        price: bannerPrice,
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
    setDealPrice('Rs. 299,999');
    setDealBadge('HOT PROMO');
    setDealBrand('APPLE');
    setDealSubtitle('Official 1 Year Warranty + Free PTA Verification included.');
    setDealImage('/categories/iphone.svg');
    setDealLink('/products?brand=Apple');
    setDealSelectedProductIds([]);
    setShowDealModal(true);
  };

  // Open Edit Deal
  const handleOpenEditDeal = (d: PromoDeal) => {
    setEditingDeal(d);
    setDealTitle(d.title);
    setDealDiscount(d.discount);
    setDealPrice(typeof d.price === 'string' ? d.price : d.price ? `Rs. ${d.price.toLocaleString()}` : 'Rs. 289,999');
    setDealBadge(d.badge);
    setDealBrand(d.brand);
    setDealSubtitle(d.subtitle);
    setDealImage(d.image);
    setDealLink(d.link);
    setDealSelectedProductIds(d.products ? d.products.map((p) => p.id) : []);
    setShowDealModal(true);
  };

  // Toggle Product inside Deal Bundle
  const toggleProductInDeal = (productId: string) => {
    setDealSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Save Deal Submit
  const handleDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle) return;

    // Map selected product IDs to product preview items
    const selectedBundle = productsList
      .filter((p) => dealSelectedProductIds.includes(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
      }));

    if (editingDeal && onUpdateDeal) {
      onUpdateDeal(editingDeal.id, {
        title: dealTitle,
        discount: dealDiscount,
        price: dealPrice,
        badge: dealBadge,
        brand: dealBrand,
        subtitle: dealSubtitle,
        image: dealImage,
        link: dealLink,
        products: selectedBundle.length > 0 ? selectedBundle : editingDeal.products,
      });
    } else if (onAddDeal) {
      const newDeal: PromoDeal = {
        id: Date.now(),
        title: dealTitle,
        discount: dealDiscount,
        price: dealPrice,
        badge: dealBadge,
        brand: dealBrand,
        subtitle: dealSubtitle,
        image: dealImage,
        link: dealLink,
        badgeColor: 'bg-sky-500 text-white',
        bgGradient: 'from-sky-100/90 via-sky-50/70 to-white',
        products: selectedBundle,
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
            Hero Banners &amp; Promotional Deals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add, edit, or delete homepage hero banners with custom prices &amp; device uploads. Create bundled multi-product deals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'banners' ? (
            <button
              onClick={handleOpenAddBanner}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hero Slide</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddDeal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Multi-Product Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tabs: Banners vs Deals */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('banners')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'banners'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-500" />
          <span>Hero Slides Carousel ({bannersList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('deals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeSubTab === 'deals'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-4 h-4 text-emerald-500" />
          <span>Multi-Product Deals ({dealsList.length})</span>
        </button>
      </div>

      {/* 2. SUB-VIEW: HERO BANNERS MANAGEMENT */}
      {activeSubTab === 'banners' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {bannersList.map((banner, index) => {
              const isActive = banner.status === 'Active';

              return (
                <div
                  key={banner.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Slide index, status badge, action buttons */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-sky-50 text-sky-600 font-mono text-xs font-black flex items-center justify-center border border-sky-100">
                          #{index + 1}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          {banner.status}
                        </span>
                        {banner.tag && (
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                            {banner.tag}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            onUpdateBanner(banner.id, {
                              status: isActive ? 'Inactive' : 'Active',
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title={isActive ? 'Deactivate banner' : 'Activate banner'}
                        >
                          {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenEditBanner(banner)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                          title="Edit banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteBanner(banner.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Banner Image Preview Container */}
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-3 mb-3">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Headline and Details */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {banner.brand || 'BLUE BELL MOBILE'}
                      </div>
                      <h3 className="font-black text-slate-900 text-base leading-tight mt-0.5">
                        {banner.titlePrefix && <span className="text-slate-900">{banner.titlePrefix}</span>}
                        {banner.titleHighlight ? (
                          <span className="text-sky-500"> {banner.titleHighlight}</span>
                        ) : (
                          <span>{banner.title}</span>
                        )}
                      </h3>
                      {banner.subtitle && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: Starting Price & Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Starting Price
                      </span>
                      <span className="font-black text-slate-900 font-mono text-sm text-sky-600">
                        {banner.price || 'Rs. 99,999'}
                      </span>
                    </div>

                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-sky-600"
                    >
                      <span>Preview Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SUB-VIEW: MULTI-PRODUCT DEALS MANAGEMENT */}
      {activeSubTab === 'deals' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {dealsList.map((deal) => (
              <div
                key={deal.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-sky-500 text-white shadow-xs">
                      {deal.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDeal(deal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                        title="Edit deal"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteDeal && onDeleteDeal(deal.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete deal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 flex-shrink-0">
                      <img src={deal.image} alt={deal.title} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {deal.brand}
                      </span>
                      <h3 className="font-black text-slate-900 text-base">{deal.title}</h3>
                      <p className="text-xs font-black text-sky-600">{deal.discount}</p>
                      {deal.price && (
                        <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">
                          Bundle Deal: {typeof deal.price === 'number' ? `Rs. ${deal.price.toLocaleString()}` : deal.price}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{deal.subtitle}</p>

                  {/* Bundled Multiple Products in this deal */}
                  {deal.products && deal.products.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Included Products in this Deal ({deal.products.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {deal.products.map((p, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-[11px] font-bold text-sky-700"
                          >
                            <Package className="w-3 h-3 text-sky-500" />
                            <span>{p.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                    {deal.link}
                  </span>
                  <a
                    href={deal.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-sky-600 hover:underline"
                  >
                    <span>Storefront Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. HERO BANNER MODAL (with Cloudinary Live Device Upload & Full Headline/Price Editing) */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  {editingBanner ? 'Edit Hero Banner Slide' : 'Add New Hero Banner Slide'}
                </h3>
                <span className="text-xs text-slate-400">
                  Changes sync immediately to the homepage hero banner carousel.
                </span>
              </div>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="space-y-4 text-xs">
              {/* Dual Headline Fields: Title Prefix & Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title Prefix *</label>
                  <input
                    type="text"
                    value={bannerTitlePrefix}
                    onChange={(e) => setBannerTitlePrefix(e.target.value)}
                    placeholder="e.g. iPhone "
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Highlight Word (Colored Blue) *</label>
                  <input
                    type="text"
                    value={bannerTitleHighlight}
                    onChange={(e) => setBannerTitleHighlight(e.target.value)}
                    placeholder="e.g. 18 Pro Max"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sky-600 font-black outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Brand and Badge Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    value={bannerBrand}
                    onChange={(e) => setBannerBrand(e.target.value)}
                    placeholder="Apple iPhone / Samsung"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={bannerTag}
                    onChange={(e) => setBannerTag(e.target.value)}
                    placeholder="NEW ARRIVAL / BEST SELLER"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none uppercase"
                  />
                </div>
              </div>

              {/* Tagline & Starting Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={bannerTagline}
                    onChange={(e) => setBannerTagline(e.target.value)}
                    placeholder="Bigger. Smarter. More Powerful."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Starting Price (PKR) *</label>
                  <input
                    type="text"
                    value={bannerPrice}
                    onChange={(e) => setBannerPrice(e.target.value)}
                    placeholder="Rs. 449,999"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sky-600 font-black font-mono outline-none"
                  />
                </div>
              </div>

              {/* Subtitle Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle Description</label>
                <textarea
                  rows={2}
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="The next generation of titanium smartphone innovation with groundbreaking performance."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none resize-none"
                />
              </div>

              {/* Banner Image Upload (Cloudinary API integration) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">
                    Product Banner Image (Upload from Computer/Phone)
                  </label>
                  {isUploadingBanner && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading to Cloud...</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="Image URL or upload from device"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={isUploadingBanner}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 font-bold hover:bg-sky-100 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Device File</span>
                  </button>
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Instant Live Image Preview */}
                <div className="mt-2.5 w-full h-32 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2 relative">
                  <img src={bannerImage} alt="Banner Preview" className="h-full object-contain" />
                </div>
              </div>

              {/* Storefront Link & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Storefront Link</label>
                  <input
                    type="text"
                    value={bannerLink}
                    onChange={(e) => setBannerLink(e.target.value)}
                    placeholder="/products?search=iPhone"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Display Status</label>
                  <select
                    value={bannerStatus}
                    onChange={(e) => setBannerStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                  >
                    <option value="Active">Active (Visible in Hero Carousel)</option>
                    <option value="Inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingBanner}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                >
                  {editingBanner ? 'Save Banner Changes' : 'Create Banner Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MULTI-PRODUCT DEAL MODAL */}
      {showDealModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  {editingDeal ? 'Edit Promotional Deal' : 'Add New Multi-Product Deal'}
                </h3>
                <span className="text-xs text-slate-400">
                  Bundle multiple products together and set promotional discounts.
                </span>
              </div>
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
                    placeholder="e.g. Galaxy S24 Ultra Flagship Bundle"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block font-bold text-slate-700 mb-1">Deal Price (PKR)</label>
                  <input
                    type="text"
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value)}
                    placeholder="Rs. 289,999"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sky-600 font-black font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={dealBadge}
                    onChange={(e) => setDealBadge(e.target.value)}
                    placeholder="EXCLUSIVE BUNDLE"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none uppercase"
                  />
                </div>
              </div>

              {/* Multi-Product Selector for this Deal */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Products to Bundle in this Deal ({dealSelectedProductIds.length} Selected):
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-2xl p-2 bg-slate-50 space-y-1">
                  {productsList.length === 0 ? (
                    <p className="text-slate-400 p-2">No products available to select.</p>
                  ) : (
                    productsList.map((p) => {
                      const isChecked = dealSelectedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProductInDeal(p.id)}
                          className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-sky-100/80 border border-sky-300'
                              : 'bg-white border border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                            />
                            <img src={p.image} alt={p.name} className="w-6 h-6 object-contain" />
                            <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-600 font-bold">
                            Rs. {p.price.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Free Perks Description</label>
                <textarea
                  rows={2}
                  value={dealSubtitle}
                  onChange={(e) => setDealSubtitle(e.target.value)}
                  placeholder="Free 45W Fast Charger + Official Brand Warranty included."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none resize-none"
                />
              </div>

              {/* Deal Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Deal Image (Upload File)</label>
                  {isUploadingDeal && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading to Cloud...</span>
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={dealImage}
                    onChange={(e) => setDealImage(e.target.value)}
                    placeholder="/categories/samsung.svg or image url"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => dealFileInputRef.current?.click()}
                    disabled={isUploadingDeal}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 font-bold hover:bg-sky-100 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDeal}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-md shadow-sky-500/25 transition-all cursor-pointer"
                >
                  {editingDeal ? 'Save Deal Changes' : 'Publish Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
