# Super Admin Setup Guide

## Problem: "duplicate key value violates unique constraint"

This error means you're trying to create a profile for a user that already has one.

## Solution: Check First, Then Create or Update

### Step 1: Find Your User UUID

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Find your user (or create one if needed)
3. **Copy the User UUID** (it looks like: `f57b8150-8a03-4a65-8408-9fdfdf1bd24c`)

### Step 2: Check if Profile Exists

Run this query in SQL Editor:

```sql
SELECT 
  u.id,
  u.email,
  p.role,
  p.tenant,
  CASE WHEN p.id IS NOT NULL THEN 'Profile exists' ELSE 'No profile' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';  -- Replace with your email
```

### Step 3: Create or Update Profile

#### If Profile DOES NOT Exist:

```sql
INSERT INTO profiles (id, email, role, tenant)
VALUES (
  'YOUR_UUID_HERE',  -- Paste the UUID from Step 1
  'your-email@example.com',  -- Your email
  'super_admin',
  NULL
);
```

#### If Profile EXISTS (Update it):

```sql
UPDATE profiles
SET role = 'super_admin',
    tenant = NULL,
    email = 'your-email@example.com',
    updated_at = NOW()
WHERE id = 'YOUR_UUID_HERE';  -- Paste the UUID from Step 1
```

### Step 4: Use the Safe Script (Recommended)

I've created a safe script that handles both cases automatically:

1. Open `create-super-admin-safe.sql`
2. Replace `USER_UUID_HERE` with your actual UUID
3. Replace `superadmin@example.com` with your email
4. Run the script

It will:
- ✅ Check if profile exists
- ✅ Create it if it doesn't exist
- ✅ Update it to super_admin if it exists

## Quick Commands

### View All Users and Their Profiles:
```sql
SELECT 
  u.id,
  u.email as auth_email,
  p.email as profile_email,
  p.role,
  p.tenant,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
```

### View Only Users Without Profiles:
```sql
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

### View All Super Admins:
```sql
SELECT id, email, created_at
FROM profiles
WHERE role = 'super_admin';
```

### Delete a Profile (if needed):
```sql
-- WARNING: This will delete the profile but NOT the auth user
DELETE FROM profiles WHERE id = 'USER_UUID_HERE';
```

## Troubleshooting

### "Profile already exists but wrong role"
**Solution:** Use UPDATE instead of INSERT:
```sql
UPDATE profiles
SET role = 'super_admin', tenant = NULL
WHERE id = 'YOUR_UUID';
```

### "User doesn't exist in auth.users"
**Solution:** Create the auth user first:
1. Go to **Authentication** → **Users** → **Add User**
2. Create user with email and password
3. Then create the profile

### "Can't update profile - permission denied"
**Solution:** Make sure you're running as a user with proper permissions, or use the service_role key in your SQL editor.

## Next Steps

After creating your super admin profile:

1. ✅ Test login at `/superadmin/login`
2. ✅ Verify you can access `/superadmin/dashboard`
3. ✅ Create admin invites
4. ✅ Test the full authentication flow

---

**Remember:** The profile `id` must match the `auth.users.id` exactly!

