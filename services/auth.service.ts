import type { 
  ILoginRequest, 
  ILoginResponse, 
  IRegisterRequest, 
  IRegisterResponse,
  IForgotPasswordResponse,
  IResetPasswordRequest,
  IResetPasswordResponse
} from '@/types';
import { api } from '@/lib';

export const authService = {
  login: async (credentials: ILoginRequest): Promise<ILoginResponse> => {
    try {
      const response = await api.post<ILoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (data: IRegisterRequest): Promise<IRegisterResponse> => {
    try {
      const response = await api.post<IRegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<IForgotPasswordResponse> => {
    try {
      const response = await api.post<IForgotPasswordResponse>(
        '/auth/forgot-password', 
        { email }
      );
      return response.data;
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  },

  resetPassword: async (data: IResetPasswordRequest): Promise<IResetPasswordResponse> => {
    try {
      const response = await api.post<IResetPasswordResponse>(
        '/auth/reset-password', 
        data
      );
      return response.data;
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  },
};