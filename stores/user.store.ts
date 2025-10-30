import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IUserStore } from '@/types';

export const useUserStore = create<IUserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      clearUser: () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          document.cookie = 'auth-token=; path=/; max-age=0';
        }
      },

      initializeUser: () => {
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='));
          
          if (userStr && token) {
            try {
              const user = JSON.parse(userStr);
              set({ user, isAuthenticated: true });
            } catch (error) {
              console.error('Failed to parse user data:', error);
              set({ user: null, isAuthenticated: false });
            }
          }
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);