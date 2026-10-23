'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { PRODUCTS, CATEGORIES } from '@/lib/data/mockData';

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

export const INITIAL_BANNERS: BannerItem[] = [
  {
    id: 1,
    image: '/banners/hero-ipad-pro.jpg',
    title: 'Apple iPad Pro M4 Experience',
    titlePrefix: 'iPad ',
    titleHighlight: 'Pro',
    tag: 'FLAGSHIP TABLET',
    brand: 'Apple iPad',
    tagline: 'Power to do more.',
    subtitle: 'The ultimate iPad experience with groundbreaking M4 performance.',
    price: 'Rs. 229,999',
    link: '/products?category=ipad',
    status: 'Active',
    validPeriod: 'Apr 20 - May 20',
    specs: [
      { label: 'M4 Chip', desc: 'Breakthrough speed' },
      { label: '11" / 13"', desc: 'Ultra Retina XDR' },
      { label: 'Apple Pencil', desc: 'Pro Precision' },
    ],
    themeColor: '#0284c7',
  },
  {
    id: 2,
    image: '/banners/hero-iphone-18.jpg',
    title: 'iPhone 18 Pro Max - New Arrival',
    titlePrefix: 'iPhone ',
    titleHighlight: '18 Pro Max',
    tag: 'NEW ARRIVAL',
    brand: 'Apple iPhone',
    tagline: 'Bigger. Smarter. More Powerful.',
    subtitle: 'The next generation of titanium smartphone innovation is here.',
    price: 'Rs. 449,999',
    link: '/products?search=iPhone%2018',
    status: 'Active',
    validPeriod: 'Apr 18 - May 18',
    specs: [
      { label: 'A20 Pro Chip', desc: '3nm Architecture' },
      { label: '48MP Pro', desc: 'Fusion Telephoto' },
      { label: '6.9" Display', desc: 'Super Retina XDR' },
    ],
    themeColor: '#0284c7',
  },
  {
    id: 3,
    image: '/banners/hero-samsung-s24.jpg',
    title: 'Samsung Galaxy S24 Ultra with Galaxy AI',
    titlePrefix: 'Galaxy ',
    titleHighlight: 'S24 Ultra',
    tag: 'GALAXY AI IS HERE',
    brand: 'SAMSUNG',
    tagline: 'Smarter. Faster. More Powerful.',
    subtitle: 'Unleash mobile AI capabilities with integrated S-Pen and titanium frame.',
    price: 'Rs. 289,999',
    link: '/products?search=S24',
    status: 'Active',
    validPeriod: 'Apr 15 - May 15',
    specs: [
      { label: '200MP Camera', desc: 'Nightography Zoom' },
      { label: 'Snapdragon 8 Gen 3', desc: 'Extreme Speed' },
      { label: '6.8" Screen', desc: 'Dynamic AMOLED 2X' },
    ],
    themeColor: '#0284c7',
  },
  {
    id: 4,
    image: '/banners/hero-iphone-17.jpg',
    title: 'iPhone 17 Pro Max - Best Seller',
    titlePrefix: 'iPhone ',
    titleHighlight: '17 Pro Max',
    tag: 'BEST SELLER',
    brand: 'Apple iPhone',
    tagline: 'Pro Power. Pro Performance.',
    subtitle: 'A more powerful iPhone with aerospace-grade desert titanium design.',
    price: 'Rs. 389,999',
    link: '/products?search=iPhone%2017',
    status: 'Active',
    validPeriod: 'Apr 10 - May 10',
    specs: [
      { label: 'A19 Pro Chip', desc: 'Hardware Ray Tracing' },
      { label: '48MP Pro', desc: 'Macro & Spatial' },
      { label: '6.9" Display', desc: 'ProMotion 120Hz' },
    ],
    themeColor: '#0284c7',
  },
];

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

export const INITIAL_DEALS: PromoDeal[] = [
  {
    id: 1,
    badge: 'EXCLUSIVE GALAXY DEAL',
    badgeColor: 'bg-sky-500 text-white',
    title: 'Samsung Galaxy S24 Series',
    discount: 'Up To 25% OFF',
    subtitle: 'Free 45W GaN Fast Charger + Official Samsung Pakistan Warranty included.',
    brand: 'SAMSUNG',
    image: '/categories/samsung.svg',
    link: '/products?brand=Samsung',
    bgGradient: 'from-sky-100/90 via-sky-50/70 to-white',
    price: 'Rs. 289,999',
    status: 'Active',
    products: [
      { id: 's24-ultra', name: 'Galaxy S24 Ultra', price: 289999, image: '/categories/samsung.svg' },
      { id: 'charger-45w', name: 'Original 45W GaN Fast Charger', price: 9500, image: '/categories/accessories.svg' },
    ],
  },
  {
    id: 2,
    badge: 'APPLE FLAGSHIP FEST',
    badgeColor: 'bg-slate-900 text-white',
    title: 'iPhone 16 Pro & 15 Pro Max',
    discount: 'Official PTA Approved',
    subtitle: 'Complimentary MagSafe Case + 1 Year Official Apple Warranty.',
    brand: 'APPLE',
    image: '/categories/iphone.svg',
    link: '/products?brand=Apple',
    bgGradient: 'from-blue-100/80 via-white to-sky-50/70',
    price: 'Rs. 419,999',
    status: 'Active',
    products: [
      { id: 'iphone-16-pro', name: 'iPhone 16 Pro Max 256GB', price: 419999, image: '/categories/iphone.svg' },
      { id: 'magsafe-case', name: 'Original Apple MagSafe Case', price: 14500, image: '/categories/accessories.svg' },
    ],
  },
  {
    id: 3,
    badge: 'CREATIVE WORKSTATION',
    badgeColor: 'bg-emerald-500 text-white',
    title: 'iPad Pro (M4) & iPad Air',
    discount: 'Bundle Savings',
    subtitle: 'Special educational bundle with Apple Pencil Pro & Smart Folio.',
    brand: 'APPLE IPAD',
    image: '/categories/ipad.svg',
    link: '/products?category=ipad',
    bgGradient: 'from-cyan-100/80 via-sky-50/70 to-white',
    price: 'Rs. 259,999',
    status: 'Active',
    products: [
      { id: 'ipad-pro-m4', name: 'iPad Pro M4 11-inch', price: 229999, image: '/categories/ipad.svg' },
      { id: 'pencil-pro', name: 'Apple Pencil Pro', price: 38000, image: '/categories/accessories.svg' },
    ],
  },
  {
    id: 4,
    badge: 'WEARABLES SALE',
    badgeColor: 'bg-amber-500 text-white',
    title: 'Apple Watch Ultra 2 & Galaxy Watch',
    discount: 'Flat 15% OFF',
    subtitle: 'Precision titanium fitness tracking & ECG sensors.',
    brand: 'SMARTWATCHES',
    image: '/categories/smartwatches.svg',
    link: '/products?category=smart-watches',
    bgGradient: 'from-sky-100/90 via-white to-slate-50',
    price: 'Rs. 195,000',
    status: 'Active',
    products: [
      { id: 'watch-ultra-2', name: 'Apple Watch Ultra 2 Titanium', price: 195000, image: '/categories/smartwatches.svg' },
    ],
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

  // Deals CRUD
  deals: PromoDeal[];
  addDeal: (deal: PromoDeal) => void;
  updateDeal: (id: string | number, updates: Partial<PromoDeal>) => void;
  deleteDeal: (id: string | number) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [banners, setBanners] = useState<BannerItem[]>(INITIAL_BANNERS);
  const [deals, setDeals] = useState<PromoDeal[]>(INITIAL_DEALS);

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

    // 4. Deals
    try {
      const storedDeals = localStorage.getItem('bluebell_deals_store');
      if (storedDeals) {
        const parsedDeals = JSON.parse(storedDeals);
        if (Array.isArray(parsedDeals) && parsedDeals.length > 0) {
          setDeals(parsedDeals);
        }
      } else {
        localStorage.setItem('bluebell_deals_store', JSON.stringify(INITIAL_DEALS));
      }
    } catch (e) {
      console.error('Error loading deals from storage', e);
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
      if (e.key === 'bluebell_deals_store' && e.newValue) {
        try {
          setDeals(JSON.parse(e.newValue));
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

  // --- Deals CRUD ---
  const saveDeals = (updatedList: PromoDeal[]) => {
    setDeals(updatedList);
    try {
      localStorage.setItem('bluebell_deals_store', JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const addDeal = (newDeal: PromoDeal) => {
    const updated = [newDeal, ...deals];
    saveDeals(updated);
  };

  const updateDeal = (id: string | number, updates: Partial<PromoDeal>) => {
    const updated = deals.map((d) => (d.id === id ? { ...d, ...updates } : d));
    saveDeals(updated);
  };

  const deleteDeal = (id: string | number) => {
    const updated = deals.filter((d) => d.id !== id);
    saveDeals(updated);
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
