import { api } from '@/lib';
import type {
  IAcademicProfile,
  ICreateAcademicProfileRequest,
  UpdateAcademicProfileRequest
} from '@/types';
import { AxiosError } from 'axios';

export const academicService = {
  getProfile: async (): Promise<IAcademicProfile | null> => {
    try {
      const response = await api.get<IAcademicProfile>('/academic/profile');
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createProfile: async (data: ICreateAcademicProfileRequest): Promise<IAcademicProfile> => {
    try {
      const response = await api.post<IAcademicProfile>('/academic/profile', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (data: UpdateAcademicProfileRequest): Promise<IAcademicProfile> => {
    try {
      const response = await api.patch<IAcademicProfile>('/academic/profile', data);
      return response.data;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  },

  deleteProfile: async (): Promise<void> => {
    try {
      await api.delete('/academic/profile');
    } catch (error) {
      console.error('Delete profile failed:', error);
      throw error;
    }
  },

  getAllProfiles: async (): Promise<IAcademicProfile[]> => {
    try {
      const response = await api.get<IAcademicProfile[]>('/academic/profile/all');
      return response.data;
    } catch (error) {
      console.error('Get all profiles failed:', error);
      throw error;
    }
  },

  getProfileByUserId: async (userId: string): Promise<IAcademicProfile> => {
    try {
      const response = await api.get<IAcademicProfile>(`/academic/profile/${userId}`);
      return response.data;
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null as unknown as IAcademicProfile;
      }
      console.error('Get profile by user ID failed:', error);
      throw error;
    }
  },
};