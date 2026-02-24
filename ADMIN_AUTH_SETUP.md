# Admin Authentication Setup Guide

This guide will help you set up email-based admin authentication for your StoreFuse SaaS application using Supabase.

## 🎯 Overview

After this setup:
- **Admins** will use the same login page as regular users
- Admin privileges are determined by email addresses stored in Supabase
- Visiting `/tenant/admin` redirects to the regular login page
- After login, admins are automatically redirected to the admin dashboard
- Non-admins cannot access admin routes

## 📋 Setup Steps

### Step 1: Run the SQL Migration

1. Open your Supabase dashboard
2. Go to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy and paste the contents of `supabase-admin-setup.sql`
5. Click **Run** or press `Ctrl/Cmd + Enter`

This will:
- Add a `role` column to your `profiles` table
- Create helper functions for checking admin status
- Set up Row Level Security (RLS) policies
- Update triggers to handle new user registrations

### Step 2: Set Your Admin Emails

After running the migration, you need to designate which email addresses should have admin access.

#### Option A: Set Admin for Existing Users

If you already have user accounts, update them to admin:

```sql
-- Set a single user as admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';

-- Set multiple users as admin
UPDATE profiles 
SET role = 'admin' 
WHERE email IN (
  'admin1@example.com', 
  'admin2@example.com', 
  'admin3@example.com'
);

-- Set a superadmin (higher privileges)
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'superadmin@example.com';
```

#### Option B: Create New Admin Accounts

1. Go to your app's signup page
2. Create a new account with your desired admin email
3. Verify the email
4. Run the SQL above to upgrade that account to admin

#### Verify Admin Users

Check all admin users in your database:

```sql
SELECT id, email, username, role, created_at 
FROM profiles 
WHERE role IN ('admin', 'superadmin')
ORDER BY role, email;
```

### Step 3: Test the Setup

1. **Test Admin Login:**
   - Visit: `http://localhost:8080/your-tenant/admin`
   - You'll be redirected to the login page
   - Sign in with an admin email you configured
   - You should be redirected to `/your-tenant/admin/dashboard`

2. **Test Non-Admin Access:**
   - Sign out and log in with a regular user account
   - Try to visit `/your-tenant/admin/dashboard`
   - You should be denied and redirected to the home page

3. **Test Direct Admin Login:**
   - Visit: `http://localhost:8080/your-tenant/admin`
   - Sign in with admin credentials
   - You should land on the admin dashboard

## 🔐 How It Works

### Authentication Flow

```
User visits /tenant/admin
    ↓
Redirects to /tenant/login
    ↓
User enters email + password
    ↓
System checks credentials in Supabase
    ↓
If valid, fetches user profile with role
    ↓
If role = 'admin' or 'superadmin'
    → Redirect to /tenant/admin/dashboard
Else
    → Redirect to /tenant (home page)
```

### Protected Routes

Admin routes are protected by the `ProtectedAdminRoute` component:
- Checks if user is logged in
- Verifies user has admin role
- Redirects non-admins to home page
- Shows access denied message

### Role Hierarchy

- `user` - Regular users (default)
- `admin` - Tenant administrators
- `superadmin` - Super administrators (highest privileges)

## 🛠️ Configuration

### Add More Admin Emails Anytime

You can add or remove admin access at any time:

```sql
-- Promote a user to admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'newadmin@example.com';

-- Demote an admin to regular user
UPDATE profiles 
SET role = 'user' 
WHERE email = 'oldadmin@example.com';

-- Upgrade admin to superadmin
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'admin@example.com';
```

### Check Admin Status in Code

The auth store provides helper methods:

```typescript
import { useAuthStore } from '@/store/authStore';

function MyComponent() {
  const { isAdmin, isSuperAdmin, role } = useAuthStore();
  
  if (isAdmin()) {
    // User is admin or superadmin
  }
  
  if (isSuperAdmin()) {
    // User is superadmin only
  }
  
  console.log(role); // 'user', 'admin', or 'superadmin'
}
```

## 📂 Files Modified

- ✅ `supabase-admin-setup.sql` - Database migration
- ✅ `src/store/authStore.ts` - Added role tracking and helper methods
- ✅ `src/admin/ProtectedAdminRoute.tsx` - New admin route protection
- ✅ `src/admin/AdminLogin.tsx` - Simplified to redirect to regular login
- ✅ `src/pages/Login.tsx` - Auto-redirect admins after login
- ✅ `src/App.tsx` - Updated admin routes with protection

## 🎨 Customization

### Change Default Role

To change the default role for new users, edit the `handle_new_user()` function in the SQL migration:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, email_verified, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    'user'  -- Change this to 'admin' if you want all new users to be admins
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Add Custom Roles

You can add more roles by updating the constraint:

```sql
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'superadmin', 'moderator', 'manager'));
```

## 🐛 Troubleshooting

### "Access denied" even though I'm an admin

1. Check your role in the database:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```

2. Clear your browser session and log in again

3. Make sure the `role` column was added successfully:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' AND column_name = 'role';
   ```

### Admin routes not working

1. Make sure you ran the SQL migration completely
2. Check browser console for errors
3. Verify the `ProtectedAdminRoute` component is imported correctly
4. Clear cache and restart your dev server

### Can't update roles

1. Make sure RLS policies are set up correctly
2. You may need to run updates as the Supabase service role
3. Use the Supabase Dashboard → SQL Editor for updates

## 🚀 Next Steps

- Set up email notifications for admin actions
- Create admin-specific features (user management, analytics, etc.)
- Add audit logging for admin activities
- Implement role-based permissions for different admin levels

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/concepts#protected-routes)
