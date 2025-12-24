import { SortOrder } from './table.type';
import { DOCUMENT_TYPES } from '@/constants';

export type MentorApplicationStatus = 
  | 'pending' 
  | 'flagged' 
  | 'under_review' 
  | 'approved' 
  | 'declined' 
  | 'withdrawn';

export type MentorDocumentType = (typeof DOCUMENT_TYPES)[number]['value'];

export type DocumentVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface IMentorApplicationUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface IMentorProfileUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface IMentorCoreData {
  headline: string;
  bio: string;
  expertise: string[];
  skills: string[];
  industries: string[];
  languages: string[];
  yearsExperience: number;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
}

export interface IMentorApplicationData extends IMentorCoreData {
  motivation: string;
}

export interface IMentorApplication {
  id: string;
  userId: string;
  user: IMentorApplicationUser;
  status: MentorApplicationStatus;
  applicationData: IMentorApplicationData;
  documents?: IMentorDocument[];
  declineReason: string | null;
  decidedAt: string | null;
  createdAt: string;
  updatedAt: string;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewer: IMentorApplicationUser | null;
  isFlagged: boolean;
  contentFlags: Record<string, unknown>;
  ipHash: string;
}

export interface ICreateMentorApplicationRequest extends Omit<IMentorCoreData, 'linkedinUrl' | 'portfolioUrl'> {
  linkedinUrl?: string;
  portfolioUrl?: string;
  motivation: string;
}

export interface IMentorProfile extends IMentorCoreData {
  id: string;
  userId: string;
  user: IMentorProfileUser;
  isActive: boolean;
  isAcceptingMentees: boolean;
  maxMentees: number;
  documents?: IMentorDocument[];
  createdAt: string;
  updatedAt: string;
}

export type IUpdateMentorProfileRequest = Partial<
  Omit<IMentorCoreData, 'linkedinUrl' | 'portfolioUrl'> & {
    linkedinUrl?: string;
    portfolioUrl?: string;
    isAcceptingMentees?: boolean;
    maxMentees?: number;
  }
>;

export interface IMentorProfilesParams {
  search?: string;
  expertise?: string[];
  skills?: string[];
  industries?: string[];
  languages?: string[];
  minYearsExperience?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface IMentorProfilesResponse {
  mentors: IMentorProfile[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IMentorApplicationStatusHistory {
  id: string;
  previousStatus: MentorApplicationStatus;
  newStatus: MentorApplicationStatus;
  reason: string | null;
  createdAt: string;
}

export interface IMentorDocument {
  id: string;
  applicationId: string;
  type: MentorDocumentType;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  title: string | null;
  imagekitUrl?: string | null;
  description: string | null;
  issuedYear: number | null;
  issuingOrganization: string | null;
  verificationStatus: DocumentVerificationStatus;
  displayOrder: number;
  createdAt: string;
  downloadUrl: string;
  isImage?: boolean;
  isPdf?: boolean;
  isWord?: boolean;
  isExcel?: boolean;
  isPowerPoint?: boolean;
  isOfficeDocument?: boolean;
}

export interface IUploadMentorDocumentRequest {
  file: File;
  type: MentorDocumentType;
  title?: string;
  description?: string;
  issuedYear?: number;
  issuingOrganization?: string;
}

export interface IUpdateMentorDocumentRequest {
  type?: MentorDocumentType;
  title?: string;
  description?: string;
  issuedYear?: number;
  issuingOrganization?: string;
  displayOrder?: number;
}

export interface IMentorReviewStudent {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

export interface IMentorReview {
  id: string;
  mentorId: string;
  studentId: string;
  mentorshipId?: string | null;
  rating: number;
  feedback?: string | null;
  student?: IMentorReviewStudent;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMentorReviewRequest {
  rating: number;
  feedback?: string;
  mentorshipId?: string;
}

export interface IUpdateMentorReviewRequest {
  rating?: number;
  feedback?: string;
}

export interface IMentorReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface IMentorReviewsResponse {
  reviews: IMentorReview[];
  stats: IMentorReviewStats;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IMentorReviewsParams {
  page?: number;
  limit?: number;
}