import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Gift, 
  Trophy,
  Award,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useWallet } from '@/contexts/WalletContext';
import { 
  getUserRewards, 
  getRewards, 
  redeemReward, 
  registerUserRewards, 
} from '@/integrations/aptos/client';

export const RewardsManager: React.FC = () => {
  const { address: walletAddress, isConnected, signAndSubmitTransaction } = useWallet();
  const [userRewards, setUserRewards] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<number | null>(null);

  const fetchAllData = async () => {
    if (isConnected && walletAddress) {
      try {
        setLoading(true);
        setError(null);
        
        const [rewardsData, userData] = await Promise.all([
          getRewards(),
          getUserRewards(walletAddress),
        ]);

        setRewards(rewardsData || []);
        setUserRewards(userData);
      } catch (err: any) {
        console.error("[RewardsManager] Error loading data:", err);
        if (err.message && err.message.includes("MISSING_DATA")) {
          // This indicates the UserRewards resource doesn't exist.
          // Let's not automatically register here anymore, let the user click a button.
           setError("User not registered for rewards. Please register to participate.");
           setUserRewards(null); // Explicitly set to null
        } else {
          setError("Failed to load rewards data. " + err.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [isConnected, walletAddress]);

  const handleRegister = async () => {
    try {
      toast.info("Registering for rewards...");
      await registerUserRewards(signAndSubmitTransaction);
      toast.success("Successfully registered for rewards!");
      await fetchAllData(); // Refetch all data after registration
    } catch (regError) {
      console.error("[RewardsManager] Error during registration:", regError);
      toast.error("Failed to register. Please try again.");
      setError("Failed to register for rewards. Please try again.");
    }
  };
  
  const handleRedeem = async (reward: any) => {
    if (!walletAddress) return;
    setRedeeming(reward.id);
    try {
      await redeemReward(signAndSubmitTransaction, reward.id);
      toast.success(`'${reward.name}' redeemed successfully!`);
      await fetchAllData();
    } catch (err) {
      toast.error('Failed to redeem reward.');
      console.error(err);
    } finally {
      setRedeeming(null);
    }
  };

  // --- UI Rendering ---

  if (!isConnected || !walletAddress) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" /> Rewards & Achievements</CardTitle>
          <CardDescription>Connect your Aptos wallet to view and manage your rewards.</CardDescription>
        </CardHeader>
        <CardContent><p>Please connect your wallet.</p></CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto"><CardHeader><CardTitle>Loading Rewards...</CardTitle></CardHeader><CardContent><p>Fetching on-chain data...</p></CardContent></Card>
    );
  }
  
  // If user is not registered, show a dedicated screen.
  if (error && error.includes("User not registered")) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Trophy className="h-6 w-6 text-yellow-500" /> Join the Rewards Program!</CardTitle>
          <CardDescription>Create your on-chain rewards account to start earning points.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="mb-4">{error}</p>
            <Button onClick={handleRegister}>
                <Sparkles className="mr-2 h-4"/> Create My Rewards Account
            </Button>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return <Card className="max-w-2xl mx-auto"><CardHeader><CardTitle className="text-red-500">An Error Occurred</CardTitle></CardHeader><CardContent><p>{error}</p></CardContent></Card>;
  }

  const totalPoints = userRewards?.total_earned ?? 0;
  const level = Math.floor(totalPoints / 100) + 1;
  const pointsForNextLevel = 100 - (totalPoints % 100);
  const progressToNextLevel = 100 - pointsForNextLevel;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Rewards & Achievements</h1>
      </div>
      
      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-900/30">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{userRewards?.available_points ?? 0}</div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">Available Points</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/30">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{totalPoints}</div>
            <p className="text-sm text-green-800 dark:text-green-200">Total Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="bg-purple-50 dark:bg-purple-900/30">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">Level {level}: Eco Starter</p>
            <p className="text-sm text-purple-800 dark:text-purple-200">{pointsForNextLevel} points to next level</p>
          </div>
          <Progress value={progressToNextLevel} className="[&>*]:bg-purple-600" />
        </CardContent>
      </Card>

      {/* Badges */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><Award className="h-5 w-5"/> Badges Earned</h2>
        <div className="flex gap-2">
          <Badge variant="outline">First Purchase</Badge>
          <Badge variant="outline">5-Day Streak</Badge>
          <Badge variant="outline">Community Helper</Badge>
        </div>
      </div>

      {/* Redeem Points */}
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><Coins className="h-5 w-5"/> Redeem Points</h2>
        <div className="space-y-2">
          {rewards.length === 0 ? (
            <p className="text-sm text-gray-500">No rewards available to redeem yet.</p>
          ) : (
            rewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Gift className="h-5 w-5 text-orange-500"/>
                    <div>
                      <p className="font-semibold">{reward.name}</p>
                      <p className="text-sm text-gray-500">{reward.cost} points</p>
                    </div>
                  </div>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700"
                    size="sm"
                    disabled={(userRewards?.available_points ?? 0) < reward.cost || redeeming === reward.id}
                    onClick={() => handleRedeem(reward)}
                  >
                    {redeeming === reward.id ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 