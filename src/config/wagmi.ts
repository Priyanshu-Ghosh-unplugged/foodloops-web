import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';
import { config as appConfig } from './env';

const projectId = appConfig.walletConnectProjectId;

if (!projectId) {
  console.warn('WalletConnect project ID is not set. Please set VITE_WALLETCONNECT_PROJECT_ID in your .env file.');
}

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({ projectId, showQrModal: true }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
}); 