import { Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MessageCircle, X } from 'lucide-react';

import type { IChatConversation, IChatParticipant } from '@/types';
import { getInitials } from '@/lib';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type ConversationListProps = {
  conversations: IChatConversation[];
  selectedConversation: IChatConversation | null;
  currentUserId?: string;
  searchQuery: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  isLoadingConversations: boolean;
  onSelectConversation: (conversation: IChatConversation) => void;
  getOtherParticipant: (conversation: IChatConversation) => IChatParticipant | null;
  formatConversationTime: (dateStr: string | null) => string;
  isUserOnline: (userId: string) => boolean | undefined;
  isSocketConnected: boolean;
};

export function ConversationList({
  conversations,
  selectedConversation,
  currentUserId,
  searchQuery,
  onSearchChange,
  isLoadingConversations,
  onSelectConversation,
  getOtherParticipant,
  formatConversationTime,
  isUserOnline,
  isSocketConnected,
}: ConversationListProps) {
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const other = getOtherParticipant(conv);
    if (!other) return false;
    const fullName = `${other.firstName} ${other.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-[360px] border-r border-neutral-800 flex flex-col bg-neutral-900/50">
      <div className="h-24 px-5 flex items-center justify-between border-b border-neutral-800">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="flex items-center gap-2">
          <span
            className={`size-3 rounded-full ${
              isSocketConnected ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}
          />
          <span className="text-md text-neutral-500">
            {isSocketConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="px-4 mt-5 mb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-14 bg-neutral-800/50 border-neutral-700 text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {isLoadingConversations ? (
            <div className="space-y-2.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4">
                  <Skeleton className="size-14 rounded-full bg-neutral-800" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-5 w-36 bg-neutral-800" />
                    <Skeleton className="h-4 w-52 bg-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-20 text-center">
              <div className="size-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="size-8 text-neutral-500" />
              </div>
              <p className="text-lg text-neutral-400">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <p className="text-base text-neutral-500 mt-2">
                  Connect with a mentor to start chatting
                </p>
              )}
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              if (!other) return null;

              const isActive = selectedConversation?.id === conversation.id;
              const onlineFromParticipant =
                typeof other.isOnline === 'boolean' ? other.isOnline : undefined;
              const onlineFromStore = isUserOnline(other.id);
              const isOnline = onlineFromStore ?? onlineFromParticipant;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl transition-colors text-left cursor-pointer ${
                    isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {other.avatar ? (
                      <div className="relative size-14 rounded-full overflow-hidden">
                        <Image
                          src={other.avatar}
                          alt={`${other.firstName} ${other.lastName}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="size-14 rounded-full bg-linear-to-br from-neutral-600 to-neutral-700 flex items-center justify-center text-base font-bold">
                        {getInitials(other.firstName, other.lastName)}
                      </div>
                    )}
                    {typeof isOnline === 'boolean' && (
                      <span
                        className={`absolute bottom-0.5 -right-0.5 size-3.5 rounded-full border border-neutral-900 ${
                          isOnline ? 'bg-green-500' : 'bg-neutral-500'
                        }`}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-lg truncate max-w-[180px]">
                        {other.firstName} {other.lastName}
                      </span>
                      <span className="text-base text-neutral-500 shrink-0">
                        {formatConversationTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base text-neutral-400 truncate max-w-[220px]">
                        {conversation.lastMessage?.senderId === currentUserId && (
                          <span className="text-neutral-500">You: </span>
                        )}
                        {conversation.lastMessage?.isDeleted
                          ? 'Message deleted'
                          : conversation.lastMessage?.content || 'No messages yet'}
                      </p>
                      <div className="flex items-center gap-2">
                        {conversation.mentorshipStatus === 'ended' && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2 py-1 border-neutral-600 text-neutral-500"
                          >
                            Ended
                          </Badge>
                        )}
                        <AnimatePresence mode="wait">
                          {conversation.unreadCount && conversation.unreadCount > 0 && (
                            <motion.div
                              key={`unread-${conversation.id}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
                            >
                              <Badge className="bg-white text-black text-sm px-2 py-1 h-6 min-w-6 flex items-center justify-center rounded-full">
                                {conversation.unreadCount}
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}