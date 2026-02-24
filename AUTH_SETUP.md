# Authentication & Authorization Setup Guide

This guide will help you set up the complete authentication and authorization system using Supabase.

## Overview

The system implements:
- **Supabase Auth** for secure authentication
- **Role-Based Access Control (RBAC)** with three roles: `super_admin`, `admin`, `user`
- **Row Level Security (RLS)** at the database level
- **Admin invitation system** for controlled access
- **Secure session management** with JWT tokens

## Step 1: Run Database Migration

1. Go to your Supabase Dashboard → **SQL Editor**
2. Open the file `supabase-auth-migration.sql`
3. Copy and paste the entire SQL script
4. Click **Run** to execute

This will create:
- `profiles` table (user roles and tenant associations)
- `admin_invites` table (email allowlist for admin creation)
- Automatic profile creation trigger
- Row Level Security policies
- Helper functions

## Step 2: Create Initial Super Admin

Super Admin accounts must be created manually. You have two options:

### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users** → **Add User**
2. Create a user with email and password
3. Note the user's UUID
4. Go to **SQL Editor** and run:

```sql
INSERT INTO profiles (id, email, role, tenant)
VALUES ('USER_UUID_HERE', 'admin@example.com', 'super_admin', NULL);
```

### Option B: Via SQL (Recommended)

```sql
-- First, create the auth user (you'll need to set password via dashboard or API)
-- Then create the profile
INSERT INTO profiles (id, email, role, tenant)
VALUES (
  'USER_UUID_FROM_AUTH_USERS',
  'superadmin@example.com',
  'super_admin',
  NULL
);
```

**Important:** Super Admin role cannot be changed or deleted by anyone, including other super admins.

## Step 3: Set Up Admin Invites (Initial Setup)

During initial setup, only pre-approved emails can become admins:

1. As Super Admin, go to Super Admin Dashboard
2. Navigate to Admin Invites section
3. Create invites for admin emails with their tenant

Or via SQL:

```sql
INSERT INTO admin_invites (email, tenant)
VALUES ('admin@tenant.com', 'mizuki');
```

When the invited admin signs up:
- Role is automatically set to `admin`
- Tenant is automatically assigned
- Invite is marked as used

## Step 4: Test Authentication

1. **Test Super Admin Login:**
   - Navigate to `/superadmin/login`
   - Use your super admin credentials
   - Should redirect to `/superadmin/dashboard`

2. **Test Admin Login:**
   - Create an admin invite first
   - Sign up with the invited email
   - Navigate to `/:tenant/admin`
   - Login with admin credentials
   - Should redirect to `/:tenant/admin/dashboard`

3. **Test User Access:**
   - Regular users can sign up (default role: `user`)
   - They can access public pages and create orders

## Step 5: Post-Launch Admin Management

After launch, admins can invite users:

1. Admin logs into their dashboard
2. Navigates to User Management
3. Creates invites for users
4. Users sign up and automatically get `user` role for that tenant

## Role Permissions

### Super Admin
- ✅ Full system access
- ✅ Create/manage all tenants
- ✅ Create admin invites
- ✅ Manage all users
- ✅ View all orders
- ❌ Cannot change own role
- ❌ Cannot delete other super admins

### Admin
- ✅ Manage users in their tenant
- ✅ View/update orders for their tenant
- ✅ Create user invites for their tenant
- ❌ Cannot access other tenants
- ❌ Cannot change own role
- ❌ Cannot create admins

### User
- ✅ View own orders
- ✅ Create orders
- ❌ Cannot access admin areas
- ❌ Cannot manage other users

## Security Features

### Row Level Security (RLS)
- All database operations are protected by RLS policies
- Users can only access data they're authorized for
- Policies are enforced at the database level, not just frontend

### Session Management
- Sessions are managed by Supabase Auth
- JWT tokens are automatically refreshed
- Sessions persist across page refreshes
- Secure logout clears all session data

### Role Verification
- Roles are fetched from database on every request
- Frontend never trusts client-side role values
- All protected routes verify role from database

## API Functions

### Authentication
```typescript
import { signIn, signUp, signOut, getCurrentUserProfile } from '@/lib/supabase/auth';

// Sign in
const { user, session, profile } = await signIn(email, password);

// Sign up
const { user, session, profile } = await signUp(email, password);

// Sign out
await signOut();

// Get current user profile
const profile = await getCurrentUserProfile();
```

### Admin Management (Super Admin Only)
```typescript
import { createAdminInvite, getAdminInvites, deleteAdminInvite } from '@/lib/supabase/auth';

// Create admin invite
await createAdminInvite('admin@example.com', 'tenant-slug');

// Get all invites
const invites = await getAdminInvites();

// Delete invite
await deleteAdminInvite(inviteId);
```

## Protected Routes

### Super Admin Routes
```tsx
<Route element={<ProtectedRouteSuperAdmin />}>
  <Route path="/superadmin" element={<SuperAdminLayout />}>
    {/* Protected routes */}
  </Route>
</Route>
```

### Admin Routes
```tsx
<Route element={<ProtectedRouteAdmin />}>
  <Route path="/:tenant/admin" element={<AdminLayout />}>
    {/* Protected routes */}
  </Route>
</Route>
```

### User Routes
```tsx
<Route element={<ProtectedRouteUser />}>
  <Route path="/user" element={<UserLayout />}>
    {/* Protected routes */}
  </Route>
</Route>
```

## Troubleshooting

### "User profile not found"
- The profile trigger might not have fired
- Manually create profile: `INSERT INTO profiles (id, email, role, tenant) VALUES (...)`

### "Access denied" errors
- Check RLS policies are enabled
- Verify user role in `profiles` table
- Check tenant matches for admin access

### Session not persisting
- Check Supabase Auth settings
- Verify environment variables are set
- Check browser localStorage is enabled

### Cannot create admin invite
- Verify you're logged in as super admin
- Check RLS policies allow insert on `admin_invites`
- Check tenant value is valid

## Database Schema

### profiles
- `id` (UUID, FK to auth.users)
- `email` (TEXT)
- `role` (TEXT: 'super_admin', 'admin', 'user')
- `tenant` (TEXT, NULL for super_admin)
- `created_at`, `updated_at` (TIMESTAMP)

### admin_invites
- `id` (UUID)
- `email` (TEXT, UNIQUE)
- `tenant` (TEXT)
- `used` (BOOLEAN)
- `used_at`, `used_by` (TIMESTAMP, UUID)
- `created_at`, `expires_at` (TIMESTAMP)

## Next Steps

1. ✅ Run database migration
2. ✅ Create super admin account
3. ✅ Test authentication flow
4. ✅ Create admin invites
5. ✅ Set up admin dashboard with invite manager
6. ✅ Configure email templates (optional)
7. ✅ Add password reset functionality (optional)

## Support

For issues:
1. Check Supabase Dashboard → Logs
2. Check browser console for errors
3. Verify RLS policies are correct
4. Check user profile exists in `profiles` table

