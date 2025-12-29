import { api, extractErrorMessage } from '@/lib';
import type {
  IAskInsightRequest,
  IAskInsightResponse,
  IProgressResponse,
  IRoadmapRequest,
  IRoadmapResponse,
  IShareRoadmapRequest,
  IShareSettings,
  ISharedUser,
  IUpdateProgressRequest,
} from '@/types';

export const roadmapService = {
  createRoadmap: async (
    data: IRoadmapRequest,
    options?: { useMapReduce?: boolean }
  ): Promise<IRoadmapResponse> => {
    try {
      const params = options?.useMapReduce ? { useMapReduce: 'true' } : {};
      const response = await api.post<IRoadmapResponse>('/roadmaps', data, {
        timeout: 600000, // 10 minutes
        params,
      });
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getRoadmap: async (id: string): Promise<IRoadmapResponse> => {
    try {
      const response = await api.get<IRoadmapResponse>(`/roadmaps/${id}`);
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getAllRoadmaps: async (
    page: number = 1,
    limit: number = 12
  ): Promise<IRoadmapResponse[]> => {
    try {
      const response = await api.get<IRoadmapResponse[]>('/roadmaps', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteRoadmap: async (id: string): Promise<void> => {
    try {
      await api.delete(`/roadmaps/${id}`);
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteAllRoadmaps: async (): Promise<void> => {
    try {
      await api.delete('/roadmaps');
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
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
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getShareSettings: async (id: string): Promise<IShareSettings> => {
    try {
      const response = await api.get<IShareSettings>(`/roadmaps/${id}/share`);
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getSharedUsers: async (id: string): Promise<ISharedUser[]> => {
    try {
      const response = await api.get<ISharedUser[]>(
        `/roadmaps/${id}/shared-users`
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  shareRoadmap: async (
    id: string,
    data: IShareRoadmapRequest
  ): Promise<void> => {
    try {
      await api.post(`/roadmaps/${id}/share`, data);
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  revokeAccess: async (id: string, userId: string): Promise<void> => {
    try {
      await api.delete(`/roadmaps/${id}/share/${userId}`);
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  // Progress Tracking
  getProgress: async (id: string): Promise<IProgressResponse> => {
    try {
      const response = await api.get<IProgressResponse>(
        `/roadmaps/${id}/progress`
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateProgress: async (
    id: string,
    data: IUpdateProgressRequest
  ): Promise<IProgressResponse> => {
    try {
      const response = await api.post<IProgressResponse>(
        `/roadmaps/${id}/progress`,
        data
      );
      return response.data;
    } catch (error) {
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};
