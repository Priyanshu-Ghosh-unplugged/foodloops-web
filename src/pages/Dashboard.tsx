import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@civic/auth-web3/react';
import Header from '@/components/Layout/Header';
import RewardsCard from '@/components/Rewards/RewardsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  Leaf, 
  IndianRupee, 
  TrendingUp, 
  Calendar,
  MapPin,
  Star,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Data and Types
interface EcoScore {
  total_items_saved: number;
  total_money_saved: number;
  co2_saved_kg: number;
  water_saved_liters: number;
}

interface Product {
  id: string;
  name:string;
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

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  products: { name: string, image_url: string | null };
}

const mockEcoScore: EcoScore = {
  total_items_saved: 78,
  total_money_saved: 16840,
  co2_saved_kg: 15.6,
  water_saved_liters: 3120
};

const mockRecommendedProducts: Product[] = [
    { id: 'prod-2', name: 'Sourdough Bread', current_price: 220, original_price: 440, discount_percentage: 50, expiry_date: new Date().toISOString(), category: 'bakery', image_url: '/placeholder.svg', stores: { name: 'Community Co-op', address: '456 Market St' } },
    { id: 'prod-3', name: 'Avocados (Bag of 4)', current_price: 240, original_price: 480, discount_percentage: 50, expiry_date: new Date().toISOString(), category: 'produce', image_url: '/placeholder.svg', stores: { name: "Priyan's Fresh Finds", address: '123 Green Way' } },
    { id: 'prod-1', name: 'Organic Milk', current_price: 160, original_price: 320, discount_percentage: 50, expiry_date: new Date().toISOString(), category: 'dairy', image_url: '/placeholder.svg', stores: { name: "Priyan's Fresh Finds", address: '123 Green Way' } },
];

const mockRecentOrders: Order[] = [
    { id: 'order-1', created_at: new Date().toISOString(), total_price: 1000, status: 'Delivered', products: { name: 'Mixed Berry Yogurt', image_url: '/placeholder.svg' } },
    { id: 'order-2', created_at: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), total_price: 624, status: 'Delivered', products: { name: 'Croissants (x4)', image_url: '/placeholder.svg' } },
];

const Dashboard = () => {
  const userContext = useUser();
  const user = userContext?.user;
  const navigate = useNavigate();
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Mock data fetching can be done regardless of user state for now
    setEcoScore(mockEcoScore);
    setRecommendedProducts(mockRecommendedProducts);
    setRecentOrders(mockRecentOrders);
  }, []);

  const handlePurchase = async (productId: string, price: number) => {
    toast.success('Purchase successful! (This is a mock action)');
  };

  if (!userContext) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // The rest of the return statement with JSX is the same
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                    Welcome back, {user?.name || 'Eco-Warrior'}! 🌱
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Here's a look at your sustainable journey with FoodLoops.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Eco Score Section */}
                    <EcoScoreSection ecoScore={ecoScore} />
                    {/* Recommended Products Section */}
                    <RecommendedProductsSection products={recommendedProducts} onPurchase={handlePurchase} />
                </div>
                <div className="space-y-8">
                    {/* Rewards Card */}
                    <RewardsCard />
                    {/* Recent Orders Section */}
                    <RecentOrdersSection orders={recentOrders} />
                </div>
            </div>
        </main>
    </div>
  );
};

const EcoScoreSection = ({ ecoScore }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card for Items Saved */}
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items Saved</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{ecoScore?.total_items_saved || 0}</div>
                <p className="text-xs text-muted-foreground">items rescued from waste</p>
            </CardContent>
        </Card>
        {/* Other EcoScore cards would go here */}
    </div>
);

const RecommendedProductsSection = ({ products, onPurchase }) => (
    <Card>
        <CardHeader>
            <CardTitle>Recommended For You</CardTitle>
            <CardDescription>Fresh deals we think you'll like.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
                <div key={product.id} className="border rounded-lg p-3">
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-green-600 font-bold">₹{product.current_price.toFixed(2)}</p>
                    <Button size="sm" className="w-full mt-2" onClick={() => onPurchase(product.id, product.current_price)}>Add to Cart</Button>
                </div>
            ))}
        </CardContent>
    </Card>
);

const RecentOrdersSection = ({ orders }) => (
    <Card>
        <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
                {orders.map(order => (
                    <li key={order.id} className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">{order.products.name}</p>
                            <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <Badge>{order.status}</Badge>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

export default Dashboard;
