# Civic Auth + Web3 Integration

This integration provides secure authentication with Civic Auth combined with Web3 wallet support for both Aptos and Ethereum blockchains.

## Features

- ✅ **Civic Auth Authentication**: Secure user authentication with Civic
- ✅ **Aptos Wallet Integration**: Connect and manage Aptos wallets
- ✅ **Ethereum Wallet Integration**: Connect and manage Ethereum wallets (MetaMask, WalletConnect, Coinbase)
- ✅ **MongoDB User Storage**: Persistent user data storage
- ✅ **Wallet Address Tracking**: Store and manage wallet addresses
- ✅ **Session Management**: Automatic session persistence and renewal
- ✅ **Cross-Chain Support**: Support for multiple blockchain networks

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Civic Auth
CIVIC_CLIENT_ID=584fc3e9-922e-4b13-95af-cd0a9ea42ba2

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# API
API_URL=http://localhost:3001

# Web3 (optional)
VITE_WEB3MODAL_PROJECT_ID=your_web3modal_project_id
```

### Backend Configuration

Create a `.env` file in the `server` directory:

```env
# Civic Auth
CIVIC_CLIENT_ID=584fc3e9-922e-4b13-95af-cd0a9ea42ba2

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Server
PORT=3001
NODE_ENV=development
```

## Usage

### Frontend

1. **Access the Demo**: Navigate to `/civic-auth` to see the integration in action
2. **Authentication Flow**:
   - Click "Get Started" to begin authentication
   - Choose to connect a wallet (Aptos or Ethereum) or continue with Civic Auth
   - Complete the authentication process
   - View your connected wallets and user information

3. **Using the Context**:

```tsx
import { useCivicAuth } from '@/contexts/CivicAuthContext';

const MyComponent = () => {
  const {
    isAuthenticated,
    user,
    aptosWallet,
    ethereumWallet,
    loginWithCivic,
    logout,
    connectAptosWallet,
    connectEthereumWallet
  } = useCivicAuth();

  // Use the authentication state and methods
};
```

### Backend

The backend provides RESTful APIs for user management:

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile (including wallet address)
- `POST /users/become-seller` - Convert user to seller

## Architecture

### Frontend Components

- **CivicAuthContext**: React context for state management
- **CivicLogin**: UI component for authentication
- **CivicAuthDemo**: Demo page showcasing the integration

### Backend Components

- **User Model**: MongoDB schema for user data
- **Auth Middleware**: Civic Auth verification
- **User Routes**: RESTful API endpoints

### Wallet Integration

- **Aptos**: Uses `@aptos-labs/wallet-adapter-react`
- **Ethereum**: Uses `wagmi` with multiple connectors

## Use Cases

1. **On-Chain Reviews**: Use Aptos wallet address for product reviews
2. **Rewards System**: Use Ethereum wallet for loyalty tokens
3. **Seller Verification**: Verify seller identity with Civic Auth
4. **Cross-Chain Operations**: Support multiple blockchain networks

## Development

### Starting the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Backend**:
   ```bash
   cd server
   npm install
   npm start
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```

4. **Access Demo**:
   - Frontend: http://localhost:5173/civic-auth
   - Backend: http://localhost:3001

### Testing

The integration includes:
- Session persistence testing
- Wallet connection testing
- API endpoint testing
- Error handling testing

## Security Features

- Civic Auth token verification
- Secure session management
- Wallet address validation
- MongoDB data encryption
- CORS protection
- Rate limiting

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**:
   - Ensure wallet extension is installed
   - Check network configuration
   - Verify wallet permissions

2. **Authentication Errors**:
   - Verify Civic Client ID
   - Check backend connectivity
   - Ensure environment variables are set

3. **Database Issues**:
   - Verify MongoDB connection string
   - Check database permissions
   - Ensure indexes are created

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 