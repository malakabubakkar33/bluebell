'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { PRODUCTS, CATEGORIES } from '@/lib/data/mockData';

export interface BannerItem {
  id: number | string;
  image: string;
  title: string;
  subtitle?: string;
  price?: string;
  link: string;
  status: 'Active' | 'Inactive';
  validPeriod: string;
}

export const INITIAL_BANNERS: BannerItem[] = [
  {
    id: 1,
    image: '/banners/slide-1.png',
    title: 'Apple iPad Pro M4 Experience',
    subtitle: 'The ultimate iPad experience. M4 Chip, Liquid Retina XDR.',
    price: 'Rs. 229,999',
    link: '/products?category=ipad',
    status: 'Active',
    validPeriod: 'Apr 20 - May 20',
  },
  {
    id: 2,
    image: '/banners/slide-2.png',
    title: 'iPhone 18 Pro Max - New Arrival',
    subtitle: 'Bigger. Smarter. More Powerful. A20 Pro Chip.',
    price: 'Rs. 449,999',
    link: '/products?search=iPhone%2018',
    status: 'Active',
    validPeriod: 'Apr 18 - May 18',
  },
  {
    id: 3,
    image: '/banners/slide-3.png',
    title: 'Samsung Galaxy S24 Ultra with Galaxy AI',
    subtitle: 'Smarter. Faster. More Powerful. 200MP Quad Camera.',
    price: 'Rs. 289,999',
    link: '/products?search=S24',
    status: 'Active',
    validPeriod: 'Apr 15 - May 15',
  },
  {
    id: 4,
    image: '/banners/slide-4.png',
    title: 'iPhone 17 Pro Max - Best Seller',
    subtitle: 'Pro Power. Pro Performance. A19 Pro Chip.',
    price: 'Rs. 389,999',
    link: '/products?search=iPhone%2017',
    status: 'Active',
    validPeriod: 'Apr 10 - May 10',
  },
];

interface ProductsContextType {
  // Products CRUD
  products: Product[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  refreshProducts: () => Promise<void>;

  // Categories CRUD
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Banners CRUD
  banners: BannerItem[];
  addBanner: (banner: BannerItem) => void;
  updateBanner: (id: string | number, updates: Partial<BannerItem>) => void;
  deleteBanner: (id: string | number) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [banners, setBanners] = useState<BannerItem[]>(INITIAL_BANNERS);

  // Load from localStorage or API on mount
  useEffect(() => {
    // 1. Products
    try {
      const stored = localStorage.getItem('bluebell_products_store');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      } else {
        localStorage.setItem('bluebell_products_store', JSON.stringify(PRODUCTS));
      }
    } catch (e) {
      console.error('Error loading products from storage', e);
    }

    // 2. Categories
    try {
      const storedCats = localStorage.getItem('bluebell_categories_store');
      if (storedCats) {
        const parsedCats = JSON.parse(storedCats);
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          setCategories(parsedCats);
        }
      } else {
        localStorage.setItem('bluebell_categories_store', JSON.stringify(CATEGORIES));
      }
    } catch (e) {
      console.error('Error loading categories from storage', e);
    }

    // 3. Banners
    try {
      const storedBanners = localStorage.getItem('bluebell_banners_store');
      if (storedBanners) {
        const parsedBanners = JSON.parse(storedBanners);
        if (Array.isArray(parsedBanners) && parsedBanners.length > 0) {
          setBanners(parsedBanners);
        }
      } else {
        localStorage.setItem('bluebell_banners_store', JSON.stringify(INITIAL_BANNERS));
      }
    } catch (e) {
      console.error('Error loading banners from storage', e);
    }

    // Listen for storage events (real-time sync across multiple tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bluebell_products_store' && e.newValue) {
        try {
          setProducts(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === 'bluebell_categories_store' && e.newValue) {
        try {
          setCategories(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
      if (e.key === 'bluebell_banners_store' && e.newValue) {
        try {
          setBanners(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- Products CRUD ---
  const saveProducts = (updatedList: Product[]) => {
    setProducts(updatedList);
    try {
      localStorage.setItem('bluebell_products_store', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find(
      (p) => p.id === id || p.slug === id || p.id.toLowerCase() === id.toLowerCase()
    );
  };

  const addProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    saveProducts(updated);

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    }).catch((e) => console.log('API sync error (cached locally)', e));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveProducts(updated);

    fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch((e) => console.log('API sync error (cached locally)', e));
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);

    fetch(`/api/products/${id}`, {
      method: 'DELETE',
    }).catch((e) => console.log('API sync error (cached locally)', e));
  };

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        saveProducts(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- Categories CRUD ---
  const saveCategories = (updatedList: Category[]) => {
    setCategories(updatedList);
    try {
      localStorage.setItem('bluebell_categories_store', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const addCategory = (newCategory: Category) => {
    const updated = [...categories, newCategory];
    saveCategories(updated);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveCategories(updated);
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);
  };

  // --- Banners CRUD ---
  const saveBanners = (updatedList: BannerItem[]) => {
    setBanners(updatedList);
    try {
      localStorage.setItem('bluebell_banners_store', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const addBanner = (newBanner: BannerItem) => {
    const updated = [...banners, newBanner];
    saveBanners(updated);
  };

  const updateBanner = (id: string | number, updates: Partial<BannerItem>) => {
    const updated = banners.map((b) => (b.id === id ? { ...b, ...updates } : b));
    saveBanners(updated);
  };

  const deleteBanner = (id: string | number) => {
    const updated = banners.filter((b) => b.id !== id);
    saveBanners(updated);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
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
