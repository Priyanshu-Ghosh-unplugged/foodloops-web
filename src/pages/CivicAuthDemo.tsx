import { UserButton } from '@civic/auth-web3/react';
import React from 'react';

const CivicAuthDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Civic Auth Demo</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to sign in or view your profile.
        </p>
        <div className="flex justify-center">
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default CivicAuthDemo; 