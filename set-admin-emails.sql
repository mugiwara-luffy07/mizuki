-- Quick Admin Setup
-- Copy and run these commands in Supabase SQL Editor

-- 1. First, run the full migration from supabase-admin-setup.sql
-- 2. Then set your admin emails below:

-- ========================================
-- SET YOUR ADMIN EMAILS HERE
-- ========================================

-- Single admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-admin@example.com';

-- Multiple admins (uncomment and edit)
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email IN (
--   'admin1@example.com',
--   'admin2@example.com',
--   'admin3@example.com'
-- );

-- Set a superadmin (uncomment and edit)
-- UPDATE profiles 
-- SET role = 'superadmin' 
-- WHERE email = 'superadmin@example.com';

-- ========================================
-- VERIFY ADMIN USERS
-- ========================================

-- Check all admins
SELECT email, username, role, created_at 
FROM profiles 
WHERE role IN ('admin', 'superadmin')
ORDER BY role, email;

-- ========================================
-- MANAGEMENT COMMANDS
-- ========================================

-- Promote user to admin
-- UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';

-- Demote admin to user
-- UPDATE profiles SET role = 'user' WHERE email = 'admin@example.com';

-- Check specific user's role
-- SELECT email, role FROM profiles WHERE email = 'user@example.com';
