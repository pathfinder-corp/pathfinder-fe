'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  MessageCircle,
  Calendar,
  AlertCircle,
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
      console.error('Failed to fetch requests:', error);
      toast.error('Failed to load requests');
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
      console.error('Failed to accept request:', error);
      toast.error('Failed to accept request');
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
      console.error('Failed to decline request:', error);
      toast.error('Failed to decline request');
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
      console.error('Failed to cancel request:', error);
      toast.error('Failed to cancel request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: MentorshipRequestStatus) => {
    const baseClasses = 'px-3 py-2';
    
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const formatFullDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  if (!isInitialized) {
    return (
      <div className="pt-10 pb-12 flex flex-col items-center justify-center">
        <Loader2 className="size-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6">
        {userRole === 'as_mentor' ? 'Mentorship Requests' : 'My Requests'}
      </h1>
      <p className="text-xl text-neutral-500 mb-8">
        {userRole === 'as_mentor' 
          ? 'Review and manage connection requests from students'
          : 'Track your connection requests to mentors'
        }
      </p>

      <div className="flex items-center gap-1 mb-8 border-b border-neutral-800">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer relative px-5 py-3 text-base font-medium transition-colors ${
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
              <div className="w-[58rem] space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="size-14 rounded-full bg-neutral-800" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-48 bg-neutral-800" />
                        <Skeleton className="h-5 w-full bg-neutral-800" />
                      </div>
                      <Skeleton className="h-8 w-24 bg-neutral-800 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="w-[58rem] text-center py-16">
                <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                  <Users className="size-10 text-neutral-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">No requests found</h2>
                <p className="text-lg text-neutral-400 mb-8">
                  {userRole === 'as_mentor' 
                    ? 'You don\'t have any mentorship requests yet.'
                    : 'You haven\'t sent any connection requests yet.'
                  }
                </p>
                {userRole === 'as_student' && (
                  <Button 
                    onClick={() => router.push('/mentors')}
                    className="!h-12 !text-[1.15rem]"
                  >
                    Browse Mentors
                  </Button>
                )}
              </div>
            ) : (
              <div className="w-[58rem] space-y-4">
                {requests.map((request) => {
                  const otherUser = userRole === 'as_mentor' ? request.student : request.mentor;
                  
                  return (
                    <div 
                      key={request.id}
                      className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6"
                    >
                      <div className="flex items-start gap-4">
                        {otherUser.avatar ? (
                          <div className="relative size-14 rounded-full overflow-hidden flex-shrink-0">
                            <Image
                              src={otherUser.avatar}
                              alt={`${otherUser.firstName} ${otherUser.lastName}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="size-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-lg font-bold flex-shrink-0">
                            {getInitials(otherUser.firstName, otherUser.lastName)}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-xl font-semibold">
                                {otherUser.firstName} {otherUser.lastName}
                              </h3>
                              <p className="text-sm text-neutral-500">
                                {userRole === 'as_mentor' ? 'Student' : 'Mentor'} • {formatRelativeTime(request.createdAt)}
                              </p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>

                          <p className="text-base text-neutral-300 mb-4 line-clamp-2">
                            {request.message}
                          </p>

                          {request.status === 'declined' && request.declineReason && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                              <p className="text-sm text-red-400">
                                <span className="font-medium">Reason:</span> {request.declineReason}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {userRole === 'as_mentor' && request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsAcceptDialogOpen(true);
                                  }}
                                  className="!h-9 bg-green-500/20 text-green-400 border-green-500/30 dark:hover:bg-green-500/30"
                                >
                                  Accept
                                  <CheckCircle className="size-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="!h-9 dark:text-red-500 !border-red-500/30 dark:hover:bg-red-500/10"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setIsDeclineDialogOpen(true);
                                  }}
                                >
                                  Decline
                                  <XCircle className="size-4" />
                                </Button>
                              </>
                            )}

                            {userRole === 'as_student' && request.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="!h-9 dark:text-red-500 !border-red-500/30 dark:hover:bg-red-500/10"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsCancelDialogOpen(true);
                                }}
                              >
                                Cancel Request
                                <Trash2 className="size-4" />
                              </Button>
                            )}

                            {request.status === 'accepted' && (
                              <Button
                                size="sm"
                                onClick={() => router.push('/messages')}
                                className="!h-9"
                              >
                                Message
                                <MessageCircle className="size-4" />
                              </Button>
                            )}

                            {userRole === 'as_student' && request.mentorProfileId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/mentors/${request.mentorProfileId}`)}
                                className="!h-9"
                              >
                                View Profile
                              </Button>
                            )}

                            {request.status === 'pending' && request.expiresAt && (
                              <span className="text-sm text-neutral-500 ml-auto flex items-center gap-1">
                                <Calendar className="size-3" />
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
            <DialogTitle className="text-xl">Accept Request</DialogTitle>
            <DialogDescription>
              Accept this mentorship request from {selectedRequest?.student.firstName}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={acceptMessage}
              onChange={(e) => setAcceptMessage(e.target.value)}
              placeholder="Add a welcome message (optional)..."
              className="min-h-[100px]"
              disabled={isProcessing}
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAcceptDialogOpen(false)}
                disabled={isProcessing}
                className="!h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                className="!h-11"
              >
                {isProcessing ? (
                  <>
                    Accepting...
                    <Loader2 className="size-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Accept Request
                    <CheckCircle className="size-4" />
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
            <DialogTitle className="text-xl">Decline Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for declining this request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Explain why you're declining this request..."
              className="min-h-[100px]"
              disabled={isProcessing}
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeclineDialogOpen(false)}
                disabled={isProcessing}
                className="!h-11"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                disabled={isProcessing || !declineReason.trim()}
                className="!h-11"
              >
                {isProcessing ? (
                  <>
                    Declining...
                    <Loader2 className="size-4 animate-spin" />
                  </>
                ) : (
                  <>
                    Decline Request
                    <XCircle className="size-4" />
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
            <AlertDialogTitle className="text-xl flex items-center gap-2">
              <Trash2 className="size-6" />
              Cancel Request
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this connection request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="!h-11">
              Keep Request
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white !h-11"
            >
              {isProcessing ? (
                <>
                  Cancelling...
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Cancel Request
                  <Trash2 className="size-4" />
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

