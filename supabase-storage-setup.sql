-- ============================================
-- SUPABASE STORAGE BUCKET SETUP
-- ============================================
-- Run this SQL in Supabase SQL Editor to create product images bucket

-- ============================================
-- 1. CREATE STORAGE BUCKET (PRIVATE)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. ROW LEVEL SECURITY POLICIES FOR STORAGE
-- ============================================

-- Allow authenticated admins to upload product images
CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Allow authenticated admins to read (for signed URLs)
CREATE POLICY "Admins can read product images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Allow authenticated admins to delete product images
CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- Allow PUBLIC to read (download) product images via signed URLs
CREATE POLICY "Public can read product images via signed URL"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');
