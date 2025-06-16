// Base Entity Interface
export interface BaseEntity {
  id: number;
}

// Client Interface (assuming basic details, expand as needed)
export interface Client extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Seller Interface (assuming basic details)
export interface Seller extends BaseEntity {
  name: string;
  zone?: string;
  phone?: string;
  email?: string;
}

// Product Interface
export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
}

// Order Interface
export interface Order extends BaseEntity {
  client_id: number;
  seller_id: number;
  date: string; // Assuming ISO date string e.g., "YYYY-MM-DD"
  total: number;
  // Optional: populated client/seller objects for easier display
  client?: Client;
  seller?: Seller;
}

// OrderDetail Interface
export interface OrderDetail extends BaseEntity {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  // Optional: populated product object for easier display
  product?: Product;
}

// For OrderFormPage state to manage products being added to an order
export interface ProductInOrder {
  productId: number;
  quantity: number;
  unitPrice: number; // Price at the time of adding to order
  name?: string; // For display purposes in the form
}
