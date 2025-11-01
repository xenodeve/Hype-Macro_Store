import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};
