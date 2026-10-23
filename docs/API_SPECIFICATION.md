# Blue Bell Mobile Shop - API Specification (REST)

## Base URL
`/api/v1` (with standard route handlers under `src/app/api/...`)

## Response Envelope Convention
All API responses follow a predictable JSON contract:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
```

---

## 1. Storefront & Catalog Endpoints

### 1.1 `GET /api/products`
Fetch paginated products with multidimensional filtering.
- **Query Params**:
  - `category` (string, optional - category slug)
  - `brand` (string, optional - e.g. "Apple", "Samsung")
  - `minPrice` (number, optional)
  - `maxPrice` (number, optional)
  - `condition` (string, optional - "Brand New", "Open Box")
  - `storage` (string, optional - "128GB", "256GB", "512GB", "1TB")
  - `isFeatured` (boolean, optional)
  - `isBestSeller` (boolean, optional)
  - `sort` (string, optional - `price_asc`, `price_desc`, `newest`, `popular`)
  - `page` (number, default: 1)
  - `limit` (number, default: 12)
- **Status**: `200 OK`

### 1.2 `GET /api/products/[slug]`
Fetch single product detail by slug with full variant matrix, warranty info, specifications, and related recommendations.
- **Status**: `200 OK` or `404 Not Found`

### 1.3 `GET /api/categories`
Fetch active category hierarchy with product counts.
- **Status**: `200 OK`

### 1.4 `GET /api/search`
Live debounced search with query suggestions and category tagging.
- **Query Params**: `q` (string, min 2 chars), `limit` (number, default 6)
- **Status**: `200 OK`

---

## 2. Cart & Checkout Endpoints

### 2.1 `GET /api/cart`
Retrieve active cart with server-validated prices, stock status checks, and subtotal.
- **Headers**: Session cookie or `x-guest-cart-token`

### 2.2 `POST /api/cart/items`
Add item/variant to cart.
- **Body**: `{ productId: string, variantId: string, quantity: number }`

### 2.3 `PATCH /api/cart/items/[id]`
Adjust quantity with server-side stock limit clamp.
- **Body**: `{ quantity: number }`

### 2.4 `DELETE /api/cart/items/[id]`
Remove item from cart.

### 2.5 `POST /api/checkout`
Submit verified order (Cash on Delivery / payment intent).
- **Body**:
```json
{
  "customer": {
    "fullName": "Muhammad Ali",
    "email": "customer@example.com",
    "phone": "+923001234567"
  },
  "shippingAddress": {
    "street": "House 12, Street 4, Sector F-7",
    "city": "Islamabad",
    "state": "Federal",
    "postalCode": "44000"
  },
  "paymentMethod": "cod",
  "couponCode": "BLUEBELL10"
}
```
- **Response**: `{ success: true, order: { orderNumber: "BB-2026-89412", ... } }`

---

## 3. Order Tracking Endpoints

### 3.1 `GET /api/orders/[orderNumber]`
Fetch public customer-facing order tracking timeline without exposing sensitive internal notes.

---

## 4. Admin Management Endpoints (Protected: Bearer/Session + Admin Role)

### 4.1 `GET /api/admin/dashboard`
Aggregated metrics: Gross Revenue, Total Orders, Pending Fulfillments, Low Stock Warnings, 7-day sales chart.

### 4.2 `POST /api/admin/products`
Create new product + variants with validation.

### 4.3 `PATCH /api/admin/products/[id]`
Update details, pricing, variants, or visibility.

### 4.4 `DELETE /api/admin/products/[id]`
Soft-delete product (`isActive: false`).

### 4.5 `PATCH /api/admin/inventory/adjust`
Atomic stock adjustment with mandatory audit movement logging.
- **Body**: `{ productId: string, variantId: string, quantityChange: number, reason: string }`

### 4.6 `PATCH /api/admin/orders/[id]/status`
Validated state transition (`pending_confirmation` -> `confirmed` -> `processing` -> `shipped` -> `delivered` / `cancelled`).
