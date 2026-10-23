'use client';

import React, { useState } from 'react';
import { Plus, Tag, Trash2, Edit2, X, CheckCircle2 } from 'lucide-react';

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
  const [coupons, setCoupons] = useState<CouponItem[]>([
    {
      code: 'BLUEBELL10',
      discount: '10% OFF',
      type: 'Percentage',
      minSpend: 'Rs. 50,000',
      expiry: 'Dec 31, 2026',
      used: 34,
      status: 'Active',
    },
    {
      code: 'EIDSPECIAL',
      discount: 'Rs. 5,000 Flat',
      type: 'Fixed Amount',
      minSpend: 'Rs. 100,000',
      expiry: 'Nov 30, 2026',
      used: 18,
      status: 'Active',
    },
    {
      code: 'WELCOME2026',
      discount: '5% OFF',
      type: 'Percentage',
      minSpend: 'None',
      expiry: 'Dec 31, 2026',
      used: 92,
      status: 'Active',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);

  const [formCode, setFormCode] = useState('');
  const [formDiscount, setFormDiscount] = useState('');
  const [formType, setFormType] = useState('Percentage');
  const [formMinSpend, setFormMinSpend] = useState('Rs. 25,000');
  const [formExpiry, setFormExpiry] = useState('Dec 31, 2026');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormDiscount('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formDiscount) return;

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.code === editingCoupon.code
            ? {
                ...c,
                code: formCode.toUpperCase(),
                discount: formDiscount,
                type: formType,
                minSpend: formMinSpend,
                expiry: formExpiry,
                status: formStatus,
              }
            : c
        )
      );
    } else {
      setCoupons((prev) => [
        ...prev,
        {
          code: formCode.toUpperCase(),
          discount: formDiscount,
          type: formType,
          minSpend: formMinSpend,
          expiry: formExpiry,
          used: 0,
          status: formStatus,
        },
      ]);
    }

    setShowModal(false);
  };

  const handleDelete = (code: string) => {
    if (confirm(`Delete coupon "${code}"?`)) {
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    }
  };

  const toggleStatus = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.code === code ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Coupons &amp; Discounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create promotional codes and discount campaigns.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold border-b border-slate-200/70 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Min Spend</th>
                <th className="py-3.5 px-4">Used Count</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{c.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.discount}</td>
                  <td className="py-3.5 px-4 text-slate-500">{c.type}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.minSpend}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{c.used} times</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleStatus(c.code)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit coupon"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="e.g. FLASH20"
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono uppercase text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Discount Amount *</label>
                <input
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  placeholder="e.g. 15% OFF or Rs. 3,000"
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800"
                  >
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed Amount">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-800 font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                  {editingCoupon ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
