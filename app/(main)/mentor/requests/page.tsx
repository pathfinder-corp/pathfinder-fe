'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  MessageCircle,
  Calendar,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useUserStore } from '@/stores';
import { mentorshipService, chatService } from '@/services';
import { USER_ROLES } from '@/constants';
import type {
  IMentorshipRequest,
  MentorshipRequestStatus,
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

type TabType = 'all' | 'pending' | 'accepted' | 'declined';

const TABS: { id: TabType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'declined', label: 'Declined' },
];

export default function MentorshipRequestsPage() {
  const router = useRouter();
  const { user, isInitialized } = useUserStore();

  const [requests, setRequests] = useState<IMentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const [selectedRequest, setSelectedRequest] =
    useState<IMentorshipRequest | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState<boolean>(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] =
    useState<boolean>(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [acceptMessage, setAcceptMessage] = useState<string>('');
  const [declineReason, setDeclineReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const userRole: MentorshipRequestRole =
    user?.role === USER_ROLES.MENTOR ? 'as_mentor' : 'as_student';
  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const status =
        activeTab === 'all'
          ? undefined
          : (activeTab as MentorshipRequestStatus);
      const response = await mentorshipService.getRequests({
        role: userRole,
        status,
        limit: 50,
      });
      setRequests(response.requests || []);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load requests';
      toast.error('Failed to load requests', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, userRole]);

  useEffect(() => {
    if (isInitialized && user) {
      fetchRequests();
    }
  }, [isInitialized, user, fetchRequests]);

  const handleAccept = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      const response = await mentorshipService.acceptRequest(
        selectedRequest.id,
        {
          message: acceptMessage.trim() || undefined,
        }
      );

      toast.success(
        'Request accepted successfully! Redirecting to messages...'
      );
      setIsAcceptDialogOpen(false);
      setSelectedRequest(null);
      setAcceptMessage('');

      if (response.mentorshipId) {
        try {
          const conversation = await chatService.getConversationByMentorship(
            response.mentorshipId
          );
          router.push(`/messages?conversation=${conversation.id}`);
        } catch (conversationError) {
          console.error('Failed to get conversation:', conversationError);
          router.push('/messages');
        }
      } else {
        router.push('/messages');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to accept request';
      toast.error('Failed to accept request', {
        description: errorMessage,
      });
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedRequest || !declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    try {
      setIsProcessing(true);
      await mentorshipService.declineRequest(selectedRequest.id, {
        reason: declineReason.trim(),
      });
      toast.success('Request declined');
      setIsDeclineDialogOpen(false);
      setSelectedRequest(null);
      setDeclineReason('');
      fetchRequests();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to decline request';
      toast.error('Failed to decline request', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedRequest) return;

    try {
      setIsProcessing(true);
      await mentorshipService.cancelRequest(selectedRequest.id);
      toast.success('Request cancelled');
      setIsCancelDialogOpen(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to cancel request';
      toast.error('Failed to cancel request', {
        description: errorMessage,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: MentorshipRequestStatus) => {
    const baseClasses = 'px-4 py-2 text-base';

    switch (status) {
      case 'pending':
        return (
          <Badge
            className={`${baseClasses} border-yellow-500/30 bg-yellow-500/20 text-yellow-400`}
          >
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge
            className={`${baseClasses} border-green-500/30 bg-green-500/20 text-green-400`}
          >
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge
            className={`${baseClasses} border-red-500/30 bg-red-500/20 text-red-400`}
          >
            Declined
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            className={`${baseClasses} border-neutral-500/30 bg-neutral-500/20 text-neutral-400`}
          >
            Cancelled
          </Badge>
        );
      case 'expired':
        return (
          <Badge
            className={`${baseClasses} border-orange-500/30 bg-orange-500/20 text-orange-400`}
          >
            Expired
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
        {userRole === 'as_mentor' ? 'Mentorship Requests' : 'My Requests'}
      </h1>
      <p className="mb-10 text-2xl text-neutral-500">
        {userRole === 'as_mentor'
          ? 'Review and manage connection requests from students'
          : 'Track your connection requests to mentors'}
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
                  layoutId="activeRequestsTab"
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
            ) : requests.length === 0 ? (
              <div className="w-232 py-20 text-center">
                <div className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full bg-neutral-800">
                  <Users className="size-12 text-neutral-500" />
                </div>
                <h2 className="mb-4 text-3xl font-semibold">
                  No requests found
                </h2>
                <p className="mb-10 text-xl text-neutral-400">
                  {userRole === 'as_mentor'
                    ? "You don't have any mentorship requests yet."
                    : "You haven't sent any connection requests yet."}
                </p>
                {userRole === 'as_student' && (
                  <Button
                    onClick={() => router.push('/mentors')}
                    className="h-16! px-10! text-xl!"
                  >
                    Browse Mentors
                    <Users className="size-5" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-232 space-y-5">
                {requests.map((request) => {
                  const otherUser =
                    userRole === 'as_mentor' ? request.student : request.mentor;

                  return (
                    <div
                      key={request.id}
                      className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-7"
                    >
                      <div className="flex items-start gap-5">
                        {otherUser.avatar ? (
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
                              otherUser.firstName,
                              otherUser.lastName
                            )}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-2xl font-semibold">
                                {otherUser.firstName} {otherUser.lastName}
                              </h3>
                              <p className="text-base text-neutral-500">
                                {userRole === 'as_mentor'
                                  ? 'Student'
                                  : 'Mentor'}{' '}
                                • {formatRelativeTime(request.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          <p className="mb-5 line-clamp-2 text-lg text-neutral-300">
                            {request.message}
                          </p>

                          {request.status === 'declined' &&
                            request.declineReason && (
                              <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                                <p className="text-base text-red-400">
                                  <span className="font-medium">Reason:</span>{' '}
                                  {request.declineReason}
                                </p>
                              </div>
                            )}

                          <div className="flex items-center gap-3">
                            {userRole === 'as_student' &&
                              request.mentorProfileId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    router.push(
                                      `/mentors/${request.mentorProfileId}`
                                    )
                                  }
                                  className="h-10! text-base!"
                                >
                                  View Profile
                                </Button>
                              )}

                            {userRole === 'as_mentor' &&
                              request.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setIsAcceptDialogOpen(true);
                                    }}
                                    className="h-10! border-green-500/30 bg-green-500/20 text-base! text-green-400 dark:hover:bg-green-500/30"
                                  >
                                    Accept
                                    <CheckCircle className="size-5" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10! border-red-500/30! text-base! dark:text-red-500 dark:hover:bg-red-500/10"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setIsDeclineDialogOpen(true);
                                    }}
                                  >
                                    Decline
                                    <XCircle className="size-5" />
                                  </Button>
                                </>
                              )}

                            {userRole === 'as_student' &&
                              request.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10! border-red-500/30! text-base! dark:text-red-500 dark:hover:bg-red-500/10"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsCancelDialogOpen(true);
                                  }}
                                >
                                  Cancel Request
                                  <Trash2 className="size-5" />
                                </Button>
                              )}

                            {request.status === 'pending' &&
                              request.expiresAt && (
                                <span className="ml-auto flex items-center gap-1.5 text-base text-neutral-500">
                                  <Calendar className="size-4" />
                                  Expires{' '}
                                  {formatRelativeTime(request.expiresAt)}
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

      <Dialog open={isAcceptDialogOpen} onOpenChange={setIsAcceptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Accept Request</DialogTitle>
            <DialogDescription className="text-base">
              Accept this mentorship request from{' '}
              {selectedRequest?.student.firstName}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Textarea
              value={acceptMessage}
              onChange={(e) => setAcceptMessage(e.target.value)}
              placeholder="Add a welcome message (optional)..."
              className="min-h-[120px] text-base!"
              disabled={isProcessing}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAcceptDialogOpen(false)}
                disabled={isProcessing}
                className="h-12! text-base!"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                className="h-12! text-base!"
              >
                {isProcessing ? (
                  <>
                    Accepting...
                    <Loader2 className="size-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Accept Request
                    <CheckCircle className="size-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Decline Request</DialogTitle>
            <DialogDescription className="text-base">
              Please provide a reason for declining this request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Explain why you're declining this request..."
              className="min-h-[120px] text-base!"
              disabled={isProcessing}
            />

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDeclineDialogOpen(false)}
                disabled={isProcessing}
                className="h-12! text-base!"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={isProcessing || !declineReason.trim()}
                className="h-12! text-base!"
              >
                {isProcessing ? (
                  <>
                    Declining...
                    <Loader2 className="size-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Decline Request
                    <XCircle className="size-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2.5 text-2xl">
              Cancel Request
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to cancel this connection request? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isProcessing}
              className="h-12! text-base!"
            >
              Keep Request
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isProcessing}
              className="h-12! bg-red-600 text-base! text-white hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  Cancelling...
                  <Loader2 className="size-5 animate-spin" />
                </>
              ) : (
                <>
                  Cancel Request
                  <Trash2 className="size-5" />
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
