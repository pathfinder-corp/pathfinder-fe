import { UserRole } from "./user.type";

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface IMessageParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface IMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IConversation {
  id: string;
  participants: IMessageParticipant[];
  lastMessage: IMessage | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IConversationsResponse {
  data: IConversation[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IMessagesResponse {
  data: IMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ISendMessageRequest {
  conversationId: string;
  content: string;
}

export interface ICreateConversationRequest {
  participantId: string;
  initialMessage?: string;
}

