import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Bell, 
  Heart,
  MapPin,
  Phone,
  Mail,
  Building,
  Leaf,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type ProductCategory = Database['public']['Enums']['product_category'];

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  location: string | null;
  phone: string | null;
  business_name: string | null;
  business_address: string | null;
}

interface UserPreferences {
  preferred_categories: ProductCategory[] | null;
  max_distance_km: number | null;
  max_price: number | null;
  notification_enabled: boolean | null;
}

interface EcoScore {
  total_items_saved: number;
  total_money_saved: number;
  co2_saved_kg: number;
  water_saved_liters: number;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    fetchProfile();
    fetchPreferences();
    fetchEcoScore();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPreferences(data || {
        preferred_categories: [],
        max_distance_km: 10,
        max_price: null,
        notification_enabled: true
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEcoScore = async () => {
    try {
      const { data, error } = await supabase
        .from('eco_scores')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setEcoScore(data || {
        total_items_saved: 0,
        total_money_saved: 0,
        co2_saved_kg: 0,
        water_saved_liters: 0
      });
    } catch (error) {
      console.error('Error fetching eco score:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          location: profile.location,
          phone: profile.phone,
          business_name: profile.business_name,
          business_address: profile.business_address
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          preferred_categories: preferences.preferred_categories,
          max_distance_km: preferences.max_distance_km,
          max_price: preferences.max_price,
          notification_enabled: preferences.notification_enabled
        });

      if (error) throw error;
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user?.id);

      if (error) throw error;
      
      setProfile({ ...profile, role: newRole });
      toast.success(`Role changed to ${newRole} successfully!`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const getEcoLevel = (itemsSaved: number) => {
    if (itemsSaved >= 100) return { level: 'Eco Champion', color: 'text-green-600', icon: '🌟' };
    if (itemsSaved >= 50) return { level: 'Eco Hero', color: 'text-blue-600', icon: '🦸' };
    if (itemsSaved >= 20) return { level: 'Eco Warrior', color: 'text-purple-600', icon: '⚔️' };
    if (itemsSaved >= 5) return { level: 'Eco Friend', color: 'text-orange-600', icon: '🤝' };
    return { level: 'Eco Starter', color: 'text-gray-600', icon: '🌱' };
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;
  }

  const ecoLevel = getEcoLevel(ecoScore?.total_items_saved || 0);

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
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xl">
                {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {profile.full_name || 'User Profile'}
              </h1>
              <div className="flex items-center gap-2">
                <Badge className={`${ecoLevel.color} bg-transparent`}>
                  {ecoLevel.icon} {ecoLevel.level}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {profile.role}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="impact">Impact</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-white/60 backdrop-blur-sm border-amber-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile information and account settings</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name || ''}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={profile.location || ''}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="Your city/location"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="Your phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Account Type</Label>
                    <Select value={profile.role} onValueChange={(value: UserRole) => handleRoleChange(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">Buyer</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {profile.role === 'seller' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="business_name">
                          <Building className="w-4 h-4 inline mr-1" />
                          Business Name
                        </Label>
                        <Input
                          id="business_name"
                          value={profile.business_name || ''}
                          onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                          placeholder="Your business name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="business_address">Business Address</Label>
                        <Input
                          id="business_address"
                          value={profile.business_address || ''}
                          onChange={(e) => setProfile({ ...profile, business_address: e.target.value })}
                          placeholder="Your business address"
                        />
                      </div>
                    </>
                  )}

                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="bg-white/60 backdrop-blur-sm border-amber-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-600" />
                  Shopping Preferences
                </CardTitle>
                <CardDescription>Customize your shopping experience and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Categories */}
                <div className="space-y-2">
                  <Label>Preferred Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categories.map((category) => (
                      <label key={category.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences?.preferred_categories?.includes(category.value) || false}
                          onChange={(e) => {
                            if (!preferences) return;
                            const currentCategories = preferences.preferred_categories || [];
                            const newCategories = e.target.checked
                              ? [...currentCategories, category.value]
                              : currentCategories.filter(cat => cat !== category.value);
                            setPreferences({
                              ...preferences,
                              preferred_categories: newCategories
                            });
                          }}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-sm">{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Distance */}
                <div className="space-y-2">
                  <Label htmlFor="max_distance">Maximum Distance (km)</Label>
                  <Input
                    id="max_distance"
                    type="number"
                    min="1"
                    max="100"
                    value={preferences?.max_distance_km || 10}
                    onChange={(e) => preferences && setPreferences({
                      ...preferences,
                      max_distance_km: parseInt(e.target.value)
                    })}
                  />
                </div>

                {/* Max Price */}
                <div className="space-y-2">
                  <Label htmlFor="max_price">Maximum Price ($)</Label>
                  <Input
                    id="max_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={preferences?.max_price || ''}
                    onChange={(e) => preferences && setPreferences({
                      ...preferences,
                      max_price: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    placeholder="No limit"
                  />
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Enable Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Get notified about new deals and updates</p>
                  </div>
                  <Switch
                    checked={preferences?.notification_enabled || false}
                    onCheckedChange={(checked) => preferences && setPreferences({
                      ...preferences,
                      notification_enabled: checked
                    })}
                  />
                </div>

                <Button 
                  onClick={handlePreferencesUpdate}
                  disabled={saving}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact">
            <div className="space-y-6">
              {/* Eco Level Card */}
              <Card className="bg-gradient-to-r from-green-500 to-emerald-500 border-none text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{ecoLevel.icon}</div>
                  <h2 className="text-2xl font-bold mb-2">{ecoLevel.level}</h2>
                  <p className="text-lg opacity-90">
                    You've saved {ecoScore?.total_items_saved || 0} items from waste!
                  </p>
                </CardContent>
              </Card>

              {/* Impact Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/60 backdrop-blur-sm border-amber-100 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">🛒</div>
                    <div className="text-2xl font-bold text-gray-800">{ecoScore?.total_items_saved || 0}</div>
                    <p className="text-sm text-gray-600">Items Saved</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-sm border-amber-100 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">💰</div>
                    <div className="text-2xl font-bold text-green-600">${ecoScore?.total_money_saved || 0}</div>
                    <p className="text-sm text-gray-600">Money Saved</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-sm border-amber-100 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">🌍</div>
                    <div className="text-2xl font-bold text-blue-600">{ecoScore?.co2_saved_kg || 0}kg</div>
                    <p className="text-sm text-gray-600">CO₂ Reduced</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-sm border-amber-100 text-center">
                  <CardContent className="p-6">
                    <div className="text-3xl mb-2">💧</div>
                    <div className="text-2xl font-bold text-cyan-600">{ecoScore?.water_saved_liters || 0}L</div>
                    <p className="text-sm text-gray-600">Water Saved</p>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <Card className="bg-white/60 backdrop-blur-sm border-amber-100">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    Achievements
                  </CardTitle>
                  <CardDescription>Your eco-friendly milestones</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border-2 ${
                      (ecoScore?.total_items_saved || 0) >= 5 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="text-2xl mb-2">🌱</div>
                      <h3 className="font-semibold">First Steps</h3>
                      <p className="text-sm text-gray-600">Save your first 5 items</p>
                      <Badge className={`mt-2 ${
                        (ecoScore?.total_items_saved || 0) >= 5 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {(ecoScore?.total_items_saved || 0) >= 5 ? 'Unlocked' : 'Locked'}
                      </Badge>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      (ecoScore?.total_items_saved || 0) >= 20 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="text-2xl mb-2">⚔️</div>
                      <h3 className="font-semibold">Eco Warrior</h3>
                      <p className="text-sm text-gray-600">Save 20 items from waste</p>
                      <Badge className={`mt-2 ${
                        (ecoScore?.total_items_saved || 0) >= 20 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {(ecoScore?.total_items_saved || 0) >= 20 ? 'Unlocked' : 'Locked'}
                      </Badge>
                    </div>

                    <div className={`p-4 rounded-lg border-2 ${
                      (ecoScore?.total_items_saved || 0) >= 100 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="text-2xl mb-2">🌟</div>
                      <h3 className="font-semibold">Eco Champion</h3>
                      <p className="text-sm text-gray-600">Save 100 items from waste</p>
                      <Badge className={`mt-2 ${
                        (ecoScore?.total_items_saved || 0) >= 100 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {(ecoScore?.total_items_saved || 0) >= 100 ? 'Unlocked' : 'Locked'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
