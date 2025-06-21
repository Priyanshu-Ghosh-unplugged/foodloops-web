import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./config/wagmi";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CivicAuthProvider } from '@civic/auth-web3/react';
import { config } from "./config/env";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { EthereumWalletProvider } from "@/contexts/EthereumWalletContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Community from "./pages/Community";
import SellerDashboard from "./pages/SellerDashboard";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import CartPage from "./pages/CartPage";
import TransactionPage from './pages/TransactionPage';
import CivicAuthDemo from './pages/CivicAuthDemo';
import GeminiChatbot from "./components/Chatbot/GeminiChatbot";
import "./index.css";

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <CivicAuthProvider clientId={config.civicClientId}>
        <ThemeProvider>
          <TooltipProvider>
            <WalletProvider>
              <EthereumWalletProvider>
                <CartProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/seller" element={<SellerDashboard />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/transaction" element={<TransactionPage />} />
                      <Route path="/civic-auth" element={<CivicAuthDemo />} />
                    </Routes>
                    <GeminiChatbot />
                  </BrowserRouter>
                </CartProvider>
              </EthereumWalletProvider>
            </WalletProvider>
          </TooltipProvider>
        </ThemeProvider>
      </CivicAuthProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
