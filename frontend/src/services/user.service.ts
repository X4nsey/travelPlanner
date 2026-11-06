import { apiClient } from './api';
import type { ApiSuccessResponse, User } from '@/types';

export interface UpdateProfilePayload {
  name: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const userService = {
  async getProfile(): Promise<User> {
    const { data } = await apiClient.get<ApiSuccessResponse<{ user: User }>>('/users/me');
    return data.data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<{ user: User; message?: string }> {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ user: User }>>('/users/me', payload);
    return { user: data.data.user, message: data.message };
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<{ message?: string }> {
    const { data } = await apiClient.patch<ApiSuccessResponse<{ updated: boolean }>>(
      '/users/me/password',
      payload
    );
    return { message: data.message };
  },
};
