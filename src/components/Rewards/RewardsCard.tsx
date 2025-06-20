
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

const RewardsCard = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRewards();
    }
  }, [user]);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setRewards(data || {
        points_earned: 0,
        points_redeemed: 0,
        current_points: 0,
        level_name: 'Eco Warrior',
        level_number: 1,
        next_level_points: 100,
        badges: []
      });
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

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

    try {
      const newPoints = rewards.current_points - reward.cost;
      const { error } = await supabase
        .from('user_rewards')
        .update({ 
          current_points: newPoints,
          points_redeemed: rewards.points_redeemed + reward.cost
        })
        .eq('user_id', user?.id);

      if (error) throw error;

      setRewards(prev => prev ? {
        ...prev,
        current_points: newPoints,
        points_redeemed: prev.points_redeemed + reward.cost
      } : null);

      toast.success(`${reward.name} redeemed successfully!`);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  if (loading || !rewards) {
    return (
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-amber-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <Trophy className="w-5 h-5 text-amber-600" />
          Rewards & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{rewards.current_points}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{rewards.points_earned}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Earned</div>
          </div>
        </div>

        {/* Level Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Level {rewards.level_number}: {rewards.level_name}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.max(0, rewards.next_level_points - rewards.points_earned)} points to next level
            </span>
          </div>
          <Progress value={getLevelProgress()} className="h-2" />
        </div>

        {/* Badges */}
        {rewards.badges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-1">
              <Award className="w-4 h-4" />
              Badges Earned
            </h4>
            <div className="flex flex-wrap gap-2">
              {rewards.badges.map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Rewards */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-1">
            <Target className="w-4 h-4" />
            Redeem Points
          </h4>
          <div className="space-y-2">
            {availableRewards.map((reward) => {
              const Icon = reward.icon;
              const canAfford = rewards.current_points >= reward.cost;
              
              return (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{reward.name}</span>
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
                      className={canAfford 
                        ? "bg-amber-500 hover:bg-amber-600 text-white" 
                        : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }
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
