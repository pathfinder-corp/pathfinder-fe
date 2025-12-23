import { create } from 'zustand';
import type { IPresenceState } from '@/types';

export const usePresenceStore = create<IPresenceState>((set, get) => ({
  onlineUsers: {},

  setUserOnline: (userId, isOnline) => {
    if (!userId) return;
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: isOnline,
      },
    }));
  },

  setManyUsersOnline: (statuses) => {
    if (!statuses || Object.keys(statuses).length === 0) return;
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        ...statuses,
      },
    }));
  },

  isUserOnline: (userId) => {
    if (!userId) return undefined;
    return get().onlineUsers[userId];
  },

  reset: () => set({ onlineUsers: {} }),
}));