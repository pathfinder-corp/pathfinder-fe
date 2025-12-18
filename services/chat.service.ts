import type {
  IChatConversation,
  IChatMessage,
  IGetMessagesResponse,
  IGetMessagesParams,
  ISendChatMessageRequest,
  IEditMessageRequest,
  IUnreadCountResponse,
} from '@/types';
import { api } from '@/lib';

export const chatService = {
  getConversations: async (): Promise<IChatConversation[]> => {
    try {
      const response = await api.get<IChatConversation[]>('/chat/conversations');
      return response.data;
    } catch (error) {
      console.error('Get conversations failed:', error);
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
      throw error;
    }
  },

  editMessage: async (messageId: string, data: IEditMessageRequest): Promise<IChatMessage> => {
    try {
      const response = await api.put<IChatMessage>(`/chat/messages/${messageId}`, data);
      return response.data;
    } catch (error) {
      console.error('Edit message failed:', error);
      throw error;
    }
  },

  deleteMessage: async (messageId: string): Promise<IChatMessage> => {
    try {
      const response = await api.delete<IChatMessage>(`/chat/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Delete message failed:', error);
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
      throw error;
    }
  },
};

