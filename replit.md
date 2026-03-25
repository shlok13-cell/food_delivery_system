# FoodRush — Food Delivery App

## Overview

A fullstack food delivery web application built with React 19 + Vite + Tailwind CSS v4 on the frontend, and a dual-backend setup:
- `artifacts/api-server` — Express 5 API server (port 8080) — serves all browser traffic through the Replit proxy
- `server/` — Express 5 + MySQL backend (port 3000) — additional server with database integration

## Architecture

```
Browser → Replit Proxy (port 80) → /api/* → api-server (port 8080)
                                 → /* → client/Vite (port 5173)
```

All `/api/*` requests from the browser are routed by Replit to `artifacts/api-server` at port 8080. The client's Vite dev server also has a proxy to `localhost:3000` for direct dev access.

## Stack

### Frontend (`artifacts/client`)
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State/data fetching**: TanStack Query v5
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Notifications**: Sonner (toast)
- **Icons**: Lucide React
- **HTTP client**: Axios (base URL: `/api`)

### Real-time (`socket.io`)
- Server: `socket.io` v4 on path `/api/socket.io`, attached to HTTP server wrapping Express
- Client: `socket.io-client` singleton in `src/lib/socket.ts`
- Events: `join:track` (customer), `join:delivery` (partner), `location:update` (bidirectional)
- Server simulation: broadcasts rider lat/lng every 3s for `picked_up` / `en_route` deliveries
- Customer tracking page: `/track/:orderId` (public, no auth required)

### API Server (`artifacts/api-server`)
- **Framework**: Express 5
- **Runtime**: Node.js TypeScript via esbuild
- **Auth**: JWT + bcryptjs
- **Logging**: Pino
- **Data**: Seed data (no DB required)

### Backend (`server/`)
- **Framework**: Express 5
- **Database**: MySQL via `mysql2` (optional — falls back to seed data)
- **Auth**: JWT middleware

## App Features

### Customer Journey
1. **Home** (`/`) — Hero with search, category pills, featured restaurants, how-it-works
2. **Browse Restaurants** (`/restaurants`) — Filter by cuisine, search, sort by rating/time/price
3. **Restaurant Detail** (`/restaurants/:id`) — Full menu with categories, veg filter, ADD/qty controls, floating cart bar
4. **Cart** — Drawer with item management, quantity controls, cross-restaurant warning
5. **Checkout** (`/checkout`) — Order placement form with auth guard
6. **Orders** (`/orders`) — Order history list
7. **Order Detail** (`/orders/:id`) — Status timeline, item breakdown, delivery info
8. **Auth** (`/auth`) — Sign In / Sign Up with JWT auth, role selection

### UX Features
- Toast notifications when adding to cart (via Sonner)
- Animated cart switch warning when switching restaurants
- Veg-only filter toggle
- Scroll-to-category sticky tab bar
- Floating cart bar with item count + total
- Auth-aware Navbar (shows user name + logout when logged in)
- Loading skeletons for all async data
- Graceful error states

## Seed Data

`artifacts/api-server/src/seeds.ts` — 6 restaurants, 35+ menu items

Pre-seeded users (password: `password123`):
- `alice@example.com` — customer
- `bob@example.com` — customer
- `admin@example.com` — admin

## API Routes (api-server, port 8080)

```
GET  /api/healthz
GET  /api/restaurants          # ?cuisine=&search=
GET  /api/restaurants/:id
GET  /api/restaurants/:id/menu
POST /api/auth/login
POST /api/auth/register
GET  /api/orders               # auth required
POST /api/orders               # auth required
GET  /api/orders/:id           # auth required
```

## Environment Variables

```
JWT_SECRET=change-me-in-production
```

For MySQL (server/ package):
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=app_db
```

## Structure

```
/
├── artifacts/
│   ├── client/                  # React + Vite frontend
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Navbar.tsx   # Auth-aware navbar with cart
│   │       │   └── CartDrawer.tsx
│   │       ├── context/
│   │       │   └── CartContext.tsx  # Cart state + localStorage persistence
│   │       ├── pages/
│   │       │   ├── home.tsx
│   │       │   ├── restaurants.tsx
│   │       │   ├── restaurant-detail.tsx
│   │       │   ├── checkout.tsx
│   │       │   ├── orders.tsx
│   │       │   ├── order-detail.tsx
│   │       │   ├── auth.tsx
│   │       │   └── not-found.tsx
│   │       └── lib/
│   │           └── axios.ts     # Axios instance, baseURL=/api, JWT interceptor
│   └── api-server/              # Express API server
│       └── src/
│           ├── routes/
│           │   ├── auth.ts      # JWT auth with bcryptjs
│           │   ├── restaurants.ts
│           │   ├── orders.ts
│           │   └── health.ts
│           └── seeds.ts         # Seed restaurants & menu items
├── server/                      # Express + MySQL backend (port 3000)
│   └── src/
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── restaurants.ts
│       │   └── orders.ts
│       └── seeds.ts
└── pnpm-workspace.yaml
```
