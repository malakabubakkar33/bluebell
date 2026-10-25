export interface ProductVariant {
  id: string;
  sku: string;
  storage?: string;
  color?: string;
  colorHex?: string;
  condition?: 'Brand New' | 'Open Box' | 'Certified Pre-Owned';
  price: number;
  originalPrice?: number;
  stock: number;
  images?: string[];
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categorySlug: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  badge?: string;
  image: string;
  gallery: string[];
  stock: number;
  warranty: string;
  guarantee?: string;
  sku?: string;
  specs?: Record<string, any>;
  storageOptions?: string[];
  colorOptions?: ColorOption[];
  variants?: ProductVariant[];
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon?: string;
  description?: string;
  itemCount: number;
  isActive?: boolean;
}

export interface CartItem {
  productId: string;
  id?: string;
  variantId?: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedStorage?: string;
  selectedColor?: string;
  maxStock: number;
}
