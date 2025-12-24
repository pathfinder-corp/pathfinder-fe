import { io, Socket } from 'socket.io-client';
import type { IChatMessage } from '@/types';

type MessageCallback = (message: IChatMessage) => void;
type TypingCallback = (data: {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}) => void;
type ReadCallback = (data: {
  conversationId: string;
  messageIds: string[];
  readBy: string;
}) => void;
type MentorshipEndedCallback = (data: {
  mentorshipId: string;
  status: string;
  endReason?: string;
  endedBy?: string;
  endedAt?: Date;
}) => void;
type MentorshipStartedCallback = (data: {
  mentorshipId: string;
  status: string;
  conversationId: string;
}) => void;
type ConversationMentorshipCallback = (data: {
  conversationId: string;
  mentorshipId: string;
  status: string;
  endReason?: string;
  endedBy?: string;
  endedAt?: string;
}) => void;
type ConnectionCallback = () => void;
type UserStatusCallback = (data: { userId: string; isOnline: boolean }) => void;

class SocketService {
  private socket: Socket | null = null;
  private messageCallbacks: Map<string, MessageCallback[]> = new Map();
  private typingCallbacks: Map<string, TypingCallback[]> = new Map();
  private readCallbacks: Map<string, ReadCallback[]> = new Map();
  private mentorshipEndedCallbacks: MentorshipEndedCallback[] = [];
  private mentorshipStartedCallbacks: MentorshipStartedCallback[] = [];
  private conversationMentorshipCallbacks: Map<
    string,
    ConversationMentorshipCallback[]
  > = new Map();
  private connectionCallbacks: ConnectionCallback[] = [];
  private disconnectionCallbacks: ConnectionCallback[] = [];
  private userStatusCallbacks: UserStatusCallback[] = [];

  connect(token: string, userId: string): void {
    if (this.socket?.connected) {
      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
      'http://localhost:8000';

    this.socket = io(`${baseUrl}/chat`, {
      auth: { token, userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.connectionCallbacks.forEach((cb) => cb());
    });

    this.socket.on('disconnect', () => {
      this.disconnectionCallbacks.forEach((cb) => cb());
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.onAny((eventName, ...args) => {
      console.log('Socket event received:', eventName, args);
    });

    this.socket.on('message:new', (message: IChatMessage) => {
      const callbacks = this.messageCallbacks.get(message.conversationId) || [];
      callbacks.forEach((cb) => cb(message));

      const globalCallbacks = this.messageCallbacks.get('*') || [];
      globalCallbacks.forEach((cb) => cb(message));
    });

    this.socket.on('message:edited', (message: IChatMessage) => {
      const callbacks = this.messageCallbacks.get(message.conversationId) || [];
      callbacks.forEach((cb) => cb(message));

      const globalCallbacks = this.messageCallbacks.get('*') || [];
      globalCallbacks.forEach((cb) => cb(message));
    });

    this.socket.on('message:deleted', (message: IChatMessage) => {
      const callbacks = this.messageCallbacks.get(message.conversationId) || [];
      callbacks.forEach((cb) => cb(message));

      const globalCallbacks = this.messageCallbacks.get('*') || [];
      globalCallbacks.forEach((cb) => cb(message));
    });

    this.socket.on(
      'messages:read',
      (data: {
        conversationId: string;
        messageIds: string[];
        readBy: string;
      }) => {
        const callbacks = this.readCallbacks.get(data.conversationId) || [];
        callbacks.forEach((cb) => cb(data));

        const globalCallbacks = this.readCallbacks.get('*') || [];
        globalCallbacks.forEach((cb) => cb(data));
      }
    );

    this.socket.on(
      'typing:start',
      (data: { conversationId: string; userId: string }) => {
        const typingData = { ...data, isTyping: true };
        const callbacks = this.typingCallbacks.get(data.conversationId) || [];
        callbacks.forEach((cb) => cb(typingData));

        const globalCallbacks = this.typingCallbacks.get('*') || [];
        globalCallbacks.forEach((cb) => cb(typingData));
      }
    );

    this.socket.on(
      'typing:stop',
      (data: { conversationId: string; userId: string }) => {
        const typingData = { ...data, isTyping: false };
        const callbacks = this.typingCallbacks.get(data.conversationId) || [];
        callbacks.forEach((cb) => cb(typingData));

        const globalCallbacks = this.typingCallbacks.get('*') || [];
        globalCallbacks.forEach((cb) => cb(typingData));
      }
    );

    this.socket.on(
      'mentorship:ended',
      (data: {
        mentorshipId: string;
        status: string;
        endReason?: string;
        endedBy?: string;
        endedAt?: Date;
      }) => {
        this.mentorshipEndedCallbacks.forEach((cb) => cb(data));
      }
    );

    this.socket.on(
      'mentorship:started',
      (data: {
        mentorshipId: string;
        status: string;
        conversationId: string;
      }) => {
        this.mentorshipStartedCallbacks.forEach((cb) => cb(data));
      }
    );

    this.socket.on(
      'conversation:mentorship',
      (data: {
        conversationId: string;
        mentorshipId: string;
        status: string;
        endReason?: string;
        endedBy?: string;
        endedAt?: string;
      }) => {
        const callbacks =
          this.conversationMentorshipCallbacks.get(data.conversationId) || [];
        callbacks.forEach((cb) => cb(data));

        const globalCallbacks =
          this.conversationMentorshipCallbacks.get('*') || [];
        globalCallbacks.forEach((cb) => cb(data));
      }
    );

    this.socket.on('user:online', (data: { userId: string }) => {
      this.userStatusCallbacks.forEach((cb) =>
        cb({ userId: data.userId, isOnline: true })
      );
    });

    this.socket.on('user:offline', (data: { userId: string }) => {
      this.userStatusCallbacks.forEach((cb) =>
        cb({ userId: data.userId, isOnline: false })
      );
    });

    this.socket.on(
      'user:status',
      (data: { userId: string; isOnline: boolean }) => {
        this.userStatusCallbacks.forEach((cb) =>
          cb({ userId: data.userId, isOnline: data.isOnline })
        );
      }
    );
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('conversation:join', { conversationId });
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('conversation:leave', { conversationId });
    }
  }

  sendMessage(
    conversationId: string,
    content: string,
    parentMessageId?: string
  ): void {
    if (this.socket?.connected) {
      this.socket.emit('message:send', {
        conversationId,
        content,
        parentMessageId,
      });
    }
  }

  editMessage(
    conversationId: string,
    messageId: string,
    content: string
  ): void {
    if (this.socket?.connected) {
      this.socket.emit('message:edit', { conversationId, messageId, content });
    }
  }

  deleteMessage(conversationId: string, messageId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('message:delete', { conversationId, messageId });
    }
  }

  sendTyping(conversationId: string, isTyping: boolean): void {
    if (this.socket?.connected) {
      if (isTyping) {
        this.socket.emit('typing:start', { conversationId });
      } else {
        this.socket.emit('typing:stop', { conversationId });
      }
    }
  }

  markAsRead(conversationId: string, messageIds: string[]): void {
    if (this.socket?.connected) {
      this.socket.emit('messages:read', { conversationId, messageIds });
    }
  }

  onMessage(conversationId: string, callback: MessageCallback): () => void {
    const callbacks = this.messageCallbacks.get(conversationId) || [];
    callbacks.push(callback);
    this.messageCallbacks.set(conversationId, callbacks);

    return () => {
      const cbs = this.messageCallbacks.get(conversationId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.messageCallbacks.set(conversationId, cbs);
      }
    };
  }

  onTyping(conversationId: string, callback: TypingCallback): () => void {
    const callbacks = this.typingCallbacks.get(conversationId) || [];
    callbacks.push(callback);
    this.typingCallbacks.set(conversationId, callbacks);

    return () => {
      const cbs = this.typingCallbacks.get(conversationId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.typingCallbacks.set(conversationId, cbs);
      }
    };
  }

  onRead(conversationId: string, callback: ReadCallback): () => void {
    const callbacks = this.readCallbacks.get(conversationId) || [];
    callbacks.push(callback);
    this.readCallbacks.set(conversationId, callbacks);

    return () => {
      const cbs = this.readCallbacks.get(conversationId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.readCallbacks.set(conversationId, cbs);
      }
    };
  }

  onConnect(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback);
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  onDisconnect(callback: ConnectionCallback): () => void {
    this.disconnectionCallbacks.push(callback);
    return () => {
      const index = this.disconnectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.disconnectionCallbacks.splice(index, 1);
      }
    };
  }

  onMentorshipEnded(callback: MentorshipEndedCallback): () => void {
    this.mentorshipEndedCallbacks.push(callback);
    return () => {
      const index = this.mentorshipEndedCallbacks.indexOf(callback);
      if (index > -1) {
        this.mentorshipEndedCallbacks.splice(index, 1);
      }
    };
  }

  onMentorshipStarted(callback: MentorshipStartedCallback): () => void {
    this.mentorshipStartedCallbacks.push(callback);
    return () => {
      const index = this.mentorshipStartedCallbacks.indexOf(callback);
      if (index > -1) {
        this.mentorshipStartedCallbacks.splice(index, 1);
      }
    };
  }

  onConversationMentorship(
    conversationId: string,
    callback: ConversationMentorshipCallback
  ): () => void {
    const callbacks =
      this.conversationMentorshipCallbacks.get(conversationId) || [];
    callbacks.push(callback);
    this.conversationMentorshipCallbacks.set(conversationId, callbacks);

    return () => {
      const cbs =
        this.conversationMentorshipCallbacks.get(conversationId) || [];
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
        this.conversationMentorshipCallbacks.set(conversationId, cbs);
      }
    };
  }

  onUserStatus(callback: UserStatusCallback): () => void {
    this.userStatusCallbacks.push(callback);
    return () => {
      const index = this.userStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.userStatusCallbacks.splice(index, 1);
      }
    };
  }
}

export const socketService = new SocketService();
