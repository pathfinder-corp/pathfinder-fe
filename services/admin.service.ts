import type { 
  IDashboardOverview, 
  IDashboardUsers, 
  IDashboardRoadmaps, 
  IDashboardAssessments,
  IAdminUsersResponse,
  IAdminUsersParams,
  IAdminUserDetail,
  IAdminUser,
  IUpdateUserPayload,
  IAdminRoadmapsResponse,
  IAdminRoadmapsParams,
  IAdminRoadmapDetail,
  IAdminAssessmentsResponse,
  IAdminAssessmentsParams,
  IAdminAssessmentDetail,
  IMentorApplicationsResponse,
  IMentorApplicationsParams,
  IMentorApplicationDetail,
  IReviewMentorApplicationPayload,
  IAuditLogsResponse,
  IAuditLogsParams,
  IIPStatisticsResponse
} from '@/types';
import { api } from '@/lib';

export const adminService = {
  getDashboardOverview: async (): Promise<IDashboardOverview> => {
    try {
      const response = await api.get<IDashboardOverview>('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard overview failed:', error);
      throw error;
    }
  },

  getDashboardUsers: async (): Promise<IDashboardUsers> => {
    try {
      const response = await api.get<IDashboardUsers>('/admin/dashboard/users');
      return response.data;
    } catch (error) {
      console.error('Get dashboard users failed:', error);
      throw error;
    }
  },

  getDashboardRoadmaps: async (): Promise<IDashboardRoadmaps> => {
    try {
      const response = await api.get<IDashboardRoadmaps>('/admin/dashboard/roadmaps');
      return response.data;
    } catch (error) {
      console.error('Get dashboard roadmaps failed:', error);
      throw error;
    }
  },

  getDashboardAssessments: async (): Promise<IDashboardAssessments> => {
    try {
      const response = await api.get<IDashboardAssessments>('/admin/dashboard/assessments');
      return response.data;
    } catch (error) {
      console.error('Get dashboard assessments failed:', error);
      throw error;
    }
  },

  getUsers: async (params?: IAdminUsersParams): Promise<IAdminUsersResponse> => {
    try {
      const response = await api.get<IAdminUsersResponse>('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users failed:', error);
      throw error;
    }
  },

  getUserById: async (id: string): Promise<IAdminUserDetail> => {
    try {
      const response = await api.get<IAdminUserDetail>(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user by id failed:', error);
      throw error;
    }
  },

  updateUser: async (id: string, payload: IUpdateUserPayload): Promise<IAdminUser> => {
    try {
      const response = await api.patch<IAdminUser>(`/admin/users/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error) {
      console.error('Delete user failed:', error);
      throw error;
    }
  },

  getRoadmaps: async (params?: IAdminRoadmapsParams): Promise<IAdminRoadmapsResponse> => {
    try {
      const response = await api.get<IAdminRoadmapsResponse>('/admin/roadmaps', { params });
      return response.data;
    } catch (error) {
      console.error('Get roadmaps failed:', error);
      throw error;
    }
  },

  getRoadmapById: async (id: string): Promise<IAdminRoadmapDetail> => {
    try {
      const response = await api.get<IAdminRoadmapDetail>(`/admin/roadmaps/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get roadmap by id failed:', error);
      throw error;
    }
  },

  deleteRoadmap: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/roadmaps/${id}`);
    } catch (error) {
      console.error('Delete roadmap failed:', error);
      throw error;
    }
  },

  getAssessments: async (params?: IAdminAssessmentsParams): Promise<IAdminAssessmentsResponse> => {
    try {
      const response = await api.get<IAdminAssessmentsResponse>('/admin/assessments', { params });
      return response.data;
    } catch (error) {
      console.error('Get assessments failed:', error);
      throw error;
    }
  },

  getAssessmentById: async (id: string): Promise<IAdminAssessmentDetail> => {
    try {
      const response = await api.get<IAdminAssessmentDetail>(`/admin/assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get assessment by id failed:', error);
      throw error;
    }
  },

  deleteAssessment: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/assessments/${id}`);
    } catch (error) {
      console.error('Delete assessment failed:', error);
      throw error;
    }
  },

  getMentorApplications: async (params?: IMentorApplicationsParams): Promise<IMentorApplicationsResponse> => {
    try {
      const response = await api.get<IMentorApplicationsResponse>('/admin/mentor-applications', { params });
      return response.data;
    } catch (error) {
      console.error('Get mentor applications failed:', error);
      throw error;
    }
  },

  getMentorApplicationById: async (id: string): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.get<IMentorApplicationDetail>(`/admin/mentor-applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get mentor application by id failed:', error);
      throw error;
    }
  },

  reviewMentorApplication: async (id: string, payload: IReviewMentorApplicationPayload): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.post<IMentorApplicationDetail>(`/admin/mentor-applications/${id}/review`, payload);
      return response.data;
    } catch (error) {
      console.error('Review mentor application failed:', error);
      throw error;
    }
  },

  markApplicationUnderReview: async (id: string): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.post<IMentorApplicationDetail>(`/admin/mentor-applications/${id}/under-review`);
      return response.data;
    } catch (error) {
      console.error('Mark application under review failed:', error);
      throw error;
    }
  },

  getFlaggedApplications: async (): Promise<IMentorApplicationDetail[]> => {
    try {
      const response = await api.get<IMentorApplicationDetail[]>('/admin/applications/flagged');
      return response.data;
    } catch (error) {
      console.error('Get flagged applications failed:', error);
      throw error;
    }
  },

  unflagApplication: async (id: string): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.post<IMentorApplicationDetail>(`/admin/applications/${id}/unflag`);
      return response.data;
    } catch (error) {
      console.error('Unflag application failed:', error);
      throw error;
    }
  },

  getIPStatistics: async (): Promise<IIPStatisticsResponse> => {
    try {
      const response = await api.get<IIPStatisticsResponse>('/admin/applications/ip-statistics');
      return response.data;
    } catch (error) {
      console.error('Get IP statistics failed:', error);
      throw error;
    }
  },

  getAuditLogs: async (params?: IAuditLogsParams): Promise<IAuditLogsResponse> => {
    try {
      const response = await api.get<IAuditLogsResponse>('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Get audit logs failed:', error);
      throw error;
    }
  }
};

