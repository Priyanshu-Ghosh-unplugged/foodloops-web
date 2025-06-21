import React from 'react';
import { CartDisplay } from '@/components/Cart/CartDisplay';
import DashboardLayout from '@/components/Layout/DashboardLayout';

const CartPage = () => {
  return (
    <DashboardLayout
      title="Your Cart"
      description="Review the items in your cart and proceed to checkout."
    >
      <CartDisplay />
    </DashboardLayout>
  );
};

export default CartPage; 