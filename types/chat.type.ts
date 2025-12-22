import { MentorshipStatus } from './mentorship.type';

export type MessageType = 'text' | 'image' | 'file' | 'system';

export interface IChatParticipant {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role?: 'mentor' | 'student';
}

export interface IChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: IChatParticipant;
  type: MessageType;
  content: string;
  parentMessageId: string | null;
  parentMessage: IChatMessage | null;
  isEdited: boolean;
  editedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  isSystemMessage?: boolean;
  attachmentUrl?: string;
  attachmentThumbnailUrl?: string;
  attachmentFileName?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
}

export interface IChatConversation {
  id: string;
  mentorshipId: string;
  mentorId?: string;
  mentorProfileId?: string;
  studentId?: string;
  participant1Id: string;
  participant2Id: string;
  participant1?: IChatParticipant;
  participant2?: IChatParticipant;
  lastMessageAt: string | null;
  lastMessage?: IChatMessage | null;
  unreadCount?: number;
  createdAt: string;
  mentorshipStatus?: MentorshipStatus;
  mentorshipEndReason?: string;
  mentorshipEndedBy?: string;
  mentorshipEndedAt?: string;
}

export interface IGetMessagesResponse {
  messages: IChatMessage[];
  hasMore: boolean;
  nextCursor: string | null;
  mentorshipStatus?: MentorshipStatus;
  mentorshipId?: string;
  mentorshipEndReason?: string;
  mentorshipEndedBy?: string;
  mentorshipEndedAt?: string;
}

export interface IGetMessagesParams {
  limit?: number;
  before?: string;
}

export interface ISendChatMessageRequest {
  content: string;
  parentMessageId?: string;
}

export interface IEditMessageRequest {
  content: string;
}

export interface ISocketMessageEvent {
  message: IChatMessage;
  conversationId: string;
}

export interface ISocketTypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface ISocketReadEvent {
  conversationId: string;
  messageIds: string[];
  readBy: string;
}