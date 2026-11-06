import { apiClient } from './api';
import type { ApiSuccessResponse, User } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<{ user: User; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ user: User }>>('/auth/register', payload);
    return { user: data.data.user, message: data.message };
  },

  async login(payload: LoginPayload): Promise<{ user: User; message?: string }> {
    const { data } = await apiClient.post<ApiSuccessResponse<{ user: User }>>('/auth/login', payload);
    return { user: data.data.user, message: data.message };
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ user: User }>>('/auth/me');
    return data.data.user;
  },
};
