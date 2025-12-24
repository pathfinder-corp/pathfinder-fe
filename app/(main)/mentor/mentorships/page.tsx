'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Users, Loader2, MessageCircle, Calendar, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useUserStore } from '@/stores';
import { mentorshipService, chatService } from '@/services';
import { USER_ROLES } from '@/constants';
import type {
  IMentorship,
  MentorshipStatus,
  MentorshipRequestRole,
} from '@/types';
import { getInitials } from '@/lib';

import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type TabType = 'all' | 'active' | 'ended';

const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'ended', label: 'Ended' },
];

export default function MyMentorshipsPage() {
  const router = useRouter();
  const { user, isInitialized } = useUserStore();

  const [mentorships, setMentorships] = useState<IMentorship[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const [selectedMentorship, setSelectedMentorship] =
    useState<IMentorship | null>(null);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState<boolean>(false);
  const [endReason, setEndReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [openingConversationId, setOpeningConversationId] = useState<
    string | null
  >(null);

  const userRole: MentorshipRequestRole =
    user?.role === USER_ROLES.MENTOR ? 'as_mentor' : 'as_student';
  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);

  const fetchMentorships = useCallback(async () => {
    try {
      setIsLoading(true);
      const status: MentorshipStatus | undefined =
        activeTab === 'all' ? undefined : (activeTab as MentorshipStatus);

      const response = await mentorshipService.getMentorships({
        role: userRole,
        status,
        limit: 50,
      });

      setMentorships(response.mentorships || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load mentorships';
      toast.error('Failed to load mentorships', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, userRole]);

  useEffect(() => {
    if (isInitialized && user) {
      fetchMentorships();
    }
  }, [isInitialized, user, fetchMentorships]);

  const handleEndMentorship = async () => {
    if (!selectedMentorship || !endReason.trim()) {
      toast.error('Please provide a reason to end this mentorship');
      return;
    }

    try {
      setIsProcessing(true);
      await mentorshipService.endMentorship(selectedMentorship.id, {
        reason: endReason.trim(),
      });

      toast.success('Mentorship ended successfully');
      setIsEndDialogOpen(false);
      setSelectedMentorship(null);
      setEndReason('');
      fetchMentorships();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to end mentorship';
      toast.error('Failed to end mentorship', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenMessages = async (mentorshipId: string) => {
    try {
      setOpeningConversationId(mentorshipId);
      const conversation =
        await chatService.getConversationByMentorship(mentorshipId);
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to open conversation';
      toast.error('Failed to open conversation', {
        description: errorMessage,
      });
    } finally {
      setOpeningConversationId(null);
    }
  };

  const getStatusBadge = (status: MentorshipStatus) => {
    const baseClasses = 'px-4 py-2 text-base';

    switch (status) {
      case 'active':
        return (
          <Badge
            className={`${baseClasses} border-green-500/30 bg-green-500/20 text-green-400`}
          >
            Active
          </Badge>
        );
      case 'ended':
        return (
          <Badge
            className={`${baseClasses} border-neutral-500/30 bg-neutral-500/20 text-neutral-300`}
          >
            Ended
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            className={`${baseClasses} border-red-500/30 bg-red-500/20 text-red-400`}
          >
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd MMM yyyy');
    } catch {
      return 'Unknown';
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center pt-12 pb-16">
        <Loader2 className="size-10 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center pt-12 pb-16">
      <h1 className="mb-8 text-6xl font-bold">
        {userRole === 'as_mentor' ? 'My Students' : 'My Mentorships'}
      </h1>
      <p className="mb-10 text-2xl text-neutral-500">
        {userRole === 'as_mentor'
          ? 'Manage your ongoing and past mentorships with students'
          : 'Track and manage your mentorships with mentors'}
      </p>

      <div className="mb-10 flex w-232 items-center gap-1 border-b border-neutral-800">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative cursor-pointer px-6 py-4 text-lg font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="activeMentorshipsTab"
                  className="absolute right-0 bottom-0 left-0 h-0.5 bg-white"
                />
              )}
            </button>
          );
        })}
      </div>

      <TransitionPanel
        activeIndex={activeIndex}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        variants={{
          enter: { opacity: 0, y: -20, filter: 'blur(4px)' },
          center: { opacity: 1, y: 0, filter: 'blur(0px)' },
          exit: { opacity: 0, y: 20, filter: 'blur(4px)' },
        }}
      >
        {TABS.map((tab) => (
          <div key={tab.id}>
            {isLoading ? (
              <div className="w-232 space-y-5">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
                  >
                    <div className="flex items-start gap-5">
                      <Skeleton className="size-16 rounded-full bg-neutral-800" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-7 w-52 bg-neutral-800" />
                        <Skeleton className="h-6 w-full bg-neutral-800" />
                      </div>
                      <Skeleton className="h-9 w-28 rounded-full bg-neutral-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : mentorships.length === 0 ? (
              <div className="w-232 py-20 text-center">
                <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-neutral-800">
                  <Users className="size-12 text-neutral-500" />
                </div>
                <h2 className="mb-4 text-3xl font-semibold">
                  No mentorships found
                </h2>
                <p className="mb-10 text-xl text-neutral-400">
                  {userRole === 'as_mentor'
                    ? 'You do not have any mentorships yet.'
                    : 'You are not in any mentorships yet.'}
                </p>
              </div>
            ) : (
              <div className="w-232 space-y-5">
                {mentorships.map((mentorship) => {
                  const isMentorView = userRole === 'as_mentor';
                  const otherUser = isMentorView
                    ? mentorship.student
                    : mentorship.mentor;

                  return (
                    <div
                      key={mentorship.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
                    >
                      <div className="flex items-start gap-5">
                        {otherUser?.avatar ? (
                          <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                            <Image
                              src={otherUser.avatar}
                              alt={`${otherUser.firstName} ${otherUser.lastName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 text-xl font-bold">
                            {getInitials(
                              otherUser?.firstName || '',
                              otherUser?.lastName || ''
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-semibold">
                                {otherUser?.firstName} {otherUser?.lastName}
                              </h3>
                              <p className="text-base text-neutral-500">
                                {isMentorView ? 'Student' : 'Mentor'} • Started{' '}
                                {formatRelativeTime(mentorship.startedAt)}
                              </p>
                            </div>
                            {getStatusBadge(mentorship.status)}
                          </div>

                          <div className="mb-5 grid grid-cols-1 gap-4 text-base text-neutral-400 md:grid-cols-2">
                            <div>
                              <span className="text-neutral-500">Started:</span>{' '}
                              <span className="text-neutral-200">
                                {formatDate(mentorship.startedAt)}
                              </span>
                            </div>
                            <div>
                              <span className="text-neutral-500">Ended:</span>{' '}
                              <span className="text-neutral-200">
                                {mentorship.endedAt
                                  ? formatDate(mentorship.endedAt)
                                  : '—'}
                              </span>
                            </div>
                            {mentorship.endReason && (
                              <div className="flex items-start gap-2 md:col-span-2">
                                <p className="text-sm text-neutral-500">
                                  <span className="font-medium">
                                    End reason:
                                  </span>{' '}
                                  <span className="text-neutral-200">
                                    {mentorship.endReason}
                                  </span>
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <Button
                              size="sm"
                              onClick={() => handleOpenMessages(mentorship.id)}
                              disabled={openingConversationId === mentorship.id}
                              className="h-10! text-base!"
                            >
                              {openingConversationId === mentorship.id ? (
                                <>
                                  Opening...
                                  <Loader2 className="size-5 animate-spin" />
                                </>
                              ) : (
                                <>
                                  Direct Messages
                                  <MessageCircle className="size-5" />
                                </>
                              )}
                            </Button>

                            {mentorship.status === 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10! border-red-500/30! text-base! dark:text-red-500 dark:hover:bg-red-500/10"
                                onClick={() => {
                                  setSelectedMentorship(mentorship);
                                  setIsEndDialogOpen(true);
                                }}
                              >
                                End Mentorship
                                <Flag className="size-5" />
                              </Button>
                            )}

                            {mentorship.status !== 'active' &&
                              mentorship.endedAt && (
                                <span className="ml-auto flex items-center gap-1.5 text-base text-neutral-500">
                                  <Calendar className="size-4" />
                                  Ended {formatRelativeTime(mentorship.endedAt)}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </TransitionPanel>

      <Dialog open={isEndDialogOpen} onOpenChange={setIsEndDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">End Mentorship</DialogTitle>
            <DialogDescription className="text-base">
              Please provide a reason for ending this mentorship. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Textarea
              value={endReason}
              onChange={(event) => setEndReason(event.target.value)}
              placeholder="Explain why you want to end this mentorship..."
              className="min-h-[120px] text-base!"
              disabled={isProcessing}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEndDialogOpen(false)}
                disabled={isProcessing}
                className="h-12! text-base!"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleEndMentorship}
                disabled={isProcessing || !endReason.trim()}
                className="h-12! bg-red-600! text-base! text-white! hover:bg-red-700!"
              >
                {isProcessing ? (
                  <>
                    Ending...
                    <Loader2 className="size-5 animate-spin" />
                  </>
                ) : (
                  'End Mentorship'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
