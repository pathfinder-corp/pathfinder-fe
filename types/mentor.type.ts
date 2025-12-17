import { SortOrder } from './table.type';

export type MentorApplicationStatus = 
  | 'pending' 
  | 'flagged' 
  | 'under_review' 
  | 'approved' 
  | 'declined' 
  | 'withdrawn';

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
