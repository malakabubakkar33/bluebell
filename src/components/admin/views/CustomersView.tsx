'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Trash2,
  Edit2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { UserProfile } from '@/context/AuthContext';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders_count: number;
  status: 'active' | 'suspended';
  role?: 'customer' | 'admin';
}

interface CustomersViewProps {
  usersList?: UserProfile[];
  onAddCustomer?: (user: any) => void;
  onUpdateCustomer?: (userId: string, updates: any) => void;
  onUpdateStatus?: (userId: string, newStatus: 'active' | 'suspended') => void;
  onDeleteCustomer?: (userId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  usersList = [],
  onAddCustomer,
  onUpdateCustomer,
  onUpdateStatus,
  onDeleteCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Local state initialized from usersList
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    if (usersList && usersList.length > 0) {
      return usersList.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        orders_count: u.orders_count || 0,
        status: u.status,
        role: u.role,
      }));
    }
    return [];
  });

  React.useEffect(() => {
    if (usersList && usersList.length > 0) {
      setCustomers(
        usersList.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          orders_count: u.orders_count || 0,
          status: u.status,
          role: u.role,
        }))
      );
    }
  }, [usersList]);

  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended'>('active');
  const [formRole, setFormRole] = useState<'customer' | 'admin'>('customer');

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('+92 300 ');
    setFormStatus('active');
    setFormRole('customer');
    setShowModal(true);
  };

  const handleOpenEdit = (c: CustomerRecord) => {
    setEditingCustomer(c);
    setFormName(c.name);
    setFormEmail(c.email);
    setFormPhone(c.phone);
    setFormStatus(c.status);
    setFormRole(c.role || 'customer');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id
            ? {
                ...c,
                name: formName,
                email: formEmail,
                phone: formPhone,
                status: formStatus,
                role: formRole,
              }
            : c
        )
      );
      if (onUpdateCustomer) {
        onUpdateCustomer(editingCustomer.id, {
          name: formName,
          email: formEmail,
          phone: formPhone,
          status: formStatus,
          role: formRole,
        });
      }
    } else {
      const newCust: CustomerRecord = {
        id: `c-${Date.now()}`,
        name: formName,
        email: formEmail,
        phone: formPhone,
        orders_count: 0,
        status: formStatus,
        role: formRole,
      };
      setCustomers((prev) => [newCust, ...prev]);
      if (onAddCustomer) {
        onAddCustomer(newCust);
      }
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer account "${name}"?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      if (onDeleteCustomer) {
        onDeleteCustomer(id);
      }
    }
  };

  const toggleStatus = (id: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updatedStatus = c.status === 'active' ? 'suspended' : 'active';
          if (onUpdateStatus) onUpdateStatus(id, updatedStatus);
          return { ...c, status: updatedStatus };
        }
        return c;
      })
    );
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View, add, edit, and moderate registered customer accounts.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* 2. Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search customers by name, phone or email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>
      </div>

      {/* 3. Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold border-b border-slate-200/70 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-bold text-slate-700">0 Customers</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Customer data has been reset to 0. Registered customer accounts will appear here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{c.email}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{c.phone}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{c.orders_count} orders</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          c.status === 'active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                        }`}
                      >
                        {c.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-sky-50 transition-colors"
                          title="Edit customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-sky-50 transition-colors"
                          title="Toggle status"
                        >
                          {c.status === 'active' ? (
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <UserX className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete customer"
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

        {/* 4. Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of{' '}
            {filteredCustomers.length} customers
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded-lg font-bold text-xs ${
                  currentPage === pg ? 'bg-brand-500 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Muhammad Bilal"
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="bilal@example.com"
                  required
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  {editingCustomer ? 'Save Changes' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
