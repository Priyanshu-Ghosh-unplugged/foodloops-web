import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCivicAuth } from '@/contexts/CivicAuthContext';
import { config } from '@/config/env';

export const CivicLogin: React.FC = () => {
  const {
    isAuthenticated,
    isLoading,
    user,
    aptosWallet,
    ethereumWallet,
    currentWalletType,
    loginWithCivic,
    logout,
    connectAptosWallet,
    connectEthereumWallet,
    disconnectWallet,
    error,
    clearError
  } = useCivicAuth();

  const [showWalletOptions, setShowWalletOptions] = useState(false);

  const handleLogin = async () => {
    setShowWalletOptions(true);
  };

  const handleCivicLogin = async () => {
    await loginWithCivic();
    setShowWalletOptions(false);
  };

  const handleWalletConnect = async (type: 'aptos' | 'ethereum') => {
    try {
      if (type === 'aptos') {
        await connectAptosWallet();
      } else {
        await connectEthereumWallet();
      }
    } catch (err) {
      console.error(`Error connecting ${type} wallet:`, err);
    }
  };

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            Welcome, {user.name}!
          </CardTitle>
          <CardDescription>
            You're authenticated with Civic Auth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm text-gray-600">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User Type:</span>
              <Badge variant={user.user_type === 'seller' ? 'default' : 'secondary'}>
                {user.user_type}
              </Badge>
            </div>
            {user.wallet_address && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wallet:</span>
                <span className="text-sm text-gray-600 font-mono">
                  {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Connected Wallets:</h4>
            <div className="space-y-2">
              {aptosWallet && (
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm">Aptos</span>
                  <span className="text-xs font-mono text-blue-600">
                    {aptosWallet.slice(0, 6)}...{aptosWallet.slice(-4)}
                  </span>
                </div>
              )}
              {ethereumWallet && (
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                  <span className="text-sm">Ethereum</span>
                  <span className="text-xs font-mono text-purple-600">
                    {ethereumWallet.slice(0, 6)}...{ethereumWallet.slice(-4)}
                  </span>
                </div>
              )}
              {!aptosWallet && !ethereumWallet && (
                <p className="text-sm text-gray-500">No wallets connected</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!aptosWallet && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWalletConnect('aptos')}
                className="flex-1"
              >
                Connect Aptos
              </Button>
            )}
            {!ethereumWallet && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleWalletConnect('ethereum')}
                className="flex-1"
              >
                Connect Ethereum
              </Button>
            )}
          </div>

          {(aptosWallet || ethereumWallet) && (
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={logout}
            className="w-full"
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showWalletOptions) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Choose a wallet to connect with Civic Auth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => handleWalletConnect('aptos')}
              className="w-full justify-start"
            >
              <div className="w-6 h-6 bg-blue-500 rounded mr-2"></div>
              Connect Aptos Wallet
            </Button>
            <Button
              variant="outline"
              onClick={() => handleWalletConnect('ethereum')}
              className="w-full justify-start"
            >
              <div className="w-6 h-6 bg-purple-500 rounded mr-2"></div>
              Connect Ethereum Wallet
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-500">or</span>
          </div>

          <Button
            onClick={handleCivicLogin}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Authenticating...' : 'Continue with Civic Auth'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowWalletOptions(false)}
            className="w-full"
          >
            Back
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
              >
                ×
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🔐</span>
          </div>
          Civic Auth + Web3
        </CardTitle>
        <CardDescription>
          Connect your wallet and authenticate with Civic
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Civic Client ID: <code className="text-xs bg-gray-100 px-1 rounded">{config.civicClientId}</code>
          </p>
          <p className="text-sm text-gray-600">
            This integration allows you to:
          </p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Authenticate with Civic Auth</li>
            <li>• Connect Aptos or Ethereum wallets</li>
            <li>• Store wallet addresses in MongoDB</li>
            <li>• Use wallet addresses for blockchain interactions</li>
          </ul>
        </div>

        <Button
          onClick={handleLogin}
          className="w-full"
          size="lg"
        >
          Get Started
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 