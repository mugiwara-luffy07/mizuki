-- Add tenant column to ecommerce_orders if missing (production hotfix)
-- Run in Supabase SQL Editor

ALTER TABLE ecommerce_orders
ADD COLUMN IF NOT EXISTS tenant TEXT;

-- Backfill tenant for existing rows where unknown. Adjust default tenant if needed.
UPDATE ecommerce_orders
SET tenant = COALESCE(NULLIF(tenant, ''), 'mizuki')
WHERE tenant IS NULL OR tenant = '';

-- Keep data consistent for all future inserts.
ALTER TABLE ecommerce_orders
ALTER COLUMN tenant SET DEFAULT 'mizuki';

ALTER TABLE ecommerce_orders
ALTER COLUMN tenant SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ecommerce_orders_tenant
ON ecommerce_orders(tenant);
