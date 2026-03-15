-- ============================================
-- CUSTOM PRODUCTS: RENAME CATEGORY FIELDS
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- Safely remaps legacy custom_products columns:
--   category -> garment
--   sub_category -> design_selection
--   variety -> sub_category

BEGIN;

ALTER TABLE custom_products
  ADD COLUMN IF NOT EXISTS garment TEXT,
  ADD COLUMN IF NOT EXISTS design_selection TEXT,
  ADD COLUMN IF NOT EXISTS sub_category_new TEXT;

UPDATE custom_products
SET
  garment = category,
  design_selection = sub_category,
  sub_category_new = variety;

ALTER TABLE custom_products
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS sub_category,
  DROP COLUMN IF EXISTS variety;

ALTER TABLE custom_products
  RENAME COLUMN sub_category_new TO sub_category;

ALTER TABLE custom_products
  ALTER COLUMN garment SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_custom_products_garment ON custom_products(garment);

COMMIT;