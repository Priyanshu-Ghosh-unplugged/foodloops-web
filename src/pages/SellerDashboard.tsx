import React, { useState, useEffect } from 'react';
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
  IndianRupee, 
  TrendingUp,
  Users,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useUser } from '@civic/auth-web3/react';
import { toast } from 'sonner';

// Mock Data and Types
type ProductCategory = 'dairy' | 'bakery' | 'meat' | 'produce' | 'pantry' | 'frozen' | 'beverages' | 'other';
type ListingStatus = 'active' | 'sold' | 'expired' | 'removed';

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

const mockStores: Store[] = [
  { id: 'store-1', name: "Priyan's Fresh Finds", description: 'Your local source for discounted goods!', address: '123 Green Way', phone: '555-0101', email: 'contact@freshfinds.com', is_verified: true }
];

const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Organic Milk', description: 'Fresh whole milk, nearing expiry.', category: 'dairy', original_price: 320, current_price: 160, discount_percentage: 50, expiry_date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), quantity_available: 10, status: 'active', created_at: new Date().toISOString() },
  { id: 'prod-2', name: 'Sourdough Bread', description: 'Artisan sourdough, best by tomorrow.', category: 'bakery', original_price: 440, current_price: 220, discount_percentage: 50, expiry_date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(), quantity_available: 5, status: 'active', created_at: new Date().toISOString() }
];

const SellerDashboard = () => {
  const userContext = useUser();
  const user = userContext?.user;
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
    // We can still fetch stores with mock data even if user is not logged in.
    fetchStores();
  }, []);

  useEffect(() => {
    if (activeStore) {
      fetchProducts(activeStore.id);
    }
  }, [activeStore]);

  const fetchStores = async () => {
    setLoading(true);
    // Mock implementation
    setTimeout(() => {
      setStores(mockStores);
      if (mockStores.length > 0) {
        setActiveStore(mockStores[0]);
      }
      setLoading(false);
    }, 500);
  };

  const fetchProducts = async (storeId: string) => {
    // Mock implementation
    setProducts(mockProducts.filter(() => storeId === 'store-1'));
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Store creation is temporarily disabled.');
    setIsStoreModalOpen(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Product creation is temporarily disabled.');
    setIsProductModalOpen(false);
  };

  const updateProductStatus = async (productId: string, status: ListingStatus) => {
    toast.info('Updating product status is temporarily disabled.');
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
    return <div>Loading seller dashboard...</div>;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <Button onClick={() => setIsStoreModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Store
          </Button>
        </div>
        
        {stores.length > 1 && (
          <div className="mb-8">
            <Select onValueChange={(storeId) => setActiveStore(stores.find(s => s.id === storeId) || null)} defaultValue={activeStore?.id}>
              <SelectTrigger className="w-[280px]">
                <Store className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map(store => (
                  <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {activeStore ? (
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Store Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-4">
              <ProductManagementPanel
                store={activeStore}
                products={products}
                onAddProduct={() => setIsProductModalOpen(true)}
                onUpdateStatus={updateProductStatus}
                getDaysUntilExpiry={getDaysUntilExpiry}
                getStatusBadge={getStatusBadge}
              />
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <AnalyticsPanel />
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <StoreSettingsPanel store={activeStore} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-16">
            <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Stores Found</h2>
            <p className="text-gray-500 mb-4">Get started by creating your first store.</p>
            <Button onClick={() => setIsStoreModalOpen(true)}>Create Your First Store</Button>
          </div>
        )}

      </main>

      <CreateStoreModal 
        isOpen={isStoreModalOpen}
        onOpenChange={setIsStoreModalOpen}
        onSubmit={handleCreateStore}
        newStore={newStore}
        setNewStore={setNewStore}
      />
      <CreateProductModal
        isOpen={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSubmit={handleCreateProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        categories={categories}
      />
    </div>
  );
};

const ProductManagementPanel = ({ store, products, onAddProduct, onUpdateStatus, getDaysUntilExpiry, getStatusBadge }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>{store.name}'s Products</CardTitle>
        <CardDescription>Manage your product listings.</CardDescription>
      </div>
      <Button onClick={onAddProduct}>
        <Plus className="w-4 h-4 mr-2" />
        Add Product
      </Button>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">Expires In</th>
              <th className="p-2 text-right">Qty</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b">
                <td className="p-2">{p.name}</td>
                <td className="p-2"><Badge className={getStatusBadge(p.status)}>{p.status}</Badge></td>
                <td className="p-2 text-right">₹{p.current_price.toFixed(2)} <span className="line-through text-gray-400">₹{p.original_price.toFixed(2)}</span></td>
                <td className="p-2 text-right">{getDaysUntilExpiry(p.expiry_date)} days</td>
                <td className="p-2 text-right">{p.quantity_available}</td>
                <td className="p-2 text-right">
                  <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onUpdateStatus(p.id, 'removed')}><Trash2 className="w-4 h-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const AnalyticsPanel = () => (
  <Card>
      <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>This feature is coming soon!</CardDescription>
      </CardHeader>
      <CardContent>
          <p>Sales charts and performance metrics will be displayed here.</p>
      </CardContent>
  </Card>
);

const StoreSettingsPanel = ({ store }) => (
  <Card>
      <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>Manage your store details.</CardDescription>
      </CardHeader>
      <CardContent>
          <p>Editing for {store.name} is coming soon.</p>
      </CardContent>
  </Card>
);

const CreateStoreModal = ({ isOpen, onOpenChange, onSubmit, newStore, setNewStore }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Store</DialogTitle>
        <DialogDescription>Fill in the details to get your store up and running.</DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4 pt-4">
        <div className="space-y-1">
          <Label htmlFor="store-name">Store Name</Label>
          <Input id="store-name" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="store-desc">Description</Label>
          <Textarea id="store-desc" value={newStore.description} onChange={e => setNewStore({...newStore, description: e.target.value})} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="store-address">Address</Label>
          <Input id="store-address" value={newStore.address} onChange={e => setNewStore({...newStore, address: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="store-phone">Phone</Label>
            <Input id="store-phone" value={newStore.phone} onChange={e => setNewStore({...newStore, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="store-email">Email</Label>
            <Input id="store-email" type="email" value={newStore.email} onChange={e => setNewStore({...newStore, email: e.target.value})} />
          </div>
        </div>
        <Button type="submit" className="w-full">Create Store</Button>
      </form>
    </DialogContent>
  </Dialog>
);

const CreateProductModal = ({ isOpen, onOpenChange, onSubmit, newProduct, setNewProduct, categories }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Product</DialogTitle>
        <DialogDescription>Fill in the product details to list it in your store.</DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4 pt-4">
        <div className="space-y-1">
          <Label htmlFor="prod-name">Product Name</Label>
          <Input id="prod-name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="prod-desc">Description</Label>
          <Textarea id="prod-desc" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="prod-category">Category</Label>
            <Select value={newProduct.category} onValueChange={value => setNewProduct({...newProduct, category: value as ProductCategory})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="prod-price">Original Price</Label>
            <Input id="prod-price" type="number" step="0.01" value={newProduct.original_price} onChange={e => setNewProduct({...newProduct, original_price: e.target.value})} required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="prod-expiry">Expiry Date</Label>
            <Input id="prod-expiry" type="date" value={newProduct.expiry_date} onChange={e => setNewProduct({...newProduct, expiry_date: e.target.value})} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="prod-qty">Quantity</Label>
            <Input id="prod-qty" type="number" value={newProduct.quantity_available} onChange={e => setNewProduct({...newProduct, quantity_available: e.target.value})} required />
          </div>
        </div>
        <Button type="submit" className="w-full">List Product</Button>
      </form>
    </DialogContent>
  </Dialog>
);

export default SellerDashboard;
