import { config } from '@/config/env';

const API_BASE_URL = config.apiUrl;

// Types
export interface User {
  _id: string;
  civic_user_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  wallet_address?: string;
  user_type: 'buyer' | 'seller' | 'admin';
  is_verified: boolean;
  preferences: {
    preferred_categories: string[];
    max_distance_km: number;
    max_price: number;
    notification_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
  };
  stats: {
    total_orders: number;
    total_spent: number;
    items_saved: number;
    co2_saved_kg: number;
    water_saved_liters: number;
    last_order_date?: string;
  };
  created_at: string;
  updated_at: string;
  last_login: string;
}

export interface Order {
  _id: string;
  order_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    seller_id: string;
    seller_name: string;
    store_name: string;
  }>;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'wallet' | 'card' | 'upi' | 'cash';
  delivery_address?: string;
  delivery_instructions?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  eco_impact: {
    items_saved: number;
    co2_saved_kg: number;
    water_saved_liters: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  image_url: string;
  quantity_available: number;
  expiry_date: string;
  store_id: string;
  seller_id: string;
  seller_name: string;
  store_name: string;
  location: {
    type: string;
    coordinates: number[];
  };
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Store {
  _id: string;
  name: string;
  description: string;
  seller_id: string;
  seller_name: string;
  seller_email: string;
  location: {
    type: string;
    coordinates: number[];
    address: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  operating_hours: {
    open: string;
    close: string;
    days_open: string[];
  };
  rating: number;
  review_count: number;
  total_products: number;
  created_at: string;
  updated_at: string;
}

// API Client with Civic Auth headers
class ApiClient {
  private baseURL: string;
  private authHeaders: Record<string, string> = {};

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set Civic Auth headers
  setAuthHeaders(userData: {
    civic_user_id: string;
    email: string;
    name: string;
    avatar_url?: string;
  }) {
    this.authHeaders = {
      'civic_user_id': userData.civic_user_id,
      'email': userData.email,
      'name': userData.name,
      ...(userData.avatar_url && { 'avatar_url': userData.avatar_url })
    };
  }

  // Clear auth headers
  clearAuthHeaders() {
    this.authHeaders = {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.authHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string; message: string }>('/health');
  }

  // User endpoints
  async getUserProfile(): Promise<User> {
    return this.request<User>('/users/profile');
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async becomeSeller(): Promise<{ message: string; user_type: string }> {
    return this.request<{ message: string; user_type: string }>('/users/become-seller', {
      method: 'POST',
    });
  }

  async getUserOrders(page = 1, limit = 10): Promise<{
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/users/orders?page=${page}&limit=${limit}`);
  }

  async getUserStats(): Promise<User['stats'] & {
    recent_orders: number;
    member_since: string;
    last_order?: string;
  }> {
    return this.request('/users/stats');
  }

  async getUserPreferences(): Promise<User['preferences']> {
    return this.request('/users/preferences');
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<User['preferences']> {
    return this.request('/users/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Order endpoints
  async createOrder(orderData: {
    items: Order['items'];
    delivery_address?: string;
    delivery_instructions?: string;
    payment_method?: 'wallet' | 'card' | 'upi' | 'cash';
  }): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: Order['status'];
    payment_status?: Order['payment_status'];
    start_date?: string;
    end_date?: string;
  }): Promise<{
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/orders?${searchParams.toString()}`);
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}`);
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async updatePaymentStatus(orderId: string, payment_status: Order['payment_status']): Promise<Order> {
    return this.request<Order>(`/orders/${orderId}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ payment_status }),
    });
  }

  async getOrderStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    summary: {
      totalOrders: number;
      totalRevenue: number;
      totalItemsSaved: number;
      totalCo2Saved: number;
      totalWaterSaved: number;
      avgOrderValue: number;
    };
    statusDistribution: Array<{ _id: string; count: number }>;
    recentOrders: Array<{
      order_id: string;
      total_amount: number;
      status: string;
      created_at: string;
    }>;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value);
        }
      });
    }
    
    return this.request(`/orders/stats/summary?${searchParams.toString()}`);
  }

  async cancelOrder(orderId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Product endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    seller_id?: string;
    store_id?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort_by?: 'price' | 'rating' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/products?${searchParams.toString()}`);
  }

  async getProduct(productId: string): Promise<Product> {
    return this.request<Product>(`/products/${productId}`);
  }

  async createProduct(productData: Omit<Product, '_id' | 'created_at' | 'updated_at'>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(productId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  async getProductStats(): Promise<{
    totalProducts: number;
    totalStores: number;
    totalSellers: number;
    averagePrice: number;
    categoryDistribution: Array<{ _id: string; count: number }>;
    topRatedProducts: Product[];
  }> {
    return this.request('/products/stats');
  }

  // Store endpoints
  async getStores(params?: {
    page?: number;
    limit?: number;
    seller_id?: string;
    search?: string;
    sort_by?: 'rating' | 'created_at';
    sort_order?: 'asc' | 'desc';
  }): Promise<{
    stores: Store[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/stores?${searchParams.toString()}`);
  }

  async getStore(storeId: string): Promise<Store> {
    return this.request<Store>(`/stores/${storeId}`);
  }

  async createStore(storeData: Omit<Store, '_id' | 'created_at' | 'updated_at'>): Promise<Store> {
    return this.request<Store>('/stores', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  async updateStore(storeId: string, storeData: Partial<Store>): Promise<Store> {
    return this.request<Store>(`/stores/${storeId}`, {
      method: 'PUT',
      body: JSON.stringify(storeData),
    });
  }

  async deleteStore(storeId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/stores/${storeId}`, {
      method: 'DELETE',
    });
  }

  async getStoreStats(): Promise<{
    totalStores: number;
    totalSellers: number;
    averageRating: number;
    topRatedStores: Store[];
  }> {
    return this.request('/stores/stats');
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL); 