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
    inStockOnly?: boolean;
    status?: 'all' | 'published' | 'unpublished';
  }) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (client) {
      try {
        let query = (client as any).from('products').select('*').order('created_at', { ascending: false });

        if (params?.status === 'published' || params?.inStockOnly) {
          query = query.eq('in_stock', true);
        } else if (params?.status === 'unpublished') {
          query = query.eq('in_stock', false);
        }

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
            `name.ilike.%${params.query}%,brand.ilike.%${params.query}%,subtitle.ilike.%${params.query}%,sku.ilike.%${params.query}%`
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
    const inStock = (product as any).inStock !== undefined
      ? Boolean((product as any).inStock)
      : (product.stock !== undefined ? Number(product.stock) > 0 : true);

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
      in_stock: inStock,
      stock_count: product.stock !== undefined ? Number(product.stock) : 10,
      is_best_seller: Boolean(product.isBestSeller),
      is_featured: Boolean(product.isFeatured ?? true),
      is_new_arrival: Boolean(product.badge === 'New' || product.isNewArrival),
      specs: product.specs || {},
      storage_options: product.storageOptions || ['128GB', '256GB', '512GB'],
      color_options: product.colorOptions || [],
      warranty: product.warranty || '1 Year Official Brand Warranty (PTA Approved)',
      sku: product.sku?.trim() || `BB-${productId.toUpperCase()}`,
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
    if (updates.discountPercent !== undefined) rowUpdates.discount_percent = Number(updates.discountPercent);
    if (updates.stock !== undefined) {
      rowUpdates.stock_count = Number(updates.stock);
      // Only auto-derive in_stock if inStock wasn't explicitly supplied
      if ((updates as any).inStock === undefined) {
        rowUpdates.in_stock = Number(updates.stock) > 0;
      }
    }
    if ((updates as any).inStock !== undefined) {
      rowUpdates.in_stock = Boolean((updates as any).inStock);
    }
    if (updates.badge !== undefined) rowUpdates.badge = updates.badge;
    if (updates.image !== undefined) rowUpdates.image = updates.image;
    if (updates.gallery !== undefined) rowUpdates.gallery = updates.gallery;
    if (updates.warranty !== undefined) rowUpdates.warranty = updates.warranty;
    if (updates.description !== undefined) rowUpdates.description = updates.description;
    if (updates.subtitle !== undefined) rowUpdates.subtitle = updates.subtitle;
    if (updates.sku !== undefined) rowUpdates.sku = updates.sku;
    if (updates.isFeatured !== undefined) rowUpdates.is_featured = Boolean(updates.isFeatured);
    if (updates.isBestSeller !== undefined) rowUpdates.is_best_seller = Boolean(updates.isBestSeller);
    if (updates.isNewArrival !== undefined) rowUpdates.is_new_arrival = Boolean(updates.isNewArrival);
    if (updates.specs !== undefined) rowUpdates.specs = updates.specs;

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

    // 1. Check if product is referenced in orders to preserve historical integrity
    try {
      const { data: orderData } = await (client as any)
        .from('orders')
        .select('id, items')
        .limit(100);

      const hasOrderHistory = Array.isArray(orderData) && orderData.some((order: any) => {
        if (!Array.isArray(order.items)) return false;
        return order.items.some((item: any) => item.id === id || item.productId === id);
      });

      if (hasOrderHistory) {
        // Safe archive: unpublish and zero stock to preserve historical order references
        await (client as any)
          .from('products')
          .update({ in_stock: false, stock_count: 0 })
          .eq('id', id);
        return {
          success: true,
          archived: true,
          message: 'Product is referenced in historical customer orders. Safely archived and unpublished instead of hard-deleted.',
        };
      }
    } catch (checkErr) {
      console.warn('Order check before delete warning:', checkErr);
    }

    // 2. Safe to delete permanently if no historical references
    const { error } = await (client as any).from('products').delete().eq('id', id);
    if (error) {
      console.error('deleteProduct error:', error.message);
      throw new Error(error.message);
    }
    return {
      success: true,
      archived: false,
      message: 'Product permanently removed from database.',
    };
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

    // Check if category with this slug or name already exists in database
    let targetId = category.id;
    try {
      const { data: existingRows } = await (client as any)
        .from('categories')
        .select('id, name, slug')
        .or(`slug.eq.${cleanSlug},name.ilike.${trimmedName}`);

      if (existingRows && existingRows.length > 0) {
        targetId = existingRows[0].id;
      }
    } catch (e: any) {
      console.warn('[createCategory] existing category check notice:', e?.message);
    }

    if (!targetId) {
      targetId = `cat-${Date.now()}`;
    }

    const image = category.image || '/categories/iphone.svg';

    const row = {
      id: targetId,
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
      .upsert(row, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('[createCategory] database error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw new Error(error.message || 'Failed to create category in database');
    }

    const saved = data || row;

    return {
      id: saved.id,
      name: saved.name,
      slug: saved.slug,
      image: saved.image || image,
      icon: saved.icon || 'Layers',
      description: saved.description || '',
      isActive: saved.is_active !== false,
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
      .or(`id.eq.${id},slug.eq.${id}`)
      .select()
      .maybeSingle();

    if (error) {
      console.error('[updateCategory] database error:', {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw new Error(error.message || 'Failed to update category in database');
    }

    const updated = data || { id, ...updates };

    return {
      id: updated.id,
      name: updated.name || updates.name || '',
      slug: updated.slug || updates.slug || '',
      image: updated.image || updates.image || `/categories/${updated.slug || 'iphone'}.svg`,
      icon: updated.icon || updates.icon || 'Layers',
      description: updated.description || updates.description || '',
      isActive: updated.is_active !== false,
      itemCount: 0,
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
          return data.map((row: any) => ({
            id: row.id,
            image: row.image || '/banners/hero-samsung-s24.jpg',
            mobileImage: row.mobile_image || undefined,
            title: row.title || 'Hero Banner',
            titlePrefix: row.title_prefix || undefined,
            titleHighlight: row.title_highlight || undefined,
            brand: row.brand || undefined,
            tag: row.tag || undefined,
            tagline: row.tagline || undefined,
            subtitle: row.subtitle || undefined,
            price: row.price || undefined,
            link: row.link || '/products',
            status: row.status === 'Inactive' ? 'Inactive' : 'Active',
            validPeriod: row.valid_period || 'Ongoing',
            specs: Array.isArray(row.specs) ? row.specs : [],
            themeColor: row.theme_color || '#0284c7',
          }));
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

    const bannerId = String(banner.id || `banner-${Date.now()}`);
    const fullTitle = banner.title || `${banner.titlePrefix || ''}${banner.titleHighlight || ''}`.trim() || 'Hero Banner';
    const row = {
      id: bannerId,
      title: fullTitle,
      title_prefix: banner.titlePrefix || null,
      title_highlight: banner.titleHighlight || null,
      brand: banner.brand || null,
      tag: banner.tag || null,
      tagline: banner.tagline || null,
      subtitle: banner.subtitle || null,
      price: banner.price || null,
      image: banner.image || '/banners/hero-samsung-s24.jpg',
      mobile_image: banner.mobileImage || null,
      link: banner.link || '/products',
      status: banner.status === 'Inactive' ? 'Inactive' : 'Active',
      valid_period: banner.validPeriod || null,
      theme_color: banner.themeColor || banner.color || '#0284c7',
      specs: Array.isArray(banner.specs) ? banner.specs : [],
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any)
      .from('banners')
      .upsert(row, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('[createBanner] database error:', error.message);
      throw new Error(error.message);
    }
    const saved = data || row;
    return {
      id: saved.id,
      image: saved.image,
      mobileImage: saved.mobile_image || undefined,
      title: saved.title,
      titlePrefix: saved.title_prefix || undefined,
      titleHighlight: saved.title_highlight || undefined,
      brand: saved.brand || undefined,
      tag: saved.tag || undefined,
      tagline: saved.tagline || undefined,
      subtitle: saved.subtitle || undefined,
      price: saved.price || undefined,
      link: saved.link,
      status: saved.status,
      validPeriod: saved.valid_period,
      specs: saved.specs || [],
      themeColor: saved.theme_color,
    };
  },

  async updateBanner(id: string | number, updates: any) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const rowUpdates: Record<string, any> = {};
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.titlePrefix !== undefined) rowUpdates.title_prefix = updates.titlePrefix;
    if (updates.titleHighlight !== undefined) rowUpdates.title_highlight = updates.titleHighlight;
    if (updates.brand !== undefined) rowUpdates.brand = updates.brand;
    if (updates.tag !== undefined) rowUpdates.tag = updates.tag;
    if (updates.tagline !== undefined) rowUpdates.tagline = updates.tagline;
    if (updates.subtitle !== undefined) rowUpdates.subtitle = updates.subtitle;
    if (updates.price !== undefined) rowUpdates.price = updates.price;
    if (updates.image !== undefined) rowUpdates.image = updates.image;
    if (updates.mobileImage !== undefined) rowUpdates.mobile_image = updates.mobileImage;
    if (updates.link !== undefined) rowUpdates.link = updates.link;
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.validPeriod !== undefined) rowUpdates.valid_period = updates.validPeriod;
    if (updates.themeColor !== undefined) rowUpdates.theme_color = updates.themeColor;
    if (updates.specs !== undefined) rowUpdates.specs = updates.specs;

    const { data, error } = await (client as any)
      .from('banners')
      .update(rowUpdates)
      .eq('id', String(id))
      .select()
      .maybeSingle();

    if (error) {
      console.error('[updateBanner] database error:', error.message);
      throw new Error(error.message);
    }
    const updated = data || { id, ...rowUpdates };
    return {
      id: updated.id,
      image: updated.image,
      mobileImage: updated.mobile_image || undefined,
      title: updated.title,
      titlePrefix: updated.title_prefix || undefined,
      titleHighlight: updated.title_highlight || undefined,
      brand: updated.brand || undefined,
      tag: updated.tag || undefined,
      tagline: updated.tagline || undefined,
      subtitle: updated.subtitle || undefined,
      price: updated.price || undefined,
      link: updated.link,
      status: updated.status,
      validPeriod: updated.valid_period,
      specs: updated.specs || [],
      themeColor: updated.theme_color,
    };
  },

  async deleteBanner(id: string | number) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('banners').delete().eq('id', String(id));
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
          return data.map((row: any) => ({
            id: row.id,
            badge: row.badge || 'SPECIAL OFFER',
            badgeColor: row.badge_color || undefined,
            title: row.title || 'Special Promotion',
            discount: row.discount || 'Special Price',
            subtitle: row.subtitle || '',
            brand: row.brand || '',
            image: row.image || '/categories/samsung.svg',
            link: row.link || '/products',
            bgGradient: row.bg_gradient || undefined,
            price: row.price || undefined,
            products: Array.isArray(row.products) ? row.products : [],
            status: row.status === 'Inactive' ? 'Inactive' : 'Active',
          }));
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

    const dealId = String(deal.id || `deal-${Date.now()}`);
    const row = {
      id: dealId,
      badge: deal.badge || 'SPECIAL OFFER',
      badge_color: deal.badgeColor || null,
      title: deal.title || 'Special Promotion',
      discount: deal.discount || 'Special Price',
      subtitle: deal.subtitle || null,
      brand: deal.brand || null,
      image: deal.image || '/categories/samsung.svg',
      link: deal.link || '/products',
      bg_gradient: deal.bgGradient || deal.bgColor || null,
      price: deal.price ? String(deal.price) : null,
      status: deal.status === 'Inactive' ? 'Inactive' : 'Active',
      products: Array.isArray(deal.products) ? deal.products : [],
      created_at: new Date().toISOString(),
    };

    const { data, error } = await (client as any)
      .from('deals')
      .upsert(row, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('[createDeal] database error:', error.message);
      throw new Error(error.message);
    }
    const saved = data || row;
    return {
      id: saved.id,
      badge: saved.badge,
      badgeColor: saved.badge_color || undefined,
      title: saved.title,
      discount: saved.discount,
      subtitle: saved.subtitle || '',
      brand: saved.brand || '',
      image: saved.image,
      link: saved.link,
      bgGradient: saved.bg_gradient || undefined,
      price: saved.price || undefined,
      products: saved.products || [],
      status: saved.status,
    };
  },

  async updateDeal(id: string | number, updates: any) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const rowUpdates: Record<string, any> = {};
    if (updates.badge !== undefined) rowUpdates.badge = updates.badge;
    if (updates.badgeColor !== undefined) rowUpdates.badge_color = updates.badgeColor;
    if (updates.title !== undefined) rowUpdates.title = updates.title;
    if (updates.discount !== undefined) rowUpdates.discount = updates.discount;
    if (updates.subtitle !== undefined) rowUpdates.subtitle = updates.subtitle;
    if (updates.brand !== undefined) rowUpdates.brand = updates.brand;
    if (updates.image !== undefined) rowUpdates.image = updates.image;
    if (updates.link !== undefined) rowUpdates.link = updates.link;
    if (updates.bgGradient !== undefined) rowUpdates.bg_gradient = updates.bgGradient;
    if (updates.bgColor !== undefined) rowUpdates.bg_gradient = updates.bgColor;
    if (updates.price !== undefined) rowUpdates.price = updates.price ? String(updates.price) : null;
    if (updates.status !== undefined) rowUpdates.status = updates.status;
    if (updates.products !== undefined) rowUpdates.products = updates.products;

    const { data, error } = await (client as any)
      .from('deals')
      .update(rowUpdates)
      .eq('id', String(id))
      .select()
      .maybeSingle();

    if (error) {
      console.error('[updateDeal] database error:', error.message);
      throw new Error(error.message);
    }
    const updated = data || { id, ...rowUpdates };
    return {
      id: updated.id,
      badge: updated.badge,
      badgeColor: updated.badge_color || undefined,
      title: updated.title,
      discount: updated.discount,
      subtitle: updated.subtitle || '',
      brand: updated.brand || '',
      image: updated.image,
      link: updated.link,
      bgGradient: updated.bg_gradient || undefined,
      price: updated.price || undefined,
      products: updated.products || [],
      status: updated.status,
    };
  },

  async deleteDeal(id: string | number) {
    let client = getDbClient();
    if (!client) {
      client = (await getSupabaseServerClient()) as any;
    }

    if (!client) throw new Error('Database client not configured');

    const { error } = await (client as any).from('deals').delete().eq('id', String(id));
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
    sku: r.sku || r.id,
    brand: r.brand,
    category: r.category_slug,
    categorySlug: r.category_slug,
    subtitle: r.subtitle || '',
    description: r.description || '',
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    discountPercent: r.discount_percent ? Number(r.discount_percent) : undefined,
    rating: Number(r.rating || 5.0),
    reviewCount: Number(r.reviews_count || 0),
    badge: r.badge || undefined,
    image: r.image,
    gallery: Array.isArray(r.gallery) && r.gallery.length > 0 ? r.gallery : [r.image],
    stock: Number(r.stock_count ?? (r.in_stock ? 10 : 0)),
    inStock: Boolean(r.in_stock),
    warranty: r.warranty || '1 Year Official Warranty',
    isBestSeller: Boolean(r.is_best_seller),
    isFeatured: Boolean(r.is_featured),
    isNewArrival: Boolean(r.is_new_arrival),
    specs: r.specs || {},
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
