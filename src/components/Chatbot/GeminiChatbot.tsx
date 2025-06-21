import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2,
  Maximize2,
  Sparkles,
  AlertCircle,
  Bug
} from 'lucide-react';
import { toast } from 'sonner';
import { config, isGeminiConfigured } from '@/config/env';
import { testGeminiAPI } from '@/utils/gemini-test';
import { testCurrentEndpoint, testAllEndpoints } from '@/utils/gemini-debug';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'नमस्ते! I\'m your FoodLoops assistant. I can help you find near-expiry products, suggest recipes, and answer questions about reducing food waste. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    if (!isGeminiConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await fetch(`${config.geminiApiUrl}?key=${config.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful assistant for FoodLoops, an Indian website that helps reduce food waste by selling near-expiry products at discounted prices. 

Context about FoodLoops:
- We sell products from stores in Delhi, Mumbai, Bangalore and other Indian cities
- Products are discounted based on their expiry dates (dairy, meat, produce, bakery, frozen, pantry items)
- Prices are in Indian Rupees (₹)
- We help reduce food waste and offer eco-friendly shopping
- Users can earn rewards points and redeem them for discounts
- We have a community section for sharing recipes

Please respond in a helpful, friendly manner and include some Hindi words naturally (like namaste, dhanyawad, etc.). Focus on:
- Helping users find products
- Suggesting recipes for near-expiry ingredients
- Explaining our sustainability mission
- Providing information about Indian food storage and cooking
- Keep responses concise and helpful

User question: ${userMessage}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API error response:', errorData);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      } else {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          return 'Sorry, the AI assistant is not properly configured. Please contact support.';
        }
        if (error.message.includes('Content blocked')) {
          return 'Sorry, I cannot respond to that request. Please try asking something else.';
        }
        if (error.message.includes('API request failed')) {
          return 'Sorry, I\'m having trouble connecting to the AI service right now. Please try again in a moment. आप बाद में कोशिश कर सकते हैं।';
        }
      }
      return 'Sorry, I\'m having trouble connecting right now. Please try again in a moment. आप बाद में कोशिश कर सकते हैं।';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const botResponse = await callGeminiAPI(input.trim());
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDebugTest = async () => {
    console.log('🔍 Starting API debug test...');
    setLoading(true);
    
    try {
      // Test current endpoint first
      const currentResult = await testCurrentEndpoint();
      console.log('Current endpoint test result:', currentResult);
      
      if (!currentResult.success) {
        console.log('Current endpoint failed, testing all endpoints...');
        const allResults = await testAllEndpoints();
        console.log('All endpoints test results:', allResults);
        
        if (allResults.success) {
          toast.success(`Found working endpoint: ${allResults.workingEndpoint}`);
          // Update the config with the working endpoint
          console.log('Please update the API URL to:', allResults.workingEndpoint);
        } else {
          toast.error('No working endpoints found. Check API key and permissions.');
        }
      } else {
        toast.success('Current endpoint is working!');
      }
    } catch (error) {
      console.error('Debug test error:', error);
      toast.error('Debug test failed');
    } finally {
      setLoading(false);
    }
  };

  // Show configuration warning if API key is not set
  if (!isGeminiConfigured()) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Card className="w-80 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">AI Assistant Unavailable</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
              Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg z-50"
        size="lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    } bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-amber-200 dark:border-gray-600 shadow-xl`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-800 dark:text-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span>FoodLoops Assistant</span>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs">
              AI Powered
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDebugTest}
              disabled={loading}
              className="w-8 h-8 p-0 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              title="Debug API"
            >
              <Bug className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 p-0 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 p-0 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="flex flex-col h-full pb-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] p-3 rounded-lg text-sm ${
                    message.sender === 'user'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {message.content}
                </div>
                
                {message.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about products, recipes, or food tips..."
              className="flex-1 text-sm border-amber-200 dark:border-gray-600 focus:border-amber-400 dark:focus:border-amber-500"
              disabled={loading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default GeminiChatbot;
