# MiniMart POS — Project Workflow

## Overview

MiniMart is a Point of Sale (POS) system for a small retail store. It lets staff sign in, ring up sales at checkout, manage their product catalog, view completed orders, and track sales performance — all from a single dashboard with light and dark themes.

---

## Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Framework     | React 18 + TypeScript               |
| Build tool    | Vite 5                              |
| Styling       | Tailwind CSS 3 (zinc dark palette)  |
| Icons         | lucide-react                        |
| State         | React Context API (in-memory)       |
| Auth          | Demo auth (no real backend yet)     |
| Currency      | Myanmar Kyat (Ks)                   |

---

## Application Architecture

```
App
├── ThemeProvider          ← light/dark toggle, persisted in localStorage
├── AuthProvider           ← demo login/logout
└── AppContent
    ├── if not logged in → LoginView
    └── if logged in
        └── StoreProvider  ← holds products, cart, orders
            ├── Sidebar        ← navigation + theme toggle + user info
            └── main area      ← one of 5 views (switches via state)
                ├── PosView
                ├── DashboardView
                ├── SalesView
                ├── ProductsView
                └── OrdersView
```

---

## Core Workflows

### 1. Authentication (Login)

**File:** `src/lib/auth.tsx` + `src/components/LoginView.tsx`

```
User opens app
  → Login screen appears (split panel: branding + form)
  → User enters email + password
  → AuthProvider.login() checks against 2 demo accounts:
      • cashier@minimart.mm / minimart123  →  Alex Morgan (Cashier)
      • admin@minimart.mm / minimart123    →  Sarah Lee (Manager)
  → On success: user state set, app navigates to Checkout
  → On failure: error message shown
  → Logout: clears user state, returns to login
```

No real authentication is performed — this is a demo. No data is sent to any server.

---

### 2. Checkout (POS) — Primary User Flow

**File:** `src/components/PosView.tsx` + `src/lib/store.tsx`

This is the default screen after login and the main day-to-day workflow for cashiers.

```
┌─────────────────────────────────────────────────────────┐
│  CHECKOUT SCREEN                                        │
│                                                         │
│  LEFT SIDE (Product browser)          RIGHT SIDE (Cart) │
│  ┌──────────────────────┐             ┌───────────────┐ │
│  │ SKU scanner input    │             │ Current Order │ │
│  │ Search by name       │             │               │ │
│  │ Category tabs:       │             │ [Item rows]   │ │
│  │  All / Snacks /      │             │  qty +/−      │ │
│  │  Beverages /         │             │  remove ×     │ │
│  │  Grocery / Household │             │               │ │
│  │                      │             │ Subtotal      │ │
│  │ Product grid (cards) │             │ Tax (5%)      │ │
│  │  click to add to cart│             │ Total         │ │
│  │  shows stock count   │             │               │ │
│  │  out-of-stock = dim  │             │ [Card][Cash]  │ │
│  └──────────────────────┘             │ [Charge btn]  │ │
│                                       └───────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Step-by-step:**

1. **Add items to cart** — three ways:
   - **Scan/type SKU** in the top input (e.g. `SNK-001`) → matches product by SKU → adds to cart
   - **Search by name** → filter the product grid visually
   - **Click a product card** → adds 1 of that product to cart

2. **Manage cart** (right panel):
   - Increase quantity with `+` button
   - Decrease with `−` button (removes item when quantity hits 0)
   - Remove individual item with `×` button
   - Clear entire cart with "Clear" button

3. **Choose payment method** — tap **Card** or **Cash**

4. **Checkout** — click "Charge {total}" button:
   - `StoreProvider.checkout()` executes:
     - Creates an `Order` with ID `ORD-1001`, `ORD-1002`, etc.
     - Saves order to the orders list (most recent first)
     - **Deducts sold quantities from product stock**
     - Clears the cart
   - **Receipt modal** pops up showing order summary
   - Click "New Order" to close and start fresh

---

### 3. Product Management

**File:** `src/components/ProductsView.tsx`

```
Products screen
  → Shows catalog in a table: name, category, SKU, price, stock
  → Mini stats at top: total products, total stock, low-stock count
  → Search bar filters by name

  Actions:
  ├── "Add Product" button → opens New Product form (modal)
  │     • Pick an emoji icon
  │     • Enter name, price (Ks), stock quantity
  │     • Select category (Snacks / Beverages / Grocery / Household)
  │     • SKU auto-generates if left blank
  │     • Save → product added to catalog
  │
  ├── Edit (pencil icon) → opens same form pre-filled
  │     • Change any field → Save → product updated
  │
  └── Delete (trash icon) → confirmation modal
        • "Delete" → product permanently removed from catalog
```

**Stock badges:**
- Stock = 0 → red "Out of stock" badge
- Stock < 15 → orange "X left" badge (low stock warning)
- Stock >= 15 → plain number

---

### 4. Orders

**File:** `src/components/OrdersView.tsx`

```
Orders screen
  → Lists all completed orders (newest first)
  → Header shows total order count + total revenue
  → Search by Order ID

  Each order row:
  ├── Click to expand/collapse
  │     • Shows all line items (product, qty, price, line total)
  │     • Shows subtotal, tax, total breakdown
  │     • "View Invoice" button
  │
  └── "View Invoice" → opens full invoice modal
        • Store header with address & phone
        • Order details: ID, date, time, payment method, cashier
        • Itemized table with SKU codes
        • Totals section
        • Print button (uses browser's print dialog)
        • Close button
```

---

### 5. Sales Analytics

**File:** `src/components/SalesView.tsx`

```
Sales Report screen
  → Time period selector: Today / 7 Days / 30 Days / All Time
  → "Export" button → downloads CSV of filtered orders

  Stat cards (4):
  ├── Total Sales (gross revenue)
  ├── Net Revenue (total minus tax)
  ├── Tax Collected
  └── Items Sold (total quantity)

  Charts:
  ├── Revenue by Category
  │     • Horizontal bar chart per category
  │     • Shows revenue + quantity per category
  │     • Sorted by revenue (highest first)
  │
  └── Payment Methods
        • Card payments: order count, revenue, % share
        • Cash payments: order count, revenue, % share

  Daily Sales Breakdown table:
  • One row per day with orders, items, revenue, and % share
  • Mini progress bar showing each day's share of total
```

---

### 6. Dashboard (Overview)

**File:** `src/components/DashboardView.tsx`

```
Dashboard screen (at-a-glance summary)
  → "Live data" indicator with pulsing dot

  Stat cards (4):
  ├── Total Revenue
  ├── Orders (count)
  ├── Items Sold
  └── Avg Order value

  Panels:
  ├── Top Products (by revenue)
  │     • Top 5 products with rank, icon, revenue bar, qty sold
  │
  ├── Low Stock Alert
  │     • Lists all products with stock < 15
  │     • Red badge for 0, orange for < 10, neutral for 10–14
  │
  └── Recent Orders
        • Last 6 orders with ID, item count, payment method, total
```

---

## Data Model

**File:** `src/lib/types.ts`

### Product
| Field      | Type                                  | Description                     |
|------------|---------------------------------------|---------------------------------|
| id         | string                                | Unique identifier (e.g. `p1`)   |
| name       | string                                | Product name                    |
| price      | number                                | Price in Kyat                   |
| category   | `Snacks` \| `Beverages` \| `Grocery` \| `Household` | Category tag     |
| sku        | string                                | Stock keeping unit (e.g. `SNK-001`) |
| stock      | number                                | Current inventory count         |
| emoji      | string                                | Display icon                    |

### CartItem
| Field    | Type     | Description               |
|----------|----------|---------------------------|
| product  | Product  | Reference to a product    |
| quantity | number   | Quantity in cart          |

### Order
| Field          | Type                  | Description                          |
|----------------|-----------------------|--------------------------------------|
| id             | string                | Order ID (e.g. `ORD-1001`)           |
| items          | CartItem[]            | All items purchased                   |
| subtotal       | number                | Sum before tax                        |
| tax            | number                | 5% of subtotal                        |
| total          | number                | Subtotal + tax                        |
| paymentMethod  | `cash` \| `card`     | How the customer paid                 |
| status         | `completed`           | All orders are completed              |
| createdAt      | number                | Unix timestamp                        |

### Seed Data
- 24 products pre-loaded across 4 categories
- Tax rate: 5% (`TAX_RATE = 0.05`)
- All data is in-memory only (reset on page reload)

---

## State Management

**File:** `src/lib/store.tsx`

All state lives in a single React Context (`StoreProvider`) using `useState`:

| State        | Type        | Purpose                              |
|--------------|-------------|--------------------------------------|
| `products`   | Product[]   | Product catalog (starts with seed)   |
| `cart`       | CartItem[]  | Current shopping cart                |
| `orders`     | Order[]     | Completed orders (newest first)      |

**Derived values** (via `useMemo`): `cartSubtotal`, `cartTax`, `cartTotal`, `cartCount`

**Key actions:**
- `addToCart(product)` — increments qty or adds new item
- `decrementFromCart(productId)` — decrements qty, removes at 0
- `removeFromCart(productId)` — removes item entirely
- `clearCart()` — empties cart
- `checkout(paymentMethod)` — creates order, deducts stock, clears cart
- `addProduct(product)` / `updateProduct(product)` / `deleteProduct(id)` — catalog management

---

## Theme System

**File:** `src/lib/theme.tsx`

- Light theme: neutral slate/white backgrounds
- Dark theme: zinc-based palette (shadcn/ui style — `zinc-950` bg, `zinc-900` cards, `zinc-800` borders)
- Toggle button in the sidebar (Sun/Moon icon)
- Preference saved to `localStorage` under `minimart-theme`
- Defaults to system preference on first visit

**Logos:**
- Light mode: `/public/assets/logos/minimartLight.png`
- Dark mode: `/public/assets/logos/minimartDark.png`
- Shown in sidebar and login screen; swaps automatically with theme

---

## File Structure

```
src/
├── App.tsx                      ← root: providers + view routing
├── main.tsx                     ← entry point
├── index.css                    ← Tailwind + base styles
├── components/
│   ├── ui.tsx                   ← shared Card, Button, Badge primitives
│   ├── Sidebar.tsx              ← navigation + theme toggle + user card
│   ├── LoginView.tsx            ← sign-in screen
│   ├── PosView.tsx              ← checkout (scanner + product grid + cart)
│   ├── DashboardView.tsx        ← overview (stats, top products, low stock)
│   ├── ProductsView.tsx         ← catalog table + add/edit/delete modals
│   ├── OrdersView.tsx           ← order list + expandable rows + invoice
│   └── SalesView.tsx            ← sales analytics + CSV export
├── lib/
│   ├── auth.tsx                 ← demo auth context (2 accounts)
│   ├── store.tsx                ← global state: products, cart, orders
│   ├── theme.tsx                ← light/dark theme context
│   ├── types.ts                 ← Product, CartItem, Order types
│   ├── seed.ts                  ← 24 seed products + tax rate
│   ├── format.ts                ← currency (Ks), date, time formatters
│   └── utils.ts                 ← cn() class merge helper
└── public/
    └── assets/logos/
        ├── minimartLight.png    ← logo for light theme
        └── minimartDark.png     ← logo for dark theme
```

---

## End-to-End User Journey

```
1. Open app → Login screen
2. Sign in with demo credentials
3. Land on Checkout (POS)
4. Add products to cart (scan SKU / search / click)
5. Adjust quantities in cart
6. Choose Card or Cash
7. Click "Charge" → receipt appears
8. Click "New Order" → cart cleared, ready for next customer
9. Navigate to Dashboard → see revenue, top products, low stock
10. Navigate to Products → add/edit/delete catalog items
11. Navigate to Orders → review past orders, print invoices
12. Navigate to Sales → filter by period, export CSV
13. Toggle theme (light/dark) from sidebar
14. Sign out → back to login
```

---

## Key Behaviors & Rules

- **Tax is always 5%** on the cart subtotal
- **Stock auto-decrements** when an order is completed (never goes below 0)
- **Out-of-stock products** are visually dimmed and cannot be added to cart
- **Low stock threshold** is 15 units (shows orange warning badge)
- **Order IDs** increment sequentially starting from `ORD-1001`
- **All data is in-memory** — refreshing the page resets everything to seed state
- **No real authentication** — any of the two demo accounts work with password `minimart123`
- **Currency** is displayed in Myanmar Kyat (`Ks`) with no decimal places
