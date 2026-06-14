# StockTrail — Classic Stack Design Implementation

## What You Are Doing

You are refining the visual design of the **StockTrail** Next.js 14 inventory app so that every page matches a specific "Classic Stack" wireframe. The wireframe shows a clean, minimal layout:

- A white sidebar with plain text nav links, active item highlighted in blue
- A topbar with the page title (left) and search + actions (right)
- A row of 4 KPI stat cards, each with label + large number + small icon
- A content card with an inline horizontal form (for record/create actions)
- A full-width table card below with dashed row separators and colored type badges

The infrastructure (LayoutMode context, Topbar actions prop, PageStatsRow, etc.) is already in place. Your job is to **refine the visuals and layout** so that every page's Classic Stack mode matches the wireframe exactly.

---

## Design Tokens (from `src/app/globals.css` — use these everywhere)

```
--bg: #f8f9fb
--ink: #0f172a         (primary text)
--ink-2: #334155       (secondary text)
--muted-raw: #64748b   (muted text)
--muted-2: #94a3b8     (very muted)
--line: #e9edf3        (borders)
--line-2: #f1f5f9      (subtle borders / row dividers)
--hover: #f8fafc       (row hover)
--primary-hex: #049fd9 (blue — buttons, active states, badges)
--green: #22c55e
--amber-c: #f59e0b
--rose: #f43f5e
--red: #ef4444
--shadow-card: 0 1px 3px rgba(0,0,0,.06), 0 4px 20px rgba(0,0,0,.06)
```

---

## Component Visual Spec

### Sidebar (`src/components/layout/sidebar.tsx`)

The sidebar is already correct. Verify:
- Width: 256px (w-64), white bg, right border `1px solid var(--line)`
- Brand area: "S" logo box (red gradient) + "StockTrail" bold text, 16px
- Nav items: 13.5px, `var(--ink-2)` default, no visible icon color
- **Active item**: `background: rgba(4,159,217,0.08)`, `color: var(--primary-hex)`, `border-left: 2.5px solid var(--primary-hex)`, font-weight 600
- Hover: `background: var(--hover)`, `color: var(--ink)`
- User avatar + sign out button at bottom

### Topbar (`src/components/layout/topbar.tsx`)

Already correct. Verify:
- Height: 64px, sticky, white with blur backdrop
- Left: breadcrumb (12.5px muted) + page title (19px bold, `var(--ink)`)
- Right: page action buttons → layout switcher → search → bell → avatar
- Action buttons: outline style uses `border: 1px solid var(--line), bg: #fff, color: var(--ink-2)` / primary uses `bg: var(--primary-hex), color: #fff`

### KPI Stat Cards (`src/components/ui/page-stats-row.tsx`)

Update to exactly match wireframe:

```tsx
// 4-column grid of stat cards
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {stats.map(stat => (
    <div
      key={stat.title}
      style={{
        background: stat.warn ? "#fffbeb" : "#ffffff",
        border: `1px solid ${stat.warn ? "#fde68a" : "var(--line)"}`,
        borderRadius: 14,
        padding: "20px 22px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Top row: label left, icon right */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--muted-raw)", lineHeight: 1.3 }}>{stat.title}</p>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          backgroundColor: stat.warn ? "rgba(245,158,11,.12)" : `${stat.color}15`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <StatIcon name={stat.icon} size={15} color={stat.warn ? "#d97706" : stat.color} />
        </div>
      </div>
      {/* Large value */}
      <p style={{
        fontSize: 30, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1,
        color: stat.warn ? "#d97706" : "var(--ink)",
      }}>{stat.value}</p>
      {/* Optional delta */}
      {stat.delta && (
        <p style={{ fontSize: 11.5, marginTop: 6, color: stat.deltaPositive ? "var(--green)" : "var(--muted-raw)" }}>
          {stat.delta}
        </p>
      )}
    </div>
  ))}
</div>
```

**The `warn` flag** should be set on the "Stock Out" card on the Movements page and the "Low Stock" card on the Products/Alerts pages. This gives them an amber tint, exactly as shown in the wireframe.

Update `PageStatsRow` props interface:
```tsx
interface Stat {
  title: string;
  value: string;
  icon: string;
  color: string;
  delta?: string;
  deltaPositive?: boolean;
  warn?: boolean;   // <-- add this
}
```

### Content Cards

Every card wrapper:
```css
background: #ffffff;
border: 1px solid var(--line);
border-radius: 16px;
box-shadow: var(--shadow-card);
```

Card header (title row):
```css
padding: 20px 24px 16px;
border-bottom: 1px solid var(--line-2);
display: flex;
align-items: center;
justify-content: space-between;
```

Card title: `font-size: 15px; font-weight: 600; color: var(--ink);`

Right-side of card header (filter chips / labels): `font-size: 12.5px; color: var(--muted-raw);`

Card body (table): `padding: 0`
Card body (forms/charts): `padding: 20px 24px`

### Tables (`src/components/ui/table.tsx` or inline)

```tsx
// TableHead cell:
style={{
  fontSize: 12,
  fontWeight: 600,
  color: "var(--muted-2)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  padding: "12px 20px",
  borderBottom: "1px solid var(--line-2)",
  backgroundColor: "var(--bg)",
  whiteSpace: "nowrap",
}}

// TableBody row:
style={{ borderBottom: "1px dashed var(--line-2)" }}
className="hover:bg-[var(--hover)] transition-colors duration-100"

// TableBody cell:
style={{
  fontSize: 13,
  padding: "14px 20px",
  color: "var(--ink)",
}}

// Last row: no border-bottom
```

### Type / Status Badges

These are the outlined pill badges visible in the wireframe:
```tsx
// IN badge: green outline
{ border: "1px solid #22c55e", color: "#16a34a", background: "rgba(34,197,94,.08)", borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700 }

// OUT badge: amber/orange outline
{ border: "1px solid #f59e0b", color: "#b45309", background: "rgba(245,158,11,.08)", borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700 }

// TRANSFER_IN badge: blue outline
{ border: "1px solid #0ea5e9", color: "#0284c7", background: "rgba(14,165,233,.08)", borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700 }

// TRANSFER_OUT badge: purple outline
{ border: "1px solid #8b5cf6", color: "#7c3aed", background: "rgba(139,92,246,.08)", borderRadius: 999, padding: "3px 9px", fontSize: 11, fontWeight: 700 }

// COMPLETED / RECEIVED: green
// PENDING / DRAFT: amber
// CANCELLED: red/rose
// LOW: amber outlined
// OUT (stock): red outlined
```

Update the `Badge` component's `variant` styles to match these exactly.

### Inline Form Row (Record / Create forms)

The wireframe shows a horizontal row of form fields inside a card:

```tsx
// Container
<div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
  {/* Each field */}
  <div style={{ flex: 2 }}>  {/* wider for Product */}
    <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "var(--muted-raw)", marginBottom: 6 }}>
      Product
    </label>
    <select style={{
      width: "100%",
      height: 38,
      border: "1px solid var(--line)",
      borderRadius: 9,
      padding: "0 12px",
      fontSize: 13,
      color: "var(--ink)",
      backgroundColor: "#f8f9fb",
      outline: "none",
    }}>
      ...
    </select>
  </div>
  {/* Repeat for Location (flex:1.2), Type (flex:1), Qty (flex:0.8), Reason (flex:1.5) */}

  {/* Submit button — right aligned */}
  <button style={{
    height: 38,
    padding: "0 20px",
    backgroundColor: "var(--primary-hex)",
    color: "#fff",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    flexShrink: 0,
    boxShadow: "var(--shadow-btn)",
  }}>
    Record
  </button>
</div>
```

Apply this pattern for RecordMovementForm, New Transfer form, and other inline create forms.

### Quantity values in tables

```tsx
// Colored +/- quantity (Movements, Transfers)
<span style={{
  fontFamily: "monospace",
  fontSize: 13,
  fontWeight: 700,
  color: isInbound ? "var(--green)" : "var(--rose)",
}}>
  {isInbound ? "+" : "−"}{movement.quantity}
</span>
```

### Page layout wrapper

Every page:
```tsx
<div className="mx-auto max-w-[1180px] space-y-6 p-6">
  <PageStatsRow stats={kpiStats} />
  {/* form card if needed */}
  {/* main table card */}
</div>
```

---

## Changes Required Per Page (Classic Stack mode)

All pages: **only update the `if (mode === "classic")` branch** in each `*-client.tsx` file. Leave command and triage branches untouched.

---

### 1. Stock Movements (`src/components/pages/movements-client.tsx`)

**KPI cards** — add `warn: true` to the "Stock Out" stat:
```tsx
{ title: "Stock Out", value: String(outCount), icon: "ArrowUpCircle", color: "#f43f5e", warn: true, delta: `${outCount} outbound` }
```

**Record Movement form** — ensure `RecordMovementForm` renders as a horizontal inline row (Product, Location, Type, Qty, Reason fields + Record button all in one row). Update `src/components/movements/record-movement-form.tsx` to use the inline form row pattern above.

**Movement History card** — ensure table rows use dashed bottom borders (`1px dashed var(--line-2)`), not solid. The card header shows "Movement History" (left) and "Last 50" (right, 12.5px muted).

No filter chips in classic mode — just the full table.

---

### 2. Products (`src/components/pages/products-client.tsx`)

**KPI cards** — add `warn: true` to "Low Stock Items":
```tsx
{ title: "Low Stock Items", value: String(lowStockCount), icon: "AlertTriangle", color: "#ef4444", warn: true }
```

**Products table card** — header: "All Products" (left) + search bar inline (right).

Search bar in card header:
```tsx
<label style={{ display:"flex", alignItems:"center", gap:8, height:36, borderRadius:9, border:"1px solid var(--line)", backgroundColor:"#f8f9fb", padding:"0 12px", minWidth:200 }}>
  <Search size={14} style={{ color:"var(--muted-2)" }} />
  <input placeholder="Search products…" style={{ background:"transparent", outline:"none", fontSize:13, flex:1 }} />
</label>
```

---

### 3. Dashboard (`src/components/dashboard/dashboard-client.tsx`)

**KPI cards** — add `warn: true` to "Low Stock" card.

**Recent Movements table** — use dashed row borders. Ensure qty column shows colored +/- values.

**Movement chart card** — keep Recharts line chart. Card title "Stock Activity (90 days)".

---

### 4. Transfers (`src/components/pages/transfers-client.tsx`)

**New Transfer form card** — render form as inline row: Product, From Location, To Location, Quantity, [Transfer button].

**Transfer History table** — dashed row separators. Direction badges use the same outlined pill style. Qty shows colored +/- values with arrow prefix.

---

### 5. Suppliers (`src/components/pages/suppliers-client.tsx`)

**KPI cards** — 4 cards: Total Suppliers, Active Suppliers, Linked Products, Purchase Orders.

**Suppliers table** — columns: Avatar+Name, Email, Phone, Products (count), POs (count). Dashed row separators.

---

### 6. Purchase Orders (`src/components/pages/purchase-orders-client.tsx`)

**No KPI row** — show count label ("N purchase orders") right-aligned above the list.

**PO cards** — each PO is a card:
```
Card header row:
  Left: Supplier name (15px bold) + PO ref + date (12px muted below)
  Right: Status badge + Actions dropdown button

Card body: mini table (Product | Qty | Unit Cost | Subtotal)
  - Table headers: 11px uppercase muted
  - Rows: 13.5px, dashed separators

Card footer: Total right-aligned (14px bold)
```

Status badges: DRAFT=amber, ORDERED=blue, RECEIVED=green, CANCELLED=red.

---

### 7. Orders (`src/components/pages/orders-client.tsx`)

**KPI cards** — 4 cards: Total Orders, Pending/Active (warn: true if > 0), Completed, Total Revenue.

**Orders table** — columns: Order ID (monospace, `var(--primary-hex)`), Customer, Items (muted), Total (bold), Status badge, Date.

Filter chips above table inside card header: All | Pending | Completed.

---

### 8. Reports (`src/components/pages/reports-client.tsx`)

**3 KPI cards** (not 4): Current Stock Value, Total Movements, Total Purchase Orders.

**Charts layout**:
```
Row 1: [Fastest Moving — bar chart (flex 1)] [Slowest Moving — bar chart (flex 1)]
Row 2: [Monthly In/Out Volume — line chart, full width]
```

All charts inside Cards. Card titles: "Fastest Moving Products", "Slowest Moving Products", "Monthly Stock Volume".

Export CSV button in Topbar (outline style).

---

### 9. Low Stock Alerts (`src/components/pages/alerts-client.tsx`)

**Alert banner** — full-width red-tinted info bar at the top (before KPI cards):
```tsx
<div style={{
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 12,
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  gap: 10,
}}>
  <AlertTriangle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />
  <p style={{ fontSize: 14, fontWeight: 600, color: "#b91c1c" }}>
    {lowStockCount} product{lowStockCount !== 1 ? "s" : ""} at or below reorder threshold.
    Review and create purchase orders as needed.
  </p>
</div>
```

**No KPI row** in classic mode — the banner replaces it.

**Alerts table** — columns: Product (bold), SKU (monospace muted), Current Stock (red if 0, amber if low), Reorder At (muted), Locations (muted), Status badge.

Card header: "Products at or below reorder threshold" + item count badge (right).

---

### 10. Scan Barcode (`src/components/pages/scan-client.tsx`)

**Two stacked cards**:

Card 1 — "Scan a product barcode":
- Description text (13px muted)
- Camera viewport: `<BarcodeScanner>` component, full width, dark background, 200px tall
- Below camera: manual barcode text input + "Look up" button in a row

Card 2 — "Scanned Product" (shows after scan/lookup):
- Product avatar circle + name (17px bold) + SKU + stock count
- Inline row: Location select, Type select, Qty input, [Record Movement] button

---

### 11. Settings (`src/components/pages/settings-client.tsx`)

**Two stacked cards** (no KPI row):

Card 1 — "Locations / Warehouses":
- Card header: title + "+ Add Location" button (right)
- Table: Name, Address — dashed row separators

Card 2 — "Team Members":
- Table: Avatar+Name, Email, Role badge — dashed row separators

---

## Implementation Checklist

Work through these in order:

1. **`PageStatsRow`** — add `warn` prop, update card visual to match spec above
2. **`Badge`** — update all variant styles to outlined pill design
3. **`Table`** — set `TableBody` rows to `border-bottom: 1px dashed var(--line-2)` 
4. **`RecordMovementForm`** — refactor to horizontal inline row layout
5. **`movements-client.tsx`** — classic branch: add warn to Stock Out KPI
6. **`products-client.tsx`** — classic branch: add warn to Low Stock KPI
7. **`dashboard-client.tsx`** — add warn to Low Stock KPI, fix table row borders
8. **`transfers-client.tsx`** — classic branch: inline form, dashed rows
9. **`suppliers-client.tsx`** — classic branch: verify 4 KPIs, dashed rows
10. **`purchase-orders-client.tsx`** — classic branch: PO card layout
11. **`orders-client.tsx`** — classic branch: 4 KPIs with warn, filter chips
12. **`reports-client.tsx`** — classic branch: 3 KPIs, chart layout
13. **`alerts-client.tsx`** — classic branch: alert banner, no KPI row
14. **`scan-client.tsx`** — classic branch: 2 cards as described
15. **`settings-client.tsx`** — classic branch: 2 stacked cards

---

## What NOT to Change

- Do NOT modify MongoDB models, API routes, or auth logic
- Do NOT change the server-side data fetching in `page.tsx` files
- Do NOT change the command or triage layout branches
- Do NOT change the LayoutMode context or Topbar layout switcher
- Do NOT change the sidebar (already matches wireframe)
- Preserve all existing form functionality (server actions, toast notifications, dialogs)
- Use `toClient()` for all Mongoose doc conversions — already in place

---

## Testing

After implementing, run:
```bash
npm run dev
```

Visit each page and verify in Classic Stack mode (the default). The layout should match:
- White sidebar with blue active nav item
- Clean topbar with page title + search
- 4 KPI cards (label + big number + small icon), amber tint on warning cards
- Inline horizontal form for record/create actions
- Full-width table with dashed row separators and outlined type badges
