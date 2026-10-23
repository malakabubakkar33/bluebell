'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Layers, X, Search, Image as ImageIcon } from 'lucide-react';
import { Category } from '@/types';

interface CategoriesViewProps {
  categoriesList: Category[];
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (id: string, updates: Partial<Category>) => void;
  onDeleteCategory: (id: string, name: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categoriesList,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formImage, setFormImage] = useState('/categories/iphone.svg');
  const [formItemCount, setFormItemCount] = useState(10);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormImage('/categories/iphone.svg');
    setFormItemCount(10);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormImage(cat.image);
    setFormItemCount(cat.itemCount || 10);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const slug = formSlug.trim() || formName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, {
        name: formName,
        slug,
        image: formImage,
        itemCount: Number(formItemCount),
      });
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug,
        image: formImage,
        itemCount: Number(formItemCount),
      };
      onAddCategory(newCat);
    }

    setShowModal(false);
  };

  const filteredCategories = categoriesList.filter((cat) =>
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
            Add, edit, and organize product categories on the storefront.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* 2. Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 3. Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex items-center justify-between hover:shadow-md hover:border-blue-200 transition-all group"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{cat.name}</h4>
                <p className="text-[11px] text-slate-400 font-mono">/{cat.slug}</p>
                <span className="text-xs text-blue-600 font-semibold">{cat.itemCount || 0} items</span>
              </div>
            </div>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit category"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteCategory(cat.id, cat.name)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
              <h3 className="font-black text-lg text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) {
                      setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }
                  }}
                  placeholder="e.g. Gaming Phones"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. gaming-phones"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vector Icon / Image</label>
                <select
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-none"
                >
                  <option value="/categories/iphone.svg">iPhone Vector</option>
                  <option value="/categories/samsung.svg">Samsung Vector</option>
                  <option value="/categories/ipad.svg">iPad Vector</option>
                  <option value="/categories/smartwatches.svg">Smart Watches Vector</option>
                  <option value="/categories/accessories.svg">Accessories Vector</option>
                  <option value="/categories/tablets.svg">Tablets Vector</option>
                  <option value="/categories/cases.svg">Cases Vector</option>
                  <option value="/categories/chargers.svg">Chargers Vector</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Products Count</label>
                <input
                  type="number"
                  value={formItemCount}
                  onChange={(e) => setFormItemCount(Number(e.target.value))}
                  min={0}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none"
                />
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
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
