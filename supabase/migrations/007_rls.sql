-- Final RLS (Row Level Security) policies and security functions
-- This migration completes the security setup for the supermarket SaaS system

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is staff
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt() ->> 'role' IN ('admin', 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user owns the resource
CREATE OR REPLACE FUNCTION owns_resource(user_id_column TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid()::text = user_id_column;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(auth.jwt() ->> 'role', 'anonymous');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can access order
CREATE OR REPLACE FUNCTION can_access_order(order_customer_phone TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := current_user_role();
  
  -- Admin can access all orders
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Staff can access all orders
  IF user_role = 'staff' THEN
    RETURN true;
  END IF;
  
  -- Customer can only access their own orders
  IF user_role = 'user' THEN
    RETURN order_customer_phone = auth.jwt() ->> 'phone';
  END IF;
  
  -- Anonymous users cannot access orders
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  event_type TEXT,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- This would typically log to a security audit table
  -- For now, we'll just log to console in production
  RAISE LOG 'Security Event: % - % - % - % - %', 
    NOW(), 
    current_user_role(), 
    event_type, 
    resource_type, 
    resource_id;
END;
$$ LANGUAGE plpgsql;

-- Enhanced RLS policies with better security

-- Categories - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to categories" ON categories;
CREATE POLICY "Admins have full access to categories" ON categories
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Public can read active categories" ON categories;
CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT USING (
    is_active = true
  );

DROP POLICY IF EXISTS "Authenticated users can read categories" ON categories;
CREATE POLICY "Authenticated users can read categories" ON categories
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Products - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to products" ON products;
CREATE POLICY "Admins have full access to products" ON products
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Public can read active products" ON products;
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (
    status = 'active'
  );

DROP POLICY IF EXISTS "Authenticated users can read products" ON products;
CREATE POLICY "Authenticated users can read products" ON products
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Promotions - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to promotions" ON promotions;
CREATE POLICY "Admins have full access to promotions" ON promotions
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Public can read active promotions" ON promotions;
CREATE POLICY "Public can read active promotions" ON promotions
  FOR SELECT USING (
    is_active = true AND 
    (starts_at IS NULL OR starts_at <= NOW()) AND
    (expires_at IS NULL OR expires_at >= NOW())
  );

DROP POLICY IF EXISTS "Authenticated users can read promotions" ON promotions;
CREATE POLICY "Authenticated users can read promotions" ON promotions
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Orders - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;
CREATE POLICY "Admins have full access to orders" ON orders
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Staff can read orders" ON orders;
CREATE POLICY "Staff can read orders" ON orders
  FOR SELECT USING (
    is_staff()
  );

DROP POLICY IF EXISTS "Customers can read their own orders" ON orders;
CREATE POLICY "Customers can read their own orders" ON orders
  FOR SELECT USING (
    can_access_order(customer_phone)
  );

-- Order items - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to order items" ON order_items;
CREATE POLICY "Admins have full access to order items" ON order_items
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Staff can read order items" ON order_items;
CREATE POLICY "Staff can read order items" ON order_items
  FOR SELECT USING (
    is_staff()
  );

DROP POLICY IF EXISTS "Customers can read their own order items" ON order_items;
CREATE POLICY "Customers can read their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND can_access_order(orders.customer_phone)
    )
  );

-- Settings - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to settings" ON settings;
CREATE POLICY "Admins have full access to settings" ON settings
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Public can read settings" ON settings;
CREATE POLICY "Public can read settings" ON settings
  FOR SELECT USING (true);

-- Store locations - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to store locations" ON store_locations;
CREATE POLICY "Admins have full access to store locations" ON store_locations
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Public can read active store locations" ON store_locations;
CREATE POLICY "Public can read active store locations" ON store_locations
  FOR SELECT USING (
    is_active = true
  );

-- User profiles - Enhanced policies
DROP POLICY IF EXISTS "Admins have full access to user profiles" ON user_profiles;
CREATE POLICY "Admins have full access to user profiles" ON user_profiles
  FOR ALL USING (
    is_admin()
  );

DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
CREATE POLICY "Users can read their own profile" ON user_profiles
  FOR SELECT USING (
    owns_resource(user_id)
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (
    owns_resource(user_id)
  );

-- Storage policies - Enhanced
DROP POLICY IF EXISTS "Admins have full access to product-images" ON storage.objects;
CREATE POLICY "Admins have full access to product-images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images' AND
    is_admin()
  );

DROP POLICY IF EXISTS "Public can read product-images" ON storage.objects;
CREATE POLICY "Public can read product-images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-images'
  );

DROP POLICY IF EXISTS "Authenticated users can upload to product-images" ON storage.objects;
CREATE POLICY "Authenticated users can upload to product-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    is_staff()
  );

-- Create audit log table for security monitoring
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Create trigger for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  audit_record audit_log%ROWTYPE;
BEGIN
  -- Don't audit read operations
  IF TG_OP = 'SELECT' THEN
    RETURN NULL;
  END IF;
  
  audit_record.user_id := auth.uid()::text;
  audit_record.user_role := current_user_role();
  audit_record.action := TG_OP;
  audit_record.table_name := TG_TABLE_NAME;
  audit_record.record_id := COALESCE(NEW.id::TEXT, OLD.id::TEXT);
  
  -- Get old and new values
  IF TG_OP = 'DELETE' THEN
    audit_record.old_values := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    audit_record.new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    audit_record.old_values := to_jsonb(OLD);
    audit_record.new_values := to_jsonb(NEW);
  END IF;
  
  -- Get request context (if available)
  -- This would require additional setup to get headers
  
  INSERT INTO audit_log (
    user_id, user_role, action, table_name, record_id, 
    old_values, new_values
  ) VALUES (
    audit_record.user_id, audit_record.user_role, audit_record.action, 
    audit_record.table_name, audit_record.record_id,
    audit_record.old_values, audit_record.new_values
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to sensitive tables
CREATE TRIGGER audit_categories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON settings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Create function to check database health
CREATE OR REPLACE FUNCTION database_health_check()
RETURNS TABLE (
  component TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Check tables exist
  RETURN QUERY
  SELECT 
    'tables' as component,
    CASE 
      WHEN COUNT(*) = 11 THEN 'healthy'
      ELSE 'missing_tables'
    END as status,
    'Expected 11 tables, found ' || COUNT(*) as details
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
  
  -- Check RLS is enabled
  RETURN QUERY
  SELECT 
    'rls_policies' as component,
    CASE 
      WHEN COUNT(*) >= 20 THEN 'healthy'
      ELSE 'insufficient_policies'
    END as status,
    'Expected at least 20 RLS policies, found ' || COUNT(*) as details
  FROM pg_policies 
  WHERE schemaname = 'public';
  
  -- Check storage buckets
  RETURN QUERY
  SELECT 
    'storage_buckets' as component,
    CASE 
      WHEN COUNT(*) = 5 THEN 'healthy'
      ELSE 'missing_buckets'
    END as status,
    'Expected 5 buckets, found ' || COUNT(*) as details
  FROM storage.buckets;
  
  -- Check functions
  RETURN QUERY
  SELECT 
    'functions' as component,
    CASE 
      WHEN COUNT(*) >= 15 THEN 'healthy'
      ELSE 'missing_functions'
    END as status,
    'Expected at least 15 functions, found ' || COUNT(*) as details
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION';
END;
$$ LANGUAGE plpgsql;

-- Create view for security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
  'database_health' as metric,
  (SELECT COUNT(*) FROM database_health_check() WHERE status = 'healthy') as value,
  (SELECT COUNT(*) FROM database_health_check()) as total
UNION ALL
SELECT 
  'total_users' as metric,
  COUNT(*) as value,
  NULL as total
FROM user_profiles
UNION ALL
SELECT 
  'active_sessions' as metric,
  COUNT(DISTINCT user_id) as value,
  NULL as total
FROM audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'recent_security_events' as metric,
  COUNT(*) as value,
  NULL as total
FROM audit_log
WHERE created_at > NOW() - INTERVAL '24 hours'
AND action IN ('DELETE', 'UPDATE');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Final verification
SELECT 'Database setup completed successfully' as status;
