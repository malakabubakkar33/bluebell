'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Volume2,
  VolumeX,
  Check,
  ShoppingBag,
  ExternalLink,
  X,
  Play,
  Clock,
  Sparkles,
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

export interface LiveOrder {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_whatsapp?: string;
  shipping_address: string;
  city: string;
  total: number;
  status: string;
  items: OrderItem[];
  created_at: string;
  date?: string;
}

// Synthesizes a high-definition shop chime via Web Audio API
export function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 3 harmonic notes in ascending melody (D5 -> A5 -> D6)
    const notes = [
      { freq: 587.33, start: 0.0, dur: 0.22 },
      { freq: 880.0, start: 0.16, dur: 0.26 },
      { freq: 1174.66, start: 0.32, dur: 0.45 },
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, ctx.currentTime + n.start);

      // Smooth attack and natural bell decay
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + n.start);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + n.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + n.start + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + n.start);
      osc.stop(ctx.currentTime + n.start + n.dur + 0.05);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

export const AdminOrderNotification: React.FC = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastOrder, setToastOrder] = useState<LiveOrder | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef(true);

  // Initialize sound settings
  useEffect(() => {
    const savedSound = localStorage.getItem('bluebell_admin_sound_alert');
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, []);

  // Fetch orders and detect new ones
  const checkNewOrders = async () => {
    try {
      const res = await fetch('/api/orders?limit=15', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.success || !Array.isArray(data.data)) return;

      const fetchedOrders: LiveOrder[] = data.data;
      setOrders(fetchedOrders);

      const seenKey = 'bluebell_seen_order_ids';
      const storedSeen = localStorage.getItem(seenKey);
      let seenIds: string[] = storedSeen ? JSON.parse(storedSeen) : [];

      if (isFirstLoadRef.current) {
        // Initial page load: seed seen list so historical orders don't ring sound
        isFirstLoadRef.current = false;
        if (seenIds.length === 0) {
          seenIds = fetchedOrders.map((o) => o.id);
          localStorage.setItem(seenKey, JSON.stringify(seenIds.slice(0, 100)));
        } else {
          // Count how many are not in seenIds
          const unread = fetchedOrders.filter((o) => !seenIds.includes(o.id)).length;
          setUnreadCount(unread);
        }
        return;
      }

      // Check for incoming new orders
      const newOrders = fetchedOrders.filter((o) => !seenIds.includes(o.id));
      if (newOrders.length > 0) {
        const latestOrder = newOrders[0];

        // Trigger Audio Chime if sound enabled
        const curSound = localStorage.getItem('bluebell_admin_sound_alert') !== 'false';
        if (curSound) {
          playOrderChime();
        }

        // Show prominent toast notification
        setToastOrder(latestOrder);

        // Update seen list and unread count
        const updatedSeen = Array.from(new Set([...newOrders.map((o) => o.id), ...seenIds]));
        localStorage.setItem(seenKey, JSON.stringify(updatedSeen.slice(0, 100)));
        setUnreadCount((prev) => prev + newOrders.length);
      }
    } catch (err) {
      console.warn('Failed to poll orders in notification component:', err);
    }
  };

  useEffect(() => {
    // Initial fetch
    checkNewOrders();

    // Polling interval every 12 seconds
    const interval = setInterval(() => {
      checkNewOrders();
    }, 12000);

    // Cross-tab real-time sync via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('bluebell_store_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'ORDER_UPDATED') {
          checkNewOrders();
        }
      };
    } catch (e) {
      // BroadcastChannel fallback
    }

    // Close dropdown on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Auto-dismiss floating toast after 10 seconds
  useEffect(() => {
    if (toastOrder) {
      const timer = setTimeout(() => {
        setToastOrder(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [toastOrder]);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('bluebell_admin_sound_alert', nextVal.toString());
    if (nextVal) {
      playOrderChime();
    }
  };

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    const allIds = orders.map((o) => o.id);
    localStorage.setItem('bluebell_seen_order_ids', JSON.stringify(allIds.slice(0, 100)));
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <>
      {/* Top Header Notification Bell & Popover */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && unreadCount > 0) {
              handleMarkAllRead();
            }
          }}
          aria-label="Order Notifications"
          className="relative p-2 rounded-full border border-[#DCEBFA] bg-white hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] transition-colors shadow-xs cursor-pointer flex items-center justify-center"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#DCEBFA] shadow-2xl z-50 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-[#F7FBFF] to-white border-b border-[#DCEBFA] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#102A50] flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#0866E8]" />
                  <span>Live Order Notifications</span>
                </h3>
                <p className="text-[10px] text-[#647A98]">Real-time incoming orders &amp; sound alert</p>
              </div>

              {/* Sound Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={playOrderChime}
                  title="Test Sound Alert"
                  className="p-1.5 rounded-lg border border-[#DCEBFA] text-[#0866E8] hover:bg-[#EDF6FF] text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  <span className="hidden sm:inline">Test</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSound}
                  title={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    soundEnabled
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* List of Orders */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#F0F6FD]">
              {orders.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#647A98]">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-[#DCEBFA]" />
                  <span>No orders recorded yet.</span>
                </div>
              ) : (
                orders.slice(0, 8).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/admin/orders');
                    }}
                    className="p-3 hover:bg-[#F7FBFF] transition-colors cursor-pointer flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#EDF6FF] text-[#0866E8] flex items-center justify-center shrink-0 border border-[#DCEBFA] mt-0.5">
                      <ShoppingBag className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#102A50] truncate">
                          {order.customer_name}
                        </span>
                        <span className="text-[10px] font-mono text-[#647A98] flex items-center gap-1 shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatTimeAgo(order.created_at || order.date || '')}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <span className="text-[#647A98] truncate">
                          {order.city} &bull; {order.items?.length || 1} item(s)
                        </span>
                        <span className="font-black text-[#0866E8] shrink-0">
                          Rs. {Number(order.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[#F7FBFF] border-t border-[#DCEBFA] flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[#647A98] hover:text-[#102A50] font-semibold cursor-pointer"
              >
                Mark all read
              </button>
              <Link
                href="/admin/orders"
                onClick={() => setIsOpen(false)}
                className="text-[#0866E8] font-bold hover:underline flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Floating Real-Time New Order Toast Alert */}
      {toastOrder && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white rounded-3xl border-2 border-[#0866E8] shadow-2xl p-4 animate-slideUp overflow-hidden">
          {/* Top highlight bar */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0866E8] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>New Order Received!</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setToastOrder(null)}
              className="p-1 rounded-lg text-[#647A98] hover:text-[#102A50] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#F7FBFF] rounded-2xl p-3 border border-[#DCEBFA] mb-3">
            <div className="text-xs font-bold text-[#102A50]">{toastOrder.customer_name}</div>
            <div className="text-[11px] text-[#647A98] mt-0.5">
              Phone: {toastOrder.customer_phone} &bull; {toastOrder.city}
            </div>
            <div className="text-xs font-black text-[#0866E8] mt-1.5 flex items-center justify-between">
              <span>Total Amount:</span>
              <span>Rs. {Number(toastOrder.total || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setToastOrder(null);
                router.push('/admin/orders');
              }}
              className="flex-1 py-2 rounded-xl bg-[#0866E8] hover:bg-[#0645B5] text-white text-xs font-bold text-center transition-all cursor-pointer shadow-xs"
            >
              Open Order in Admin
            </button>
            <button
              type="button"
              onClick={() => setToastOrder(null)}
              className="px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs font-semibold text-[#647A98] hover:bg-[#F7FBFF] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};
