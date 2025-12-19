export type MentorshipRequestStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'cancelled' 
  | 'expired';

export type MentorshipRequestRole = 'as_student' | 'as_mentor';
export type MentorshipStatus = 'active' | 'ended';

export interface IMentorshipRequestUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface IMentorshipRequest {
  id: string;
  studentId: string;
  student: IMentorshipRequestUser;
  mentorId: string;
  mentorProfileId: string;
  mentor: IMentorshipRequestUser;
  message: string;
  status: MentorshipRequestStatus;
  declineReason: string | null;
  expiresAt: string;
  respondedAt: string | null;
  createdAt: string;
  mentorshipId?: string;
}

export interface IMentorshipUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  email: string;
}

export interface IMentorship {
  id: string;
  mentorId: string;
  mentor: IMentorshipUser;
  studentId: string;
  student: IMentorshipUser;
  status: MentorshipStatus;
  endReason: string | null;
  endedBy: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
}

export interface IMentorshipsParams {
  status?: MentorshipStatus;
  role?: MentorshipRequestRole;
  page?: number;
  limit?: number;
}

export interface IMentorshipsResponse {
  mentorships: IMentorship[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IEndMentorshipRequest {
  reason: string;
}

export interface ICreateMentorshipRequest {
  mentorId: string;
  message: string;
}

export interface IAcceptMentorshipRequest {
  message?: string;
}

export interface IDeclineMentorshipRequest {
  reason: string;
}

export interface IMentorshipRequestsParams {
  status?: MentorshipRequestStatus;
  role?: MentorshipRequestRole;
  page?: number;
  limit?: number;
}

export interface IMentorshipRequestsResponse {
  requests: IMentorshipRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}