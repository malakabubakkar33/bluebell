'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, Category } from '@/types';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { ProductDetailsModal } from '@/components/admin/ProductDetailsModal';
import { ProductDeleteModal } from '@/components/admin/ProductDeleteModal';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  Tag,
  Boxes,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'unpublished' | 'low-stock'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'stock-low' | 'stock-high'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Show auto-dismissing toast
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Fetch products and categories
  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [prodsRes, catsRes] = await Promise.all([
        fetch('/api/products?status=all', { cache: 'no-store' }),
        fetch('/api/categories', { cache: 'no-store' }),
      ]);

      if (prodsRes.ok) {
        const prodData = await prodsRes.json();
        if (prodData.success && Array.isArray(prodData.data)) {
          setProducts(prodData.data);
        }
      }

      if (catsRes.ok) {
        const catData = await catsRes.json();
        if (catData.success && Array.isArray(catData.data)) {
          setCategories(catData.data);
        }
      }
    } catch (err: any) {
      console.error('Failed to load products/categories:', err);
      showToast('error', 'Failed to fetch catalog from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Distinct Brands
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet).sort();
  }, [products]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const published = products.filter((p) => p.inStock).length;
    const unpublished = total - published;
    const lowStock = products.filter((p) => p.stock <= 15).length;
    return { total, published, unpublished, lowStock };
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categorySlug === selectedCategory || p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'all') {
      result = result.filter((p) => p.brand?.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Status filter
    if (selectedStatus === 'published') {
      result = result.filter((p) => p.inStock);
    } else if (selectedStatus === 'unpublished') {
      result = result.filter((p) => !p.inStock);
    } else if (selectedStatus === 'low-stock') {
      result = result.filter((p) => p.stock <= 15);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'stock-low') return (a.stock || 0) - (b.stock || 0);
      if (sortBy === 'stock-high') return (b.stock || 0) - (a.stock || 0);
      return 0; // Default newest (natural order from backend)
    });

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedStatus, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Handlers
  const handleTogglePublication = async (product: Product) => {
    setTogglingId(product.id);
    const newStatus = !product.inStock;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, inStock: newStatus } : p))
    );

    try {
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update publication status.');
      }

      showToast(
        'success',
        `${product.name} is now ${newStatus ? 'published & live' : 'unpublished & hidden'} on storefront.`
      );
    } catch (err: any) {
      // Revert optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: !newStatus } : p))
      );
      showToast('error', err.message || 'Failed to update publication status.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreateOrUpdate = async (productData: Partial<Product>) => {
    if (editingProduct) {
      // Update
      const res = await fetch(`/api/products/${encodeURIComponent(editingProduct.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update product in database.');
      }

      const updated = data.data as Product;
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      showToast('success', `Product "${updated.name}" updated successfully.`);
    } else {
      // Create
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create product in database.');
      }

      const created = data.data as Product;
      setProducts((prev) => [created, ...prev]);
      showToast('success', `Product "${created.name}" created and synced.`);
    }
  };

  const handleDeleteConfirm = async (productId: string) => {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete product.');
    }

    if (data.archived) {
      // Safe archived: unpublish and zero stock
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, inStock: false, stock: 0 } : p))
      );
      showToast('success', data.message || 'Product safely archived to preserve customer order history.');
    } else {
      // Hard deleted
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('success', 'Product permanently removed from database.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
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

      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <Package className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Phase 4 Active &bull; Product Catalog Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Products Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Authoritative inventory, pricing, and live customer storefront synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            title="Reload catalog from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0866E8] ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold transition-all shadow-md shadow-[#0866E8]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl border border-[#DCEBFA] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#647A98]">Total Catalog</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50]">{stats.total}</p>
          <span className="text-[11px] text-[#647A98]">Products in database</span>
        </div>

        {/* Published */}
        <div className="bg-white rounded-2xl border border-[#DCEBFA] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#647A98]">Published</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.published}</p>
          <span className="text-[11px] text-[#647A98]">Active on storefront</span>
        </div>

        {/* Unpublished */}
        <div className="bg-white rounded-2xl border border-[#DCEBFA] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#647A98]">Unpublished</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600">{stats.unpublished}</p>
          <span className="text-[11px] text-[#647A98]">Hidden / Inactive</span>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl border border-[#DCEBFA] p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#647A98]">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">{stats.lowStock}</p>
          <span className="text-[11px] text-[#647A98]">Stock &le; 15 units</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#DCEBFA] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-[#647A98] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or brand..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8] cursor-pointer"
            >
              <option value="all">All Brands</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8] cursor-pointer"
            >
              <option value="all">All Publication Statuses</option>
              <option value="published">Published Only</option>
              <option value="unpublished">Unpublished Only</option>
              <option value="low-stock">Low Stock (&le; 15)</option>
            </select>
          </div>
        </div>

        {/* Sorting & Filter Reset Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EDF2F7] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#647A98] font-semibold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-[#DCEBFA] bg-white text-xs font-medium cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
            </select>

            <span className="text-[#647A98] ml-2">
              Showing <strong className="text-[#102A50]">{filteredProducts.length}</strong> of{' '}
              {products.length} products
            </span>
          </div>

          {(searchQuery || selectedCategory !== 'all' || selectedBrand !== 'all' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedBrand('all');
                setSelectedStatus('all');
                setCurrentPage(1);
              }}
              className="text-[11px] font-bold text-[#0866E8] hover:underline cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Catalog Table Container */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-16 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse flex items-center px-4 justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="w-40 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-3 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="w-24 h-5 bg-slate-200 rounded" />
                <div className="w-16 h-5 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EDF6FF] border border-[#DCEBFA] mx-auto flex items-center justify-center text-[#0866E8] mb-3 shadow-xs">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#102A50]">No Products Found</h3>
            <p className="text-xs text-[#647A98] mt-1 max-w-sm mx-auto">
              No products match your current search and filter criteria. Try adjusting your filters or add a new product.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] hover:bg-[#EDF6FF]"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#0866E8] text-white text-xs font-bold hover:bg-[#0645B5]"
              >
                + Add Product
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF2F7] bg-[#F7FBFF] text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">Category &amp; Brand</th>
                  <th className="py-3.5 px-4 text-right">Price (PKR)</th>
                  <th className="py-3.5 px-4 text-center">Stock</th>
                  <th className="py-3.5 px-4 text-center">Publication Status</th>
                  <th className="py-3.5 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA] text-xs">
                {paginatedProducts.map((p) => {
                  const isToggling = togglingId === p.id;
                  const isStockCritical = p.stock <= 5;
                  const isStockLow = p.stock <= 15;

                  return (
                    <tr key={p.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                      {/* Product Thumbnail, Name, SKU */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl border border-[#DCEBFA] bg-white p-1 shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.image || '/categories/iphone.svg'}
                              alt={p.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#102A50] truncate max-w-[200px] sm:max-w-[280px]" title={p.name}>
                              {p.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[10px] text-[#647A98] bg-slate-100 px-1.5 py-0.5 rounded">
                                SKU: {p.sku || p.id}
                              </span>
                              {p.badge && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#EDF6FF] text-[#0866E8] border border-[#DCEBFA]">
                            {p.brand}
                          </span>
                          <p className="text-[11px] text-[#647A98] font-medium">
                            {p.categorySlug || p.category}
                          </p>
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <p className="font-black text-[#102A50]">
                          Rs. {Number(p.price || 0).toLocaleString('en-PK')}
                        </p>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <p className="text-[10px] text-[#647A98] line-through">
                            Rs. {Number(p.originalPrice).toLocaleString('en-PK')}
                          </p>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-full text-[11px] ${
                            isStockCritical
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isStockLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          <Boxes className="w-3 h-3" />
                          <span>{p.stock} units</span>
                        </span>
                      </td>

                      {/* Publication Status & Instant Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTogglePublication(p)}
                          disabled={isToggling}
                          title={p.inStock ? 'Click to unpublish from storefront' : 'Click to publish on storefront'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            p.inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {p.inStock ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-500" />
                              <span>Unpublished</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 pr-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => {
                              setViewingProduct(p);
                              setIsDetailsModalOpen(true);
                            }}
                            title="View details"
                            className="p-1.5 rounded-lg text-[#647A98] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit Product */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(p);
                              setIsFormModalOpen(true);
                            }}
                            title="Edit product"
                            className="p-1.5 rounded-lg text-[#647A98] hover:text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete / Archive Product */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingProduct(p);
                              setIsDeleteModalOpen(true);
                            }}
                            title="Delete or archive product"
                            className="p-1.5 rounded-lg text-[#647A98] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-[#DCEBFA] bg-[#F7FBFF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#647A98]">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-[#DCEBFA] bg-white cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#647A98]">
                Page <strong className="text-[#102A50]">{currentPage}</strong> of{' '}
                <strong className="text-[#102A50]">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-[#DCEBFA] bg-white text-[#102A50] hover:bg-[#EDF6FF] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-[#DCEBFA] bg-white text-[#102A50] hover:bg-[#EDF6FF] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        product={editingProduct}
        categories={categories}
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        product={viewingProduct}
        onEdit={(p) => {
          setEditingProduct(p);
          setIsFormModalOpen(true);
        }}
      />

      <ProductDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={deletingProduct}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
