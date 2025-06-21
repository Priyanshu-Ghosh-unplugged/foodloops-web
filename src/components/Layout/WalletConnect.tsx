import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Wallet, LogOut, Coins, Zap, ExternalLink } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useEthereumWallet } from '@/contexts/EthereumWalletContext';
import { toast } from 'sonner';

export const WalletConnect: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'aptos' | 'ethereum'>('aptos');
  
  // Aptos wallet
  const { 
    address: aptosAddress, 
    isConnected: isAptosConnected, 
    isLoading: isAptosLoading, 
    connectWallet: connectAptosWallet, 
    disconnectWallet: disconnectAptosWallet, 
    fundAccount 
  } = useWallet();

  // Ethereum wallet - with error handling
  let ethWalletHook;
  try {
    ethWalletHook = useEthereumWallet();
  } catch (error) {
    console.warn('Ethereum wallet context not available:', error);
    ethWalletHook = {
      address: null,
      isConnected: false,
      isLoading: false,
      connectWallet: async () => {
        toast.error('Ethereum functionality not available. Please install required dependencies.');
      },
      disconnectWallet: () => {},
      getBalance: async () => '0',
      getTokenBalance: async () => 0,
      claimRewards: async () => {
        toast.error('Ethereum functionality not available. Please install required dependencies.');
        throw new Error('Not available');
      },
    };
  }

  const {
    address: ethAddress,
    isConnected: isEthConnected,
    isLoading: isEthLoading,
    connectWallet: connectEthWallet,
    disconnectWallet: disconnectEthWallet,
    getBalance: getEthBalance,
    getTokenBalance: getEthTokenBalance,
    claimRewards,
  } = ethWalletHook;

  const formatAddress = (address: string) => {
    if (address.length > 10) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  const handleConnectAptos = async () => {
    try {
      await connectAptosWallet();
    } catch (error) {
      console.error('Error connecting Aptos wallet:', error);
      toast.error('Failed to connect Aptos wallet');
    }
  };

  const handleConnectEthereum = async () => {
    try {
      await connectEthWallet();
    } catch (error) {
      console.error('Error connecting Ethereum wallet:', error);
      toast.error('Failed to connect Ethereum wallet');
    }
  };

  const handleDisconnectAptos = () => {
    disconnectAptosWallet();
  };

  const handleDisconnectEthereum = () => {
    disconnectEthWallet();
  };

  const handleFundAccount = async () => {
    try {
      await fundAccount();
    } catch (error) {
      console.error('Error funding account:', error);
      toast.error('Failed to fund account');
    }
  };

  const handleClaimRewards = async () => {
    try {
      await claimRewards();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast.error('Failed to claim rewards');
    }
  };

  const getEtherscanUrl = (address: string) => {
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  const getAptosExplorerUrl = (address: string) => {
    return `https://explorer.aptoslabs.com/account/${address}?network=devnet`;
  };

  if (isAptosLoading || isEthLoading) {
    return (
      <Button variant="outline" disabled>
        <Wallet className="h-4 w-4 mr-2" />
        Connecting...
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'aptos' | 'ethereum')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="aptos" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Aptos
          </TabsTrigger>
          <TabsTrigger value="ethereum" className="text-xs">
            <Coins className="h-3 w-3 mr-1" />
            Ethereum
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aptos" className="mt-2">
          {isAptosConnected && aptosAddress ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleFundAccount}>
                <Coins className="h-4 w-4 mr-1" />
                Fund
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                <Wallet className="h-4 w-4 text-green-500" />
                <span className="text-sm font-mono">{formatAddress(aptosAddress)}</span>
                <a
                  href={getAptosExplorerUrl(aptosAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnectAptos}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnectAptos} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Aptos
            </Button>
          )}
        </TabsContent>

        <TabsContent value="ethereum" className="mt-2">
          {isEthConnected && ethAddress ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleClaimRewards}>
                <Coins className="h-4 w-4 mr-1" />
                Claim
              </Button>
              <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                <Wallet className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-mono">{formatAddress(ethAddress)}</span>
                <a
                  href={getEtherscanUrl(ethAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnectEthereum}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={handleConnectEthereum} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              Connect Ethereum
            </Button>
          )}
        </TabsContent>
      </Tabs>

      {/* Status indicators */}
      <div className="flex gap-1">
        {isAptosConnected && (
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Aptos
          </Badge>
        )}
        {isEthConnected && (
          <Badge variant="secondary" className="text-xs">
            <Coins className="h-3 w-3 mr-1" />
            ETH
          </Badge>
        )}
      </div>
    </div>
  );
}; 