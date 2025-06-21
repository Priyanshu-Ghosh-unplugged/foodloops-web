import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Reviews() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>Reviews Disabled</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The on-chain review system has been removed. Please check out our rewards system and other features!</p>
        </CardContent>
      </Card>
    </div>
  );
} 