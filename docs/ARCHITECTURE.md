# Blue Bell Mobile Shop - Complete System Architecture

## 1. Executive Overview
Blue Bell Mobile Shop is a modern, high-performance, production-ready e-commerce platform specializing in premium mobile devices (Apple iPhone, Samsung Galaxy, iPads, Smartwatches, and mobile accessories). The architecture follows a clean modular monolith approach leveraging Next.js App Router (React 19 / Server Components), TypeScript, Tailwind CSS, Framer Motion, MongoDB with Mongoose, and a decoupled service & repository layer.

## 2. Architectural Layers

### A. Presentation Layer (Storefront & Admin)
- **Customer Storefront (`src/app/(store)`)**:
  - Premium Blue & White aesthetic with fluid animations, micro-interactions, responsive navigation, search modal with live preview, category carousels, and interactive cart & checkout drawers.
  - Client components for interactive state (Cart, Wishlist, QuickView, Filters, Search suggestions) paired with Server Components for SEO and fast initial TTFB.
- **Admin Dashboard (`src/app/admin`)**:
  - Secure role-protected management portal (`/admin`).
  - Analytics (revenue, orders, inventory alerts), Catalog Management (Products, Categories, Variants, Media), Order Tracking with strict state machine transitions, Stock movement history, Customer Directory, Coupon Engine, and Store Settings.
- **Shared Design System (`src/components/ui`, `src/components/layout`)**:
  - Custom Tailwind tokens matching the brand blue (`#0D6EFD`, `#0B5ED7`, `#084298`, `#F0F6FF`, slate neutrals, deep navy footer `#0a192f`).
  - Accessible dialogs, toast notifications, badges, tooltips, responsive carousels, skeletons, and buttons.

### B. Application & Service Layer
Separation of concerns between HTTP routes and core business logic:
- `ProductService`: Catalog queries, variant resolution, pricing recalculations, category aggregation.
- `InventoryService`: Atomic stock reservation, stock decrement, re-stocking on cancellations, low-stock threshold triggers.
- `CartService`: Price snapshot verification, guest session & authenticated customer cart sync, discount application.
- `OrderService`: State machine lifecycle management (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`), unique order serials (e.g. `BB-2026-XXXXX`), immutable historical order items snapshot.
- `PaymentService`: Extensible payment provider interface (defaulting to Cash on Delivery with verification, pluggable for Stripe/JazzCash/EasyPaisa).
- `AuthService`: Session management, bcrypt password hashing, JWT/cookie rotation, and strict RBAC (`customer`, `admin`, `superadmin`).

### C. Data Access & Persistence Layer
- **Mongoose / MongoDB Atlas**:
  - Connection pooling with singleton cached connection handling serverless invocation cycles.
  - Strict schema definitions, compound indexes (search, slug, category, price, stock status), atomic transactions (`$inc`, `$set`, session transactions).
  - Pre-save hooks, validation rules, virtuals, and sanitization.

### D. External Integrations
- **Cloudinary**: High-performance responsive image transformations, auto-WebP/AVIF delivery, secure backend signature uploads.
- **Logging & Monitoring**: Structured Winston/console logging with timestamped request IDs, Sentry integration readiness, health-check `/api/health`.

## 3. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT BROWSER                                   |
|   (Desktop, Tablet, Mobile) - Storefront UI, Admin UI, Framer Motion Micro-UX     |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / REST
                                          v
+-----------------------------------------------------------------------------------+
|                                NEXT.JS APP ROUTER                                 |
|  +---------------------------+  +-----------------------------------------------+  |
|  | Server Components (RSC)   |  | Route Handlers (/api/v1/...)                  |  |
|  | - SEO Meta, Layouts, Pre- |  | - Middleware (Auth, CORS, Security Headers)   |  |
|  |   rendered catalog        |  | - Zod Input Request Validation                |  |
|  +-------------+-------------+  +-----------------------+-----------------------+  |
+----------------|----------------------------------------|-------------------------+
                 |                                        |
                 +-------------------+--------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                                 SERVICES LAYER                                    |
|   ProductService | InventoryService | CartService | OrderService | AuthService    |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                               REPOSITORIES LAYER                                  |
|   Database Access Objects, Aggregation Pipelines, Atomic Mutators                 |
+------------------------------------+----------------------------------------------+
                                     |
                                     v
+-----------------------------------------------------------------------------------+
|                                DATABASE (MONGODB)                                 |
|   Users | Products | Categories | Variants | Inventory | Orders | Coupons | Logs  |
+-----------------------------------------------------------------------------------+
```
