'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Check,
  X,
  AlertCircle,
  Tag,
  DollarSign,
  PackageCheck,
  PackageX,
} from 'lucide-react';
import { Product, Category } from '@/types';
import { doesProductBelongToCategory } from '@/lib/categoryUtils';

interface ProductsViewProps {
  productsList: Product[];
  categoriesList?: Category[];
  onAddProduct: () => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string, name: string) => void;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  productsList,
  categoriesList = [],
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Inline Quick Price Edit State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  const startEditPrice = (p: Product) => {
    setEditingPriceId(p.id);
    setTempPrice(p.price);
  };

  const saveQuickPrice = (productId: string) => {
    if (onUpdateProduct && tempPrice > 0) {
      onUpdateProduct(productId, { price: Number(tempPrice) });
    }
    setEditingPriceId(null);
  };

  const toggleStockStatus = (p: Product) => {
    if (!onUpdateProduct) return;
    const isCurrentlyOut = (p.stock ?? 10) <= 0;
    const newStock = isCurrentlyOut ? 10 : 0;
    onUpdateProduct(p.id, { stock: newStock });
  };

  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    productsList.forEach((p) => {
      if (p.brand) set.add(p.brand);
    });
    return Array.from(set).sort();
  }, [productsList]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        selectedCategory === 'all' ||
        doesProductBelongToCategory(p.categorySlug, p.brand, selectedCategory);

      const matchBrand =
        selectedBrand === 'all' || p.brand.toLowerCase() === selectedBrand.toLowerCase();

      const isOut = (p.stock ?? 10) <= 0;
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'in_stock' && !isOut) ||
        (stockFilter === 'out_of_stock' && isOut);

      return matchSearch && matchCat && matchBrand && matchStock;
    });
  }, [productsList, search, selectedCategory, selectedBrand, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5">
      {/* 1. Header with Title & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Store Products Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Set custom prices (high/low), manage instant stock/out-of-stock status, and synchronize live with storefront.
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-500/25 transition-all self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* 2. Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by title, brand, or category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-44">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">All Categories ({productsList.length})</option>
            {categoriesList.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name} ({cat.itemCount || 0})
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="w-full md:w-40">
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">All Brands ({availableBrands.length})</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="w-full md:w-44">
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">All Stock Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Only</option>
          </select>
        </div>
      </div>

      {/* 3. Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold border-b border-slate-200/70 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Price (PKR)</th>
                <th className="py-3.5 px-4">Stock Availability</th>
                <th className="py-3.5 px-4 text-center">Quick Stock Toggle</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isOut = (p.stock ?? 10) <= 0;
                  const isEditingPrice = editingPriceId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Image */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100/80 p-1.5 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <img
                            src={p.image}
                            alt={p.name}
                            className={`w-full h-full object-contain ${isOut ? 'grayscale-[60%]' : ''}`}
                          />
                        </div>
                      </td>

                      {/* Product Name */}
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                        <div className="truncate">{p.name}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {p.category}
                          </span>
                          {p.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-sky-100 text-sky-700">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-4 text-slate-600 font-semibold">{p.brand}</td>

                      {/* Price with Inline Quick Editor */}
                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {isEditingPrice ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-500">Rs.</span>
                            <input
                              type="number"
                              value={tempPrice}
                              onChange={(e) => setTempPrice(Number(e.target.value))}
                              className="w-28 px-2 py-1 text-xs border border-sky-400 rounded-lg bg-sky-50 font-bold focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => saveQuickPrice(p.id)}
                              className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                              title="Save price"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingPriceId(null)}
                              className="p-1 rounded-md bg-slate-200 text-slate-600 hover:bg-slate-300"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span>Rs. {p.price.toLocaleString()}</span>
                            <button
                              onClick={() => startEditPrice(p)}
                              title="Quick edit price"
                              className="opacity-0 group-hover:opacity-100 p-1 text-sky-600 hover:bg-sky-50 rounded transition-opacity"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            Rs. {p.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Stock Quantity / Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-200/70 animate-pulse">
                            <PackageX className="w-3 h-3" />
                            <span>Out of Stock (0)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/70">
                            <PackageCheck className="w-3 h-3" />
                            <span>In Stock ({p.stock || 10})</span>
                          </span>
                        )}
                      </td>

                      {/* Quick 1-Click Stock Toggle */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => toggleStockStatus(p)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-black transition-all ${
                            isOut
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {isOut ? 'Mark In Stock' : 'Mark Out of Stock'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Edit full product details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p.id, p.name)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
            {filteredProducts.length} products
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg font-bold text-xs cursor-pointer ${
                  currentPage === pg
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
