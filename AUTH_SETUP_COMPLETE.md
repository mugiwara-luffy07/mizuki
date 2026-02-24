# Complete Authentication & Authorization Setup Guide

## Overview

This system implements secure authentication and authorization with:
- **Supabase Auth** for user authentication
- **Role-Based Access Control (RBAC)** with three roles: `super_admin`, `admin`, `user`
- **Row Level Security (RLS)** at the database level
- **Session management** with automatic refresh
- **Beautiful login UI** matching your design

## Step 1: Run Database Migration

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Run the migration:**
   - Open `supabase-auth-migration.sql`
   - Copy the entire file (all 534 lines)
   - Paste and click **Run**

This creates:
- `profiles` table (user roles and tenant associations)
- `admin_invites` table (email allowlist for admin creation)
- Automatic profile creation trigger
- RLS policies for all tables
- Helper functions

## Step 2: Create Your First Super Admin

### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users** → **Add User**
2. Enter email and password
3. **Copy the User UUID**
4. Run this SQL:

```sql
INSERT INTO profiles (id, email, role, tenant)
VALUES (
  'YOUR_UUID_HERE',
  'your-email@example.com',
  'super_admin',
  NULL
);
```

### Option B: Automatic (After Migration)

The trigger will automatically create profiles. For super admin, you need to manually update:

```sql
-- After user signs up, update to super_admin
UPDATE profiles
SET role = 'super_admin', tenant = NULL
WHERE email = 'your-email@example.com';
```

## Step 3: Test the System

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test Super Admin Login:**
   - Go to `/superadmin/login`
   - Use your super admin credentials
   - Should redirect to `/superadmin/dashboard`

3. **Test Admin Login:**
   - Create an admin invite first (see Step 4)
   - Go to `/:tenant/admin`
   - Login with admin credentials

4. **Test User Signup/Login:**
   - Go to `/login`
   - Sign up as a regular user
   - Should get `user` role automatically

## Step 4: Create Admin Invites

### Via SQL:

```sql
INSERT INTO admin_invites (email, tenant)
VALUES ('admin@mizuki.com', 'mizuki');
```

### Via Frontend (Coming Soon):

Add the `AdminInviteManager` component to your Super Admin Dashboard.

## Features Implemented

### ✅ Authentication
- Email/password signup and login
- Session persistence across page refreshes
- Automatic session refresh
- Secure logout

### ✅ Authorization
- Role-based access control (super_admin, admin, user)
- Protected routes for each role
- Tenant-based access for admins
- Automatic role assignment on signup

### ✅ UI Components
- Beautiful login form matching your design
- Animated background patterns
- Responsive design
- Loading states

### ✅ Security
- Row Level Security (RLS) policies
- Database-level permission enforcement
- Session management
- Role verification from database

## File Structure

```
src/
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx          # Reusable login form component
│   └── ProtectedRoute.tsx         # Protected route wrapper
├── lib/
│   └── supabase/
│       └── auth.ts                # Authentication service functions
├── pages/
│   └── Login.tsx                  # General login/signup page
├── admin/
│   └── AdminLogin.tsx             # Admin login (uses LoginForm)
├── superadmin/
│   └── SuperAdminLogin.tsx        # Super admin login (uses LoginForm)
└── store/
    └── authStore.ts               # Auth state management
```

## Usage Examples

### Login Component

```tsx
import { LoginForm } from '@/components/auth/LoginForm';

<LoginForm
  onSubmit={handleLogin}
  isLoading={false}
  brandName="MIZUKI"
  tagline="The Haute Couture"
  showSignup={true}
/>
```

### Protected Routes

```tsx
// Super Admin only
<Route element={<ProtectedRouteSuperAdmin />}>
  <Route path="/superadmin" element={<SuperAdminLayout />}>
    {/* Protected routes */}
  </Route>
</Route>

// Admin only (requires tenant)
<Route element={<ProtectedRouteAdmin />}>
  <Route path="/:tenant/admin" element={<AdminLayout />}>
    {/* Protected routes */}
  </Route>
</Route>
```

### Check Auth State

```tsx
import { useAuthStore } from '@/store/authStore';

const { user, isAuthenticated, isLoading } = useAuthStore();

if (user?.role === 'super_admin') {
  // Super admin access
}
```

## Next Steps

1. ✅ Run database migration
2. ✅ Create super admin account
3. ✅ Test authentication flow
4. ⏳ Add password reset functionality
5. ⏳ Add email verification
6. ⏳ Add user management UI
7. ⏳ Add admin invite management UI

## Troubleshooting

### "User profile not found"
- Check if profile was created by trigger
- Manually create: `INSERT INTO profiles (id, email, role, tenant) VALUES (...)`

### "Access denied"
- Verify user role in `profiles` table
- Check tenant matches for admin access
- Verify RLS policies are enabled

### Session not persisting
- Check browser localStorage
- Verify Supabase Auth settings
- Check environment variables

---

**Your authentication system is ready!** 🎉


























