import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Clock, CheckCircle2, XCircle, AlertCircle, Calendar, ArrowRight } from 'lucide-react';

export interface RecentOrder {
  id: string;
  customer_name?: string;
  customer_email?: string;
  payment_method?: string;
  total: number;
  status: string;
  created_at: string;
}

interface RecentOrdersTableProps {
  orders: RecentOrder[];
  loading: boolean;
}

export const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({
  orders,
  loading,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            Confirmed
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <AlertCircle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DCEBFA] p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#102A50]">Recent Orders</h2>
              <p className="text-xs text-[#647A98]">Latest customer purchases in PostgreSQL database</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#647A98] bg-[#F7FBFF] px-2.5 py-1 rounded-lg border border-[#DCEBFA]">
            {orders.length} Records
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
                <div className="w-24 h-4 bg-slate-200 rounded" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-[#DCEBFA] bg-[#F7FBFF] text-center">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#DCEBFA] mx-auto flex items-center justify-center text-[#647A98] mb-3 shadow-xs">
              <ShoppingBag className="w-6 h-6 text-[#0866E8]" />
            </div>
            <h3 className="text-sm font-bold text-[#102A50]">No Customer Orders Yet</h3>
            <p className="text-xs text-[#647A98] mt-1 max-w-sm mx-auto">
              As soon as shoppers complete checkout on the customer website, orders will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EDF2F7] text-[10px] font-black uppercase tracking-wider text-[#647A98]">
                  <th className="py-3 pr-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F5FA] text-xs">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F7FBFF] transition-colors">
                    <td className="py-3.5 pr-4 font-mono font-bold text-[#0866E8] truncate max-w-[120px]">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#102A50]">
                      <div>{order.customer_name || 'Customer'}</div>
                      {order.customer_email && (
                        <div className="text-[10px] text-[#647A98] font-normal truncate max-w-[140px]">
                          {order.customer_email}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#647A98] whitespace-nowrap">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-[11px] font-mono text-[#647A98]">
                      {order.payment_method || 'COD'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#102A50] whitespace-nowrap">
                      Rs. {Number(order.total || 0).toLocaleString('en-PK')}
                    </td>
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0F5FA] flex items-center justify-between text-xs">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 font-bold text-[#0866E8] hover:text-[#0756C4] transition-colors"
        >
          <span>View all orders &amp; update status</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <span className="font-mono text-[11px] text-[#647A98]">Table: public.orders</span>
      </div>
    </div>
  );
};
