import { createConfig, http } from 'wagmi';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [mainnet, polygon, sepolia],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: 'your-project-id',
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