# Quick Fix for "Already Exists" Errors

## Problem
You're getting errors like:
```
ERROR: 42710: trigger "update_profiles_updated_at" for relation "profiles" already exists
```

This happens when you try to run the migration more than once.

## Solution: Two Options

### Option 1: Run Cleanup Script First (Recommended) ✅

1. **Run the cleanup script first:**
   - Open Supabase Dashboard → SQL Editor
   - Open `cleanup-before-migration.sql`
   - Copy and paste the entire file
   - Click **Run**

2. **Then run the migration:**
   - Open `supabase-auth-migration.sql`
   - Copy and paste the entire file
   - Click **Run**

This will drop all existing triggers and policies, then recreate them fresh.

### Option 2: Just Re-run the Migration (Easier) ✅

I've already updated the migration file to include `DROP TRIGGER IF EXISTS` before each trigger creation. So you can:

1. **Simply re-run the migration:**
   - Open Supabase Dashboard → SQL Editor
   - Open `supabase-auth-migration.sql`
   - Copy and paste the entire file
   - Click **Run**

The migration is now **idempotent** (safe to run multiple times).

## What Was Fixed

I added `DROP TRIGGER IF EXISTS` before these triggers:
- ✅ `update_profiles_updated_at`
- ✅ `prevent_demote_super_admin_trigger`
- ✅ `prevent_delete_super_admin_trigger`

The `on_auth_user_created` trigger already had `DROP TRIGGER IF EXISTS`.

## If You Still Get Errors

### For Policies:
If you get policy errors, run this first:
```sql
-- Drop all policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read tenant profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
DROP POLICY IF EXISTS "Only super admins can manually create profiles" ON profiles;
DROP POLICY IF EXISTS "Only super admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON profiles;
```

Then re-run the migration.

### For Functions:
Functions use `CREATE OR REPLACE` so they shouldn't cause errors. But if they do:
```sql
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS prevent_demote_super_admin() CASCADE;
DROP FUNCTION IF EXISTS prevent_delete_super_admin() CASCADE;
```

## Verify Success

After running the migration, verify everything was created:

```sql
-- Check triggers
SELECT tgname FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('profiles', 'admin_invites')
  AND NOT t.tgisinternal;

-- Check policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('profiles', 'admin_invites')
ORDER BY tablename;
```

You should see:
- 4 triggers (on_auth_user_created, update_profiles_updated_at, prevent_demote_super_admin_trigger, prevent_delete_super_admin_trigger)
- Multiple policies on profiles and admin_invites

---

**TL;DR: Just re-run `supabase-auth-migration.sql` - it's now safe to run multiple times!** ✅

