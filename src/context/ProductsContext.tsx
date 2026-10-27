'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Category } from '@/types';
import { doesProductBelongToCategory } from '@/lib/categoryUtils';

export interface BannerItem {
  id: number | string;
  image: string;
  mobileImage?: string;
  title: string;
  titlePrefix?: string;
  titleHighlight?: string;
  brand?: string;
  tag?: string;
  tagline?: string;
  subtitle?: string;
  price?: string;
  link: string;
  status: 'Active' | 'Inactive';
  validPeriod: string;
  specs?: { label: string; desc: string }[];
  themeColor?: string;
}

export interface PromoDeal {
  id: number | string;
  badge: string;
  badgeColor?: string;
  title: string;
  discount: string;
  subtitle: string;
  brand: string;
  image: string;
  link: string;
  bgGradient?: string;
  price?: number | string;
  products?: { id: string; name: string; price: number; image?: string }[];
  status?: 'Active' | 'Inactive';
}

interface ProductsContextType {
  // Products CRUD
  products: Product[];
  isLoading: boolean;
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => Promise<void>;

  // Categories CRUD
  categories: Category[];
  addCategory: (category: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  refreshCategories: () => Promise<void>;

  // Banners CRUD
  banners: BannerItem[];
  addBanner: (banner: BannerItem) => Promise<void>;
  updateBanner: (id: string | number, updates: Partial<BannerItem>) => Promise<void>;
  deleteBanner: (id: string | number) => Promise<void>;

  // Deals CRUD
  deals: PromoDeal[];
  addDeal: (deal: PromoDeal) => Promise<void>;
  updateDeal: (id: string | number, updates: Partial<PromoDeal>) => Promise<void>;
  deleteDeal: (id: string | number) => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('bluebell_cached_banners');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [deals, setDeals] = useState<PromoDeal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic Categories calculation:
  // Every category's itemCount is computed from the ACTUAL published products in the database!
  const categories: Category[] = useMemo(() => {
    return rawCategories.map((cat) => {
      const matchingCount = products.filter((p) =>
        doesProductBelongToCategory(p.categorySlug, p.brand, cat.slug)
      ).length;

      return {
        ...cat,
        itemCount: matchingCount, // Strictly real count, no hardcoded numbers!
      };
    });
  }, [rawCategories, products]);

  // Broadcast real-time catalog changes across browser tabs and client devices
  const broadcastCatalogUpdate = () => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('bluebell_store_sync');
        channel.postMessage({ type: 'CATALOG_UPDATED', timestamp: Date.now() });
        channel.close();
      }
      localStorage.setItem('bluebell_last_catalog_update', Date.now().toString());
    } catch {}
  };

  // Resilient Data Fetch from Supabase APIs with unified bootstrap acceleration
  const fetchAllData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      // 1. Ultra-fast path: single unified bootstrap call powered by server-side SingleFlight cache
      const bootstrapRes = await fetch('/api/bootstrap', { cache: 'no-store' })
        .then((r) => r.json())
        .catch(() => null);

      if (bootstrapRes && bootstrapRes.success) {
        if (Array.isArray(bootstrapRes.products)) setProducts(bootstrapRes.products);
        if (Array.isArray(bootstrapRes.categories)) setRawCategories(bootstrapRes.categories);
        if (Array.isArray(bootstrapRes.banners)) {
          setBanners(bootstrapRes.banners);
          try { localStorage.setItem('bluebell_cached_banners', JSON.stringify(bootstrapRes.banners)); } catch {}
        }
        if (Array.isArray(bootstrapRes.deals)) setDeals(bootstrapRes.deals);
        return;
      }

      // 2. Resilient fallback: parallel fetch if bootstrap is unavailable
      const [prodsRes, catsRes, bansRes, dealsRes] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/categories', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/banners', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/deals', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      if (prodsRes.data && Array.isArray(prodsRes.data)) {
        setProducts(prodsRes.data);
      }
      if (catsRes.data && Array.isArray(catsRes.data)) {
        setRawCategories(catsRes.data);
      }
      if (bansRes.data && Array.isArray(bansRes.data)) {
        setBanners(bansRes.data);
        try { localStorage.setItem('bluebell_cached_banners', JSON.stringify(bansRes.data)); } catch {}
      }
      if (dealsRes.data && Array.isArray(dealsRes.data)) {
        setDeals(dealsRes.data);
      }
    } catch (e) {
      console.error('Failed to fetch data from Supabase backend:', e);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Real-Time Cross-Tab / Cross-Window Synchronization
  useEffect(() => {
    // Initial fetch with loader
    fetchAllData(true);

    // 1. BroadcastChannel for instant real-time sync across open browser tabs
    let syncChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        syncChannel = new BroadcastChannel('bluebell_store_sync');
        syncChannel.onmessage = (event) => {
          const t = event.data?.type;
          if (t === 'CATALOG_UPDATED' || t === 'STORE_SYNC' || t === 'BANNER_UPDATED') {
            fetchAllData(false);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel sync unavailable:', e);
    }

    // 2. Storage event fallback for cross-process sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bluebell_last_catalog_update') {
        fetchAllData(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Tab Visibility & Focus auto-revalidation
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchAllData(false);
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    // 4. Background heartbeat auto-sync (polls every 15 seconds)
    // Guarantees that any change made by admin in any browser updates client screens without manual reload!
    const heartbeatTimer = setInterval(() => {
      fetchAllData(false);
    }, 15000);

    return () => {
      if (syncChannel) syncChannel.close();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
      clearInterval(heartbeatTimer);
    };
  }, []);

  // --- Products CRUD ---
  const getProductById = (id: string): Product | undefined => {
    return products.find(
      (p) => p.id === id || p.slug === id || p.id.toLowerCase() === id.toLowerCase()
    );
  };

  const addProduct = async (newProduct: Product) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error?.message || data.error || 'Failed to create product in database');
    }

    const saved = data.data as Product;
    setProducts((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
    broadcastCatalogUpdate();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Failed to update product in database');
    }

    const updated = data.data as Product;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    broadcastCatalogUpdate();
  };

  const deleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete product from database');
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    broadcastCatalogUpdate();
  };

  const refreshProducts = async () => {
    await fetchAllData();
  };

  // --- Categories CRUD ---
  const refreshCategories = async () => {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        setRawCategories(json.data);
      }
    } catch (e) {
      console.error('Failed to refresh categories:', e);
    }
  };

  const addCategory = async (newCategory: Partial<Category>): Promise<Category> => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Failed to save category to database');
    }

    const saved = data.data as Category;
    setRawCategories((prev) => {
      const exists = prev.some((c) => c.id === saved.id || c.slug === saved.slug);
      if (exists) {
        return prev.map((c) => (c.id === saved.id || c.slug === saved.slug ? saved : c));
      }
      return [...prev, saved];
    });

    broadcastCatalogUpdate();
    return saved;
  };

  const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Failed to update category in database');
    }

    const updated = data.data as Category;
    setRawCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );

    broadcastCatalogUpdate();
    return updated;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete category from database');
    }

    setRawCategories((prev) => prev.filter((c) => c.id !== id));
    broadcastCatalogUpdate();
  };

  // --- Banners CRUD ---
  const addBanner = async (newBanner: BannerItem) => {
    const res = await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBanner),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Failed to save banner in database');
    }

    const saved = data.data;
    setBanners((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
  };

  const updateBanner = async (id: string | number, updates: Partial<BannerItem>) => {
    const res = await fetch(`/api/banners/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Failed to update banner in database');
    }

    const updated = data.data;
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
  };

  const deleteBanner = async (id: string | number) => {
    const res = await fetch(`/api/banners/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete banner from database');
    }

    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // --- Deals CRUD ---
  const addDeal = async (newDeal: PromoDeal) => {
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDeal),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Failed to save deal in database');
    }

    const saved = data.data;
    setDeals((prev) => [saved, ...prev.filter((d) => d.id !== saved.id)]);
  };

  const updateDeal = async (id: string | number, updates: Partial<PromoDeal>) => {
    const res = await fetch(`/api/deals/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Failed to update deal in database');
    }

    const updated = data.data;
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)));
  };

  const deleteDeal = async (id: string | number) => {
    const res = await fetch(`/api/deals/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete deal from database');
    }

    setDeals((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        deals,
        addDeal,
        updateDeal,
        deleteDeal,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
