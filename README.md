# VFurniture — Seller & Admin Platform

Next.js 16 management platform for VFurniture. Sellers manage their products, orders, inventory, and earnings. Admins oversee the entire marketplace — sellers, users, orders, finance, analytics, and coupons.

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **State** — Zustand + TanStack Query v5
- **Auth** — JWT (access + refresh tokens, httpOnly cookies)
- **Database** — MongoDB via Mongoose
- **Cache** — Upstash Redis (rate limiting, OTP, session tokens)
- **Real-time** — Pusher
- **Media** — Cloudinary
- **Email** — Nodemailer
- **Charts** — Recharts

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/               # Login pages for seller & admin
│   ├── seller/               # Seller dashboard (protected)
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── inventory/
│   │   ├── earnings/
│   │   ├── reviews/
│   │   ├── notifications/
│   │   └── profile/
│   ├── admin/                # Admin dashboard (protected)
│   │   ├── dashboard/
│   │   ├── sellers/
│   │   ├── users/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── finance/
│   │   ├── analytics/
│   │   ├── coupons/
│   │   └── reviews/
│   └── api/                  # API route handlers
│       ├── auth/             # Login, logout, OTP, password reset
│       ├── seller/           # Seller-scoped endpoints
│       ├── admin/            # Admin-scoped endpoints
│       ├── notifications/
│       └── upload/
├── components/
│   └── auth/                 # Login modals, OTP input, forgot password
├── lib/
│   ├── domain/auth/          # AuthService, AuthRepository, schemas, errors
│   ├── middleware/           # DB connection, auth utils, error handler
│   └── utils/                # otp.ts, apiResponse.ts
├── models/                   # Mongoose models (Seller, Admin, ...)
├── hooks/                    # useAuth, and other TanStack Query hooks
├── services/                 # Frontend HTTP service layer
└── stores/                   # Zustand stores
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster
- Upstash Redis instance
- Cloudinary account
- Pusher account

### 1. Install dependencies

```bash
cd v-furniture-plateform
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Cookie Names (optional — defaults used if omitted)
SELLER_ACCESS_TOKEN_NAME=seller_access
SELLER_REFRESH_TOKEN_NAME=seller_refresh
ADMIN_ACCESS_TOKEN_NAME=admin_access
ADMIN_REFRESH_TOKEN_NAME=admin_refresh

# Bcrypt (optional — default: 12)
BCRYPT_SALT_ROUNDS=12

# Email (Gmail App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upstash Redis
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token

# Pusher
PUSHER_APP_ID=your_pusher_app_id
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Features

### Seller Portal
- Multi-step registration with email OTP verification
- Dashboard with sales overview, recent orders, and revenue stats
- Product management — create, edit, delete, image upload via Cloudinary
- Order management — view, update order status
- Inventory tracking
- Earnings & commission breakdown
- Review management
- Profile management
- Real-time notifications via Pusher

### Admin Portal
- Full seller management — approve, suspend, view seller details
- User management
- Product moderation
- Order oversight across all sellers
- Finance — revenue, commission, payouts
- Analytics with charts (Recharts)
- Coupon management — create and manage discount codes
- Review moderation

### Auth & Security
- Separate JWT-based auth for sellers and admins (httpOnly cookies)
- Rate limiting on login and registration via Redis
- Account lockout after 5 failed login attempts (15-minute lock)
- Seller password reset: 6-digit OTP → HMAC-SHA256 + salt stored in MongoDB → 15-minute expiry → Redis verification token → password update
- OTP inputs use `crypto.randomInt` (CSPRNG) — never `Math.random`
- `timingSafeEqual` comparison to prevent timing attacks

---

## Available Scripts

```bash
npm run dev                # Start development server (port 3000)
npm run build              # Production build
npm run start              # Start production server
npm run lint               # Run ESLint
npm run migrate:products   # Run product migration script
npm run check:seller       # Check seller data script
```

---

## Password Reset Flow (Seller)

```
1. POST /api/auth?action=send-reset-code
   → Finds seller by email
   → Generates CSPRNG 6-digit OTP + random salt
   → Stores HMAC-SHA256(otp, salt) + salt + expiry in MongoDB
   → Sends OTP to seller email

2. POST /api/auth?action=verify-reset-code
   → Fetches seller with resetCode + resetCodeSalt (select: false fields)
   → Recomputes HMAC and compares with timingSafeEqual
   → On success: stores reset_verified:seller:{email} in Redis (10-min TTL)

3. POST /api/auth?action=reset-password
   → Checks Redis for reset_verified token
   → Updates seller password (bcrypt hashed)
   → Clears Redis token + MongoDB reset fields atomically
```

---

## Deployment

Deploy to [Vercel](https://vercel.com). Set all environment variables in the Vercel project settings. The `NEXT_PUBLIC_APP_URL` must match your production domain.
