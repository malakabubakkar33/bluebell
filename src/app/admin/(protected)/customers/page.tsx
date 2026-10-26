'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  ExternalLink,
  MessageSquare,
  Edit2,
  Trash2,
  X,
  Eye,
  Filter,
} from 'lucide-react';

interface AppUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  whatsapp?: string;
  city?: string;
  address?: string;
  role?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all');

  // Customer Detail / Edit Modal
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AppUser>>({});
  const [savingUser, setSavingUser] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Delete Confirmation
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<boolean>(false);

  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auth/users?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (err: any) {
      console.error('[AdminCustomers] Fetch error:', err);
      setError(err.message || 'An unexpected error occurred while loading customers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Status Toggle (Active / Suspended)
  const handleToggleStatus = async (user: AppUser) => {
    const newStatus = (user.status || 'active').toLowerCase() === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user status');
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setActionSuccess(`Customer status changed to ${newStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Error updating user status: ${err.message}`);
    }
  };

  // Handle Save User Details
  const handleSaveUserDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSavingUser(true);

    try {
      const res = await fetch('/api/auth/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update customer details');
      }

      const updated = data.user || { ...selectedUser, ...editFormData };
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? updated : u)));
      setSelectedUser(updated);
      setActionSuccess('Customer details updated successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Error saving customer: ${err.message}`);
    } finally {
      setSavingUser(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUser(true);

    try {
      const res = await fetch(`/api/auth/users?id=${encodeURIComponent(userToDelete.id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete customer');
      }

      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      setUserToDelete(null);
      setActionSuccess('Customer account removed successfully');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(`Error deleting customer: ${err.message}`);
    } finally {
      setDeletingUser(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Status filter
      if (statusFilter !== 'all') {
        const userStatus = (u.status || 'active').toLowerCase();
        if (statusFilter === 'active' && userStatus !== 'active') return false;
        if (statusFilter === 'suspended' && userStatus !== 'suspended' && userStatus !== 'inactive') return false;
      }

      // Role filter
      if (roleFilter !== 'all') {
        const userRole = (u.role || 'customer').toLowerCase();
        if (roleFilter !== userRole) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (u.name || '').toLowerCase().includes(q);
        const matchesEmail = (u.email || '').toLowerCase().includes(q);
        const matchesPhone = (u.phone || '').toLowerCase().includes(q);
        const matchesCity = (u.city || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesCity) return false;
      }

      return true;
    });
  }, [users, statusFilter, roleFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const customers = users.filter((u) => (u.role || 'customer').toLowerCase() === 'customer').length;
    const active = users.filter((u) => (u.status || 'active').toLowerCase() === 'active').length;
    const suspended = users.filter((u) => {
      const s = (u.status || '').toLowerCase();
      return s === 'suspended' || s === 'inactive';
    }).length;
    return { total, customers, active, suspended };
  }, [users]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#DCEBFA]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-black uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-[#0866E8]" />
            <span>Customer Directory &bull; PostgreSQL App Users</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102A50] tracking-tight">
            Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-[#647A98] mt-1">
            View registered shopper profiles, contact information, order activity, and account status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] text-xs font-bold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0866E8] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Customers'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Failed to load customer accounts</h4>
              <p className="text-xs text-rose-700 mt-0.5 font-mono">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchUsers(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Total Accounts</span>
            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#102A50] mt-2">
            {loading ? '...' : stats.total}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">All registered profiles</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Shoppers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">
            {loading ? '...' : stats.customers}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">Customer role users</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Active Status</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {loading ? '...' : stats.active}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">Healthy verified status</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-[#647A98]">Suspended</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">
            {loading ? '...' : stats.suspended}
          </p>
          <span className="text-[11px] text-[#647A98] font-medium">Disabled or blocked</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#DCEBFA] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8EA0B8]" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DCEBFA] text-xs font-medium text-[#102A50] placeholder-[#8EA0B8] focus:outline-none focus:border-[#0866E8] focus:ring-2 focus:ring-[#0866E8]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8EA0B8] hover:text-[#102A50]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#F7FBFF] p-1 rounded-xl border border-[#DCEBFA]">
            {(['all', 'active', 'suspended'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === filter
                    ? 'bg-[#0866E8] text-white shadow-xs'
                    : 'text-[#647A98] hover:text-[#102A50]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#F7FBFF] p-1 rounded-xl border border-[#DCEBFA]">
            {(['all', 'customer', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-[#102A50] text-white shadow-xs'
                    : 'text-[#647A98] hover:text-[#102A50]'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse flex items-center justify-between px-6">
                <div className="w-48 h-5 bg-slate-200 rounded" />
                <div className="w-32 h-5 bg-slate-200 rounded" />
                <div className="w-20 h-5 bg-slate-200 rounded" />
                <div className="w-24 h-5 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EDF6FF] text-[#0866E8] mx-auto flex items-center justify-center mb-4">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#102A50]">No Customers Found</h3>
            <p className="text-xs text-[#647A98] mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'No customer records match your active search and filter criteria.'
                : 'No users have registered yet on the Blue Bells Mobile Shop storefront.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF2F7] bg-[#F7FBFF] text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Contact &amp; Location</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA] text-xs">
                {filteredUsers.map((user) => {
                  const isActive = (user.status || 'active').toLowerCase() === 'active';
                  const isAdmin = (user.role || '').toLowerCase() === 'admin';

                  return (
                    <tr key={user.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 ${
                            isAdmin ? 'bg-[#102A50] text-white' : 'bg-[#0866E8] text-white'
                          }`}>
                            {(user.name || user.email).charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#102A50] truncate">
                              {user.name || 'Unnamed Customer'}
                            </p>
                            <p className="text-[11px] text-[#647A98] font-mono truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact & City */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[#102A50]">
                            <Phone className="w-3.5 h-3.5 text-[#647A98]" />
                            <span className="font-mono text-[11px]">{user.phone || 'No Phone'}</span>
                            {user.whatsapp && (
                              <a
                                href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Open WhatsApp chat"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#647A98]">
                            <MapPin className="w-3 h-3" />
                            <span>{user.city || 'No city specified'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-[#102A50] text-white'
                            : 'bg-[#EDF6FF] text-[#0866E8] border border-[#DCEBFA]'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.role || 'customer'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle status"
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Suspended
                            </>
                          )}
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-[#647A98] font-mono text-[11px] whitespace-nowrap">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditFormData({
                                name: user.name || '',
                                phone: user.phone || '',
                                whatsapp: user.whatsapp || '',
                                city: user.city || '',
                                address: user.address || '',
                                role: user.role || 'customer',
                                status: user.status || 'active',
                              });
                            }}
                            className="p-1.5 rounded-lg border border-[#DCEBFA] text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                            title="View and Edit Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-[#F7FBFF] border-t border-[#DCEBFA] flex items-center justify-between text-xs text-[#647A98]">
          <span>
            Showing <strong className="text-[#102A50]">{filteredUsers.length}</strong> of{' '}
            <strong className="text-[#102A50]">{users.length}</strong> customers
          </span>
          <span className="font-mono text-[11px] text-[#0866E8]">
            Database source: public.app_users &bull; Supabase Auth
          </span>
        </div>
      </div>

      {/* Profile & Edit Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="p-6 border-b border-[#DCEBFA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0866E8] text-white flex items-center justify-center text-sm font-black uppercase">
                  {(selectedUser.name || selectedUser.email).charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#102A50]">
                    {selectedUser.name || 'Customer Profile'}
                  </h3>
                  <p className="text-xs text-[#647A98] font-mono">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-[#647A98] hover:text-[#102A50] hover:bg-[#EDF6FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserDetails} className="p-6 space-y-4">
              {/* Account Meta Bar */}
              <div className="p-3 rounded-xl bg-[#F7FBFF] border border-[#DCEBFA] flex items-center justify-between text-xs">
                <span className="text-[#647A98]">
                  User ID: <strong className="font-mono text-[#102A50]">{selectedUser.id}</strong>
                </span>
                <span className="text-[#647A98]">
                  Joined: <strong className="text-[#102A50]">{formatDate(selectedUser.created_at)}</strong>
                </span>
              </div>

              {/* Direct Communication Quick Links */}
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#0866E8] hover:bg-[#EDF6FF] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
                {editFormData.phone && (
                  <a
                    href={`https://wa.me/${(editFormData.whatsapp || editFormData.phone || '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="03001234567"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.whatsapp || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
                    placeholder="923001234567"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    placeholder="Lahore, Karachi, Islamabad..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">
                    Account Status
                  </label>
                  <select
                    value={editFormData.status || 'active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#102A50] mb-1">
                    Role
                  </label>
                  <select
                    value={editFormData.role || 'customer'}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#102A50] mb-1">
                  Delivery / Residential Address
                </label>
                <textarea
                  rows={2}
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Street address, house number, area..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#102A50] focus:outline-none focus:border-[#0866E8]"
                />
              </div>

              <div className="pt-4 border-t border-[#DCEBFA] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-[#EDF6FF]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 rounded-xl bg-[#0866E8] hover:bg-[#0756C4] text-white text-xs font-bold transition-all disabled:opacity-60 shadow-md shadow-[#0866E8]/20"
                >
                  {savingUser ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-6 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#102A50]">Delete Customer Account?</h3>
            <p className="text-xs text-[#647A98] mt-2 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <strong className="text-[#102A50]">{userToDelete.email}</strong>? This will delete
              their profile record from PostgreSQL and Supabase Authentication.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#DCEBFA] text-xs font-bold text-[#647A98] hover:bg-[#EDF6FF]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deletingUser}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-60 shadow-md shadow-rose-600/20"
              >
                {deletingUser ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
