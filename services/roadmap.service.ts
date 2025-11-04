import type { IRoadmapRequest, IRoadmapResponse, IAskInsightRequest, IAskInsightResponse } from '@/types';
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

  getAllRoadmaps: async (page: number = 1, limit: number = 12): Promise<IRoadmapResponse[]> => {
    try {
      const response = await api.get<IRoadmapResponse[]>('/roadmaps', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get all roadmaps failed:', error);
      throw error;
    }
  },

  deleteRoadmap: async (id: string): Promise<void> => {
    try {
      await api.delete(`/roadmaps/${id}`);
    } catch (error) {
      console.error('Delete roadmap failed:', error);
      throw error;
    }
  },

  deleteAllRoadmaps: async (): Promise<void> => {
    try {
      await api.delete('/roadmaps');
    } catch (error) {
      console.error('Delete all roadmaps failed:', error);
      throw error;
    }
  },

  askInsight: async (
    id: string, 
    data: IAskInsightRequest
  ): Promise<IAskInsightResponse> => {
    try {
      const response = await api.post<IAskInsightResponse>(
        `/roadmaps/${id}/insight`,
        data,
        { timeout: 60000 }
      );
      return response.data;
    } catch (error) {
      console.error('Ask AI insight failed:', error);
      throw error;
    }
  }
};