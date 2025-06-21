import React from 'react';
import Header from '@/components/Layout/Header';
import DashboardSidebar from '@/components/Dashboard/DashboardSidebar';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">{title}</h1>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {children}
          </div>
          <div className="space-y-8">
            <DashboardSidebar />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 