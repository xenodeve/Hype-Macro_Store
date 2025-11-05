import api from './api';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface Address {
  fullName?: string;
  phone?: string;
  address?: string;
  district?: string;
  province?: string;
  postalCode?: string;
}

export interface CreateOrderPayload {
  orderId: string;
  items: OrderItem[];
  address?: Address;
  paymentMethod: string;
  subtotal: number;
}

export interface Order {
  _id: string;
  userId: string;
  orderId: string;
  items: OrderItem[];
  address?: Address;
  paymentMethod: string;
  subtotal: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.post('/orders', payload);
    return response.data;
  },

  async getByOrderId(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },
};
