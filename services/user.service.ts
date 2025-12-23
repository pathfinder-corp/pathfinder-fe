import type { ISearchUserResult, IUser } from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const userService = {
  searchUsers: async (email: string): Promise<ISearchUserResult[]> => {
    try {
      const response = await api.get<ISearchUserResult[]>('/users/search', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      console.error('Search users failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  uploadAvatar: async (file: File): Promise<IUser> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<IUser>('/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Upload avatar failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  }
};