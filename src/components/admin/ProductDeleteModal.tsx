'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert } from 'lucide-react';

interface ProductDeleteModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string) => Promise<void>;
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onConfirm(product.id);
      onClose();
    } catch (err: any) {
      console.error('Delete product error:', err);
      setError(err.message || 'Failed to delete product from database.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-[#102A50]">Delete or Archive Product?</h3>
          <p className="text-xs text-[#647A98] mt-1.5 leading-relaxed">
            Are you sure you want to remove <strong className="text-[#102A50]">{product.name}</strong> ({product.sku || product.id}) from the catalog?
          </p>

          {/* Product Pill */}
          <div className="my-4 p-3 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA] flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#DCEBFA] p-1 flex items-center justify-center shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image || '/categories/iphone.svg'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#102A50] truncate">{product.name}</p>
              <p className="text-[11px] font-mono text-[#647A98]">
                Rs. {Number(product.price || 0).toLocaleString('en-PK')} • Stock: {product.stock}
              </p>
            </div>
          </div>

          {/* Historical Order Safety Notice */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Data Protection Rule:</strong> If this product is referenced in historical customer orders, it will be safely <em>archived and unpublished</em> to protect historical checkout records. If unreferenced, it will be deleted.
            </p>
          </div>

          {error && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#DCEBFA] bg-[#F7FBFF] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-white hover:text-[#102A50] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {deleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Removal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
