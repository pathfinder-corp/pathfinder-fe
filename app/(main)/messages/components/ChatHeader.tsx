import Image from 'next/image';
import { MoreVertical, Eye, X, Search } from 'lucide-react';

import type { IChatParticipant, MentorshipStatus } from '@/types';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ChatHeaderProps = {
  other: IChatParticipant | null;
  isOtherTyping: boolean;
  statusLabel: string;
  isOnline?: boolean;
  mentorshipStatus?: MentorshipStatus;
  canViewProfile: boolean;
  canEndMentorship: boolean;
  onViewProfile: () => void;
  onOpenEndMentorship: () => void;
  onOpenSearch: () => void;
};

export function ChatHeader({
  other,
  isOtherTyping,
  statusLabel,
  isOnline,
  mentorshipStatus,
  canViewProfile,
  canEndMentorship,
  onViewProfile,
  onOpenEndMentorship,
  onOpenSearch,
}: ChatHeaderProps) {
  if (!other) {
    return null;
  }

  const canShowMenu =
    mentorshipStatus === 'active' ||
    mentorshipStatus === 'cancelled' ||
    mentorshipStatus === 'ended' ||
    !mentorshipStatus;

  const handleClickProfile = () => {
    if (canViewProfile) {
      onViewProfile();
    }
  };

  return (
    <div className="flex h-24 items-center justify-between border-b border-neutral-800 bg-neutral-900/30 px-6">
      <div
        className={`flex items-center gap-4 ${
          canViewProfile ? 'cursor-pointer' : ''
        }`}
        onClick={canViewProfile ? handleClickProfile : undefined}
      >
        <div className="relative">
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
              {other.firstName[0]}
              {other.lastName[0]}
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
        <div>
          <p className="text-3xl font-semibold">
            {other.firstName} {other.lastName}{' '}
            <span className="text-2xl text-neutral-500 capitalize">
              ({other.role})
            </span>
          </p>
          <div className="text-xl text-neutral-400">
            {isOtherTyping ? (
              <p className="flex items-center gap-1.5 text-green-500">
                Typing
                <span className="flex gap-1">
                  <span
                    className="size-1.5 animate-bounce rounded-full bg-green-500"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="size-1.5 animate-bounce rounded-full bg-green-500"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="size-1.5 animate-bounce rounded-full bg-green-500"
                    style={{ animationDelay: '300ms' }}
                  />
                </span>
              </p>
            ) : (
              statusLabel
            )}
          </div>
        </div>
      </div>

      {canShowMenu && (
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-12">
                <MoreVertical className="size-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="py-3 text-lg" onClick={onOpenSearch}>
                <Search className="size-5" />
                Search
              </DropdownMenuItem>
              {canViewProfile && (
                <DropdownMenuItem
                  className="py-3 text-lg"
                  onClick={onViewProfile}
                >
                  <Eye className="size-5" />
                  View profile
                </DropdownMenuItem>
              )}
              {canEndMentorship && (
                <>
                  {(canViewProfile || true) && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className="py-3 text-lg text-red-500 focus:text-red-500 dark:hover:bg-red-500/10"
                    onClick={onOpenEndMentorship}
                  >
                    <X className="size-5 text-red-500" />
                    End mentorship
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
