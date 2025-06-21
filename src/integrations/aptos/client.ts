import { config } from '@/config/env';
import { AptosClient } from 'aptos';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import {
    Aptos,
    AptosConfig,
    Network,
    AccountAddress,
    InputSubmitTransactionData,
} from "@aptos-labs/ts-sdk";

// Types for rewards system
export interface UserRewards {
  available_points: number;
  total_earned: number;
}

// Types for reward catalog
export interface Reward {
  id: number;
  name: string;
  cost: number;
}

const client = new AptosClient(config.aptosNodeUrl || 'https://fullnode.devnet.aptoslabs.com/v1');
const aptosConfig = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(aptosConfig);

export const getConnectedWalletAddress = () => {
  const { account } = useAptosWallet();
  return account?.address?.toString() || null;
};

// Fetch user rewards from blockchain
export const getUserRewards = async (userAddress: string): Promise<UserRewards> => {
  const result = await client.view({
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_user_rewards`,
    type_arguments: [],
    arguments: [userAddress],
  });
  return { available_points: Number(result[0]), total_earned: Number(result[1]) };
};

// Redeem a reward by ID
export const redeemReward = async (userAddress: string, rewardId: number): Promise<{ success: boolean; message: string }> => {
  // This requires wallet signing, so should be called from a component with access to the wallet adapter
  // For now, just return a success message
  return { success: true, message: 'Reward redeemed successfully!' };
};

// Fetch all available rewards from blockchain
export const getRewards = async (): Promise<Reward[]> => {
  const result = await client.view({
    function: `${MODULE_ADDRESS}::${MODULE_NAME}::get_rewards`,
    type_arguments: [],
    arguments: [],
  });
  return result.map(([id, name, cost]: [number, string, number]) => ({ id: Number(id), name, cost: Number(cost) }));
};

// Types for our smart contract
export interface Review {
  id: string;
  user_address: string;
  rating: number;
  title: string;
  comment: string;
  category: string;
  timestamp: string;
  helpful_votes: string;
  reported: boolean;
}

export interface UserProfile {
  address: string;
  total_reviews: string;
  average_rating_given: string;
  helpful_votes_received: string;
  last_review_timestamp: string;
}

export interface GlobalStats {
  total_reviews: string;
  total_users: string;
  average_rating: string;
  categories: string[];
}

export interface CategoryStats {
  category: string;
  total_reviews: string;
  average_rating: string;
  reviews: string[];
}

// Use the an account address for the module owner
// a hex-encoded 32-byte Aptos account address, with or without a 0x prefix.
const MODULE_URL = 'https://fullnode.devnet.aptoslabs.com/v1';
const MODULE_ADDRESS = config.foodLoopsModuleAddress;
const MODULE_NAME = 'FoodLoops';

// Helper function to convert address to hex
export const addressToHex = (address: string): string => {
  if (address.startsWith('0x')) {
    return address;
  }
  return `0x${address}`;
};

// Helper function to convert hex to address
export const hexToAddress = (hex: string): string => {
  if (hex.startsWith('0x')) {
    return hex.slice(2);
  }
  return hex;
};

// Entry Functions (Write Operations) - These would need proper wallet integration
// For now, we'll provide the function signatures and basic structure

/**
 * Submit a new review to the blockchain
 * Note: This requires proper wallet integration with transaction signing
 */
export const submitReview = async (
  userAddress: string,
  rating: number,
  title: string,
  comment: string,
  category: string
): Promise<string> => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Create a transaction payload
  // 2. Sign it with the user's private key
  // 3. Submit it to the blockchain
  
  console.log('Submitting review:', { userAddress, rating, title, comment, category });
  
  // For now, return a mock transaction hash
  return '0x' + Math.random().toString(16).substr(2, 64);
};

/**
 * Vote on a review as helpful
 */
export const voteReviewHelpful = async (
  userAddress: string,
  reviewId: number
): Promise<string> => {
  console.log('Voting review helpful:', { userAddress, reviewId });
  return '0x' + Math.random().toString(16).substr(2, 64);
};

/**
 * Report a review as inappropriate
 */
export const reportReview = async (
  userAddress: string,
  reviewId: number
): Promise<string> => {
  console.log('Reporting review:', { userAddress, reviewId });
  return '0x' + Math.random().toString(16).substr(2, 64);
};

// View Functions (Read Operations) - Mock implementations for now

/**
 * Get a review by ID
 */
export const getReviewById = async (reviewId: number): Promise<Review | null> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting review by ID:', reviewId);
  return null;
};

/**
 * Get all reviews
 */
export const getAllReviews = async (): Promise<Review[]> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting all reviews');
  return [];
};

/**
 * Get reviews by user address
 */
export const getReviewsByUser = async (userAddress: string): Promise<Review[]> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting reviews by user:', userAddress);
  return [];
};

/**
 * Get reviews by category
 */
export const getReviewsByCategory = async (category: string): Promise<Review[]> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting reviews by category:', category);
  return [];
};

/**
 * Get recent reviews
 */
export const getRecentReviews = async (limit: number): Promise<Review[]> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting recent reviews, limit:', limit);
  return [];
};

/**
 * Get user profile
 */
export const getUserProfile = async (userAddress: string): Promise<UserProfile | null> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting user profile:', userAddress);
  return null;
};

/**
 * Get global statistics
 */
export const getGlobalStats = async (): Promise<GlobalStats | null> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting global stats');
  return null;
};

/**
 * Get top reviews (most helpful)
 */
export const getTopReviews = async (limit: number): Promise<Review[]> => {
  // Mock implementation - in real app, this would call the blockchain
  console.log('Getting top reviews, limit:', limit);
  return [];
};

// Utility functions

/**
 * Format timestamp to readable date
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get star rating display
 */
export const getStarRating = (rating: number): string => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
};

/**
 * Validate review data before submission
 */
export const validateReview = (rating: number, title: string, comment: string, category: string): string | null => {
  if (rating < 1 || rating > 5) {
    return 'Rating must be between 1 and 5';
  }
  if (!title.trim() || title.length > 100) {
    return 'Title must be between 1 and 100 characters';
  }
  if (!comment.trim() || comment.length > 1000) {
    return 'Comment must be between 1 and 1000 characters';
  }
  if (!category.trim() || category.length > 50) {
    return 'Category must be between 1 and 50 characters';
  }
  return null;
};

/**
 * Creates the UserRewards resource for a user.
 * Must be called once before a user can receive points.
 */
export async function registerUserRewards(signAndSubmitTransaction: any) {
    try {
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::register_user_rewards`,
            type_arguments: [],
            arguments: [],
        };

        const options = {
            max_gas_amount: 100000,
        };
        
        // Use the wallet's signAndSubmitTransaction function
        const response = await signAndSubmitTransaction(payload, options);
        
        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log('[AptosClient] User registered for rewards:', response.hash);
        return response.hash;
    } catch (error) {
        console.error('[AptosClient] Error registering user for rewards:', error);
        throw error;
    }
}

/**
 * Add a demo reward to the contract (admin function)
 */
export async function addDemoReward(signAndSubmitTransaction: any, name: string, cost: number) {
    try {
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::add_reward`,
            type_arguments: [],
            arguments: [name, cost],
        };

        const options = {
            max_gas_amount: 100000,
        };
        
        // Use the wallet's signAndSubmitTransaction function
        const response = await signAndSubmitTransaction(payload, options);
        
        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log('[AptosClient] Demo reward added:', response.hash);
        return response.hash;
    } catch (error) {
        console.error('[AptosClient] Error adding demo reward:', error);
        throw error;
    }
}

/**
 * Grant points to a user (admin function)
 */
export async function grantPoints(signAndSubmitTransaction: any, userAddress: string, points: number) {
    try {
        const payload = {
            type: "entry_function_payload",
            function: `${MODULE_ADDRESS}::${MODULE_NAME}::grant_points`,
            type_arguments: [],
            arguments: [userAddress, points.toString()], // Points must be a string for the bcs serializer
        };

        const options = {
            max_gas_amount: 100000,
        };
        
        const response = await signAndSubmitTransaction(payload, options);
        
        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log('[AptosClient] Points granted:', response.hash);
        return response.hash;
    } catch (error) {
        console.error('[AptosClient] Error granting points:', error);
        throw error;
    }
} 