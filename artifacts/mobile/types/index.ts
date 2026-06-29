export interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  logo?: string;
  cover_image?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  phone?: string;
  delivery_fee: number;
  delivery_time: number;
  min_order: number;
  rating: number;
  is_open: boolean;
  status: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  business_id: string;
  is_available: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Cart {
  businessId: string;
  businessName: string;
  deliveryFee: number;
  items: CartItem[];
}

export interface Order {
  id: string;
  status: string;
  items: string;
  delivery_address: string;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  business_id: string;
  customer_id: string;
  notes?: string;
  rating?: number | null;
  review_comment?: string | null;
  created_date: string;
  updated_date: string;
}

export interface ParsedOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
