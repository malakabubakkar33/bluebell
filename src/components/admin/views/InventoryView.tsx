'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  AlertTriangle,
  Edit2,
  CheckCircle2,
  Package,
  Plus,
  X,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { doesProductBelongToCategory } from '@/lib/categoryUtils';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reserved: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
  category: string;
  categorySlug?: string;
  brand?: string;
}

interface InventoryViewProps {
  productsList: Product[];
  categoriesList?: Category[];
  onQuickUpdateStock: (productId: string, newStock: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  productsList,
  categoriesList = [],
  onQuickUpdateStock,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);
  const [skuInput, setSkuInput] = useState<string>('');

  // Inventory purely calculated from authoritative products catalog
  const allItems = useMemo(() => {
    return (productsList || []).map((p, i) => {
      const stock = p.stock ?? 10;
      let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
      if (stock <= 0) status = 'Out of Stock';
      else if (stock <= 3) status = 'Low Stock';

      return {
        id: p.id,
        name: p.name,
        sku: p.sku || `${(p.brand || 'BB').slice(0, 3).toUpperCase()}-${Math.floor(100 + i * 20)}`,
        stock,
        reserved: 0,
        status,
        image: p.image || '/categories/iphone.svg',
        category: p.category || p.categorySlug,
        categorySlug: p.categorySlug,
        brand: p.brand,
      };
    });
  }, [productsList]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        categoryFilter === 'all' ||
        doesProductBelongToCategory(item.categorySlug, item.brand, categoryFilter);
      const matchLow = lowStockOnly ? item.stock <= 5 : true;
      return matchSearch && matchCat && matchLow;
    });
  }, [allItems, search, categoryFilter, lowStockOnly]);

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setStockInput(item.stock);
    setSkuInput(item.sku);
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const newStock = Number(stockInput);
    onQuickUpdateStock(editingItem.id, newStock);
    setEditingItem(null);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Product,SKU,Stock,Reserved,Status', ...filteredItems.map((i) => `"${i.name}","${i.sku}",${i.stock},${i.reserved},"${i.status}"`)].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bluebell_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Inventory &amp; Stock Levels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time stock monitoring, SKU identifiers, and inventory restocking.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* 2. Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or SKU..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 outline-none"
          >
            <option value="all">All Categories ({allItems.length})</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name} ({cat.itemCount || 0})
              </option>
            ))}
          </select>

          {/* Low Stock Toggle Switch */}
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/30"
            />
            <span>Low Stock (&le; 5)</span>
          </label>
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold border-b border-slate-200/70 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU Code</th>
                <th className="py-3.5 px-4">Available Units</th>
                <th className="py-3.5 px-4">Reserved</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Product */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-3 px-4 font-mono text-xs text-slate-500">{item.sku}</td>

                  {/* Stock */}
                  <td className="py-3 px-4 font-black text-slate-900 text-sm">
                    {item.stock}
                  </td>

                  {/* Reserved */}
                  <td className="py-3 px-4 text-slate-500">{item.reserved}</td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        item.status === 'In Stock'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : item.status === 'Low Stock'
                          ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                      title="Adjust stock"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Adjust Stock</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Edit Stock Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                Adjust Stock: {editingItem.name}
              </h3>
              <button onClick={() => setEditingItem(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">SKU Identifier</label>
                <input
                  type="text"
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono uppercase text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Available Units in Stock</label>
                <input
                  type="number"
                  value={stockInput}
                  onChange={(e) => setStockInput(Number(e.target.value))}
                  min={0}
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-base font-black text-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
