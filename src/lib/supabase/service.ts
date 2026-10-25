import { getSupabaseAdminClient } from './admin';
import { getSupabaseServerClient } from './server';
import type { Database } from './database.types';
import { Product, Category } from '@/types';

export type ProductRow = Database['public']['Tables']['products']['Row'];
export type CategoryRow = Database['public']['Tables']['categories']['Row'];
export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type InquiryRow = Database['public']['Tables']['inquiries']['Row'];

// Helper to get authoritative client (admin service role preferred for server routes, fallback to server client)
function getDbClient() {
  const adminClient = getSupabaseAdminClient();
  if (adminClient) return adminClient;
  return null;
}

import { doesProductBelongToCategory } from '@/lib/categoryUtils';
export { doesProductBelongToCategory };

export const SupabaseDbService = {
  // ==========================================
  // PRODUCTS
  // ==========================================
  async getProducts(params?: {
    categorySlug?: string;
    brand?: string;
    query?: string;
    isBestSeller?: boolean;
    isFeatured?: boolean;
  }) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        let query = (client as any).from('products').select('*').order('created_at', { ascending: false });

        if (params?.categorySlug && params.categorySlug !== 'all') {
          const cat = params.categorySlug.toLowerCase();
          if (cat === 'smartphones') {
            query = query.in('category_slug', ['smartphones', 'iphone', 'samsung']);
          } else if (cat === 'accessories') {
            query = query.in('category_slug', ['accessories', 'chargers', 'cases', 'audio']);
          } else if (cat === 'tablets' || cat === 'ipad') {
            query = query.in('category_slug', ['tablets', 'ipad']);
          } else if (cat === 'smartwatches' || cat === 'smart-watches') {
            query = query.in('category_slug', ['smartwatches', 'smart-watches']);
          } else if (cat === 'chargers' || cat === 'chargers-cables') {
            query = query.in('category_slug', ['chargers', 'chargers-cables']);
          } else if (cat === 'cases' || cat === 'cases-covers') {
            query = query.in('category_slug', ['cases', 'cases-covers']);
          } else {
            query = query.eq('category_slug', params.categorySlug);
          }
        }
        if (params?.brand && params.brand !== 'all') {
          query = query.ilike('brand', params.brand);
        }
        if (params?.isBestSeller) {
          query = query.eq('is_best_seller', true);
        }
        if (params?.isFeatured) {
          query = query.eq('is_featured', true);
        }
        if (params?.query) {
          query = query.or(
            `name.ilike.%${params.query}%,brand.ilike.%${params.query}%,subtitle.ilike.%${params.query}%`
          );
        }

        const { data, error } = await query;
        if (!error && Array.isArray(data)) {
          return data.map(mapProductRowToModel);
        }
        if (error) {
          console.error('Supabase getProducts error:', error.message);
        }
      } catch (e: any) {
        console.error('getProducts exception:', e?.message);
      }
    }

    return [];
  },

  async getProductBySlugOrId(idOrSlug: string) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        const { data, error } = await (client as any)
          .from('products')
          .select('*')
          .or(`id.eq.${idOrSlug},sku.eq.${idOrSlug}`)
          .limit(1);

        if (!error && data && data.length > 0) {
          return mapProductRowToModel(data[0]);
        }
      } catch (e: any) {
        console.error('getProductBySlugOrId error:', e?.message);
      }
    }

    return null;
  },

  async createProduct(product: Partial<Product>) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) {
      throw new Error('Database client not configured');
    }

    const productId = product.id || `prod-${Date.now()}`;
    const row = {
      id: productId,
      name: product.name,
      subtitle: product.subtitle || '',
      brand: product.brand || 'Apple',
      category_slug: product.categorySlug || 'smartphones',
      price: Number(product.price) || 0,
      original_price: product.originalPrice ? Number(product.originalPrice) : null,
      discount_percent: product.originalPrice && product.originalPrice > (product.price || 0)
        ? Math.round((((product.originalPrice - (product.price || 0)) / product.originalPrice) * 100))
        : null,
      image: product.image || '/categories/iphone.svg',
      gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image || '/categories/iphone.svg'],
      rating: product.rating || 5.0,
      reviews_count: product.reviewCount || 0,
      badge: product.badge || null,
      in_stock: (product.stock ?? 10) > 0,
      stock_count: product.stock ?? 10,
      is_best_seller: Boolean(product.isBestSeller),
      is_featured: Boolean(product.isFeatured ?? true),
      is_new_arrival: Boolean(product.badge === 'New'),
      specs: {},
      storage_options: ['128GB', '256GB', '512GB'],
      color_options: [],
      warranty: product.warranty || '1 Year Official Brand Warranty (PTA Approved)',
      sku: `BB-${productId.toUpperCase()}`,
      description: product.description || product.subtitle || '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any)
      .from('products')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('createProduct error:', error.message);
      throw new Error(error.message);
    }

    return mapProductRowToModel(data);
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) {
      throw new Error('Database client not configured');
    }

    const rowUpdates: Record<string, any> = {};
    if (updates.name !== undefined) rowUpdates.name = updates.name;
    if (updates.brand !== undefined) rowUpdates.brand = updates.brand;
    if (updates.categorySlug !== undefined) rowUpdates.category_slug = updates.categorySlug;
    if (updates.price !== undefined) rowUpdates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) rowUpdates.original_price = Number(updates.originalPrice);
    if (updates.stock !== undefined) {
      rowUpdates.stock_count = Number(updates.stock);
      rowUpdates.in_stock = Number(updates.stock) > 0;
    }
    if (updates.badge !== undefined) rowUpdates.badge = updates.badge;
    if (updates.image !== undefined) rowUpdates.image = updates.image;
    if (updates.warranty !== undefined) rowUpdates.warranty = updates.warranty;
    if (updates.description !== undefined) rowUpdates.description = updates.description;

    const { data, error } = await (client as any)
      .from('products')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('updateProduct error:', error.message);
      throw new Error(error.message);
    }

    return mapProductRowToModel(data);
  },

  async deleteProduct(id: string) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) {
      throw new Error('Database client not configured');
    }

    const { error } = await (client as any).from('products').delete().eq('id', id);
    if (error) {
      console.error('deleteProduct error:', error.message);
      throw new Error(error.message);
    }
    return true;
  },

  // ==========================================
  // CATEGORIES WITH DYNAMIC PRODUCT COUNTS
  // ==========================================
  async getCategories() {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        // Fetch active categories and products concurrently to compute real item counts
        const [catsRes, prodsRes] = await Promise.all([
          (client as any)
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('name'),
          (client as any).from('products').select('category_slug, brand'),
        ]);

        if (!catsRes.error && Array.isArray(catsRes.data)) {
          const prodsList = Array.isArray(prodsRes.data) ? prodsRes.data : [];

          return catsRes.data.map((c: any) => {
            const matchingCount = prodsList.filter((p: any) =>
              doesProductBelongToCategory(p.category_slug, p.brand, c.slug)
            ).length;

            return {
              id: c.id,
              name: c.name,
              slug: c.slug,
              image: c.image || (c.slug ? `/categories/${c.slug}.svg` : '/categories/iphone.svg'),
              icon: c.icon || 'Layers',
              description: c.description || '',
              isActive: c.is_active !== false,
              itemCount: matchingCount, // Real, calculated product count
            };
          });
        }
        if (catsRes.error) {
          console.error('Supabase getCategories error:', catsRes.error.message);
        }
      } catch (e: any) {
        console.error('getCategories error:', e?.message);
      }
    }

    return [];
  },

  async createCategory(category: Partial<Category>) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    if (!category.name || !category.name.trim()) {
      throw new Error('Category name is required');
    }

    const trimmedName = category.name.trim();
    const rawSlug = category.slug || trimmedName;
    const cleanSlug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'category';

    const catId = category.id || `cat-${Date.now()}`;
    const image = category.image || '/categories/iphone.svg';

    const row = {
      id: catId,
      name: trimmedName,
      slug: cleanSlug,
      image,
      icon: category.icon || 'Layers',
      description: category.description || null,
      is_active: category.isActive !== undefined ? category.isActive : true,
      item_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any)
      .from('categories')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error('createCategory database error:', error.message);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      image: data.image || image,
      icon: data.icon || 'Layers',
      description: data.description || '',
      isActive: data.is_active !== false,
      itemCount: 0,
    };
  },

  async updateCategory(id: string, updates: Partial<Category>) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const rowUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) rowUpdates.name = updates.name.trim();
    if (updates.slug !== undefined) {
      rowUpdates.slug = updates.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (updates.image !== undefined) rowUpdates.image = updates.image;
    if (updates.icon !== undefined) rowUpdates.icon = updates.icon;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.isActive !== undefined) rowUpdates.is_active = updates.isActive;

    const { data, error } = await (client as any)
      .from('categories')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('updateCategory error:', error.message);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      image: data.image || `/categories/${data.slug}.svg`,
      icon: data.icon || 'Layers',
      description: data.description || '',
      isActive: data.is_active !== false,
      itemCount: data.item_count || 0,
    };
  },

  async deleteCategory(id: string) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('categories').delete().eq('id', id);
    if (error) {
      console.error('deleteCategory error:', error.message);
      throw new Error(error.message);
    }
    return true;
  },

  // ==========================================
  // ORDERS (AUTHENTIC REAL DATABASE RECORDS)
  // ==========================================
  async getOrders(userEmail?: string) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        let query = (client as any)
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (userEmail && userEmail.trim()) {
          query = query.ilike('customer_email', userEmail.trim());
        }

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          return data.map(mapOrderRowToModel);
        }
        if (error) {
          console.error('getOrders error:', error.message);
        }
      } catch (e: any) {
        console.error('getOrders exception:', e?.message);
      }
    }

    return [];
  },

  async getOrderById(searchQuery: string) {
    const q = searchQuery.trim();
    const cleanPhone = q.replace(/[^0-9]/g, '');

    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        // Direct query by ID or tracking number
        const { data: directData, error: directErr } = await (client as any)
          .from('orders')
          .select('*')
          .or(`id.ilike.%${q}%,tracking_number.ilike.%${q}%`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!directErr && directData && directData.length > 0) {
          return mapOrderRowToModel(directData[0]);
        }

        // Search by phone number (at least 7 digits)
        if (cleanPhone.length >= 7) {
          const last7 = cleanPhone.slice(-7);
          const { data: phoneData, error: phoneErr } = await (client as any)
            .from('orders')
            .select('*')
            .or(`customer_phone.ilike.%${last7}%,customer_whatsapp.ilike.%${last7}%`)
            .order('created_at', { ascending: false })
            .limit(1);

          if (!phoneErr && phoneData && phoneData.length > 0) {
            return mapOrderRowToModel(phoneData[0]);
          }
        }
      } catch (e: any) {
        console.error('getOrderById error:', e?.message);
      }
    }

    return null;
  },

  async createOrder(orderInput: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_whatsapp?: string;
    shipping_address: string;
    city: string;
    province: string;
    postal_code?: string;
    payment_method: string;
    items: any[];
    subtotal?: number;
    shipping_fee?: number;
    total?: number;
    notes?: string;
  }) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const items = Array.isArray(orderInput.items) ? orderInput.items : [];
    if (items.length === 0) {
      throw new Error('Order items cannot be empty');
    }

    // 1. Fetch real product records from database to verify prices and stock
    const productIds = items.map((it: any) => it.productId || it.id).filter(Boolean);
    const { data: dbProducts, error: prodErr } = await (client as any)
      .from('products')
      .select('*')
      .in('id', productIds);

    if (prodErr || !dbProducts) {
      console.warn('Could not fetch DB products during order verification:', prodErr?.message);
    }

    const dbProductMap = new Map<string, any>();
    if (Array.isArray(dbProducts)) {
      dbProducts.forEach((p: any) => dbProductMap.set(p.id, p));
    }

    // 2. Validate items, recalculate authoritative subtotal, and deduct stock
    let verifiedSubtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pId = item.productId || item.id;
      const dbProd = dbProductMap.get(pId);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = dbProd ? Number(dbProd.price) : (Number(item.price) || 0);

      // Verify stock if db product found
      if (dbProd) {
        const currentStock = Number(dbProd.stock_count ?? 10);
        if (currentStock < quantity) {
          throw new Error(`Insufficient stock for "${dbProd.name}". Available: ${currentStock}, Requested: ${quantity}`);
        }

        // Deduct inventory
        const newStock = Math.max(0, currentStock - quantity);
        await (client as any)
          .from('products')
          .update({
            stock_count: newStock,
            in_stock: newStock > 0,
          })
          .eq('id', pId);
      }

      verifiedSubtotal += unitPrice * quantity;
      verifiedItems.push({
        id: pId,
        name: dbProd ? dbProd.name : (item.name || 'Product'),
        price: unitPrice,
        quantity,
        selectedStorage: item.selectedStorage,
        selectedColor: item.selectedColor,
        image: dbProd ? dbProd.image : item.image,
      });
    }

    // Authoritative shipping fee & grand total calculation
    const freeShippingThreshold = 25000;
    const verifiedShippingFee = verifiedSubtotal >= freeShippingThreshold ? 0 : 500;
    const verifiedTotal = verifiedSubtotal + verifiedShippingFee;

    const orderId = `BB-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const whatsapp = orderInput.customer_whatsapp || orderInput.customer_phone;

    let method = (orderInput.payment_method || 'cod').toLowerCase().trim();
    if (method.includes('cod') || method.includes('cash')) method = 'cod';
    else if (method.includes('bank')) method = 'bank_transfer';
    else if (method.includes('easy')) method = 'easypaisa';
    else if (method.includes('jazz')) method = 'jazzcash';
    else method = 'cod';

    const row = {
      id: orderId,
      customer_name: orderInput.customer_name.trim(),
      customer_email: (orderInput.customer_email || 'guest@bluebell.pk').trim().toLowerCase(),
      customer_phone: orderInput.customer_phone.trim(),
      customer_whatsapp: whatsapp.trim(),
      shipping_address: orderInput.shipping_address.trim(),
      city: orderInput.city || 'Peshawar',
      province: orderInput.province || 'Khyber Pakhtunkhwa',
      postal_code: orderInput.postal_code || null,
      payment_method: method,
      items: verifiedItems,
      subtotal: verifiedSubtotal,
      shipping_fee: verifiedShippingFee,
      total: verifiedTotal,
      status: 'pending',
      tracking_number: trackingNumber,
      notes: orderInput.notes || '',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any)
      .from('orders')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('createOrder error:', error.message);
      throw new Error(error.message);
    }

    // 3. Update customer stats in public.app_users if registered
    if (orderInput.customer_email && orderInput.customer_email.includes('@')) {
      try {
        const { data: userRec } = await (client as any)
          .from('app_users')
          .select('id, orders_count, total_spent')
          .eq('email', orderInput.customer_email.trim().toLowerCase())
          .maybeSingle();

        if (userRec) {
          const newOrdersCount = (Number(userRec.orders_count) || 0) + 1;
          const newTotalSpent = (Number(userRec.total_spent) || 0) + verifiedTotal;
          await (client as any)
            .from('app_users')
            .update({
              orders_count: newOrdersCount,
              total_spent: newTotalSpent,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userRec.id);
        }
      } catch (userErr: any) {
        console.warn('Could not update user stats after order:', userErr?.message);
      }
    }

    return mapOrderRowToModel(data);
  },

  async updateOrderStatus(id: string, status: string) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { data, error } = await (client as any)
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapOrderRowToModel(data);
  },

  async deleteOrder(id: string) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('orders').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  // ==========================================
  // BANNERS
  // ==========================================
  async getBanners() {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        const { data, error } = await (client as any)
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (e: any) {
        console.error('getBanners error:', e?.message);
      }
    }
    return [];
  },

  async createBanner(banner: any) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { data, error } = await (client as any)
      .from('banners')
      .upsert(banner, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateBanner(id: string | number, updates: any) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { data, error } = await (client as any)
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteBanner(id: string | number) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('banners').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  // ==========================================
  // DEALS
  // ==========================================
  async getDeals() {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        const { data, error } = await (client as any)
          .from('deals')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (e: any) {
        console.error('getDeals error:', e?.message);
      }
    }
    return [];
  },

  async createDeal(deal: any) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { data, error } = await (client as any)
      .from('deals')
      .upsert(deal, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateDeal(id: string | number, updates: any) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { data, error } = await (client as any)
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteDeal(id: string | number) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('deals').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  // ==========================================
  // INQUIRIES
  // ==========================================
  async getInquiries() {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        const { data, error } = await (client as any)
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data;
        }
      } catch (e: any) {
        console.error('getInquiries error:', e?.message);
      }
    }
    return [];
  },

  async createInquiry(input: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const row = {
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      subject: input.subject || 'Website General Inquiry',
      message: input.message,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any).from('inquiries').insert([row]).select().single();
    if (error) {
      console.error('createInquiry error:', error.message);
      throw new Error(error.message);
    }
    return data || row;
  },

  // ==========================================
  // COUPONS
  // ==========================================
  async getCoupons() {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (client) {
      try {
        const { data, error } = await (client as any)
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) return data;
      } catch (e: any) {
        console.error('getCoupons error:', e?.message);
      }
    }
    return [];
  },

  async createCoupon(coupon: any) {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (!client) throw new Error('Database client not configured');

    const row = {
      id: coupon.id || `cpn-${Date.now()}`,
      code: (coupon.code || '').trim().toUpperCase(),
      discount_type: coupon.discount_type || coupon.type?.toLowerCase() || 'percentage',
      discount_value: Number(coupon.discount_value || String(coupon.discount || '').replace(/[^0-9]/g, '') || 10),
      min_order: Number(coupon.min_order || String(coupon.minSpend || '').replace(/[^0-9]/g, '') || 0),
      usage_limit: Number(coupon.usage_limit || 100),
      used_count: Number(coupon.used_count || 0),
      status: coupon.status || 'Active',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any)
      .from('coupons')
      .upsert(row, { onConflict: 'code' })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateCoupon(id: string, updates: any) {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (!client) throw new Error('Database client not configured');

    const rowUpdates: Record<string, any> = {};
    if (updates.code) rowUpdates.code = updates.code.trim().toUpperCase();
    if (updates.discount_type) rowUpdates.discount_type = updates.discount_type;
    if (updates.discount_value !== undefined) rowUpdates.discount_value = Number(updates.discount_value);
    if (updates.min_order !== undefined) rowUpdates.min_order = Number(updates.min_order);
    if (updates.status) rowUpdates.status = updates.status;

    const { data, error } = await (client as any)
      .from('coupons')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteCoupon(id: string) {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('coupons').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },

  // ==========================================
  // REVIEWS
  // ==========================================
  async getReviews() {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (client) {
      try {
        const { data, error } = await (client as any)
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) return data;
      } catch (e: any) {
        console.error('getReviews error:', e?.message);
      }
    }
    return [];
  },

  async createReview(review: any) {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (!client) throw new Error('Database client not configured');

    const row = {
      id: review.id || `rev-${Date.now()}`,
      customer_name: review.customer_name || review.customer || 'Verified Customer',
      customer_email: review.customer_email || null,
      product_id: review.product_id || null,
      product_name: review.product_name || review.product || 'Mobile Phone',
      rating: Number(review.rating || 5),
      comment: review.comment || '',
      status: review.status || 'Approved',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any)
      .from('reviews')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateReview(id: string, updates: any) {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (!client) throw new Error('Database client not configured');

    const rowUpdates: Record<string, any> = {};
    if (updates.status) rowUpdates.status = updates.status;
    if (updates.rating !== undefined) rowUpdates.rating = Number(updates.rating);
    if (updates.comment) rowUpdates.comment = updates.comment;

    const { data, error } = await (client as any)
      .from('reviews')
      .update(rowUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async deleteReview(id: string) {
    let client = getDbClient();
    if (!client) client = (await getSupabaseServerClient()) as any;
    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('reviews').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  },
};

// Converters
function mapProductRowToModel(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    slug: r.id,
    brand: r.brand,
    category: r.category_slug,
    categorySlug: r.category_slug,
    subtitle: r.subtitle || '',
    description: r.description || '',
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    rating: Number(r.rating || 5.0),
    reviewCount: Number(r.reviews_count || 0),
    badge: r.badge || undefined,
    image: r.image,
    gallery: Array.isArray(r.gallery) && r.gallery.length > 0 ? r.gallery : [r.image],
    stock: Number(r.stock_count ?? (r.in_stock ? 10 : 0)),
    warranty: r.warranty || '1 Year Official Warranty',
    isBestSeller: Boolean(r.is_best_seller),
    isFeatured: Boolean(r.is_featured),
    variants: [],
  };
}

function mapOrderRowToModel(r: any) {
  return {
    id: r.id,
    customer_name: r.customer_name,
    customer_email: r.customer_email,
    customer_phone: r.customer_phone,
    customer_whatsapp: r.customer_whatsapp || r.customer_phone,
    shipping_address: r.shipping_address,
    city: r.city,
    province: r.province,
    postal_code: r.postal_code,
    payment_method: r.payment_method,
    items: Array.isArray(r.items) ? r.items : [],
    subtotal: Number(r.subtotal),
    shipping_fee: Number(r.shipping_fee || 0),
    total: Number(r.total),
    status: r.status,
    tracking_number: r.tracking_number,
    notes: r.notes,
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
    created_at: r.created_at,
  };
}
