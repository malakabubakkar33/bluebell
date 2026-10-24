'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Trash2, Edit2, Plus, X, MessageSquare, Loader2 } from 'lucide-react';

export interface ReviewItem {
  id: number | string;
  customer_name: string;
  product_name: string;
  rating: number;
  created_at?: string;
  comment: string;
  status: 'Approved' | 'Pending';
}

export const ReviewsView: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  const [formCustomer, setFormCustomer] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<'Approved' | 'Pending'>('Approved');

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReviews(json.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenAdd = () => {
    setEditingReview(null);
    setFormCustomer('');
    setFormProduct('iPhone 15 Pro Max');
    setFormRating(5);
    setFormComment('');
    setFormStatus('Approved');
    setShowModal(true);
  };

  const handleOpenEdit = (r: ReviewItem) => {
    setEditingReview(r);
    setFormCustomer(r.customer_name);
    setFormProduct(r.product_name);
    setFormRating(r.rating);
    setFormComment(r.comment);
    setFormStatus(r.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer || !formComment) return;

    if (editingReview && editingReview.id) {
      try {
        await fetch(`/api/reviews/${editingReview.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: formCustomer,
            product_name: formProduct,
            rating: Number(formRating),
            comment: formComment,
            status: formStatus,
          }),
        });
        await fetchReviews();
      } catch (err) {
        console.error('Update review error:', err);
      }
    } else {
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_name: formCustomer,
            product_name: formProduct,
            rating: Number(formRating),
            comment: formComment,
            status: formStatus,
          }),
        });
        await fetchReviews();
      } catch (err) {
        console.error('Create review error:', err);
      }
    }

    setShowModal(false);
  };

  const handleDelete = async (r: ReviewItem) => {
    if (confirm(`Delete review from "${r.customer_name}"?`)) {
      if (r.id) {
        try {
          await fetch(`/api/reviews/${r.id}`, { method: 'DELETE' });
        } catch (err) {
          console.error('Delete review error:', err);
        }
      }
      setReviews((prev) => prev.filter((item) => item.id !== r.id));
    }
  };

  const toggleStatus = async (r: ReviewItem) => {
    const nextStatus = r.status === 'Approved' ? 'Pending' : 'Approved';
    setReviews((prev) =>
      prev.map((item) => (item.id === r.id ? { ...item, status: nextStatus } : item))
    );
    if (r.id) {
      try {
        await fetch(`/api/reviews/${r.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch (err) {
        console.error('Toggle review status error:', err);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Reviews
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor, approve, and manage customer feedback synced directly with PostgreSQL.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#1877F2] mb-3" />
          <p className="text-xs font-semibold">Loading verified reviews from database...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-xs">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Customer Reviews Yet (0 Reviews)</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Reviews submitted by customers on the storefront will appear here for verification and approval.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-[#1877F2] hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Add Initial Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{r.customer_name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{r.product_name}</p>
                  </div>

                  <button
                    onClick={() => toggleStatus(r)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                      r.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {r.status}
                  </button>
                </div>

                <div className="flex items-center gap-1 my-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1.5">{r.rating}.0</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic line-clamp-3">
                  "{r.comment}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recent'}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(r)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-black text-base text-slate-900">
                {editingReview ? 'Edit Review' : 'Add Customer Review'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  placeholder="e.g. Usman Tariq"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                  placeholder="e.g. iPhone 16 Pro Max"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                    <option value={2}>⭐⭐ (2 Stars)</option>
                    <option value={1}>⭐ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Comment *</label>
                <textarea
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  rows={3}
                  placeholder="Write the customer's feedback..."
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  {editingReview ? 'Save Changes' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
