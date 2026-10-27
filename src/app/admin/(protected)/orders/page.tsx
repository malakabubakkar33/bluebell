'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ExternalLink,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  CreditCard,
  User,
  Package,
  Loader2,
  X,
  Filter,
  Check,
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: string;
  selectedStorage?: string;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp?: string;
  shipping_address: string;
  city: string;
  province?: string;
  postal_code?: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  tracking_number?: string;
  notes?: string;
  date: string;
  created_at: string;
}

import { useAdminData, AdminOrder } from '@/context/AdminDataContext';

export default function AdminOrdersPage() {
  const { orders, refreshOrders, mutateOrders, isInitialLoading, isRefreshing } = useAdminData();
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Details Modal
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loading = orders.length === 0 && isInitialLoading;
  const refreshing = isRefreshing || localRefreshing;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleManualRefresh = async () => {
    setLocalRefreshing(true);
    await refreshOrders();
    setLocalRefreshing(false);
  };

  useEffect(() => {
    // Real-Time Orders BroadcastChannel Listener
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel('bluebell_store_sync');
        channel.onmessage = (event) => {
          if (event.data?.type === 'ORDER_UPDATED') {
            refreshOrders(true);
          }
        };
      }
    } catch {}

    // Auto-sync polling every 20 seconds in background for real-time incoming orders
    const timer = setInterval(() => {
      refreshOrders(true);
    }, 20000);

    return () => {
      if (channel) channel.close();
      clearInterval(timer);
    };
  }, [refreshOrders]);

  // Update order status with instant optimistic update
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);

    // Optimistic cache update
    mutateOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
    );
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder({ ...viewingOrder, status: newStatus as any });
    }

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update order');

      // Broadcast update to all other open admin windows/tabs
      try {
        if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
          const ch = new BroadcastChannel('bluebell_store_sync');
          ch.postMessage({ type: 'ORDER_UPDATED' });
          ch.close();
        }
      } catch {}

      showToast('success', `Order #${orderId.substring(0, 8)} status set to ${newStatus}.`);
    } catch (err: any) {
      showToast('error', err.message || 'Status update failed.');
      await refreshOrders(true);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      if (!matchesStatus) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.customer_email.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, searchQuery]);

  // Summary Metrics
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Truck className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-slideUp ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDF6FF] border border-[#DCEBFA] text-[#0866E8] text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Fulfillment</span>
          </div>
          <h1 className="text-2xl font-black text-[#102A50] tracking-tight">
            Orders Management
          </h1>
          <p className="text-xs text-[#647A98] mt-0.5">
            Track customer mobile purchases, update delivery status, and review addresses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            className="p-2.5 rounded-xl border border-[#DCEBFA] bg-white text-[#102A50] hover:bg-[#EDF6FF] transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#0866E8]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
          <span className="text-[11px] font-bold text-[#647A98] block">Total Orders</span>
          <span className="text-2xl font-black text-[#102A50] font-mono mt-0.5 block">
            {orders.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 block">Pending</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-0.5 block">
            {pendingCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 block">Confirmed</span>
          <span className="text-2xl font-black text-blue-600 font-mono mt-0.5 block">
            {confirmedCount}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 block">Delivered</span>
          <span className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">
            {deliveredCount}
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
          <span className="text-[11px] font-bold text-[#0866E8] block">Gross Revenue</span>
          <span className="text-lg font-black text-[#0866E8] font-mono mt-1 block truncate">
            Rs. {totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-[#F0F5FA] border border-[#DCEBFA] text-xs">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'Pending', count: pendingCount },
            { id: 'confirmed', label: 'Confirmed', count: confirmedCount },
            { id: 'delivered', label: 'Delivered', count: deliveredCount },
            { id: 'cancelled', label: 'Cancelled', count: cancelledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-[#0866E8] shadow-xs'
                  : 'text-[#647A98] hover:text-[#102A50]'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#EDF6FF] text-[#0866E8] font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#647A98]" />
          <input
            type="text"
            placeholder="Search order ID, customer, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#DCEBFA] rounded-xl py-2 pl-10 pr-3.5 text-xs text-[#102A50] placeholder-[#647A98]/60 focus:outline-none focus:border-[#0866E8]"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#DCEBFA] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-50 animate-pulse flex items-center justify-between px-6">
                <div className="w-40 h-4 bg-slate-200 rounded" />
                <div className="w-24 h-4 bg-slate-200 rounded" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 text-[#647A98]/40 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#102A50]">No orders found</h3>
            <p className="text-xs text-[#647A98] mt-1">
              {statusFilter !== 'all'
                ? `No orders matching status "${statusFilter}".`
                : 'Customer orders will appear here in real time.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DCEBFA] bg-[#F7FBFF] text-[#647A98] uppercase font-bold text-[10px] tracking-wider">
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#F7FBFF]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-mono font-bold text-[#0866E8] bg-[#EDF6FF] px-2 py-0.5 rounded border border-[#DCEBFA]">
                          #{o.id.substring(0, 8)}
                        </span>
                        <span className="text-[10px] text-[#647A98] block mt-1">
                          {o.date || o.created_at?.split('T')[0]}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-[#102A50] block">{o.customer_name}</span>
                        <span className="text-[11px] text-[#647A98] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0866E8]" /> {o.city}
                        </span>
                        <span className="text-[11px] text-[#647A98]">{o.customer_phone}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#102A50] block">
                          {o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-[11px] text-[#647A98] line-clamp-1">
                          {o.items?.map((it) => it.name).join(', ') || 'No item details'}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <span className="font-mono font-black text-[#102A50] text-sm">
                          Rs. {Number(o.total || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#647A98] uppercase font-bold block">
                          {o.payment_method === 'cod' ? 'Cash on Delivery' : o.payment_method}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center gap-1.5">
                        {getStatusBadge(o.status)}
                        {/* Quick Status Dropdown */}
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-[#DCEBFA] bg-white cursor-pointer focus:outline-none focus:border-[#0866E8]"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setViewingOrder(o)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCEBFA] bg-white hover:bg-[#EDF6FF] text-[#0866E8] text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#102A50]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setViewingOrder(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#DCEBFA] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#DCEBFA] flex items-center justify-between bg-gradient-to-r from-white to-[#F7FBFF]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-[#0866E8] bg-[#EDF6FF] px-2 py-0.5 rounded border border-[#DCEBFA]">
                    #{viewingOrder.id.substring(0, 8)}
                  </span>
                  <span className="text-xs text-[#647A98]">
                    Ordered on {viewingOrder.date || viewingOrder.created_at?.split('T')[0]}
                  </span>
                </div>
                <h3 className="text-base font-black text-[#102A50] mt-1">Order Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="p-1.5 rounded-xl text-[#647A98] hover:text-[#102A50] hover:bg-[#EDF6FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Customer & Shipping Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA] space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#0866E8] block">
                    Customer Details
                  </span>
                  <span className="font-bold text-[#102A50] text-sm block">
                    {viewingOrder.customer_name}
                  </span>
                  <span className="text-[#647A98] block">{viewingOrder.customer_email}</span>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`tel:${viewingOrder.customer_phone}`}
                      className="inline-flex items-center gap-1 text-[#0866E8] font-bold hover:underline"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{viewingOrder.customer_phone}</span>
                    </a>
                    {viewingOrder.customer_whatsapp && (
                      <a
                        href={`https://wa.me/${viewingOrder.customer_whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline"
                      >
                        <MessageCircle className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA] space-y-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#0866E8] block">
                    Delivery Address
                  </span>
                  <span className="text-[#102A50] font-medium leading-relaxed block">
                    {viewingOrder.shipping_address}
                  </span>
                  <span className="font-bold text-[#102A50] block">
                    {viewingOrder.city}
                    {viewingOrder.province ? `, ${viewingOrder.province}` : ''}
                  </span>
                  {viewingOrder.notes && (
                    <span className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 block">
                      Note: {viewingOrder.notes}
                    </span>
                  )}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#102A50] block">
                  Purchased Items ({viewingOrder.items?.length || 0})
                </span>
                <div className="divide-y divide-[#DCEBFA] border border-[#DCEBFA] rounded-2xl overflow-hidden bg-white">
                  {viewingOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl border border-[#DCEBFA] bg-[#F7FBFF] p-1 flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image || '/categories/iphone.svg'}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="font-bold text-[#102A50] text-xs block">{item.name}</span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#647A98]">
                            {item.selectedStorage && (
                              <span className="font-mono text-[#0866E8] bg-[#EDF6FF] px-1.5 py-0.5 rounded">
                                {item.selectedStorage}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="font-bold text-[#102A50]">
                                Color: {item.selectedColor}
                              </span>
                            )}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-[#102A50]">
                          Rs. {(Number(item.price) * item.quantity).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#647A98] block">
                          Rs. {Number(item.price).toLocaleString()} each
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-4 rounded-2xl bg-[#F7FBFF] border border-[#DCEBFA] space-y-1.5">
                <div className="flex justify-between text-[#647A98]">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-[#102A50]">
                    Rs. {Number(viewingOrder.subtotal || viewingOrder.total).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-[#647A98]">
                  <span>Shipping Fee</span>
                  <span className="font-mono font-bold text-[#102A50]">
                    {viewingOrder.shipping_fee ? `Rs. ${viewingOrder.shipping_fee}` : 'FREE (Over 25,000)'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#102A50] pt-2 border-t border-[#DCEBFA]">
                  <span>Grand Total</span>
                  <span className="font-mono text-[#0866E8]">
                    Rs. {Number(viewingOrder.total).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Change in Modal */}
              <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#102A50] block">Order Lifecycle Status</span>
                  <span className="text-[11px] text-[#647A98]">Change status to update tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(viewingOrder.status)}
                  <select
                    value={viewingOrder.status}
                    onChange={(e) => handleUpdateStatus(viewingOrder.id, e.target.value)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#DCEBFA] bg-[#F7FBFF] cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#DCEBFA] bg-[#F7FBFF] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 rounded-xl bg-[#0866E8] text-white text-xs font-bold hover:bg-[#0645B5]"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
