# BLUE BELLS MOBILE SHOP — SUPABASE ARCHITECTURE & OPERATIONS MANUAL

## 1. Executive Architecture Summary

Blue Bells Mobile Shop is an enterprise-grade e-commerce application built exclusively on:
- **Frontend / Fullstack Framework**: Next.js (App Router), React 19, TypeScript (Strict Mode), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend Platform**: Supabase managed PostgreSQL, Supabase Auth (SSR Cookie-based Session Handling), Supabase Storage.
- **Database Model**: PostgreSQL with atomic transactional operations (Stored Procedure `process_checkout_order` with row-level locks `FOR UPDATE` preventing stock overselling), Row Level Security (RLS) on all 18 tables, and integer Paisa monetary precision (1 PKR = 100 Paisa).
- **Resilience**: Zero-crash fail-safe layer (`src/lib/supabase/service.ts`) operating seamlessly in development and production whether Supabase credentials are wired or offline.

---

## 2. Directory Structure

```
blue-bell/
├── public/
│   ├── logo.png          # Official Blue Bells Mobile Shop Logo
│   └── icon.png          # High-resolution Tab & Bookmark Icon
├── src/
│   ├── app/
│   │   ├── (store)/
│   │   │   ├── page.tsx                  # Premium Homepage with Carousel & Categories
│   │   │   ├── products/
│   │   │   │   ├── page.tsx              # Products Catalog with Filters & Sort
│   │   │   │   └── [id]/page.tsx         # Detailed PDP (Gallery, Specs, Variants, Reviews)
│   │   │   ├── checkout/page.tsx         # Secure Pakistani Checkout (COD, Bank, EasyPaisa)
│   │   │   ├── order-success/page.tsx    # Order Confirmation & WhatsApp Dispatch
│   │   │   ├── track-order/page.tsx      # Live 5-Stage Logistics Tracking
│   │   │   └── contact/page.tsx          # Store Contacts, Map & Support Form
│   │   ├── admin/
│   │   │   └── page.tsx                  # Supabase Admin Management Console
│   │   └── api/
│   │       ├── health/route.ts           # Supabase & Application Diagnostics
│   │       ├── products/route.ts         # Catalog Retrieval & Add Product
│   │       ├── products/[id]/route.ts    # Single Product Lookup
│   │       ├── categories/route.ts       # Category Listing
│   │       ├── orders/route.ts           # Order Creation & Order History
│   │       ├── orders/[id]/route.ts      # Order Tracking & Status Update
│   │       └── inquiries/route.ts        # Customer Messages Endpoint
│   ├── components/
│   │   ├── common/BrandLogo.tsx          # Official Logo Component (Header, Footer, Admin)
│   │   ├── layout/Header.tsx             # Navbar with Search, Nav Links & Cart Counter
│   │   ├── layout/Footer.tsx             # Dark Navy Footer with Capsule Logo
│   │   └── products/ProductCard.tsx      # Reusable Product Card with QuickView
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts                 # Browser Supabase Client
│   │       ├── server.ts                 # SSR Cookie-based Server Client (@supabase/ssr)
│   │       ├── admin.ts                  # Server-only Admin Client with Secret Key
│   │       ├── middleware.ts             # Auth session refresher and route guards
│   │       ├── service.ts                # Full Database Service with Fail-Safe fallback
│   │       └── database.types.ts         # Full TypeScript Database Schema Definitions
│   ├── middleware.ts                     # Root Next.js Edge Middleware
│   └── types/index.ts                    # Application Interfaces
└── supabase/
    └── migrations/
        └── 20261022000001_initial_schema.sql  # Production PostgreSQL Schema & RLS
```

---

## 3. Database Schema & Tables

All 18 production tables are specified in `supabase/migrations/20261022000001_initial_schema.sql`:
1. `profiles`: Connected via trigger to `auth.users` on customer signup.
2. `user_roles`: Strict separation of `customer` and `admin` roles, secured by `is_admin()` function.
3. `categories`: Slug-indexed mobile categories (iPhones, Samsung, Tablets, Accessories, etc.).
4. `products`: Active status, condition (`Brand New`, `Open Box`, `Certified Pre-Owned`), PTA approval, and warranty.
5. `product_variants`: SKU, storage, color, and `price_paisa` (integer precision).
6. `inventory`: Atomically tracks `quantity_on_hand` and `quantity_reserved`.
7. `inventory_movements`: Ledger of restocks, order reservations, and fulfillments.
8. `product_images`: Multi-image storage paths and sort orders.
9. `addresses`: Verified customer shipping destinations across Pakistan.
10. `carts` & `cart_items`: User and guest shopping baskets.
11. `coupons` & `coupon_redemptions`: Percentage and fixed rupee discounts with minimum order thresholds.
12. `orders`: High-integrity snapshots of customer addresses, contact, status, and tracking numbers.
13. `order_items`: Immutable snapshots of historical SKU, unit price, and variant specifications.
14. `reviews`: 1 to 5 star customer ratings with moderation status.
15. `promotional_banners`: Scheduled homepage campaigns and promotions.
16. `store_settings`: Contact details, warranty rules, and free delivery thresholds.
17. `admin_audit_logs`: Audit trail of administrative actions.

---

## 4. Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase Credentials (from your Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SECRET_KEY=your-supabase-service-role-key-here

# Store Operations
NEXT_PUBLIC_STORE_PHONE="+92 300 1234567"
NEXT_PUBLIC_STORE_EMAIL="support@bluebell.pk"
FREE_SHIPPING_THRESHOLD_PKR=25000
DEFAULT_CURRENCY=PKR
```
