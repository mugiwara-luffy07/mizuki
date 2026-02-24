# Complete Authentication System Setup Guide

This guide will help you set up the complete user authentication system with protected order submission and email confirmation.

## 🎯 Features Implemented

✅ **Home Page Authentication Display**
- Shows Login/SignUp buttons when user is NOT authenticated
- Shows "Welcome, {username}" + Logout button when authenticated

✅ **Sign Up Functionality**
- Account creation with email, password, username
- Password hashing (handled by Supabase)
- Email verification/authentication mail
- Duplicate account detection with error message

✅ **Login Functionality**
- Email & password validation
- Error handling for wrong credentials
- Email verification check
- Session management with localStorage
- Redirect to Home Page on success

✅ **Protected Order Submission**
- Order submission blocked for unauthenticated users
- Redirect to login page with message
- Shows "Please login to place an order" message

✅ **Order Confirmation Email**
- Order saved to database with user link
- Confirmation email sent after successful order
- Frontend acknowledgement messages

✅ **Email Acknowledgement Handling**
- Success message: "Authentication email sent. Please check your inbox."
- Failure message: "Failed to send email. Please try again later."

✅ **Error Handling**
- User not found
- Wrong password
- Duplicate account
- Email not verified
- Network/server errors

✅ **Security**
- Password hashing (Supabase)
- Protected API routes (RLS policies)
- Input validation
- Protected order access

## 📋 Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project URL and anon key
- Node.js and npm installed

## 🚀 Setup Steps

### Step 1: Set Up Environment Variables

1. Create a `.env` file in the root of your project:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Get your Supabase credentials:
   - Go to your Supabase Dashboard
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

### Step 2: Run Database Migrations

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following migrations in order:

#### Migration 1: Orders Table (if not already created)
**Optional but recommended:** Open `supabase-migration.sql` and run it in SQL Editor.
- This creates the `orders` table for order management
- If you skip this, the auth migration will still work but won't link orders to users

#### Migration 2: Authentication & Profiles
**IMPORTANT:** Use `supabase-auth-complete-migration.sql` (recommended) - this is idempotent and safe to run multiple times.
- This migration will automatically check if the `orders` table exists
- If `orders` doesn't exist, it will skip orders-related changes (no error)
- If `orders` exists, it will add user linking functionality

**OR** if you get a "column username does not exist" error, run `supabase-auth-fix-migration.sql` first, then run the complete migration.

This will create:
- `profiles` table for user information
- Automatic profile creation on user signup (trigger)
- Email verification tracking
- User-order linking in orders table
- Row Level Security (RLS) policies

### Step 3: Configure Supabase Auth

1. Go to **Authentication** → **Settings** in Supabase Dashboard
2. Enable **Email Auth**
3. Configure **Email Templates**:
   - Go to **Authentication** → **Email Templates**
   - Customize the "Confirm signup" template if needed
4. Set **Site URL** to your app URL (e.g., `http://localhost:8080`)

### Step 4: Test the System

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test Sign Up:**
   - Navigate to `http://localhost:8080/mizuki/signup` (or your tenant)
   - Create a new account
   - Check your email for verification link
   - Verify the account

3. **Test Login:**
   - Navigate to `http://localhost:8080/mizuki/login`
   - Login with your credentials
   - Should redirect to home page showing "Welcome, {username}"

4. **Test Protected Order:**
   - Try to access `/mizuki/order` without logging in
   - Should redirect to login page with message
   - After login, should be able to place orders

5. **Test Order Confirmation:**
   - Place an order while logged in
   - Should see success message
   - Should receive confirmation email

## 📁 File Structure

```
src/
├── store/
│   └── authStore.ts          # Authentication state management
├── pages/
│   ├── Login.tsx             # Login page
│   ├── SignUp.tsx            # Sign up page
│   ├── Home.tsx              # Updated with auth display
│   └── CustomOrder.tsx       # Protected order submission
├── components/
│   └── ProtectedRoute.tsx    # Route protection component
└── lib/
    └── supabase/
        └── orders.ts         # Updated to link orders to users
```

## 🔐 Authentication Flow

### Sign Up Flow
1. User fills signup form (email, password, username)
2. System checks for duplicate email
3. Creates auth user (Supabase hashes password)
4. Creates profile record (via trigger)
5. Sends verification email
6. Shows success message

### Login Flow
1. User enters email and password
2. System validates credentials
3. Checks email verification status
4. Creates session
5. Loads user profile (username)
6. Redirects to home or intended page

### Order Submission Flow
1. User tries to access order page
2. ProtectedRoute checks authentication
3. If not authenticated → redirect to login
4. If authenticated → allow order creation
5. Order linked to user account
6. Confirmation email sent
7. Success message displayed

## 🛡️ Security Features

### Password Security
- Passwords are hashed by Supabase (bcrypt)
- Never stored in plain text
- Minimum 6 characters required

### Route Protection
- ProtectedRoute component checks auth state
- Unauthenticated users redirected to login
- Session stored securely in Supabase

### Database Security
- Row Level Security (RLS) enabled
- Users can only view their own orders
- Profiles protected by RLS policies

### Input Validation
- Email format validation
- Password strength requirements
- Username length validation
- Duplicate account prevention

## 📧 Email Configuration

### Email Templates
Supabase sends emails for:
- **Sign up confirmation** - Email verification link
- **Password reset** - (if implemented)

### Order Confirmation Email
The system sends order confirmation emails via your API endpoint:
- Configured in `src/lib/api/email.ts`
- Uses `sendConfirmationEmail` function
- Includes order details and customer info

## 🐛 Troubleshooting

### "Account already exists" error
- User is trying to sign up with existing email
- Solution: Use login instead

### "Please verify your email to continue"
- User hasn't verified email
- Solution: Check email inbox and click verification link

### "Invalid email or password"
- Wrong credentials entered
- Solution: Check email and password, or reset password

### Email not sending
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder

### Profile not created
- Database trigger might not be set up
- Solution: Run `supabase-auth-complete-migration.sql` again

### "column username does not exist" error
- The profiles table exists but is missing the username column
- **Solution:** Run `supabase-auth-fix-migration.sql` first, then run `supabase-auth-complete-migration.sql`
- OR: Run `supabase-auth-complete-migration.sql` which handles this automatically

### Orders not linking to users
- `user_id` column might not exist
- Solution: Run migration to add `user_id` to orders table

## 📝 API Endpoints Used

### Authentication (Supabase)
- `supabase.auth.signUp()` - Create new user
- `supabase.auth.signInWithPassword()` - Login
- `supabase.auth.signOut()` - Logout
- `supabase.auth.getSession()` - Check session

### Database
- `profiles` table - User profiles
- `orders` table - Orders (with user_id)

## 🎨 UI Components

### Login Page (`/login` or `/:tenant/login`)
- Email input
- Password input (with show/hide)
- Error messages
- Link to signup

### Sign Up Page (`/signup` or `/:tenant/signup`)
- Username input
- Email input
- Password input
- Confirm password
- Error messages
- Link to login

### Home Page
- Auth banner showing:
  - Login/SignUp buttons (if not authenticated)
  - Welcome message + Logout (if authenticated)

## ✅ Testing Checklist

- [ ] Sign up with new email
- [ ] Sign up with existing email (should show error)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should show error)
- [ ] Login with unverified email (should show error)
- [ ] Access order page without login (should redirect)
- [ ] Place order while logged in
- [ ] Receive confirmation email
- [ ] Logout functionality
- [ ] Session persistence on page refresh

## 🚀 Next Steps

1. **Email Service Configuration**
   - Set up your email sending service
   - Configure SMTP in Supabase or use external service
   - Test email delivery

2. **Password Reset**
   - Implement password reset flow
   - Add "Forgot Password" link to login page

3. **User Profile**
   - Add profile editing page
   - Allow users to update username/email

4. **Order History**
   - Show user's order history
   - Link orders to user account

5. **Admin Features**
   - View all orders
   - Filter by user
   - User management

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/overview)

---

**Note:** Make sure to run the database migrations before testing the authentication system. The system will work without the profiles table, but user linking and profile features won't function properly.

