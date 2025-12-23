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
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useUserStore } from '@/stores';
import { mentorshipService } from '@/services';
import { USER_ROLES } from '@/constants';
import type { 
  IMentorshipRequest, 
  MentorshipRequestStatus,
  MentorshipRequestRole 
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
  { id: 'declined', label: 'Declined' }
];

export default function MentorshipRequestsPage() {
  const router = useRouter();
  const { user, isInitialized } = useUserStore();

  const [requests, setRequests] = useState<IMentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const [selectedRequest, setSelectedRequest] = useState<IMentorshipRequest | null>(null);
  const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState<boolean>(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState<boolean>(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [acceptMessage, setAcceptMessage] = useState<string>('');
  const [declineReason, setDeclineReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const userRole: MentorshipRequestRole = user?.role === USER_ROLES.MENTOR ? 'as_mentor' : 'as_student';
  const activeIndex = TABS.findIndex(tab => tab.id === activeTab);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab as MentorshipRequestStatus;
      const response = await mentorshipService.getRequests({
        role: userRole,
        status,
        limit: 50
      });
      setRequests(response.requests || []);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to load requests';
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
      await mentorshipService.acceptRequest(selectedRequest.id, {
        message: acceptMessage.trim() || undefined
      });
      toast.success('Request accepted successfully! Redirecting to messages...');
      setIsAcceptDialogOpen(false);
      setSelectedRequest(null);
      setAcceptMessage('');
      
      router.push('/messages');
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to accept request';
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
        reason: declineReason.trim()
      });
      toast.success('Request declined');
      setIsDeclineDialogOpen(false);
      setSelectedRequest(null);
      setDeclineReason('');
      fetchRequests();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to decline request';
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to cancel request';
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
          <Badge className={`${baseClasses} bg-yellow-500/20 text-yellow-400 border-yellow-500/30`}>
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className={`${baseClasses} bg-green-500/20 text-green-400 border-green-500/30`}>
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge className={`${baseClasses} bg-red-500/20 text-red-400 border-red-500/30`}>
            Declined
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className={`${baseClasses} bg-neutral-500/20 text-neutral-400 border-neutral-500/30`}>
            Cancelled
          </Badge>
        );
      case 'expired':
        return (
          <Badge className={`${baseClasses} bg-orange-500/20 text-orange-400 border-orange-500/30`}>
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
      <div className="pt-12 pb-16 flex flex-col items-center justify-center">
        <Loader2 className="size-10 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="pt-12 pb-16 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-8">
        {userRole === 'as_mentor' ? 'Mentorship Requests' : 'My Requests'}
      </h1>
      <p className="text-2xl text-neutral-500 mb-10">
        {userRole === 'as_mentor' 
          ? 'Review and manage connection requests from students'
          : 'Track your connection requests to mentors'
        }
      </p>

      <div className="w-232 flex items-center gap-1 mb-10 border-b border-neutral-800">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer relative px-6 py-4 text-lg font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.label}
              {isActive && (
                <motion.span 
                  layoutId="activeRequestsTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" 
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
                  <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7">
                    <div className="flex items-start gap-5">
                      <Skeleton className="size-16 rounded-full bg-neutral-800" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-7 w-52 bg-neutral-800" />
                        <Skeleton className="h-6 w-full bg-neutral-800" />
                      </div>
                      <Skeleton className="h-9 w-28 bg-neutral-800 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="w-232 text-center py-20">
                <div className="size-24 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-8">
                  <Users className="size-12 text-neutral-500" />
                </div>
                <h2 className="text-3xl font-semibold mb-4">No requests found</h2>
                <p className="text-xl text-neutral-400 mb-10">
                  {userRole === 'as_mentor' 
                    ? 'You don\'t have any mentorship requests yet.'
                    : 'You haven\'t sent any connection requests yet.'
                  }
                </p>
                {userRole === 'as_student' && (
                  <Button 
                    onClick={() => router.push('/mentors')}
                    className="h-16! text-xl! px-10!"
                  >
                    Browse Mentors 
                    <Users className="size-5" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-232 space-y-5">
                {requests.map((request) => {
                  const otherUser = userRole === 'as_mentor' ? request.student : request.mentor;
                  
                  return (
                    <div 
                      key={request.id}
                      className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-7"
                    >
                      <div className="flex items-start gap-5">
                        {otherUser.avatar ? (
                          <div className="relative size-16 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={otherUser.avatar}
                              alt={`${otherUser.firstName} ${otherUser.lastName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="size-16 rounded-full bg-linear-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-xl font-bold shrink-0">
                            {getInitials(otherUser.firstName, otherUser.lastName)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="text-2xl font-semibold">
                                {otherUser.firstName} {otherUser.lastName}
                              </h3>
                              <p className="text-base text-neutral-500">
                                {userRole === 'as_mentor' ? 'Student' : 'Mentor'} • {formatRelativeTime(request.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          <p className="text-lg text-neutral-300 mb-5 line-clamp-2">
                            {request.message}
                          </p>

                          {request.status === 'declined' && request.declineReason && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-5">
                              <p className="text-base text-red-400">
                                <span className="font-medium">Reason:</span> {request.declineReason}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {userRole === 'as_student' && request.mentorProfileId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/mentors/${request.mentorProfileId}`)}
                                className="h-10! text-base!"
                              >
                                View Profile
                              </Button>
                            )}

{userRole === 'as_mentor' && request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsAcceptDialogOpen(true);
                                  }}
                                  className="h-10! text-base! bg-green-500/20 text-green-400 border-green-500/30 dark:hover:bg-green-500/30"
                                >
                                  Accept
                                  <CheckCircle className="size-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10! text-base! dark:text-red-500 border-red-500/30! dark:hover:bg-red-500/10"
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

                            {userRole === 'as_student' && request.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10! text-base! dark:text-red-500 border-red-500/30! dark:hover:bg-red-500/10"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsCancelDialogOpen(true);
                                }}
                              >
                                Cancel Request
                                <Trash2 className="size-5" />
                              </Button>
                            )}

                            {request.status === 'accepted' && (
                              <Button
                                size="sm"
                                onClick={() => router.push('/messages')}
                                className="h-10! text-base!"
                              >
                                Message
                                <MessageCircle className="size-5" />
                              </Button>
                            )}


                            {request.status === 'pending' && request.expiresAt && (
                              <span className="text-base text-neutral-500 ml-auto flex items-center gap-1.5">
                                <Calendar className="size-4" />
                                Expires {formatRelativeTime(request.expiresAt)}
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
              Accept this mentorship request from {selectedRequest?.student.firstName}?
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

            <div className="flex gap-3 justify-end">
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

            <div className="flex gap-3 justify-end">
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

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl flex items-center gap-2.5">
              <Trash2 className="size-7" />
              Cancel Request
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Are you sure you want to cancel this connection request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="h-12! text-base!">
              Keep Request
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white h-12! text-base!"
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