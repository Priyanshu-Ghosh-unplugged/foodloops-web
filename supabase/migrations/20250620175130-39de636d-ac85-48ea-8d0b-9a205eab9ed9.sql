
-- Insert demo stores first
INSERT INTO public.stores (id, owner_id, name, description, address, phone, email, is_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM auth.users LIMIT 1), 'Fresh Market Delhi', 'Premium grocery store in Connaught Place', 'Shop No. 15, Connaught Place, New Delhi, Delhi 110001', '+91-98765-43210', 'freshmarket@delhi.com', true),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM auth.users LIMIT 1), 'Spice Bazaar Mumbai', 'Traditional spices and fresh produce', '142, Mohammed Ali Road, Mumbai, Maharashtra 400003', '+91-98765-43211', 'spicebazaar@mumbai.com', true),
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM auth.users LIMIT 1), 'Green Valley Bangalore', 'Organic vegetables and dairy products', 'HSR Layout, Sector 2, Bangalore, Karnataka 560102', '+91-98765-43212', 'greenvalley@bangalore.com', true);

-- Insert demo products with Indian pricing (in INR)
INSERT INTO public.products (id, store_id, name, description, category, original_price, current_price, discount_percentage, expiry_date, quantity_available, image_url, status) VALUES
-- Fresh Market Delhi products
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Fresh Milk (1L)', 'Pure cow milk from local dairy farms', 'dairy', 65.00, 45.50, 30.00, CURRENT_DATE + INTERVAL '2 days', 25, null, 'active'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Whole Wheat Bread', 'Freshly baked whole wheat bread loaf', 'bakery', 40.00, 24.00, 40.00, CURRENT_DATE + INTERVAL '1 day', 15, null, 'active'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Basmati Rice (5kg)', 'Premium quality Basmati rice', 'pantry', 450.00, 315.00, 30.00, CURRENT_DATE + INTERVAL '30 days', 8, null, 'active'),
-- Spice Bazaar Mumbai products
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Fresh Tomatoes (1kg)', 'Red ripe tomatoes perfect for cooking', 'produce', 35.00, 21.00, 40.00, CURRENT_DATE + INTERVAL '3 days', 20, null, 'active'),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Chicken Curry Cut (1kg)', 'Fresh chicken cut for curry', 'meat', 320.00, 192.00, 40.00, CURRENT_DATE + INTERVAL '1 day', 12, null, 'active'),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Mango Juice (1L)', 'Fresh mango juice with pulp', 'beverages', 85.00, 59.50, 30.00, CURRENT_DATE + INTERVAL '5 days', 18, null, 'active'),
-- Green Valley Bangalore products
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'Organic Spinach (500g)', 'Fresh organic spinach leaves', 'produce', 45.00, 27.00, 40.00, CURRENT_DATE + INTERVAL '2 days', 30, null, 'active'),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'Greek Yogurt (200g)', 'Creamy Greek style yogurt', 'dairy', 75.00, 52.50, 30.00, CURRENT_DATE + INTERVAL '4 days', 22, null, 'active'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440003', 'Frozen Mixed Vegetables (1kg)', 'Assorted frozen vegetables', 'frozen', 120.00, 84.00, 30.00, CURRENT_DATE + INTERVAL '15 days', 10, null, 'active'),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'Masala Cookies (200g)', 'Traditional Indian spiced cookies', 'bakery', 55.00, 33.00, 40.00, CURRENT_DATE + INTERVAL '1 day', 16, null, 'active');

-- Create an improved dynamic pricing function with Indian standards
CREATE OR REPLACE FUNCTION public.calculate_dynamic_price_advanced(
  original_price DECIMAL,
  expiry_date DATE,
  category product_category,
  current_stock INTEGER DEFAULT 1
) RETURNS DECIMAL AS $$
DECLARE
  days_until_expiry INTEGER;
  hours_until_expiry INTEGER;
  base_discount_percentage DECIMAL;
  stock_multiplier DECIMAL;
  category_multiplier DECIMAL;
  final_discount DECIMAL;
  min_price DECIMAL;
BEGIN
  days_until_expiry := expiry_date - CURRENT_DATE;
  hours_until_expiry := EXTRACT(EPOCH FROM (expiry_date::timestamp - now())) / 3600;
  
  -- Base discount based on days until expiry
  CASE 
    WHEN days_until_expiry <= 0 THEN base_discount_percentage := 0.75; -- 75% off if expired
    WHEN days_until_expiry = 1 THEN base_discount_percentage := 0.65; -- 65% off if expires today/tomorrow
    WHEN days_until_expiry = 2 THEN base_discount_percentage := 0.55; -- 55% off
    WHEN days_until_expiry = 3 THEN base_discount_percentage := 0.45; -- 45% off
    WHEN days_until_expiry <= 5 THEN base_discount_percentage := 0.35; -- 35% off
    WHEN days_until_expiry <= 7 THEN base_discount_percentage := 0.25; -- 25% off
    WHEN days_until_expiry <= 14 THEN base_discount_percentage := 0.15; -- 15% off
    ELSE base_discount_percentage := 0.10; -- 10% off for longer shelf life
  END CASE;
  
  -- Category-based multiplier (some categories are more perishable)
  CASE category
    WHEN 'dairy' THEN category_multiplier := 1.2; -- Higher discount for dairy
    WHEN 'meat' THEN category_multiplier := 1.3; -- Highest discount for meat
    WHEN 'produce' THEN category_multiplier := 1.1; -- Slightly higher for produce
    WHEN 'bakery' THEN category_multiplier := 1.15; -- Higher for bakery items
    WHEN 'frozen' THEN category_multiplier := 0.8; -- Lower discount for frozen
    WHEN 'pantry' THEN category_multiplier := 0.7; -- Lowest discount for pantry items
    ELSE category_multiplier := 1.0;
  END CASE;
  
  -- Stock level multiplier (higher stock = higher discount)
  CASE 
    WHEN current_stock >= 20 THEN stock_multiplier := 1.15;
    WHEN current_stock >= 10 THEN stock_multiplier := 1.05;
    ELSE stock_multiplier := 1.0;
  END CASE;
  
  -- Calculate final discount
  final_discount := base_discount_percentage * category_multiplier * stock_multiplier;
  
  -- Cap the discount at 80%
  final_discount := LEAST(final_discount, 0.80);
  
  -- Set minimum price to 20% of original (maximum 80% discount)
  min_price := original_price * 0.20;
  
  RETURN GREATEST(ROUND(original_price * (1 - final_discount), 2), min_price);
END;
$$ LANGUAGE plpgsql;

-- Create rewards table for user rewards system
CREATE TABLE public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_earned INTEGER DEFAULT 0,
  points_redeemed INTEGER DEFAULT 0,
  current_points INTEGER DEFAULT 0,
  level_name TEXT DEFAULT 'Eco Warrior',
  level_number INTEGER DEFAULT 1,
  next_level_points INTEGER DEFAULT 100,
  badges TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for rewards
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for rewards
CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own rewards" ON public.user_rewards FOR ALL USING (auth.uid() = user_id);

-- Function to calculate rewards points based on purchase
CREATE OR REPLACE FUNCTION public.calculate_reward_points(
  savings_amount DECIMAL,
  items_saved INTEGER
) RETURNS INTEGER AS $$
BEGIN
  -- 1 point per ₹10 saved + 5 points per item saved
  RETURN FLOOR(savings_amount / 10) + (items_saved * 5);
END;
$$ LANGUAGE plpgsql;

-- Update the new user function to include rewards
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.eco_scores (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.user_rewards (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
