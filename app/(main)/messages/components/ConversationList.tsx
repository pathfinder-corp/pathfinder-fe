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
  getOtherParticipant: (
    conversation: IChatConversation
  ) => IChatParticipant | null;
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
    <div className="flex w-[360px] flex-col border-r border-neutral-800 bg-neutral-900/50">
      <div className="flex h-24 items-center justify-between border-b border-neutral-800 px-5">
        <h1 className="text-4xl font-bold">Messages</h1>
        <div className="flex items-center gap-2">
          <span
            className={`size-3 rounded-full ${
              isSocketConnected ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`}
          />
          <span className="text-lg text-neutral-500">
            {isSocketConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="mt-5 mb-3 px-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-14 border-neutral-700 bg-neutral-800/50 pl-12 text-xl"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-neutral-400 hover:text-white"
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
              <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-neutral-800">
                <MessageCircle className="size-8 text-neutral-500" />
              </div>
              <p className="text-xl text-neutral-400">
                {searchQuery
                  ? 'No conversations found'
                  : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <p className="mt-2 text-lg text-neutral-500">
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
                typeof other.isOnline === 'boolean'
                  ? other.isOnline
                  : undefined;
              const onlineFromStore = isUserOnline(other.id);
              const isOnline = onlineFromStore ?? onlineFromParticipant;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`flex w-full cursor-pointer items-start gap-4 rounded-xl p-4 text-left transition-colors ${
                    isActive ? 'bg-neutral-800' : 'hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    {other.avatar ? (
                      <div className="relative size-14 overflow-hidden rounded-full">
                        <Image
                          src={other.avatar}
                          alt={`${other.firstName} ${other.lastName}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-full bg-linear-to-br from-neutral-600 to-neutral-700 text-base font-bold">
                        {getInitials(other.firstName, other.lastName)}
                      </div>
                    )}
                    {typeof isOnline === 'boolean' && (
                      <span
                        className={`absolute -right-0.5 bottom-0.5 size-3.5 rounded-full border border-neutral-900 ${
                          isOnline ? 'bg-green-500' : 'bg-neutral-500'
                        }`}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="max-w-[180px] truncate text-xl font-semibold">
                        {other.firstName} {other.lastName}
                      </span>
                      <span className="shrink-0 text-lg text-neutral-500">
                        {formatConversationTime(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="max-w-[220px] truncate text-lg text-neutral-400">
                        {conversation.lastMessage?.senderId ===
                          currentUserId && (
                          <span className="text-neutral-500">You: </span>
                        )}
                        {conversation.lastMessage?.isDeleted
                          ? 'Message deleted'
                          : conversation.lastMessage?.content ||
                            'No messages yet'}
                      </p>
                      <div className="flex items-center gap-2">
                        {conversation.mentorshipStatus === 'ended' && (
                          <Badge
                            variant="outline"
                            className="border-neutral-600 px-2 py-1 text-xs text-neutral-500"
                          >
                            Ended
                          </Badge>
                        )}
                        <AnimatePresence mode="wait">
                          {conversation.unreadCount &&
                            conversation.unreadCount > 0 && (
                              <motion.div
                                key={`unread-${conversation.id}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  duration: 0.2,
                                  type: 'spring',
                                  stiffness: 200,
                                }}
                              >
                                <Badge className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 py-1 text-sm text-black">
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
