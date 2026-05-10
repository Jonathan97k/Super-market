-- Orders table for supermarket order management
-- This migration creates the complete order system for the supermarket

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  customer_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT DEFAULT 'whatsapp' CHECK (payment_method IN ('whatsapp', 'cash', 'card', 'mobile_money')),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (shipping_fee >= 0),
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  currency TEXT DEFAULT 'MWK',
  promotion_id UUID REFERENCES promotions(id) ON DELETE SET NULL,
  coupon_code TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  delivery_driver TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant_name TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  product_snapshot TEXT, -- JSON snapshot of product details at time of order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  notes TEXT,
  created_by TEXT, -- User ID or system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_delivery ON orders(estimated_delivery, actual_delivery);
CREATE INDEX IF NOT EXISTS idx_orders_promotion ON orders(promotion_id);
CREATE INDEX IF NOT EXISTS idx_orders_total ON orders(total_amount);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

-- Create trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  date_part TEXT;
  sequence_part INTEGER;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYMMDD');
  
  -- Get the next sequence number for today
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 7) AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM orders
  WHERE order_number LIKE 'ORD-' || date_part || '-%';
  
  RETURN 'ORD-' || date_part || '-' || LPAD(sequence_part::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order number generation
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Create function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
DECLARE
  new_subtotal DECIMAL;
  new_total DECIMAL;
BEGIN
  -- Calculate new subtotal from order items
  SELECT COALESCE(SUM(total_price), 0) INTO new_subtotal
  FROM order_items
  WHERE order_id = NEW.id;
  
  -- Update subtotal
  NEW.subtotal := new_subtotal;
  
  -- Calculate total
  NEW.total_amount := new_subtotal + NEW.shipping_fee + NEW.tax_amount - NEW.discount_amount;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_totals_trigger
  BEFORE UPDATE OF subtotal, shipping_fee, tax_amount, discount_amount ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_totals();

-- Create function to log order status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status, previous_status, created_by)
    VALUES (NEW.id, NEW.status, OLD.status, 'system');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Create function to update product stock on order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Update stock for each order item
  FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
    UPDATE products
    SET stock = stock - item.quantity,
        updated_at = NOW()
    WHERE id = item.product_id
    AND track_inventory = true;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_stock_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status = 'confirmed')
  EXECUTE FUNCTION update_product_stock;

-- Create function to restore product stock on order cancellation
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Restore stock for each order item
  FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
    UPDATE products
    SET stock = stock + item.quantity,
        updated_at = NOW()
    WHERE id = item.product_id
    AND track_inventory = true;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restore_product_stock_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status NOT IN ('cancelled', 'refunded') AND NEW.status IN ('cancelled', 'refunded'))
  EXECUTE FUNCTION restore_product_stock;

-- Add RLS policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Admins have full access to orders" ON orders
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Staff can read orders" ON orders
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff')
  );

CREATE POLICY "Customers can read their own orders" ON orders
  FOR SELECT USING (
    customer_phone = auth.jwt() ->> 'phone'
  );

-- Order items policies
CREATE POLICY "Admins have full access to order items" ON order_items
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Staff can read order items" ON order_items
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff')
  );

CREATE POLICY "Customers can read their own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.customer_phone = auth.jwt() ->> 'phone'
    )
  );

-- Order status history policies
CREATE POLICY "Admins have full access to order status history" ON order_status_history
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Staff can read order status history" ON order_status_history
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'staff')
  );

CREATE POLICY "Customers can read their own order status history" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.customer_phone = auth.jwt() ->> 'phone'
    )
  );

-- Create view for order statistics
CREATE OR REPLACE VIEW order_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as order_date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_order_value,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
FROM orders
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY order_date DESC;
