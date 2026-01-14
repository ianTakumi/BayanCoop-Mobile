export interface Product {
  id: string;
  coop_id: string;
  name: string;
  description: string;
  category_id: string;
  unit_type: string;
  images: string[];
  status: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  archived_reason?: string;
}

export interface Attribute {
  attribute_id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  name: string;
  description: string;
  category_id: string;
  unit_type: string;
  images: string[];
  min_order_quantity: string;
  storage_requirements: string;
  attributes: SupplierProductAttribute[];
  created_at: string;
  updated_at: string;
  archived_at?: string;
  archived_reason?: string;
  status: string;
}

export interface SupplierProductAttribute {
  id?: string;
  product_id?: string;
  attribute_id: string;
  attribute_value: string;
  price: string;
  stock_quantity: string;
  sku?: string;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  desc: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  archived_reason?: string;
}

export interface Supplier {
  id: string;
  name: string;
  type: string;
  user_id: string;
  email: string;
  phone: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  region: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
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
