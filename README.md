# StockTrail — Inventory Management System

A full-stack inventory management app built with Next.js (App Router, TypeScript), MongoDB + Mongoose, NextAuth, Tailwind CSS, and Recharts.

## Features

- Product catalog with categories, SKUs, barcodes, variants
- Stock movement tracking (IN/OUT) with full audit trail
- Low-stock alerts based on per-product reorder thresholds
- Supplier management
- Multi-location stock with transfers between warehouses
- Purchase orders with line items and a "Receive" action that auto-updates stock
- Sales orders that auto-deduct stock (with insufficient-stock validation)
- Reports dashboard: stock value, fastest/slowest moving products, monthly in/out volume, top suppliers
- CSV import/export for products and stock movements
- Camera-based barcode scanning for quick stock lookups and updates
- Role-based access control (ADMIN / STAFF / VIEWER)
- Dark mode

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: MongoDB via Mongoose
- **Auth**: NextAuth (credentials provider, JWT sessions, role-based middleware)
- **Charts**: Recharts
- **UI**: Custom shadcn-style components (Radix primitives + Tailwind)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

You'll need a MongoDB instance. Locally, you can use Docker:

```bash
docker run --name stocktrail-mongo -p 27017:27017 -d mongo:7
```

Then set:

```
MONGODB_URI="mongodb://localhost:27017/stocktrail"
```

For a hosted database, use [MongoDB Atlas](https://www.mongodb.com/atlas) and paste its connection string instead.

Generate a secret for NextAuth:

```bash
openssl rand -base64 32
```

### 3. Seed the database

```bash
npm run seed
```

This creates:
- Admin user: **admin@stocktrail.app** / **admin123**
- A "Main Warehouse" location
- A sample supplier and product

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with the seeded admin credentials, or register a new account (the first registered user automatically becomes ADMIN).

## Project Structure

```
src/
  app/
    (dashboard)/        # Protected pages: dashboard, products, movements, etc.
    api/                # Route handlers (REST API)
    login/, register/   # Auth pages
  components/
    ui/                 # Reusable UI primitives (Button, Card, Table, Dialog, etc.)
    layout/             # Sidebar, Topbar
    products/, movements/, transfers/, purchase-orders/, orders/, reports/, scan/, settings/, suppliers/
  lib/
    models/             # Mongoose schemas (User, Product, Stock, StockMovement, PurchaseOrder, Order, etc.)
    mongodb.ts          # Connection helper + serialization utilities
    auth.ts             # NextAuth config
scripts/
  seed.ts               # Seed script
```

## Data Model Notes (MongoDB / Mongoose)

- **Product** embeds its `variants` array directly (size/color/SKU).
- **Stock** is a separate collection keyed by `(product, location)` with a unique compound index — this tracks per-location quantities.
- **StockMovement** is an append-only audit log; every IN/OUT/TRANSFER updates the corresponding `Stock` document via `$inc`.
- **PurchaseOrder** and **Order** embed their line items as subdocuments (`items: [...]`), each referencing a `Product`.
- All IDs are MongoDB ObjectIds. Server components serialize documents with `toClient()` (in `src/lib/mongodb.ts`), which converts ObjectIds to strings and adds a convenient `id` field (alongside `_id`) for use in the UI.

## Roles

- **ADMIN**: full access — settings, suppliers, purchase orders, reports, user role management
- **STAFF**: products, stock movements, transfers, orders, alerts, barcode scanning
- **VIEWER**: read-only — dashboard, products, orders, reports

## Notes / Next Steps

- Email alerts for low stock (Resend integration) are scaffolded via `.env` but not yet wired up — add a cron job (e.g. Vercel Cron) that queries the alerts logic and sends emails.
- Image uploads for products are not yet implemented — `imageUrl` field exists on the Product model, ready for integration with a storage provider (e.g. UploadThing, S3, Supabase Storage).
- Deploy to Vercel + MongoDB Atlas.
