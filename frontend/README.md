# Jeycyl Cakes — Next.js Frontend

The modern customer-facing storefront and bakery staff administration portal for **Jeycyl Cakes** (Nairobi, Kenya), built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS.

---

## 🎨 Design Philosophy & Theme

- **Palette**: Velvet Plum (`#3D1436`), Vintage Rose (`#FBEEF2`), Warm Champagne (`#C9A227`), and Fresh Berry (`#B33951`).
- **Typography**: 
  - `font-serif`: **Fraunces** (luxury, celebratory feel)
  - `font-sans`: **Work Sans** (clean, accessible checkout and form reading)
- **Visual Accents**: Custom scalloped piped frosting trims (`FrostingScallop`, `ScallopedCardTrim`).

---

## 🧭 Pages & Routes

- **`app/page.tsx`**: Landing page with hero banner, bakery story, Nairobi delivery perks, and live cake catalog grid.
- **`app/menu/page.tsx`**: Dedicated filterable menu with category pills (*Birthday Classics, Wedding & Anniversary, Rich Chocolate, Velvet & Berry*), search, and customization trigger.
- **`app/cart/page.tsx`**: Cart summary, item customization review, customer contact information, and order placement.
- **`app/order-confirmation/page.tsx`**: Order receipt summary, Lipa na M-Pesa Buy Goods payment instructions (Till: 987654), and payment submission.
- **`app/track/page.tsx`**: Live milestone order tracker (*Received → Confirmed → Paid → In the Oven → Ready → Delivered*) with status timelines and customer delivery notes.
- **`app/admin/login/page.tsx`**: Staff portal login page with session cookie authentication.
- **`app/admin/page.tsx`**: Comprehensive admin dashboard with tabs for order management, customer registry, and cake catalog inventory (including variant creation, availability toggles, image upload, and cake deletion).

---

## 🧩 Key Components & State

- **`components/Navbar.tsx`**: Responsive header with navigation links (`Home`, `Menu`, `Track Order`, `Admin`) and live cart counter badge.
- **`components/Footer.tsx`**: Bakery footer with hours, Nairobi delivery zones, Lipa na M-Pesa details, and quick links.
- **`components/CakeCard.tsx`**: Catalog card with price in KES, availability status badge, and customization CTA.
- **`components/CustomizeCakeModal.tsx`**: Modal for selecting cake weight/size variants, flavors, and adding a piped inscription.
- **`context/CartContext.tsx`**: React Context providing cart item management and `localStorage` persistence.
- **`lib/api.ts`**: Centralized API client wrapper with session credentials, error handling, and proxy support.

---

## ⚙️ Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Ensure `.env.local` contains the backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Build for Production
```bash
npm run build
npm run start
```

### 5. Lint
```bash
npm run lint
```
