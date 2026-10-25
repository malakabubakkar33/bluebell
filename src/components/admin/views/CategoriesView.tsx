'use client';

import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  X,
  Search,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { Category } from '@/types';

interface CategoriesViewProps {
  categoriesList: Category[];
  onAddCategory: (category: Partial<Category>) => Promise<{ success: boolean; error?: string } | boolean>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => Promise<{ success: boolean; error?: string } | boolean>;
  onDeleteCategory: (id: string, name: string) => Promise<boolean>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const PRESET_VECTORS = [
  { label: 'iPhone', val: '/categories/iphone.svg' },
  { label: 'Samsung', val: '/categories/samsung.svg' },
  { label: 'iPad', val: '/categories/ipad.svg' },
  { label: 'Smart Watches', val: '/categories/smartwatches.svg' },
  { label: 'Accessories', val: '/categories/accessories.svg' },
  { label: 'Tablets', val: '/categories/tablets.svg' },
  { label: 'Cases & Covers', val: '/categories/cases.svg' },
  { label: 'Chargers & Cables', val: '/categories/chargers.svg' },
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categoriesList,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onRefresh,
  isRefreshing,
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImage, setFormImage] = useState('/categories/iphone.svg');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormImage('/categories/iphone.svg');
    setFormDescription('');
    setFormIsActive(true);
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormImage(cat.image || '/categories/iphone.svg');
    setFormDescription(cat.description || '');
    setFormIsActive(cat.isActive !== false);
    setErrorMessage(null);
    setShowModal(true);
  };

  const sanitizeSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = formName.trim();
    if (!trimmedName) {
      setErrorMessage('Category name is required.');
      return;
    }

    const cleanSlug = sanitizeSlug(formSlug || trimmedName);
    if (!cleanSlug) {
      setErrorMessage('Please provide a valid alphanumeric slug.');
      return;
    }

    // Check for duplicate category name/slug before sending
    if (!editingCategory) {
      const duplicate = categoriesList.find(
        (c) =>
          c.name.trim().toLowerCase() === trimmedName.toLowerCase() ||
          c.slug.trim().toLowerCase() === cleanSlug.toLowerCase()
      );
      if (duplicate) {
        setErrorMessage(
          `Category "${trimmedName}" (slug: ${cleanSlug}) already exists in the store. Please choose a different name or edit the existing category.`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (editingCategory) {
        const res = await onUpdateCategory(editingCategory.id, {
          name: trimmedName,
          slug: cleanSlug,
          image: formImage.trim() || '/categories/iphone.svg',
          description: formDescription.trim(),
          isActive: formIsActive,
        });

        const isSuccess = typeof res === 'boolean' ? res : res.success;
        if (isSuccess) {
          setShowModal(false);
        } else {
          const err = typeof res === 'object' && res.error ? res.error : 'Database update failed. Please try again.';
          setErrorMessage(err);
        }
      } else {
        const res = await onAddCategory({
          name: trimmedName,
          slug: cleanSlug,
          image: formImage.trim() || '/categories/iphone.svg',
          description: formDescription.trim(),
          isActive: formIsActive,
        });

        const isSuccess = typeof res === 'boolean' ? res : res.success;
        if (isSuccess) {
          setShowModal(false);
        } else {
          const err = typeof res === 'object' && res.error ? res.error : 'Database creation failed. Please try again.';
          setErrorMessage(err);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categoriesList.filter(
    (cat) =>
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add, edit, and organize product categories on the customer storefront.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
              title="Refresh from Database"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 hidden sm:inline-block">
          Total: {filteredCategories.length} Categories
        </span>
      </div>

      {/* 3. Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src={cat.image || '/categories/iphone.svg'}
                  alt={cat.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/categories/iphone.svg';
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900 truncate">{cat.name}</h4>
                  {cat.isActive === false && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200">
                      Hidden
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">/{cat.slug}</p>
                <span className="text-xs text-blue-600 font-semibold">
                  {cat.itemCount || 0} {cat.itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                title="Edit category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteCategory(cat.id, cat.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold">No categories found matching your query.</p>
          </div>
        )}
      </div>

      {/* 4. Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-lg text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingCategory ? 'Update existing database record' : 'Category will be saved directly to the live database'}
                </p>
              </div>
              <button
                onClick={() => !isSubmitting && setShowModal(false)}
                disabled={isSubmitting}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) {
                      setFormSlug(sanitizeSlug(e.target.value));
                    }
                  }}
                  placeholder="e.g. Gaming Phones"
                  required
                  disabled={isSubmitting}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Slug (Auto-generated URL identifier) *
                </label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(sanitizeSlug(e.target.value))}
                  placeholder="e.g. gaming-phones"
                  required
                  disabled={isSubmitting}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 outline-none disabled:opacity-60"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Storefront URL: /products?category={formSlug || 'slug'}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Image / Vector</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/categories/iphone.svg or image URL"
                    disabled={isSubmitting}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs outline-none disabled:opacity-60"
                  />
                  <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-1 overflow-hidden flex-shrink-0">
                    <img
                      src={formImage || '/categories/iphone.svg'}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/categories/iphone.svg';
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_VECTORS.map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setFormImage(preset.val)}
                      disabled={isSubmitting}
                      className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                        formImage === preset.val
                          ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short category description for storefront..."
                  disabled={isSubmitting}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none disabled:opacity-60"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700 block">Published on Storefront</span>
                  <span className="text-[10px] text-slate-400">
                    Active categories appear in navigation and category lists
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    disabled={isSubmitting}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1877F2]"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
