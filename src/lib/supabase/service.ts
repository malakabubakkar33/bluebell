import { getSupabaseServerClient } from './server';
import { PRODUCTS, CATEGORIES } from '@/lib/data/mockData';
import type { Database } from './database.types';

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type InquiryRow = Database['public']['Tables']['inquiries']['Row'];

// In-memory mock store for session modifications (when Supabase is not configured)
let memoryOrders: OrderRow[] = [
  {
    id: 'ORD-98241',
    customer_name: 'Muhammad Usman',
    customer_email: 'usman.m@example.com',
    customer_phone: '+92 301 8847291',
    shipping_address: 'House #42, Street 8, F-10/2',
    city: 'Islamabad',
    province: 'Islamabad Capital Territory',
    postal_code: '44000',
    payment_method: 'cod',
    items: [
      {
        id: 'iphone-15-pro-max',
        name: 'Apple iPhone 15 Pro Max',
        price: 1199,
        quantity: 1,
        selectedColor: 'Natural Titanium',
        selectedStorage: '256GB',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
      },
    ],
    subtotal: 1199,
    shipping_fee: 0,
    total: 1199,
    status: 'delivered',
    tracking_number: 'TCS-908234812',
    notes: 'Please call before arrival',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ORD-98242',
    customer_name: 'Ayesha Khan',
    customer_email: 'ayesha.k@example.com',
    customer_phone: '+92 321 4455667',
    shipping_address: 'Apartment 4B, Creek Vistas, Phase 8, DHA',
    city: 'Karachi',
    province: 'Sindh',
    postal_code: '75500',
    payment_method: 'bank_transfer',
    items: [
      {
        id: 'samsung-galaxy-s24-ultra',
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299,
        quantity: 1,
        selectedColor: 'Titanium Gray',
        selectedStorage: '512GB',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
      },
    ],
    subtotal: 1299,
    shipping_fee: 0,
    total: 1299,
    status: 'processing',
    tracking_number: 'LEO-44129851',
    notes: '',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

let memoryInquiries: InquiryRow[] = [
  {
    id: 'inq-1',
    name: 'Hamza Tariq',
    email: 'hamza@example.com',
    phone: '+92 333 5566778',
    subject: 'iPhone 15 Pro Max PTA Approval Status',
    message: 'Is the iPhone 15 Pro Max PTA approved and official Apple warranty included?',
    status: 'new',
    created_at: new Date().toISOString(),
  },
];

let memoryProducts = [...PRODUCTS];

// Convert mock product format to DB row format if needed
function mapMockToRow(p: any): ProductRow {
  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle || null,
    brand: p.brand,
    category_slug: p.categorySlug,
    price: p.price,
    original_price: p.originalPrice || null,
    discount_percent: p.discountPercent || null,
    image: p.image,
    gallery: p.gallery || [p.image],
    rating: p.rating,
    reviews_count: p.reviewsCount,
    badge: p.badge || null,
    in_stock: p.inStock,
    stock_count: p.stockCount || 10,
    is_best_seller: Boolean(p.isBestSeller),
    is_featured: Boolean(p.isFeatured),
    is_new_arrival: Boolean(p.isNewArrival),
    specs: p.specs || {},
    storage_options: p.storageOptions || [],
    color_options: p.colorOptions || [],
    warranty: p.warranty || '1 Year Official Warranty',
    sku: p.sku || `BB-${p.id.toUpperCase()}`,
    description: p.description || p.subtitle || '',
    created_at: new Date().toISOString(),
  };
}

export const SupabaseDbService = {
  // PRODUCTS
  async getProducts(params?: {
    categorySlug?: string;
    brand?: string;
    query?: string;
    isBestSeller?: boolean;
    isFeatured?: boolean;
  }) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        let query = supabase.from('products').select('*');
        if (params?.categorySlug) query = query.eq('category_slug', params.categorySlug);
        if (params?.brand) query = query.eq('brand', params.brand);
        if (params?.isBestSeller) query = query.eq('is_best_seller', true);
        if (params?.isFeatured) query = query.eq('is_featured', true);
        if (params?.query) {
          query = query.or(`name.ilike.%${params.query}%,brand.ilike.%${params.query}%,subtitle.ilike.%${params.query}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as ProductRow[];
        }
      } catch (e) {
        console.warn('Supabase query failed, falling back to mock dataset:', e);
      }
    }

    // Mock fallback
    return memoryProducts
      .filter((p) => {
        if (params?.categorySlug && p.categorySlug !== params.categorySlug) return false;
        if (params?.brand && p.brand.toLowerCase() !== params.brand.toLowerCase()) return false;
        if (params?.isBestSeller && !p.isBestSeller) return false;
        if (params?.isFeatured && !p.isFeatured) return false;
        if (params?.query) {
          const q = params.query.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .map(mapMockToRow);
  },

  async getProductBySlugOrId(idOrSlug: string) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`id.eq.${idOrSlug},sku.eq.${idOrSlug}`)
          .single();
        if (!error && data) return data as ProductRow;
      } catch (e) {
        console.warn('Supabase product fetch failed, fallback to mock:', e);
      }
    }

    const found = memoryProducts.find((p) => p.id === idOrSlug || p.id.toLowerCase() === idOrSlug.toLowerCase());
    return found ? mapMockToRow(found) : null;
  },

  async createProduct(product: Partial<ProductRow>) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').insert(product as any).select().single();
        if (!error && data) return data as ProductRow;
      } catch (e) {
        console.warn('Supabase insert failed, storing in memory:', e);
      }
    }

    const newProd: ProductRow = {
      id: product.id || `prod-${Date.now()}`,
      name: product.name || 'New Mobile Device',
      subtitle: product.subtitle || '',
      brand: product.brand || 'Apple',
      category_slug: product.category_slug || 'smartphones',
      price: product.price || 999,
      original_price: product.original_price || null,
      discount_percent: product.discount_percent || null,
      image: product.image || '/logo.png',
      gallery: product.gallery || [product.image || '/logo.png'],
      rating: 5.0,
      reviews_count: 1,
      badge: product.badge || 'New',
      in_stock: product.in_stock ?? true,
      stock_count: product.stock_count ?? 15,
      is_best_seller: Boolean(product.is_best_seller),
      is_featured: Boolean(product.is_featured),
      is_new_arrival: Boolean(product.is_new_arrival),
      specs: product.specs || {},
      storage_options: product.storage_options || ['128GB', '256GB'],
      color_options: product.color_options || [{ name: 'Black', hex: '#000000' }],
      warranty: product.warranty || '1 Year Official Warranty',
      sku: product.sku || `BB-${Date.now()}`,
      description: product.description || '',
      created_at: new Date().toISOString(),
    };

    memoryProducts.unshift(newProd as any);
    return newProd;
  },

  async updateProduct(id: string, updates: any) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
        if (!error && data) return data as ProductRow;
      } catch (e) {
        console.warn('Supabase product update failed:', e);
      }
    }
    const idx = memoryProducts.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      memoryProducts[idx] = { ...memoryProducts[idx], ...updates };
      return memoryProducts[idx];
    }
    return null;
  },

  async deleteProduct(id: string) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase product delete failed:', e);
      }
    }
    memoryProducts = memoryProducts.filter((p: any) => p.id !== id);
    return true;
  },

  // CATEGORIES
  async getCategories() {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*');
        if (!error && data && data.length > 0) return data as CategoryRow[];
      } catch (e) {
        console.warn('Supabase categories fetch failed, fallback to mock:', e);
      }
    }

    return CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: null,
      icon: c.icon || null,
      item_count: c.itemCount,
      created_at: new Date().toISOString(),
    }));
  },

  // ORDERS
  async getOrders() {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as OrderRow[];
      } catch (e) {
        console.warn('Supabase orders fetch failed, fallback to memory:', e);
      }
    }
    return memoryOrders;
  },

  async getOrderById(id: string) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!error && data) return data as OrderRow;
      } catch (e) {
        console.warn('Supabase getOrderById failed, fallback to memory:', e);
      }
    }
    return memoryOrders.find((o) => o.id.toLowerCase() === id.toLowerCase()) || null;
  },

  async createOrder(orderInput: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    province: string;
    postal_code?: string;
    payment_method: 'cod' | 'bank_transfer' | 'easypaisa' | 'jazzcash';
    items: any[];
    subtotal: number;
    shipping_fee: number;
    total: number;
    notes?: string;
  }) {
    const orderId = `BB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: OrderRow = {
      id: orderId,
      customer_name: orderInput.customer_name,
      customer_email: orderInput.customer_email,
      customer_phone: orderInput.customer_phone,
      shipping_address: orderInput.shipping_address,
      city: orderInput.city,
      province: orderInput.province,
      postal_code: orderInput.postal_code || null,
      payment_method: orderInput.payment_method,
      items: orderInput.items,
      subtotal: orderInput.subtotal,
      shipping_fee: orderInput.shipping_fee,
      total: orderInput.total,
      status: 'pending',
      tracking_number: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: orderInput.notes || null,
      created_at: new Date().toISOString(),
    };

    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('orders').insert(newOrder as any).select().single();
        if (!error && data) return data as OrderRow;
      } catch (e) {
        console.warn('Supabase order creation failed, storing in memory:', e);
      }
    }

    memoryOrders.unshift(newOrder);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderRow['status']) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await (supabase as any)
          .from('orders')
          .update({ status })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) return data as OrderRow;
      } catch (e) {
        console.warn('Supabase update order failed:', e);
      }
    }

    const order = memoryOrders.find((o) => o.id === id);
    if (order) {
      order.status = status;
      return order;
    }
    return null;
  },

  // INQUIRIES
  async getInquiries() {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as InquiryRow[];
      } catch (e) {
        console.warn('Supabase inquiries fetch failed:', e);
      }
    }
    return memoryInquiries;
  },

  async createInquiry(input: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    const newInquiry: InquiryRow = {
      id: `inq-${Date.now()}`,
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      subject: input.subject,
      message: input.message,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    const supabase = await getSupabaseServerClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('inquiries').insert(newInquiry as any).select().single();
        if (!error && data) return data as InquiryRow;
      } catch (e) {
        console.warn('Supabase inquiry insert failed:', e);
      }
    }

    memoryInquiries.unshift(newInquiry);
    return newInquiry;
  },
};
