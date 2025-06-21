
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CivicAuthProvider } from '@civic/auth-web3/react';
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
import GeminiChatbot from "./components/Chatbot/GeminiChatbot";
import "./index.css";

const queryClient = new QueryClient();

// Your Civic Client ID
const civicClientId = 'c2d3cde1-4a1b-4b4f-9b5d-3b1a2d3c4e5f';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <CivicAuthProvider clientId={civicClientId}>
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
                  </Routes>
                  <GeminiChatbot />
                </BrowserRouter>
              </CartProvider>
            </EthereumWalletProvider>
          </WalletProvider>
        </CivicAuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
