# LinkForge 🔗

A scalable URL shortener and analytics platform built with modern web technologies. Shorten URLs, track clicks, and analyze traffic in real-time.

![Status](https://img.shields.io/badge/Status-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Redis](https://img.shields.io/badge/Redis-8-red) ![Next.js](https://img.shields.io/badge/Next.js-16-black)

## ✨ Features

- 🔐 **JWT Authentication** — Secure signup/login with bcrypt password hashing
- 🔗 **URL Shortening** — Generate short codes instantly (62^6 = 56 billion combinations)
- ✏️ **Custom Aliases** — Choose your own short code (e.g. `/my-github`)
- ⏰ **URL Expiration** — Set expiry dates on links
- 📊 **Analytics Dashboard** — Track clicks, view trends over 30 days
- 🔍 **Search & Filter** — Search URLs by keyword or filter by date
- ⚡ **Redis Caching** — Redirects cached for 1 hour (~2ms vs ~20ms DB)
- 🛡️ **Rate Limiting** — 100 requests/minute per IP using Redis
- 🗄️ **DB Indexing** — Indexes on short_code, user_id, created_at, url_id

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 15 |
| Cache | Redis 8 |
| Auth | JWT, bcrypt |

## 🏗️ System ArchitectureClient (Next.js)
↓ JWT
Express API (Node.js)
↓              ↓
Redis           PostgreSQL
(cache)         (persistent)
**Redirect flow:**
1. Request hits GET /:shortCode
2. Check Redis cache first (~2ms)
3. Cache miss → query PostgreSQL (~20ms) → write to cache
4. Log click to clicks table
5. 302 redirect to original URL

## 📁 Project Structurelinkforge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL connection pool
│   │   │   └── redis.js           # Redis client
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── rateLimiter.js     # Redis-based rate limiting
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js            # POST /register, /login
│   │   │   ├── urls.js            # CRUD for URLs
│   │   │   ├── analytics.js       # GET /analytics/:id
│   │   │   └── redirect.js        # GET /:shortCode
│   │   └── services/
│   │       ├── cache.js           # Redis cache logic
│   │       └── shortener.js       # Short code generation
│   └── migrations/
│       └── 001_init.sql           # DB schema + indexes
└── frontend/
├── pages/
│   ├── index.js               # Redirects to login/dashboard
│   ├── login.js
│   ├── register.js
│   ├── dashboard.js           # Main URL management page
│   └── analytics/[id].js      # Per-URL analytics page
└── lib/
└── api.js                 # Axios instance with JWT interceptor
## 🗄️ Database Schema

```sql
users    → id, email, password_hash, created_at
urls     → id, user_id, original_url, short_code, is_custom, expires_at, created_at
clicks   → id, url_id, clicked_at, ip, user_agent

-- Indexes for performance
CREATE INDEX idx_short_code ON urls(short_code);   -- every redirect
CREATE INDEX idx_user_id    ON urls(user_id);       -- dashboard queries
CREATE INDEX idx_created_at ON urls(created_at);    -- date filtering
CREATE INDEX idx_clicks_url ON clicks(url_id);      -- analytics queries
```

## 🚀 REST API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| POST | /api/urls | Yes | Create short URL |
| GET | /api/urls | Yes | List URLs with search/filter |
| PUT | /api/urls/:id | Yes | Update URL |
| DELETE | /api/urls/:id | Yes | Delete URL |
| GET | /:shortCode | No | Redirect + log click |
| GET | /api/analytics/:id | Yes | Click analytics |

## ⚙️ Local Setup

### Prerequisites
- Node.js v20+
- PostgreSQL 15
- Redis

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Kanav92/LinkForge.git
cd LinkForge

# 2. Setup backend
cd backend
npm install

# 3. Create .env file
cat > .env << 'ENVEOF'
PORT=8000
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/linkforge
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
ENVEOF

# 4. Setup database
psql postgres
CREATE DATABASE linkforge;
CREATE USER linkforge_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE linkforge TO linkforge_user;
\q

# 5. Run migrations
psql -U linkforge_user -d linkforge -f migrations/001_init.sql

# 6. Start backend
npm run dev

# 7. Setup frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

Open http://localhost:3000

## 💡 Key Engineering Decisions

**Why Redis for caching?**
Every redirect hits the same short_code lookup. Caching in Redis reduces DB load dramatically at scale and brings latency from ~20ms to ~2ms.

**Why raw SQL over an ORM?**
Direct pg queries give full control over query structure, make indexes easier to reason about, and avoid ORM overhead on high-frequency redirect queries.

**Why UUID over auto-increment IDs?**
UUIDs are globally unique, non-sequential (harder to enumerate), and work well in distributed systems.

**Why indexes on these columns?**
short_code is queried on every redirect. user_id is filtered on every dashboard load. created_at is used for date range filtering. url_id on clicks is used for every analytics query.

## 👨‍💻 Author

**Kanav Goyal** — B.Tech CSE, Punjab Engineering College (2023-2027)

[![GitHub](https://img.shields.io/badge/GitHub-Kanav92-black)](https://github.com/Kanav92)
