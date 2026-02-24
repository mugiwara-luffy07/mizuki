-- ============================================
-- CUSTOM PRODUCTS SYSTEM
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- Creates tables for custom/bespoke products with measurement tracking

-- ============================================
-- 1. MEASUREMENT MASTER TABLE (Shared reference)
-- ============================================
CREATE TABLE IF NOT EXISTS measurement_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,  -- "bust", "waist", "chest", "hip", etc.
  label TEXT NOT NULL,  -- "Bust Size", "Waist Size", "Chest Size", etc.
  unit TEXT NOT NULL,  -- "inches", "cm", "cm", etc.
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for measurement_master
CREATE INDEX IF NOT EXISTS idx_measurement_master_key ON measurement_master(key);

-- ============================================
-- 2. CUSTOM PRODUCTS TABLE (No tenant, globally unique)
-- ============================================
CREATE TABLE IF NOT EXISTS custom_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,  -- Globally unique slug
  category TEXT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,  -- Single main image (supabase://product-images/{path} format)
  measurement_keys JSONB DEFAULT '[]'::jsonb,  -- Array of keys like ["bust", "waist"]
  measurement_video_url TEXT,  -- YouTube URL for measurement guide
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for custom_products
CREATE INDEX IF NOT EXISTS idx_custom_products_slug ON custom_products(slug);
CREATE INDEX IF NOT EXISTS idx_custom_products_category ON custom_products(category);
CREATE INDEX IF NOT EXISTS idx_custom_products_active ON custom_products(is_active);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on measurement_master (public read access for all)
ALTER TABLE measurement_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "measurement_master_public_read" ON measurement_master
  FOR SELECT USING (true);

CREATE POLICY "measurement_master_admin_insert" ON measurement_master
  FOR INSERT WITH CHECK (true);  -- Admin only (enforce at app level)

CREATE POLICY "measurement_master_admin_update" ON measurement_master
  FOR UPDATE USING (true) WITH CHECK (true);  -- Admin only (enforce at app level)

-- Enable RLS on custom_products (public read active products, admin write)
ALTER TABLE custom_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custom_products_public_read" ON custom_products
  FOR SELECT USING (is_active = true);

CREATE POLICY "custom_products_authenticated_all" ON custom_products
  FOR SELECT USING (true);  -- Admins see all

CREATE POLICY "custom_products_admin_insert" ON custom_products
  FOR INSERT WITH CHECK (true);  -- Admin only (enforce at app level)

CREATE POLICY "custom_products_admin_update" ON custom_products
  FOR UPDATE USING (true) WITH CHECK (true);  -- Admin only (enforce at app level)

CREATE POLICY "custom_products_admin_delete" ON custom_products
  FOR DELETE USING (true);  -- Admin only (enforce at app level)

-- ============================================
-- 4. SAMPLE DATA (Optional - remove after testing)
-- ============================================
-- Insert standard measurements into measurement_master
INSERT INTO measurement_master (key, label, unit, is_required) VALUES
  ('bust', 'Bust Size', 'inches', true),
  ('waist', 'Waist Size', 'inches', true),
  ('hip', 'Hip Size', 'inches', false),
  ('chest', 'Chest Size', 'inches', false),
  ('shoulder', 'Shoulder Width', 'inches', false),
  ('arm_length', 'Arm Length', 'inches', false),
  ('length', 'Length', 'inches', false)
ON CONFLICT (key) DO NOTHING;
