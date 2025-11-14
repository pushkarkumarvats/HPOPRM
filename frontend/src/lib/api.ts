import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  isDemoAccount, 
  authenticateDemoAccount, 
  MOCK_MARKET_DATA, 
  MOCK_CONTRACTS, 
  MOCK_ORDERS,
  MOCK_NOTIFICATIONS 
} from './demoAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        useAuthStore.getState().login(data.user, data.accessToken, data.refreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    // Check if it's a demo account
    if (isDemoAccount(email)) {
      try {
        const result = authenticateDemoAccount(email, password);
        return { data: result };
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
    // Otherwise use real API
    return api.post('/auth/login', { email, password });
  },
  register: (data: any) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const marketApi = {
  getPrices: async () => {
    const token = useAuthStore.getState().accessToken;
    if (token?.startsWith('demo-token-')) {
      return { data: MOCK_MARKET_DATA.prices };
    }
    return api.get('/market/prices');
  },
  getPriceHistory: (commodity: string, from: string, to: string) =>
    api.get('/market/price-history', { params: { commodity, from, to } }),
  getLatestPrice: (commodity: string) =>
    api.get('/market/latest-price', { params: { commodity } }),
};

export const tradingApi = {
  createOrder: (data: any) => api.post('/trading/orders', data),
  getOrders: async () => {
    const token = useAuthStore.getState().accessToken;
    if (token?.startsWith('demo-token-')) {
      return { data: MOCK_ORDERS };
    }
    return api.get('/trading/orders');
  },
  cancelOrder: (id: string) => api.delete(`/trading/orders/${id}`),
  getTrades: () => api.get('/trading/trades'),
};

export const contractsApi = {
  create: (data: any) => api.post('/contracts', data),
  getAll: async () => {
    const token = useAuthStore.getState().accessToken;
    if (token?.startsWith('demo-token-')) {
      return { data: MOCK_CONTRACTS };
    }
    return api.get('/contracts');
  },
  getById: (id: string) => api.get(`/contracts/${id}`),
  sign: (id: string, signature: string) =>
    api.post(`/contracts/${id}/sign`, { signature }),
};

export const aiApi = {
  getForecast: (commodity: string, horizonDays: number) =>
    api.get('/ai/forecast', { params: { commodity, horizon_days: horizonDays } }),
};

export const notificationsApi = {
  getAll: async () => {
    const token = useAuthStore.getState().accessToken;
    if (token?.startsWith('demo-token-')) {
      return { data: MOCK_NOTIFICATIONS };
    }
    return api.get('/notifications');
  },
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
};
