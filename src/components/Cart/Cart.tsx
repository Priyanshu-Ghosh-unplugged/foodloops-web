
import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-amber-500 to-orange-500">
            <CardTitle className="text-white">Shopping Cart</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex flex-col h-full p-0">
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <ShoppingBag className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">Your cart is empty</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 text-center">
                  Add some products to get started with your sustainable shopping journey!
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <img 
                        src={item.image_url || '/placeholder.svg'} 
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.stores.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-green-600 dark:text-green-400">₹{item.current_price}</span>
                          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs">
                            {Math.round(item.discount_percentage)}% OFF
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">Total:</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">₹{getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
