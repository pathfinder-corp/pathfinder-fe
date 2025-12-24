import { create } from 'zustand';
import type { IRoadmapStore } from '@/types';

export const useRoadmapStore = create<IRoadmapStore>((set) => ({
  isViewMode: false,
  setIsViewMode: (isViewMode) => set({ isViewMode }),
  reset: () => set({ isViewMode: false }),
}));
