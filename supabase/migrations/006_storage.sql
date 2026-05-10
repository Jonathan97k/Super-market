-- Storage configuration for supermarket file management
-- This migration sets up Supabase Storage for product images and other files

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for store branding assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for imports/exports
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'data-files',
  'data-files',
  false,
  52428800, -- 50MB limit
  ARRAY['application/json', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups',
  'backups',
  false,
  104857600, -- 100MB limit
  ARRAY['application/json', 'application/gzip']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for product-images bucket
CREATE POLICY "Admins have full access to product-images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'product-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Public can read product-images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'product-images'
  );

CREATE POLICY "Authenticated users can upload to product-images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff')
  );

CREATE POLICY "Admins and staff can update product-images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images' AND
    (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff')
  );

CREATE POLICY "Admins can delete product-images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for store-assets bucket
CREATE POLICY "Admins have full access to store-assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'store-assets' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Public can read store-assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'store-assets'
  );

CREATE POLICY "Admins can upload to store-assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'store-assets' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update store-assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'store-assets' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete store-assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'store-assets' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for documents bucket
CREATE POLICY "Admins have full access to documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'documents' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Staff can read documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents' AND
    auth.jwt() ->> 'role' IN ('admin', 'staff')
  );

CREATE POLICY "Admins can upload to documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for data-files bucket
CREATE POLICY "Admins have full access to data-files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'data-files' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Staff can read data-files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'data-files' AND
    auth.jwt() ->> 'role' IN ('admin', 'staff')
  );

CREATE POLICY "Admins can upload to data-files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'data-files' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can update data-files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'data-files' AND
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can delete data-files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'data-files' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create policies for backups bucket
CREATE POLICY "Admins have full access to backups" ON storage.objects
  FOR ALL USING (
    bucket_id = 'backups' AND
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create function to generate unique storage paths
CREATE OR REPLACE FUNCTION generate_storage_path(
  bucket_name TEXT,
  file_name TEXT,
  user_id TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  file_extension TEXT;
  base_name TEXT;
  timestamp_part TEXT;
  user_part TEXT;
  unique_id TEXT;
BEGIN
  -- Extract file extension
  file_extension := SUBSTRING(file_name FROM '\.(.*)$');
  
  -- Get base name without extension
  base_name := SUBSTRING(file_name FROM '^(.*)\.');
  
  -- Generate timestamp
  timestamp_part := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
  
  -- Add user ID if provided
  user_part := COALESCE('_' || user_id, '');
  
  -- Generate unique ID
  unique_id := SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
  
  -- Construct path
  RETURN bucket_name || '/' || timestamp_part || user_part || '_' || unique_id || '_' || base_name || '.' || file_extension;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up orphaned storage objects
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage()
RETURNS TABLE (
  bucket_name TEXT,
  object_name TEXT,
  size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_orphaned BOOLEAN
) AS $$
DECLARE
  storage_record RECORD;
  is_orphaned BOOLEAN;
BEGIN
  -- Check product images
  FOR storage_record IN 
    SELECT * FROM storage.objects WHERE bucket_id = 'product-images'
  LOOP
    -- Check if image is still referenced in products
    SELECT NOT EXISTS(
      SELECT 1 FROM products 
      WHERE storage_record.name = ANY(images)
    ) INTO is_orphaned;
    
    RETURN QUERY SELECT 
      'product-images',
      storage_record.name,
      storage_record.size,
      storage_record.created_at,
      is_orphaned;
  END LOOP;
  
  -- Check store assets
  FOR storage_record IN 
    SELECT * FROM storage.objects WHERE bucket_id = 'store-assets'
  LOOP
    -- Check if asset is still referenced in settings
    SELECT NOT EXISTS(
      SELECT 1 FROM settings 
      WHERE storage_record.name = logo_url 
      OR storage_record.name = favicon_url
    ) INTO is_orphaned;
    
    RETURN QUERY SELECT 
      'store-assets',
      storage_record.name,
      storage_record.size,
      storage_record.created_at,
      is_orphaned;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to get storage usage statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE (
  bucket_name TEXT,
  total_objects BIGINT,
  total_size BIGINT,
  average_size DECIMAL,
  oldest_object TIMESTAMP WITH TIME ZONE,
  newest_object TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bucket_id,
    COUNT(*),
    COALESCE(SUM(size), 0),
    COALESCE(AVG(size), 0),
    MIN(created_at),
    MAX(created_at)
  FROM storage.objects
  GROUP BY bucket_id
  ORDER BY bucket_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for storage statistics
CREATE OR REPLACE VIEW storage_statistics AS
SELECT * FROM get_storage_stats();

-- Create function to optimize storage (compress old images, etc.)
CREATE OR REPLACE FUNCTION optimize_storage()
RETURNS TABLE (
  action TEXT,
  object_name TEXT,
  old_size BIGINT,
  new_size BIGINT,
  savings BIGINT,
  savings_percentage DECIMAL
) AS $$
BEGIN
  -- This would typically involve image compression logic
  -- For now, return placeholder data
  
  RETURN QUERY
  SELECT 
    'compressed' as action,
    name as object_name,
    size as old_size,
    size * 0.8 as new_size, -- Assume 20% compression
    size * 0.2 as savings,
    20.0 as savings_percentage
  FROM storage.objects
  WHERE bucket_id = 'product-images'
  AND created_at < NOW() - INTERVAL '30 days'
  AND size > 1048576 -- Only compress files larger than 1MB
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Insert some default store assets (placeholder URLs)
-- These would be replaced during setup
UPDATE settings 
SET 
  logo_url = 'store-assets/logo.png',
  favicon_url = 'store-assets/favicon.ico'
WHERE id = 'default';
