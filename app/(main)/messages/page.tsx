'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { 
  Send, 
  MessageCircle,
  Check,
  CheckCheck,
  Edit2,
  Trash2,
  Reply,
  Loader2,
  UserX,
  UserPlus,
  Paperclip,
  FileText
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useUserStore, usePresenceStore } from '@/stores';
import { chatService, socketService, mentorshipService } from '@/services';
import { getAuthToken, formatFileSize } from '@/lib';
import type { IChatConversation, IChatMessage, IChatParticipant, MentorshipStatus } from '@/types';

import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { ConversationList } from './components/ConversationList';
import { ChatHeader } from './components/ChatHeader';
import { MessageInputBar } from './components/MessageInputBar';

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
  FilePondPluginImagePreview
);

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  const { setUserOnline, setManyUsersOnline, isUserOnline } = usePresenceStore();
  
  const token = useMemo(() => getAuthToken(), []);
  
  const [conversations, setConversations] = useState<IChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<IChatConversation | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [editingMessage, setEditingMessage] = useState<IChatMessage | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
  const [deletingMessage, setDeletingMessage] = useState<IChatMessage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  
  const [isEndMentorshipDialogOpen, setIsEndMentorshipDialogOpen] = useState<boolean>(false);
  const [endMentorshipReason, setEndMentorshipReason] = useState<string>('');
  const [isEndingMentorship, setIsEndingMentorship] = useState<boolean>(false);
  
  const [replyingTo, setReplyingTo] = useState<IChatMessage | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement | null>(null);
  const joinedConversationsRef = useRef<Set<string>>(new Set());
  const selectedConversationIdRef = useRef<string | null>(null);
  const shouldScrollRef = useRef<boolean>(true);
  const prevMessagesLengthRef = useRef<number>(0);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoLoadingRef = useRef<boolean>(false);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadCaption, setUploadCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const currentUserId = user?.id;

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      let data = await chatService.getConversations();
      
      if (data.length === 0) {
        try {
          const response = await mentorshipService.getMentorships({ status: 'active' });
          const activeMentorships = response.mentorships || [];
          
          for (const mentorship of activeMentorships) {
            try {
              await chatService.getConversationByMentorship(mentorship.id);
            } catch (err) {
              const errorMessage = err instanceof Error 
                ? err.message 
                : 'Failed to create conversation for mentorship';
              toast.error('Failed to create conversation for mentorship', {
                description: errorMessage,
              });
            }
          }
          
          if (activeMentorships.length > 0) {
            data = await chatService.getConversations();
          }
        } catch (err) {
          const errorMessage = err instanceof Error 
            ? err.message 
            : 'Failed to fetch mentorships';
          toast.error('Failed to fetch mentorships', {
            description: errorMessage,
          });
        }
      }
      
      const updatedConversations = await Promise.all(
        data.map(async (conv) => {
          
          const mentorshipStatus: MentorshipStatus = (conv.mentorshipStatus || 'active') as MentorshipStatus;
          
          if (!conv.lastMessage) {
            try {
              const messagesData = await chatService.getMessages(conv.id, { limit: 1 });
              if (messagesData.messages.length > 0) {
                const lastMsg = messagesData.messages[messagesData.messages.length - 1];
                return {
                  ...conv,
                  lastMessage: lastMsg,
                  lastMessageAt: lastMsg.createdAt,
                  mentorshipStatus,
                  mentorshipEndReason: conv.mentorshipEndReason,
                  mentorshipEndedBy: conv.mentorshipEndedBy,
                  mentorshipEndedAt: conv.mentorshipEndedAt
                };
              }
            } catch (err) {
              const errorMessage = err instanceof Error 
                ? err.message 
                : 'Failed to fetch last message for conversation';
              toast.error('Failed to fetch last message for conversation', {
                description: errorMessage,
              });
            }
          }
          
          return {
            ...conv,
            mentorshipStatus,
            mentorshipEndReason: conv.mentorshipEndReason,
            mentorshipEndedBy: conv.mentorshipEndedBy,
            mentorshipEndedAt: conv.mentorshipEndedAt
          };
        })
      );

      const presenceSeed: Record<string, boolean> = {};
      updatedConversations.forEach((conv) => {
        if (conv.participant1?.id && typeof conv.participant1.isOnline === 'boolean') {
          presenceSeed[conv.participant1.id] = conv.participant1.isOnline;
        }
        if (conv.participant2?.id && typeof conv.participant2.isOnline === 'boolean') {
          presenceSeed[conv.participant2.id] = conv.participant2.isOnline;
        }
      });
      setManyUsersOnline(presenceSeed);
      
      updatedConversations.sort((a, b) => 
        new Date(b.lastMessageAt || b.createdAt).getTime() - 
        new Date(a.lastMessageAt || a.createdAt).getTime()
      );
      
      setConversations(updatedConversations);
      
      const conversationId = searchParams.get('conversation');
      if (conversationId && updatedConversations.length > 0) {
        const conv = updatedConversations.find(c => c.id === conversationId);
        if (conv) {
          setSelectedConversation(conv);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch conversations';
      toast.error('Failed to load conversations', {
        description: errorMessage,
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [searchParams, setManyUsersOnline]);

  const fetchMessages = useCallback(async (conversationId: string, cursor?: string) => {
    try {
      if (cursor) {
        shouldScrollRef.current = false;
        setIsLoadingMore(true);
      } else {
        shouldScrollRef.current = true;
        prevMessagesLengthRef.current = 0;
        setIsLoadingMessages(true);
        setMessages([]);
      }
      
      const data = await chatService.getMessages(conversationId, {
        limit: 50,
        before: cursor,
      });
      
      if (data.mentorshipStatus && data.mentorshipId) {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId
              ? { 
                  ...conv, 
                  mentorshipStatus: data.mentorshipStatus as MentorshipStatus,
                  mentorshipId: data.mentorshipId || conv.mentorshipId,
                  mentorshipEndReason: data.mentorshipEndReason,
                  mentorshipEndedBy: data.mentorshipEndedBy,
                  mentorshipEndedAt: data.mentorshipEndedAt
                }
              : conv
          )
        );
        
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(prev => 
            prev ? {
              ...prev,
              mentorshipStatus: data.mentorshipStatus as MentorshipStatus,
              mentorshipId: data.mentorshipId || prev.mentorshipId,
              mentorshipEndReason: data.mentorshipEndReason,
              mentorshipEndedBy: data.mentorshipEndedBy,
              mentorshipEndedAt: data.mentorshipEndedAt
            } : null
          );
        }
      }
      
      const presenceSeed: Record<string, boolean> = {};
      data.messages.forEach((msg) => {
        if (msg.sender?.id && typeof msg.sender.isOnline === 'boolean') {
          presenceSeed[msg.sender.id] = msg.sender.isOnline;
        }
        if (msg.parentMessage?.sender?.id && typeof msg.parentMessage.sender.isOnline === 'boolean') {
          presenceSeed[msg.parentMessage.sender.id] = msg.parentMessage.sender.isOnline;
        }
      });
      setManyUsersOnline(presenceSeed);

      if (cursor) {
        setMessages(prev => [...data.messages, ...prev]);
        prevMessagesLengthRef.current += data.messages.length;
      } else {
        setMessages(data.messages);
        
        const unreadMessageIds = data.messages
          .filter(m => m.senderId !== currentUserId && !m.readAt)
          .map(m => m.id);
        
        if (unreadMessageIds.length > 0) {
          socketService.markAsRead(conversationId, unreadMessageIds);
        }
        
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        });
      }
      
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to fetch messages';
      toast.error('Failed to load messages', {
        description: errorMessage,
      });
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMore(false);
      shouldScrollRef.current = true;
    }
  }, [currentUserId, selectedConversation?.id, setManyUsersOnline]);

  useEffect(() => {
    if (token && currentUserId) {
      socketService.connect(token, currentUserId);
      
      const unsubConnect = socketService.onConnect(() => {
        setIsSocketConnected(true);
      });
      
      const unsubDisconnect = socketService.onDisconnect(() => {
        setIsSocketConnected(false);
      });

      const unsubUserStatus = socketService.onUserStatus(({ userId, isOnline }) => {
        setUserOnline(userId, isOnline);
      });
      
      if (socketService.isConnected()) {
        setIsSocketConnected(true);
      }
      
      return () => {
        unsubConnect();
        unsubDisconnect();
        unsubUserStatus();
        socketService.disconnect();
      };
    }
  }, [token, currentUserId, setUserOnline]);

  useEffect(() => {
    if (!isSocketConnected) {
      joinedConversationsRef.current.clear();
      return;
    }

    conversations.forEach(conv => {
      if (!joinedConversationsRef.current.has(conv.id)) {
        socketService.joinConversation(conv.id);
        joinedConversationsRef.current.add(conv.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSocketConnected, conversations.length]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConversation) return;
    if (selectedConversationIdRef.current === selectedConversation.id) return;
    
    selectedConversationIdRef.current = selectedConversation.id;
    fetchMessages(selectedConversation.id);
    
    const url = new URL(window.location.href);
    url.searchParams.set('conversation', selectedConversation.id);
    router.replace(url.pathname + url.search, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?.id, fetchMessages, router]);

  useEffect(() => {
    const conversationId = selectedConversation?.id;
    if (!conversationId) return;

    const unsubMessage = socketService.onMessage(conversationId, (message) => {
      setMessages(prev => {
        const existingIndex = prev.findIndex(m => m.id === message.id);
        if (existingIndex !== -1) {
          const existingMessage = prev[existingIndex];
          const isOwn = message.senderId === currentUserId;
          
          if (isOwn && existingMessage.readAt) {
            return prev.map(m => 
              m.id === message.id 
                ? { ...message, readAt: existingMessage.readAt }
                : m
            );
          }
        
          if (!isOwn && existingMessage.readAt) {
            return prev.map(m => 
              m.id === message.id 
                ? { ...message, readAt: existingMessage.readAt }
                : m
            );
          }
          
          return prev.map(m => m.id === message.id ? message : m);
        }
        return [...prev, message];
      });
      
      if (message.senderId !== currentUserId && !message.isDeleted && !message.isEdited && !message.readAt) {
        socketService.markAsRead(conversationId, [message.id]);
      }
    });

    const unsubTyping = socketService.onTyping(conversationId, (data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.isTyping);
          return newMap;
        });
      }
    });

    const unsubRead = socketService.onRead(conversationId, (data) => {
      if (data.readBy !== currentUserId) {
        setMessages(prev => {
          const updated = prev.map(m => {
            if (data.messageIds.includes(m.id) && m.senderId === currentUserId) {
              const newReadAt = m.readAt || new Date().toISOString();
              return { ...m, readAt: newReadAt };
            }
            return m;
          });
          return updated;
        });
      }
    });

    const unsubConversationMentorship = socketService.onConversationMentorship(conversationId, (data) => {
      const status = data.status as MentorshipStatus;
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId
            ? {
                ...conv,
                mentorshipId: data.mentorshipId,
                mentorshipStatus: status,
                mentorshipEndReason: data.endReason,
                mentorshipEndedBy: data.endedBy,
                mentorshipEndedAt: data.endedAt
              }
            : conv
        )
      );

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => 
          prev ? {
            ...prev,
            mentorshipId: data.mentorshipId,
            mentorshipStatus: status,
            mentorshipEndReason: data.endReason,
            mentorshipEndedBy: data.endedBy,
            mentorshipEndedAt: data.endedAt
          } : null
        );
      }
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubRead();
      unsubConversationMentorship();
    };
  }, [selectedConversation?.id, currentUserId]);

  useEffect(() => {
    const selectedId = selectedConversation?.id;
    
    const unsubGlobal = socketService.onMessage('*', (message) => {
      
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === message.conversationId) {
            const isNewMessage = !message.isEdited && !message.isDeleted;
            const isLastMessage = conv.lastMessage?.id === message.id;
            const shouldUpdateLastMessage = isNewMessage || (isLastMessage && message.isEdited);
            
            const shouldIncrement = isNewMessage && message.senderId !== currentUserId && conv.id !== selectedId;
            
            return {
              ...conv,
              lastMessage: shouldUpdateLastMessage ? message : conv.lastMessage,
              lastMessageAt: shouldUpdateLastMessage ? message.createdAt : conv.lastMessageAt,
              unreadCount: shouldIncrement ? (conv.unreadCount || 0) + 1 : 0,
            };
          }
          return conv;
        }).sort((a, b) => 
          new Date(b.lastMessageAt || b.createdAt).getTime() - 
          new Date(a.lastMessageAt || a.createdAt).getTime()
        )
      );
      
      if (selectedId && message.conversationId === selectedId) {
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === message.id);
          if (existingIndex !== -1) {
            const existingMessage = prev[existingIndex];
            const isOwn = message.senderId === currentUserId;
            
            if (isOwn && existingMessage.readAt) {
              return prev.map(m => 
                m.id === message.id 
                  ? { ...message, readAt: existingMessage.readAt }
                  : m
              );
            }
            
            if (!isOwn && existingMessage.readAt) {
              return prev.map(m => 
                m.id === message.id 
                  ? { ...message, readAt: existingMessage.readAt }
                  : m
              );
            }
            
            return prev.map(m => m.id === message.id ? message : m);
          }
          return [...prev, message];
        });
        
        if (message.senderId !== currentUserId && !message.isDeleted && !message.isEdited && !message.readAt) {
          socketService.markAsRead(selectedId, [message.id]);
        }
      }
    });

    const unsubTyping = socketService.onTyping('*', (data) => {
      if (selectedId && data.conversationId === selectedId && data.userId !== currentUserId) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, data.isTyping);
          return newMap;
        });
      }
    });

    const unsubGlobalRead = socketService.onRead('*', (data) => {
      if (selectedId && data.conversationId === selectedId) {
        if (data.readBy !== currentUserId) {
          setMessages(prev => {
            const updated = prev.map(m => {
              if (data.messageIds.includes(m.id) && m.senderId === currentUserId) {
                const newReadAt = m.readAt || new Date().toISOString();
                return { ...m, readAt: newReadAt };
              }
              return m;
            });
            return updated;
          });
        }
      }
    });

    const unsubMentorshipEnded = socketService.onMentorshipEnded((data) => {
      const endedAtString = data.endedAt 
        ? (typeof data.endedAt === 'string' ? data.endedAt : data.endedAt.toISOString())
        : undefined;
      
      setConversations(prev => 
        prev.map(conv => 
          conv.mentorshipId === data.mentorshipId
            ? { 
                ...conv, 
                mentorshipStatus: 'ended' as const,
                mentorshipEndReason: data.endReason,
                mentorshipEndedBy: data.endedBy,
                mentorshipEndedAt: endedAtString
              }
            : conv
        )
      );

      if (selectedConversation?.mentorshipId === data.mentorshipId) {
        setSelectedConversation(prev => 
          prev ? { 
            ...prev, 
            mentorshipStatus: 'ended' as const,
            mentorshipEndReason: data.endReason,
            mentorshipEndedBy: data.endedBy,
            mentorshipEndedAt: endedAtString
          } : null
        );
      }
    });

    const unsubMentorshipStarted = socketService.onMentorshipStarted(async (data) => {
      try {
        await fetchConversations();
        
        const updatedConversations = await chatService.getConversations();
        const newConversation = updatedConversations.find(
          conv => conv.mentorshipId === data.mentorshipId && conv.mentorshipStatus === 'active'
        );
        
        setSelectedConversation(prev => {
          if (prev?.mentorshipStatus === 'ended' && newConversation) {
            fetchMessages(newConversation.id);
            return newConversation;
          } else if (prev?.id === data.conversationId) {
            fetchMessages(data.conversationId);
            return prev;
          }
          return prev;
        });
      } catch (error) {
        console.error('Failed to refresh conversation after mentorship started:', error);
      }
    });

    return () => {
      unsubGlobal();
      unsubTyping();
      unsubGlobalRead();
      unsubMentorshipEnded();
      unsubMentorshipStarted();
    };
  }, [currentUserId, selectedConversation?.id, selectedConversation?.mentorshipId, fetchConversations, fetchMessages]);

  useEffect(() => {
    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;
    
    if (currentLength > prevLength && shouldScrollRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
    
    prevMessagesLengthRef.current = currentLength;
  }, [messages]);

  useEffect(() => {
    if (!selectedConversation) return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await chatService.getMessages(selectedConversation.id, { limit: 10 });
        
        if (data.mentorshipStatus && data.mentorshipId) {
          setConversations(prev => 
            prev.map(conv => 
              conv.id === selectedConversation.id
                ? { 
                    ...conv, 
                    mentorshipStatus: data.mentorshipStatus as MentorshipStatus,
                    mentorshipId: data.mentorshipId || conv.mentorshipId,
                    mentorshipEndReason: data.mentorshipEndReason,
                    mentorshipEndedBy: data.mentorshipEndedBy,
                    mentorshipEndedAt: data.mentorshipEndedAt
                  }
                : conv
            )
          );
          
          setSelectedConversation(prev => 
            prev ? {
              ...prev,
              mentorshipStatus: data.mentorshipStatus as MentorshipStatus,
              mentorshipId: data.mentorshipId || prev.mentorshipId,
              mentorshipEndReason: data.mentorshipEndReason,
              mentorshipEndedBy: data.mentorshipEndedBy,
              mentorshipEndedAt: data.mentorshipEndedAt
            } : null
          );
        }
        
        const newMessages = data.messages;
        
        setMessages(prev => {
          const hasNewMessages = newMessages.some(m => !prev.some(p => p.id === m.id));
          
          if (hasNewMessages) {
            shouldScrollRef.current = true;
            
            const merged = [...prev];
            for (const msg of newMessages) {
              if (!merged.some(m => m.id === msg.id)) {
                merged.push(msg);
              }
            }
            merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            return merged;
          }
          return prev;
        });
      } catch {}
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedConversation]);

  const startTypingIndicator = useCallback(() => {
    if (!selectedConversation) return;
    
    socketService.sendTyping(selectedConversation.id, true);
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    typingIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        socketService.sendTyping(selectedConversation.id, true);
      }
    }, 3000);
  }, [selectedConversation]);

  const stopTypingIndicator = useCallback(() => {
    if (!selectedConversation) return;
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    socketService.sendTyping(selectedConversation.id, false);
  }, [selectedConversation]);

  const handleInputChange = useCallback((value: string) => {
    setMessageInput(value);
    
    if (value.trim()) {
      if (!typingIntervalRef.current) {
        startTypingIndicator();
      }
    } else {
      stopTypingIndicator();
    }
  }, [startTypingIndicator, stopTypingIndicator]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
  }, [selectedConversation?.id]);

  const getOtherParticipant = (conversation: IChatConversation): IChatParticipant | null => {
    if (conversation.participant1 && conversation.participant1.id !== currentUserId) {
      return conversation.participant1;
    }
    if (conversation.participant2 && conversation.participant2.id !== currentUserId) {
      return conversation.participant2;
    }
    return null;
  };

  const getOtherParticipantRole = (conversation: IChatConversation): string => {
    const other = getOtherParticipant(conversation);
    if (!other) return '';
    
    if (other.role) {
      return other.role === 'mentor' ? 'Mentor' : 'Student';
    }
    
    if (conversation.mentorId && conversation.studentId) {
      return other.id === conversation.mentorId ? 'Mentor' : 'Student';
    }
    
    return '';
  };

  const formatMessageTime = (dateStr: string): string => {
    const date = parseISO(dateStr);
    return format(date, 'HH:mm');
  };

  const formatConversationTime = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = parseISO(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd');
  };

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    if (selectedConversation.mentorshipStatus === 'ended') {
      toast.error('Cannot send messages. This mentorship has ended.');
      return;
    }
    
    const content = messageInput.trim();
    const parentId = replyingTo?.id;
    
    setMessageInput('');
    setReplyingTo(null);
    stopTypingIndicator();

    try {
      shouldScrollRef.current = true;
      
      const message = await chatService.sendMessage(selectedConversation.id, {
        content,
        parentMessageId: parentId,
      });
      
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
      
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
            };
          }
          return conv;
        })
      );
      
      requestAnimationFrame(() => {
        messageInputRef.current?.focus();
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to send message';
      toast.error('Failed to send message', {
        description: errorMessage,
      });
      setMessageInput(prev => prev || content);
    }
  }, [messageInput, selectedConversation, replyingTo, stopTypingIndicator]);

  const handleUploadAttachment = useCallback(async () => {
    if (!selectedConversation || uploadFiles.length === 0) return;
    
    if (selectedConversation.mentorshipStatus === 'ended') {
      toast.error('Cannot send attachments. This mentorship has ended.');
      return;
    }

    const file = uploadFiles[0];

    try {
      setIsUploading(true);

      const message = await chatService.uploadAttachment(
        selectedConversation.id,
        file,
        uploadCaption
      );

      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev;
        return [...prev, message];
      });

      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
            };
          }
          return conv;
        })
      );

      setIsUploadDialogOpen(false);
      setUploadFiles([]);
      setUploadCaption('');

      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload attachment';
      toast.error('Failed to upload attachment', {
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  }, [selectedConversation, uploadFiles, uploadCaption]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = useCallback(async () => {
    if (!editingMessage || !editContent.trim() || !selectedConversation) return;
    
    if (selectedConversation.mentorshipStatus === 'ended') {
      toast.error('Cannot edit messages. This mentorship has ended.');
      return;
    }
    
    try {
      const optimisticMessage = {
        ...editingMessage,
        content: editContent.trim(),
        isEdited: true,
        editedAt: new Date().toISOString(),
      };
      
      setMessages(prev => 
        prev.map(m => m.id === editingMessage.id ? optimisticMessage : m)
      );
      
      setIsEditDialogOpen(false);
      setEditingMessage(null);
      setEditContent('');
      
      await chatService.editMessage(editingMessage.id, {
        content: editContent.trim(),
      });
      
    } catch (error) {
      setMessages(prev => 
        prev.map(m => m.id === editingMessage.id ? editingMessage : m)
      );
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to edit message';
      toast.error('Failed to edit message', {
        description: errorMessage,
      });
    }
  }, [editingMessage, editContent, selectedConversation]);

  const handleDeleteMessage = useCallback(async () => {
    if (!deletingMessage || !selectedConversation) return;
    
    if (selectedConversation.mentorshipStatus === 'ended') {
      toast.error('Cannot delete messages. This mentorship has ended.');
      return;
    }
    
    try {
      const optimisticMessage = {
        ...deletingMessage,
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        content: 'This message was deleted',
      };
      
      setMessages(prev => 
        prev.map(m => m.id === deletingMessage.id ? optimisticMessage : m)
      );
      
      setIsDeleteDialogOpen(false);
      setDeletingMessage(null);
      
      await chatService.deleteMessage(deletingMessage.id);
      
    } catch (error) {
      setMessages(prev => 
        prev.map(m => m.id === deletingMessage.id ? deletingMessage : m)
      );
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete message';
      toast.error('Failed to delete message', {
        description: errorMessage,
      });
    }
  }, [deletingMessage, selectedConversation]);

  const handleEndMentorship = useCallback(async () => {
    if (!selectedConversation || !endMentorshipReason.trim()) return;
    
    try {
      setIsEndingMentorship(true);
      
      await mentorshipService.endMentorship(selectedConversation.mentorshipId, {
        reason: endMentorshipReason.trim(),
      });
      
      setConversations(prev => 
        prev.map(c => 
          c.id === selectedConversation.id 
            ? { ...c, mentorshipStatus: 'ended' as const }
            : c
        )
      );
      
      setSelectedConversation(prev => 
        prev ? { ...prev, mentorshipStatus: 'ended' as const } : null
      );
      
      setIsEndMentorshipDialogOpen(false);
      setEndMentorshipReason('');
    } catch (error) {
      console.error('Failed to end mentorship:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to end mentorship';
      toast.error('Failed to end mentorship', {
        description: errorMessage,
      });
    } finally {
      setIsEndingMentorship(false);
    }
  }, [selectedConversation, endMentorshipReason]);

  const handleLoadMore = useCallback(() => {
    if (selectedConversation && hasMore && nextCursor && !isLoadingMore) {
      fetchMessages(selectedConversation.id, nextCursor);
    }
  }, [selectedConversation, hasMore, nextCursor, isLoadingMore, fetchMessages]);

  useEffect(() => {
    const scrollAreaViewport = messagesContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;
    if (!scrollAreaViewport) return;
    
    scrollAreaViewportRef.current = scrollAreaViewport;
    
    const handleScroll = () => {
      if (isAutoLoadingRef.current || isLoadingMore || !hasMore || !nextCursor) return;
      
      const scrollTop = scrollAreaViewport.scrollTop;
      const threshold = 200;
      
      if (scrollTop < threshold) {
        isAutoLoadingRef.current = true;
        const previousScrollHeight = scrollAreaViewport.scrollHeight;
        const previousScrollTop = scrollAreaViewport.scrollTop;
        
        handleLoadMore();
        
        setTimeout(() => {
          const newScrollHeight = scrollAreaViewport.scrollHeight;
          const scrollDiff = newScrollHeight - previousScrollHeight;
          scrollAreaViewport.scrollTop = previousScrollTop + scrollDiff;
          isAutoLoadingRef.current = false;
        }, 100);
      }
    };
    
    scrollAreaViewport.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollAreaViewport.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, nextCursor, isLoadingMore, handleLoadMore]);

  const getStatusIcon = (message: IChatMessage) => {
    if (message.readAt) {
      return <CheckCheck className="size-4 text-white" />;
    }
    return <Check className="size-4 text-neutral-400" />;
  };

  const isOtherTyping = Array.from(typingUsers.values()).some(isTyping => isTyping);

  const renderMessageContent = useCallback((content: string, isOwn: boolean) => {
    const urlRegex = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
    const parts = content.split(urlRegex);
    
    if (parts.length === 1) {
      return <span>{content}</span>;
    }

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        urlRegex.lastIndex = 0;
        const href = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`
              underline underline-offset-2 decoration-1 
              transition-colors duration-200
              ${isOwn 
                ? 'text-blue-600 hover:text-blue-700 decoration-blue-600/50 hover:decoration-blue-700' 
                : 'text-blue-400 hover:text-blue-300 decoration-blue-400/50 hover:decoration-blue-300'
              }
            `}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  }, []);

  const renderAttachment = (message: IChatMessage, isOwn: boolean) => {
    if (message.type === 'image' && message.attachmentUrl) {
      const src = message.attachmentThumbnailUrl || message.attachmentUrl;
      const alt = message.attachmentFileName || 'Image attachment';
      return (
        <div className="space-y-2">
          <PhotoView src={message.attachmentUrl!}>
            <button
              type="button"
              className="block overflow-hidden rounded-2xl border border-neutral-700/60 bg-neutral-900/40 max-w-md cursor-pointer"
            >
              <div className="relative w-full max-w-md aspect-video bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover"
                />
              </div>
            </button>
          </PhotoView>
          {message.attachmentFileName && (
            <p className="text-sm text-neutral-400 truncate">
              {message.attachmentFileName}
              {message.attachmentSize ? (
                <span className="ml-2 text-neutral-500">
                  ({formatFileSize(message.attachmentSize)})
                </span>
              ) : null}
            </p>
          )}
        </div>
      );
    }

    if (message.type === 'file' && message.attachmentUrl) {
      const fileName = message.attachmentFileName || 'Download file';
      return (
        <button
          type="button"
          onClick={() => window.open(message.attachmentUrl!, '_blank', 'noopener,noreferrer')}
          className={`w-full max-w-md flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer ${
            isOwn
              ? 'border-neutral-300/80 bg-white/90 text-neutral-900 hover:bg-white'
              : 'border-neutral-700 bg-neutral-900/60 text-neutral-50 hover:bg-neutral-900'
          } transition-colors text-left`}
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-800/80 text-neutral-100 shrink-0">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{fileName}</p>
          </div>
        </button>
      );
    }

    return null;
  };

  useEffect(() => {
    if (isOtherTyping) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [isOtherTyping]);

  return (
    <div className="h-full flex overflow-hidden bg-neutral-950">
      <ConversationList
        conversations={conversations}
        selectedConversation={selectedConversation}
        currentUserId={currentUserId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoadingConversations={isLoadingConversations}
        onSelectConversation={(conversation) => {
          setSelectedConversation(conversation);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversation.id ? { ...c, unreadCount: 0 } : c,
            ),
          );
        }}
        getOtherParticipant={getOtherParticipant}
        formatConversationTime={formatConversationTime}
        isUserOnline={isUserOnline}
        isSocketConnected={isSocketConnected}
      />

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {(() => {
              const other = getOtherParticipant(selectedConversation);
              const onlineFromParticipant =
                other && typeof other.isOnline === 'boolean'
                  ? other.isOnline
                  : undefined;
              const onlineFromStore = other ? isUserOnline(other.id) : undefined;
              const isOnline = onlineFromStore ?? onlineFromParticipant;

              const statusLabel = (() => {
                if (!other) return '';
                const roleLabel = getOtherParticipantRole(selectedConversation);
                if (typeof isOnline === 'boolean') {
                  return isOnline ? 'Online' : 'Offline';
                }
                return roleLabel || 'Online';
              })();

              const mentorshipStatus = selectedConversation.mentorshipStatus;
              const canViewProfile =
                !!other?.role &&
                other.role === 'mentor' &&
                user?.role === 'student' &&
                !!selectedConversation.mentorProfileId;
              const canEndMentorship = mentorshipStatus === 'active';

              return (
                <ChatHeader
                  other={other}
                  isOtherTyping={isOtherTyping}
                  statusLabel={statusLabel}
                  isOnline={isOnline}
                  mentorshipStatus={mentorshipStatus}
                  canViewProfile={canViewProfile}
                  canEndMentorship={canEndMentorship}
                  onViewProfile={() => {
                    if (selectedConversation.mentorProfileId) {
                      router.push(`/mentors/${selectedConversation.mentorProfileId}`);
                    }
                  }}
                  onOpenEndMentorship={() =>
                    setIsEndMentorshipDialogOpen(true)
                  }
                />
              );
            })()}

            <ScrollArea className="flex-1" ref={messagesContainerRef}>
              <div className="p-6">
                {hasMore && (
                  <div className="flex justify-center mb-5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="text-neutral-400 hover:text-white text-base h-10!"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="size-5 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load earlier messages'
                      )}
                    </Button>
                  </div>
                )}

                {isLoadingMessages ? (
                  <div className="space-y-5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex gap-4 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        {i % 2 === 0 && <Skeleton className="size-11 rounded-full bg-neutral-800 shrink-0" />}
                        <Skeleton className={`h-20 ${i % 2 === 0 ? 'w-[60%]' : 'w-[50%]'} rounded-2xl bg-neutral-800`} />
                        {i % 2 !== 0 && <Skeleton className="size-11 rounded-full bg-neutral-800 shrink-0" />}
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center">
                    <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mb-5">
                      <MessageCircle className="size-10 text-neutral-500" />
                    </div>
                    <p className="text-neutral-400 text-2xl">No messages yet</p>
                    <p className="text-neutral-500 text-lg mt-2">Start the conversation!</p>
                  </div>
                ) : (
                  <PhotoProvider>
                    <div className="space-y-5">
                      <AnimatePresence initial={false}>
                      {messages.map((message, index) => {
                        if (message.isSystemMessage || message.type === 'system') return null;
                        
                        const isOwn = message.senderId === currentUserId;
                        const showAvatar = index === messages.length - 1 || 
                          messages[index + 1]?.senderId !== message.senderId;
                        const other = getOtherParticipant(selectedConversation);
                        
                        return (
                          <motion.div 
                            key={message.id} 
                            className="group"
                            initial={{ opacity: 0, x: isOwn ? 30 : -30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: isOwn ? 30 : -30, scale: 0.95 }}
                            transition={{ 
                              duration: 0.3, 
                              type: "spring", 
                              stiffness: 200, 
                              damping: 20 
                            }}
                          >
                            <div className={`flex gap-4 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className="shrink-0 w-11">
                                {showAvatar && (
                                  isOwn ? (
                                    user?.avatar ? (
                                      <div className="relative size-11 rounded-full overflow-hidden">
                                        <Image
                                          src={user.avatar}
                                          alt={`${user.firstName} ${user.lastName}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="size-11 rounded-full bg-white text-neutral-900 flex items-center justify-center text-sm font-bold">
                                        {user?.firstName[0]}{user?.lastName[0]}
                                      </div>
                                    )
                                  ) : other && (
                                    other.avatar ? (
                                      <div className="relative size-11 rounded-full overflow-hidden">
                                        <Image
                                          src={other.avatar}
                                          alt={`${other.firstName} ${other.lastName}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="size-11 rounded-full bg-linear-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-sm font-bold">
                                        {other.firstName[0]}{other.lastName[0]}
                                      </div>
                                    )
                                  )
                                )}
                              </div>

                              <div className="max-w-[65%]">
                                {message.parentMessage && (
                                  <div className={`text-sm text-neutral-500 mb-2 px-4 py-2 rounded-lg bg-neutral-800/50 ${isOwn ? 'ml-auto' : ''} max-w-fit`}>
                                    <span className="font-medium">
                                      {typeof message.parentMessage === 'object' 
                                        ? `${message.parentMessage.sender?.firstName || 'User'}`
                                        : 'Reply'}
                                    </span>
                                    <p className="truncate">
                                      {typeof message.parentMessage === 'object' 
                                        ? message.parentMessage.content 
                                        : message.parentMessage}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="relative">
                                  {(() => {
                                    const isAttachment =
                                      message.type === 'image' ||
                                      message.type === 'file';
                                    const isFilenameOnly =
                                      isAttachment &&
                                      message.attachmentFileName &&
                                      message.content === message.attachmentFileName;
                                    const isFileOnlyAttachment =
                                      message.type === 'file' &&
                                      !!message.attachmentUrl &&
                                      (!message.content || isFilenameOnly);

                                    const bubbleBaseClass = message.isDeleted
                                      ? 'bg-neutral-800/50 text-neutral-500 italic'
                                      : isOwn
                                        ? 'bg-white text-neutral-900 rounded-br-md'
                                        : 'bg-neutral-800 text-neutral-100 rounded-bl-md';

                                    const bubblePaddingClass = isFileOnlyAttachment ? '' : 'px-5 py-4';

                                    return (
                                      <div
                                        className={`rounded-2xl ${bubbleBaseClass} ${bubblePaddingClass}`.trim()}
                                      >
                                    {message.isDeleted ? (
                                      <p className="text-xl leading-relaxed whitespace-pre-wrap wrap-break-word">
                                        {message.content}
                                      </p>
                                    ) : (
                                      <div className="space-y-3">
                                        {renderAttachment(message, isOwn)}
                                        {(() => {
                                          const isAttachment =
                                            message.type === 'image' ||
                                            message.type === 'file';
                                          const isFilenameOnly =
                                            isAttachment &&
                                            message.attachmentFileName &&
                                            message.content === message.attachmentFileName;
                                          const shouldShowCaption =
                                            !!message.content && !isFilenameOnly;

                                          if (!shouldShowCaption) return null;

                                          return (
                                            <p className="text-xl leading-relaxed whitespace-pre-wrap wrap-break-word">
                                              {renderMessageContent(message.content, isOwn)}
                                            </p>
                                          );
                                        })()}
                                      </div>
                                    )}
                                      </div>
                                    );
                                  })()}
                                  
                                  {isOwn && !message.isDeleted && selectedConversation.mentorshipStatus !== 'ended' && (
                                    <div className="absolute -left-35 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-10 text-neutral-400 hover:text-white"
                                        onClick={() => setReplyingTo(message)}
                                      >
                                        <Reply className="size-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-10 text-neutral-400 hover:text-white"
                                        onClick={() => {
                                          setEditingMessage(message);
                                          setEditContent(message.content);
                                          setIsEditDialogOpen(true);
                                        }}
                                      >
                                        <Edit2 className="size-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-10 text-neutral-400 hover:text-red-500 dark:hover:bg-red-500/10"
                                        onClick={() => {
                                          setDeletingMessage(message);
                                          setIsDeleteDialogOpen(true);
                                        }}
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    </div>
                                  )}
                                  
                                  {!isOwn && !message.isDeleted && selectedConversation.mentorshipStatus !== 'ended' && (
                                    <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-10 text-neutral-400 hover:text-white"
                                        onClick={() => setReplyingTo(message)}
                                      >
                                        <Reply className="size-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className={`flex items-center gap-2 mt-2 ${isOwn ? 'justify-end mr-14' : 'justify-start ml-14'}`}>
                              <span className="text-lg text-neutral-500">
                                {formatMessageTime(message.createdAt)}
                              </span>
                              {message.isEdited && (
                                <span className="text-lg text-neutral-500 capitalize">(edited)</span>
                              )}
                              {isOwn && !message.isDeleted && getStatusIcon(message)}
                            </div>
                          </motion.div>
                        );
                      })}
                      </AnimatePresence>
                      
                      <AnimatePresence>
                        {isOtherTyping && (
                        <motion.div 
                          className="flex gap-4 flex-row"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="shrink-0 w-11 flex items-end">
                            {(() => {
                              const other = getOtherParticipant(selectedConversation);
                              if (!other) return null;
                              return other.avatar ? (
                                <div className="relative size-11 rounded-full overflow-hidden">
                                  <Image
                                    src={other.avatar}
                                    alt={`${other.firstName} ${other.lastName}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="size-11 rounded-full bg-linear-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-sm font-bold">
                                  {other.firstName[0]}{other.lastName[0]}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="px-5 py-4 rounded-2xl bg-neutral-800 rounded-bl-md">
                            <div className="flex items-center gap-1.5">
                              <span className="size-2.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="size-2.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="size-2.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </PhotoProvider>
                )}
              </div>
            </ScrollArea>

            {selectedConversation.mentorshipStatus === 'ended' ? (
              <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
                <div className="flex items-center gap-5 px-6 py-5 bg-neutral-800/50 rounded-2xl">
                  <div className="size-14 rounded-full bg-neutral-700/50 flex items-center justify-center shrink-0">
                    <UserX className="size-7 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-medium text-neutral-300">
                      Mentorship Ended
                    </p>
                    <div className="text-lg text-neutral-500 mt-1 space-y-1">
                      {selectedConversation.mentorshipEndReason && (
                        <p>
                          <span className="font-medium">Reason: </span>
                          {selectedConversation.mentorshipEndReason}
                        </p>
                      )}
                      {selectedConversation.mentorshipEndedAt && (
                        <p>
                          <span className="font-medium">Ended on: </span>
                          {format(parseISO(selectedConversation.mentorshipEndedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      )}
                      {!selectedConversation.mentorshipEndReason && !selectedConversation.mentorshipEndedAt && (
                        <p>
                          This conversation is now read-only. You can reconnect to continue chatting.
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      const other = getOtherParticipant(selectedConversation);
                      if (other?.role === 'mentor' || selectedConversation.mentorId === other?.id) {
                        router.push('/mentors');
                      } else {
                        router.push('/mentor/requests');
                      }
                    }}
                    className="bg-white text-black hover:bg-neutral-200 h-12! px-6 text-base! font-medium shrink-0"
                  >
                    Reconnect
                    <UserPlus className="size-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <MessageInputBar
                messageInput={messageInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onSend={handleSendMessage}
                disabledSend={!messageInput.trim()}
                onOpenUploadDialog={() => setIsUploadDialogOpen(true)}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="size-28 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-8">
                <MessageCircle className="size-14 text-neutral-500" />
              </div>
              <h2 className="text-4xl font-semibold mb-3">Your Messages</h2>
              <p className="text-neutral-400 text-2xl max-w-sm">
                {isLoadingConversations 
                  ? 'Loading conversations...'
                  : conversations.length === 0
                    ? 'Connect with a mentor to start chatting'
                    : 'Select a conversation to start messaging'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Message</DialogTitle>
            <DialogDescription className="text-lg text-neutral-400">
              Make changes to your message.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[120px] bg-neutral-800 border-neutral-700 text-lg"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingMessage(null);
                setEditContent('');
              }}
              className="h-11! text-base!"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMessage}
              disabled={!editContent.trim() || editContent === editingMessage?.content}
              className="bg-white text-black hover:bg-neutral-200 h-11! text-base!"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-neutral-400">
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingMessage(null);
              }}
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700 h-11! text-base!"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-red-600 text-white hover:bg-red-700 h-11! text-base!"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEndMentorshipDialogOpen} onOpenChange={setIsEndMentorshipDialogOpen}>
        <DialogContent className="bg-neutral-900 border-neutral-800">
          <DialogHeader>
            <DialogTitle className="text-2xl">End Mentorship</DialogTitle>
            <DialogDescription className="text-lg text-neutral-400">
              {selectedConversation && (() => {
                const other = getOtherParticipant(selectedConversation);
                return `Are you sure you want to end your mentorship with ${other?.firstName} ${other?.lastName}? This will close the conversation, but you can connect again in the future.`;
              })()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <label className="text-base font-medium">
              Reason for ending <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={endMentorshipReason}
              onChange={(e) => setEndMentorshipReason(e.target.value)}
              placeholder="Please provide a reason for ending this mentorship..."
              className="min-h-[120px] bg-neutral-800 border-neutral-700 text-lg resize-none"
              maxLength={500}
            />
            <p className="text-sm text-neutral-500">
              {endMentorshipReason.length}/500 characters
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEndMentorshipDialogOpen(false);
                setEndMentorshipReason('');
              }}
              disabled={isEndingMentorship}
              className="h-11! text-base!"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEndMentorship}
              disabled={!endMentorshipReason.trim() || endMentorshipReason.trim().length < 10 || isEndingMentorship}
              className="bg-red-600 text-white hover:bg-red-700 h-11! text-base!"
            >
              {isEndingMentorship ? (
                <>
                  Ending...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                'End Mentorship'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isUploadDialogOpen}
        onOpenChange={(open) => {
          setIsUploadDialogOpen(open);
          if (!open) {
            setUploadFiles([]);
            setUploadCaption('');
          }
        }}
      >
        <DialogContent className="bg-neutral-900 border-neutral-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Paperclip className="size-5" />
              Attach file or image
            </DialogTitle>
            <DialogDescription className="text-lg text-neutral-400">
              Upload images or documents to share in this conversation. Maximum size 5MB.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="filepond-wrapper">
              <FilePond
                files={uploadFiles}
                onupdatefiles={(items) => {
                  setUploadFiles(items.map(item => item.file as File));
                }}
                allowMultiple={false}
                maxFiles={1}
                maxFileSize="5MB"
                acceptedFileTypes={[
                  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                  'application/pdf',
                  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                  'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.spreadsheet', 'application/vnd.oasis.opendocument.presentation'
                ]}
                labelIdle='<span class="filepond--label-action">Browse</span> or drag & drop'
                labelFileTypeNotAllowed="Invalid file type"
                fileValidateTypeLabelExpectedTypes="Expects images, PDF, Word, Excel, PowerPoint or OpenDocument"
                labelMaxFileSizeExceeded="File is too large"
                labelMaxFileSize="Maximum file size is 5MB"
                credits={false}
                stylePanelLayout="compact"
                className="filepond-dark"
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-medium">
                Caption <span className="text-neutral-500">(optional)</span>
              </label>
              <Textarea
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Add a note or description for this attachment..."
                className="min-h-[90px] bg-neutral-800 border-neutral-700 text-lg resize-none"
                maxLength={10000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsUploadDialogOpen(false);
                setUploadFiles([]);
                setUploadCaption('');
              }}
              disabled={isUploading}
              className="h-11! text-base!"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadAttachment}
              disabled={uploadFiles.length === 0 || isUploading}
              className="h-11! text-base!"
            >
              {isUploading ? (
                <>
                  Uploading...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                <>
                  Send Attachment
                  <Send className="size-5 ml-1" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}