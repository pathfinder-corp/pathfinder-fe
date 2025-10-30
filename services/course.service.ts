import { api } from '@/lib';
import type {
  ICourse,
  ICreateCourseRequest,
  IUpdateCourseRequest,
  ICourseFilters,
  ICourseStats,
} from '@/types';

export const courseService = {
  getCourses: async (filters?: ICourseFilters): Promise<ICourse[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.level) params.append('level', filters.level);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get<ICourse[]>(`/courses?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get courses failed:', error);
      throw error;
    }
  },

  getCourseById: async (id: string): Promise<ICourse> => {
    try {
      const response = await api.get<ICourse>(`/courses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get course by ID failed:', error);
      throw error;
    }
  },

  createCourse: async (data: ICreateCourseRequest): Promise<ICourse> => {
    try {
      const response = await api.post<ICourse>('/courses', data);
      return response.data;
    } catch (error) {
      console.error('Create course failed:', error);
      throw error;
    }
  },

  updateCourse: async (id: string, data: IUpdateCourseRequest): Promise<ICourse> => {
    try {
      const response = await api.patch<ICourse>(`/courses/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update course failed:', error);
      throw error;
    }
  },

  deleteCourse: async (id: string): Promise<void> => {
    try {
      await api.delete(`/courses/${id}`);
    } catch (error) {
      console.error('Delete course failed:', error);
      throw error;
    }
  },

  getCourseStats: async (): Promise<ICourseStats[]> => {
    try {
      const response = await api.get<ICourseStats[]>('/courses/stats/by-category');
      return response.data;
    } catch (error) {
      console.error('Get course stats failed:', error);
      throw error;
    }
  },
};