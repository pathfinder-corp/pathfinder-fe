import type { 
  IRoadmapRequest, 
  IRoadmapResponse, 
  IAskInsightRequest, 
  IAskInsightResponse,
  IShareSettings,
  IShareRoadmapRequest,
  ISharedUser
} from '@/types';
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
  },

  getShareSettings: async (id: string): Promise<IShareSettings> => {
    try {
      const response = await api.get<IShareSettings>(`/roadmaps/${id}/share`);
      return response.data;
    } catch (error) {
      console.error('Get share settings failed:', error);
      throw error;
    }
  },

  getSharedUsers: async (id: string): Promise<ISharedUser[]> => {
    try {
      const response = await api.get<ISharedUser[]>(`/roadmaps/${id}/shared-users`);
      return response.data;
    } catch (error) {
      console.error('Get shared users failed:', error);
      throw error;
    }
  },

  shareRoadmap: async (id: string, data: IShareRoadmapRequest): Promise<void> => {
    try {
      await api.post(`/roadmaps/${id}/share`, data);
    } catch (error) {
      console.error('Share roadmap failed:', error);
      throw error;
    }
  },

  revokeAccess: async (id: string, userId: string): Promise<void> => {
    try {
      await api.delete(`/roadmaps/${id}/share/${userId}`);
    } catch (error) {
      console.error('Revoke access failed:', error);
      throw error;
    }
  }
};