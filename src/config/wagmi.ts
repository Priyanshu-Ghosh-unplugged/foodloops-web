import { createConfig, http } from 'wagmi';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.VITE_WEB3MODAL_PROJECT_ID || 'your-project-id',
    }),
    coinbaseWallet({
      appName: 'FoodLoops',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [sepolia.id]: http(),
  },
}); 