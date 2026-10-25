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
  const [banners, setBanners] = useState<BannerItem[]>([]);
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

  // Initial Data Fetch from Supabase APIs
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [prodsRes, catsRes, bansRes, dealsRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/categories').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/banners').then((r) => r.json()).catch(() => ({ data: [] })),
        fetch('/api/deals').then((r) => r.json()).catch(() => ({ data: [] })),
      ]);

      if (prodsRes.data && Array.isArray(prodsRes.data)) {
        setProducts(prodsRes.data);
      }
      if (catsRes.data && Array.isArray(catsRes.data)) {
        setRawCategories(catsRes.data);
      }
      if (bansRes.data && Array.isArray(bansRes.data)) {
        setBanners(bansRes.data);
      }
      if (dealsRes.data && Array.isArray(dealsRes.data)) {
        setDeals(dealsRes.data);
      }
    } catch (e) {
      console.error('Failed to fetch data from Supabase backend:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Products CRUD ---
  const getProductById = (id: string): Product | undefined => {
    return products.find(
      (p) => p.id === id || p.slug === id || p.id.toLowerCase() === id.toLowerCase()
    );
  };

  const addProduct = async (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      const data = await res.json();
      if (data.success && data.data) {
        // Replace temporary entry with authoritative database record
        setProducts((prev) =>
          prev.map((p) => (p.id === newProduct.id ? data.data : p))
        );
      }
    } catch (e) {
      console.error('Failed to create product in database:', e);
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    try {
      await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error('Failed to update product in database:', e);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete product from database:', e);
    }
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
  };

  // --- Banners CRUD ---
  const addBanner = async (newBanner: BannerItem) => {
    setBanners((prev) => [newBanner, ...prev]);

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBanners((prev) =>
          prev.map((b) => (b.id === newBanner.id ? data.data : b))
        );
      }
    } catch (e) {
      console.error('Failed to save banner in database:', e);
    }
  };

  const updateBanner = async (id: string | number, updates: Partial<BannerItem>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));

    try {
      await fetch(`/api/banners/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error('Failed to update banner in database:', e);
    }
  };

  const deleteBanner = async (id: string | number) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));

    try {
      await fetch(`/api/banners/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete banner from database:', e);
    }
  };

  // --- Deals CRUD ---
  const addDeal = async (newDeal: PromoDeal) => {
    setDeals((prev) => [newDeal, ...prev]);

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDeals((prev) =>
          prev.map((d) => (d.id === newDeal.id ? data.data : d))
        );
      }
    } catch (e) {
      console.error('Failed to save deal in database:', e);
    }
  };

  const updateDeal = async (id: string | number, updates: Partial<PromoDeal>) => {
    setDeals((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));

    try {
      await fetch(`/api/deals/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.error('Failed to update deal in database:', e);
    }
  };

  const deleteDeal = async (id: string | number) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));

    try {
      await fetch(`/api/deals/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete deal from database:', e);
    }
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
