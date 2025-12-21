import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const isProfileEndpoint = response.config.url?.includes('/auth/me') || 
                             response.config.url?.includes('/auth/profile');
    
    if (isProfileEndpoint && (response.data?.status === 'suspended' || response.data?.user?.status === 'suspended')) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/suspended') {
        window.location.href = '/suspended';
      }
    }
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'An error occurred';
    
    if (error.response?.status === 401 && message.includes('not active')) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/suspended') {
        window.location.href = '/suspended';
        return Promise.reject(new Error(message));
      }
    }
    
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        if (window.location.pathname !== '/suspended') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

export default api;