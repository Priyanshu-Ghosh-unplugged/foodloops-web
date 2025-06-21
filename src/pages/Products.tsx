import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  MapPin,
  Clock,
  Star,
  Leaf
} from 'lucide-react';
import { toast } from 'sonner';

// Mock Data and Types
type ProductCategory = 'dairy' | 'bakery' | 'meat' | 'produce' | 'pantry' | 'frozen' | 'beverages' | 'other';

interface Product {
  id: string;
  name: string;
  description: string | null;
  current_price: number;
  original_price: number;
  discount_percentage: number;
  expiry_date: string;
  category: ProductCategory;
  image_url: string | null;
  quantity_available: number;
  stores: {
    name: string;
    address: string;
  };
}

const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Organic Milk', description: 'Fresh whole milk, nearing expiry.', category: 'dairy', original_price: 3.99, current_price: 1.99, discount_percentage: 50, expiry_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), quantity_available: 10, image_url: '/placeholder.svg', stores: { name: "Priyan's Fresh Finds", address: '123 Green Way' } },
    { id: 'prod-2', name: 'Sourdough Bread', description: 'Artisan sourdough, best by tomorrow.', category: 'bakery', original_price: 5.50, current_price: 2.75, discount_percentage: 50, expiry_date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), quantity_available: 5, image_url: '/placeholder.svg', stores: { name: "Community Co-op", address: '456 Market St' } },
    { id: 'prod-3', name: 'Avocados (Bag of 4)', description: 'Ripe and ready to eat.', category: 'produce', original_price: 6.00, current_price: 3.00, discount_percentage: 50, expiry_date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), quantity_available: 20, image_url: '/placeholder.svg', stores: { name: "Priyan's Fresh Finds", address: '123 Green Way' } },
];


const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('discount');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'bakery', label: 'Bakery' },
    { value: 'meat', label: 'Meat' },
    { value: 'produce', label: 'Produce' },
    { value: 'pantry', label: 'Pantry' },
    { value: 'frozen', label: 'Frozen' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    // Mock implementation
    setTimeout(() => {
        let data = [...mockProducts];
        if (selectedCategory !== 'all') {
            data = data.filter(p => p.category === selectedCategory);
        }
        
        switch (sortBy) {
            case 'discount':
              data.sort((a, b) => b.discount_percentage - a.discount_percentage);
              break;
            case 'price':
              data.sort((a, b) => a.current_price - b.current_price);
              break;
            case 'expiry':
              data.sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
              break;
        }

        setProducts(data);
        setLoading(false);
    }, 500);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.stores?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryBadgeColor = (daysUntilExpiry: number) => {
    if (daysUntilExpiry <= 1) return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    if (daysUntilExpiry <= 3) return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
    if (daysUntilExpiry <= 7) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
  };

  const handlePurchase = async (productId: string, price: number) => {
    // Simple purchase simulation
    toast.success('Added to cart! (This is a mock action)');
    // In a real app, this would handle the complete purchase flow
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
             <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                Discover Deals
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Find quality products at great prices and help reduce waste.
              </p>
            </div>
            {/* Filters and Search */}
        <Card className="mb-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Highest Discount</SelectItem>
                  <SelectItem value="price">Lowest Price</SelectItem>
                  <SelectItem value="expiry">Expiring Soon</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4">
                <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  {filteredProducts.length} products found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
            <CardContent>
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                  <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center relative">
                    <img 
                      src={product.image_url || '/placeholder.svg'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      {Math.round(product.discount_percentage)}% OFF
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{product.stores.name}</p>
                    <div className="flex justify-between items-center mt-2">
                        <span className="font-bold text-lg text-green-600">${product.current_price.toFixed(2)}</span>
                        <span className="line-through text-sm text-gray-400">${product.original_price.toFixed(2)}</span>
                    </div>
                    <Badge variant="outline" className={`mt-2 w-full justify-center ${getExpiryBadgeColor(daysUntilExpiry)}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        Expires in {daysUntilExpiry} day(s)
                    </Badge>
                    <Button className="w-full mt-4" onClick={() => handlePurchase(product.id, product.current_price)}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </main>
    </div>
  );
};

export default ProductsPage;
