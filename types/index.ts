// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  unit_type: string;
  package_size?: string;
  weight_grams?: number;
  dimensions_cm?: string;
  brand?: string;
  barcode?: string;
  source_type: "supplier" | "coop-produced" | "member" | "donation";
  supplier_id?: string;
  producer_name?: string;
  images: string[];
  storage_instructions?: string;
  shelf_life_days?: number;
  requires_refrigeration: boolean;
  is_fragile: boolean;
  coop_id: string;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  archived_reason?: string;
}

export interface ProductPrice {
  id: string;
  product_id: string;
  coop_id: string;
  cost_price: number;
  selling_price: number;
  profit_margin: number;
  is_current: boolean;
  effective_date: string;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  coop_id: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level?: number;
  expiry_date?: string;
  location?: string;
  batch_number?: string;
  last_restocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  parent_name: string | null;
  is_archived: boolean;
  children?: Category[];
  level?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  coop_id: string;
  is_active: boolean;
}

export interface ProductWithDetails {
  product: Product;
  current_price?: ProductPrice;
  inventory?: Inventory;
  category?: Category;
  supplier?: Supplier;
}

// Form Types
export interface ProductFormData {
  // Product fields
  name: string;
  description?: string;
  category_id: string;
  unit_type: string;
  package_size?: string;
  weight_grams?: string;
  dimensions_cm?: string;
  brand?: string;
  barcode?: string;
  source_type: "supplier" | "coop-produced" | "member" | "donation";
  supplier_id?: string;
  producer_name?: string;
  storage_instructions?: string;
  shelf_life_days?: string;
  requires_refrigeration: boolean;
  is_fragile: boolean;
  tags: string[];

  // Price fields
  cost_price: string;
  selling_price: string;

  // Inventory fields
  current_stock: string;
  min_stock_level: string;
  max_stock_level?: string;
  expiry_date?: string;
  location?: string;
  batch_number?: string;
}
