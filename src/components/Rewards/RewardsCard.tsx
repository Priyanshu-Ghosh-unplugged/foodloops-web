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
      // Mock fetch
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
      <Card>
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
        <Card>
            <CardHeader>
                <CardTitle>Rewards</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Sign in to see your rewards!</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          Rewards & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{rewards.current_points}</div>
            <div className="text-sm text-muted-foreground">Available Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{rewards.points_earned}</div>
            <div className="text-sm text-muted-foreground">Total Earned</div>
          </div>
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary">
              Level {rewards.level_number}: {rewards.level_name}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {Math.max(0, rewards.next_level_points - rewards.points_earned)} points to next level
            </span>
          </div>
          <Progress value={getLevelProgress()} className="h-2" />
        </div>

        {/* Badges */}
        {rewards.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Award className="w-4 h-4" />
              Badges Earned
            </h4>
            <div className="flex flex-wrap gap-2">
              {rewards.badges.map((badge, index) => (
                <Badge key={index} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Rewards */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
            <Target className="w-4 h-4" />
            Redeem Points
          </h4>
          <div className="space-y-2">
            {availableRewards.map((reward) => {
              const Icon = reward.icon;
              const canAfford = rewards.current_points >= reward.cost;
              
              return (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium">{reward.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm">
                      <Coins className="w-3 h-3" />
                      {reward.cost}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
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
