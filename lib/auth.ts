import type { 
  ILoginRequest, 
  ILoginResponse, 
  IRegisterRequest, 
  IRegisterResponse,
  IForgotPasswordResponse,
  IResetPasswordRequest,
  IResetPasswordResponse
} from '@/types/auth';
import api from './api';

export const setAuthCookie = (token: string, expiresIn: string) => {
  let seconds = 7 * 24 * 60 * 60;
  
  if (expiresIn) {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 'd': seconds = value * 24 * 60 * 60; break;
        case 'h': seconds = value * 60 * 60; break;
        case 'm': seconds = value * 60; break;
        case 's': seconds = value; break;
      }
    } else {
      const parsed = parseInt(expiresIn);
      if (!isNaN(parsed) && parsed > 0) {
        seconds = parsed;
      }
    }
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? '; Secure' : '';
  
  const cookieString = `auth-token=${token}; path=/; max-age=${seconds}; SameSite=Lax${secureFlag}`;
  
  document.cookie = cookieString;
};

export const removeAuthCookie = () => {
  document.cookie = 'auth-token=; path=/; max-age=0';
};

export const login = async (credentials: ILoginRequest): Promise<ILoginResponse> => {
  
  try {
    const response = await api.post<ILoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const register = async (data: IRegisterRequest): Promise<IRegisterResponse> => {
  try {
    const response = await api.post<IRegisterResponse>('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    removeAuthCookie();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }
};

export const forgotPassword = async (email: string): Promise<IForgotPasswordResponse> => {
  try {
    const response = await api.post<IForgotPasswordResponse>('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    console.error('Forgot password failed:', error);
    throw error;
  }
};

export const resetPassword = async (data: IResetPasswordRequest): Promise<IResetPasswordResponse> => {
  try {
    const response = await api.post<IResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    console.error('Reset password failed:', error);
    throw error;
  }
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];
    
  return token || null;
};