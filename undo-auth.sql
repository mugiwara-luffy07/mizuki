-- ============================================
-- UNDO AUTHENTICATION SETUP - Cleanup Script
-- ============================================
-- Run this to remove all authentication-related database objects
-- WARNING: This will delete all user profiles and admin invites!

-- ============================================
-- 1. DROP TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS prevent_demote_super_admin_trigger ON profiles;
DROP TRIGGER IF EXISTS prevent_delete_super_admin_trigger ON profiles;

-- ============================================
-- 2. DROP FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS prevent_demote_super_admin() CASCADE;
DROP FUNCTION IF EXISTS prevent_delete_super_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_tenant(UUID) CASCADE;

-- ============================================
-- 3. DROP POLICIES ON PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can read tenant profiles" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
DROP POLICY IF EXISTS "Only super admins can manually create profiles" ON profiles;
DROP POLICY IF EXISTS "Only super admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Only super admins can delete profiles" ON profiles;

-- ============================================
-- 4. DROP POLICIES ON ADMIN_INVITES
-- ============================================

DROP POLICY IF EXISTS "Allow trigger to read invites" ON admin_invites;
DROP POLICY IF EXISTS "Allow trigger to update invites" ON admin_invites;
DROP POLICY IF EXISTS "Super admins can read all invites" ON admin_invites;
DROP POLICY IF EXISTS "Admins can read tenant invites" ON admin_invites;
DROP POLICY IF EXISTS "Super admins can create invites" ON admin_invites;
DROP POLICY IF EXISTS "Admins can create tenant invites" ON admin_invites;
DROP POLICY IF EXISTS "Super admins can update invites" ON admin_invites;
DROP POLICY IF EXISTS "Super admins can delete invites" ON admin_invites;

-- ============================================
-- 5. DROP POLICIES ON ORDERS (if we added any)
-- ============================================

DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Admins can read tenant orders" ON orders;
DROP POLICY IF EXISTS "Super admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update tenant orders" ON orders;
DROP POLICY IF EXISTS "Super admins can update all orders" ON orders;

-- ============================================
-- 6. DISABLE RLS (if you want to remove it completely)
-- ============================================

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invites DISABLE ROW LEVEL SECURITY;
-- Note: orders table RLS might have been added by original migration
-- Only disable if you added it with auth migration

-- ============================================
-- 7. DROP TABLES (OPTIONAL - Only if you want to delete all data)
-- ============================================
-- WARNING: This will delete ALL user profiles and admin invites!
-- Uncomment these lines if you want to completely remove the tables:

-- DROP TABLE IF EXISTS admin_invites CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- VERIFY CLEANUP
-- ============================================

-- Check remaining triggers
SELECT 'Remaining triggers:' as info;
SELECT tgname FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('profiles', 'admin_invites')
  AND NOT t.tgisinternal;

-- Check remaining policies
SELECT 'Remaining policies:' as info;
SELECT tablename, policyname FROM pg_policies
WHERE tablename IN ('profiles', 'admin_invites', 'orders')
ORDER BY tablename;

-- Check remaining functions
SELECT 'Remaining functions:' as info;
SELECT proname FROM pg_proc
WHERE proname IN (
  'handle_new_user',
  'update_updated_at_column',
  'prevent_demote_super_admin',
  'prevent_delete_super_admin',
  'get_user_role',
  'get_user_tenant'
);

