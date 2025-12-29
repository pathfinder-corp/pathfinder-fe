import { api, extractErrorMessage } from '@/lib';
import type {
  IBadge,
  IGamificationStats,
  ILeaderboardEntry,
} from '@/types';

export const gamificationService = {
  getMyStats: async (): Promise<IGamificationStats> => {
    try {
      const response = await api.get<IGamificationStats>(
        '/users/me/gamification'
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMyBadges: async (): Promise<IBadge[]> => {
    try {
      const response = await api.get<IBadge[]>('/users/me/badges');
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getLeaderboard: async (limit: number = 10): Promise<ILeaderboardEntry[]> => {
    try {
      const response = await api.get<ILeaderboardEntry[]>('/users/leaderboard', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};
