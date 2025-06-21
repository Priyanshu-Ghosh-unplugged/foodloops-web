import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@civic/auth-web3/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Leaf, 
  IndianRupee, 
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

// Mock Data and Types (assuming these are defined elsewhere or passed as props)
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

const mockEcoScore: EcoScore = {
  total_items_saved: 78,
  total_money_saved: 16840,
  co2_saved_kg: 15.6,
  water_saved_liters: 3120
};

const mockRecommendedProducts: Product[] = [
    { id: 'prod-2', name: 'Sourdough Bread', current_price: 220, original_price: 440, discount_percentage: 50, expiry_date: new Date().toISOString(), category: 'bakery', image_url: '/images/sourdough-bread.jpg', stores: { name: 'Community Co-op', address: '456 Market St' } },
    { id: 'prod-3', name: 'Avocados (Bag of 4)', current_price: 240, original_price: 480, discount_percentage: 50, expiry_date: new Date().toISOString(), category: 'produce', image_url: '/images/avocados.jpg', stores: { name: "Priyan's Fresh Finds", address: '123 Green Way' } },
    { id: 'prod-1', name: 'Organic Milk', current_price: 160, original_price: 320, discount_percentage: 50, expiry_date: new Date().toISOString(), category: 'dairy', image_url: '/images/organic-milk.jpg', stores: { name: "Priyan's Fresh Finds", address: '123 Green Way' } },
];


const DashboardContent = () => {
  const { addItem } = useCart();
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    setEcoScore(mockEcoScore);
    setRecommendedProducts(mockRecommendedProducts);
  }, []);

  const handlePurchase = async (productId: string, price: number) => {
    const product = recommendedProducts.find(p => p.id === productId);
    if (product) {
      addItem(product);
      toast.success('Added to cart!');
    }
  };
  
  return (
    <div className="space-y-8">
        {/* Eco Score Section */}
        <EcoScoreSection ecoScore={ecoScore} />
        {/* Recommended Products Section */}
        <RecommendedProductsSection products={recommendedProducts} onPurchase={handlePurchase} />
    </div>
  );
};

const EcoScoreSection = ({ ecoScore }: { ecoScore: EcoScore | null }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card for Items Saved */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Items Saved</CardTitle>
                <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{ecoScore?.total_items_saved || 0}</div>
                <p className="text-xs text-muted-foreground">items rescued from waste</p>
            </CardContent>
        </Card>

        {/* Card for Money Saved */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Money Saved</CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">₹{ecoScore?.total_money_saved || 0}</div>
                <p className="text-xs text-muted-foreground">saved through deals</p>
            </CardContent>
        </Card>

        {/* Card for CO2 Saved */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">CO₂ Saved</CardTitle>
                <Leaf className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{ecoScore?.co2_saved_kg || 0} kg</div>
                <p className="text-xs text-muted-foreground">carbon footprint reduced</p>
            </CardContent>
        </Card>

        {/* Card for Water Saved */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-cyan-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Water Saved</CardTitle>
                <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{ecoScore?.water_saved_liters || 0}L</div>
                <p className="text-xs text-muted-foreground">water resources conserved</p>
            </CardContent>
        </Card>
    </div>
);

const RecommendedProductsSection = ({ products, onPurchase }: { products: Product[], onPurchase: (id: string, price: number) => void }) => (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
        <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200">Recommended For You</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Fresh deals we think you'll like.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
                <div key={product.id} className="border border-amber-200 dark:border-gray-600 rounded-lg p-3 bg-white/50 dark:bg-gray-700/50 hover:shadow-md transition-all duration-200">
                    <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{product.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.stores.name}</p>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{product.current_price.toFixed(2)}</span>
                        <span className="line-through text-sm text-gray-500 dark:text-gray-400">₹{product.original_price.toFixed(2)}</span>
                    </div>
                    <Badge variant="secondary" className="mb-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        {Math.round(product.discount_percentage)}% OFF
                    </Badge>
                    <Button 
                        size="sm" 
                        className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600" 
                        onClick={() => onPurchase(product.id, product.current_price)}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            ))}
        </CardContent>
    </Card>
);

export default DashboardContent; 