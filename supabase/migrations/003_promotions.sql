-- Promotions table for supermarket discounts and special offers
-- This migration creates the promotional system for the supermarket

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed', 'buy_x_get_y', 'free_shipping')),
  value DECIMAL(10, 2) NOT NULL CHECK (value >= 0),
  minimum_amount DECIMAL(10, 2) CHECK (minimum_amount >= 0),
  maximum_discount DECIMAL(10, 2) CHECK (maximum_discount >= 0),
  applicable_products TEXT[], -- Array of product IDs
  applicable_categories TEXT[], -- Array of category IDs
  buy_quantity INTEGER DEFAULT 1 CHECK (buy_quantity > 0),
  get_quantity INTEGER DEFAULT 1 CHECK (get_quantity >= 0),
  usage_limit INTEGER CHECK (usage_limit > 0),
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  customer_usage_limit INTEGER CHECK (customer_usage_limit > 0),
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  banner_url TEXT,
  banner_alt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(type);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON promotions(priority DESC);
CREATE INDEX IF NOT EXISTS idx_promotions_usage ON promotions(usage_count, usage_limit);

-- Create trigger for updated_at
CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create coupon codes table
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  usage_limit INTEGER CHECK (usage_limit > 0),
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  customer_usage_limit INTEGER CHECK (customer_usage_limit > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for coupon codes
CREATE INDEX IF NOT EXISTS idx_coupon_codes_promotion ON coupon_codes(promotion_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_usage ON coupon_codes(usage_count, usage_limit);

-- Create trigger for coupon codes updated_at
CREATE TRIGGER update_coupon_codes_updated_at
  BEFORE UPDATE ON coupon_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create customer coupon usage tracking
CREATE TABLE IF NOT EXISTS customer_coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  coupon_code_id UUID NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
  order_id TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, coupon_code_id)
);

-- Create indexes for customer coupon usage
CREATE INDEX IF NOT EXISTS idx_customer_coupon_usage_customer ON customer_coupon_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_coupon_usage_coupon ON customer_coupon_usage(coupon_code_id);
CREATE INDEX IF NOT EXISTS idx_customer_coupon_usage_order ON customer_coupon_usage(order_id);

-- Insert sample promotions
INSERT INTO promotions (name, description, type, value, minimum_amount, starts_at, expires_at) VALUES
('Welcome Discount', 'Get 10% off your first order', 'percentage', 10.00, 0.00, NOW(), NOW() + INTERVAL '30 days'),
('Free Shipping', 'Free shipping on orders over MK 500', 'free_shipping', 0.00, 500.00, NOW(), NOW() + INTERVAL '90 days'),
('Weekend Special', '15% off all fresh produce this weekend', 'percentage', 15.00, 0.00, NOW(), NOW() + INTERVAL '3 days'),
('Bulk Discount', 'Save 20% when you spend over MK 1000', 'percentage', 20.00, 1000.00, NOW(), NOW() + INTERVAL '60 days')
ON CONFLICT DO NOTHING;

-- Insert sample coupon codes
INSERT INTO coupon_codes (promotion_id, code, usage_limit, customer_usage_limit) 
SELECT 
  p.id, 
  'WELCOME10', 
  100, 
  1 
FROM promotions p 
WHERE p.name = 'Welcome Discount' 
LIMIT 1
ON CONFLICT (code) DO NOTHING;

INSERT INTO coupon_codes (promotion_id, code, usage_limit, customer_usage_limit) 
SELECT 
  p.id, 
  'WEEKEND15', 
  50, 
  1 
FROM promotions p 
WHERE p.name = 'Weekend Special' 
LIMIT 1
ON CONFLICT (code) DO NOTHING;

-- Add RLS policies
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_coupon_usage ENABLE ROW LEVEL SECURITY;

-- Promotions policies
CREATE POLICY "Admins have full access to promotions" ON promotions
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Public can read active promotions" ON promotions
  FOR SELECT USING (
    is_active = true AND 
    (starts_at IS NULL OR starts_at <= NOW()) AND
    (expires_at IS NULL OR expires_at >= NOW())
  );

CREATE POLICY "Authenticated users can read promotions" ON promotions
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Coupon codes policies
CREATE POLICY "Admins have full access to coupon codes" ON coupon_codes
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Authenticated users can read coupon codes" ON coupon_codes
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Customer coupon usage policies
CREATE POLICY "Admins have full access to customer coupon usage" ON customer_coupon_usage
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can read their own coupon usage" ON customer_coupon_usage
  FOR SELECT USING (
    auth.uid()::text = customer_id
  );

CREATE POLICY "Users can insert their own coupon usage" ON customer_coupon_usage
  FOR INSERT WITH CHECK (
    auth.uid()::text = customer_id
  );

-- Create function to validate and apply promotions
CREATE OR REPLACE FUNCTION validate_promotion(
  promotion_id UUID,
  cart_total DECIMAL,
  customer_id TEXT DEFAULT NULL
) RETURNS TABLE (
  is_valid BOOLEAN,
  discount_amount DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  promo RECORD;
  coupon_usage_count INTEGER;
  customer_usage_count INTEGER;
  is_expired BOOLEAN;
  is_started BOOLEAN;
BEGIN
  -- Get promotion details
  SELECT * INTO promo 
  FROM promotions 
  WHERE id = promotion_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Promotion not found or inactive';
    RETURN;
  END IF;
  
  -- Check dates
  is_expired := promo.expires_at IS NOT NULL AND promo.expires_at < NOW();
  is_started := promo.starts_at IS NULL OR promo.starts_at <= NOW();
  
  IF is_expired OR NOT is_started THEN
    RETURN QUERY SELECT false, 0, 'Promotion has expired or not started';
    RETURN;
  END IF;
  
  -- Check minimum amount
  IF promo.minimum_amount > 0 AND cart_total < promo.minimum_amount THEN
    RETURN QUERY SELECT false, 0, 'Minimum amount not met';
    RETURN;
  END IF;
  
  -- Check usage limits
  IF promo.usage_limit > 0 AND promo.usage_count >= promo.usage_limit THEN
    RETURN QUERY SELECT false, 0, 'Promotion usage limit reached';
    RETURN;
  END IF;
  
  -- Check customer usage limits
  IF customer_id IS NOT NULL AND promo.customer_usage_limit > 0 THEN
    SELECT COUNT(*) INTO customer_usage_count
    FROM customer_coupon_usage ccu
    JOIN coupon_codes cc ON ccu.coupon_code_id = cc.id
    WHERE cc.promotion_id = promotion_id AND ccu.customer_id = customer_id;
    
    IF customer_usage_count >= promo.customer_usage_limit THEN
      RETURN QUERY SELECT false, 0, 'Customer usage limit reached';
      RETURN;
    END IF;
  END IF;
  
  -- Calculate discount
  CASE promo.type
    WHEN 'percentage' THEN
      RETURN QUERY SELECT true, LEAST(cart_total * promo.value / 100, COALESCE(promo.maximum_discount, cart_total)), NULL;
    WHEN 'fixed' THEN
      RETURN QUERY SELECT true, LEAST(promo.value, cart_total), NULL;
    WHEN 'free_shipping' THEN
      RETURN QUERY SELECT true, 0, NULL;
    ELSE
      RETURN QUERY SELECT false, 0, 'Invalid promotion type';
  END CASE;
END;
$$ LANGUAGE plpgsql;
