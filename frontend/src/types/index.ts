export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description: string;
  category_id: number;
  category?: Category;
  unit: string;
  created_at: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export interface Stock {
  id: number;
  product_id: number;
  product?: Product;
  warehouse_id: number;
  warehouse?: Warehouse;
  quantity: number;
  updated_at: string;
}

export interface Transaction {
  id: number;
  product_id: number;
  product?: Product;
  warehouse_id: number;
  warehouse?: Warehouse;
  type: 'in' | 'out';
  quantity: number;
  note: string;
  user_id: number;
  user?: User;
  created_at: string;
}

export interface WarehouseStockSummary {
  warehouse_id: number;
  warehouse_name: string;
  total_items: number;
  total_quantity: number;
}

export interface CategoryStockSummary {
  category_id: number;
  category_name: string;
  total_items: number;
  total_quantity: number;
}

export interface DashboardSummary {
  total_products: number;
  total_warehouses: number;
  total_stock_value: number;
  low_stock_items: number;
  recent_transactions: Transaction[];
  stock_by_warehouse: WarehouseStockSummary[];
  stock_by_category: CategoryStockSummary[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description?: string;
  category_id?: number;
  unit: string;
}

export interface CreateWarehouseRequest {
  name: string;
  location?: string;
}

export interface StockMovementRequest {
  product_id: number;
  warehouse_id: number;
  quantity: number;
  note?: string;
}
