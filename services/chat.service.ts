import type {
  IChatConversation,
  IChatMessage,
  IGetMessagesResponse,
  IGetMessagesParams,
  ISendChatMessageRequest,
  IEditMessageRequest,
  IUnreadCountResponse,
} from '@/types';
import { api, extractErrorMessage } from '@/lib';

export const chatService = {
  getConversations: async (): Promise<IChatConversation[]> => {
    try {
      const response = await api.get<IChatConversation[]>('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Get conversations failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getConversationByMentorship: async (mentorshipId: string): Promise<IChatConversation> => {
    try {
      const response = await api.get<IChatConversation>(
        `/chat/conversations/mentorship/${mentorshipId}`
      );
      return response.data;
    } catch (error) {
      console.error('Get conversation by mentorship failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getMessages: async (
    conversationId: string,
    params?: IGetMessagesParams
  ): Promise<IGetMessagesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', String(params.limit));
      if (params?.before) queryParams.append('before', params.before);

      const response = await api.get<IGetMessagesResponse>(
        `/chat/conversations/${conversationId}/messages?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Get messages failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  searchMessages: async (
    conversationId: string,
    params: { q: string; limit?: number; before?: string }
  ): Promise<IGetMessagesResponse> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('q', params.q);
      if (params.limit) queryParams.append('limit', String(params.limit));
      if (params.before) queryParams.append('before', params.before);

      const response = await api.get<IGetMessagesResponse>(
        `/chat/conversations/${conversationId}/messages/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Search messages failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  uploadAttachment: async (
    conversationId: string,
    file: File,
    caption?: string
  ): Promise<IChatMessage> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (caption && caption.trim()) {
        formData.append('caption', caption.trim());
      }

      const response = await api.post<IChatMessage>(
        `/chat/conversations/${conversationId}/messages/attachment`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Upload chat attachment failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  sendMessage: async (
    conversationId: string,
    data: ISendChatMessageRequest
  ): Promise<IChatMessage> => {
    try {
      const response = await api.post<IChatMessage>(
        `/chat/conversations/${conversationId}/messages`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Send message failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  editMessage: async (messageId: string, data: IEditMessageRequest): Promise<IChatMessage> => {
    try {
      const response = await api.put<IChatMessage>(`/chat/messages/${messageId}`, data);
      return response.data;
    } catch (error) {
      console.error('Edit message failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  deleteMessage: async (messageId: string): Promise<IChatMessage> => {
    try {
      const response = await api.delete<IChatMessage>(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete message failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },

  getUnreadCount: async (conversationId: string): Promise<IUnreadCountResponse> => {
    try {
      const response = await api.get<IUnreadCountResponse>(
        `/chat/conversations/${conversationId}/unread-count`
      );
      return response.data;
    } catch (error) {
      console.error('Get unread count failed:', error);
      const message = extractErrorMessage(error);
      if (message) throw new Error(message);
      throw error;
    }
  },
};