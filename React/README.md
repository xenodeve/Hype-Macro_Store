# 🎮 HYPE-MACRO Store - React Frontend

Modern e-commerce frontend application built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS** for selling premium gaming products.

---

## ✨ Features

### 🛍️ **E-Commerce Features**
- 🏠 **Landing Page** - Interactive homepage with product showcase
- 📦 **Product Catalog** - Display products with images, details, and prices
- 🛒 **Shopping Cart** - Full-featured cart with Redux state management
- 👤 **User Authentication** - Login/Register with JWT token
- 📍 **Shipping Address** - Manage multiple shipping addresses
- 💳 **Payment Processing** - Multiple payment methods (Card, QR Code, Bank Transfer)
- 📋 **Order History** - View and manage order history
- 👤 **User Profile** - Manage personal information and saved cards
- 🗑️ **Order Cancellation** - Cancel unpaid orders

### 🎨 **Modern UI/UX**
- 🌓 **Dark/Light Mode** - System-aware theme switching
- 📱 **Fully Responsive** - Works on all devices (mobile, tablet, desktop)
- ✨ **Smooth Animations** - GSAP and Framer Motion animations
- 🎬 **Interactive Elements** - Engaging user interactions
- 🔄 **Loading States** - Beautiful loading indicators
- ⚡ **Fast Performance** - Optimized with Vite HMR

### 💰 **Payment System**
- 💳 **Credit/Debit Card** - Save and manage multiple cards
- 📱 **QR Code (PromptPay)** - Generate QR code with expiry timer
- 🏦 **Bank Transfer** - Manual bank transfer with slip upload
- 🧾 **Slip Verification** - Automatic slip verification
- ⏱️ **Payment Timer** - QR code expiration countdown
- 🔔 **Payment Notifications** - Alert for pending payments
- 🔄 **Order Recovery** - Resume unpaid orders

### 🔒 **Security & State Management**
- 🔐 **JWT Authentication** - Secure token-based auth
- 📦 **Redux Toolkit** - Centralized state management
- 💾 **Persistent Storage** - LocalStorage and SessionStorage
- 🛡️ **Protected Routes** - Authentication-required pages
- ✅ **Form Validation** - Client-side input validation

---

## 🚀 Tech Stack

- **React 19.1.1** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Vite 7** - Lightning-fast build tool
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **GSAP** - Professional animations
- **ESLint** - Code linting

---

## 📁 Project Structure

```
React/
├── src/
│   ├── components/           # React components
│   │   ├── AppNav.tsx             # Navigation bar
│   │   ├── Cart.tsx               # Shopping cart
│   │   ├── Shipping.tsx           # Shipping form
│   │   ├── Payment.tsx            # Payment processing
│   │   ├── PaymentSuccess.tsx     # Order confirmation
│   │   ├── Profile.tsx            # User profile
│   │   ├── Orders.tsx             # Order history
│   │   ├── Login.tsx              # Login page
│   │   ├── Register.tsx           # Registration
│   │   ├── HomePage.tsx           # Landing page
│   │   ├── CheckoutProgress.tsx   # Checkout stepper
│   │   ├── PendingPaymentNotification.tsx
│   │   └── UnpaidOrderAlert.tsx
│   ├── features/            # Redux slices
│   │   ├── auth/                 # Authentication
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Checkout process
│   │   └── products/             # Products catalog
│   ├── services/            # API services
│   │   ├── api.ts                # Axios configuration
│   │   ├── authService.ts        # Auth API
│   │   ├── orderService.ts       # Orders API
│   │   ├── productService.ts     # Products API
│   │   ├── userService.ts        # Users API
│   │   └── paymentService.ts     # Payment & slip verification
│   ├── store/               # Redux store
│   │   └── store.ts
│   ├── preview/             # Animation utilities
│   ├── styles/              # CSS files
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 20+ and npm/yarn
- Backend API running on `http://localhost:3000`

### Installation

```bash
# Clone the repository
git clone https://github.com/xenodeve/Hype-Macro_Store.git
cd Hype-Macro_Store/React

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:3000/api

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server with HMR

# Build
npm run build           # Build for production
npm run preview         # Preview production build

# Linting
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors

# Type Checking
npx tsc --noEmit        # Check TypeScript errors
```

---

## 🎯 Key Features Explained

### Shopping Cart
- Add/remove items
- Adjust quantities
- Calculate totals automatically
- Persist cart in Redux + LocalStorage
- Product recommendations

### Checkout Flow
1. **Cart Review** - Review items and quantities
2. **Shipping** - Enter/select shipping address
3. **Payment** - Choose payment method and pay
4. **Success** - Order confirmation

### Payment Methods

**Credit/Debit Card**
- Save multiple cards securely
- Encrypted card details
- One-click payment

**QR Code (PromptPay)**
- Generate QR code instantly
- 5-minute expiry timer
- Real-time countdown

**Bank Transfer**
- Upload slip image
- Automatic verification
- Amount and duplicate check

### Order Management
- View all orders
- Filter by status (All, Pending, Paid, Shipped, Delivered)
- Track order progress
- Cancel unpaid orders
- Resume pending payments

---

## 🔐 Authentication Flow

```typescript
// Login
POST /api/auth/login
→ Receive JWT token
→ Store in Redux + LocalStorage
→ Include in all API requests

// Protected Routes
<RequireAuth>
  <Component />
</RequireAuth>

// Logout
dispatch(logout())
→ Clear token
→ Redirect to home
```

---

## 📊 State Management

### Redux Slices

**authSlice**
- User information
- JWT token
- Login/logout actions

**cartSlice**
- Cart items
- Add/remove/update items
- Calculate subtotal

**checkoutSlice**
- Shipping address
- Payment method
- Saved addresses

**productsSlice**
- Product catalog
- Fetch products from API
- Loading states

---

## 🎨 Styling

### Tailwind CSS Configuration

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
      animation: {
        // Custom animations
      },
    },
  },
  plugins: [],
}
```

### Dark Mode

```typescript
// Toggle dark mode
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
}

// System preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file in React folder:

```env
VITE_API_URL=http://localhost:3000/api
```

### Vite Config

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 📱 Responsive Design

```css
/* Mobile First */
.container {
  /* Mobile styles */
}

@media (min-width: 640px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}

@media (min-width: 1280px) {
  /* Large Desktop */
}
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Environment Variables:
# VITE_API_URL=https://your-api-domain.com/api
```

### Netlify

```bash
# Build settings:
# Build command: npm run build
# Publish directory: dist

# _redirects file for SPA routing
/* /index.html 200
```

---

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed**
```bash
# Check if backend is running
# Check VITE_API_URL in .env
# Check CORS settings in backend
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Check types
npx tsc --noEmit

# Update dependencies
npm update
```

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

## 👨‍💻 Developer

**Xeno** - Full-Stack Developer
- GitHub: [@xenodeve](https://github.com/xenodeve)
- Repository: [Hype-Macro_Store](https://github.com/xenodeve/Hype-Macro_Store)

---

## 📜 License

© 2025 HYPE-RX. All rights reserved.

---

**Last Updated**: 2025-11-06  
**Version**: 2.0.0  
**Status**: ✅ Production Ready
