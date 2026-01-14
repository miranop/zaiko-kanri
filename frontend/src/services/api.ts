import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  User,
  Category,
  Product,
  CreateProductRequest,
  Warehouse,
  CreateWarehouseRequest,
  Stock,
  Transaction,
  StockMovementRequest,
  DashboardSummary,
} from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  me: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// Categories
export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  create: async (name: string): Promise<Category> => {
    const response = await api.post<Category>('/categories', { name });
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Products
export const productApi = {
  getAll: async (params?: { search?: string; category_id?: number }): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products', { params });
    return response.data;
  },
  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },
  create: async (data: CreateProductRequest): Promise<Product> => {
    const response = await api.post<Product>('/products', data);
    return response.data;
  },
  update: async (id: number, data: Partial<CreateProductRequest>): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// Warehouses
export const warehouseApi = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await api.get<Warehouse[]>('/warehouses');
    return response.data;
  },
  getById: async (id: number): Promise<Warehouse> => {
    const response = await api.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },
  create: async (data: CreateWarehouseRequest): Promise<Warehouse> => {
    const response = await api.post<Warehouse>('/warehouses', data);
    return response.data;
  },
  update: async (id: number, data: Partial<CreateWarehouseRequest>): Promise<Warehouse> => {
    const response = await api.put<Warehouse>(`/warehouses/${id}`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/warehouses/${id}`);
  },
};

// Stock
export const stockApi = {
  getAll: async (params?: { product_id?: number; warehouse_id?: number; search?: string }): Promise<Stock[]> => {
    const response = await api.get<Stock[]>('/stock', { params });
    return response.data;
  },
  stockIn: async (data: StockMovementRequest): Promise<{ message: string; transaction: Transaction }> => {
    const response = await api.post('/stock/in', data);
    return response.data;
  },
  stockOut: async (data: StockMovementRequest): Promise<{ message: string; transaction: Transaction }> => {
    const response = await api.post('/stock/out', data);
    return response.data;
  },
  getTransactions: async (params?: { product_id?: number; warehouse_id?: number; type?: string; limit?: number }): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/stock/transactions', { params });
    return response.data;
  },
};

// Dashboard
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
};
