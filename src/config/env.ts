export const config = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  // Try different endpoints - the API might be using a different model or endpoint
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // MongoDB Configuration
  mongodbUri: import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/foodloops',
  
  // Civic Auth Configuration
  civicClientId: import.meta.env.VITE_CIVIC_CLIENT_ID || '584fc3e9-922e-4b13-95af-cd0a9ea42ba2',
  
  // Aptos Configuration
  aptosNetwork: import.meta.env.VITE_APTOS_NETWORK || 'devnet',
  aptosNodeUrl: import.meta.env.VITE_APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com',
  aptosFaucetUrl: import.meta.env.VITE_APTOS_FAUCET_URL || 'https://faucet.devnet.aptoslabs.com',
  foodLoopsModuleAddress: import.meta.env.VITE_FOOD_LOOPS_MODULE_ADDRESS || '0x1',
} as const;

export const isGeminiConfigured = () => {
  return !!config.geminiApiKey;
};

export const isAptosConfigured = () => {
  return !!config.foodLoopsModuleAddress;
};

export const isMongoDBConfigured = () => {
  return !!config.mongodbUri;
};

export const isCivicConfigured = () => {
  return !!config.civicClientId;
}; 