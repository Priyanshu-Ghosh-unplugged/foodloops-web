import React from 'react';
import { User } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SellerProfileProps {
  user: User;
}

const SellerProfile: React.FC<SellerProfileProps> = ({ user }) => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Seller Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.name}!</CardTitle>
          <CardDescription>Manage your products, view sales, and more.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You have access to all seller features.</p>
          <Link to="/seller-dashboard">
            <Button className="mt-4">Go to Seller Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerProfile; 