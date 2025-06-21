import React from 'react';
import Header from '@/components/Layout/Header';
import { CartDisplay } from '@/components/Cart/CartDisplay';

const CartPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
        <CartDisplay />
      </main>
    </div>
  );
};

export default CartPage; 