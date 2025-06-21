import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { config } from '@/config/env';
import { apiClient } from '@/lib/api';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Types
export interface CivicUser {
  civic_user_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  wallet_address?: string;
  user_type: 'buyer' | 'seller' | 'admin';
  is_verified: boolean;
  preferences: {
    preferred_categories: string[];
    max_distance_km: number;
    max_price: number;
    notification_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  stats: {
    total_orders: number;
    total_spent: number;
    items_saved: number;
    co2_saved_kg: number;
    water_saved_liters: number;
    last_order_date?: string;
  };
  created_at: string;
  updated_at: string;
  last_login: string;
}

interface CivicAuthContextType {
  // Auth state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: CivicUser | null;
  
  // Wallet state
  aptosWallet: string | null;
  ethereumWallet: string | null;
  currentWalletType: 'aptos' | 'ethereum' | null;
  
  // Auth methods
  loginWithCivic: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  
  // Wallet methods
  connectAptosWallet: () => Promise<void>;
  connectEthereumWallet: () => Promise<void>;
  disconnectWallet: () => void;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

const CivicAuthContext = createContext<CivicAuthContextType | undefined>(undefined);

interface CivicAuthProviderProps {
  children: ReactNode;
}

export const CivicAuthProvider: React.FC<CivicAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<CivicUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aptosWallet, setAptosWallet] = useState<string | null>(null);
  const [ethereumWallet, setEthereumWallet] = useState<string | null>(null);
  const [currentWalletType, setCurrentWalletType] = useState<'aptos' | 'ethereum' | null>(null);

  // Aptos wallet hooks
  const { account, connected, disconnect: disconnectAptos } = useWallet();
  
  // Ethereum wallet hooks
  const { address: ethAddress, isConnected: ethConnected } = useAccount();
  const { connect: connectEth, connectors } = useConnect();
  const { disconnect: disconnectEth } = useDisconnect();

  // Initialize Civic Auth
  useEffect(() => {
    const initCivicAuth = async () => {
      if (!config.civicClientId) {
        console.warn('Civic Auth not configured');
        return;
      }

      // Check for existing session
      const session = localStorage.getItem('civic_session');
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          if (sessionData.user && sessionData.timestamp) {
            // Check if session is still valid (24 hours)
            const sessionAge = Date.now() - sessionData.timestamp;
            if (sessionAge < 24 * 60 * 60 * 1000) {
              setUser(sessionData.user);
              apiClient.setAuthHeaders({
                civic_user_id: sessionData.user.civic_user_id,
                email: sessionData.user.email,
                name: sessionData.user.name,
                avatar_url: sessionData.user.avatar_url
              });
            } else {
              localStorage.removeItem('civic_session');
            }
          }
        } catch (err) {
          console.error('Error parsing session:', err);
          localStorage.removeItem('civic_session');
        }
      }
    };

    initCivicAuth();
  }, []);

  // Handle Aptos wallet changes
  useEffect(() => {
    if (connected && account?.address) {
      const address = account.address.toString();
      setAptosWallet(address);
      setCurrentWalletType('aptos');
      
      // Update user wallet address if authenticated
      if (user) {
        updateUserWalletAddress(address);
      }
    } else {
      setAptosWallet(null);
      if (currentWalletType === 'aptos') {
        setCurrentWalletType(null);
      }
    }
  }, [connected, account?.address, user]);

  // Handle Ethereum wallet changes
  useEffect(() => {
    if (ethConnected && ethAddress) {
      setEthereumWallet(ethAddress);
      setCurrentWalletType('ethereum');
      
      // Update user wallet address if authenticated
      if (user) {
        updateUserWalletAddress(ethAddress);
      }
    } else {
      setEthereumWallet(null);
      if (currentWalletType === 'ethereum') {
        setCurrentWalletType(null);
      }
    }
  }, [ethConnected, ethAddress, user]);

  const updateUserWalletAddress = async (walletAddress: string) => {
    if (!user) return;

    try {
      const updatedUser = await apiClient.updateUserProfile({
        wallet_address: walletAddress
      });
      setUser(updatedUser);
      
      // Update session
      const session = {
        user: updatedUser,
        timestamp: Date.now()
      };
      localStorage.setItem('civic_session', JSON.stringify(session));
    } catch (err) {
      console.error('Error updating wallet address:', err);
    }
  };

  const loginWithCivic = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate Civic Auth flow
      // In a real implementation, this would integrate with Civic's SDK
      const mockCivicUser = {
        civic_user_id: `civic_${Date.now()}`,
        email: 'user@example.com',
        name: 'Demo User',
        avatar_url: 'https://via.placeholder.com/150'
      };

      // Set auth headers
      apiClient.setAuthHeaders(mockCivicUser);

      // Get or create user from backend
      const userData = await apiClient.getUserProfile();
      setUser(userData);

      // Save session
      const session = {
        user: userData,
        timestamp: Date.now()
      };
      localStorage.setItem('civic_session', JSON.stringify(session));

    } catch (err) {
      console.error('Civic login error:', err);
      setError('Failed to authenticate with Civic');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAptosWallet(null);
    setEthereumWallet(null);
    setCurrentWalletType(null);
    apiClient.clearAuthHeaders();
    localStorage.removeItem('civic_session');
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const userData = await apiClient.getUserProfile();
      setUser(userData);
      
      // Update session
      const session = {
        user: userData,
        timestamp: Date.now()
      };
      localStorage.setItem('civic_session', JSON.stringify(session));
    } catch (err) {
      console.error('Error refreshing user:', err);
      // If refresh fails, logout
      logout();
    }
  };

  const connectAptosWallet = async () => {
    try {
      // This will trigger the Aptos wallet connection
      // The wallet adapter will handle the connection flow
      console.log('Connecting to Aptos wallet...');
    } catch (err) {
      console.error('Error connecting Aptos wallet:', err);
      setError('Failed to connect Aptos wallet');
    }
  };

  const connectEthereumWallet = async () => {
    try {
      // Find MetaMask connector
      const metamaskConnector = connectors.find(
        connector => connector.name === 'MetaMask'
      );
      
      if (metamaskConnector) {
        connectEth({ connector: metamaskConnector });
      } else {
        setError('MetaMask not found');
      }
    } catch (err) {
      console.error('Error connecting Ethereum wallet:', err);
      setError('Failed to connect Ethereum wallet');
    }
  };

  const disconnectWallet = () => {
    if (currentWalletType === 'aptos') {
      disconnectAptos();
    } else if (currentWalletType === 'ethereum') {
      disconnectEth();
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: CivicAuthContextType = {
    isAuthenticated: !!user,
    isLoading,
    user,
    aptosWallet,
    ethereumWallet,
    currentWalletType,
    loginWithCivic,
    logout,
    refreshUser,
    connectAptosWallet,
    connectEthereumWallet,
    disconnectWallet,
    error,
    clearError
  };

  return (
    <CivicAuthContext.Provider value={value}>
      {children}
    </CivicAuthContext.Provider>
  );
};

export const useCivicAuth = () => {
  const context = useContext(CivicAuthContext);
  if (context === undefined) {
    throw new Error('useCivicAuth must be used within a CivicAuthProvider');
  }
  return context;
}; 