import type { ISearchUserResult } from '@/types';
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
  }
};