
-- Create enum types for user roles and product categories
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE product_category AS ENUM ('dairy', 'bakery', 'meat', 'produce', 'pantry', 'frozen', 'beverages', 'other');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'expired', 'removed');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  avatar_url TEXT,
  location TEXT,
  phone TEXT,
  business_name TEXT, -- For sellers
  business_address TEXT, -- For sellers
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stores table for retailer information
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table for near-expiry items
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category product_category NOT NULL,
  original_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  expiry_date DATE NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  status listing_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orders table for purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  original_total DECIMAL(10,2) NOT NULL,
  savings DECIMAL(10,2) NOT NULL,
  order_status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create eco_scores table to track environmental impact
CREATE TABLE public.eco_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_items_saved INTEGER DEFAULT 0,
  total_money_saved DECIMAL(10,2) DEFAULT 0,
  co2_saved_kg DECIMAL(10,2) DEFAULT 0,
  water_saved_liters DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_preferences table for personalized recommendations
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_categories product_category[],
  max_distance_km INTEGER DEFAULT 10,
  max_price DECIMAL(10,2),
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community_posts table for recipe sharing
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'recipe', -- recipe, tip, discussion
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stores policies
CREATE POLICY "Anyone can view active stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Store owners can manage their stores" ON public.stores FOR ALL USING (auth.uid() = owner_id);

-- Products policies
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Store owners can manage their products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Eco scores policies
CREATE POLICY "Users can view their own eco scores" ON public.eco_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own eco scores" ON public.eco_scores FOR ALL USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Anyone can view community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = author_id);

-- Post likes policies
CREATE POLICY "Anyone can view post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own likes" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user registration
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate dynamic pricing based on expiry date
CREATE OR REPLACE FUNCTION public.calculate_dynamic_price(
  original_price DECIMAL,
  expiry_date DATE
) RETURNS DECIMAL AS $$
DECLARE
  days_until_expiry INTEGER;
  discount_percentage DECIMAL;
BEGIN
  days_until_expiry := expiry_date - CURRENT_DATE;
  
  -- Calculate discount based on days until expiry
  CASE 
    WHEN days_until_expiry <= 0 THEN discount_percentage := 0.80; -- 80% off if expired
    WHEN days_until_expiry = 1 THEN discount_percentage := 0.70; -- 70% off if expires today/tomorrow
    WHEN days_until_expiry = 2 THEN discount_percentage := 0.60; -- 60% off
    WHEN days_until_expiry = 3 THEN discount_percentage := 0.50; -- 50% off
    WHEN days_until_expiry <= 5 THEN discount_percentage := 0.40; -- 40% off
    WHEN days_until_expiry <= 7 THEN discount_percentage := 0.30; -- 30% off
    ELSE discount_percentage := 0.20; -- 20% off for longer shelf life
  END CASE;
  
  RETURN ROUND(original_price * (1 - discount_percentage), 2);
END;
$$ LANGUAGE plpgsql;
