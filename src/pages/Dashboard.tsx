import React from 'react';
import { useUser } from '@civic/auth-web3/react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import DashboardContent from '@/components/Dashboard/DashboardContent';

const DashboardPage = () => {
  const { user } = useUser();

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name || 'Eco-Warrior'}! 🌱`}
      description="Here's a look at your sustainable journey with FoodLoops."
    >
      <DashboardContent />
    </DashboardLayout>
  );
};

export default DashboardPage;
