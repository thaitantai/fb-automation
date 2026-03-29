import apiClient from '@/lib/axios';
import { AuthResponse } from '../types';

export interface AuthCredentials {
  email: string;
  password?: string;
  confirmPassword?: string;
}

export const authService = {
  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    // apiClient already returns response.data due to interceptor
    return response as unknown as AuthResponse;
  },
  register: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', credentials);
    return response as unknown as AuthResponse;
  },
  getMe: async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/auth/me');
    return response as unknown as AuthResponse;
  }
};
