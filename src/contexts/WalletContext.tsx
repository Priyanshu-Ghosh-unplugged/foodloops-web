import React, { createContext, useContext, ReactNode } from 'react';
import { AptosWalletAdapterProvider, useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  connectWallet: (walletName: string) => void;
  disconnectWallet: () => void;
  signAndSubmitTransaction: any;
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
  // Use the wallet adapter hook
  const {
    account,
    connected,
    connect,
    disconnect,
    signAndSubmitTransaction, // for contract calls
  } = useAptosWallet();

  const value: WalletContextType = {
    address: account?.address?.toString() || null,
    isConnected: connected,
    connectWallet: connect,
    disconnectWallet: disconnect,
    signAndSubmitTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Wrap your app with AptosWalletAdapterProvider at the root (e.g., in main.tsx or App.tsx):
// <AptosWalletAdapterProvider><WalletProvider>...</WalletProvider></AptosWalletAdapterProvider> 