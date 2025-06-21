import React from 'react';
import { CivicLogin } from '@/components/Auth/CivicLogin';
import { useCivicAuth } from '@/contexts/CivicAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const CivicAuthDemo: React.FC = () => {
  const { user, aptosWallet, ethereumWallet, currentWalletType } = useCivicAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Civic Auth + Web3 Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure authentication with Civic Auth combined with Web3 wallet integration for Aptos and Ethereum
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Auth Component */}
          <div>
            <CivicLogin />
          </div>

          {/* Demo Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  What this integration provides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span>Civic Auth Authentication</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span>Aptos Wallet Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span>Ethereum Wallet Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span>MongoDB User Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span>Wallet Address Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span>Session Management</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current State</CardTitle>
                <CardDescription>
                  Real-time authentication and wallet status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Authentication:</span>
                    <Badge variant={user ? "default" : "secondary"}>
                      {user ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                  </div>
                  
                  {user && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">User:</span>
                          <span className="text-sm text-gray-600">{user.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Type:</span>
                          <Badge variant="outline">{user.user_type}</Badge>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Wallet Connections:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aptos:</span>
                      <Badge variant={aptosWallet ? "default" : "secondary"}>
                        {aptosWallet ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ethereum:</span>
                      <Badge variant={ethereumWallet ? "default" : "secondary"}>
                        {ethereumWallet ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active:</span>
                      <Badge variant={currentWalletType ? "default" : "secondary"}>
                        {currentWalletType || "None"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {aptosWallet && (
                  <div className="p-3 bg-blue-50 rounded text-sm">
                    <div className="font-medium text-blue-900">Aptos Wallet:</div>
                    <div className="font-mono text-blue-700 text-xs break-all">
                      {aptosWallet}
                    </div>
                  </div>
                )}

                {ethereumWallet && (
                  <div className="p-3 bg-purple-50 rounded text-sm">
                    <div className="font-medium text-purple-900">Ethereum Wallet:</div>
                    <div className="font-mono text-purple-700 text-xs break-all">
                      {ethereumWallet}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Use Cases</CardTitle>
                <CardDescription>
                  How this integration can be used
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">On-Chain Reviews:</h4>
                  <p className="text-sm text-gray-600">
                    Use Aptos wallet address to submit and verify on-chain product reviews
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Rewards System:</h4>
                  <p className="text-sm text-gray-600">
                    Use Ethereum wallet address for reward tokens and loyalty programs
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Seller Verification:</h4>
                  <p className="text-sm text-gray-600">
                    Verify seller identity using Civic Auth and wallet addresses
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Cross-Chain Operations:</h4>
                  <p className="text-sm text-gray-600">
                    Support both Aptos and Ethereum for different blockchain operations
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              How the integration works under the hood
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Frontend:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• React Context for state management</li>
                  <li>• Aptos Wallet Adapter integration</li>
                  <li>• Wagmi for Ethereum wallet connection</li>
                  <li>• Local storage for session persistence</li>
                  <li>• TypeScript for type safety</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Backend:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Express.js REST API</li>
                  <li>• MongoDB with Mongoose schemas</li>
                  <li>• Civic Auth middleware</li>
                  <li>• User profile management</li>
                  <li>• Wallet address storage</li>
                </ul>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Environment Configuration:</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div>CIVIC_CLIENT_ID=584fc3e9-922e-4b13-95af-cd0a9ea42ba2</div>
                <div>MONGODB_URI=your_mongodb_connection_string</div>
                <div>API_URL=http://localhost:3001</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CivicAuthDemo; 