import type {
  IMentorshipRequest,
  IMentorship,
  IMentorshipsParams,
  IMentorshipsResponse,
  IEndMentorshipRequest,
  ICreateMentorshipRequest,
  IAcceptMentorshipRequest,
  IDeclineMentorshipRequest,
  IMentorshipRequestsParams,
  IMentorshipRequestsResponse,
} from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const mentorshipService = {
  getMentorships: async (
    params?: IMentorshipsParams
  ): Promise<IMentorshipsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const response = await api.get<IMentorshipsResponse>(
        `/mentorships?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentorships failed:', error);
      throw error;
    }
  },

  getMentorshipById: async (id: string): Promise<IMentorship> => {
    try {
      const response = await api.get<IMentorship>(`/mentorships/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get mentorship failed:', error);
      throw error;
    }
  },

  endMentorship: async (
    id: string,
    data: IEndMentorshipRequest
  ): Promise<IMentorship> => {
    try {
      const response = await api.post<IMentorship>(
        `/mentorships/${id}/end`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('End mentorship failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  createRequest: async (
    data: ICreateMentorshipRequest
  ): Promise<IMentorshipRequest> => {
    try {
      const response = await api.post<IMentorshipRequest>(
        '/mentorship-requests',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Create mentorship request failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getRequests: async (
    params?: IMentorshipRequestsParams
  ): Promise<IMentorshipRequestsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.status) queryParams.append('status', params.status);
      if (params?.role) queryParams.append('role', params.role);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const response = await api.get<IMentorshipRequestsResponse>(
        `/mentorship-requests?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentorship requests failed:', error);
      throw error;
    }
  },

  getRequestById: async (id: string): Promise<IMentorshipRequest> => {
    try {
      const response = await api.get<IMentorshipRequest>(
        `/mentorship-requests/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentorship request failed:', error);
      throw error;
    }
  },

  cancelRequest: async (id: string): Promise<void> => {
    try {
      await api.delete(`/mentorship-requests/${id}`);
    } catch (error) {
      console.error('Cancel mentorship request failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  acceptRequest: async (
    id: string,
    data?: IAcceptMentorshipRequest
  ): Promise<IMentorshipRequest> => {
    try {
      const response = await api.post<IMentorshipRequest>(
        `/mentorship-requests/${id}/accept`,
        data || {}
      );
      return response.data;
    } catch (error) {
      console.error('Accept mentorship request failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  declineRequest: async (
    id: string,
    data: IDeclineMentorshipRequest
  ): Promise<IMentorshipRequest> => {
    try {
      const response = await api.post<IMentorshipRequest>(
        `/mentorship-requests/${id}/decline`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Decline mentorship request failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};
