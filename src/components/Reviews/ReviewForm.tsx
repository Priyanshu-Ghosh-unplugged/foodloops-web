import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star } from 'lucide-react';
import { validateReview } from '@/integrations/aptos/client';
import { useWallet } from '@/contexts/WalletContext';
import { toast } from 'sonner';

interface ReviewFormProps {
  onSubmit: (rating: number, title: string, comment: string, category: string) => Promise<void>;
  isLoading?: boolean;
}

const CATEGORIES = [
  'restaurant',
  'grocery',
  'delivery',
  'cafe',
  'bakery',
  'farmers-market',
  'food-truck',
  'other'
];

export const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, isLoading = false }) => {
  const { isConnected } = useWallet();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet to submit a review');
      return;
    }

    const validationError = validateReview(rating, title, comment, category);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await onSubmit(rating, title, comment, category);
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setCategory('');
      
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${
            isFilled ? 'text-yellow-500' : 'text-gray-300'
          } hover:text-yellow-500`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star className="h-6 w-6 fill-current" />
        </button>
      );
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex items-center gap-2">
              {renderStars()}
              <span className="text-sm text-muted-foreground ml-2">
                {rating > 0 ? `${rating} out of 5` : 'Click to rate'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your experience"
              maxLength={100}
              required
            />
            <div className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Review</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed experience..."
              rows={4}
              maxLength={1000}
              required
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !isConnected}
          >
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect your wallet to submit a review
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}; 