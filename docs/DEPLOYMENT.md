# Blue Bell Mobile Shop - Deployment & Operations Guide

## 1. Hosting Architecture
- **Web & API Layer**: Vercel (Next.js Edge / Node.js Serverless runtime) or standalone Docker container.
- **Database Layer**: MongoDB Atlas (M10+ recommended for production, M0 for staging/dev).
- **Asset CDN**: Cloudinary for responsive image transformation, webp/avif auto-negotiation, and low-latency worldwide delivery.

## 2. Environment Variables Specification
Create a `.env.local` based on `.env.example`:
```ini
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/bluebell?retryWrites=true&w=majority

# Security & Authentication
AUTH_SECRET=your-32-character-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Store Operations
NEXT_PUBLIC_STORE_PHONE="+92 300 1234567"
NEXT_PUBLIC_STORE_EMAIL="support@bluebell.pk"
FREE_SHIPPING_THRESHOLD=100
```

## 3. Database Maintenance & Backup Strategy
- **Continuous Backups**: MongoDB Atlas Automated Point-In-Time Recovery (PITR) with 7-day retention.
- **Daily Snapshots**: Daily backup snapshots stored across multiple geographic availability zones.
- **Restoration Protocol**:
  1. Spin up target replica set from snapshot.
  2. Verify index builds and connectivity.
  3. Swap application connection string in Vercel environment settings.

## 4. Health Checks & Monitoring
- **Health Check Endpoint**: `GET /api/health` returns status of application runtime and database connection latency.
- **Application Performance Monitoring**: Sentry for automatic unhandled exception tracing and performance spans.
