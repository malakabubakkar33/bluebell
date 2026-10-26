'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '@/types';
import {
  Boxes,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Package,
  Plus,
  Minus,
  Save,
  SlidersHorizontal,
  ExternalLink,
  Tag,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local draft edits for stock count: { [productId]: number }
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [brandFilter, setBrandFilter] = useState('all');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchInventory = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/products?status=all', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        // Initialize drafts
        const initialDrafts: Record<string, number> = {};
        data.data.forEach((p: Product) => {
          initialDrafts[p.id] = p.stock || 0;
        });
        setStockDrafts(initialDrafts);
      }
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      showToast('error', 'Failed to fetch inventory from database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Handle draft change
  const handleStockDraftChange = (productId: string, newValue: number) => {
    const val = Math.max(0, newValue);
    setStockDrafts((prev) => ({ ...prev, [productId]: val }));
  };

  // Quick delta (+5, +10, -1, +1)
  const handleAdjustDraft = (productId: string, delta: number) => {
    setStockDrafts((prev) => {
      const current = prev[productId] !== undefined ? prev[productId] : 0;
      return { ...prev, [productId]: Math.max(0, current + delta) };
    });
  };

  // Save updated stock to Supabase DB
  const handleSaveStock = async (product: Product) => {
    const newStock = stockDrafts[product.id];
    if (newStock === undefined) return;

    setSavingId(product.id);
    try {
      const inStock = newStock > 0;
      const res = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock: newStock,
          inStock,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update stock');
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock, inStock } : p))
      );
      showToast('success', `Stock for "${product.name}" updated to ${newStock} units.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save stock update.');
    } finally {
      setSavingId(null);
    }
  };

  // Brands list
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [products]);

  // Statistics
  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const lowStockCount = products.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 15).length;
    const outOfStockCount = products.filter((p) => (p.stock || 0) === 0).length;
    const totalValue = products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0);

    return { totalItems, totalUnits, lowStockCount, outOfStockCount, totalValue };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Stock filter
      const stock = p.stock || 0;
      if (stockFilter === 'in-stock' && stock === 0) return false;
      if (stockFilter === 'low-stock' && (stock === 0 || stock > 15)) return false;
      if (stockFilter === 'out-of-stock' && stock > 0) return false;

      // Brand filter
      if (brandFilter !== 'all' && p.brand?.toLowerCase() !== brandFilter.toLowerCase()) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesBrand = p.brand?.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesSku) return false;
      }

      return true;
    });
  }, [products, stockFilter, brandFilter, searchQuery]);

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
            <Boxes className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Inventory &bull; Live Stock Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            Real-time stock counts, threshold alerts, and instant database replenishment for Blue Bells catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchInventory(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0866E8] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Stock'}</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Total Stock Units</span>
            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50] mt-2">
            {loading ? '...' : stats.totalUnits.toLocaleString('en-PK')}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">Across {stats.totalItems} catalog devices</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {loading ? '...' : stats.lowStockCount}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">&le; 15 units remaining</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {loading ? '...' : stats.outOfStockCount}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">Needs immediate restock</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Inventory Value</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {loading ? '...' : `Rs. ${(stats.totalValue / 1000000).toFixed(2)}M`}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">Total warehouse retail worth</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#DCEBFA] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8EA0B8]" />
          <input
            type="text"
            placeholder="Search by device name, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-medium text-[#102A50] placeholder-[#8EA0B8] focus:outline-none focus:border-[#0866E8] focus:ring-2 focus:ring-[#0866E8]/10 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Stock Filter */}
          <div className="flex items-center gap-1 bg-[#F7FBFF] p-1 rounded-xl border border-[#DCEBFA]">
            {(['all', 'in-stock', 'low-stock', 'out-of-stock'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStockFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  stockFilter === filter
                    ? 'bg-[#0866E8] text-white shadow-xs'
                    : 'text-[#647A98] hover:text-[#102A50]'
                }`}
              >
                {filter.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#102A50] bg-white focus:outline-none focus:border-[#0866E8]"
          >
            <option value="all">All Brands</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse flex items-center justify-between px-6">
                <div className="w-56 h-5 bg-slate-200 rounded" />
                <div className="w-24 h-5 bg-slate-200 rounded" />
                <div className="w-32 h-5 bg-slate-200 rounded" />
                <div className="w-28 h-5 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EDF6FF] text-[#0866E8] mx-auto flex items-center justify-center mb-4">
              <Boxes className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#102A50]">No Inventory Items Found</h3>
            <p className="text-xs text-[#647A98] mt-1 max-w-sm mx-auto">
              No devices match your search or active stock filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF2F7] bg-[#F7FBFF] text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                  <th className="py-4 px-6">Product &amp; SKU</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6 text-center">Adjust Units</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA] text-xs">
                {filteredProducts.map((p) => {
                  const currentStock = p.stock || 0;
                  const draftStock = stockDrafts[p.id] !== undefined ? stockDrafts[p.id] : currentStock;
                  const hasChanged = draftStock !== currentStock;

                  const isLow = currentStock > 0 && currentStock <= 15;
                  const isOut = currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                      {/* Product image & title */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 border border-[#DCEBFA] overflow-hidden flex items-center justify-center shrink-0 p-1">
                            <Image
                              src={p.image || '/categories/iphone.svg'}
                              alt={p.name}
                              width={48}
                              height={48}
                              className="object-contain w-full h-full"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-[#102A50] truncate">{p.name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-[#647A98] mt-0.5">
                              <span className="font-semibold text-[#0866E8]">{p.brand}</span>
                              {p.sku && <span className="font-mono">&bull; SKU: {p.sku}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 font-bold text-[#102A50] whitespace-nowrap">
                        Rs. {Number(p.price || 0).toLocaleString('en-PK')}
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            Out of Stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Low Stock ({currentStock})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            In Stock ({currentStock})
                          </span>
                        )}
                      </td>

                      {/* Quick Stepper Adjuster */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center border border-[#DCEBFA] rounded-xl bg-white overflow-hidden shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleAdjustDraft(p.id, -1)}
                            className="p-2 text-[#647A98] hover:bg-[#EDF6FF] hover:text-[#102A50] transition-colors"
                            title="Decrease 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={draftStock}
                            onChange={(e) => handleStockDraftChange(p.id, parseInt(e.target.value) || 0)}
                            className="w-16 text-center text-xs font-black text-[#102A50] border-x border-[#DCEBFA] py-1.5 focus:outline-none focus:bg-[#EDF6FF]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAdjustDraft(p.id, 1)}
                            className="p-2 text-[#647A98] hover:bg-[#EDF6FF] hover:text-[#102A50] transition-colors"
                            title="Increase 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustDraft(p.id, 10)}
                            className="px-2 py-1 text-[10px] font-bold text-[#0866E8] bg-[#EDF6FF] hover:bg-[#DCEBFA] border-l border-[#DCEBFA] transition-colors"
                            title="Quick add +10"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Save Action */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSaveStock(p)}
                          disabled={savingId === p.id || !hasChanged}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            hasChanged
                              ? 'bg-[#0866E8] hover:bg-[#0756C4] text-white shadow-sm shadow-[#0866E8]/20'
                              : 'bg-slate-100 text-[#8EA0B8] cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingId === p.id ? 'Saving...' : hasChanged ? 'Save Stock' : 'Saved'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-[#F7FBFF] border-t border-[#DCEBFA] flex items-center justify-between text-xs text-[#647A98]">
          <span>
            Displaying <strong className="text-[#102A50]">{filteredProducts.length}</strong> inventory products
          </span>
          <span className="font-mono text-[11px] text-[#0866E8]">
            Database sync: public.products &bull; stock_count
          </span>
        </div>
      </div>
    </div>
  );
}
