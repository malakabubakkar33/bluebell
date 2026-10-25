'use client';

import React from 'react';
import { AlertTriangle, Package, CheckCircle2, XCircle } from 'lucide-react';

export interface LowStockProduct {
  id: string;
  name: string;
  brand?: string;
  category_slug?: string;
  price: number;
  stock_count: number;
  in_stock: boolean;
  image?: string;
}

interface LowStockAlertTableProps {
  products: LowStockProduct[];
  loading: boolean;
  threshold: number;
}

export const LowStockAlertTable: React.FC<LowStockAlertTableProps> = ({
  products,
  loading,
  threshold,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A50]">Low-Stock Inventory Alerts</h2>
              <p className="text-xs text-[#647A98]">
                Products with remaining stock &le; {threshold} units
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            {products.length} Products
          </span>
        </div>

        {loading ? (
          <div className="space-y-3 py-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-14 rounded-xl bg-slate-50 border border-slate-100 animate-pulse flex items-center px-4 justify-between"
              >
                <div className="w-36 h-4 bg-slate-200 rounded" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
                <div className="w-20 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-[#DCEBFA] bg-[#F7FBFF] text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCEBFA] mx-auto flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#102A50]">Stock Levels Healthy</h3>
            <p className="text-xs text-[#647A98] mt-1 max-w-sm mx-auto">
              All catalog items currently meet or exceed the inventory safety threshold of {threshold} units.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF2F7] text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                  <th className="py-3 pr-4">Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA] text-xs">
                {products.map((p) => {
                  const isCritical = p.stock_count <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-[#F7FBFF] transition-colors">
                      <td className="py-3.5 pr-4 font-semibold text-[#102A50]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-[#DCEBFA] flex items-center justify-center text-[#647A98] shrink-0 overflow-hidden">
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-4 h-4" />
                            )}
                          </div>
                          <span className="truncate max-w-[160px] sm:max-w-[200px]" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#647A98] whitespace-nowrap font-medium">
                        {p.brand || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center font-black font-mono px-2 py-0.5 rounded-full text-[11px] ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.stock_count} left
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#102A50] whitespace-nowrap">
                        Rs. {Number(p.price || 0).toLocaleString('en-PK')}
                      </td>
                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                        {p.in_stock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            Out of Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0F5FA] flex items-center justify-between text-[11px] text-[#647A98]">
        <span>Full catalog &amp; inventory editing arriving in Phase 4 &amp; Phase 8</span>
        <span className="font-mono text-[#0866E8]">Table: public.products</span>
      </div>
    </div>
  );
};
