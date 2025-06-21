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
    email: '',
    operating_hours: {
      open: '09:00',
      close: '18:00',
      days_open: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'other' as ProductCategory,
    original_price: '',
    price: '',
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
  const { data: storesData, isLoading: storesLoading } = useQuery({
    queryKey: ['stores', sellerId],
    queryFn: () => apiClient.getStores({ seller_id: sellerId }),
    enabled: !!sellerId
  });
  const stores = storesData?.stores || [];

  // Fetch products for active store
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', activeStore?._id],
    queryFn: () => apiClient.getProducts({ store_id: activeStore?._id }),
    enabled: !!activeStore
  });
  const products = productsData?.products || [];

  // Set active store when stores are loaded
  useEffect(() => {
    if (stores.length > 0 && !activeStore) {
      setActiveStore(stores[0]);
    }
  }, [stores, activeStore]);

  // Create store mutation
  const createStoreMutation = useMutation({
    mutationFn: (storeData: any) => apiClient.createStore(storeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores', sellerId] });
      setIsStoreModalOpen(false);
      setNewStore({
        name: '', description: '', address: '', phone: '', email: '',
        operating_hours: { open: '09:00', close: '18:00', days_open: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
      });
      toast.success('Store created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create store');
      console.error('Error creating store:', error);
    }
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiClient.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', activeStore?._id] });
      setIsProductModalOpen(false);
      setNewProduct({
        name: '', description: '', category: 'other', original_price: '', price: '',
        expiry_date: '', quantity_available: '1', image_url: ''
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
    if (!user?.name || !user?.email) {
      toast.error('User information not available');
      return;
    }

    createStoreMutation.mutate({
      name: newStore.name,
      description: newStore.description,
      seller_id: sellerId,
      seller_name: user.name,
      seller_email: user.email,
      location: {
        type: 'Point',
        coordinates: [0, 0], // Placeholder
        address: newStore.address,
      },
      contact: {
        phone: newStore.phone,
        email: newStore.email
      },
      operating_hours: newStore.operating_hours,
      rating: 0,
      review_count: 0,
      total_products: 0
    });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore || !user?.name) {
      toast.error('Store or user information not available');
      return;
    }

    const originalPrice = parseFloat(newProduct.original_price);
    const price = parseFloat(newProduct.price);

    if (price >= originalPrice) {
      toast.error('Current price must be less than original price');
      return;
    }

    createProductMutation.mutate({
      name: newProduct.name,
      description: newProduct.description,
      price: price,
      original_price: originalPrice,
      category: newProduct.category,
      image_url: newProduct.image_url,
      quantity_available: parseInt(newProduct.quantity_available),
      expiry_date: newProduct.expiry_date,
      store_id: activeStore._id,
      seller_id: sellerId,
      seller_name: user.name,
      store_name: activeStore.name,
      location: activeStore.location,
      rating: 0,
      review_count: 0,
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
    <div className="min-h-screen">
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
                        placeholder="123 Main St, Anytown, USA"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="store-phone">Phone</Label>
                        <Input 
                          id="store-phone" 
                          value={newStore.phone} 
                          onChange={e => setNewStore({...newStore, phone: e.target.value})} 
                          placeholder="555-123-4567"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="store-email">Email</Label>
                        <Input 
                          id="store-email" 
                          type="email" 
                          value={newStore.email} 
                          onChange={e => setNewStore({...newStore, email: e.target.value})} 
                          placeholder="contact@store.com"
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

            {stores.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>You haven't created any stores yet. Add one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stores.map(store => (
                  <Card
                    key={store._id}
                    className={`cursor-pointer ${activeStore?._id === store._id ? 'border-amber-500' : ''}`}
                    onClick={() => setActiveStore(store)}
                  >
                    <CardHeader>
                      <CardTitle>{store.name}</CardTitle>
                      <CardDescription>{store.location.address}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{store.description}</p>
                      <div className="text-sm text-gray-500 mt-4">
                        <p>Phone: {store.contact.phone}</p>
                        <p>Email: {store.contact.email}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Products in {activeStore ? activeStore.name : 'Your Store'}
              </h2>
              <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!activeStore}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add a new product to your store: {activeStore?.name}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProduct} className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="product-desc">Description</Label>
                      <Textarea
                        id="product-desc"
                        value={newProduct.description}
                        onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="product-category">Category</Label>
                        <Select
                            value={newProduct.category}
                            onValueChange={(value: ProductCategory) => setNewProduct({ ...newProduct, category: value })}
                        >
                            <SelectTrigger id="product-category">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(cat => (
                                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="original-price">Original Price (₹)</Label>
                            <Input
                                id="original-price"
                                type="number"
                                value={newProduct.original_price}
                                onChange={e => setNewProduct({ ...newProduct, original_price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="current-price">Current Price (₹)</Label>
                            <Input
                                id="current-price"
                                type="number"
                                value={newProduct.price}
                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="product-quantity">Quantity</Label>
                        <Input
                          id="product-quantity"
                          type="number"
                          value={newProduct.quantity_available}
                          onChange={e => setNewProduct({ ...newProduct, quantity_available: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                          <Label htmlFor="product-expiry">Expiry Date</Label>
                          <Input
                              id="product-expiry"
                              type="date"
                              value={newProduct.expiry_date}
                              onChange={e => setNewProduct({ ...newProduct, expiry_date: e.target.value })}
                              required
                          />
                      </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="product-image">Image URL</Label>
                        <Input
                            id="product-image"
                            value={newProduct.image_url}
                            onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                            placeholder="https://example.com/image.png"
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={createProductMutation.isPending}>
                      {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {productsLoading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No products found for this store. Add one to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map(product => (
                  <Card key={product._id}>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                      <CardDescription>
                        <Badge>{product.category}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <img src={product.image_url || '/placeholder.svg'} alt={product.name} className="w-full h-32 object-cover rounded-md mb-4" />
                      <div className="flex justify-between items-center font-bold">
                        <p className="text-xl text-green-600">₹{product.price}</p>
                        <p className="text-sm text-gray-500 line-through">₹{product.original_price}</p>
                      </div>
                      <p className="text-sm text-gray-500">Expires: {new Date(product.expiry_date).toLocaleDateString()}</p>
                      <p className="text-sm">Quantity: {product.quantity_available}</p>
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
