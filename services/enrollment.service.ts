import { api } from '@/lib';
import type {
  IEnrollment,
  IEnrollCourseRequest,
  IUpdateProgressRequest,
  IEnrollmentStats,
} from '@/types';

export const enrollmentService = {
  enrollCourse: async (data: IEnrollCourseRequest): Promise<IEnrollment> => {
    try {
      const response = await api.post<IEnrollment>('/enrollments', data);
      return response.data;
    } catch (error) {
      console.error('Enroll course failed:', error);
      throw error;
    }
  },

  getEnrollments: async (): Promise<IEnrollment[]> => {
    try {
      const response = await api.get<IEnrollment[]>('/enrollments');
      return response.data;
    } catch (error) {
      console.error('Get enrollments failed:', error);
      throw error;
    }
  },

  getEnrollmentStats: async (): Promise<IEnrollmentStats> => {
    try {
      const response = await api.get<IEnrollmentStats>('/enrollments/stats');
      return response.data;
    } catch (error) {
      console.error('Get enrollment stats failed:', error);
      throw error;
    }
  },

  getEnrollmentById: async (id: string): Promise<IEnrollment> => {
    try {
      const response = await api.get<IEnrollment>(`/enrollments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get enrollment by ID failed:', error);
      throw error;
    }
  },

  updateProgress: async (id: string, data: IUpdateProgressRequest): Promise<IEnrollment> => {
    try {
      const response = await api.patch<IEnrollment>(`/enrollments/${id}/progress`, data);
      return response.data;
    } catch (error) {
      console.error('Update progress failed:', error);
      throw error;
    }
  },

  dropCourse: async (id: string): Promise<void> => {
    try {
      await api.delete(`/enrollments/${id}`);
    } catch (error) {
      console.error('Drop course failed:', error);
      throw error;
    }
  },
};