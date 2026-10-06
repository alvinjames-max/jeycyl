export type OrderStatus =
  | "pending"
  | "confirmed"
  | "paid"
  | "in_progress"
  | "ready"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "mpesa" | "cash" | "card";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface CakeVariant {
  id: number;
  cake_id: number;
  size: string;
  flavor?: string;
  price_modifier: number;
}

export interface Cake {
  id: number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_available: boolean;
  created_at: string;
  variants?: CakeVariant[];
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  cake_id: number;
  cake_variant_id?: number | null;
  quantity: number;
  unit_price: number;
  custom_message?: string;
  subtotal: number;
}

export interface Order {
  id: number;
  customer_id: number;
  status: OrderStatus;
  delivery_date?: string | null;
  delivery_address?: string;
  notes?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: PaymentMethod;
  transaction_ref?: string;
  status: PaymentStatus;
  paid_at?: string | null;
  created_at: string;
}

export interface CartItem {
  cake_id: number;
  cake_name: string;
  cake_image?: string;
  cake_variant_id?: number | null;
  variant_label?: string;
  quantity: number;
  unit_price: number;
  custom_message?: string;
}

export interface PricePreviewItemRequest {
  cake_id: number;
  cake_variant_id?: number | null;
  quantity: number;
}

export interface PricePreviewResponse {
  items: Array<{
    cake_id: number;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }>;
  total: number;
}

export interface CreateOrderPayload {
  customer_id: number;
  delivery_address: string;
  notes?: string;
  items: Array<{
    cake_id: number;
    cake_variant_id?: number | null;
    quantity: number;
    custom_message?: string;
  }>;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface CreateCakePayload {
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
}
