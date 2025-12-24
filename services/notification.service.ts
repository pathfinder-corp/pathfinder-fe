import type {
  INotificationsParams,
  INotificationsResponse,
  IUnreadCountResponse,
  IMarkReadRequest,
  IMarkReadResponse,
} from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const notificationService = {
  getNotifications: async (
    params?: INotificationsParams
  ): Promise<INotificationsResponse> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.unreadOnly !== undefined)
        queryParams.append('unreadOnly', String(params.unreadOnly));

      const response = await api.get<INotificationsResponse>(
        `/notifications?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Get notifications failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getUnreadCount: async (): Promise<IUnreadCountResponse> => {
    try {
      const response = await api.get<IUnreadCountResponse>(
        '/notifications/unread-count'
      );
      return response.data;
    } catch (error) {
      console.error('Get unread count failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  markAsRead: async (data: IMarkReadRequest): Promise<IMarkReadResponse> => {
    try {
      const response = await api.post<IMarkReadResponse>(
        '/notifications/mark-read',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Mark as read failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};
