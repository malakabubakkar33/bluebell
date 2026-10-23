'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, ExternalLink } from 'lucide-react';
import { BannerItem } from '@/context/ProductsContext';

interface BannersViewProps {
  bannersList: BannerItem[];
  onAddBanner: (banner: BannerItem) => void;
  onUpdateBanner: (id: string | number, updates: Partial<BannerItem>) => void;
  onDeleteBanner: (id: string | number) => void;
}

export const BannersView: React.FC<BannersViewProps> = ({
  bannersList,
  onAddBanner,
  onUpdateBanner,
  onDeleteBanner,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formImage, setFormImage] = useState('/banners/slide-1.png');
  const [formLink, setFormLink] = useState('/products');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formPeriod, setFormPeriod] = useState('Apr 20 - May 20');

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormTitle('');
    setFormImage('/banners/slide-1.png');
    setFormLink('/products');
    setFormStatus('Active');
    setFormPeriod('Apr 20 - May 20');
    setShowModal(true);
  };

  const handleOpenEdit = (b: BannerItem) => {
    setEditingBanner(b);
    setFormTitle(b.title);
    setFormImage(b.image);
    setFormLink(b.link || '/products');
    setFormStatus(b.status);
    setFormPeriod(b.validPeriod);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;

    if (editingBanner) {
      onUpdateBanner(editingBanner.id, {
        title: formTitle,
        image: formImage,
        link: formLink,
        status: formStatus,
        validPeriod: formPeriod,
      });
    } else {
      const newBanner: BannerItem = {
        id: Date.now(),
        title: formTitle,
        image: formImage,
        link: formLink,
        status: formStatus,
        validPeriod: formPeriod,
      };
      onAddBanner(newBanner);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Banner Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage homepage hero slider banners and promotional campaigns.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* 2. Table */}
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
                    <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                    </div>
                  </td>

                  {/* Title */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs">
                    <div>{b.title}</div>
                    {b.subtitle && <p className="text-[11px] text-slate-400 font-normal truncate">{b.subtitle}</p>}
                  </td>

                  {/* Link */}
                  <td className="py-3.5 px-4 font-mono text-xs text-blue-600">
                    {b.link}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() =>
                        onUpdateBanner(b.id, {
                          status: b.status === 'Active' ? 'Inactive' : 'Active',
                        })
                      }
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {b.status}
                    </button>
                  </td>

                  {/* Valid Period */}
                  <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                    {b.validPeriod}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          onUpdateBanner(b.id, {
                            status: b.status === 'Active' ? 'Inactive' : 'Active',
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Toggle status"
                      >
                        {b.status === 'Active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onDeleteBanner(b.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete banner"
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

      {/* 3. Add / Edit Banner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <h3 className="font-black text-lg text-slate-900">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. iPad Pro M4 Mega Launch"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Banner Image</label>
                <select
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none"
                >
                  <option value="/banners/slide-1.png">Slide 1 - Apple iPad Pro (M4 Chip)</option>
                  <option value="/banners/slide-2.png">Slide 2 - iPhone 18 Pro Max (Titanium)</option>
                  <option value="/banners/slide-3.png">Slide 3 - Samsung Galaxy S24 Ultra</option>
                  <option value="/banners/slide-4.png">Slide 4 - iPhone 17 Pro Max (Gold)</option>
                </select>
                <div className="mt-2 w-full h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                  <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Storefront Link</label>
                  <input
                    type="text"
                    value={formLink}
                    onChange={(e) => setFormLink(e.target.value)}
                    placeholder="/products?category=ipad"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valid Period</label>
                  <input
                    type="text"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    placeholder="Apr 20 - May 20"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none"
                >
                  <option value="Active">Active (Visible in Hero Slider)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 transition-all"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
