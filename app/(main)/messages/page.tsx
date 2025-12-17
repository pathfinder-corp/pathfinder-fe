'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Send, 
  MoreVertical,
  MessageCircle,
  Check,
  CheckCheck,
  X,
  Smile
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useUserStore } from '@/stores';
import type { IConversation, IMessage, IMessageParticipant } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const mockConversations: IConversation[] = [
  {
    id: '1',
    participants: [
      { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', avatar: null, role: 'mentor', isOnline: true },
      { id: '2', firstName: 'Current', lastName: 'User', email: 'me@example.com', avatar: null, role: 'student' }
    ],
    lastMessage: {
      id: 'm1',
      conversationId: '1',
      senderId: '1',
      content: 'Thanks for your quick response. Actually I\'m facing some issues with the figma prototype.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    unreadCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    participants: [
      { id: '3', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@example.com', avatar: null, role: 'mentor', isOnline: false },
      { id: '2', firstName: 'Current', lastName: 'User', email: 'me@example.com', avatar: null, role: 'student' }
    ],
    lastMessage: {
      id: 'm2',
      conversationId: '2',
      senderId: '2',
      content: 'I\'ve completed the roadmap you suggested. Can we discuss the next steps?',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    participants: [
      { id: '4', firstName: 'Mike', lastName: 'Chen', email: 'mike@example.com', avatar: null, role: 'mentor', isOnline: true },
      { id: '2', firstName: 'Current', lastName: 'User', email: 'me@example.com', avatar: null, role: 'student' }
    ],
    lastMessage: {
      id: 'm3',
      conversationId: '3',
      senderId: '4',
      content: 'Great progress on your learning path! Keep it up 🎉',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    },
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    participants: [
      { id: '5', firstName: 'Emily', lastName: 'Brown', email: 'emily@example.com', avatar: null, role: 'mentor', isOnline: false },
      { id: '2', firstName: 'Current', lastName: 'User', email: 'me@example.com', avatar: null, role: 'student' }
    ],
    lastMessage: {
      id: 'm4',
      conversationId: '4',
      senderId: '5',
      content: 'Let me know if you need any clarification on the assessment feedback.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
    },
    unreadCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockMessages: IMessage[] = [
  {
    id: 'm1',
    conversationId: '1',
    senderId: '1',
    content: 'Hello! Good morning. How are you? 👋',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'm2',
    conversationId: '1',
    senderId: '2',
    content: 'I\'m good, 👍\nHow can I help you? printing and industry.',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1.9).toISOString()
  },
  {
    id: 'm3',
    conversationId: '1',
    senderId: '1',
    content: 'Thanks for your quick response. Actually I\'m facing some issues with the figma prototype.',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  },
  {
    id: 'm4',
    conversationId: '1',
    senderId: '2',
    content: 'Alright, can you please tell me exactly what problem you are facing with the prototype.',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString()
  },
  {
    id: 'm5',
    conversationId: '1',
    senderId: '1',
    content: 'Yes, sure.',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString()
  },
  {
    id: 'm6',
    conversationId: '1',
    senderId: '1',
    content: 'I keep getting "error while creating a new popup" for the first time in figma prototype.',
    status: 'read',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'm7',
    conversationId: '1',
    senderId: '2',
    content: 'Well, I believe you are experiencing issues with the Figma program. I believe that updating it to the most recent version would resolve the problem.',
    status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  }
];

export default function MessagesPage() {
  const { user } = useUserStore();
  const [conversations, setConversations] = useState<IConversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id || '2';

  useEffect(() => {
    if (selectedConversation) {
      setIsLoading(true);
      setTimeout(() => {
        setMessages(mockMessages.filter(m => m.conversationId === selectedConversation.id));
        setIsLoading(false);
      }, 300);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOtherParticipant = (conversation: IConversation): IMessageParticipant => {
    return conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  };

  const formatMessageTime = (dateStr: string): string => {
    const date = parseISO(dateStr);
    return format(date, 'HH:mm');
  };

  const formatConversationTime = (dateStr: string): string => {
    const date = parseISO(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd');
  };

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: IMessage = {
      id: `m${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUserId,
      content: messageInput.trim(),
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === newMessage.id ? { ...m, status: 'sent' as const } : m
      ));
    }, 500);
  }, [messageInput, selectedConversation, currentUserId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="size-3 rounded-full border-2 border-neutral-400 border-t-transparent animate-spin" />;
      case 'sent':
        return <Check className="size-3.5 text-neutral-400" />;
      case 'delivered':
        return <CheckCheck className="size-3.5 text-neutral-400" />;
      case 'read':
        return <CheckCheck className="size-3.5 text-white" />;
      default:
        return null;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const other = getOtherParticipant(conv);
    const fullName = `${other.firstName} ${other.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
           other.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-full flex overflow-hidden bg-neutral-950">
      <div className="w-[300px] border-r border-neutral-800 flex flex-col bg-neutral-900/50">
        <div className="h-20 px-4 flex items-center border-b border-neutral-800">
          <h1 className="text-[1.5rem] font-bold">Messages</h1>
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
            {filteredConversations.length === 0 ? (
              <div className="py-16 text-center">
                <div className="size-14 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="size-7 text-neutral-500" />
                </div>
                <p className="text-neutral-400">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const other = getOtherParticipant(conversation);
                const isActive = selectedConversation?.id === conversation.id;
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
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
                      {other.isOnline && (
                        <div className="absolute bottom-0 right-0 size-3.5 rounded-full bg-green-500 border-2 border-neutral-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-semibold text-base truncate max-w-[160px]">
                          {other.firstName} {other.lastName}
                        </span>
                        <span className="text-sm text-neutral-500 flex-shrink-0">
                          {conversation.lastMessage && formatConversationTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[.9rem] text-neutral-400 truncate max-w-[200px]">
                          {conversation.lastMessage?.senderId === currentUserId && (
                            <span className="text-neutral-500">You: </span>
                          )}
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
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
                        {other.isOnline && (
                          <div className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 border-2 border-neutral-900" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-xl">
                          {other.firstName} {other.lastName}
                        </p>
                        <p className="text-base text-neutral-400 capitalize">
                          {other.role} {other.isOnline && '• Online'}
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

            <ScrollArea className="flex-1">
              <div className="p-5">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                      {i % 2 === 0 && <Skeleton className="size-9 rounded-full bg-neutral-800 flex-shrink-0" />}
                      <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-[60%]' : 'w-[50%]'} rounded-2xl bg-neutral-800`} />
                      {i % 2 !== 0 && <Skeleton className="size-9 rounded-full bg-neutral-800 flex-shrink-0" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === currentUserId;
                    const showAvatar = index === 0 || 
                      messages[index - 1].senderId !== message.senderId;
                    const other = getOtherParticipant(selectedConversation);
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isOwn && (
                          <div className="flex-shrink-0 w-9">
                            {showAvatar && (
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
                            )}
                          </div>
                        )}

                        <div className={`max-w-[65%] ${isOwn ? 'order-first' : ''}`}>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              isOwn
                                ? 'bg-white text-neutral-900 rounded-br-md'
                                : 'bg-neutral-800 text-neutral-100 rounded-bl-md'
                            }`}
                          >
                            <p className="text-base leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-sm text-neutral-500">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            {isOwn && getStatusIcon(message.status)}
                          </div>
                        </div>

                        {isOwn && (
                          <div className="flex-shrink-0 w-9">
                            {showAvatar && (
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
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
              </div>
            </ScrollArea>

            <div className="p-5 border-t border-neutral-800 bg-neutral-900/30">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="!h-14 pr-12 bg-neutral-800/50 border-neutral-700 !text-lg"
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="size-12 rounded-full bg-white text-black hover:bg-neutral-200 flex-shrink-0"
                >
                  <Send className="size-6" />
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
                Select a conversation to start messaging with your mentor.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

