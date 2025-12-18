'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Send, 
  MoreVertical,
  MessageCircle,
  Check,
  CheckCheck,
  X,
  Edit2,
  Trash2,
  Reply,
  Loader2
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { useUserStore } from '@/stores';
import { chatService, socketService, mentorshipService } from '@/services';
import { getAuthToken } from '@/lib/cookie';
import type { IChatConversation, IChatMessage, IChatParticipant } from '@/types';

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

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserStore();
  
  const token = useMemo(() => getAuthToken(), []);
  
  const [conversations, setConversations] = useState<IChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<IChatConversation | null>(null);
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
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
  
  const [replyingTo, setReplyingTo] = useState<IChatMessage | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const joinedConversationsRef = useRef<Set<string>>(new Set());
  const selectedConversationIdRef = useRef<string | null>(null);
  const shouldScrollRef = useRef<boolean>(true);
  const prevMessagesLengthRef = useRef<number>(0);

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
              console.error('Failed to create conversation for mentorship:', mentorship.id, err);
            }
          }
          
          if (activeMentorships.length > 0) {
            data = await chatService.getConversations();
          }
        } catch (err) {
          console.error('Failed to fetch mentorships:', err);
        }
      }
      
      setConversations(data);
      
      const conversationId = searchParams.get('conversation');
      if (conversationId && data.length > 0) {
        const conv = data.find(c => c.id === conversationId);
        if (conv) {
          setSelectedConversation(conv);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [searchParams]);

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
      
      if (cursor) {
        setMessages(prev => [...data.messages, ...prev]);
        prevMessagesLengthRef.current += data.messages.length;
      } else {
        setMessages(data.messages);
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        });
      }
      
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
      setIsLoadingMore(false);
      shouldScrollRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (token && currentUserId) {
      socketService.connect(token, currentUserId);
      
      const unsubConnect = socketService.onConnect(() => {
        setIsSocketConnected(true);
      });
      
      const unsubDisconnect = socketService.onDisconnect(() => {
        setIsSocketConnected(false);
      });
      
      if (socketService.isConnected()) {
        setIsSocketConnected(true);
      }
      
      return () => {
        unsubConnect();
        unsubDisconnect();
        socketService.disconnect();
      };
    }
  }, [token, currentUserId]);

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
        if (prev.some(m => m.id === message.id)) {
          return prev.map(m => m.id === message.id ? message : m);
        }
        return [...prev, message];
      });
      
      if (message.senderId !== currentUserId) {
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
        setMessages(prev => 
          prev.map(m => 
            data.messageIds.includes(m.id) 
              ? { ...m, readAt: new Date().toISOString() } 
              : m
          )
        );
      }
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubRead();
    };
  }, [selectedConversation?.id, currentUserId]);

  useEffect(() => {
    const selectedId = selectedConversation?.id;
    
    const unsubGlobal = socketService.onMessage('*', (message) => {
      
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: message,
              lastMessageAt: message.createdAt,
              unreadCount: message.senderId !== currentUserId && conv.id !== selectedId
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount,
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
          if (prev.some(m => m.id === message.id)) {
            return prev.map(m => m.id === message.id ? message : m);
          }
          return [...prev, message];
        });
        
        if (message.senderId !== currentUserId) {
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

    return () => {
      unsubGlobal();
      unsubTyping();
    };
  }, [currentUserId, selectedConversation?.id]);

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

    const handleTyping = useCallback(() => {
    if (!selectedConversation) return;
    
    socketService.sendTyping(selectedConversation.id, true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(selectedConversation.id, false);
    }, 2000);
  }, [selectedConversation]);

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
    if (!messageInput.trim() || !selectedConversation || isSending) return;

    const content = messageInput.trim();
    setMessageInput('');
    setIsSending(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketService.sendTyping(selectedConversation.id, false);

    try {
      shouldScrollRef.current = true;
      
      const message = await chatService.sendMessage(selectedConversation.id, {
        content,
        parentMessageId: replyingTo?.id,
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
      
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  }, [messageInput, selectedConversation, isSending, replyingTo]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditMessage = useCallback(async () => {
    if (!editingMessage || !editContent.trim()) return;
    
    try {
      const updatedMessage = await chatService.editMessage(editingMessage.id, {
        content: editContent.trim(),
      });
      
      setMessages(prev => 
        prev.map(m => m.id === editingMessage.id ? updatedMessage : m)
      );
      
      setIsEditDialogOpen(false);
      setEditingMessage(null);
      setEditContent('');
      toast.success('Message edited');
    } catch (error) {
      console.error('Failed to edit message:', error);
      toast.error('Failed to edit message');
    }
  }, [editingMessage, editContent]);

  const handleDeleteMessage = useCallback(async () => {
    if (!deletingMessage) return;
    
    try {
      await chatService.deleteMessage(deletingMessage.id);
      
      setMessages(prev => 
        prev.map(m => 
          m.id === deletingMessage.id 
            ? { ...m, isDeleted: true, content: 'This message was deleted' } 
            : m
        )
      );
      
      setIsDeleteDialogOpen(false);
      setDeletingMessage(null);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [deletingMessage]);

  const handleLoadMore = useCallback(() => {
    if (selectedConversation && hasMore && nextCursor && !isLoadingMore) {
      fetchMessages(selectedConversation.id, nextCursor);
    }
  }, [selectedConversation, hasMore, nextCursor, isLoadingMore, fetchMessages]);

  const getStatusIcon = (message: IChatMessage) => {
    if (message.readAt) {
      return <CheckCheck className="size-3.5 text-white" />;
    }
    return <Check className="size-3.5 text-neutral-400" />;
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const other = getOtherParticipant(conv);
    if (!other) return false;
    const fullName = `${other.firstName} ${other.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const isOtherTyping = Array.from(typingUsers.values()).some(isTyping => isTyping);

  return (
    <div className="h-full flex overflow-hidden bg-neutral-950">
      <div className="w-[300px] border-r border-neutral-800 flex flex-col bg-neutral-900/50">
        <div className="h-20 px-4 flex items-center justify-between border-b border-neutral-800">
          <h1 className="text-[1.5rem] font-bold">Messages</h1>
          <div className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-neutral-500">
              {isSocketConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="px-3 mt-4 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-neutral-800/50 border-neutral-700 text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoadingConversations ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3">
                    <Skeleton className="size-12 rounded-full bg-neutral-800" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 bg-neutral-800" />
                      <Skeleton className="h-3 w-48 bg-neutral-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 text-center">
                <div className="size-14 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="size-7 text-neutral-500" />
                </div>
                <p className="text-neutral-400">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </p>
                {!searchQuery && (
                  <p className="text-neutral-500 text-sm mt-2">
                    Connect with a mentor to start chatting
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                if (!other) return null;
                
                const isActive = selectedConversation?.id === conversation.id;
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setConversations(prev => 
                        prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
                      );
                    }}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left cursor-pointer ${
                      isActive 
                        ? 'bg-neutral-800' 
                        : 'hover:bg-neutral-800/50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      {other.avatar ? (
                        <div className="relative size-12 rounded-full overflow-hidden">
                          <Image
                            src={other.avatar}
                            alt={`${other.firstName} ${other.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="size-12 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-sm font-bold">
                          {other.firstName[0]}{other.lastName[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-semibold text-base truncate max-w-[160px]">
                          {other.firstName} {other.lastName}
                        </span>
                        <span className="text-sm text-neutral-500 flex-shrink-0">
                          {formatConversationTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[.9rem] text-neutral-400 truncate max-w-[200px]">
                          {conversation.lastMessage?.senderId === currentUserId && (
                            <span className="text-neutral-500">You: </span>
                          )}
                          {conversation.lastMessage?.isDeleted 
                            ? 'Message deleted' 
                            : conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <Badge className="bg-white text-black text-xs px-1.5 pt-1.5 h-5 min-w-5 flex items-center justify-center rounded-full">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="h-20 px-5 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/30">
              <div className="flex items-center gap-3">
                {(() => {
                  const other = getOtherParticipant(selectedConversation);
                  if (!other) return null;
                  
                  return (
                    <>
                      <div className="relative">
                        {other.avatar ? (
                          <div className="relative size-11 rounded-full overflow-hidden">
                            <Image
                              src={other.avatar}
                              alt={`${other.firstName} ${other.lastName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="size-11 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-sm font-bold">
                            {other.firstName[0]}{other.lastName[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xl">
                          {other.firstName} {other.lastName}
                        </p>
                        <p className="text-base text-neutral-400">
                          {isOtherTyping ? (
                            <span className="text-green-400 flex items-center gap-1">
                              Typing
                              <span className="flex gap-0.5">
                                <span className="size-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="size-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="size-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </span>
                            </span>
                          ) : (
                            getOtherParticipantRole(selectedConversation) || 'Online'
                          )}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-10">
                      <MoreVertical className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-base py-2">
                      View profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="dark:hover:bg-red-500/10 text-base py-2 text-red-500 focus:text-red-500">
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="flex-1" ref={messagesContainerRef}>
              <div className="p-5">
                {hasMore && (
                  <div className="flex justify-center mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="text-neutral-400 hover:text-white"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Load earlier messages'
                      )}
                    </Button>
                  </div>
                )}

                {isLoadingMessages ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        {i % 2 === 0 && <Skeleton className="size-9 rounded-full bg-neutral-800 flex-shrink-0" />}
                        <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-[60%]' : 'w-[50%]'} rounded-2xl bg-neutral-800`} />
                        {i % 2 !== 0 && <Skeleton className="size-9 rounded-full bg-neutral-800 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4">
                      <MessageCircle className="size-8 text-neutral-500" />
                    </div>
                    <p className="text-neutral-400 text-lg">No messages yet</p>
                    <p className="text-neutral-500 text-sm mt-1">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === currentUserId;
                      const showAvatar = index === messages.length - 1 || 
                        messages[index + 1]?.senderId !== message.senderId;
                      const other = getOtherParticipant(selectedConversation);
                      
                      return (
                        <div key={message.id} className="group">
                          <div className={`flex gap-3 items-end ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="flex-shrink-0 w-9">
                              {showAvatar && (
                                isOwn ? (
                                  user?.avatar ? (
                                    <div className="relative size-9 rounded-full overflow-hidden">
                                      <Image
                                        src={user.avatar}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="size-9 rounded-full bg-white text-neutral-900 flex items-center justify-center text-xs font-bold">
                                      {user?.firstName[0]}{user?.lastName[0]}
                                    </div>
                                  )
                                ) : other && (
                                  other.avatar ? (
                                    <div className="relative size-9 rounded-full overflow-hidden">
                                      <Image
                                        src={other.avatar}
                                        alt={`${other.firstName} ${other.lastName}`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="size-9 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-xs font-bold">
                                      {other.firstName[0]}{other.lastName[0]}
                                    </div>
                                  )
                                )
                              )}
                            </div>

                            <div className="max-w-[65%]">
                              {message.parentMessage && (
                                <div className={`text-xs text-neutral-500 mb-1 px-3 py-1.5 rounded-lg bg-neutral-800/50 ${isOwn ? 'ml-auto' : ''} max-w-fit`}>
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
                                <div
                                  className={`px-4 py-3 rounded-2xl ${
                                    message.isDeleted
                                      ? 'bg-neutral-800/50 text-neutral-500 italic'
                                      : isOwn
                                        ? 'bg-white text-neutral-900 rounded-br-md'
                                        : 'bg-neutral-800 text-neutral-100 rounded-bl-md'
                                  }`}
                                >
                                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                  </p>
                                </div>
                                
                                {isOwn && !message.isDeleted && (
                                  <div className="absolute -left-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-neutral-400 hover:text-white"
                                      onClick={() => {
                                        setEditingMessage(message);
                                        setEditContent(message.content);
                                        setIsEditDialogOpen(true);
                                      }}
                                    >
                                      <Edit2 className="size-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-neutral-400 hover:text-red-500"
                                      onClick={() => {
                                        setDeletingMessage(message);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                )}
                                
                                {!isOwn && !message.isDeleted && (
                                  <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 text-neutral-400 hover:text-white"
                                      onClick={() => setReplyingTo(message)}
                                    >
                                      <Reply className="size-3.5" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end mr-12' : 'justify-start ml-12'}`}>
                            <span className="text-sm text-neutral-500">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {message.isEdited && (
                              <span className="text-xs text-neutral-500">(edited)</span>
                            )}
                            {isOwn && !message.isDeleted && getStatusIcon(message)}
                          </div>
                        </div>
                      );
                    })}
                    
                    {isOtherTyping && (
                      <div className="flex gap-3 flex-row">
                        <div className="flex-shrink-0 w-9 flex items-end">
                          {(() => {
                            const other = getOtherParticipant(selectedConversation);
                            if (!other) return null;
                            return other.avatar ? (
                              <div className="relative size-9 rounded-full overflow-hidden">
                                <Image
                                  src={other.avatar}
                                  alt={`${other.firstName} ${other.lastName}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="size-9 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-xs font-bold">
                                {other.firstName[0]}{other.lastName[0]}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-neutral-800 rounded-bl-md">
                          <div className="flex items-center gap-1">
                            <span className="size-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="size-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="size-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-5 border-t border-neutral-800 bg-neutral-900/30">
              {replyingTo && (
                <div className="flex items-center justify-between mb-3 px-4 py-2 bg-neutral-800/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-400 mb-0.5">
                      Replying to {replyingTo.sender?.firstName || 'User'}
                    </p>
                    <p className="text-sm text-neutral-300 truncate">{replyingTo.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-neutral-400 hover:text-white flex-shrink-0"
                    onClick={() => setReplyingTo(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={handleKeyPress}
                    className="!h-14 pr-12 bg-neutral-800/50 border-neutral-700 !text-lg"
                    disabled={isSending}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="size-12 rounded-full bg-white text-black hover:bg-neutral-200 flex-shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <Send className="size-6" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="size-10 text-neutral-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your Messages</h2>
              <p className="text-neutral-400 text-lg max-w-sm">
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
            <DialogTitle className="text-xl">Edit Message</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Make changes to your message.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px] bg-neutral-800 border-neutral-700 text-base"
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingMessage(null);
                setEditContent('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditMessage}
              disabled={!editContent.trim() || editContent === editingMessage?.content}
              className="bg-white text-black hover:bg-neutral-200"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingMessage(null);
              }}
              className="bg-neutral-800 border-neutral-700 hover:bg-neutral-700"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
