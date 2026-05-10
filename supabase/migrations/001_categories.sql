-- Categories table for supermarket product categorization
-- This migration creates the foundation for product organization

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for slug lookup
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Create index for active categories
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Create index for sort order
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Insert default categories for supermarket
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
('Fresh Produce', 'fresh-produce', 'Fresh fruits and vegetables', 'leaf', 1),
('Dairy & Eggs', 'dairy-eggs', 'Milk, cheese, yogurt, and eggs', 'milk', 2),
('Meat & Seafood', 'meat-seafood', 'Fresh meat, poultry, and seafood', 'drumstick', 3),
('Bakery', 'bakery', 'Fresh bread, pastries, and baked goods', 'bread', 4),
('Pantry', 'pantry', 'Canned goods, pasta, rice, and cooking essentials', 'package', 5),
('Frozen Foods', 'frozen', 'Frozen meals, vegetables, and desserts', 'snowflake', 6),
('Beverages', 'beverages', 'Water, juice, soda, and other drinks', 'droplet', 7),
('Snacks', 'snacks', 'Chips, cookies, and other snack items', 'cookie', 8),
('Household', 'household', 'Cleaning supplies and household essentials', 'home', 9),
('Personal Care', 'personal-care', 'Toiletries and personal hygiene products', 'heart', 10)
ON CONFLICT (slug) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Admins have full access
CREATE POLICY "Admins have full access to categories" ON categories
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy: Public can read active categories
CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT USING (
    is_active = true
  );

-- Policy: Authenticated users can read all categories
CREATE POLICY "Authenticated users can read categories" ON categories
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );
