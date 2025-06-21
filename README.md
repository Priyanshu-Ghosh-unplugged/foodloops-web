# 🍔 FoodLoops - Reduce Waste, Share Abundance

![FoodLoops Banner](public/mandala_background.jpg)

FoodLoops is a dynamic web application designed to combat food waste by connecting sellers of surplus food with conscientious buyers. Leveraging a dynamic pricing model, prices for items decrease as their expiration dates approach, ensuring that food gets sold rather than discarded.

## ✨ Key Features

- **Dynamic Pricing**: An intelligent algorithm automatically reduces item prices as they near their expiration date, maximizing the chance of a sale.
- **Dual User Roles**: Caters to both **Buyers** looking for great deals and **Sellers** (restaurants, bakeries, etc.) wanting to reduce surplus inventory.
- **Eco-Dashboard**: A personalized dashboard for users to track their positive environmental impact, including money saved, CO₂ emissions reduced, and water conserved.
- **Community Hub**: A social space for users to connect, share recipes, and exchange food-saving tips.
- **Web3 Integration**: Secure, decentralized authentication using [Civic Pass](https://www.civic.com/) and blockchain integration for future rewards and transactions.
- **Comprehensive Backend**: A robust Node.js/Express server to manage users, products, and orders.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn/UI
- **State Management**: TanStack Query
- **Web3**: Wagmi, Ethers.js, Civic Auth, WalletConnect
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Blockchain**:
    - **Rewards**: Solidity (Ethereum)
    - **Core Logic (WIP)**: Move (Aptos)
- **Tooling**: Hardhat, Vercel, ESLint, Prettier

## 🚀 Getting Started

Follow these instructions to get the FoodLoops application running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running.

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd foodloops-web
```

### 2. Set Up Environment Variables

The project uses environment variables for configuration. Create a `.env` file in the root of the project and add the following:

```env
# Get a free Project ID at https://cloud.walletconnect.com/
VITE_WALLETCONNECT_PROJECT_ID=

# You can get this from the Civic developer portal
VITE_CIVIC_CLIENT_ID=584fc3e9-922e-4b13-95af-cd0a9ea42ba2
```

The server also requires environment variables. Create a `.env` file in the `server/` directory:
```env
# Your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/foodloops

# A secret for signing JWTs (optional for local dev)
JWT_SECRET=your-jwt-secret
```

### 3. Install Dependencies

This project is a monorepo-style setup with separate dependencies for the root (frontend) and the server (backend).

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 4. Run the Application

To run both the frontend and backend servers concurrently, use the `dev:full` script from the root directory.

```bash
npm run dev:full
```
This will:
- Start the Vite frontend development server on `http://localhost:5173` (or the next available port).
- Start the Express backend server on `http://localhost:3001`.

## 📜 Available Scripts

### Root (`package.json`)
- `dev`: Starts the Vite frontend server.
- `build`: Builds the frontend for production.
- `build:dev`: Builds the frontend in development mode.
- `lint`: Lints the codebase.
- `server`: Starts the backend server directly.
- `dev:full`: Starts both frontend and backend servers concurrently.

### Server (`server/package.json`)
- `dev`: Starts the backend server with `nodemon` for auto-reloading.
- `start`: Starts the backend server.
- `seed`: Seeds the database with initial data.
- `update-prices`: Runs the script to update product prices based on the dynamic pricing model.

---

This project was bootstrapped with [Lovable](https://lovable.dev).
