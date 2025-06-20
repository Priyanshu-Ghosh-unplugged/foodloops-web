import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Plus, 
  Package, 
  DollarSign, 
  TrendingUp,
  Users,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ProductCategory = Database['public']['Enums']['product_category'];
type ListingStatus = Database['public']['Enums']['listing_status'];

interface Store {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  is_verified: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  original_price: number;
  current_price: number;
  discount_percentage: number;
  expiry_date: string;
  quantity_available: number;
  status: ListingStatus;
  created_at: string;
}

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'other' as ProductCategory,
    original_price: '',
    expiry_date: '',
    quantity_available: '1'
  });

  const categories = [
    { value: 'dairy' as const, label: 'Dairy' },
    { value: 'bakery' as const, label: 'Bakery' },
    { value: 'meat' as const, label: 'Meat' },
    { value: 'produce' as const, label: 'Produce' },
    { value: 'pantry' as const, label: 'Pantry' },
    { value: 'frozen' as const, label: 'Frozen' },
    { value: 'beverages' as const, label: 'Beverages' },
    { value: 'other' as const, label: 'Other' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchStores();
  }, [user, navigate]);

  useEffect(() => {
    if (activeStore) {
      fetchProducts(activeStore.id);
    }
  }, [activeStore]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
      if (data && data.length > 0) {
        setActiveStore(data[0]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (storeId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('stores')
        .insert({
          ...newStore,
          owner_id: user?.id
        });

      if (error) throw error;

      toast.success('Store created successfully!');
      setIsStoreModalOpen(false);
      setNewStore({ name: '', description: '', address: '', phone: '', email: '' });
      fetchStores();
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('Failed to create store');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeStore) {
      toast.error('Please select a store first');
      return;
    }

    try {
      const originalPrice = parseFloat(newProduct.original_price);
      
      // Calculate dynamic pricing using the database function
      const { data: calculatedPrice } = await supabase
        .rpc('calculate_dynamic_price', {
          original_price: originalPrice,
          expiry_date: newProduct.expiry_date
        });

      const currentPrice = calculatedPrice || originalPrice * 0.8; // fallback to 20% discount
      const discountPercentage = ((originalPrice - currentPrice) / originalPrice) * 100;

      const { error } = await supabase
        .from('products')
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          original_price: originalPrice,
          current_price: currentPrice,
          discount_percentage: discountPercentage,
          expiry_date: newProduct.expiry_date,
          quantity_available: parseInt(newProduct.quantity_available),
          store_id: activeStore.id
        });

      if (error) throw error;

      toast.success('Product listed successfully!');
      setIsProductModalOpen(false);
      setNewProduct({
        name: '',
        description: '',
        category: 'other',
        original_price: '',
        expiry_date: '',
        quantity_available: '1'
      });
      fetchProducts(activeStore.id);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const updateProductStatus = async (productId: string, status: ListingStatus) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId);

      if (error) throw error;

      toast.success(`Product ${status} successfully!`);
      if (activeStore) {
        fetchProducts(activeStore.id);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      sold: 'bg-blue-100 text-blue-700',
      expired: 'bg-red-100 text-red-700',
      removed: 'bg-gray-100 text-gray-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
            Seller Dashboard 🏪
          </h1>
          <p className="text-gray-600">
            Manage your stores and list near-expiry products to reduce food waste
          </p>
        </div>

        {stores.length === 0 ? (
          /* No Stores State */
          <Card className="text-center py-12 bg-white/60 backdrop-blur-sm border-amber-100">
            <CardContent>
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No stores yet</h3>
              <p className="text-gray-600 mb-6">Create your first store to start selling products</p>
              
              <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Store
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Create a New Store</DialogTitle>
                    <DialogDescription>
                      Add your business information to start selling on FoodLoops.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStore} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input
                        id="store-name"
                        value={newStore.name}
                        onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                        placeholder="Your store name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="store-description">Description</Label>
                      <Textarea
                        id="store-description"
                        value={newStore.description}
                        onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                        placeholder="Describe your store..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="store-address">Address</Label>
                      <Input
                        id="store-address"
                        value={newStore.address}
                        onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                        placeholder="Store address"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="store-phone">Phone</Label>
                        <Input
                          id="store-phone"
                          value={newStore.phone}
                          onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                          placeholder="Phone number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="store-email">Email</Label>
                        <Input
                          id="store-email"
                          value={newStore.email}
                          onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                          placeholder="Store email"
                          type="email"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsStoreModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      >
                        Create Store
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          /* Dashboard with Stores */
          <div className="space-y-8">
            {/* Store Selector */}
            <Card className="bg-white/60 backdrop-blur-sm border-amber-100">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-amber-600" />
                      Your Stores
                    </CardTitle>
                    <CardDescription>Select a store to manage its products</CardDescription>
                  </div>
                  
                  <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Store
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                      {/* ... Same store creation form as above ... */}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stores.map((store) => (
                    <Card 
                      key={store.id} 
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        activeStore?.id === store.id ? 'ring-2 ring-amber-500 bg-amber-50' : 'bg-white'
                      }`}
                      onClick={() => setActiveStore(store)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{store.name}</h3>
                          {store.is_verified && (
                            <Badge className="bg-green-100 text-green-700">Verified</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{store.description}</p>
                        <p className="text-xs text-gray-500">{store.address}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products Management */}
            {activeStore && (
              <Card className="bg-white/60 backdrop-blur-sm border-amber-100">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-amber-600" />
                        Products - {activeStore.name}
                      </CardTitle>
                      <CardDescription>Manage your product listings</CardDescription>
                    </div>
                    
                    <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[525px]">
                        <DialogHeader>
                          <DialogTitle>Add New Product</DialogTitle>
                          <DialogDescription>
                            List a product with automatic discount calculation based on expiry date.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="product-name">Product Name</Label>
                            <Input
                              id="product-name"
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                              placeholder="Product name"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="product-description">Description</Label>
                            <Textarea
                              id="product-description"
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                              placeholder="Product description..."
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="product-category">Category</Label>
                              <Select
                                value={newProduct.category}
                                onValueChange={(value: ProductCategory) => setNewProduct({ ...newProduct, category: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category.value} value={category.value}>
                                      {category.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="product-price">Original Price ($)</Label>
                              <Input
                                id="product-price"
                                type="number"
                                step="0.01"
                                value={newProduct.original_price}
                                onChange={(e) => setNewProduct({ ...newProduct, original_price: e.target.value })}
                                placeholder="0.00"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="product-expiry">Expiry Date</Label>
                              <Input
                                id="product-expiry"
                                type="date"
                                value={newProduct.expiry_date}
                                onChange={(e) => setNewProduct({ ...newProduct, expiry_date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="product-quantity">Quantity</Label>
                              <Input
                                id="product-quantity"
                                type="number"
                                min="1"
                                value={newProduct.quantity_available}
                                onChange={(e) => setNewProduct({ ...newProduct, quantity_available: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsProductModalOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                              List Product
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No products listed yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {products.map((product) => {
                        const daysUntilExpiry = getDaysUntilExpiry(product.expiry_date);
                        return (
                          <Card key={product.id} className="bg-white">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-lg">{product.name}</h3>
                                    <Badge 
                                      variant="secondary" 
                                      className={getStatusBadge(product.status)}
                                    >
                                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                                    </Badge>
                                  </div>
                                  
                                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-500">Price:</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-green-600">
                                          ${product.current_price}
                                        </span>
                                        <span className="text-gray-500 line-through">
                                          ${product.original_price}
                                        </span>
                                      </div>
                                      <span className="text-red-600 font-semibold">
                                        {Math.round(product.discount_percentage)}% OFF
                                      </span>
                                    </div>
                                    
                                    <div>
                                      <span className="text-gray-500">Expires:</span>
                                      <div className="font-medium">
                                        {new Date(product.expiry_date).toLocaleDateString()}
                                      </div>
                                      <span className={`text-xs ${
                                        daysUntilExpiry <= 1 ? 'text-red-600' :
                                        daysUntilExpiry <= 3 ? 'text-orange-600' :
                                        'text-green-600'
                                      }`}>
                                        {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry} days left`}
                                      </span>
                                    </div>
                                    
                                    <div>
                                      <span className="text-gray-500">Quantity:</span>
                                      <div className="font-medium">{product.quantity_available}</div>
                                    </div>
                                    
                                    <div>
                                      <span className="text-gray-500">Listed:</span>
                                      <div className="font-medium">
                                        {new Date(product.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 ml-4">
                                  {product.status === 'active' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateProductStatus(product.id, 'removed')}
                                      >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Hide
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateProductStatus(product.id, 'sold')}
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                      >
                                        Mark Sold
                                      </Button>
                                    </>
                                  )}
                                  {product.status === 'removed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateProductStatus(product.id, 'active')}
                                      className="text-green-600 border-green-600 hover:bg-green-50"
                                    >
                                      Reactivate
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
