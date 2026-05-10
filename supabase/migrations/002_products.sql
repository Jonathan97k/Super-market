-- Products table for supermarket inventory management
-- This migration creates the core product catalog system

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  compare_price DECIMAL(10, 2) CHECK (compare_price >= 0),
  cost_price DECIMAL(10, 2) CHECK (cost_price >= 0),
  sku TEXT UNIQUE,
  barcode TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT,
  unit TEXT,
  weight DECIMAL(8, 3),
  dimensions TEXT, -- JSON: {length, width, height, unit}
  images TEXT[], -- Array of image URLs
  tags TEXT[],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
  track_inventory BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  is_digital BOOLEAN DEFAULT false,
  requires_shipping BOOLEAN DEFAULT true,
  taxable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
  meta_title TEXT,
  meta_description TEXT,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE track_inventory = true AND stock <= min_stock;
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Create trigger for search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' ||
    COALESCE(NEW.description, '') || ' ' ||
    COALESCE(NEW.brand, '') || ' ' ||
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_search_vector
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_search_vector();

-- Create trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create product variants table (for different sizes, colors, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  compare_price DECIMAL(10, 2) CHECK (compare_price >= 0),
  cost_price DECIMAL(10, 2) CHECK (cost_price >= 0),
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
  image_url TEXT,
  attributes TEXT, -- JSON: {size, color, material, etc.}
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_position ON product_variants(position);

-- Create trigger for variants updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create product inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'purchase', 'adjustment', 'return', 'damage')),
  quantity INTEGER NOT NULL,
  reason TEXT,
  reference_id TEXT, -- Order ID, Purchase ID, etc.
  created_by TEXT, -- User ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for inventory movements
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);

-- Insert sample products
INSERT INTO products (name, slug, description, price, sku, category_id, unit, stock, tags) VALUES
('Fresh Tomatoes', 'fresh-tomatoes', 'Locally grown fresh tomatoes, perfect for salads and cooking', 25.50, 'TOM001', (SELECT id FROM categories WHERE slug = 'fresh-produce' LIMIT 1), 'kg', 100, ARRAY['fresh', 'vegetable', 'local']),
('Whole Milk', 'whole-milk', 'Pasteurized whole milk from local dairy farm', 45.00, 'MLK001', (SELECT id FROM categories WHERE slug = 'dairy-eggs' LIMIT 1), 'liter', 50, ARRAY['dairy', 'fresh', 'local']),
('White Bread', 'white-bread', 'Freshly baked white bread, perfect for sandwiches', 30.00, 'BRD001', (SELECT id FROM categories WHERE slug = 'bakery' LIMIT 1), 'loaf', 30, ARRAY['bakery', 'fresh', 'bread']),
('Chicken Breast', 'chicken-breast', 'Premium quality chicken breast, boneless and skinless', 180.00, 'CHK001', (SELECT id FROM categories WHERE slug = 'meat-seafood' LIMIT 1), 'kg', 25, ARRAY['meat', 'chicken', 'fresh', 'protein'])
ON CONFLICT (sku) DO NOTHING;

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Admins have full access to products" ON products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (
    status = 'active'
  );

CREATE POLICY "Authenticated users can read products" ON products
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Product variants policies
CREATE POLICY "Admins have full access to product variants" ON product_variants
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Public can read product variants" ON product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_variants.product_id 
      AND products.status = 'active'
    )
  );

-- Inventory movements policies
CREATE POLICY "Admins have full access to inventory movements" ON inventory_movements
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Staff can read inventory movements" ON inventory_movements
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff')
  );
