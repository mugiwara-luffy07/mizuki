-- Fix Migration: Add username column to profiles table if it doesn't exist
-- Run this SQL in your Supabase SQL Editor if you get "column username does not exist" error

-- Check if profiles table exists and add username column if missing
DO $$
BEGIN
  -- Add username column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
    
    -- Update existing rows to use email prefix as username if username is null
    UPDATE profiles 
    SET username = split_part(email, '@', 1)
    WHERE username IS NULL;
    
    -- Make username NOT NULL after setting default values
    ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
    
    -- Create index on username if it doesn't exist
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
  END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'username';

