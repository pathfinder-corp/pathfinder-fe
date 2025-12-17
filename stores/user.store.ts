import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { IUserStore, IUser } from '@/types';
import { authService } from '@/services';

export const useUserStore = create<IUserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      setUser: (user) => {
        set({ user, isAuthenticated: true });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },

      clearUser: () => {
        set({ user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          document.cookie = 'auth-token=; path=/; max-age=0';
        }
      },

      initializeUser: async () => {
        if (typeof window !== 'undefined') {
          const userStr = localStorage.getItem('user');
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth-token='));
          
          if (userStr && token) {
            try {
              const user = JSON.parse(userStr);
              set({ user, isAuthenticated: true, isInitialized: true });
              
              const profile = await authService.getProfile();
              const updatedUser: IUser = {
                id: profile.id,
                email: profile.email,
                firstName: profile.firstName,
                lastName: profile.lastName,
                role: profile.role,
                status: profile.status,
                avatar: profile.avatar,
                phone: profile.phone,
                dateOfBirth: profile.dateOfBirth,
                location: profile.location,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
              };
              set({ user: updatedUser });
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
              console.error('Failed to initialize user:', error);
              set({ user: null, isAuthenticated: false, isInitialized: true });
            }
          } else {
            set({ isInitialized: true });
          }
        }
      },

      refreshUser: async () => {
        try {
          const profile = await authService.getProfile();
          const user: IUser = {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            role: profile.role,
            status: profile.status,
            avatar: profile.avatar,
            phone: profile.phone,
            dateOfBirth: profile.dateOfBirth,
            location: profile.location,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          };
          set({ user, isAuthenticated: true });
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (error) {
          console.error('Failed to refresh user:', error);
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);