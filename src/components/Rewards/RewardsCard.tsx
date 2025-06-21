
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Star, 
  Gift, 
  Coins,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { useUser } from '@civic/auth-web3/react';
import { toast } from 'sonner';

interface UserRewards {
  points_earned: number;
  points_redeemed: number;
  current_points: number;
  level_name: string;
  level_number: number;
  next_level_points: number;
  badges: string[];
}

const mockRewards: UserRewards = {
    points_earned: 150,
    points_redeemed: 50,
    current_points: 100,
    level_name: 'Eco Starter',
    level_number: 2,
    next_level_points: 200,
    badges: ['First Purchase', '5-Day Streak']
};

const RewardsCard = () => {
  const { user } = useUser();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setRewards(mockRewards);
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
    }
  }, [user]);

  const getLevelProgress = () => {
    if (!rewards) return 0;
    const currentLevelBase = (rewards.level_number - 1) * 100;
    const progressInLevel = rewards.points_earned - currentLevelBase;
    return (progressInLevel / 100) * 100;
  };

  const availableRewards = [
    { id: 1, name: '₹50 Discount Coupon', cost: 100, icon: Gift },
    { id: 2, name: '₹100 Discount Coupon', cost: 200, icon: Gift },
    { id: 3, name: 'Free Delivery', cost: 50, icon: Zap },
    { id: 4, name: '₹250 Discount Coupon', cost: 500, icon: Trophy }
  ];

  const handleRedeem = async (reward: any) => {
    if (!rewards || rewards.current_points < reward.cost) {
      toast.error('Insufficient points for this reward');
      return;
    }
    toast.info('Redeeming rewards is temporarily disabled.');
  };

  if (loading) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user || !rewards) {
    return (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
            <CardHeader>
                <CardTitle className="text-gray-800 dark:text-gray-200">Rewards</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-gray-600 dark:text-gray-400">Sign in to see your rewards!</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Rewards & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{rewards.current_points}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Points</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{rewards.points_earned}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary" className="bg-white/80 dark:bg-gray-700/80">
              Level {rewards.level_number}: {rewards.level_name}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.max(0, rewards.next_level_points - rewards.points_earned)} points to next level
            </span>
          </div>
          <Progress value={getLevelProgress()} className="h-3" />
        </div>

        {/* Badges */}
        {rewards.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1 text-gray-700 dark:text-gray-300">
              <Award className="w-4 h-4" />
              Badges Earned
            </h4>
            <div className="flex flex-wrap gap-2">
              {rewards.badges.map((badge, index) => (
                <Badge key={index} variant="outline" className="bg-white/50 dark:bg-gray-700/50">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Rewards */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <Target className="w-4 h-4" />
            Redeem Points
          </h4>
          <div className="space-y-2">
            {availableRewards.map((reward) => {
              const Icon = reward.icon;
              const canAfford = rewards.current_points >= reward.cost;
              
              return (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{reward.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Coins className="w-3 h-3" />
                      {reward.cost}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                    >
                      Redeem
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsCard;
