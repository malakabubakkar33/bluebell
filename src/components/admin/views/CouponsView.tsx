'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, Trash2, Edit2, X, CheckCircle2, Loader2 } from 'lucide-react';

export interface CouponItem {
  id?: string;
  code: string;
  discount: string;
  type: string;
  minSpend: string;
  expiry: string;
  used: number;
  status: 'Active' | 'Inactive';
}

export const CouponsView: React.FC = () => {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formType, setFormType] = useState('Percentage');
  const [formMinSpend, setFormMinSpend] = useState('Rs. 25,000');
  const [formExpiry, setFormExpiry] = useState('Dec 31, 2026');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const mapped = json.data.map((c: any) => ({
          id: c.id,
          code: c.code,
          discount: c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `Rs. ${Number(c.discount_value).toLocaleString()} Flat`,
          type: c.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount',
          minSpend: c.min_order > 0 ? `Rs. ${Number(c.min_order).toLocaleString()}` : 'None',
          expiry: c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : 'Dec 31, 2026',
          used: Number(c.used_count || 0),
          status: c.status === 'Active' ? 'Active' : 'Inactive',
        }));
        setCoupons(mapped);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormDiscount('10% OFF');
    setFormType('Percentage');
    setFormMinSpend('Rs. 25,000');
    setFormExpiry('Dec 31, 2026');
    setFormStatus('Active');
    setShowModal(true);
  };

  const handleOpenEdit = (c: CouponItem) => {
    setEditingCoupon(c);
    setFormCode(c.code);
    setFormDiscount(c.discount);
    setFormType(c.type);
    setFormMinSpend(c.minSpend);
    setFormExpiry(c.expiry);
    setFormStatus(c.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formDiscount) return;

    const discountVal = Number(formDiscount.replace(/[^0-9]/g, '')) || 10;
    const minOrderVal = Number(formMinSpend.replace(/[^0-9]/g, '')) || 0;
    const cleanType = formType.toLowerCase().includes('fixed') ? 'fixed' : 'percentage';

    if (editingCoupon && editingCoupon.id) {
      try {
        await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: formCode.toUpperCase().trim(),
            discount_type: cleanType,
            discount_value: discountVal,
            min_order: minOrderVal,
            status: formStatus,
          }),
        });
        await fetchCoupons();
      } catch (err) {
        console.error('Update coupon error:', err);
      }
    } else {
      try {
        await fetch('/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: formCode.toUpperCase().trim(),
            discount_type: cleanType,
            discount_value: discountVal,
            min_order: minOrderVal,
            status: formStatus,
          }),
        });
        await fetchCoupons();
      } catch (err) {
        console.error('Create coupon error:', err);
      }
    }

    setShowModal(false);
  };

  const handleDelete = async (c: CouponItem) => {
    if (confirm(`Delete coupon "${c.code}"?`)) {
      if (c.id) {
        try {
          await fetch(`/api/coupons/${c.id}`, { method: 'DELETE' });
        } catch (err) {
          console.error('Delete coupon error:', err);
        }
      }
      setCoupons((prev) => prev.filter((item) => item.code !== c.code));
    }
  };

  const toggleStatus = async (c: CouponItem) => {
    const nextStatus = c.status === 'Active' ? 'Inactive' : 'Active';
    setCoupons((prev) =>
      prev.map((item) => (item.code === c.code ? { ...item, status: nextStatus } : item))
    );
    if (c.id) {
      try {
        await fetch(`/api/coupons/${c.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: nextStatus }),
        });
      } catch (err) {
        console.error('Toggle coupon status error:', err);
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Coupons &amp; Discounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create promotional codes and discount campaigns backed by production database.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all self-start sm:self-auto active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#1877F2] mb-3" />
          <p className="text-xs font-semibold">Loading real coupons from database...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/70 p-12 text-center shadow-xs">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Coupons Configured</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Your store currently has 0 active vouchers. Click Add Coupon to configure your first promotional voucher.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-[#1877F2] hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-black text-sm tracking-wide text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {c.code}
                  </span>
                  <h3 className="text-lg font-black text-[#1877F2] mt-2.5">{c.discount}</h3>
                </div>

                <button
                  onClick={() => toggleStatus(c)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                    c.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {c.status}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-semibold text-slate-700">{c.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Min Spend:</span>
                  <span className="font-semibold text-slate-700">{c.minSpend}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span className="font-semibold text-slate-700">{c.expiry}</span>
                </div>
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span className="font-semibold text-slate-700">{c.used} times</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
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
                <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH2026"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="text"
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    placeholder="10% OFF or 5000 Flat"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Min Order Amount (PKR)</label>
                <input
                  type="text"
                  value={formMinSpend}
                  onChange={(e) => setFormMinSpend(e.target.value)}
                  placeholder="Rs. 25,000 or None"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
