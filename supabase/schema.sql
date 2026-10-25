-- ========================================================
-- BLUE BELLS MOBILE SHOP - SUPABASE POSTGRESQL SCHEMA
-- ========================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  image TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  subtitle TEXT,
  brand TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  discount_percent NUMERIC,
  image TEXT NOT NULL,
  gallery TEXT[] DEFAULT '{}',
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  badge TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_count INTEGER DEFAULT 10,
  is_best_seller BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  specs JSONB DEFAULT '{}',
  storage_options TEXT[] DEFAULT '{}',
  color_options JSONB DEFAULT '[]',
  warranty TEXT DEFAULT '1 Year Official Warranty',
  sku TEXT UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  postal_code TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'bank_transfer', 'easypaisa', 'jazzcash')),
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_fee NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. APP USERS / CUSTOMERS TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.app_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  city TEXT DEFAULT 'Peshawar',
  address TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  orders_count INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_login TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public select app_users" ON public.app_users FOR SELECT USING (true);
CREATE POLICY "Public insert app_users" ON public.app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update app_users" ON public.app_users FOR UPDATE USING (true);
CREATE POLICY "Admin full app_users" ON public.app_users FOR ALL USING (true);

-- Allow public read access to active products & categories
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

-- Allow public to place orders and submit inquiries
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read own order" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public insert inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);

-- Allow authenticated/service role full access to everything
CREATE POLICY "Admin full products" ON public.products FOR ALL USING (true);
CREATE POLICY "Admin full categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Admin full orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Admin full inquiries" ON public.inquiries FOR ALL USING (true);

-- ========================================================
-- SEED DATA (INITIAL FLAGSHIPS)
-- ========================================================
INSERT INTO public.categories (name, slug, icon, item_count)
VALUES
  ('Smartphones', 'smartphones', 'Smartphone', 18),
  ('Apple iPhones', 'iphone', 'Apple', 12),
  ('Samsung Galaxy', 'samsung', 'Sparkles', 10),
  ('iPads & Tablets', 'tablets', 'Tablet', 6),
  ('Smartwatches', 'smartwatches', 'Watch', 8),
  ('Audio & AirPods', 'audio', 'Headphones', 14),
  ('Chargers & Cables', 'chargers', 'Zap', 22),
  ('Cases & Covers', 'cases', 'Shield', 30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (
  id, name, subtitle, brand, category_slug, price, original_price, discount_percent,
  image, gallery, rating, reviews_count, badge, in_stock, stock_count,
  is_best_seller, is_featured, is_new_arrival, warranty, sku, description
) VALUES
  (
    'iphone-15-pro-max',
    'Apple iPhone 15 Pro Max',
    'Titanium design with A17 Pro chip and 5x Telephoto camera',
    'Apple',
    'iphone',
    1199,
    1299,
    8,
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'],
    4.9,
    142,
    'Hot Flagship',
    true,
    15,
    true,
    true,
    true,
    '1 Year Apple Official Warranty (PTA Approved)',
    'BB-IP15PM',
    'Official Apple iPhone 15 Pro Max forged in aerospace-grade titanium.'
  ),
  (
    'samsung-galaxy-s24-ultra',
    'Samsung Galaxy S24 Ultra',
    'Galaxy AI is here with 200MP camera and embedded S-Pen',
    'Samsung',
    'samsung',
    1299,
    1419,
    8,
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop',
    ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=800&auto=format&fit=crop'],
    4.8,
    98,
    'AI Powered',
    true,
    12,
    true,
    true,
    true,
    '1 Year Samsung Official Warranty (PTA Approved)',
    'BB-S24U',
    'Meet the Samsung Galaxy S24 Ultra with seamless Galaxy AI capabilities.'
  )
ON CONFLICT (id) DO NOTHING;
