import type { 
  IMentorApplication,
  ICreateMentorApplicationRequest,
  IMentorProfile,
  IUpdateMentorProfileRequest,
  IMentorProfilesParams,
  IMentorProfilesResponse
} from '@/types';
import { api } from '@/lib';

export const mentorService = {
  createApplication: async (data: ICreateMentorApplicationRequest): Promise<IMentorApplication> => {
    try {
      const response = await api.post<IMentorApplication>('/mentor-applications', data);
      return response.data;
    } catch (error) {
      console.error('Create mentor application failed:', error);
      throw error;
    }
  },

  getMyApplications: async (): Promise<IMentorApplication[]> => {
    try {
      const response = await api.get<IMentorApplication[]>('/mentor-applications/mine');
      return response.data;
    } catch (error) {
      console.error('Get my application failed:', error);
      throw error;
    }
  },

  getApplicationById: async (id: string): Promise<IMentorApplication> => {
    try {
      const response = await api.get<IMentorApplication>(`/mentor-applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get application by id failed:', error);
      throw error;
    }
  },

  withdrawApplication: async (id: string): Promise<void> => {
    try {
      await api.delete(`/mentor-applications/${id}`);
    } catch (error) {
      console.error('Withdraw application failed:', error);
      throw error;
    }
  },

  getMyProfile: async (): Promise<IMentorProfile> => {
    try {
      const response = await api.get<IMentorProfile>('/mentor-profiles/me');
      return response.data;
    } catch (error) {
      console.error('Get my mentor profile failed:', error);
      throw error;
    }
  },

  updateMyProfile: async (data: IUpdateMentorProfileRequest): Promise<IMentorProfile> => {
    try {
      const response = await api.put<IMentorProfile>('/mentor-profiles/me', data);
      return response.data;
    } catch (error) {
      console.error('Update my mentor profile failed:', error);
      throw error;
    }
  },

  getMentors: async (params?: IMentorProfilesParams): Promise<IMentorProfilesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.search) queryParams.append('search', params.search);
      if (params?.minYearsExperience) queryParams.append('minYearsExperience', String(params.minYearsExperience));
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      
      if (params?.expertise?.length) {
        params.expertise.forEach(exp => queryParams.append('expertise', exp));
      }
      if (params?.skills?.length) {
        params.skills.forEach(skill => queryParams.append('skills', skill));
      }
      if (params?.industries?.length) {
        params.industries.forEach(ind => queryParams.append('industries', ind));
      }
      if (params?.languages?.length) {
        params.languages.forEach(lang => queryParams.append('languages', lang));
      }

      const response = await api.get<IMentorProfilesResponse>(
        `/mentor-profiles?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentors failed:', error);
      throw error;
    }
  },

  getMentorById: async (id: string): Promise<IMentorProfile> => {
    try {
      const response = await api.get<IMentorProfile>(`/mentor-profiles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get mentor by id failed:', error);
      throw error;
    }
  }
};

