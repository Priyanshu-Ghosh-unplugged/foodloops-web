import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { ethereumClient, UserRewards, RewardsStats } from '@/integrations/ethereum/client';
import { isEthereumConfigured } from '@/config/env';

interface EthereumWalletContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  getBalance: () => Promise<string>;
  getTokenBalance: () => Promise<number>;
  getUserRewards: () => Promise<UserRewards>;
  claimRewards: () => Promise<string>;
  transferRewards: (to: string, amount: number) => Promise<string>;
  getRewardsStats: () => Promise<RewardsStats>;
  mintReward: (to: string, amount: number) => Promise<string>;
}

const EthereumWalletContext = createContext<EthereumWalletContextType | undefined>(undefined);

export const useEthereumWallet = () => {
  const context = useContext(EthereumWalletContext);
  if (context === undefined) {
    throw new Error('useEthereumWallet must be used within an EthereumWalletProvider');
  }
  return context;
};

interface EthereumWalletProviderProps {
  children: ReactNode;
}

export const EthereumWalletProvider: React.FC<EthereumWalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if Ethereum is configured
  if (!isEthereumConfigured()) {
    console.warn('Ethereum is not configured. Please set VITE_REWARDS_CONTRACT_ADDRESS and VITE_WEB3MODAL_PROJECT_ID in your environment variables.');
  }

  // Load address from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('ethereum_address');
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setAddress(null);
          localStorage.removeItem('ethereum_address');
          toast.info('Wallet disconnected');
        } else {
          // User switched accounts
          const newAddress = accounts[0];
          setAddress(newAddress);
          localStorage.setItem('ethereum_address', newAddress);
          toast.success('Account switched');
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!isEthereumConfigured()) {
      toast.error('Ethereum is not configured');
      return;
    }

    try {
      setIsLoading(true);
      const account = await ethereumClient.connect();
      setAddress(account);
      localStorage.setItem('ethereum_address', account);
      toast.success('Ethereum wallet connected successfully!');
    } catch (error: any) {
      console.error('Error connecting Ethereum wallet:', error);
      toast.error(error.message || 'Failed to connect Ethereum wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    ethereumClient.disconnect();
    setAddress(null);
    localStorage.removeItem('ethereum_address');
    toast.success('Ethereum wallet disconnected');
  };

  const getBalance = async (): Promise<string> => {
    try {
      return await ethereumClient.getBalance();
    } catch (error: any) {
      console.error('Error getting balance:', error);
      if (error.message?.includes('ethers library not installed')) {
        toast.error('Ethereum functionality not available. Please install ethers library.');
      } else {
        toast.error('Failed to get balance');
      }
      return '0';
    }
  };

  const getTokenBalance = async (): Promise<number> => {
    try {
      return await ethereumClient.getTokenBalance();
    } catch (error: any) {
      console.error('Error getting token balance:', error);
      if (error.message?.includes('ethers library not installed')) {
        toast.error('Ethereum functionality not available. Please install ethers library.');
      } else {
        toast.error('Failed to get token balance');
      }
      return 0;
    }
  };

  const getUserRewards = async (): Promise<UserRewards> => {
    try {
      return await ethereumClient.getUserRewards();
    } catch (error: any) {
      console.error('Error getting user rewards:', error);
      if (error.message?.includes('ethers library not installed')) {
        toast.error('Ethereum functionality not available. Please install ethers library.');
      } else {
        toast.error('Failed to get user rewards');
      }
      return {
        balance: 0,
        totalEarned: 0,
        pendingRewards: 0,
        history: [],
      };
    }
  };

  const claimRewards = async (): Promise<string> => {
    try {
      const txHash = await ethereumClient.claimRewards();
      toast.success('Rewards claimed successfully!');
      return txHash;
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      if (error.message?.includes('ethers library not installed')) {
        toast.error('Ethereum functionality not available. Please install ethers library.');
      } else {
        toast.error(error.message || 'Failed to claim rewards');
      }
      throw error;
    }
  };

  const transferRewards = async (to: string, amount: number): Promise<string> => {
    try {
      const txHash = await ethereumClient.transferRewards(to, amount);
      toast.success('Rewards transferred successfully!');
      return txHash;
    } catch (error: any) {
      console.error('Error transferring rewards:', error);
      if (error.message?.includes('ethers library not installed')) {
        toast.error('Ethereum functionality not available. Please install ethers library.');
      } else {
        toast.error(error.message || 'Failed to transfer rewards');
      }
      throw error;
    }
  };

  const getRewardsStats = async (): Promise<RewardsStats> => {
    try {
      return await ethereumClient.getRewardsStats();
    } catch (error: any) {
      console.error('Error getting rewards stats:', error);
      if (error.message?.includes('ethers library not installed')) {
        toast.error('Ethereum functionality not available. Please install ethers library.');
      } else {
        toast.error('Failed to get rewards stats');
      }
      return {
        totalSupply: 0,
        totalDistributed: 0,
        totalUsers: 0,
        averageReward: 0,
      };
    }
  };

  const mintReward = async (to: string, amount: number): Promise<string> => {
    try {
      const txHash = await ethereumClient.mintReward(to, amount);
      toast.success('Reward minted successfully!');
      return txHash;
    } catch (error: any) {
      console.error('Error minting reward:', error);
      if (error.message?.includes('ethers library not installed')) {
        toast.error('Ethereum functionality not available. Please install ethers library.');
      } else {
        toast.error(error.message || 'Failed to mint reward');
      }
      throw error;
    }
  };

  const value: EthereumWalletContextType = {
    address,
    isConnected: !!address && ethereumClient.isConnected(),
    isLoading,
    connectWallet,
    disconnectWallet,
    getBalance,
    getTokenBalance,
    getUserRewards,
    claimRewards,
    transferRewards,
    getRewardsStats,
    mintReward,
  };

  return (
    <EthereumWalletContext.Provider value={value}>
      {children}
    </EthereumWalletContext.Provider>
  );
}; 