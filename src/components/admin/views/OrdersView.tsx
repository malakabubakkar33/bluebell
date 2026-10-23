'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Eye,
  MessageCircle,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Trash2,
  X,
  Printer,
} from 'lucide-react';

export interface OrderItem {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address?: string;
  city?: string;
  payment_method?: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: { name: string; quantity: number; price?: number }[];
}

interface OrdersViewProps {
  ordersList?: any[];
  onSelectOrder?: (order: any) => void;
  onUpdateStatus?: (orderId: string, newStatus: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  ordersList = [],
  onSelectOrder,
  onUpdateStatus,
  onDeleteOrder,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initialized to 0 starting orders
  const [internalOrders, setInternalOrders] = useState<OrderItem[]>(() => {
    if (ordersList && ordersList.length > 0) {
      return ordersList;
    }
    return [];
  });

  const [activeModalOrder, setActiveModalOrder] = useState<OrderItem | null>(null);

  const handleStatusChange = (orderId: string, newStatus: OrderItem['status']) => {
    setInternalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    if (onUpdateStatus) {
      onUpdateStatus(orderId, newStatus);
    }
  };

  const handleDelete = (orderId: string) => {
    if (confirm(`Are you sure you want to delete order ${orderId}?`)) {
      setInternalOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (onDeleteOrder) {
        onDeleteOrder(orderId);
      }
    }
  };

  const filteredOrders = useMemo(() => {
    return internalOrders.filter((o) => {
      const matchSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [internalOrders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/60';
      case 'processing':
        return 'bg-amber-50 text-amber-600 border border-amber-200/60';
      case 'shipped':
        return 'bg-blue-50 text-blue-600 border border-blue-200/60';
      case 'pending':
        return 'bg-orange-50 text-orange-600 border border-orange-200/60';
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Orders Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track and manage customer orders, update delivery status, and customer invoices.
        </p>
      </div>

      {/* 2. Filters Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search orders by ID or customer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-44">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="all">All Status</option>
            <option value="delivered">Delivered</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* 3. Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] sm:text-xs font-bold border-b border-slate-200/70 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-sm font-bold text-slate-700">0 Orders Placed</p>
                      <p className="text-xs text-slate-400 mt-1">
                        All order records have been reset to 0. Customer checkout orders will appear here in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Order # */}
                    <td className="py-3.5 px-4 font-bold text-brand-600">
                      {ord.id}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{ord.customer_name}</div>
                      <span className="text-[11px] text-slate-400 font-mono">{ord.customer_phone}</span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      Rs. {ord.total.toLocaleString()}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full cursor-pointer outline-none border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {ord.date}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setActiveModalOrder(ord);
                            if (onSelectOrder) onSelectOrder(ord);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-sky-50 transition-colors"
                          title="View order invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`https://wa.me/${ord.customer_phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                            ord.customer_name
                          )},%20regarding%20your%20Blue%20Bells%20order%20${ord.id}...`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="WhatsApp Customer"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(ord.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete order"
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

        {/* 4. Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {filteredOrders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{' '}
            {filteredOrders.length} orders
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

      {/* 5. Order Invoice / Details Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Order Details: {activeModalOrder.id}
                </h3>
                <p className="text-[11px] text-slate-400">Placed on {activeModalOrder.date}</p>
              </div>
              <button
                onClick={() => setActiveModalOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-sky-50/50 p-3.5 rounded-2xl border border-sky-100 space-y-1">
                <p className="font-bold text-slate-800">
                  Customer: <span className="text-slate-600 font-normal">{activeModalOrder.customer_name}</span>
                </p>
                <p className="font-bold text-slate-800">
                  Phone: <span className="text-slate-600 font-normal font-mono">{activeModalOrder.customer_phone}</span>
                </p>
                <p className="font-bold text-slate-800">
                  Email: <span className="text-slate-600 font-normal">{activeModalOrder.customer_email}</span>
                </p>
                {activeModalOrder.shipping_address && (
                  <p className="font-bold text-slate-800">
                    Address: <span className="text-slate-600 font-normal">{activeModalOrder.shipping_address}</span>
                  </p>
                )}
                {activeModalOrder.payment_method && (
                  <p className="font-bold text-slate-800">
                    Payment Method:{' '}
                    <span className="text-slate-600 font-normal">{activeModalOrder.payment_method}</span>
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                  Purchased Products
                </h4>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {activeModalOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-slate-400 block text-[11px]">Qty: {item.quantity}</span>
                      </div>
                      {item.price && (
                        <span className="font-bold text-slate-900">
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="font-black text-slate-800 text-sm">Grand Total:</span>
                <span className="font-black text-brand-600 text-base">
                  Rs. {activeModalOrder.total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModalOrder(null)}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/20"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
