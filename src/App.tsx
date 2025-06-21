import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { QueryClient as WagmiQueryClient } from '@tanstack/react-query';
import { CivicAuthProvider } from '@/contexts/CivicAuthContext';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { EthereumWalletProvider } from "@/contexts/EthereumWalletContext";
import { CartProvider } from "@/contexts/CartContext";
import { wagmiConfig } from '@/config/wagmi';
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Community from "./pages/Community";
import SellerDashboard from "./pages/SellerDashboard";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import CivicAuthDemo from "./pages/CivicAuthDemo";
import GeminiChatbot from "./components/Chatbot/GeminiChatbot";
import "./index.css";

const queryClient = new QueryClient();
const wagmiQueryClient = new WagmiQueryClient();

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={wagmiQueryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <CivicAuthProvider>
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
                        <Route path="/civic-auth" element={<CivicAuthDemo />} />
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
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
