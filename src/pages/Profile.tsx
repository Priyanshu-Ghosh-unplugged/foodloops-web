import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Layout/Header';
import BuyerProfile from '@/components/Profile/BuyerProfile';
import SellerProfile from '@/components/Profile/SellerProfile';
import { apiClient, User } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUser } from '@civic/auth-web3/react';

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const civicUser = useUser();

  // Fetch user profile from our backend
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['userProfile'],
    queryFn: () => apiClient.getUserProfile(),
    enabled: !!civicUser.user, // Only run query if Civic user is loaded
  });

  // Mutation for becoming a seller
  const { mutate: becomeSeller, isPending: isBecomingSeller } = useMutation({
    mutationFn: apiClient.becomeSeller,
    onSuccess: (data) => {
      toast.success(data.message || 'Request to become a seller has been submitted!');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to become a seller. Please try again.');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500">Error loading profile: {error.message}</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p>Please log in to view your profile.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {user.user_type === 'seller' ? (
          <SellerProfile user={user} />
        ) : (
          <BuyerProfile user={user} becomeSeller={becomeSeller} isBecomingSeller={isBecomingSeller} />
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
