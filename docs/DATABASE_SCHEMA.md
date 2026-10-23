# Blue Bell Mobile Shop - Database Schema & Data Models

## Overview
The Blue Bell database is powered by MongoDB Atlas via Mongoose ODM. It employs a hybrid normalized/embedded document design tailored to read-heavy storefront queries, atomic inventory state transitions, and immutable order records.

---

## 1. Collections & Schema Definitions

### 1.1 `users`
Represents customers, administrators, and store staff.
```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;              // Unique index, lowercase, trimmed
  passwordHash: string;       // Argon2id or bcrypt (salted)
  role: 'customer' | 'admin' | 'superadmin';
  phone?: string;
  addresses: Array<{
    _id: ObjectId;
    recipientName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    isDefault: boolean;
  }>;
  wishlist: ObjectId[];       // Reference to Product
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ email: 1 }` (Unique)
- `{ role: 1 }`

---

### 1.2 `categories`
Hierarchical product categorization.
```typescript
interface ICategory {
  _id: ObjectId;
  name: string;               // e.g. "iPhone", "Samsung", "iPad", "Smart Watches"
  slug: string;               // Unique index, e.g. "iphone", "samsung-galaxy"
  description?: string;
  imageUrl?: string;
  iconName?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ slug: 1 }` (Unique)
- `{ displayOrder: 1, isActive: 1 }`

---

### 1.3 `products` & `variants`
Flexible schema with support for color, storage, condition, and SKU-level inventory.
```typescript
interface IVariant {
  _id: ObjectId;
  sku: string;                // e.g. "IP15P-256-NAT"
  attributes: {
    storage?: string;         // e.g. "256GB", "512GB", "1TB"
    color?: string;           // e.g. "Natural Titanium", "Titanium Gray"
    colorHex?: string;        // e.g. "#9B958B"
    condition?: 'Brand New' | 'Open Box' | 'Certified Pre-Owned';
    screenSize?: string;      // e.g. "6.7 inch"
    connectivity?: 'Wi-Fi' | 'Cellular + Wi-Fi' | 'GPS' | 'GPS + Cellular';
  };
  price: number;              // Current selling price (PKR)
  originalPrice?: number;     // Compare-at / retail MSRP (PKR)
  costPrice?: number;         // Admin only: unit cost
  stock: number;              // Real-time available units
  lowStockThreshold: number;  // Default: 3
  images: string[];           // Cloudinary URLs
  barcode?: string;
  isDefault: boolean;
}

interface IProduct {
  _id: ObjectId;
  name: string;               // e.g. "iPhone 15 Pro Max"
  slug: string;               // e.g. "iphone-15-pro-max"
  brand: 'Apple' | 'Samsung' | 'Google' | 'OnePlus' | 'Accessories';
  category: ObjectId;         // Ref: Category
  badge?: 'New' | 'Best Seller' | 'Sale' | 'Hot' | null;
  shortDescription: string;
  description: string;
  features: string[];
  specs: Record<string, string>; // e.g. { Chip: 'A17 Pro', Battery: '4422 mAh' }
  variants: IVariant[];
  featuredImage: string;
  galleryImages: string[];
  rating: number;             // Aggregated, e.g. 4.8
  reviewCount: number;        // e.g. 124
  warranty: string;           // e.g. "1 Year Official Apple Warranty"
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ slug: 1 }` (Unique)
- `{ category: 1, isActive: 1 }`
- `{ brand: 1, isActive: 1 }`
- `{ isBestSeller: 1, isActive: 1 }`
- `{ "variants.sku": 1 }`
- Compound text index: `{ name: "text", brand: "text", shortDescription: "text" }`

---

### 1.4 `inventory_movements`
Audit log of stock allocations, returns, manual restocking, and purchases.
```typescript
interface IInventoryMovement {
  _id: ObjectId;
  productId: ObjectId;
  variantId: ObjectId;
  sku: string;
  quantityChange: number;     // Positive for stock additions, negative for orders
  previousStock: number;
  newStock: number;
  type: 'sale' | 'restock' | 'return' | 'manual_adjustment' | 'cancellation_release';
  referenceOrderId?: ObjectId;
  performedBy?: ObjectId;     // User / Admin ID
  notes?: string;
  createdAt: Date;
}
```

---

### 1.5 `orders`
Immutable order history safeguarding against subsequent product price changes.
```typescript
interface IOrderItem {
  productId: ObjectId;
  variantId: ObjectId;
  name: string;
  sku: string;
  selectedAttributes: Record<string, string>;
  image: string;
  unitPrice: number;          // Historical price at point of checkout
  quantity: number;
  subtotal: number;
}

interface IOrder {
  _id: ObjectId;
  orderNumber: string;        // e.g. "BB-2026-89412" (Unique)
  customer: {
    userId?: ObjectId;        // Optional for guest checkout
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    deliveryInstructions?: string;
  };
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    shippingFee: number;
    discountAmount: number;
    couponCode?: string;
    total: number;
  };
  payment: {
    method: 'cod' | 'bank_transfer' | 'online_gateway';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: Date;
  };
  status: 'pending_confirmation' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  statusTimeline: Array<{
    status: string;
    timestamp: Date;
    note?: string;
    updatedBy?: ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```
**Indexes**:
- `{ orderNumber: 1 }` (Unique)
- `{ "customer.userId": 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`

---

### 1.6 `coupons` & `promotions`
Discount and campaign management.
```typescript
interface ICoupon {
  _id: ObjectId;
  code: string;               // e.g. "BLUEBELL10", uppercase unique
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;      // e.g. 10 (%) or 2000 (PKR)
  minSpend?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}
```

---

### 1.7 `admin_audit_logs`
Compliance and security logs tracking privileged actions.
```typescript
interface IAdminAuditLog {
  _id: ObjectId;
  adminId: ObjectId;
  adminEmail: string;
  action: 'CREATE_PRODUCT' | 'UPDATE_PRICE' | 'STOCK_ADJUST' | 'ORDER_STATUS_CHANGE' | 'DELETE_COUPON';
  targetResource: string;
  targetId: string;
  changes: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}
```
