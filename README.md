# 🍽️ Restaurant OS - SaaS Platform for Africa & Global

A complete, production-ready Restaurant Operating System designed **Africa-first** with global scalability. This platform combines reservation, ordering, delivery, payment, CRM, and loyalty into one unified system.

![Restaurant OS](https://via.placeholder.com/1200x600/FF6B35/FFFFFF?text=Restaurant+OS)

## 🌟 Features

### Core Modules
- **📊 Dashboard** - Real-time analytics and business overview
- **📋 Orders** - Complete order management (dine-in, takeaway, delivery)
- **🛒 POS** - Point of Sale with fast checkout
- **📅 Reservations** - Table booking with waitlist management
- **🍽️ Menu** - Intelligent menu management
- **🛵 Delivery** - Real-time tracking with driver app
- **👥 Customers** - CRM with 360° customer view
- **🎁 Loyalty** - Points and rewards program
- **📈 Analytics** - Business intelligence and reporting

### Africa-First Features
- 📱 **Mobile Money** - Orange Money, MTN, Wave, M-Pesa, Moov Money
- 💵 **Cash Payments** - Cash on delivery and on-site
- 🛵 **Moto Delivery** - Motorcycle delivery optimization
- 📍 **Flexible Addresses** - Landmarks, districts, informal addresses
- 📴 **Offline Mode** - Works without internet connection
- 🌍 **Multi-Country** - Configured for African markets

### Global Features
- 🌐 Multi-currency support
- 🗣️ Multi-language ready
- 🏢 Multi-tenant architecture
- 📊 Multi-location management
- 🔐 Role-based access control

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RESTAURANT OS                             │
├─────────────────────────────────────────────────────────────────┤
│  SURFACES                                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   Web    │ │  Mobile  │ │  Driver  │ │  Staff   │ │  Admin │ │
│  │  Public  │ │  Client  │ │   App    │ │ Interface│ │ Panel  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  API LAYER (Next.js API Routes + WebSocket)                      │
├─────────────────────────────────────────────────────────────────┤
│  CORE SERVICES                                                    │
│  Auth │ Orders │ Reservations │ Delivery │ Payments │ Loyalty   │
├─────────────────────────────────────────────────────────────────┤
│  DATA LAYER (Prisma + SQLite/PostgreSQL + Redis)                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL (production) / SQLite (development)
- Redis (optional, for caching and queues)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/restaurant-os.git
cd restaurant-os

# Install dependencies
bun install

# Setup database
bun run db:push

# Start development server
bun run dev

# Start WebSocket service (separate terminal)
cd mini-services/realtime-service && bun run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite for dev
# DATABASE_URL="postgresql://user:pass@localhost:5432/restaurant_os"  # Production

# Auth
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
REFRESH_TOKEN_EXPIRES_IN="30d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WS_URL="ws://localhost:3003"

# Payments (configure per country)
ORANGE_MONEY_API_KEY=""
MTN_MOMO_API_KEY=""
WAVE_API_KEY=""
MPESA_API_KEY=""

# Maps
MAPBOX_TOKEN=""  # or Google Maps API key
```

## 📁 Project Structure

```
restaurant-os/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── orders/        # Order management
│   │   │   ├── reservations/  # Reservation system
│   │   │   ├── delivery/      # Delivery & drivers
│   │   │   ├── payments/      # Payment processing
│   │   │   └── ...
│   │   └── page.tsx           # Main application
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Utilities
│   ├── hooks/                 # React hooks
│   └── types/                 # TypeScript types
├── prisma/
│   └── schema.prisma          # Database schema (50+ models)
├── mini-services/
│   └── realtime-service/      # WebSocket server
├── public/                    # Static assets
└── docker/                    # Docker configuration
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/logout       - Logout user
POST   /api/auth/refresh      - Refresh token
POST   /api/auth/otp/send     - Send OTP
POST   /api/auth/otp/verify   - Verify OTP
```

### Orders
```
GET    /api/orders            - List orders (paginated, filtered)
POST   /api/orders            - Create order
GET    /api/orders/:id        - Get order details
PATCH  /api/orders/:id        - Update order status
DELETE /api/orders/:id        - Cancel order
```

### Reservations
```
GET    /api/reservations      - List reservations
POST   /api/reservations      - Create reservation
GET    /api/reservations/:id  - Get reservation
PATCH  /api/reservations/:id  - Update reservation
DELETE /api/reservations/:id  - Cancel reservation
GET    /api/availability      - Check table availability
```

### Delivery
```
GET    /api/deliveries        - List deliveries
POST   /api/deliveries        - Create delivery
PATCH  /api/deliveries/:id    - Update delivery
POST   /api/deliveries/assign - Auto-assign driver
GET    /api/deliveries/:id/track - Get tracking info
```

### Drivers
```
GET    /api/drivers           - List drivers
POST   /api/drivers           - Register driver
PATCH  /api/drivers/:id       - Update driver
POST   /api/drivers/:id/location - Update location
GET    /api/drivers/:id/earnings - Get earnings
```

### Payments
```
POST   /api/payments          - Process payment
POST   /api/payments/confirm  - Confirm payment (webhook)
POST   /api/payments/refund   - Process refund
GET    /api/payments/:id      - Get payment details
```

## 🗄️ Database Schema

The platform includes 50+ models covering:

- **Core**: Users, Sessions, Roles, Permissions
- **Organization**: Organizations, Brands, Restaurants, Settings
- **Dining**: Tables, Dining Rooms, Floor Plans
- **Menu**: Menus, Categories, Items, Variants, Options
- **Orders**: Orders, Items, Cart, Status History
- **Delivery**: Drivers, Deliveries, Tracking, Zones
- **Payments**: Payments, Refunds, Gift Cards, Promotions
- **CRM**: Customers, Tags, Feedback, Reviews
- **Loyalty**: Points, Rewards, Levels
- **Localization**: Countries, Currencies, Languages

## 🔐 Authentication & Authorization

### User Roles
- `SUPER_ADMIN` - Platform administrator
- `ORG_ADMIN` - Organization owner
- `ORG_MANAGER` - Organization manager
- `RESTAURANT_ADMIN` - Restaurant administrator
- `RESTAURANT_MANAGER` - Restaurant manager
- `STAFF` - Waiter, host, bartender
- `KITCHEN` - Kitchen staff
- `DRIVER` - Delivery driver
- `CUSTOMER` - End customer
- `SUPPORT` - Support staff

### Permission System
RBAC (Role-Based Access Control) with granular permissions per resource.

## 💳 Payment Integration

### Africa
| Provider | Countries | Type |
|----------|-----------|------|
| Orange Money | CI, SN, ML, BF | Mobile Money |
| MTN MoMo | CI, BJ, TG, GH | Mobile Money |
| Wave | CI, SN | Mobile Money |
| M-Pesa | KE, TZ, UG, CD | Mobile Money |
| Moov Money | BJ, TG, CI, NE | Mobile Money |

### Global
- Stripe (Cards, Apple Pay, Google Pay)
- PayPal
- Bank Transfer

## 📱 Mobile Apps

The platform is designed for mobile apps:

### Customer App (React Native)
- Browse restaurants & menus
- Place orders
- Track deliveries
- Manage reservations
- Loyalty program

### Driver App (React Native)
- Receive delivery missions
- Navigation
- Proof of delivery
- Earnings tracking
- Offline mode

## 🌍 Multi-Country Configuration

The `GLOBAL CORE + LOCAL ADAPTERS` architecture allows:

1. **Country Settings**
   - Currency & exchange rates
   - Tax rules
   - Payment providers
   - Address formats
   - Language defaults

2. **Feature Flags**
   - Enable/disable features per country
   - Rollout percentages
   - A/B testing

3. **Localization**
   - Translations
   - Date/time formats
   - Number formats

## 🧪 Testing

```bash
# Run tests
bun run test

# Run e2e tests
bun run test:e2e

# Generate coverage
bun run test:coverage
```

## 🐳 Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 Roadmap

### V1 - MVP (Current)
- [x] Core database schema
- [x] Dashboard & Analytics
- [x] Order management
- [x] POS system
- [x] Reservations
- [x] Menu management
- [x] Delivery tracking
- [x] Driver management
- [x] Customer CRM
- [x] Loyalty program
- [x] Mobile Money integration
- [x] WebSocket real-time

### V2 - Growth
- [ ] Native mobile apps
- [ ] Advanced analytics
- [ ] Marketing automation
- [ ] Advanced stock management
- [ ] Kitchen Display System
- [ ] Waitlist management
- [ ] Multi-location optimization

### V3 - Scale
- [ ] AI menu recommendations
- [ ] WhatsApp ordering
- [ ] Call center integration
- [ ] Franchise management
- [ ] Enterprise features
- [ ] Advanced integrations

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Support

- Documentation: [docs.restaurant-os.com](https://docs.restaurant-os.com)
- Email: support@restaurant-os.com
- Phone: +225 07 00 00 00 00

---

Built with ❤️ for African restaurants
