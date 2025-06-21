# On-Chain Feedback System for FoodLoops

This document describes the comprehensive on-chain feedback system implemented for the FoodLoops platform using Aptos blockchain technology.

## 🏗️ Architecture Overview

The feedback system consists of:

1. **Smart Contract** (`contract/sources/food_loops.move`) - On-chain data storage and logic
2. **Frontend Integration** - React components for user interaction
3. **Wallet Integration** - Aptos wallet connection and transaction signing
4. **API Layer** - TypeScript client for blockchain communication

## 📋 Smart Contract Features

### Data Structures

- **`Review`** - Individual review with rating, title, comment, category, and metadata
- **`ReviewStore`** - Global storage for all reviews
- **`UserProfile`** - User statistics and review history
- **`GlobalStats`** - Platform-wide statistics
- **`CategoryStats`** - Category-specific statistics

### Entry Functions (Write Operations)

1. **`submit_review`** - Submit a new review
   - Parameters: `rating`, `title`, `comment`, `category`
   - Validates input data
   - Updates global statistics
   - Creates user profile if needed
   - Emits `ReviewSubmittedEvent`

2. **`vote_review_helpful`** - Vote on a review as helpful
   - Parameters: `review_id`
   - Increments helpful votes counter
   - Emits `ReviewVotedEvent`

3. **`report_review`** - Report inappropriate content
   - Parameters: `review_id`
   - Marks review as reported
   - Emits `ReviewReportedEvent`

### View Functions (Read Operations)

1. **`get_review_by_id`** - Get specific review by ID
2. **`get_all_reviews`** - Get all reviews
3. **`get_reviews_by_user`** - Get reviews by user address
4. **`get_reviews_by_category`** - Get reviews by category
5. **`get_recent_reviews`** - Get recent reviews with limit
6. **`get_user_profile`** - Get user profile and statistics
7. **`get_global_stats`** - Get platform statistics
8. **`get_top_reviews`** - Get most helpful reviews

## 🎨 Frontend Components

### Core Components

1. **`ReviewForm`** (`src/components/Reviews/ReviewForm.tsx`)
   - Star rating system (1-5 stars)
   - Title and comment input with validation
   - Category selection dropdown
   - Form validation and submission

2. **`ReviewCard`** (`src/components/Reviews/ReviewCard.tsx`)
   - Displays individual review
   - Star rating visualization
   - Helpful vote and report buttons
   - User address and timestamp display

3. **`Reviews`** (`src/pages/Reviews.tsx`)
   - Main reviews page
   - Global statistics dashboard
   - Filtering and search functionality
   - Tabbed view (All, Recent, Top)

4. **`WalletConnect`** (`src/components/Layout/WalletConnect.tsx`)
   - Wallet connection interface
   - Account funding functionality
   - Address display and disconnect

### Context Providers

1. **`WalletProvider`** (`src/contexts/WalletContext.tsx`)
   - Manages Aptos wallet connection
   - Handles account creation and persistence
   - Provides wallet state throughout app

## 🔧 Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Aptos Configuration
VITE_APTOS_NETWORK=devnet
VITE_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com
VITE_APTOS_FAUCET_URL=https://faucet.devnet.aptoslabs.com
VITE_FOOD_LOOPS_MODULE_ADDRESS=0x1
```

### Contract Deployment

1. **Compile the contract:**
   ```bash
   npm run move:compile
   ```

2. **Run tests:**
   ```bash
   npm run move:test
   ```

3. **Publish to blockchain:**
   ```bash
   npm run move:publish
   ```

4. **Update environment variables** with the deployed module address

## 🚀 Usage Flow

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" in header
   - Create new account or use existing
   - Fund account if needed

2. **Submit Review**
   - Navigate to `/reviews`
   - Fill out review form
   - Select rating, category, and write review
   - Submit transaction

3. **Interact with Reviews**
   - Vote on helpful reviews
   - Report inappropriate content
   - Filter and search reviews

### For Developers

1. **Smart Contract Development**
   - Modify `contract/sources/food_loops.move`
   - Add new entry/view functions as needed
   - Update tests in `contract/tests/`

2. **Frontend Integration**
   - Use `@/integrations/aptos/client` for blockchain calls
   - Implement new UI components
   - Add new routes in `App.tsx`

## 🔒 Security Features

- **Input Validation** - All user inputs validated on-chain
- **Access Control** - Only authenticated users can submit reviews
- **Content Moderation** - Report system for inappropriate content
- **Immutable Data** - All reviews stored permanently on blockchain

## 📊 Data Model

### Review Structure
```typescript
interface Review {
  id: string;
  user_address: string;
  rating: number; // 1-5
  title: string; // max 100 chars
  comment: string; // max 1000 chars
  category: string; // max 50 chars
  timestamp: string;
  helpful_votes: string;
  reported: boolean;
}
```

### Categories
- restaurant
- grocery
- delivery
- cafe
- bakery
- farmers-market
- food-truck
- other

## 🧪 Testing

The smart contract includes comprehensive tests:

- Review submission and retrieval
- Multiple reviews handling
- Voting functionality
- Reporting system
- Global statistics
- User profiles

Run tests with:
```bash
npm run move:test
```

## 🔄 Future Enhancements

1. **Advanced Moderation** - Automated content filtering
2. **Review Rewards** - Token incentives for helpful reviews
3. **Business Verification** - Verified business badges
4. **Photo Uploads** - IPFS integration for images
5. **Review Responses** - Business owner responses
6. **Analytics Dashboard** - Advanced statistics and insights

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Fails**
   - Check Aptos network configuration
   - Ensure faucet is accessible
   - Verify environment variables

2. **Transaction Fails**
   - Check account balance
   - Verify gas fees
   - Ensure contract is deployed

3. **Data Not Loading**
   - Check module address configuration
   - Verify network connectivity
   - Check console for errors

### Debug Mode

Enable debug logging by setting:
```typescript
localStorage.setItem('debug', 'aptos:*');
```

## 📚 Resources

- [Aptos Documentation](https://aptos.dev/)
- [Move Language Reference](https://move-language.github.io/move/)
- [Aptos TypeScript SDK](https://github.com/aptos-labs/aptos-ts-sdk)
- [FoodLoops Project](https://github.com/your-repo/foodloops-web) 