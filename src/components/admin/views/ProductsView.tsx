'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { Product } from '@/types';

interface ProductsViewProps {
  productsList: Product[];
  onAddProduct: () => void;
  onEditProduct: (p: Product) => void;
  onDeleteProduct: (id: string, name: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  productsList,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter products
  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        selectedCategory === 'all' ||
        p.categorySlug === selectedCategory ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchBrand =
        selectedBrand === 'all' || p.brand.toLowerCase() === selectedBrand.toLowerCase();

      return matchSearch && matchCat && matchBrand;
    });
  }, [productsList, search, selectedCategory, selectedBrand]);

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
            Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your store products and inventory.
          </p>
        </div>

        <button
          onClick={onAddProduct}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
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
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="iphone">iPhone</option>
            <option value="samsung">Samsung</option>
            <option value="ipad">iPad</option>
            <option value="smart-watches">Smart Watches</option>
            <option value="accessories">Accessories</option>
          </select>
        </div>

        {/* Brand Filter */}
        <div className="w-full md:w-44">
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">All Brands</option>
            <option value="apple">Apple</option>
            <option value="samsung">Samsung</option>
            <option value="google">Google</option>
            <option value="xiaomi">Xiaomi</option>
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
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
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
                paginatedProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Image */}
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100/80 p-1.5 border border-slate-200 flex items-center justify-center flex-shrink-0">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </td>

                    {/* Product Name */}
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                      <div>{p.name}</div>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {p.category}
                      </span>
                    </td>

                    {/* Brand */}
                    <td className="py-3 px-4 text-slate-600 font-medium">{p.brand}</td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      Rs. {p.price.toLocaleString()}
                    </td>

                    {/* Stock */}
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold ${
                          (p.stock || 10) <= 3
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {p.stock || 10}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditProduct(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg font-bold text-xs ${
                  currentPage === pg
                    ? 'bg-[#1877F2] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
