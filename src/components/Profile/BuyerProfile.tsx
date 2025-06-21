import React from 'react';
import { User } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BuyerProfileProps {
  user: User;
  becomeSeller: () => void;
  isBecomingSeller: boolean;
}

const BuyerProfile: React.FC<BuyerProfileProps> = ({ user, becomeSeller, isBecomingSeller }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Buyer Profile</CardTitle>
          <CardDescription>View your orders and account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This is where your buyer-specific information will be displayed.</p>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Become a Seller</CardTitle>
          <CardDescription>
            Ready to start selling your surplus food and reduce waste? Join our community of sellers!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => becomeSeller()} disabled={isBecomingSeller}>
            {isBecomingSeller ? 'Submitting Request...' : 'Become a Seller'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerProfile; 