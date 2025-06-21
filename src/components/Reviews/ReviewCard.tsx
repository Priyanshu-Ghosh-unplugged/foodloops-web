import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Flag, Star } from 'lucide-react';
import { Review, formatTimestamp, getStarRating } from '@/integrations/aptos/client';
import { useUser } from '@civic/auth-web3/react';
import { toast } from 'sonner';

interface ReviewCardProps {
  review: Review;
  onVote?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ 
  review, 
  onVote, 
  onReport 
}) => {
  const { user } = useUser();

  const handleVote = () => {
    if (!user) {
      toast.error('Please connect your wallet to vote');
      return;
    }
    onVote?.(review.id);
  };

  const handleReport = () => {
    if (!user) {
      toast.error('Please connect your wallet to report');
      return;
    }
    onReport?.(review.id);
  };

  const formatAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {review.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">
                  {getStarRating(review.rating)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({review.rating}/5)
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {review.category}
              </Badge>
            </div>
          </div>
          {review.reported && (
            <Badge variant="destructive" className="text-xs">
              Reported
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {review.comment}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>By: {formatAddress(review.user_address)}</span>
            <span>{formatTimestamp(review.timestamp)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVote}
              className="h-8 px-2"
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-xs">{review.helpful_votes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReport}
              className="h-8 px-2 text-red-500 hover:text-red-700"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 