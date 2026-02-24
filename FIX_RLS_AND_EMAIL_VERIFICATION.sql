-- ============================================
-- FIX RLS POLICIES AND EMAIL VERIFICATION
-- ============================================
-- This script fixes:
-- 1. Profile creation 401 errors during signup
-- 2. Email verification setup
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Fix Profile Insert Policy
-- ============================================

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a better insert policy that works during signup
-- This allows users to insert their own profile when they sign up
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    -- Allow if no session yet (during signup flow)
    auth.uid() IS NULL
  );

-- Alternative: Use SECURITY DEFINER function for profile creation
-- This bypasses RLS and is safer
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_username TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, email_verified, role)
  VALUES (
    user_id,
    user_email,
    user_username,
    false,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
END;
$$;

-- ============================================
-- STEP 2: Update Trigger to Use Function
-- ============================================

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Use the SECURITY DEFINER function to create profile
  PERFORM public.create_user_profile(
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 3: Verify Email Verification Settings
-- ============================================

-- Check current email verification status
-- Run this query to see which users need verification:
-- SELECT email, email_confirmed_at, created_at 
-- FROM auth.users 
-- WHERE email_confirmed_at IS NULL
-- ORDER BY created_at DESC;

-- ============================================
-- STEP 4: Manual Profile Creation (if needed)
-- ============================================

-- If profiles are missing, create them manually:
-- INSERT INTO profiles (id, email, username, email_verified, role)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'username', split_part(email, '@', 1)),
--   email_confirmed_at IS NOT NULL,
--   'user'
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM profiles)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 5: Test Profile Creation
-- ============================================

-- Test the function (replace with actual user ID):
-- SELECT public.create_user_profile(
--   'your-user-id-here'::UUID,
--   'test@example.com',
--   'testuser'
-- );

-- ============================================
-- NOTES:
-- ============================================
-- 1. The trigger will automatically create profiles for new users
-- 2. If you get 401 errors, the trigger should still work
-- 3. Email verification is handled by Supabase Auth automatically
-- 4. Check Supabase Dashboard → Authentication → Settings for email config














