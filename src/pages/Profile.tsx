import React, { useState, useEffect } from 'react';
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
import { useUser } from '@civic/auth-web3/react';
import { toast } from 'sonner';

// Mock Data and Types
type UserRole = 'consumer' | 'seller';
type ProductCategory = 'dairy' | 'bakery' | 'meat' | 'produce' | 'pantry' | 'frozen' | 'beverages' | 'other';

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

const mockProfile: Profile = {
  id: 'mock-user-id',
  email: 'priyan@foodloops.com',
  full_name: 'Priyan Kumar',
  role: 'seller',
  avatar_url: 'https://github.com/shadcn.png',
  location: 'San Francisco, CA',
  phone: '555-123-4567',
  business_name: "Priyan's Fresh Finds",
  business_address: '123 Market St, San Francisco, CA'
};

const mockPreferences: UserPreferences = {
  preferred_categories: ['bakery', 'produce'],
  max_distance_km: 15,
  max_price: 4000,
  notification_enabled: true
};

const mockEcoScore: EcoScore = {
  total_items_saved: 78,
  total_money_saved: 16840,
  co2_saved_kg: 15.6,
  water_saved_liters: 3120
};


const ProfilePage = () => {
  const userContext = useUser();
  const user = userContext?.user;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [ecoScore, setEcoScore] = useState<EcoScore | null>(null);
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
      setProfile(mockProfile);
      setPreferences(mockPreferences);
      setEcoScore(mockEcoScore);
    } else {
      setProfile({
        ...mockProfile,
        id: String(user.sub),
        email: user.email || 'no-email@civic.com',
        full_name: user.name || 'Anonymous User',
        avatar_url: user.picture || `https://github.com/shadcn.png`,
      });
      setPreferences(mockPreferences);
      setEcoScore(mockEcoScore);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    toast.info('Profile update is temporarily disabled.');
    setTimeout(() => setSaving(false), 1000);
  };

  const handlePreferencesUpdate = async () => {
    setSaving(true);
    toast.info('Preferences update is temporarily disabled.');
    setTimeout(() => setSaving(false), 1000);
  };

  const handleRoleChange = async (newRole: UserRole) => {
    if (!profile) return;
    setProfile({ ...profile, role: newRole });
    toast.success(`Role changed to ${newRole}. (This is a mock response)`);
  };

  const getEcoLevel = (itemsSaved: number) => {
    if (itemsSaved >= 100) return { level: 'Eco Champion', color: 'text-green-600', icon: '🌟' };
    if (itemsSaved >= 50) return { level: 'Eco Hero', color: 'text-blue-600', icon: '🦸' };
    if (itemsSaved >= 20) return { level: 'Eco Warrior', color: 'text-purple-600', icon: '⚔️' };
    if (itemsSaved >= 5) return { level: 'Eco Friend', color: 'text-orange-600', icon: '🤝' };
    return { level: 'Eco Starter', color: 'text-gray-600', icon: '🌱' };
  };

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const ecoLevel = getEcoLevel(ecoScore?.total_items_saved || 0);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left sidebar */}
            <div className="w-full md:w-1/4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback>{profile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold">{profile.full_name}</h2>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <Badge className="mt-2" variant={profile.role === 'seller' ? 'destructive' : 'secondary'}>{profile.role}</Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Eco Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center text-2xl font-bold" style={{ color: ecoLevel.color }}>
                    {ecoLevel.icon} <span className="ml-2">{ecoLevel.level}</span>
                  </div>
                  <div className="text-center mt-2 text-sm text-muted-foreground">
                    You've saved {ecoScore?.total_items_saved} items!
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Right content */}
            <div className="w-full md:w-3/4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile Details</TabsTrigger>
                <TabsTrigger value="preferences"><Settings className="w-4 h-4 mr-2" />Preferences</TabsTrigger>
                <TabsTrigger value="eco_score"><Leaf className="w-4 h-4 mr-2" />Eco Score</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="full-name">Full Name</Label>
                          <Input id="full-name" value={profile.full_name || ''} onChange={e => setProfile({...profile, full_name: e.target.value})} />
                        </div>
                        {/* More fields */}
                      </div>
                      <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-6">
                 {/* Preferences content, using mock data */}
              </TabsContent>

              <TabsContent value="eco_score" className="mt-6">
                 {/* EcoScore content, using mock data */}
              </TabsContent>

            </div>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfilePage;
