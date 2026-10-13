# FOODORA — Smart Online Food Ordering System

## 1. Project Overview
FOODORA is a complete, production-style, full-stack food delivery web application connecting **Customers**, **Restaurants**, **Delivery Partners (Couriers)**, and **Administrators** in one centralized platform.

- **Tagline**: Discover. Order. Enjoy.
- **Statement**: "Your favorite food, your favorite restaurants, delivered with convenience."
- **Stack**: React (TypeScript + Vite), Node.js, Express, MongoDB (Mongoose), REST APIs, JWT Auth with Role-Based Access Control (RBAC).

---

## 2. Directory Structure

```
FOODORA/
├── frontend/                   # Frontend Application (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Navbar, Footer, RestaurantCard, FoodItemCard)
│   │   ├── context/            # Global contexts (AuthContext, CartContext)
│   │   ├── pages/              # Dedicated portals & pages for all 4 roles:
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── RestaurantListPage.tsx
│   │   │   ├── RestaurantDetailsPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrderTrackingPage.tsx
│   │   │   ├── OrderHistoryPage.tsx
│   │   │   ├── RewardsPage.tsx
│   │   │   ├── WishlistPage.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── SupportPage.tsx
│   │   │   ├── RestaurantDashboard.tsx
│   │   │   ├── DeliveryDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── services/           # API Client with JWT Bearer tokens
│   │   ├── types/              # Domain TypeScript types
│   │   ├── App.tsx             # Root router with ProtectedRoute RBAC
│   │   ├── index.css           # Curated food-tech design system & tokens
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── backend/                    # Backend Application (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.ts)
│   │   ├── models/             # Mongoose schemas:
│   │   │   ├── User.ts
│   │   │   ├── Restaurant.ts
│   │   │   ├── FoodItem.ts
│   │   │   ├── Category.ts
│   │   │   ├── Cart.ts
│   │   │   ├── Address.ts
│   │   │   ├── Order.ts
│   │   │   ├── Coupon.ts
│   │   │   ├── Review.ts
│   │   │   ├── Wishlist.ts
│   │   │   ├── LoyaltyTransaction.ts
│   │   │   ├── Notification.ts
│   │   │   ├── SupportTicket.ts
│   │   │   └── AuditLog.ts
│   │   ├── controllers/        # Business logic & validations
│   │   ├── middleware/         # Auth (JWT) & centralized error handling
│   │   ├── routes/             # Versioned REST endpoints (/api/v1/*)
│   │   ├── scripts/seed.ts     # Repeatable database seeding
│   │   ├── app.ts              # Express setup with Helmet & CORS
│   │   └── server.ts           # Server bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── README.md
```

---

## 3. How to Run Frontend and Backend

### A. Prerequisites
- **Node.js** >= 18
- **MongoDB** running locally on port 27017 or a valid MongoDB Atlas connection string in `.env`.

### B. Backend Setup
1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Run repeatable database seed (loads restaurants, dishes, coupons, orders, and 4 roles):
   ```powershell
   npm run seed
   ```
4. Start the backend development server:
   ```powershell
   npm run dev
   ```
   *Health endpoint available at:* `http://localhost:5000/api/v1/health`

### C. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev -- --port 5173
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 4. Pre-configured Demo Accounts

Each account can also be logged into with **1-click buttons** directly on the `/login` screen:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Admin** | `admin@foodora.demo` | `Admin123!` | Platform Metrics, User Management, Coupons, Audit Logs |
| **Customer** | `customer@foodora.demo` | `Customer123!` | Explore menus, Cart, Checkout, Order Tracking, Loyalty (450 pts) |
| **Restaurant Manager** | `restaurant@foodora.demo` | `Restaurant123!` | Kitchen Orders Queue, Accept/Reject, Prep status, Open/Close |
| **Courier (Delivery)** | `delivery@foodora.demo` | `Delivery123!` | Dispatch Hub, Pickup Orders, GPS Navigation, Dropoff PIN verification |

---

## 5. Key Implemented Features

1. **Customer Ordering Flow**:
   - Filter by cuisine, rating, delivery fee, and search keywords.
   - Deep dish customization (e.g., Neapolitan crust, truffle burrata, spicy level, doneness).
   - Single-restaurant cart protection with prompt confirmation.
   - Address selector and quick-add form.
   - Coupon discount validation (`WELCOME20`, `FOODORA5`).
   - Loyalty point redemption ($1 per 100 points) and 10% point accrual on order completion.
   - Dropoff PIN security code generated for every order.

2. **Order Lifecycle & Real-time Tracking**:
   - `PLACED` → `CONFIRMED` → `PREPARING` → `READY_FOR_PICKUP` → `PICKED_UP` → `OUT_FOR_DELIVERY` → `DELIVERED`.
   - Polling fallback updating state machine progression live.
   - Post-delivery rating and reviews.

3. **Kitchen Portal**:
   - Real-time queue for accepting or rejecting orders with custom reasons.
   - Stage progression to notify couriers when orders are ready.

4. **Courier Dispatch Hub**:
   - Job acceptance for ready orders.
   - Step-by-step pickup and navigation.
   - Secure customer PIN validation before marking deliveries completed.

5. **Platform Administration**:
   - Database KPI statistics (Gross Volume, Platform Commissions, Order counts).
   - User suspension and role governance.
   - Coupon management engine.
   - Full audit trail logging for administrative actions.
