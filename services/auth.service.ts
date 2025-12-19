import type { 
  ILoginRequest, 
  ILoginResponse, 
  IRegisterRequest, 
  IRegisterResponse,
  IForgotPasswordResponse,
  IResetPasswordRequest,
  IResetPasswordResponse,
  IUserProfile,
  IUpdateProfileRequest,
  IChangePasswordRequest,
  IUser
} from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const authService = {
  login: async (credentials: ILoginRequest): Promise<ILoginResponse> => {
    try {
      const response = await api.post<ILoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  register: async (data: IRegisterRequest): Promise<IRegisterResponse> => {
    try {
      const response = await api.post<IRegisterResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
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
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
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
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getProfile: async (): Promise<IUserProfile> => {
    try {
      const response = await api.get<IUserProfile>('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get profile failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateProfile: async (data: IUpdateProfileRequest): Promise<IUser> => {
    try {
      const response = await api.patch<IUser>('/auth/profile', data);
      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  changePassword: async (data: IChangePasswordRequest): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/change-password', data);
      return response.data;
    } catch (error) {
      console.error('Change password failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  resendVerification: async (): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/resend-verification');
      return response.data;
    } catch (error) {
      console.error('Resend verification failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Email verification failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};