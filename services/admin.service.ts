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
  IIPStatisticsResponse,
  IAdminDocument,
  IAdminDocumentDetail,
  IVerifyDocumentPayload,
  IDocumentStats,
  IAdminPendingDocument,
  IAdminMentorsResponse,
  IAdminMentorsParams,
  IAdminMentor,
  IAdminMentorStats,
  IRevokeMentorPayload,
  IAdminMentorshipsResponse,
  IAdminMentorshipsParams,
  IAdminMentorship,
  IAdminMentorshipStats,
  IForceEndMentorshipPayload,
  IAdminContactMessagesResponse,
  IAdminContactMessagesParams,
  IAdminContactMessage,
  IAdminContactStats,
  IUpdateContactStatusPayload,
  IRespondToContactPayload
} from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const adminService = {
  getDashboardOverview: async (): Promise<IDashboardOverview> => {
    try {
      const response = await api.get<IDashboardOverview>('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard overview failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDashboardUsers: async (): Promise<IDashboardUsers> => {
    try {
      const response = await api.get<IDashboardUsers>('/admin/dashboard/users');
      return response.data;
    } catch (error) {
      console.error('Get dashboard users failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDashboardRoadmaps: async (): Promise<IDashboardRoadmaps> => {
    try {
      const response = await api.get<IDashboardRoadmaps>('/admin/dashboard/roadmaps');
      return response.data;
    } catch (error) {
      console.error('Get dashboard roadmaps failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDashboardAssessments: async (): Promise<IDashboardAssessments> => {
    try {
      const response = await api.get<IDashboardAssessments>('/admin/dashboard/assessments');
      return response.data;
    } catch (error) {
      console.error('Get dashboard assessments failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getUsers: async (params?: IAdminUsersParams): Promise<IAdminUsersResponse> => {
    try {
      const response = await api.get<IAdminUsersResponse>('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getUserById: async (id: string): Promise<IAdminUserDetail> => {
    try {
      const response = await api.get<IAdminUserDetail>(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get user by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateUser: async (id: string, payload: IUpdateUserPayload): Promise<IAdminUser> => {
    try {
      const response = await api.patch<IAdminUser>(`/admin/users/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Update user failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  banUser: async (id: string): Promise<IAdminUser> => {
    try {
      const response = await api.patch<IAdminUser>(`/admin/users/${id}/ban`);
      return response.data;
    } catch (error) {
      console.error('Ban user failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  unbanUser: async (id: string): Promise<IAdminUser> => {
    try {
      const response = await api.patch<IAdminUser>(`/admin/users/${id}/unban`);
      return response.data;
    } catch (error) {
      console.error('Unban user failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getRoadmaps: async (params?: IAdminRoadmapsParams): Promise<IAdminRoadmapsResponse> => {
    try {
      const response = await api.get<IAdminRoadmapsResponse>('/admin/roadmaps', { params });
      return response.data;
    } catch (error) {
      console.error('Get roadmaps failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getRoadmapById: async (id: string): Promise<IAdminRoadmapDetail> => {
    try {
      const response = await api.get<IAdminRoadmapDetail>(`/admin/roadmaps/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get roadmap by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteRoadmap: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/roadmaps/${id}`);
    } catch (error) {
      console.error('Delete roadmap failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getAssessments: async (params?: IAdminAssessmentsParams): Promise<IAdminAssessmentsResponse> => {
    try {
      const response = await api.get<IAdminAssessmentsResponse>('/admin/assessments', { params });
      return response.data;
    } catch (error) {
      console.error('Get assessments failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getAssessmentById: async (id: string): Promise<IAdminAssessmentDetail> => {
    try {
      const response = await api.get<IAdminAssessmentDetail>(`/admin/assessments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get assessment by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteAssessment: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/assessments/${id}`);
    } catch (error) {
      console.error('Delete assessment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorApplications: async (params?: IMentorApplicationsParams): Promise<IMentorApplicationsResponse> => {
    try {
      const response = await api.get<IMentorApplicationsResponse>('/admin/mentor-applications', { params });
      return response.data;
    } catch (error) {
      console.error('Get mentor applications failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorApplicationById: async (id: string): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.get<IMentorApplicationDetail>(`/admin/mentor-applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get mentor application by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  reviewMentorApplication: async (id: string, payload: IReviewMentorApplicationPayload): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.post<IMentorApplicationDetail>(`/admin/mentor-applications/${id}/review`, payload);
      return response.data;
    } catch (error) {
      console.error('Review mentor application failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  markApplicationUnderReview: async (id: string): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.post<IMentorApplicationDetail>(`/admin/mentor-applications/${id}/under-review`);
      return response.data;
    } catch (error) {
      console.error('Mark application under review failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getFlaggedApplications: async (): Promise<IMentorApplicationDetail[]> => {
    try {
      const response = await api.get<IMentorApplicationDetail[]>('/admin/applications/flagged');
      return response.data;
    } catch (error) {
      console.error('Get flagged applications failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  unflagApplication: async (id: string): Promise<IMentorApplicationDetail> => {
    try {
      const response = await api.post<IMentorApplicationDetail>(`/admin/applications/${id}/unflag`);
      return response.data;
    } catch (error) {
      console.error('Unflag application failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getIPStatistics: async (): Promise<IIPStatisticsResponse> => {
    try {
      const response = await api.get<IIPStatisticsResponse>('/admin/applications/ip-statistics');
      return response.data;
    } catch (error) {
      console.error('Get IP statistics failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getAuditLogs: async (params?: IAuditLogsParams): Promise<IAuditLogsResponse> => {
    try {
      const response = await api.get<IAuditLogsResponse>('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Get audit logs failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getApplicationDocuments: async (applicationId: string): Promise<IAdminDocument[]> => {
    try {
      const response = await api.get<IAdminDocument[]>(
        `/admin/mentor-applications/${applicationId}/documents`
      );
      return response.data;
    } catch (error) {
      console.error('Get application documents failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDocumentById: async (applicationId: string, documentId: string): Promise<IAdminDocumentDetail> => {
    try {
      const response = await api.get<IAdminDocumentDetail>(
        `/admin/mentor-applications/${applicationId}/documents/${documentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Get document by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  verifyDocument: async (
    applicationId: string, 
    documentId: string, 
    payload: IVerifyDocumentPayload
  ): Promise<IAdminDocument> => {
    try {
      const response = await api.post<IAdminDocument>(
        `/admin/mentor-applications/${applicationId}/documents/${documentId}/verify`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error('Verify document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDocumentStats: async (applicationId: string): Promise<IDocumentStats> => {
    try {
      const response = await api.get<IDocumentStats>(
        `/admin/mentor-applications/${applicationId}/documents-stats`
      );
      return response.data;
    } catch (error) {
      console.error('Get document stats failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  downloadDocument: async (applicationId: string, documentId: string): Promise<Blob> => {
    try {
      const response = await api.get(
        `/admin/mentor-applications/${applicationId}/documents/${documentId}/download`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Download document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDocumentDownloadUrl: (applicationId: string, documentId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';
    return `${baseUrl}/admin/mentor-applications/${applicationId}/documents/${documentId}/download`;
  },

  getPendingDocuments: async (): Promise<IAdminPendingDocument[]> => {
    try {
      const response = await api.get<IAdminPendingDocument[]>('/admin/documents/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending documents failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentors: async (params?: IAdminMentorsParams): Promise<IAdminMentorsResponse> => {
    try {
      const response = await api.get<IAdminMentorsResponse>('/admin/mentors', { params });
      return response.data;
    } catch (error) {
      console.error('Get mentors failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorStats: async (): Promise<IAdminMentorStats> => {
    try {
      const response = await api.get<IAdminMentorStats>('/admin/mentors/stats');
      return response.data;
    } catch (error) {
      console.error('Get mentor stats failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorById: async (id: string): Promise<IAdminMentor> => {
    try {
      const response = await api.get<IAdminMentor>(`/admin/mentors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get mentor by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  revokeMentorStatus: async (userId: string, payload: IRevokeMentorPayload): Promise<void> => {
    try {
      await api.post(`/admin/users/${userId}/revoke-mentor`, payload);
    } catch (error) {
      console.error('Revoke mentor status failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
  
  getMentorships: async (params?: IAdminMentorshipsParams): Promise<IAdminMentorshipsResponse> => {
    try {
      const response = await api.get<IAdminMentorshipsResponse>('/admin/mentorships', { params });
      return response.data;
    } catch (error) {
      console.error('Get mentorships failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorshipStats: async (): Promise<IAdminMentorshipStats> => {
    try {
      const response = await api.get<IAdminMentorshipStats>('/admin/mentorships/stats');
      return response.data;
    } catch (error) {
      console.error('Get mentorship stats failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorshipById: async (id: string): Promise<IAdminMentorship> => {
    try {
      const response = await api.get<IAdminMentorship>(`/admin/mentorships/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get mentorship by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  forceEndMentorship: async (id: string, payload: IForceEndMentorshipPayload): Promise<IAdminMentorship> => {
    try {
      const response = await api.post<IAdminMentorship>(`/admin/mentorships/${id}/force-end`, payload);
      return response.data;
    } catch (error) {
      console.error('Force end mentorship failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getContactMessages: async (params?: IAdminContactMessagesParams): Promise<IAdminContactMessagesResponse> => {
    try {
      const response = await api.get<IAdminContactMessagesResponse>('/admin/contact', { params });
      return response.data;
    } catch (error) {
      console.error('Get contact messages failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getContactStats: async (): Promise<IAdminContactStats> => {
    try {
      const response = await api.get<IAdminContactStats>('/admin/contact/stats');
      return response.data;
    } catch (error) {
      console.error('Get contact stats failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getContactMessageById: async (id: string): Promise<IAdminContactMessage> => {
    try {
      const response = await api.get<IAdminContactMessage>(`/admin/contact/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get contact message by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateContactStatus: async (id: string, payload: IUpdateContactStatusPayload): Promise<IAdminContactMessage> => {
    try {
      const response = await api.patch<IAdminContactMessage>(`/admin/contact/${id}/status`, payload);
      return response.data;
    } catch (error) {
      console.error('Update contact status failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  respondToContact: async (id: string, payload: IRespondToContactPayload): Promise<IAdminContactMessage> => {
    try {
      const response = await api.post<IAdminContactMessage>(`/admin/contact/${id}/respond`, payload);
      return response.data;
    } catch (error) {
      console.error('Respond to contact failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  }
};