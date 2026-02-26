-- ============================================
-- CUSTOM PRODUCTS: FABRIC FIELD MIGRATION
-- ============================================
-- Run this SQL in Supabase SQL Editor

ALTER TABLE custom_products
ADD COLUMN IF NOT EXISTS fabric TEXT;
