
import React, { useState } from 'react';
import { useUser } from '@civic/auth-web3/react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save,
  Leaf,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  Package,
  Percent,
  Plus,
  Calendar,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

// Mock data - replace with actual API calls
const mockBuyerStats = {
  totalSaved: 25420,
  itemsSaved: 156,
  co2Reduced: 23.4,
  carbonFootprint: 87,
  totalOrders: 45,
  favoriteCategory: 'Produce',
  memberSince: '2023-06-15',
  loyaltyPoints: 2340
};

const mockSellerStats = {
  maxDiscountPercentage: 75,
  totalEarned: 45670,
  itemsSold: 234,
  co2Saved: 45.6,
  carbonFootprintReduced: 156,
  activeListings: 12,
  totalListings: 89,
  rating: 4.8,
  totalReviews: 67
};

const Profile = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    address: '123 Green Street, Eco City, EC 12345',
    bio: 'Passionate about reducing food waste and living sustainably.',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "text-amber-600" }: any) => (
    <Card className="stat-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-center mb-4">
          <Icon className={`w-8 h-8 ${color} icon-gold`} />
        </div>
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">{value}</div>
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout
      title="Profile"
      description="Manage your profile and view your sustainability impact"
    >
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="profile-section">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-brass-gradient flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {profileData.name || 'Welcome!'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {userType === 'buyer' ? 'Eco-Conscious Buyer' : 'Sustainable Seller'}
                </p>
                <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Member since {mockBuyerStats.memberSince}
                </Badge>
              </div>
            </div>
            <Button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="btn-brass"
            >
              {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {isEditing ? 'Save' : 'Edit Profile'}
            </Button>
          </CardHeader>
        </Card>

        {/* User Type Toggle */}
        <Tabs value={userType} onValueChange={(value) => setUserType(value as 'buyer' | 'seller')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="buyer">Buyer Profile</TabsTrigger>
            <TabsTrigger value="seller">Seller Profile</TabsTrigger>
          </TabsList>

          {/* Buyer Profile */}
          <TabsContent value="buyer" className="space-y-8">
            {/* Personal Information */}
            <Card className="profile-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 icon-gold" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/50 dark:bg-gray-800/50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    disabled={!isEditing}
                    className="bg-white/50 dark:bg-gray-800/50"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Buyer Statistics */}
            <Card className="profile-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 icon-gold" />
                  Your Sustainability Impact
                </CardTitle>
                <CardDescription>See how you're helping reduce food waste</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={IndianRupee}
                    title="Money Saved"
                    value={`₹${mockBuyerStats.totalSaved.toLocaleString()}`}
                    subtitle="through smart shopping"
                    color="text-green-600"
                  />
                  <StatCard
                    icon={ShoppingCart}
                    title="Items Saved"
                    value={mockBuyerStats.itemsSaved}
                    subtitle="from going to waste"
                    color="text-blue-600"
                  />
                  <StatCard
                    icon={Leaf}
                    title="CO₂ Reduced"
                    value={`${mockBuyerStats.co2Reduced} kg`}
                    subtitle="carbon emissions saved"
                    color="text-emerald-600"
                  />
                  <StatCard
                    icon={TrendingUp}
                    title="Carbon Footprint"
                    value={`${mockBuyerStats.carbonFootprint}%`}
                    subtitle="reduction achieved"
                    color="text-purple-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Buyer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Package}
                title="Total Orders"
                value={mockBuyerStats.totalOrders}
                subtitle="completed successfully"
                color="text-orange-600"
              />
              <StatCard
                icon={Award}
                title="Loyalty Points"
                value={mockBuyerStats.loyaltyPoints}
                subtitle="available to redeem"
                color="text-yellow-600"
              />
              <StatCard
                icon={Calendar}
                title="Favorite Category"
                value={mockBuyerStats.favoriteCategory}
                subtitle="most purchased"
                color="text-pink-600"
              />
            </div>
          </TabsContent>

          {/* Seller Profile */}
          <TabsContent value="seller" className="space-y-8">
            {/* Seller Settings */}
            <Card className="profile-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5 icon-gold" />
                  Seller Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Maximum Discount Percentage</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Set your maximum allowed discount</p>
                  </div>
                  <div className="text-3xl font-bold text-amber-600">{mockSellerStats.maxDiscountPercentage}%</div>
                </div>
                <Button className="btn-brass">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Listing
                </Button>
              </CardContent>
            </Card>

            {/* Seller Statistics */}
            <Card className="profile-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 icon-gold" />
                  Your Business Impact
                </CardTitle>
                <CardDescription>Track your contribution to reducing food waste</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    icon={IndianRupee}
                    title="Total Earned"
                    value={`₹${mockSellerStats.totalEarned.toLocaleString()}`}
                    subtitle="from sustainable sales"
                    color="text-green-600"
                  />
                  <StatCard
                    icon={Package}
                    title="Items Sold"
                    value={mockSellerStats.itemsSold}
                    subtitle="saved from waste"
                    color="text-blue-600"
                  />
                  <StatCard
                    icon={Leaf}
                    title="CO₂ Saved"
                    value={`${mockSellerStats.co2Saved} kg`}
                    subtitle="environmental impact"
                    color="text-emerald-600"
                  />
                  <StatCard
                    icon={TrendingUp}
                    title="Carbon Reduced"
                    value={`${mockSellerStats.carbonFootprintReduced}%`}
                    subtitle="footprint improvement"
                    color="text-purple-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Seller Performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={Package}
                title="Active Listings"
                value={mockSellerStats.activeListings}
                subtitle={`of ${mockSellerStats.totalListings} total`}
                color="text-orange-600"
              />
              <StatCard
                icon={Award}
                title="Store Rating"
                value={mockSellerStats.rating}
                subtitle={`${mockSellerStats.totalReviews} reviews`}
                color="text-yellow-600"
              />
              <StatCard
                icon={Calendar}
                title="This Month"
                value="15"
                subtitle="items sold"
                color="text-pink-600"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
