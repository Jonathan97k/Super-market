-- Settings table for supermarket configuration and branding
-- This migration creates the configuration system for each supermarket

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id TEXT DEFAULT 'default' PRIMARY KEY,
  store_name TEXT NOT NULL DEFAULT 'VELOX MART',
  store_description TEXT,
  store_email TEXT,
  store_phone TEXT,
  whatsapp_number TEXT,
  store_address TEXT,
  store_city TEXT,
  store_country TEXT DEFAULT 'Malawi',
  store_postal_code TEXT,
  currency_code TEXT DEFAULT 'MWK',
  currency_symbol TEXT DEFAULT 'MK',
  tax_rate DECIMAL(5, 4) DEFAULT 0.0000,
  standard_delivery_fee DECIMAL(10, 2) DEFAULT 50.00,
  free_shipping_threshold DECIMAL(10, 2) DEFAULT 500.00,
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0.00,
  logo_url TEXT,
  logo_alt TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#16A34A',
  secondary_color TEXT DEFAULT '#0B1F3A',
  accent_color TEXT DEFAULT '#F59E0B',
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#111827',
  light_text_color TEXT DEFAULT '#6B7280',
  border_color TEXT DEFAULT '#E5E7EB',
  success_color TEXT DEFAULT '#10B981',
  error_color TEXT DEFAULT '#EF4444',
  warning_color TEXT DEFAULT '#F59E0B',
  social_facebook TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  google_analytics_id TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  footer_text TEXT,
  terms_of_service_url TEXT,
  privacy_policy_url TEXT,
  refund_policy_url TEXT,
  contact_email TEXT,
  support_phone TEXT,
  business_hours TEXT, -- JSON: {monday: {open: "08:00", close: "18:00"}, ...}
  delivery_areas TEXT[], -- JSON array of delivery areas
  payment_methods TEXT[], -- JSON array of accepted payment methods
  is_live BOOLEAN DEFAULT false,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create store locations table (for multiple store locations)
CREATE TABLE IF NOT EXISTS store_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  coordinates TEXT, -- JSON: {lat, lng}
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  opening_hours TEXT, -- JSON: {monday: {open: "08:00", close: "18:00"}, ...}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user profiles table for staff and admin management
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Auth user ID
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'staff', 'user')),
  permissions TEXT[], -- JSON array of permissions
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_settings_id ON settings(id);
CREATE INDEX IF NOT EXISTS idx_store_locations_active ON store_locations(is_active);
CREATE INDEX IF NOT EXISTS idx_store_locations_primary ON store_locations(is_primary);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_locations_updated_at
  BEFORE UPDATE ON store_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO settings (
  store_name,
  store_description,
  store_phone,
  whatsapp_number,
  store_address,
  store_city,
  business_hours,
  delivery_areas,
  payment_methods
) VALUES (
  'VELOX MART',
  'Your trusted local supermarket for fresh groceries and daily essentials',
  '+265991234567',
  '+265991234567',
  '123 Main Street, City Centre',
  'Blantyre',
  '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "09:00", "close": "16:00"}}}',
  '["Blantyre City Centre", "Limbe", "Mikuyu", "Chichiri", "Ndirande"]',
  '["cash", "mobile_money", "whatsapp"]'
) ON CONFLICT (id) DO NOTHING;

-- Insert default store location
INSERT INTO store_locations (name, address, city, phone, is_primary, opening_hours) VALUES (
  'Main Store - City Centre',
  '123 Main Street, City Centre',
  'Blantyre',
  '+265991234567',
  true,
  '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "18:00"}, "sunday": {"open": "09:00", "close": "16:00"}}'
) ON CONFLICT DO NOTHING;

-- Add RLS policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Settings policies
CREATE POLICY "Admins have full access to settings" ON settings
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Public can read settings" ON settings
  FOR SELECT USING (true);

-- Store locations policies
CREATE POLICY "Admins have full access to store locations" ON store_locations
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Public can read active store locations" ON store_locations
  FOR SELECT USING (
    is_active = true
  );

-- User profiles policies
CREATE POLICY "Admins have full access to user profiles" ON user_profiles
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Users can read their own profile" ON user_profiles
  FOR SELECT USING (
    auth.uid()::text = user_id
  );

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid()::text = user_id
  );

-- Create function to get public settings
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE (
  store_name TEXT,
  store_description TEXT,
  store_phone TEXT,
  whatsapp_number TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  currency_code TEXT,
  currency_symbol TEXT,
  standard_delivery_fee DECIMAL,
  free_shipping_threshold DECIMAL,
  business_hours TEXT,
  delivery_areas TEXT[],
  payment_methods TEXT[],
  is_live BOOLEAN,
  maintenance_mode BOOLEAN,
  maintenance_message TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.store_name,
    s.store_description,
    s.store_phone,
    s.whatsapp_number,
    s.logo_url,
    s.primary_color,
    s.secondary_color,
    s.accent_color,
    s.currency_code,
    s.currency_symbol,
    s.standard_delivery_fee,
    s.free_shipping_threshold,
    s.business_hours,
    s.delivery_areas,
    s.payment_methods,
    s.is_live,
    s.maintenance_mode,
    s.maintenance_message
  FROM settings s
  WHERE s.id = 'default';
END;
$$ LANGUAGE plpgsql;

-- Create function to validate delivery area
CREATE OR REPLACE FUNCTION validate_delivery_area(delivery_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  areas TEXT[];
  area_found BOOLEAN := false;
BEGIN
  -- Get delivery areas from settings
  SELECT delivery_areas INTO areas
  FROM settings
  WHERE id = 'default';
  
  -- Check if delivery address contains any of the delivery areas
  IF areas IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 
      FROM unnest(areas) area
      WHERE LOWER(delivery_address) LIKE '%' || LOWER(area) || '%'
    ) INTO area_found;
  END IF;
  
  -- If no delivery areas are set, assume all areas are valid
  IF areas IS NULL OR array_length(areas, 1) = 0 THEN
    area_found := true;
  END IF;
  
  RETURN area_found;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate delivery fee
CREATE OR REPLACE FUNCTION calculate_delivery_fee(cart_total DECIMAL, delivery_address TEXT)
RETURNS DECIMAL AS $$
DECLARE
  standard_fee DECIMAL;
  free_threshold DECIMAL;
  is_valid_area BOOLEAN;
BEGIN
  -- Get delivery settings
  SELECT standard_delivery_fee, free_shipping_threshold
  INTO standard_fee, free_threshold
  FROM settings
  WHERE id = 'default';
  
  -- Validate delivery area
  is_valid_area := validate_delivery_area(delivery_address);
  
  -- If delivery area is invalid, return higher fee or error
  IF NOT is_valid_area THEN
    RETURN standard_fee * 2; -- Double fee for out-of-area deliveries
  END IF;
  
  -- Free shipping for orders above threshold
  IF cart_total >= free_threshold THEN
    RETURN 0;
  END IF;
  
  RETURN standard_fee;
END;
$$ LANGUAGE plpgsql;

-- Create view for theme configuration
CREATE OR REPLACE VIEW theme_config AS
SELECT 
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_color,
  light_text_color,
  border_color,
  success_color,
  error_color,
  warning_color,
  logo_url,
  favicon_url
FROM settings
WHERE id = 'default';
