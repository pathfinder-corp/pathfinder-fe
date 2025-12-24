import type {
  IAssessment,
  ICreateAssessmentRequest,
  ISubmitAnswerRequest,
  ISubmitAnswerResponse,
  IAssessmentResult,
  IAssessmentHistory,
} from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const assessmentService = {
  createAssessment: async (
    data: ICreateAssessmentRequest
  ): Promise<IAssessment> => {
    try {
      const response = await api.post<IAssessment>('/assessments', data, {
        timeout: 180000,
      });
      return response.data;
    } catch (error) {
      console.error('Create assessment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getAllAssessments: async (): Promise<IAssessment[]> => {
    try {
      const response = await api.get<IAssessment[]>('/assessments');
      return response.data;
    } catch (error) {
      console.error('Get all assessments failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getAssessment: async (id: string): Promise<IAssessment> => {
    try {
      const response = await api.get<IAssessment>(`/assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get assessment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteAssessment: async (id: string): Promise<void> => {
    try {
      await api.delete(`/assessments/${id}`);
    } catch (error) {
      console.error('Delete assessment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  startAssessment: async (id: string): Promise<IAssessment> => {
    try {
      const response = await api.post<IAssessment>(`/assessments/${id}/start`);
      return response.data;
    } catch (error) {
      console.error('Start assessment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  submitAnswer: async (
    id: string,
    data: ISubmitAnswerRequest
  ): Promise<ISubmitAnswerResponse> => {
    try {
      const response = await api.post<ISubmitAnswerResponse>(
        `/assessments/${id}/answers`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Submit answer failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  completeAssessment: async (id: string): Promise<IAssessmentResult> => {
    try {
      const response = await api.post<IAssessmentResult>(
        `/assessments/${id}/complete`,
        {},
        {
          timeout: 120000,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Complete assessment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getResults: async (id: string): Promise<IAssessmentResult> => {
    try {
      const response = await api.get<IAssessmentResult>(
        `/assessments/${id}/results`
      );
      return response.data;
    } catch (error) {
      console.error('Get results failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  retakeAssessment: async (id: string): Promise<IAssessment> => {
    try {
      const response = await api.post<IAssessment>(`/assessments/${id}/retake`);
      return response.data;
    } catch (error) {
      console.error('Retake assessment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getAssessmentHistory: async (id: string): Promise<IAssessmentHistory> => {
    try {
      const response = await api.get<IAssessmentHistory>(
        `/assessments/${id}/history`
      );
      return response.data;
    } catch (error) {
      console.error('Get assessment history failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};
