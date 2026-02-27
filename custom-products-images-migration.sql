-- ============================================
-- CUSTOM PRODUCTS: MULTI-IMAGE SUPPORT
-- ============================================
-- Run this SQL in Supabase SQL Editor

ALTER TABLE custom_products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
