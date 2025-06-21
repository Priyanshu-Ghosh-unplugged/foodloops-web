export const config = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  // Try different endpoints - the API might be using a different model or endpoint
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  
  // Aptos Configuration
  aptosNetwork: import.meta.env.VITE_APTOS_NETWORK || 'devnet',
  aptosNodeUrl: import.meta.env.VITE_APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com',
  aptosFaucetUrl: import.meta.env.VITE_APTOS_FAUCET_URL || 'https://faucet.devnet.aptoslabs.com',
  foodLoopsModuleAddress: import.meta.env.VITE_FOOD_LOOPS_MODULE_ADDRESS || '0x1',
  
  // Ethereum Configuration
  ethereumNetwork: import.meta.env.VITE_ETHEREUM_NETWORK || 'sepolia',
  ethereumRpcUrl: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id',
  ethereumChainId: parseInt(import.meta.env.VITE_ETHEREUM_CHAIN_ID || '11155111'), // Sepolia
  rewardsContractAddress: import.meta.env.VITE_REWARDS_CONTRACT_ADDRESS || '',
  web3ModalProjectId: import.meta.env.VITE_WEB3MODAL_PROJECT_ID || '',
} as const;

export const isGeminiConfigured = () => {
  return !!config.geminiApiKey;
};

export const isAptosConfigured = () => {
  return !!config.foodLoopsModuleAddress;
};

export const isEthereumConfigured = () => {
  return !!config.rewardsContractAddress && !!config.web3ModalProjectId;
}; 