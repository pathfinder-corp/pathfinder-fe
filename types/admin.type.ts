import { UserRole, UserStatus } from './user.type';
import { AssessmentSortField, ContactSortField, RoadmapSortField, SortField, SortOrder } from './table.type';
import { AssessmentDifficulty, AssessmentStatus } from './assessment.type';
import { 
  MentorApplicationStatus,
  IMentorApplication,
  IMentorApplicationStatusHistory,
  MentorDocumentType,
  DocumentVerificationStatus
} from './mentor.type';
import { MentorshipStatus } from './mentorship.type';
import { ContactStatus, ContactType } from './contact.type';

export interface IDashboardOverview {
  totalUsers: number;
  totalRoadmaps: number;
  totalAssessments: number;
  newUsersLast7Days: number;
  newRoadmapsLast7Days: number;
  newAssessmentsLast7Days: number;
}

export interface IUserByRole {
  role: string;
  count: number;
}

export interface IUserByStatus {
  status: string;
  count: number;
}

export interface IRegistrationTrend {
  date: string;
  count: number;
}

export interface IDashboardUsers {
  byRole: IUserByRole[];
  byStatus: IUserByStatus[];
  registrationTrend: IRegistrationTrend[];
}

export interface IPopularTopic {
  topic: string;
  count: number;
}

export interface IGenerationTrend {
  date: string;
  count: number;
}

export interface IDashboardRoadmaps {
  total: number;
  sharedCount: number;
  popularTopics: IPopularTopic[];
  generationTrend: IGenerationTrend[];
}

export interface IAssessmentByStatus {
  status: string;
  count: number;
}

export interface IAssessmentByDifficulty {
  difficulty: string;
  count: number;
}

export interface IPopularDomain {
  domain: string;
  count: number;
}

export interface ICreationTrend {
  date: string;
  count: number;
}

export interface IDashboardAssessments {
  total: number;
  byStatus: IAssessmentByStatus[];
  byDifficulty: IAssessmentByDifficulty[];
  popularDomains: IPopularDomain[];
  creationTrend: ICreationTrend[];
}

export interface IAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface IAdminUserDetail extends IAdminUser {
  roadmapCount: number;
  assessmentCount: number;
}

export interface IAdminUsersResponse {
  data: IAdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAdminUsersParams {
  page?: number;
  limit?: number;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  role?: UserRole;
  search?: string;
}

export interface IUpdateUserPayload {
  role?: UserRole;
  status?: UserStatus;
}

export interface IAdminRoadmapOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface IAdminRoadmap {
  id: string;
  topic: string;
  experienceLevel: string;
  learningPace: string;
  timeframe: string;
  isSharedWithAll: boolean;
  createdAt: string;
  updatedAt: string;
  owner: IAdminRoadmapOwner;
}

export interface IAdminRoadmapDetail extends IAdminRoadmap {
  summary: Record<string, unknown>;
  phases: unknown[];
  milestones: unknown[];
  shareCount: number;
}

export interface IAdminRoadmapsResponse {
  data: IAdminRoadmap[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAdminRoadmapsParams {
  page?: number;
  limit?: number;
  sortBy?: RoadmapSortField;
  sortOrder?: SortOrder;
  userId?: string;
  topic?: string;
  isSharedWithAll?: boolean;
}

export interface IAdminAssessmentOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface IAdminAssessment {
  id: string;
  domain: string;
  difficulty: AssessmentDifficulty;
  questionCount: number;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
  owner: IAdminAssessmentOwner;
}

export interface IAdminAssessmentDetail extends IAdminAssessment {
  answeredCount: number;
  result: Record<string, unknown> | null;
}

export interface IAdminAssessmentsResponse {
  data: IAdminAssessment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAdminAssessmentsParams {
  page?: number;
  limit?: number;
  sortBy?: AssessmentSortField;
  sortOrder?: SortOrder;
  userId?: string;
  domain?: string;
  status?: AssessmentStatus;
  difficulty?: AssessmentDifficulty;

}

export interface IMentorApplicationDetail extends IMentorApplication {
  statusHistory: IMentorApplicationStatusHistory[];
}

export interface IMentorApplicationsResponse {
  applications: IMentorApplication[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IMentorApplicationsParams {
  page?: number;
  limit?: number;
  status?: MentorApplicationStatus;
  userId?: string;
}

export interface IReviewMentorApplicationPayload {
  decision: 'approve' | 'decline';
  declineReason?: string;
  adminNotes?: string;
}

export interface IAuditLogActor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface IAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actor: IAuditLogActor | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface IAuditLogsResponse {
  logs: IAuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAuditLogsParams {
  entityType?: string;
  entityId?: string;
  actorId?: string;
  page?: number;
  limit?: number;
}

export interface IIPStatistic {
  ipHash: string;
  count: number;
}

export type IIPStatisticsResponse = IIPStatistic[];

export interface IAdminDocument {
  id: string;
  applicationId: string;
  type: MentorDocumentType;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  title: string | null;
  description: string | null;
  issuedYear: number | null;
  issuingOrganization: string | null;
  verificationStatus: DocumentVerificationStatus;
  displayOrder: number;
  createdAt: string;
  downloadUrl: string;
  imagekitUrl?: string | null;
  isImage?: boolean;
  isPdf?: boolean;
  isWord?: boolean;
  isExcel?: boolean;
  isPowerPoint?: boolean;
  isOfficeDocument?: boolean;
}

export interface IAdminDocumentDetail extends IAdminDocument {
  verificationNotes: string | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
  storedFilename: string;
  filePath: string;
}

export interface IVerifyDocumentPayload {
  verified: boolean;
  notes?: string;
}

export interface IDocumentStats {
  total: number;
  verified: number;
  pending: number;
  rejected: number;
  byType: {
    certificate: number;
    award: number;
    portfolio: number;
    recommendation: number;
    other: number;
  };
}

export interface IAdminPendingDocumentUploader {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

export interface IAdminPendingDocumentApplication {
  id: string;
  userId: string;
  status: MentorApplicationStatus;
}

export interface IAdminPendingDocument {
  id: string;
  applicationId: string;
  type: MentorDocumentType;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  title: string | null;
  description: string | null;
  issuedYear: number | null;
  issuingOrganization: string | null;
  verificationStatus: DocumentVerificationStatus;
  displayOrder: number;
  createdAt: string;
  downloadUrl: string;
  imagekitUrl?: string | null;
  isImage?: boolean;
  isPdf?: boolean;
  isWord?: boolean;
  isExcel?: boolean;
  isPowerPoint?: boolean;
  isOfficeDocument?: boolean;
  uploader: IAdminPendingDocumentUploader;
  application: IAdminPendingDocumentApplication;
}

export interface IAdminMentorUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface IAdminMentor {
  id: string;
  userId: string;
  user: IAdminMentorUser;
  headline: string;
  bio: string;
  expertise: string[];
  skills: string[];
  industries: string[];
  languages: string[];
  yearsExperience: number;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  isActive: boolean;
  isAcceptingMentees: boolean;
  maxMentees: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminMentorsResponse {
  mentors: IAdminMentor[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAdminMentorsParams {
  isActive?: boolean;
  isAcceptingMentees?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IAdminMentorStats {
  total: number;
  active: number;
  inactive: number;
  acceptingMentees: number;
}

export interface IRevokeMentorPayload {
  reason: string;
}

export interface IAdminMentorshipUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

export interface IAdminMentorship {
  id: string;
  mentorId: string;
  studentId: string;
  mentor: IAdminMentorshipUser;
  student: IAdminMentorshipUser;
  status: MentorshipStatus;
  startedAt: string;
  endedAt: string | null;
  endReason: string | null;
  endedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminMentorshipsResponse {
  mentorships: IAdminMentorship[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAdminMentorshipsParams {
  mentorId?: string;
  menteeId?: string;
  status?: MentorshipStatus;
  page?: number;
  limit?: number;
}

export interface IAdminMentorshipStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
}

export interface IForceEndMentorshipPayload {
  reason: string;
}

export interface IAdminContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  type: ContactType;
  userId?: string;
  status: ContactStatus;
  adminResponse?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAdminContactMessagesResponse {
  data: IAdminContactMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IAdminContactMessagesParams {
  page?: number;
  limit?: number;
  status?: ContactStatus;
  type?: ContactType;
  search?: string;
  sortBy?: ContactSortField;
  sortOrder?: SortOrder;
}

export interface IAdminContactStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byType: {
    general: number;
    suspended: number;
    feedback: number;
    support: number;
  };
}

export interface IUpdateContactStatusPayload {
  status: ContactStatus;
}

export interface IRespondToContactPayload {
  response: string;
}