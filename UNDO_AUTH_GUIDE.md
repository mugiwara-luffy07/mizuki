# Undo Authentication Setup - Complete Guide

## What This Does

This guide will help you completely remove all authentication-related changes and start fresh.

## Step 1: Clean Up Database (Supabase)

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Run the cleanup script:**
   - Open `undo-auth.sql`
   - Copy and paste the entire file
   - Click **Run**

This will:
- ✅ Drop all triggers
- ✅ Drop all functions
- ✅ Drop all RLS policies
- ✅ Disable RLS on tables
- ⚠️ Optionally drop tables (commented out - uncomment if you want to delete all data)

## Step 2: Verify Database Cleanup

Run this to check:

```sql
-- Check triggers
SELECT tgname FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('profiles', 'admin_invites')
  AND NOT t.tgisinternal;

-- Check policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('profiles', 'admin_invites', 'orders');

-- Check functions
SELECT proname FROM pg_proc
WHERE proname IN (
  'handle_new_user',
  'update_updated_at_column',
  'prevent_demote_super_admin',
  'prevent_delete_super_admin'
);
```

All should return empty results.

## Step 3: Code Files Already Reverted ✅

The following files have been reverted to their original state:

- ✅ `src/store/authStore.ts` - Back to simple mock auth
- ✅ `src/admin/AdminLogin.tsx` - Back to mock login
- ✅ `src/superadmin/SuperAdminLogin.tsx` - Back to mock login
- ✅ `src/App.tsx` - Removed auth initialization
- ✅ `src/superadmin/ProtectedRouteSuperadmin.tsx` - Back to simple check

## Step 4: Delete Auth-Related Files

The following files have been deleted:

- ✅ `src/lib/supabase/auth.ts`
- ✅ `src/components/ProtectedRoute.tsx`
- ✅ `src/components/AdminInviteManager.tsx`
- ✅ `src/pages/Login.tsx`

## Step 5: Clean Up Documentation Files (Optional)

You can delete these documentation files if you don't need them:

- `AUTH_SETUP.md`
- `SUPABASE_SETUP.md` (if it's auth-related)
- `SQL_FIX_SUMMARY.md`
- `TRIGGER_FIX.md`
- `NEXT_STEPS.md`
- `SUPER_ADMIN_SETUP.md`
- `QUICK_FIX.md`
- `supabase-auth-migration.sql`

Keep if you want to reference them later:
- `supabase-migration.sql` (orders table - not auth-related)

## Step 6: Clear Browser Storage

Clear your browser's localStorage to remove any persisted auth state:

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Delete `storefuse-auth` entry
4. Refresh the page

Or run in browser console:
```javascript
localStorage.removeItem('storefuse-auth');
```

## Step 7: Verify Everything Works

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test admin login:**
   - Go to `/:tenant/admin`
   - Should work with mock login (any email/password)

3. **Test super admin login:**
   - Go to `/superadmin/login`
   - Should work with mock login (any email/password)

## What's Left

After cleanup, you'll have:
- ✅ Original mock authentication system
- ✅ No Supabase Auth dependencies in code
- ✅ No database triggers or policies
- ✅ Clean slate to start fresh

## Starting Fresh

When you're ready to implement authentication again:

1. Decide on your authentication approach
2. Set up database schema
3. Implement auth logic
4. Test thoroughly

---

**You're all set! Your codebase is back to its original state without authentication.** 🎉

