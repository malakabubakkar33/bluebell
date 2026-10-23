'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, Trash2, Edit2, Plus, X } from 'lucide-react';

export interface ReviewItem {
  id: number | string;
  customer: string;
  product: string;
  rating: number;
  date: string;
  comment: string;
  status: 'Approved' | 'Pending';
}

export const ReviewsView: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 1,
      customer: 'Usman Tariq',
      product: 'iPhone 15 Pro Max',
      rating: 5,
      date: 'Apr 28, 2026',
      comment: '100% original PTA approved pin-packed device. Fast delivery in Islamabad within 24 hours!',
      status: 'Approved',
    },
    {
      id: 2,
      customer: 'Ayesha Khan',
      product: 'Samsung Galaxy S24 Ultra',
      rating: 5,
      date: 'Apr 27, 2026',
      comment: 'Super fast processing and official warranty verified on DIRBS PTA portal. Highly recommend Blue Bells.',
      status: 'Approved',
    },
    {
      id: 3,
      customer: 'Hamza Malik',
      product: 'Apple Watch Series 9',
      rating: 4,
      date: 'Apr 25, 2026',
      comment: 'Great watch, battery life is good, genuine packaging.',
      status: 'Approved',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);

  const [formCustomer, setFormCustomer] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState('');
  const [formStatus, setFormStatus] = useState<'Approved' | 'Pending'>('Approved');

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
    setFormCustomer(r.customer);
    setFormProduct(r.product);
    setFormRating(r.rating);
    setFormComment(r.comment);
    setFormStatus(r.status);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCustomer || !formComment) return;

    if (editingReview) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === editingReview.id
            ? {
                ...r,
                customer: formCustomer,
                product: formProduct,
                rating: Number(formRating),
                comment: formComment,
                status: formStatus,
              }
            : r
        )
      );
    } else {
      setReviews((prev) => [
        {
          id: Date.now(),
          customer: formCustomer,
          product: formProduct,
          rating: Number(formRating),
          date: 'Just now',
          comment: formComment,
          status: formStatus,
        },
        ...prev,
      ]);
    }

    setShowModal(false);
  };

  const deleteReview = (id: number | string) => {
    if (confirm('Delete this customer review?')) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const toggleStatus = (id: number | string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'Approved' ? 'Pending' : 'Approved' } : r
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Reviews &amp; Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Add, moderate, edit, and approve customer verified reviews.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {reviews.map((r) => (
            <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-slate-900">{r.customer}</span>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                    {r.product}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{r.comment}</p>
                <span className="text-[10px] text-slate-400">{r.date}</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => toggleStatus(r.id)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    r.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                      : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                  }`}
                >
                  {r.status}
                </button>
                <button
                  onClick={() => handleOpenEdit(r)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit review"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteReview(r.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingReview ? 'Edit Review' : 'Add Customer Review'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Name *</label>
                <input
                  value={formCustomer}
                  onChange={(e) => setFormCustomer(e.target.value)}
                  placeholder="e.g. Ali Ahmed"
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  value={formProduct}
                  onChange={(e) => setFormProduct(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max"
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Star Rating (1-5)</label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-bold"
                  >
                    <option value={5}>5 Stars (⭐⭐⭐⭐⭐)</option>
                    <option value={4}>4 Stars (⭐⭐⭐⭐)</option>
                    <option value={3}>3 Stars (⭐⭐⭐)</option>
                    <option value={2}>2 Stars (⭐⭐)</option>
                    <option value={1}>1 Star (⭐)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800 font-bold"
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
                  placeholder="Write customer review..."
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {editingReview ? 'Save Changes' : 'Create Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
