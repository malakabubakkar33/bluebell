'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Product, Category } from '@/types';

export interface DashboardMetrics {
  totalProducts: number;
  publishedProducts: number;
  totalCategories: number;
  registeredCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockProductsCount: number;
  lowStockThreshold: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  profitMarginPercent: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  brand: string;
  category_slug?: string;
  price: number;
  stock_count: number;
  in_stock: boolean;
  image?: string;
}

export interface RecentOrder {
  id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  total: number;
  status: string;
  created_at: string;
  items?: any[];
}

export interface DailySalesData {
  date: string;
  label: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface ProductProfitStats {
  id: string;
  name: string;
  brand: string;
  categorySlug?: string;
  image?: string;
  sellingPrice: number;
  costPrice: number;
  unitProfit: number;
  unitsSold: number;
  totalRevenue: number;
  totalProfit: number;
  marginPercent: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  lowStockItems: LowStockProduct[];
  recentOrders: RecentOrder[];
  salesChartData: DailySalesData[];
  productProfitList: ProductProfitStats[];
  timestamp?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface AdminOrder {
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

interface AdminDataContextType {
  dashboardData: DashboardData | null;
  products: Product[];
  categories: Category[];
  orders: AdminOrder[];

  isWarmedUp: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  lastWarmedAt: Date | null;
  error: string | null;

  refreshAll: (options?: { silent?: boolean; forceNetwork?: boolean }) => Promise<void>;
  refreshDashboard: (silent?: boolean) => Promise<void>;
  refreshProducts: (silent?: boolean) => Promise<void>;
  refreshCategories: (silent?: boolean) => Promise<void>;
  refreshOrders: (silent?: boolean) => Promise<void>;

  mutateProducts: (updater: Product[] | ((prev: Product[]) => Product[])) => void;
  mutateCategories: (updater: Category[] | ((prev: Category[]) => Category[])) => void;
  mutateOrders: (updater: AdminOrder[] | ((prev: AdminOrder[]) => AdminOrder[])) => void;
  mutateDashboard: (updater: Partial<DashboardData> | ((prev: DashboardData | null) => DashboardData | null)) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const CACHE_KEY = 'bluebell_admin_cache_v2';
const CACHE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes cache validity

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const [isWarmedUp, setIsWarmedUp] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastWarmedAt, setLastWarmedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isWarmingUpRef = useRef<boolean>(false);

  // Helper to persist current snapshot to sessionStorage
  const saveSnapshotToStorage = useCallback(
    (
      newDash: DashboardData | null,
      newProds: Product[],
      newCats: Category[],
      newOrds: AdminOrder[]
    ) => {
      if (typeof window === 'undefined') return;
      try {
        const payload = {
          dashboardData: newDash,
          products: newProds,
          categories: newCats,
          orders: newOrds,
          timestamp: Date.now(),
        };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('[AdminDataContext] Failed to save snapshot to sessionStorage:', err);
      }
    },
    []
  );

  // Synchronized parallel warm-up prefetch
  const warmUpAll = useCallback(
    async (options?: { silent?: boolean; forceNetwork?: boolean }) => {
      if (isWarmingUpRef.current) return;
      isWarmingUpRef.current = true;

      const silent = options?.silent ?? false;
      const force = options?.forceNetwork ?? false;

      if (!silent) {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const bustParam = force ? `&_t=${Date.now()}` : '';
        const [dashRes, prodsRes, catsRes, ordsRes] = await Promise.allSettled([
          fetch(`/api/admin/dashboard/stats?${bustParam}`, { cache: force ? 'no-cache' : 'default' }),
          fetch(`/api/products?status=all${bustParam}`, { cache: force ? 'no-cache' : 'default' }),
          fetch(`/api/categories?all=true${bustParam}`, { cache: force ? 'no-cache' : 'default' }),
          fetch(`/api/orders?${bustParam}`, { cache: force ? 'no-cache' : 'default' }),
        ]);

        let freshDash: DashboardData | null = dashboardData;
        let freshProds: Product[] = products;
        let freshCats: Category[] = categories;
        let freshOrds: AdminOrder[] = orders;

        // Process Dashboard
        if (dashRes.status === 'fulfilled' && dashRes.value.ok) {
          try {
            const data = await dashRes.value.json();
            if (data.success) {
              freshDash = {
                metrics: data.metrics,
                lowStockItems: data.lowStockItems || [],
                recentOrders: data.recentOrders || [],
                salesChartData: data.salesChartData || [],
                productProfitList: data.productProfitList || [],
                timestamp: data.timestamp || new Date().toISOString(),
              };
              setDashboardData(freshDash);
            }
          } catch (e) {
            console.error('[AdminDataContext] Error parsing dashboard response:', e);
          }
        }

        // Process Products
        if (prodsRes.status === 'fulfilled' && prodsRes.value.ok) {
          try {
            const data = await prodsRes.value.json();
            if (data.success && Array.isArray(data.data)) {
              freshProds = data.data;
              setProducts(freshProds);
            }
          } catch (e) {
            console.error('[AdminDataContext] Error parsing products response:', e);
          }
        }

        // Process Categories
        if (catsRes.status === 'fulfilled' && catsRes.value.ok) {
          try {
            const data = await catsRes.value.json();
            if (data.success && Array.isArray(data.data)) {
              freshCats = data.data;
              setCategories(freshCats);
            }
          } catch (e) {
            console.error('[AdminDataContext] Error parsing categories response:', e);
          }
        }

        // Process Orders
        if (ordsRes.status === 'fulfilled' && ordsRes.value.ok) {
          try {
            const data = await ordsRes.value.json();
            if (data.success && Array.isArray(data.data)) {
              freshOrds = data.data;
              setOrders(freshOrds);
            }
          } catch (e) {
            console.error('[AdminDataContext] Error parsing orders response:', e);
          }
        }

        const now = new Date();
        setLastWarmedAt(now);
        setIsWarmedUp(true);
        saveSnapshotToStorage(freshDash, freshProds, freshCats, freshOrds);
      } catch (err: any) {
        console.error('[AdminDataContext] Warm-up error:', err);
        setError(err.message || 'Failed to warm up admin database cache.');
      } finally {
        isWarmingUpRef.current = false;
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    },
    [dashboardData, products, categories, orders, saveSnapshotToStorage]
  );

  // Initial mount: Hydrate from sessionStorage immediately (0ms instant render) and trigger silent SWR warm-up
  useEffect(() => {
    let hydratedFromStorage = false;

    if (typeof window !== 'undefined') {
      try {
        const storedStr = sessionStorage.getItem(CACHE_KEY);
        if (storedStr) {
          const stored = JSON.parse(storedStr);
          if (stored && typeof stored === 'object') {
            const age = Date.now() - (stored.timestamp || 0);
            if (age < CACHE_MAX_AGE_MS) {
              if (stored.dashboardData) setDashboardData(stored.dashboardData);
              if (Array.isArray(stored.products)) setProducts(stored.products);
              if (Array.isArray(stored.categories)) setCategories(stored.categories);
              if (Array.isArray(stored.orders)) setOrders(stored.orders);

              setIsWarmedUp(true);
              setIsInitialLoading(false);
              setLastWarmedAt(new Date(stored.timestamp || Date.now()));
              hydratedFromStorage = true;
            }
          }
        }
      } catch (err) {
        console.warn('[AdminDataContext] Could not read sessionStorage cache:', err);
      }
    }

    // Trigger warm-up (silent SWR if already hydrated, else initial fetch)
    warmUpAll({ silent: hydratedFromStorage, forceNetwork: false });
  }, []); // Run once on mount

  // Targeted Refreshers
  const refreshDashboard = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/admin/dashboard/stats?refresh=true', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const freshDash: DashboardData = {
            metrics: data.metrics,
            lowStockItems: data.lowStockItems || [],
            recentOrders: data.recentOrders || [],
            salesChartData: data.salesChartData || [],
            productProfitList: data.productProfitList || [],
            timestamp: data.timestamp || new Date().toISOString(),
          };
          setDashboardData(freshDash);
          saveSnapshotToStorage(freshDash, products, categories, orders);
        }
      }
    } catch (e) {
      console.error('[AdminDataContext] refreshDashboard failed:', e);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [products, categories, orders, saveSnapshotToStorage]);

  const refreshProducts = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/products?status=all', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
          saveSnapshotToStorage(dashboardData, data.data, categories, orders);
        }
      }
    } catch (e) {
      console.error('[AdminDataContext] refreshProducts failed:', e);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [dashboardData, categories, orders, saveSnapshotToStorage]);

  const refreshCategories = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/categories?all=true', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
          saveSnapshotToStorage(dashboardData, products, data.data, orders);
        }
      }
    } catch (e) {
      console.error('[AdminDataContext] refreshCategories failed:', e);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [dashboardData, products, orders, saveSnapshotToStorage]);

  const refreshOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
          saveSnapshotToStorage(dashboardData, products, categories, data.data);
        }
      }
    } catch (e) {
      console.error('[AdminDataContext] refreshOrders failed:', e);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [dashboardData, products, categories, saveSnapshotToStorage]);

  // Optimistic Mutations
  const mutateProducts = useCallback(
    (updater: Product[] | ((prev: Product[]) => Product[])) => {
      setProducts((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveSnapshotToStorage(dashboardData, next, categories, orders);
        return next;
      });
    },
    [dashboardData, categories, orders, saveSnapshotToStorage]
  );

  const mutateCategories = useCallback(
    (updater: Category[] | ((prev: Category[]) => Category[])) => {
      setCategories((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveSnapshotToStorage(dashboardData, products, next, orders);
        return next;
      });
    },
    [dashboardData, products, orders, saveSnapshotToStorage]
  );

  const mutateOrders = useCallback(
    (updater: AdminOrder[] | ((prev: AdminOrder[]) => AdminOrder[])) => {
      setOrders((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveSnapshotToStorage(dashboardData, products, categories, next);
        return next;
      });
    },
    [dashboardData, products, categories, saveSnapshotToStorage]
  );

  const mutateDashboard = useCallback(
    (updater: Partial<DashboardData> | ((prev: DashboardData | null) => DashboardData | null)) => {
      setDashboardData((prev) => {
        let next: DashboardData | null = null;
        if (typeof updater === 'function') {
          next = updater(prev);
        } else if (prev) {
          next = { ...prev, ...updater };
        } else {
          next = null;
        }
        saveSnapshotToStorage(next, products, categories, orders);
        return next;
      });
    },
    [products, categories, orders, saveSnapshotToStorage]
  );

  const value = useMemo<AdminDataContextType>(
    () => ({
      dashboardData,
      products,
      categories,
      orders,
      isWarmedUp,
      isInitialLoading,
      isRefreshing,
      lastWarmedAt,
      error,
      refreshAll: warmUpAll,
      refreshDashboard,
      refreshProducts,
      refreshCategories,
      refreshOrders,
      mutateProducts,
      mutateCategories,
      mutateOrders,
      mutateDashboard,
    }),
    [
      dashboardData,
      products,
      categories,
      orders,
      isWarmedUp,
      isInitialLoading,
      isRefreshing,
      lastWarmedAt,
      error,
      warmUpAll,
      refreshDashboard,
      refreshProducts,
      refreshCategories,
      refreshOrders,
      mutateProducts,
      mutateCategories,
      mutateOrders,
      mutateDashboard,
    ]
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};

export function useAdminData(): AdminDataContextType {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an <AdminDataProvider>');
  }
  return context;
}
