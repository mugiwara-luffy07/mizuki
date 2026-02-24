# 🚀 Quick Start Guide - Authentication Setup

Follow these steps to get your authentication system running:

## ✅ Step-by-Step Checklist

### 1️⃣ Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 2️⃣ Create Environment File

1. In your project root (`storefuse-saas-engine-e70d09d1`), create a file named `.env`
2. Add these lines (replace with your actual values):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3️⃣ Run Database Migrations

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**

#### Migration A: Orders Table (Optional but Recommended)
1. Open `supabase-migration.sql` file
2. Copy all contents
3. Paste into SQL Editor
4. Click **Run** (or press F5)
5. ✅ Should see "Success. No rows returned"

#### Migration B: Authentication (Required)
1. Open `supabase-auth-complete-migration.sql` file
2. Copy all contents
3. Paste into SQL Editor
4. Click **Run** (or press F5)
5. ✅ Should see "Success. No rows returned" or a notice about orders table

**Note:** If you see "Orders table does not exist" notice, that's OK! The migration will still work.

### 4️⃣ Configure Supabase Auth Settings

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:8080`
3. Add to **Redirect URLs**:
   - `http://localhost:8080/auth/callback`
   - `http://localhost:8080/**`
4. Go to **Authentication** → **Providers**
5. Make sure **Email** provider is enabled

**Important:** The callback URL (`/auth/callback`) will handle email verification and redirect users to the home page with their name displayed.

### 5️⃣ Start Your Development Server

1. Open terminal in your project directory
2. Run:
   ```bash
   cd storefuse-saas-engine-e70d09d1
   npm run dev
   ```
3. ✅ Server should start on `http://localhost:8080`

### 6️⃣ Test the Authentication

#### Test Sign Up:
1. Open browser: `http://localhost:8080/mizuki/signup`
2. Fill in:
   - Username: `testuser`
   - Email: `your-email@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click **Create Account**
4. ✅ Should see success message
5. Check your email for verification link
6. Click verification link in email

#### Test Login:
1. Go to: `http://localhost:8080/mizuki/login`
2. Enter your email and password
3. Click **Sign In**
4. ✅ Should redirect to home page
5. ✅ Should see "Welcome, testuser" at top

#### Test Protected Order:
1. **Without logging in:**
   - Try to go to: `http://localhost:8080/mizuki/order`
   - ✅ Should redirect to login page
   - ✅ Should see "Please login to place an order"

2. **After logging in:**
   - Go to: `http://localhost:8080/mizuki/order`
   - ✅ Should see the order form (not redirected)

## 🐛 Troubleshooting

### "Invalid API key" or connection errors
- ✅ Check your `.env` file has correct values
- ✅ Make sure `.env` is in the project root (`storefuse-saas-engine-e70d09d1`)
- ✅ Restart your dev server after creating `.env`

### "column username does not exist"
- ✅ Run `supabase-auth-fix-migration.sql` first
- ✅ Then run `supabase-auth-complete-migration.sql` again

### "relation orders does not exist"
- ✅ This is OK if you skipped the orders migration
- ✅ Or run `supabase-migration.sql` first

### Email not sending
- ✅ Check Supabase Dashboard → **Authentication** → **Settings**
- ✅ Make sure email provider is enabled
- ✅ Check spam folder
- ✅ For development, Supabase sends emails automatically

### Can't login after signup
- ✅ Check your email and click verification link
- ✅ Make sure email is verified before trying to login

## 📝 What's Working Now

✅ User signup with email verification  
✅ User login with session management  
✅ Protected order submission (requires login)  
✅ Home page shows auth state  
✅ Logout functionality  
✅ Order linking to user accounts  
✅ Email confirmation for orders  

## 🎉 You're Done!

Your authentication system is now set up and working!

Next steps:
- Customize email templates in Supabase
- Add password reset functionality
- Customize UI styling
- Deploy to production

