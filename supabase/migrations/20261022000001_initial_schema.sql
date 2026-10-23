-- ============================================================================
-- BLUE BELL MOBILE SHOP — COMPLETE PRODUCTION POSTGRESQL & SUPABASE MIGRATION
-- Migration Version: 20261022000001_initial_schema.sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. USER ROLES TABLE (Customer vs Admin)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_user_role_unique UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Helper function to check if an authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  model TEXT,
  description TEXT NOT NULL DEFAULT '',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  condition TEXT NOT NULL DEFAULT 'Brand New' CHECK (condition IN ('Brand New', 'Open Box', 'Certified Pre-Owned')),
  warranty_details TEXT NOT NULL DEFAULT '1 Year Official Warranty (PTA Approved)',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(is_active, is_featured);

-- 5. PRODUCT VARIANTS TABLE (Prices in Paisa: 1 PKR = 100 Paisa)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  storage_capacity TEXT,
  price_paisa BIGINT NOT NULL CHECK (price_paisa >= 0),
  compare_at_price_paisa BIGINT CHECK (compare_at_price_paisa IS NULL OR compare_at_price_paisa >= price_paisa),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(sku);

-- 6. INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.inventory (
  variant_id UUID PRIMARY KEY REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 3 CHECK (low_stock_threshold >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_inventory_reserved_le_onhand CHECK (quantity_reserved <= quantity_on_hand)
);

-- 7. INVENTORY MOVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('order_reservation', 'order_fulfillment', 'order_cancellation', 'restock', 'manual_adjustment', 'damage')),
  quantity_delta INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  reference_id TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movements_variant ON public.inventory_movements(variant_id);

-- 8. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  alt_text TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_prod ON public.product_images(product_id);

-- 9. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL DEFAULT 'Punjab',
  postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);

-- 10. CARTS AND CART ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR guest_token IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_item_unique UNIQUE (cart_id, variant_id)
);

-- 11. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_paisa')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  minimum_order_paisa BIGINT NOT NULL DEFAULT 0,
  maximum_discount_paisa BIGINT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

-- 12. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal_paisa BIGINT NOT NULL CHECK (subtotal_paisa >= 0),
  discount_paisa BIGINT NOT NULL DEFAULT 0 CHECK (discount_paisa >= 0),
  delivery_fee_paisa BIGINT NOT NULL DEFAULT 0 CHECK (delivery_fee_paisa >= 0),
  total_paisa BIGINT NOT NULL CHECK (total_paisa >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer', 'easypaisa', 'jazzcash')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  delivery_address_snapshot JSONB NOT NULL,
  customer_contact_snapshot JSONB NOT NULL,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 13. ORDER ITEMS TABLE (Immutable Snapshots)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  sku_snapshot TEXT NOT NULL,
  selected_variant_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  unit_price_paisa BIGINT NOT NULL CHECK (unit_price_paisa >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  line_total_paisa BIGINT NOT NULL CHECK (line_total_paisa >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 14. COUPON REDEMPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT coupon_order_unique UNIQUE (coupon_id, order_id)
);

-- 15. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);

-- 16. PROMOTIONAL BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_path TEXT NOT NULL,
  target_url TEXT NOT NULL DEFAULT '/products',
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Blue Bells Mobile Shop',
  contact_information JSONB NOT NULL DEFAULT '{"phone": "+92 300 1234567", "email": "support@bluebell.pk", "address": "Shop #14, Ground Floor, Blue Area, Islamabad"}'::jsonb,
  delivery_settings JSONB NOT NULL DEFAULT '{"free_shipping_threshold_paisa": 2500000, "standard_shipping_paisa": 50000}'::jsonb,
  return_policy TEXT NOT NULL DEFAULT '7 Days official replacement warranty for verified defects.',
  warranty_policy TEXT NOT NULL DEFAULT '100% Genuine PTA Approved with official manufacturer warranty claims.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.admin_audit_logs(created_at DESC);

-- ============================================================================
-- ATOMIC TRANSACTIONAL CHECKOUT FUNCTION (Prevents Overselling & Validates Stock)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.process_checkout_order(
  p_user_id UUID,
  p_items JSONB,               -- Array of { "variant_id": UUID, "quantity": INT }
  p_payment_method TEXT,
  p_delivery_address JSONB,
  p_customer_contact JSONB,
  p_coupon_code TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item RECORD;
  v_variant RECORD;
  v_subtotal_paisa BIGINT := 0;
  v_discount_paisa BIGINT := 0;
  v_delivery_fee_paisa BIGINT := 0;
  v_total_paisa BIGINT := 0;
  v_order_id UUID;
  v_order_number TEXT;
  v_coupon RECORD;
  v_line_total BIGINT;
  v_free_shipping_threshold BIGINT := 2500000; -- 25,000 PKR
  v_standard_shipping BIGINT := 50000;         -- 500 PKR
BEGIN
  -- 1. Generate Order Number: BB-YYYYMMDD-XXXX
  v_order_number := 'BB-' || to_char(now(), 'YYYYMMDD') || '-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0');

  -- 2. Validate Items & Inventory with Row Locks (FOR UPDATE)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INT)
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Item quantity must be greater than zero';
    END IF;

    -- Lock variant & inventory atomically
    SELECT pv.id, pv.product_id, pv.sku, pv.price_paisa, pv.color, pv.storage_capacity,
           p.name AS product_name, inv.quantity_on_hand, inv.quantity_reserved
    INTO v_variant
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    JOIN public.inventory inv ON inv.variant_id = pv.id
    WHERE pv.id = v_item.variant_id AND pv.is_active = true
    FOR UPDATE OF inv;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product variant % not found or inactive', v_item.variant_id;
    END IF;

    -- Check available stock
    IF (v_variant.quantity_on_hand - v_variant.quantity_reserved) < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for % (SKU: %). Requested: %, Available: %',
        v_variant.product_name, v_variant.sku, v_item.quantity, (v_variant.quantity_on_hand - v_variant.quantity_reserved);
    END IF;

    v_line_total := v_variant.price_paisa * v_item.quantity;
    v_subtotal_paisa := v_subtotal_paisa + v_line_total;
  END LOOP;

  -- 3. Validate Coupon if provided
  IF p_coupon_code IS NOT NULL AND p_coupon_code <> '' THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = upper(p_coupon_code) AND is_active = true
      AND starts_at <= now()
      AND (expires_at IS NULL OR expires_at >= now())
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Invalid or expired coupon code: %', p_coupon_code;
    END IF;

    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
      RAISE EXCEPTION 'Coupon usage limit has been reached';
    END IF;

    IF v_subtotal_paisa < v_coupon.minimum_order_paisa THEN
      RAISE EXCEPTION 'Minimum order of Rs. % required for this coupon', (v_coupon.minimum_order_paisa / 100);
    END IF;

    IF v_coupon.discount_type = 'percentage' THEN
      v_discount_paisa := (v_subtotal_paisa * v_coupon.discount_value / 100)::BIGINT;
    ELSE
      v_discount_paisa := v_coupon.discount_value::BIGINT;
    END IF;

    IF v_coupon.maximum_discount_paisa IS NOT NULL AND v_discount_paisa > v_coupon.maximum_discount_paisa THEN
      v_discount_paisa := v_coupon.maximum_discount_paisa;
    END IF;
  END IF;

  -- 4. Calculate Delivery Fee
  IF v_subtotal_paisa >= v_free_shipping_threshold THEN
    v_delivery_fee_paisa := 0;
  ELSE
    v_delivery_fee_paisa := v_standard_shipping;
  END IF;

  v_total_paisa := (v_subtotal_paisa - v_discount_paisa) + v_delivery_fee_paisa;

  -- 5. Create Order Record
  INSERT INTO public.orders (
    order_number, user_id, status, subtotal_paisa, discount_paisa,
    delivery_fee_paisa, total_paisa, payment_method, payment_status,
    delivery_address_snapshot, customer_contact_snapshot, notes
  ) VALUES (
    v_order_number, p_user_id, 'pending', v_subtotal_paisa, v_discount_paisa,
    v_delivery_fee_paisa, v_total_paisa, p_payment_method, 'unpaid',
    p_delivery_address, p_customer_contact, p_notes
  ) RETURNING id INTO v_order_id;

  -- 6. Insert Order Items & Update Inventory atomically
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(variant_id UUID, quantity INT)
  LOOP
    SELECT pv.sku, pv.price_paisa, pv.color, pv.storage_capacity, p.name AS product_name
    INTO v_variant
    FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    WHERE pv.id = v_item.variant_id;

    v_line_total := v_variant.price_paisa * v_item.quantity;

    INSERT INTO public.order_items (
      order_id, variant_id, product_name_snapshot, sku_snapshot,
      selected_variant_snapshot, unit_price_paisa, quantity, line_total_paisa
    ) VALUES (
      v_order_id, v_item.variant_id, v_variant.product_name, v_variant.sku,
      jsonb_build_object('color', v_variant.color, 'storage', v_variant.storage_capacity),
      v_variant.price_paisa, v_item.quantity, v_line_total
    );

    -- Increment quantity_reserved in inventory
    UPDATE public.inventory
    SET quantity_reserved = quantity_reserved + v_item.quantity,
        updated_at = now()
    WHERE variant_id = v_item.variant_id;

    -- Record Movement
    INSERT INTO public.inventory_movements (
      variant_id, movement_type, quantity_delta, reason, reference_id
    ) VALUES (
      v_item.variant_id, 'order_reservation', -v_item.quantity,
      'Reserved for order ' || v_order_number, v_order_number
    );
  END LOOP;

  -- 7. Record coupon redemption if applied
  IF v_coupon.id IS NOT NULL THEN
    INSERT INTO public.coupon_redemptions (coupon_id, order_id, user_id)
    VALUES (v_coupon.id, v_order_id, p_user_id);

    UPDATE public.coupons
    SET usage_count = usage_count + 1
    WHERE id = v_coupon.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal_paisa', v_subtotal_paisa,
    'discount_paisa', v_discount_paisa,
    'delivery_fee_paisa', v_delivery_fee_paisa,
    'total_paisa', v_total_paisa
  );
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: user can read/update own; admins can read all
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. User Roles: readable by admins and own user; only admins can insert/update
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "user_roles_admin_all" ON public.user_roles FOR ALL USING (public.is_admin());

-- 3. Catalog (Categories, Products, Variants, Images): Public read active; Admins full control
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "products_public_read" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "products_admin_all" ON public.products FOR ALL USING (public.is_admin());

CREATE POLICY "variants_public_read" ON public.product_variants FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "variants_admin_all" ON public.product_variants FOR ALL USING (public.is_admin());

CREATE POLICY "product_images_public_read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images_admin_all" ON public.product_images FOR ALL USING (public.is_admin());

-- 4. Inventory: Admins only
CREATE POLICY "inventory_admin_all" ON public.inventory FOR ALL USING (public.is_admin());
CREATE POLICY "inventory_movements_admin_all" ON public.inventory_movements FOR ALL USING (public.is_admin());

-- 5. Addresses: user access only
CREATE POLICY "addresses_owner" ON public.addresses FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- 6. Carts: user or guest access
CREATE POLICY "carts_owner" ON public.carts FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "cart_items_owner" ON public.cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND (carts.user_id = auth.uid() OR carts.user_id IS NULL))
);

-- 7. Coupons: Public read active
CREATE POLICY "coupons_public_read" ON public.coupons FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "coupons_admin_all" ON public.coupons FOR ALL USING (public.is_admin());

-- 8. Orders: Customer can read own orders; Admins can read/update all
CREATE POLICY "orders_customer_select" ON public.orders FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (public.is_admin());

CREATE POLICY "order_items_customer_select" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR public.is_admin()))
);
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (public.is_admin());

-- 9. Reviews: Public read approved; Authenticated users create
CREATE POLICY "reviews_public_read" ON public.reviews FOR SELECT USING (moderation_status = 'approved' OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "reviews_insert_authenticated" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews_admin_all" ON public.reviews FOR ALL USING (public.is_admin());

-- 10. Banners & Store Settings: Public read active; Admin manage
CREATE POLICY "banners_public_read" ON public.promotional_banners FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "banners_admin_all" ON public.promotional_banners FOR ALL USING (public.is_admin());

CREATE POLICY "settings_public_read" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin_all" ON public.store_settings FOR ALL USING (public.is_admin());

-- 11. Audit Logs: Admins only
CREATE POLICY "audit_logs_admin_read" ON public.admin_audit_logs FOR SELECT USING (public.is_admin());

-- Profile auto-creation trigger on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
