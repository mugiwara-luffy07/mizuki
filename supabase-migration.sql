-- Supabase Migration: Create Orders Table
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant TEXT NOT NULL,
  customer JSONB NOT NULL,
  order_data JSONB NOT NULL,
  price DECIMAL(10, 2) NULL,
  status TEXT NOT NULL DEFAULT 'pricing_pending' CHECK (
    status IN ('pricing_pending', 'price_sent', 'processing', 'packed', 'dispatched', 'delivered')
  ),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant, status);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Policy: Allow anyone to insert orders (for public order creation)
CREATE POLICY "Allow public order creation"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow users to read their own orders (if you add user authentication later)
-- For now, allow public read access filtered by tenant
CREATE POLICY "Allow public read orders"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow authenticated users to update orders (for admin updates)
-- You can restrict this further based on your needs
CREATE POLICY "Allow authenticated order updates"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to delete orders (for admin deletes)
CREATE POLICY "Allow authenticated order deletes"
  ON orders
  FOR DELETE
  TO authenticated
  USING (true);

-- Optional: Add comments for documentation
COMMENT ON TABLE orders IS 'Stores custom orders for tenants';
COMMENT ON COLUMN orders.tenant IS 'Tenant identifier (e.g., "mizuki", "pinkthreads")';
COMMENT ON COLUMN orders.customer IS 'Customer information (name, email, phone, address)';
COMMENT ON COLUMN orders.order_data IS 'Order details (fabric, garment, design, measurements)';
COMMENT ON COLUMN orders.status IS 'Order status: pricing_pending, price_sent, processing, packed, dispatched, delivered';





