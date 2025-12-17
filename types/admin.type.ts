import { UserRole, UserStatus } from './user.type';
import { AssessmentSortField, RoadmapSortField, SortField, SortOrder } from './table.type';
import { AssessmentDifficulty, AssessmentStatus } from './assessment.type';
import { 
  MentorApplicationStatus,
  IMentorApplication,
  IMentorApplicationStatusHistory
} from './mentor.type';

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
  isSharedWithAll: boolean;
  createdAt: string;
  updatedAt: string;
  owner: IAdminAssessmentOwner;
}

export interface IAdminAssessmentDetail extends IAdminAssessment {
  answeredCount: number;
  shareCount: number;
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
  isSharedWithAll?: boolean;
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