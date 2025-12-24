export type NotificationType =
  | 'application_submitted'
  | 'application_approved'
  | 'application_declined'
  | 'request_received'
  | 'request_accepted'
  | 'request_declined'
  | 'request_cancelled'
  | 'request_expired'
  | 'meeting_scheduled'
  | 'meeting_rescheduled'
  | 'meeting_cancelled'
  | 'meeting_reminder'
  | 'mentorship_started'
  | 'mentorship_ended'
  | 'mentor_role_granted'
  | 'mentor_role_revoked';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface INotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface INotificationsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface INotificationsResponse {
  notifications: INotification[];
  meta: INotificationsMeta;
  unreadCount: number;
}

export interface IUnreadCountResponse {
  count: number;
}

export interface IMarkReadRequest {
  notificationIds: string[];
}

export interface IMarkReadResponse {
  success: boolean;
  markedCount: number;
}
