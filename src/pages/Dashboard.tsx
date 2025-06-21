import React from 'react';
import { useUser } from '@civic/auth-web3/react';
import Header from '@/components/Layout/Header';
import { RewardsManager } from '@/components/Rewards/RewardsManager';
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
import { useCart } from '@/contexts/CartContext';

// Dummy Data and Components (replace with real data and components)
const ecoScore = { value: 78, trend: 'up' };
const recommendedProducts = [
  { id: '1', name: 'Artisan Sourdough', current_price: 3.50, original_price: 5.00, discount_percentage: 30, expiry_date: '2024-07-20T23:59:59Z', category: 'Bakery', image_url: null, stores: { name: 'The Daily Bread', address: '123 Main St' } },
  { id: '2', name: 'Organic Veggie Box', current_price: 12.00, original_price: 15.00, discount_percentage: 20, expiry_date: '2024-07-21T23:59:59Z', category: 'Grocery', image_url: null, stores: { name: 'Green Fields Farm', address: '456 Country Rd' } },
];
const recentOrders = [
  { id: 'ORD123', date: '2024-07-15', total: 15.50, status: 'Delivered' },
  { id: 'ORD122', date: '2024-07-12', total: 8.75, status: 'Delivered' },
];

const EcoScoreSection = ({ ecoScore }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Your Eco Score</CardTitle>
      <CardDescription>How you're making an impact.</CardDescription>
    </CardHeader>
    <CardContent>
       {/* Content for Eco Score */}
    </CardContent>
  </Card>
);
const RecommendedProductsSection = ({ products, onPurchase }: any) => (
  <Card>
    <CardHeader><CardTitle>Recommended For You</CardTitle></CardHeader>
    <CardContent>
       {/* Content for Recommended Products */}
    </CardContent>
  </Card>
);
const RecentOrdersSection = ({ orders }: any) => (
  <Card>
    <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
    <CardContent>
       {/* Content for Recent Orders */}
    </CardContent>
  </Card>
);


const DashboardPage = () => {
  const { user } = useUser();
  const { addToCart } = useCart();

  const handlePurchase = (product: any) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen">
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
                    {/* Rewards Manager */}
                    <RewardsManager />
                    {/* Recent Orders Section */}
                    <RecentOrdersSection orders={recentOrders} />
                </div>
            </div>
        </main>
    </div>
  );
};

export default DashboardPage;
