# Blue Bell Mobile Shop - Security Architecture & Hardening

## 1. Authentication & Session Security
- **Role-Based Access Control (RBAC)**: Clear privilege segregation (`customer`, `admin`, `superadmin`).
- **Password Protection**: Passwords salted and hashed with bcrypt (work factor >= 12) or Argon2id. No plaintext passwords stored or logged.
- **Session Tokens**: HTTP-only, `SameSite=Lax` (or `Strict`), `Secure` in production, prevents client-side script token theft (XSS mitigation).
- **Public Registration Limitation**: Registration sets `role: 'customer'`. Admin users can only be provisioned via secure server CLI script or seeded superadmin initialization.

## 2. Server-Side Authorization & Input Validation
- **Defense in Depth**: Client validation (React Hook Form + Zod) is treated purely as UX convenience. Every server route handler and mutation performs authoritative Zod validation.
- **Untrusted Client Inputs**:
  - Item prices and cart discounts submitted by browsers are strictly disregarded.
  - Prices, taxes, shipping, and coupon discounts are calculated dynamically on the server from current database records.
- **Atomic Concurrency Protection**:
  - Inventory updates use atomic Mongoose operations (e.g. `{ stock: { $gte: qty } }` with `$inc: { stock: -qty }`) to eliminate race conditions and double-spending/overselling.

## 3. Web Application Security Safeguards
- **Cross-Site Scripting (XSS)**: React automatically escapes output bindings. Rich descriptions are sanitized using DOMPurify before any HTML rendering.
- **Cross-Site Request Forgery (CSRF)**: Next.js Server Actions and Route Handlers with custom request headers and `SameSite` cookies mitigate CSRF vulnerabilities.
- **SQL / NoSQL Injection Prevention**: Mongoose ODM schemas enforce strict type casting; raw `$where` or untrusted object injection into query objects is prohibited.
- **Rate Limiting**: Critical endpoints (`/api/auth/*`, `/api/checkout`, `/api/search`) guarded with IP-based token-bucket rate limiting to mitigate brute-force and scraping.
- **Content Security Policy (CSP) & HTTP Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `Referrer-Policy: strict-origin-when-cross-origin`

## 4. Sensitive Configuration & Environment Management
- Environment secrets (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_API_SECRET`) are loaded strictly on the server side (`process.env.*`) and never prefixed with `NEXT_PUBLIC_`.
- Redaction filters implemented in application logger to purge credit details, passwords, and tokens from runtime logs.
