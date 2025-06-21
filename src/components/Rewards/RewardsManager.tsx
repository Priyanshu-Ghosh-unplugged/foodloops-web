import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Wallet, 
  TrendingUp, 
  Users, 
  Gift, 
  Send, 
  History,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Define interfaces locally to avoid import issues
interface UserRewards {
  balance: number;
  totalEarned: number;
  pendingRewards: number;
  history: any[];
}

interface RewardsStats {
  totalSupply: number;
  totalDistributed: number;
  totalUsers: number;
  averageReward: number;
}

// Try to import Ethereum wallet context with fallback
let useEthereumWallet: any;

try {
  const ethWalletModule = require('@/contexts/EthereumWalletContext');
  useEthereumWallet = ethWalletModule.useEthereumWallet;
} catch (error) {
  console.warn('Ethereum wallet context not available:', error);
  useEthereumWallet = () => ({
    address: null,
    isConnected: false,
    isLoading: false,
    connectWallet: async () => {
      toast.error('Ethereum functionality not available. Please install required dependencies.');
    },
    disconnectWallet: () => {},
    getBalance: async () => '0',
    getTokenBalance: async () => 0,
    getUserRewards: async () => ({
      balance: 0,
      totalEarned: 0,
      pendingRewards: 0,
      history: [],
    }),
    claimRewards: async () => {
      toast.error('Ethereum functionality not available. Please install required dependencies.');
      throw new Error('Not available');
    },
    transferRewards: async () => {
      toast.error('Ethereum functionality not available. Please install required dependencies.');
      throw new Error('Not available');
    },
    getRewardsStats: async () => ({
      totalSupply: 0,
      totalDistributed: 0,
      totalUsers: 0,
      averageReward: 0,
    }),
    mintReward: async () => {
      toast.error('Ethereum functionality not available. Please install required dependencies.');
      throw new Error('Not available');
    },
  });
}

export const RewardsManager: React.FC = () => {
  const {
    address,
    isConnected,
    getBalance,
    getTokenBalance,
    getUserRewards,
    claimRewards,
    transferRewards,
    getRewardsStats,
    mintReward,
  } = useEthereumWallet();

  const [ethBalance, setEthBalance] = useState<string>('0');
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [userRewards, setUserRewards] = useState<UserRewards>({
    balance: 0,
    totalEarned: 0,
    pendingRewards: 0,
    history: [],
  });
  const [rewardsStats, setRewardsStats] = useState<RewardsStats>({
    totalSupply: 0,
    totalDistributed: 0,
    totalUsers: 0,
    averageReward: 0,
  });
  const [transferAddress, setTransferAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      loadData();
    }
  }, [isConnected, address]);

  const loadData = async () => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const [balance, tokenBal, rewards, stats] = await Promise.all([
        getBalance(),
        getTokenBalance(),
        getUserRewards(),
        getRewardsStats(),
      ]);

      setEthBalance(balance);
      setTokenBalance(tokenBal);
      setUserRewards(rewards);
      setRewardsStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!isConnected) {
      toast.error('Please connect your Ethereum wallet first');
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await claimRewards();
      toast.success(`Rewards claimed! Transaction: ${txHash.slice(0, 10)}...`);
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error claiming rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferRewards = async () => {
    if (!isConnected) {
      toast.error('Please connect your Ethereum wallet first');
      return;
    }

    if (!transferAddress || !transferAmount) {
      toast.error('Please enter both address and amount');
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > tokenBalance) {
      toast.error('Insufficient token balance');
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await transferRewards(transferAddress, amount);
      toast.success(`Rewards transferred! Transaction: ${txHash.slice(0, 10)}...`);
      setTransferAddress('');
      setTransferAmount('');
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error transferring rewards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintReward = async () => {
    if (!isConnected) {
      toast.error('Please connect your Ethereum wallet first');
      return;
    }

    if (!mintAddress || !mintAmount) {
      toast.error('Please enter both address and amount');
      return;
    }

    const amount = parseFloat(mintAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      const txHash = await mintReward(mintAddress, amount);
      toast.success(`Reward minted! Transaction: ${txHash.slice(0, 10)}...`);
      setMintAddress('');
      setMintAmount('');
      await loadData(); // Reload data
    } catch (error) {
      console.error('Error minting reward:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const getEtherscanUrl = (address: string) => {
    return `https://sepolia.etherscan.io/address/${address}`;
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Rewards Manager
          </CardTitle>
          <CardDescription>
            Connect your Ethereum wallet to manage rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please connect your Ethereum wallet to access rewards management
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Address:</Label>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0"
              >
                {copiedAddress ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <a
                href={getEtherscanUrl(address || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ETH Balance:</Label>
              <div className="text-2xl font-bold">{parseFloat(ethBalance).toFixed(4)} ETH</div>
            </div>
            <div className="space-y-2">
              <Label>Token Balance:</Label>
              <div className="text-2xl font-bold">{tokenBalance.toFixed(2)} REWARDS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userRewards.balance.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userRewards.totalEarned.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userRewards.pendingRewards.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              onClick={handleClaimRewards} 
              disabled={isLoading || userRewards.pendingRewards <= 0}
              className="w-full"
            >
              <Gift className="h-4 w-4 mr-2" />
              Claim Rewards
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Global Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Global Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Total Supply:</Label>
              <div className="text-xl font-semibold">
                {rewardsStats.totalSupply.toLocaleString()} REWARDS
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Distributed:</Label>
              <div className="text-xl font-semibold">
                {rewardsStats.totalDistributed.toLocaleString()} REWARDS
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total Users:</Label>
              <div className="text-xl font-semibold">
                {rewardsStats.totalUsers.toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Average Reward:</Label>
              <div className="text-xl font-semibold">
                {rewardsStats.averageReward.toFixed(2)} REWARDS
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Tabs defaultValue="transfer" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transfer">Transfer Rewards</TabsTrigger>
          <TabsTrigger value="mint">Mint Rewards</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Transfer Rewards
              </CardTitle>
              <CardDescription>
                Send rewards to another address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfer-address">Recipient Address</Label>
                <Input
                  id="transfer-address"
                  placeholder="0x..."
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-amount">Amount (REWARDS)</Label>
                <Input
                  id="transfer-amount"
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleTransferRewards} 
                disabled={isLoading || !transferAddress || !transferAmount}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                Transfer Rewards
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Mint Rewards
              </CardTitle>
              <CardDescription>
                Mint new rewards to an address (Admin only)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mint-address">Recipient Address</Label>
                <Input
                  id="mint-address"
                  placeholder="0x..."
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mint-amount">Amount (REWARDS)</Label>
                <Input
                  id="mint-amount"
                  type="number"
                  placeholder="0.00"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleMintReward} 
                disabled={isLoading || !mintAddress || !mintAmount}
                className="w-full"
              >
                <Coins className="h-4 w-4 mr-2" />
                Mint Rewards
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 