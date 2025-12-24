import type {
  IMentorApplication,
  ICreateMentorApplicationRequest,
  IMentorProfile,
  IUpdateMentorProfileRequest,
  IMentorProfilesParams,
  IMentorProfilesResponse,
  IMentorDocument,
  IUploadMentorDocumentRequest,
  IUpdateMentorDocumentRequest,
  MentorDocumentType,
  IMentorReview,
  ICreateMentorReviewRequest,
  IUpdateMentorReviewRequest,
  IMentorReviewsResponse,
  IMentorReviewStats,
  IMentorReviewsParams,
} from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const mentorService = {
  createApplication: async (
    data: ICreateMentorApplicationRequest
  ): Promise<IMentorApplication> => {
    try {
      const response = await api.post<IMentorApplication>(
        '/mentor-applications',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Create mentor application failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  createApplicationWithDocuments: async (
    data: ICreateMentorApplicationRequest,
    documents: Array<{
      file: File;
      type: MentorDocumentType;
      title?: string;
      description?: string;
      issuedYear?: number;
      issuingOrganization?: string;
    }>
  ): Promise<
    IMentorApplication & {
      uploadSummary?: {
        total: number;
        uploaded: number;
        failed: number;
        failures?: Array<{ filename: string; error: string }>;
      };
    }
  > => {
    try {
      const formData = new FormData();

      formData.append('headline', data.headline);
      formData.append('bio', data.bio);
      formData.append('expertise', JSON.stringify(data.expertise));
      formData.append('skills', JSON.stringify(data.skills));
      if (data.industries?.length) {
        formData.append('industries', JSON.stringify(data.industries));
      }
      formData.append('languages', JSON.stringify(data.languages));
      formData.append('yearsExperience', String(data.yearsExperience));
      if (data.linkedinUrl) formData.append('linkedinUrl', data.linkedinUrl);
      if (data.portfolioUrl) formData.append('portfolioUrl', data.portfolioUrl);
      formData.append('motivation', data.motivation);

      if (documents.length > 0) {
        documents.forEach((doc) => {
          formData.append('documents', doc.file);
        });

        const metadata = documents.map((doc) => ({
          type: doc.type,
          title: doc.title,
          description: doc.description,
          issuedYear: doc.issuedYear,
          issuingOrganization: doc.issuingOrganization,
        }));
        formData.append('documentsMetadata', JSON.stringify(metadata));
      }

      const response = await api.post<IMentorApplication>(
        '/mentor-applications/with-documents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Create application with documents failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMyApplications: async (): Promise<IMentorApplication[]> => {
    try {
      const response = await api.get<IMentorApplication[]>(
        '/mentor-applications/mine'
      );
      return response.data;
    } catch (error) {
      console.error('Get my application failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getApplicationById: async (id: string): Promise<IMentorApplication> => {
    try {
      const response = await api.get<IMentorApplication>(
        `/mentor-applications/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Get application by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  withdrawApplication: async (id: string): Promise<void> => {
    try {
      await api.delete(`/mentor-applications/${id}`);
    } catch (error) {
      console.error('Withdraw application failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMyProfile: async (): Promise<IMentorProfile> => {
    try {
      const response = await api.get<IMentorProfile>('/mentor-profiles/me');
      return response.data;
    } catch (error) {
      console.error('Get my mentor profile failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateMyProfile: async (
    data: IUpdateMentorProfileRequest
  ): Promise<IMentorProfile> => {
    try {
      const response = await api.put<IMentorProfile>(
        '/mentor-profiles/me',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Update my mentor profile failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentors: async (
    params?: IMentorProfilesParams
  ): Promise<IMentorProfilesResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.search) queryParams.append('search', params.search);
      if (params?.minYearsExperience)
        queryParams.append(
          'minYearsExperience',
          String(params.minYearsExperience)
        );
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      if (params?.expertise?.length) {
        params.expertise.forEach((exp) => queryParams.append('expertise', exp));
      }
      if (params?.skills?.length) {
        params.skills.forEach((skill) => queryParams.append('skills', skill));
      }
      if (params?.industries?.length) {
        params.industries.forEach((ind) =>
          queryParams.append('industries', ind)
        );
      }
      if (params?.languages?.length) {
        params.languages.forEach((lang) =>
          queryParams.append('languages', lang)
        );
      }

      const response = await api.get<IMentorProfilesResponse>(
        `/mentor-profiles?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentors failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorById: async (id: string): Promise<IMentorProfile> => {
    try {
      const response = await api.get<IMentorProfile>(`/mentor-profiles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get mentor by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorWithDocuments: async (id: string): Promise<IMentorProfile> => {
    try {
      const response = await api.get<IMentorProfile>(
        `/mentor-profiles/${id}/with-documents`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentor with documents failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorDocuments: async (
    mentorProfileId: string
  ): Promise<IMentorDocument[]> => {
    try {
      const response = await api.get<IMentorDocument[]>(
        `/mentor-profiles/${mentorProfileId}/documents`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentor documents failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMyDocuments: async (): Promise<IMentorDocument[]> => {
    try {
      const response = await api.get<IMentorDocument[]>(
        '/mentor-profiles/me/documents'
      );
      return response.data;
    } catch (error) {
      console.error('Get my documents failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  uploadMyDocument: async (
    data: IUploadMentorDocumentRequest
  ): Promise<IMentorDocument> => {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.issuedYear)
        formData.append('issuedYear', String(data.issuedYear));
      if (data.issuingOrganization)
        formData.append('issuingOrganization', data.issuingOrganization);

      const response = await api.post<IMentorDocument>(
        '/mentor-profiles/me/documents',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload my document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateMyDocument: async (
    documentId: string,
    data: IUpdateMentorDocumentRequest
  ): Promise<IMentorDocument> => {
    try {
      const response = await api.patch<IMentorDocument>(
        `/mentor-profiles/me/documents/${documentId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Update my document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteMyDocument: async (documentId: string): Promise<void> => {
    try {
      await api.delete(`/mentor-profiles/me/documents/${documentId}`);
    } catch (error) {
      console.error('Delete my document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  uploadDocument: async (
    applicationId: string,
    data: IUploadMentorDocumentRequest
  ): Promise<IMentorDocument> => {
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('type', data.type);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.issuedYear)
        formData.append('issuedYear', String(data.issuedYear));
      if (data.issuingOrganization)
        formData.append('issuingOrganization', data.issuingOrganization);

      const response = await api.post<IMentorDocument>(
        `/mentor-applications/${applicationId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDocuments: async (applicationId: string): Promise<IMentorDocument[]> => {
    try {
      const response = await api.get<IMentorDocument[]>(
        `/mentor-applications/${applicationId}/documents`
      );
      return response.data;
    } catch (error) {
      console.error('Get documents failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDocumentById: async (
    applicationId: string,
    documentId: string
  ): Promise<IMentorDocument> => {
    try {
      const response = await api.get<IMentorDocument>(
        `/mentor-applications/${applicationId}/documents/${documentId}`
      );
      return response.data;
    } catch (error) {
      console.error('Get document by id failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  downloadDocument: async (
    applicationId: string,
    documentId: string
  ): Promise<Blob> => {
    try {
      const response = await api.get(
        `/mentor-applications/${applicationId}/documents/${documentId}/download`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Download document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateDocument: async (
    applicationId: string,
    documentId: string,
    data: IUpdateMentorDocumentRequest
  ): Promise<IMentorDocument> => {
    try {
      const response = await api.patch<IMentorDocument>(
        `/mentor-applications/${applicationId}/documents/${documentId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Update document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteDocument: async (
    applicationId: string,
    documentId: string
  ): Promise<void> => {
    try {
      await api.delete(
        `/mentor-applications/${applicationId}/documents/${documentId}`
      );
    } catch (error) {
      console.error('Delete document failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  withdrawAsMentor: async (): Promise<void> => {
    try {
      await api.delete('/mentor-profiles/me');
    } catch (error) {
      console.error('Withdraw as mentor failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getDocumentViewUrl: (profileId: string, documentId: string): string => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api';
    return `${baseUrl}/mentor-profiles/${profileId}/documents/${documentId}/view`;
  },

  getMentorReviews: async (
    mentorId: string,
    params?: IMentorReviewsParams
  ): Promise<IMentorReviewsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const response = await api.get<IMentorReviewsResponse>(
        `/mentors/${mentorId}/reviews${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentor reviews failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMentorReviewStats: async (
    mentorId: string
  ): Promise<IMentorReviewStats> => {
    try {
      const response = await api.get<IMentorReviewStats>(
        `/mentors/${mentorId}/reviews/stats`
      );
      return response.data;
    } catch (error) {
      console.error('Get mentor review stats failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMyReview: async (mentorId: string): Promise<IMentorReview | null> => {
    try {
      const response = await api.get<IMentorReview | null>(
        `/mentors/${mentorId}/reviews/my`
      );
      return response.data;
    } catch (error) {
      console.error('Get my review failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  createReview: async (
    mentorId: string,
    data: ICreateMentorReviewRequest
  ): Promise<IMentorReview> => {
    try {
      const response = await api.post<IMentorReview>(
        `/mentors/${mentorId}/reviews`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Create review failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  updateReview: async (
    mentorId: string,
    reviewId: string,
    data: IUpdateMentorReviewRequest
  ): Promise<IMentorReview> => {
    try {
      const response = await api.patch<IMentorReview>(
        `/mentors/${mentorId}/reviews/${reviewId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Update review failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteReview: async (mentorId: string, reviewId: string): Promise<void> => {
    try {
      await api.delete(`/mentors/${mentorId}/reviews/${reviewId}`);
    } catch (error) {
      console.error('Delete review failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};
