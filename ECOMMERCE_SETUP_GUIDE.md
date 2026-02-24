# E-Commerce Platform Setup Guide

This guide will help you set up the complete e-commerce platform with all features.

## 📋 Prerequisites

1. Supabase account and project
2. Node.js and npm installed
3. Environment variables configured

## 🗄️ Database Setup

### Step 1: Run Database Schema

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL files in order:

   **First, run:** `ECOMMERCE_DATABASE_SCHEMA.sql`
   - Creates products, cart, wishlist, ecommerce_orders, and reviews tables
   - Sets up RLS policies
   - Creates indexes for performance

   **Then run:** `FIX_RLS_AND_EMAIL_VERIFICATION.sql` (if needed)
   - Fixes RLS policies for profile creation
   - Ensures email verification works

### Step 2: Verify Tables

Check that these tables exist in your Supabase database:
- ✅ `products`
- ✅ `cart`
- ✅ `wishlist`
- ✅ `ecommerce_orders`
- ✅ `reviews`
- ✅ `profiles` (should already exist)

## 🎨 Features Implemented

### ✅ Navigation & Menu
- Top navigation bar with: Home | Shop | Custom Order | About | Contact
- Cart and Wishlist icons with item counts
- Mobile-responsive menu

### ✅ Shop Page
- Product listing with grid layout
- Real-time search (by name, fabric, color, category)
- Category filtering
- Product cards with:
  - Product image
  - Short product name
  - Price
  - Wishlist icon (♡)
  - Add to Bag button

### ✅ Product Details Page (PDP)
- Image carousel with:
  - Multiple images per product
  - Left/right navigation
  - Thumbnails
- Product title (SEO-friendly)
- Price section with tax information
- Add to Bag and Add to Wishlist buttons
- Product specifications table
- Product description
- Delivery & shipping policy
- Disclaimer
- Return policy
- Reviews section (placeholder)

### ✅ Guest Mode (No Login Required)
- Browse products
- View product details
- Add products to Bag (localStorage)
- Add/remove products from Wishlist (localStorage)
- Cart & wishlist persist across visits

### ✅ Cart Page
- Display all cart items
- Quantity controls (+ / −)
- Remove item option
- Order summary with:
  - Subtotal
  - Shipping (free over ₹5000)
  - Total
- Proceed to Checkout button
- Login prompt if not authenticated

### ✅ Authentication & Sync
- Email-based signup/login
- After login:
  - localStorage cart → database sync
  - localStorage wishlist → database sync
  - Clear localStorage data

### ✅ Contact Us Page
- Working hours display
- Phone numbers
- Email
- WhatsApp link

### ✅ Legal Pages
- Privacy Policy (mentions cookies & localStorage)
- Terms & Conditions
- Refund Policy

## 🛠️ Admin Panel Features (To Be Enhanced)

The admin panel currently has:
- ✅ Dashboard
- ✅ Orders management

**Still needed:**
- Product management (CRUD)
- Image management
- Review moderation

## 📦 Order Flow (To Be Implemented)

1. Checkout page
2. Order summary
3. Payment integration
4. Order confirmation email
5. Order status tracking

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migrations

Follow the database setup steps above.

### 4. Start Development Server

```bash
npm run dev
```

### 5. Test the Features

1. **Guest Shopping:**
   - Visit `/{tenant}/shop`
   - Add products to cart (no login required)
   - Add products to wishlist
   - Check cart page

2. **User Registration:**
   - Sign up with email
   - Verify email (check Supabase email settings)
   - Login

3. **Cart/Wishlist Sync:**
   - Add items as guest
   - Login
   - Items should sync to database

## 📝 Important Notes

### localStorage Usage
- Cart and wishlist use localStorage for guest users
- Data persists across browser sessions
- After login, data syncs to database

### Email Verification
- Configure in Supabase Dashboard → Authentication → Settings
- Enable "Email confirmations"
- Check SMTP settings

### RLS Policies
- Products: Public read, Admin write
- Cart: Users manage own cart
- Wishlist: Users manage own wishlist
- Orders: Users view own, Admins view all
- Reviews: Public view approved, Users create own

## 🔧 Troubleshooting

### Cart/Wishlist Not Syncing
- Check if user is logged in
- Check browser console for errors
- Verify RLS policies are correct

### Products Not Loading
- Check Supabase connection
- Verify products table exists
- Check tenant parameter in URL

### 401 Errors on Profile Creation
- This is normal - trigger creates profile automatically
- Check console logs for confirmation

## 📚 Next Steps

1. Implement checkout flow
2. Add payment integration
3. Enhance admin panel with product management
4. Add review moderation
5. Implement order tracking
6. Add email notifications

## 🎯 Testing Checklist

- [ ] Browse products as guest
- [ ] Add to cart (localStorage)
- [ ] Add to wishlist (localStorage)
- [ ] Sign up new account
- [ ] Login
- [ ] Verify cart/wishlist sync
- [ ] View product details
- [ ] Check cart page
- [ ] Check wishlist page
- [ ] Test search functionality
- [ ] Test category filtering
- [ ] View contact page
- [ ] View legal pages

---

**Need Help?** Contact: enquiry@asfffdf.com













