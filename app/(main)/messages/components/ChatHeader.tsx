import Image from 'next/image';
import { MoreVertical, Eye, X } from 'lucide-react';

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
  onOpenEndMentorship
}: ChatHeaderProps) {
  if (!other) {
    return null;
  }

  const canShowMenu =
    mentorshipStatus === 'active' ||
    mentorshipStatus === 'cancelled' ||
    !mentorshipStatus;

  const handleClickProfile = () => {
    if (canViewProfile) {
      onViewProfile();
    }
  };

  return (
    <div className="h-24 px-6 flex items-center justify-between border-b border-neutral-800 bg-neutral-900/30">
      <div
        className={`flex items-center gap-4 ${
          canViewProfile
            ? 'cursor-pointer'
            : ''
        }`}
        onClick={canViewProfile ? handleClickProfile : undefined}
      >
        <div className="relative">
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
              {other.firstName[0]}
              {other.lastName[0]}
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
        <div>
          <p className="font-semibold text-3xl">
            {other.firstName} {other.lastName} <span className="text-neutral-500 text-2xl capitalize">({other.role})</span>
          </p>
          <div className="text-xl text-neutral-400">
            {isOtherTyping ? (
              <p className="text-green-500 flex items-center gap-1.5">
                Typing
                <span className="flex gap-1">
                  <span
                    className="size-1.5 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="size-1.5 bg-green-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="size-1.5 bg-green-500 rounded-full animate-bounce"
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
              {canViewProfile && (
                <DropdownMenuItem
                  className="text-lg py-3"
                  onClick={onViewProfile}
                >
                  <Eye className="size-5" />
                  View profile
                </DropdownMenuItem>
              )}
              {canEndMentorship && (
                <>
                  {canViewProfile && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className="dark:hover:bg-red-500/10 text-lg py-3 text-red-500 focus:text-red-500"
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