import type { IRoadmapRequest, IRoadmapResponse } from '@/types';
import { api } from '@/lib';

export const roadmapService = {
  createRoadmap: async (data: IRoadmapRequest): Promise<IRoadmapResponse> => {
    try {
      const response = await api.post<IRoadmapResponse>('/roadmaps', data, {
        timeout: 180000
      });
      return response.data;
    } catch (error) {
      console.error('Create roadmap failed:', error);
      throw error;
    }
  },

  getRoadmap: async (id: string): Promise<IRoadmapResponse> => {
    try {
      const response = await api.get<IRoadmapResponse>(`/roadmaps/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get roadmap failed:', error);
      throw error;
    }
  },

  getAllRoadmaps: async (page = 1, limit = 10): Promise<IRoadmapResponse[]> => {
    try {
      const response = await api.get<IRoadmapResponse[]>('/roadmaps', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get all roadmaps failed:', error);
      throw error;
    }
  }
};