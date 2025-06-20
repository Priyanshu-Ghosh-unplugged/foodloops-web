import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Layout/Header';
import RewardsCard from '@/components/Rewards/RewardsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  Leaf, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  MapPin,
  Star,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EcoScore {
  total_items_saved: number;
  total_money_saved: number;
  co2_saved_kg: number;
  water_saved_liters: number;
}

interface Product {
  id: string;
  name: string;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  expiry_date: string;
  category: string;
  image_url: string | null;
  stores: {
    name: string;
    address: string;
  };
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEcoScore();
      fetchRecommendedProducts();
      fetchRecentOrders();
    }
  }, [user]);

  const fetchEcoScore = async () => {
    try {
      const { data, error } = await supabase
        .from('eco_scores')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEcoScore(data || {
        total_items_saved: 0,
        total_money_saved: 0,
        co2_saved_kg: 0,
        water_saved_liters: 0
      });
    } catch (error) {
      console.error('Error fetching eco score:', error);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          stores (name, address)
        `)
        .eq('status', 'active')
        .order('discount_percentage', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecommendedProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (name, image_url),
          products!inner(stores(name))
        `)
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handlePurchase = async (productId: string, price: number) => {
    // Simple purchase simulation
    toast.success('Purchase successful! Check your orders.');
    // In a real app, this would handle the complete purchase flow
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Mandala Background */}
      <div 
        className="absolute inset-0 opacity-8 bg-repeat bg-center"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='mandala' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23d97706' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23d97706' stroke-width='0.3'/%3E%3Ccircle cx='50' cy='50' r='10' fill='none' stroke='%23d97706' stroke-width='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23mandala)'/%3E%3C/svg%3E")`
        }}
      />
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Welcome back, {user?.email?.split('@')[0]}! 🌱
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Here's your impact on reducing food waste</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Eco Scores and Rewards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Eco Score Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Items Saved</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{ecoScore?.total_items_saved || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Food items rescued from waste
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Money Saved</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">₹{ecoScore?.total_money_saved || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total savings from discounts
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">CO₂ Reduced</CardTitle>
                  <Leaf className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{ecoScore?.co2_saved_kg || 0}kg</div>
                  <p className="text-xs text-muted-foreground">
                    Carbon footprint reduction
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200">Water Saved</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{ecoScore?.water_saved_liters || 0}L</div>
                  <p className="text-xs text-muted-foreground">
                    Water conservation impact
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Products */}
            <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <Star className="w-5 h-5 text-amber-600" />
                  Recommended for You
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Products picked based on your preferences and location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="w-12 h-12 text-amber-600" />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">{product.name}</h3>
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            {Math.round(product.discount_percentage)}% OFF
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-green-600">
                            ₹{product.current_price}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.original_price}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                          <MapPin className="w-3 h-3" />
                          <span>{product.stores?.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-xs text-red-600 mb-3">
                          <Clock className="w-3 h-3" />
                          <span>Expires: {new Date(product.expiry_date).toLocaleDateString()}</span>
                        </div>
                        
                        <Button 
                          onClick={() => handlePurchase(product.id, product.current_price)}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                          size="sm"
                        >
                          Quick Buy
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => navigate('/products')}
                    variant="outline" 
                    className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  >
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Rewards */}
          <div className="space-y-8">
            <RewardsCard />

            {/* Quick Actions */}
            <div className="space-y-4">
              <Card 
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/products')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                    Browse Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Discover amazing deals on near-expiry foods from local stores
                  </p>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate('/community')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                    <Star className="w-5 h-5 text-amber-600" />
                    Community
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share recipes and tips with fellow eco-conscious food lovers
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
