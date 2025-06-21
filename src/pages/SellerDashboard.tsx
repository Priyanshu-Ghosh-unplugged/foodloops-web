import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  IndianRupee, 
  TrendingUp,
  Users,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useUser } from '@civic/auth-web3/react';
import { toast } from 'sonner';
import { apiClient, Store as StoreType, Product as ProductType } from '@/lib/api';

// Types
type ProductCategory = 'dairy' | 'bakery' | 'meat' | 'produce' | 'pantry' | 'frozen' | 'beverages' | 'other';

const SellerDashboard = () => {
  const userContext = useUser();
  const user = userContext?.user;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeStore, setActiveStore] = useState<StoreType | null>(null);
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
    current_price: '',
    expiry_date: '',
    quantity_available: '1',
    image_url: ''
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

  // Mock seller ID - in real app, this would come from user authentication
  const sellerId = 'seller_001';

  // Fetch stores
  const { data: stores = [], isLoading: storesLoading } = useQuery({
    queryKey: ['stores', sellerId],
    queryFn: () => apiClient.getStores({ seller_id: sellerId }),
    enabled: !!sellerId
  });

  // Fetch products for active store
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', sellerId],
    queryFn: () => apiClient.getProductsBySeller(sellerId),
    enabled: !!sellerId && !!activeStore
  });

  // Set active store when stores are loaded
  useEffect(() => {
    if (stores.length > 0 && !activeStore) {
      setActiveStore(stores[0]);
    }
  }, [stores, activeStore]);

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: (storeData: Omit<StoreType, '_id' | 'created_at' | 'updated_at'>) => 
      apiClient.createStore(storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores', sellerId] });
      setIsStoreModalOpen(false);
      setNewStore({ name: '', description: '', address: '', phone: '', email: '' });
      toast.success('Store created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create store');
      console.error('Error creating store:', error);
    }
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (productData: Omit<ProductType, '_id' | 'created_at' | 'updated_at'>) => 
      apiClient.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', sellerId] });
      setIsProductModalOpen(false);
      setNewProduct({ 
        name: '', 
        description: '', 
        category: 'other', 
        original_price: '', 
        current_price: '',
        expiry_date: '', 
        quantity_available: '1',
        image_url: ''
      });
      toast.success('Product created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create product');
      console.error('Error creating product:', error);
    }
  });

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.name) {
      toast.error('User information not available');
      return;
    }

    createStoreMutation.mutate({
      name: newStore.name,
      description: newStore.description,
      address: newStore.address,
      phone: newStore.phone || undefined,
      email: newStore.email || undefined,
      seller_id: sellerId,
      seller_name: user.name
    });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !user?.name) {
      toast.error('Store or user information not available');
      return;
    }

    const originalPrice = parseFloat(newProduct.original_price);
    const currentPrice = parseFloat(newProduct.current_price);

    if (currentPrice >= originalPrice) {
      toast.error('Current price must be less than original price');
      return;
    }

    createProductMutation.mutate({
      name: newProduct.name,
      description: newProduct.description || undefined,
      category: newProduct.category,
      original_price: originalPrice,
      current_price: currentPrice,
      expiry_date: newProduct.expiry_date,
      quantity_available: parseInt(newProduct.quantity_available),
      image_url: newProduct.image_url || undefined,
      seller_id: sellerId,
      seller_name: user.name,
      store_name: activeStore.name,
      store_address: activeStore.address,
      store_phone: activeStore.phone,
      store_email: activeStore.email
    });
  };

  if (storesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Seller Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your stores and products to help reduce food waste.
          </p>
        </div>

        <Tabs defaultValue="stores" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Your Stores</h2>
              <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Store
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Store</DialogTitle>
                    <DialogDescription>Create a new store to start selling products.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateStore} className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <Label htmlFor="store-name">Store Name</Label>
                      <Input 
                        id="store-name" 
                        value={newStore.name} 
                        onChange={e => setNewStore({...newStore, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="store-desc">Description</Label>
                      <Textarea 
                        id="store-desc" 
                        value={newStore.description} 
                        onChange={e => setNewStore({...newStore, description: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="store-address">Address</Label>
                      <Input 
                        id="store-address" 
                        value={newStore.address} 
                        onChange={e => setNewStore({...newStore, address: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="store-phone">Phone</Label>
                        <Input 
                          id="store-phone" 
                          value={newStore.phone} 
                          onChange={e => setNewStore({...newStore, phone: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="store-email">Email</Label>
                        <Input 
                          id="store-email" 
                          type="email" 
                          value={newStore.email} 
                          onChange={e => setNewStore({...newStore, email: e.target.value})} 
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={createStoreMutation.isPending}>
                      {createStoreMutation.isPending ? 'Creating...' : 'Create Store'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <Card key={store._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-gray-800 dark:text-gray-200">{store.name}</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                          {store.address}
                        </CardDescription>
                      </div>
                      <Badge variant={store.is_verified ? "default" : "secondary"}>
                        {store.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {store.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {store.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      {store.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Phone:</span>
                          <span className="text-gray-700 dark:text-gray-300">{store.phone}</span>
                        </div>
                      )}
                      {store.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Email:</span>
                          <span className="text-gray-700 dark:text-gray-300">{store.email}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Your Products</h2>
              <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    disabled={!activeStore}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Fill in the product details to list it in your store.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProduct} className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <Label htmlFor="prod-name">Product Name</Label>
                      <Input 
                        id="prod-name" 
                        value={newProduct.name} 
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="prod-desc">Description</Label>
                      <Textarea 
                        id="prod-desc" 
                        value={newProduct.description} 
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="prod-category">Category</Label>
                        <Select value={newProduct.category} onValueChange={value => setNewProduct({...newProduct, category: value as ProductCategory})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="prod-quantity">Quantity</Label>
                        <Input 
                          id="prod-quantity" 
                          type="number" 
                          min="1"
                          value={newProduct.quantity_available} 
                          onChange={e => setNewProduct({...newProduct, quantity_available: e.target.value})} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="prod-original-price">Original Price (₹)</Label>
                        <Input 
                          id="prod-original-price" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={newProduct.original_price} 
                          onChange={e => setNewProduct({...newProduct, original_price: e.target.value})} 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="prod-current-price">Current Price (₹)</Label>
                        <Input 
                          id="prod-current-price" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          value={newProduct.current_price} 
                          onChange={e => setNewProduct({...newProduct, current_price: e.target.value})} 
                          required 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="prod-expiry">Expiry Date</Label>
                      <Input 
                        id="prod-expiry" 
                        type="datetime-local" 
                        value={newProduct.expiry_date} 
                        onChange={e => setNewProduct({...newProduct, expiry_date: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="prod-image">Image URL (optional)</Label>
                      <Input 
                        id="prod-image" 
                        type="url" 
                        value={newProduct.image_url} 
                        onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} 
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={createProductMutation.isPending}>
                      {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {productsLoading ? (
              <div className="text-center">Loading products...</div>
            ) : products.length === 0 ? (
              <Card className="text-center py-12 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                <CardContent>
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start by adding your first product</p>
                  <Button onClick={() => setIsProductModalOpen(true)}>Add Product</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product._id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-gray-800 dark:text-gray-200">{product.name}</CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400">
                            {product.category}
                          </CardDescription>
                        </div>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Price:</span>
                          <div className="text-right">
                            <div className="font-bold text-green-600 dark:text-green-400">
                              ₹{product.current_price.toFixed(2)}
                            </div>
                            <div className="text-sm line-through text-gray-500">
                              ₹{product.original_price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Quantity:</span>
                          <span className="text-sm font-medium">{product.quantity_available}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Discount:</span>
                          <span className="text-sm font-medium text-green-600">{product.discount_percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Expires:</span>
                          <span className="text-sm font-medium">
                            {new Date(product.expiry_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SellerDashboard;
