'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Category } from '@/types';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Boxes,
  Loader2,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchCategories = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/categories?all=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      showToast('error', 'Could not load categories.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImage('/categories/iphone.svg');
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setImage(c.image || '/categories/iphone.svg');
    setIsActive(c.isActive !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (!slug.trim()) {
      setFormError('Category slug is required.');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        // Update
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            description: description.trim(),
            image: image.trim(),
            isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update category');
        showToast('success', `Category "${name}" updated successfully.`);
      } else {
        // Create
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            description: description.trim(),
            image: image.trim(),
            isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create category');
        showToast('success', `Category "${name}" created successfully.`);
      }

      setIsModalOpen(false);
      fetchCategories(true);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const handleToggleStatus = async (c: Category) => {
    const newStatus = c.isActive === false;
    try {
      const res = await fetch(`/api/categories/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setCategories((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, isActive: newStatus } : item))
        );
        showToast('success', `Category marked as ${newStatus ? 'Active' : 'Hidden'}.`);
      }
    } catch (err) {
      showToast('error', 'Failed to toggle category status.');
    }
  };

  // Delete category
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete category');

      setCategories((prev) => prev.filter((item) => item.id !== deletingCategory.id));
      showToast('success', `Category "${deletingCategory.name}" deleted.`);
      setDeletingCategory(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  const activeCount = categories.filter((c) => c.isActive !== false).length;
  const totalItemCount = categories.reduce((sum, c) => sum + (c.itemCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-slideUp ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Storefront Taxonomy</span>
          </div>
          <h1 className="text-2xl font-black text-[#102A50] tracking-tight">
            Categories Management
          </h1>
          <p className="text-xs text-[#647A98] mt-0.5">
            Organize catalog departments, icon assets, and storefront filter taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchCategories(true)}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl border border-[#DCEBFA] bg-white text-[#102A50] hover:bg-[#EDF6FF] transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh categories"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#0866E8]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#647A98] block">Total Categories</span>
            <span className="text-2xl font-black text-[#102A50] font-mono mt-0.5 block">
              {categories.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center font-bold">
            <FolderTree className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#647A98] block">Active Categories</span>
            <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">
              {activeCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#647A98] block">Total Assigned Items</span>
            <span className="text-2xl font-black text-[#0866E8] font-mono mt-0.5 block">
              {totalItemCount}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#647A98]" />
        <input
          type="text"
          placeholder="Search categories by department name or slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#DCEBFA] rounded-2xl py-2.5 pl-10 pr-4 text-xs text-[#102A50] placeholder-[#647A98]/60 focus:outline-none focus:border-[#0866E8] focus:ring-4 focus:ring-[#0866E8]/10 shadow-xs"
        />
      </div>

      {/* Categories Grid Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse flex items-center justify-between px-6">
                <div className="w-40 h-4 bg-slate-200 rounded" />
                <div className="w-24 h-4 bg-slate-200 rounded" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-10 h-10 text-[#647A98]/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#102A50]">No categories found</h3>
            <p className="text-xs text-[#647A98] mt-1">
              Try adjusting your search query or create a new category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DCEBFA] bg-[#F7FBFF] text-[#647A98] uppercase font-bold text-[10px] tracking-wider">
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5 text-center">Product Count</th>
                  <th className="px-6 py-3.5 text-center">Storefront Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA]">
                {filteredCategories.map((c) => (
                  <tr key={c.id || c.slug} className="hover:bg-[#F7FBFF]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-[#DCEBFA] bg-[#F7FBFF] p-1.5 flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.image || '/categories/iphone.svg'}
                            alt={c.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-[#102A50] block">{c.name}</span>
                          {c.description && (
                            <span className="text-[11px] text-[#647A98] line-clamp-1">
                              {c.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[#0866E8] bg-[#EDF6FF] px-2.5 py-1 rounded-lg border border-[#DCEBFA]">
                        {c.slug}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-[#102A50] font-mono">
                        {c.itemCount || 0} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                          c.isActive !== false
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {c.isActive !== false ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/products?category=${c.slug}`}
                          target="_blank"
                          title="View on Storefront"
                          className="p-2 rounded-xl text-[#647A98] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Category"
                          className="p-2 rounded-xl text-[#647A98] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(c)}
                          title="Delete Category"
                          className="p-2 rounded-xl text-[#647A98] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-[#DCEBFA] flex items-center justify-between bg-gradient-to-r from-white to-[#F7FBFF]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center">
                  <FolderTree className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-[#102A50]">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#647A98] hover:text-[#102A50] hover:bg-[#EDF6FF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smartwatches"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:border-[#0866E8] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. smartwatches"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:border-[#0866E8] font-mono text-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">
                  Icon / Image URL
                </label>
                <input
                  type="text"
                  placeholder="/categories/smartwatches.svg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description for customer catalog..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F7FBFF] border border-[#DCEBFA] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#0866E8] rounded border-[#DCEBFA]"
                />
                <span className="text-xs font-bold text-[#102A50]">
                  Category Active &amp; Visible in Storefront Nav
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#DCEBFA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-60 cursor-pointer"
                >
                  {saving ? (
                    <span className="animate-pulse font-bold">Saving...</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div
          className="fixed inset-0 z-50 bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setDeletingCategory(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#102A50]">Delete Category</h3>
            <p className="text-xs text-[#647A98] mt-1 mb-6">
              Are you sure you want to permanently delete category &quot;
              <strong className="text-[#102A50]">{deletingCategory.name}</strong>&quot;? Products
              belonging to this department will not be deleted.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
