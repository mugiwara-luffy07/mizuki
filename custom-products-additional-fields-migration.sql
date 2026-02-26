-- ============================================
-- CUSTOM PRODUCTS: ADDITIONAL FIELDS MIGRATION
-- ============================================
-- Run this SQL in Supabase SQL Editor

ALTER TABLE custom_products
  ADD COLUMN IF NOT EXISTS sub_category TEXT,
  ADD COLUMN IF NOT EXISTS variety TEXT,
  ADD COLUMN IF NOT EXISTS design TEXT,
  ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT '{}';
