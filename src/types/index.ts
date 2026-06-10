export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  category: string;
  aisle_location: string;
  image_url: string;
  stock_qty: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  picked_qty: number;
  is_picked: boolean;
  is_verified: boolean;
  product?: Product;
}

export interface Order {
  id: number;
  order_number: string;
  store_id: number;
  customer_id: number;
  order_type: string;
  status: string;
  payment_method: string;
  total_value: number;
  sla_minutes: number;
  priority: string;
  sla_breach: boolean;
  tray_number: string;
  picker_id: number;
  packer_id: number;
  accepted_at: string;
  picking_started_at: string;
  picking_completed_at: string;
  packing_started_at: string;
  packing_completed_at: string;
  dispatched_at: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}
