import React, { useState, useEffect } from 'react';
import RewardsCard from '@/components/Rewards/RewardsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  products: { name: string, image_url: string | null };
}

export const mockRecentOrders: Order[] = [
    { id: 'order-1', created_at: new Date().toISOString(), total_price: 1000, status: 'Delivered', products: { name: 'Mixed Berry Yogurt', image_url: '/placeholder.svg' } },
    { id: 'order-2', created_at: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), total_price: 624, status: 'Delivered', products: { name: 'Croissants (x4)', image_url: '/placeholder.svg' } },
];

export const RecentOrdersSection = ({ orders }: { orders: Order[] }) => (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-amber-100 dark:border-gray-700">
        <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
                {orders.map(order => (
                    <li key={order.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <img 
                                src={order.products.image_url || '/placeholder.svg'} 
                                alt={order.products.name}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{order.products.name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                                <p className="text-sm text-green-600 dark:text-green-400 font-medium">₹{order.total_price}</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {order.status}
                        </Badge>
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);


const DashboardSidebar = () => {
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);

    useEffect(() => {
        setRecentOrders(mockRecentOrders);
    }, []);

    return (
        <div className="space-y-8">
            <RewardsCard />
            <RecentOrdersSection orders={recentOrders} />
        </div>
    );
};

export default DashboardSidebar; 