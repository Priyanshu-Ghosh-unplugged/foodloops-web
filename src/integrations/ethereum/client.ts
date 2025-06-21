import { BrowserProvider, Contract, formatEther, formatUnits, parseUnits } from 'ethers';
import { config } from '@/config/env';

// Rewards Contract ABI - Basic ERC20 and rewards functionality
export const REWARDS_CONTRACT_ABI = [
  // ERC20 Standard Functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Rewards Specific Functions
  'function mintReward(address to, uint256 amount) external',
  'function getUserRewards(address user) view returns (uint256)',
  'function claimRewards() external',
  'function getRewardHistory(address user) view returns (uint256[])',
  'function getTotalRewardsDistributed() view returns (uint256)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event RewardMinted(address indexed to, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
];

export interface RewardHistory {
  amount: number;
  timestamp: number;
  transactionHash: string;
}

export interface UserRewards {
  balance: number;
  totalEarned: number;
  pendingRewards: number;
  history: RewardHistory[];
}

export interface RewardsStats {
  totalSupply: number;
  totalDistributed: number;
  totalUsers: number;
  averageReward: number;
}

class EthereumClient {
  private provider: BrowserProvider | null = null;
  private signer: any = null;
  private contract: Contract | null = null;

  async connect(): Promise<string> {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this feature.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Create provider and signer
      this.provider = new BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(config.ethereumChainId)) {
        await this.switchNetwork();
      }

      // Initialize contract
      if (config.rewardsContractAddress) {
        this.contract = new Contract(
          config.rewardsContractAddress,
          REWARDS_CONTRACT_ABI,
          this.signer
        );
      }

      return account;
    } catch (error) {
      console.error('Error connecting to Ethereum:', error);
      throw error;
    }
  }

  async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${config.ethereumChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await this.addNetwork();
      } else {
        throw switchError;
      }
    }
  }

  async addNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const networkParams = {
      chainId: `0x${config.ethereumChainId.toString(16)}`,
      chainName: config.ethereumNetwork === 'sepolia' ? 'Sepolia Testnet' : 'Ethereum Mainnet',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: [config.ethereumRpcUrl],
      blockExplorerUrls: [
        config.ethereumNetwork === 'sepolia' 
          ? 'https://sepolia.etherscan.io' 
          : 'https://etherscan.io'
      ],
    };

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkParams],
    });
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  async getAccount(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.provider) throw new Error('Provider not connected');
    
    const targetAddress = address || await this.getAccount();
    if (!targetAddress) throw new Error('No address provided');
    
    const balance = await this.provider.getBalance(targetAddress);
    return formatEther(balance);
  }

  async getTokenBalance(address?: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const targetAddress = address || await this.getAccount();
    if (!targetAddress) throw new Error('No address provided');
    
    const balance = await this.contract.balanceOf(targetAddress);
    return parseFloat(formatUnits(balance, 18));
  }

  async getUserRewards(address?: string): Promise<UserRewards> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const targetAddress = address || await this.getAccount();
    if (!targetAddress) throw new Error('No address provided');

    try {
      const [balance, totalEarned, pendingRewards] = await Promise.all([
        this.contract.balanceOf(targetAddress),
        this.contract.getUserRewards(targetAddress),
        this.contract.getUserRewards(targetAddress), // This might need adjustment based on actual contract
      ]);

      return {
        balance: parseFloat(formatUnits(balance, 18)),
        totalEarned: parseFloat(formatUnits(totalEarned, 18)),
        pendingRewards: parseFloat(formatUnits(pendingRewards, 18)),
        history: [], // This would need to be implemented based on contract events
      };
    } catch (error) {
      console.error('Error getting user rewards:', error);
      return {
        balance: 0,
        totalEarned: 0,
        pendingRewards: 0,
        history: [],
      };
    }
  }

  async claimRewards(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    if (!this.signer) throw new Error('Signer not connected');

    try {
      const tx = await this.contract.claimRewards();
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  async transferRewards(to: string, amount: number): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    if (!this.signer) throw new Error('Signer not connected');

    try {
      const amountWei = parseUnits(amount.toString(), 18);
      const tx = await this.contract.transfer(to, amountWei);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error transferring rewards:', error);
      throw error;
    }
  }

  async getRewardsStats(): Promise<RewardsStats> {
    if (!this.contract) throw new Error('Contract not initialized');

    try {
      const [totalSupply, totalDistributed] = await Promise.all([
        this.contract.totalSupply(),
        this.contract.getTotalRewardsDistributed(),
      ]);

      return {
        totalSupply: parseFloat(formatUnits(totalSupply, 18)),
        totalDistributed: parseFloat(formatUnits(totalDistributed, 18)),
        totalUsers: 0, // This would need to be tracked separately or via events
        averageReward: 0, // This would need to be calculated
      };
    } catch (error) {
      console.error('Error getting rewards stats:', error);
      return {
        totalSupply: 0,
        totalDistributed: 0,
        totalUsers: 0,
        averageReward: 0,
      };
    }
  }

  async mintReward(to: string, amount: number): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    if (!this.signer) throw new Error('Signer not connected');

    try {
      const amountWei = parseUnits(amount.toString(), 18);
      const tx = await this.contract.mintReward(to, amountWei);
      const receipt = await tx.wait();
      return receipt.hash;
    } catch (error) {
      console.error('Error minting reward:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return !!this.signer;
  }

  getProvider(): BrowserProvider | null {
    return this.provider;
  }

  getSigner(): any {
    return this.signer;
  }

  getContract(): Contract | null {
    return this.contract;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const ethereumClient = new EthereumClient(); 