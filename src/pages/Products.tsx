
import { useEffect, useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ProductCategory = Database['public']['Enums']['product_category'];

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

const Products = () => {
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
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          stores (name, address)
        `)
        .eq('status', 'active')
        .gt('quantity_available', 0);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as ProductCategory);
      }

      // Apply sorting
      switch (sortBy) {
        case 'discount':
          query = query.order('discount_percentage', { ascending: false });
          break;
        case 'price':
          query = query.order('current_price', { ascending: true });
          break;
        case 'expiry':
          query = query.order('expiry_date', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
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
    if (daysUntilExpiry <= 1) return 'bg-red-100 text-red-700';
    if (daysUntilExpiry <= 3) return 'bg-orange-100 text-orange-700';
    if (daysUntilExpiry <= 7) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  const handlePurchase = async (productId: string, price: number) => {
    // Simple purchase simulation
    toast.success('Added to cart! Redirecting to checkout...');
    // In a real app, this would handle the complete purchase flow
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Mandala Background */}
      <div 
        className="absolute inset-0 opacity-8 bg-repeat bg-center"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='mandala' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23d97706' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23d97706' stroke-width='0.3'/%3E%3Ccircle cx='50' cy='50' r='10' fill='none' stroke='%23d97706' stroke-width='0.2'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23mandala)'/%3E%3C/svg%3E")`
        }}
      />
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Near-Expiry Products 🛒
          </h1>
          <p className="text-gray-600">
            Discover amazing deals on quality products and help reduce food waste
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 bg-white/60 backdrop-blur-sm border-amber-100">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
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
                <SelectTrigger>
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
              <div className="flex items-center justify-center bg-amber-50 rounded-lg px-4">
                <span className="text-sm text-amber-700 font-medium">
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
                <div className="aspect-video bg-gray-200" />
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded mb-4" />
                  <div className="h-8 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="text-center py-12 bg-white/60 backdrop-blur-sm border-amber-100">
            <CardContent>
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
              return (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-amber-100">
                  <div className="aspect-video bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center relative">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-12 h-12 text-amber-600" />
                    )}
                    
                    {/* Discount Badge */}
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                      {Math.round(product.discount_percentage)}% OFF
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    {/* Product Name */}
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
                    
                    {/* Category */}
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        ${product.current_price}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.original_price}
                      </span>
                    </div>
                    
                    {/* Store Info */}
                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{product.stores?.name}</span>
                    </div>
                    
                    {/* Expiry Info */}
                    <div className="flex items-center gap-1 text-xs mb-3">
                      <Clock className="w-3 h-3" />
                      <Badge 
                        variant="secondary" 
                        className={`${getExpiryBadgeColor(daysUntilExpiry)} text-xs`}
                      >
                        {daysUntilExpiry <= 0 ? 'Expired' : 
                         daysUntilExpiry === 1 ? 'Expires tomorrow' :
                         `${daysUntilExpiry} days left`}
                      </Badge>
                    </div>
                    
                    {/* Quantity Available */}
                    <div className="text-xs text-gray-600 mb-3">
                      {product.quantity_available} available
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      onClick={() => handlePurchase(product.id, product.current_price)}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Eco Impact Banner */}
        <Card className="mt-12 bg-gradient-to-r from-green-500 to-emerald-500 border-none text-white">
          <CardContent className="p-8 text-center">
            <Leaf className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Every Purchase Makes a Difference</h2>
            <p className="text-lg opacity-90 mb-4">
              You're helping reduce food waste and supporting local businesses
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div>
                <div className="text-2xl font-bold">2.1 tons</div>
                <div className="text-sm opacity-80">Food saved weekly</div>
              </div>
              <div>
                <div className="text-2xl font-bold">35%</div>
                <div className="text-sm opacity-80">Average savings</div>
              </div>
              <div>
                <div className="text-2xl font-bold">1,200+</div>
                <div className="text-sm opacity-80">Happy customers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Products;
