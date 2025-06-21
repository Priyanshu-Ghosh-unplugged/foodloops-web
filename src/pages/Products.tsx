import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { apiClient, Product } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

// Types
type ProductCategory = 'dairy' | 'bakery' | 'meat' | 'produce' | 'pantry' | 'frozen' | 'beverages' | 'other';

const mockRecommendedProducts: Product[] = [
    { _id: 'prod-2', name: 'Sourdough Bread', price: 220, original_price: 440, expiry_date: new Date().toISOString(), category: 'bakery', image_url: '/placeholder.svg', store_name: 'Community Co-op', description: 'Freshly baked sourdough', quantity_available: 10, store_id: '1', seller_id: '1', seller_name: 'Seller', location: {type: 'Point', coordinates: [0,0]}, rating: 5, review_count: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),},
    { _id: 'prod-3', name: 'Avocados (Bag of 4)', price: 240, original_price: 480, expiry_date: new Date().toISOString(), category: 'produce', image_url: '/placeholder.svg', store_name: "Priyan's Fresh Finds", description: 'Ripe and ready avocados', quantity_available: 15, store_id: '1', seller_id: '1', seller_name: 'Seller', location: {type: 'Point', coordinates: [0,0]}, rating: 5, review_count: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), },
    { _id: 'prod-1', name: 'Organic Milk', price: 160, original_price: 320, expiry_date: new Date().toISOString(), category: 'dairy', image_url: '/placeholder.svg', store_name: "Priyan's Fresh Finds", description: '1L of organic milk', quantity_available: 20, store_id: '1', seller_id: '1', seller_name: 'Seller', location: {type: 'Point', coordinates: [0,0]}, rating: 5, review_count: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), },
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Fetch products using React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', selectedCategory, sortBy, sortOrder, currentPage, searchTerm],
    queryFn: () => apiClient.getProducts({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      sort_by: sortBy as any,
      sort_order: sortOrder,
      page: currentPage,
      limit: 12,
      search: searchTerm || undefined
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products = data?.products || [];
  const pagination = data?.pagination;

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

  const handlePurchase = async (product: Product) => {
    try {
      addItem({
        id: product._id,
        name: product.name,
        current_price: product.price,
        original_price: product.original_price,
        discount_percentage: Math.round(((product.original_price - product.price) / product.original_price) * 100),
        expiry_date: product.expiry_date,
        category: product.category,
        image_url: product.image_url || null,
        stores: {
          name: product.store_name,
          address: ''
        }
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'Failed to load products'}
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }
  
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
            {/* Recommended Products */}
            <RecommendedProductsSection products={mockRecommendedProducts} onPurchase={handlePurchase} />

            {/* Filters and Search */}
        <Card className="my-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 dark:bg-gray-700 dark:text-gray-200"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="dark:bg-gray-700 dark:text-gray-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest</SelectItem>
                  <SelectItem value="discount_percentage">Highest Discount</SelectItem>
                  <SelectItem value="current_price">Lowest Price</SelectItem>
                  <SelectItem value="expiry_date">Expiring Soon</SelectItem>
                </SelectContent>
              </Select>

              {/* Results Count */}
              <div className="flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 rounded-lg px-4">
                <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                  {pagination?.total || 0} products found
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {isLoading ? (
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
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍃</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Products Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or check back later for new deals.
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setCurrentPage(1);
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
                return (
                  <Card key={product._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="relative">
                      <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                        {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                      </Badge>
                      <Badge className={`absolute top-2 left-2 ${getExpiryBadgeColor(daysUntilExpiry)}`}>
                        {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left`}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{product.store_name}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="line-through text-sm text-gray-500 dark:text-gray-400 ml-2">
                            ₹{product.original_price.toFixed(2)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {product.quantity_available} left
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => handlePurchase(product)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        disabled={product.quantity_available <= 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.quantity_available <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
        </main>
    </div>
  );
};

const RecommendedProductsSection = ({ products, onPurchase }: { products: Product[], onPurchase: (product: Product) => void }) => (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
        <CardHeader>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Recommended For You</h2>
            <p className="text-gray-600 dark:text-gray-400">Fresh deals we think you'll like.</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
                <div key={product._id} className="border border-amber-200 dark:border-gray-600 rounded-lg p-3 bg-white/50 dark:bg-gray-700/50 hover:shadow-md transition-all duration-200">
                    <img 
                        src={product.image_url || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                    />
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{product.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.store_name}</p>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{product.price.toFixed(2)}</span>
                        <span className="line-through text-sm text-gray-500 dark:text-gray-400">₹{product.original_price.toFixed(2)}</span>
                    </div>
                    <Badge variant="secondary" className="mb-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                        {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                    </Badge>
                    <Button 
                        size="sm" 
                        className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600" 
                        onClick={() => onPurchase(product)}
                    >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>
            ))}
        </CardContent>
    </Card>
);

export default ProductsPage;
