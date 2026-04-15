# 🍽️ RESTAURANT OS - ARCHITECTURE CIBLE SAAS

## Architecture Finale Visée

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RESTAURANT OS - SAAS                            │
│                    Multi-Tenant • Afrique-First • Cloud-Native          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  CLIENTS                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Web    │  │  Mobile  │  │  Driver  │  │  Kitchen │  │   Admin  │ │
│  │ Customer │  │   PWA    │  │   App    │  │  Display │  │ Dashboard│ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │             │             │             │             │        │
│       └─────────────┴─────────────┴─────────────┴─────────────┘        │
│                                    │                                    │
│                              HTTPS / WSS                                │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│  CDN & EDGE (Cloudflare)                                                  │
│  • Cache statique                                                         │
│  • DDoS protection                                                        │
│  • SSL/TLS termination                                                    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│  API GATEWAY / LOAD BALANCER                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Nginx / Traefik                                                │    │
│  │  • Rate limiting (5 req/min auth, 100 req/min API)              │    │
│  │  • CORS management                                               │    │
│  │  • Request routing                                               │    │
│  │  • SSL termination                                               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│  APPLICATION LAYER (Next.js 16 + Node.js)                                │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Next.js App Router (Horizontal Scaling)                        │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │    │
│  │  │  Instance 1 │  │  Instance 2 │  │  Instance N │  ...         │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘              │    │
│  │                                                                  │    │
│  │  API Routes:                                                      │    │
│  │  • /api/auth/*       - Authentification JWT sécurisée            │    │
│  │  • /api/orders/*     - Gestion commandes                         │    │
│  │  • /api/payments/*   - Paiements (Orange Money, MTN, Wave)       │    │
│  │  • /api/tenants/*    - Multi-tenant management                   │    │
│  │  • /api/analytics/*  - Dashboard & reporting                     │    │
│  │  • /api/settings/*   - Configuration par tenant                  │    │
│  │                                                                  │    │
│  │  Middleware:                                                      │    │
│  │  • Auth guard (JWT verification)                                  │    │
│  │  • Role-based access control (RBAC)                               │    │
│  │  • Tenant isolation                                               │    │
│  │  • Request validation (Zod schemas)                               │    │
│  │  • Rate limiting per IP/user                                      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│  REALTIME LAYER (WebSocket Cluster)                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Socket.IO Cluster (Redis Adapter)                              │    │
│  │  • Live order updates                                           │    │
│  │  • Kitchen display sync                                         │    │
│  │  • Driver tracking                                              │    │
│  │  • Notification push                                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│  CACHE LAYER (Redis Cluster)                                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Redis                                                          │    │
│  │  • Session store (JWT blacklist)                                │    │
│  │  • API response cache                                           │    │
│  │  • Rate limit counters                                          │    │
│  │  • Pub/Sub for WebSocket                                        │    │
│  │  • Queue for background jobs                                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│  DATA LAYER (PostgreSQL + Prisma ORM)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  PostgreSQL (Primary + Replicas)                                │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │  Schema: restaurant_os                                  │    │    │
│  │  │  • tenants (organizations)                              │    │    │
│  │  │  • users (with tenant_id)                               │    │    │
│  │  │  • restaurants (with tenant_id)                         │    │    │
│  │  │  • orders (with tenant_id, restaurant_id)               │    │    │
│  │  │  • payments (with tenant_id)                            │    │    │
│  │  │  • products, menus, categories                          │    │    │
│  │  │  • ... (50+ tables)                                     │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  │                                                                  │    │
│  │  Row Level Security (RLS):                                       │    │
│  │  • Chaque tenant ne voit que ses données                        │    │
│  │  • Policies automatiques par organization_id                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│  STORAGE (S3-Compatible)                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  AWS S3 / MinIO / Cloudinary                                    │    │
│  │  • Product images                                               │    │
│  │  • Restaurant logos                                             │    │
│  │  • Receipts PDF                                                 │    │
│  │  • Backup files                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  EXTERNAL SERVICES                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Mobile Money │  │ Email/SMS    │  │ Maps/Geo     │                  │
│  │ • Orange     │  │ • SendGrid   │  │ • Mapbox     │                  │
│  │ • MTN        │  │ • Twilio     │  │ • Google     │                  │
│  │ • Wave       │  │ • Resend     │  │ • OpenStreet │                  │
│  │ • M-Pesa     │  │              │  │              │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Payments     │  │ Monitoring   │  │ CI/CD        │                  │
│  │ • Stripe     │  │ • Sentry     │  │ • GitHub     │                  │
│  │ • PayPal     │  │ • Datadog    │  │ • Vercel     │                  │
│  │              │  │ • LogRocket  │  │ • Docker     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy Strategy

### Approche: Database Shared, Data Isolated

```sql
-- Chaque table critique inclut organization_id
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan VARCHAR(50) DEFAULT 'starter',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  -- Row Level Security Policy
  CONSTRAINT unique_email_per_org UNIQUE (email, organization_id)
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  restaurant_id UUID NOT NULL,
  customer_id UUID,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_org_orders (organization_id, created_at)
);

-- Row Level Security (PostgreSQL 15+)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON orders
  USING (organization_id = current_setting('app.current_organization_id')::UUID);
```

### Tenant Resolution Flow

```
1. Request arrives with JWT token
2. Middleware extracts organization_id from token
3. Set PostgreSQL session variable: 
   SET app.current_organization_id = 'uuid-here'
4. All queries automatically filtered by RLS policy
5. Response sent with tenant context
```

---

## Security Layers

### Layer 1: Network Security
- Cloudflare DDoS protection
- WAF (Web Application Firewall)
- IP whitelist/blacklist
- Geo-blocking (optionnel)

### Layer 2: Transport Security
- HTTPS only (HSTS enabled)
- TLS 1.3 minimum
- Certificate auto-renewal (Let's Encrypt)

### Layer 3: Application Security
- JWT with HS256 signing
- bcrypt password hashing (cost: 12)
- Rate limiting (express-rate-limit)
- Input validation (Zod schemas)
- SQL injection prevention (Prisma ORM)
- XSS prevention (React escaping)
- CSRF tokens for state-changing ops

### Layer 4: Data Security
- Encryption at rest (AES-256)
- Encryption in transit (TLS)
- Row Level Security
- Audit logs for all mutations
- Automatic backup (daily)

### Layer 5: Access Control
- Role-Based Access Control (RBAC)
  - SUPER_ADMIN: Platform owner
  - TENANT_ADMIN: Organization owner
  - MANAGER: Restaurant manager
  - STAFF: Cashier, cook, driver
  - CUSTOMER: End user
- Permission matrix per role
- Resource-level permissions

---

## Payment Integration (Afrique)

### Orange Money API

```typescript
// POST /api/payments/orange-money/initiate
interface OrangeMoneyRequest {
  merchant_key: string;
  amount: string;
  currency: string;  // XOF, XAF
  order_id: string;
  customer_phone: string;
  return_url: string;
  cancel_url: string;
  notif_url: string;
}

// Webhook: POST /api/webhooks/orange-money
interface OrangeMoneyWebhook {
  status: string;  // SUCCESS, FAILED, PENDING
  order_id: string;
  transaction_id: string;
  amount: string;
  timestamp: string;
}
```

### MTN Mobile Money

```typescript
// Collection API (sandbox → production)
const MTN_CONFIG = {
  sandbox: {
    baseUrl: 'https://sandbox.momodeveloper.mtn.com',
    apiKey: process.env.MTN_MOMO_API_KEY,
  },
  production: {
    baseUrl: 'https://ericssonbasicapi2.azure-api.net',
    apiKey: process.env.MTN_MOMO_API_KEY,
  }
};
```

### Wave

```typescript
// Wave API (CI, SN)
const WAVE_CONFIG = {
  baseUrl: 'https://biz.wave.com/api/v1',
  apiKey: process.env.WAVE_API_KEY,
  secret: process.env.WAVE_SECRET,
};
```

---

## Offline-First Architecture

### Service Worker Strategy

```javascript
// src/sw.ts
const CACHE_NAME = 'restaurant-os-v1';

// Cache strategies per route
const routes = {
  '/menu': CacheFirst,      // Menu changes rarely
  '/orders': NetworkFirst,  // Orders need freshness
  '/pos': StaleWhileRevalidate,  // Fast but updated
};

// Background sync queue
const syncQueue = new SyncQueue('order-sync');

// On offline action
async function queueOrder(order) {
  await syncQueue.push({
    type: 'CREATE_ORDER',
    data: order,
    timestamp: Date.now(),
  });
}

// On reconnect
syncQueue.addEventListener('sync', async (event) => {
  const orders = await syncQueue.getAll();
  for (const order of orders) {
    try {
      await api.post('/orders', order.data);
      await syncQueue.remove(order.id);
    } catch (error) {
      // Retry later
    }
  }
});
```

### Local Database (IndexedDB)

```typescript
// Using Dexie.js for IndexedDB
const db = new Dexie('RestaurantOS');

db.version(1).stores({
  orders: '++id, status, synced, createdAt',
  customers: '++id, phone, email',
  products: '++id, categoryId, lastSynced',
  settings: 'key, value',
});

// Sync engine
class SyncEngine {
  async sync() {
    if (!navigator.onLine) return;

    const unsyncedOrders = await db.orders.filter({ synced: false }).toArray();
    
    for (const order of unsyncedOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          body: JSON.stringify(order),
        });
        
        if (response.ok) {
          await db.orders.update(order.id, { synced: true });
        }
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
}
```

---

## Deployment Strategy

### Development
```bash
# Local development
docker-compose up -d postgres redis
npm run dev
npm run ws:dev  # WebSocket service
```

### Staging
```yaml
# Vercel + Supabase
- Frontend: Vercel (auto-deploy on git push)
- Backend API: Vercel Serverless Functions
- Database: Supabase (PostgreSQL)
- WebSocket: Render/Railway
```

### Production
```yaml
# Full cloud deployment
- Frontend: Vercel Enterprise
- API: AWS ECS Fargate (auto-scaling)
- Database: AWS RDS PostgreSQL (multi-AZ)
- Cache: AWS ElastiCache Redis
- Storage: AWS S3
- CDN: CloudFront
- WebSocket: AWS API Gateway WebSocket
- Monitoring: Datadog + Sentry
```

---

## Business Model SaaS

### Pricing Tiers (Afrique)

| Plan | Prix/mois | Restaurants | Commandes | Features |
|------|-----------|-------------|-----------|----------|
| **Starter** | 15 000 FCFA | 1 | 500 | POS, Menu, Orders |
| **Growth** | 35 000 FCFA | 2 | 2000 | + Delivery, Analytics |
| **Pro** | 75 000 FCFA | 5 | Illimité | + Multi-site, API |
| **Enterprise** | Sur mesure | Illimité | Illimité | White-label, SLA |

### Revenue Streams

1. **Abonnements mensuels** (MRR)
2. **Transaction fees** (1-2% sur paiements)
3. **Setup fees** (formation, onboarding)
4. **Custom development** (features spécifiques)
5. **White-label licensing** (franchises)

---

## KPIs & Metrics

### Technical KPIs
- Uptime: > 99.9%
- API Response Time: < 200ms (p95)
- WebSocket Latency: < 50ms
- Error Rate: < 0.1%

### Business KPIs
- MRR (Monthly Recurring Revenue)
- Churn Rate: < 5%/month
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- NPS (Net Promoter Score)

---

*Document généré pour Restaurant OS - Avril 2025*
