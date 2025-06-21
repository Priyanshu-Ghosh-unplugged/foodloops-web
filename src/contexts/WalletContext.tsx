import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { config, isAptosConfigured } from '@/config/env';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createAccount: () => Promise<void>;
  fundAccount: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if Aptos is configured
  if (!isAptosConfigured()) {
    console.warn('Aptos is not configured. Please set VITE_FOOD_LOOPS_MODULE_ADDRESS in your environment variables.');
  }

  // Load address from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('aptos_address');
    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, []);

  const createAccount = async () => {
    try {
      setIsLoading(true);
      // For now, we'll use a mock address - in a real implementation,
      // you would create an actual Aptos account
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      
      // Save to localStorage
      localStorage.setItem('aptos_address', mockAddress);
      
      setAddress(mockAddress);
      
      toast.success('New wallet created successfully!');
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const fundAccount = async () => {
    if (!address) {
      toast.error('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(config.aptosFaucetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          amount: 100000000, // 100 APT
        }),
      });

      if (response.ok) {
        toast.success('Account funded successfully!');
      } else {
        throw new Error('Failed to fund account');
      }
    } catch (error) {
      console.error('Error funding account:', error);
      toast.error('Failed to fund account');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!isAptosConfigured()) {
      toast.error('Aptos is not configured');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check if address exists in localStorage
      const savedAddress = localStorage.getItem('aptos_address');
      
      if (savedAddress) {
        setAddress(savedAddress);
        toast.success('Wallet connected successfully!');
      } else {
        // Create new account if none exists
        await createAccount();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    localStorage.removeItem('aptos_address');
    toast.success('Wallet disconnected');
  };

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    isLoading,
    connectWallet,
    disconnectWallet,
    createAccount,
    fundAccount,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 