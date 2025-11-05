import api from './api';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  stock?: number;
  category?: string;
  isActive?: boolean;
}

export interface CreateProductPayload {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  stock?: number;
  category?: string;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products');
    return response.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(payload: CreateProductPayload): Promise<Product> {
    const response = await api.post('/products', payload);
    return response.data;
  },

  async update(id: string, payload: Partial<CreateProductPayload>): Promise<Product> {
    const response = await api.put(`/products/${id}`, payload);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
