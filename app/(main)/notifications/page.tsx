'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  Bell,
  CheckCheck,
  Users,
  FileText,
  MessageCircle,
  AlertCircle,
  Loader2,
  Inbox
} from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { toast } from 'sonner';
import { notificationService } from '@/services';
import type { INotification, NotificationType } from '@/types';

import { TransitionPanel } from '@/components/motion-primitives/transition-panel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type FilterType = 'all' | 'unread' | 'read';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
];

export default function NotificationsPage() {
  const router = useRouter();
  
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isMarkingAll, setIsMarkingAll] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const activeIndex = FILTERS.findIndex(f => f.id === activeFilter);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const unreadOnly = activeFilter === 'unread' ? true : undefined;
      const response = await notificationService.getNotifications({ 
        page, 
        limit: 20,
        unreadOnly 
      });
      
      let filtered = response.notifications;
      if (activeFilter === 'read') {
        filtered = filtered.filter(n => n.isRead);
      }
      
      setNotifications(filtered);
      setTotalPages(response.meta.totalPages);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead({ notificationIds: [notificationId] });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) {
      toast.info('All notifications are already read');
      return;
    }

    try {
      setIsMarkingAll(true);
      await notificationService.markAsRead({ notificationIds: unreadIds });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: INotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    const payload = notification.payload as Record<string, string> | undefined;
    
    switch (notification.type) {
      case 'request_received':
      case 'request_declined':
      case 'request_cancelled':
      case 'request_expired':
        router.push('/mentorship/requests');
        break;
      case 'request_accepted':
      case 'mentorship_started':
        router.push('/messages');
        break;
      case 'application_submitted':
      case 'application_approved':
      case 'application_declined':
        router.push('/mentor/applications');
        break;
      case 'meeting_scheduled':
      case 'meeting_rescheduled':
      case 'meeting_cancelled':
      case 'meeting_reminder':
        if (payload?.conversationId) {
          router.push(`/messages?conversation=${payload.conversationId}`);
        } else {
          router.push('/messages');
        }
        break;
      case 'mentorship_ended':
        router.push('/mentorship/requests');
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const className = 'size-5 text-neutral-400';
    switch (type) {
      case 'request_received':
      case 'request_accepted':
      case 'request_declined':
      case 'request_cancelled':
      case 'request_expired':
        return <Users className={className} />;
      case 'application_submitted':
      case 'application_approved':
      case 'application_declined':
        return <FileText className={className} />;
      case 'meeting_scheduled':
      case 'meeting_rescheduled':
      case 'meeting_cancelled':
      case 'meeting_reminder':
        return <MessageCircle className={className} />;
      case 'mentorship_started':
      case 'mentorship_ended':
        return <Users className={className} />;
      default:
        return <AlertCircle className={className} />;
    }
  };

  const getNotificationTypeBadge = (type: NotificationType) => {
    const baseClasses = 'px-3 py-2';
    switch (type) {
      case 'request_received':
        return <Badge className={`${baseClasses} bg-blue-500/20 text-blue-400 border-blue-500/30`}>Request Received</Badge>;
      case 'request_accepted':
        return <Badge className={`${baseClasses} bg-green-500/20 text-green-400 border-green-500/30`}>Accepted</Badge>;
      case 'request_declined':
        return <Badge className={`${baseClasses} bg-red-500/20 text-red-400 border-red-500/30`}>Declined</Badge>;
      case 'request_cancelled':
        return <Badge className={`${baseClasses} bg-neutral-500/20 text-neutral-400 border-neutral-500/30`}>Cancelled</Badge>;
      case 'request_expired':
        return <Badge className={`${baseClasses} bg-orange-500/20 text-orange-400 border-orange-500/30`}>Expired</Badge>;
      case 'application_submitted':
        return <Badge className={`${baseClasses} bg-yellow-500/20 text-yellow-400 border-yellow-500/30`}>Submitted</Badge>;
      case 'application_approved':
        return <Badge className={`${baseClasses} bg-green-500/20 text-green-400 border-green-500/30`}>Approved</Badge>;
      case 'application_declined':
        return <Badge className={`${baseClasses} bg-red-500/20 text-red-400 border-red-500/30`}>Declined</Badge>;
      case 'meeting_scheduled':
        return <Badge className={`${baseClasses} bg-purple-500/20 text-purple-400 border-purple-500/30`}>Scheduled</Badge>;
      case 'meeting_rescheduled':
        return <Badge className={`${baseClasses} bg-yellow-500/20 text-yellow-400 border-yellow-500/30`}>Rescheduled</Badge>;
      case 'meeting_cancelled':
        return <Badge className={`${baseClasses} bg-red-500/20 text-red-400 border-red-500/30`}>Cancelled</Badge>;
      case 'meeting_reminder':
        return <Badge className={`${baseClasses} bg-blue-500/20 text-blue-400 border-blue-500/30`}>Reminder</Badge>;
      case 'mentorship_started':
        return <Badge className={`${baseClasses} bg-green-500/20 text-green-400 border-green-500/30`}>Started</Badge>;
      case 'mentorship_ended':
        return <Badge className={`${baseClasses} bg-neutral-500/20 text-neutral-400 border-neutral-500/30`}>Ended</Badge>;
      default:
        return <Badge className={`${baseClasses} bg-neutral-500/20 text-neutral-400 border-neutral-500/30`}>System</Badge>;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const formatFullDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="pt-10 pb-12 flex flex-col items-center justify-center">
      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center">
          <Bell className="size-8 text-neutral-300" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Notifications</h1>
          <p className="text-lg text-neutral-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
      </div>

      <div className="w-[58rem] mb-6">
        <div className="flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`cursor-pointer relative px-6 py-4 text-base font-medium transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {filter.label}
                  {filter.id === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-800 rounded-full text-neutral-300">
                      {unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <motion.span 
                      layoutId="activeNotificationFilter"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="!h-10"
            >
              {isMarkingAll ? (
                <>
                  Marking...
                  <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Mark all as read
                  <CheckCheck className="size-4" />
                </>
              )}
            </Button>
          )}
        </div>
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
        {FILTERS.map((filter) => (
          <div key={filter.id} className="w-[58rem]">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <Skeleton className="size-12 rounded-full bg-neutral-800" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48 bg-neutral-800" />
                        <Skeleton className="h-4 w-full bg-neutral-800" />
                        <Skeleton className="h-3 w-24 bg-neutral-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-20">
                <div className="size-20 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                  <Inbox className="size-10 text-neutral-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">No notifications</h2>
                <p className="text-lg text-neutral-400">
                  {activeFilter === 'unread' 
                    ? "You've read all your notifications!"
                    : activeFilter === 'read'
                    ? "No read notifications yet."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full text-left bg-neutral-900/50 border rounded-xl p-5 hover:bg-neutral-800/50 transition-all cursor-pointer ${
                      !notification.isRead 
                        ? 'border-neutral-700 bg-white/[0.02]' 
                        : 'border-neutral-800'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="size-12 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg font-medium ${
                              !notification.isRead ? 'text-white' : 'text-neutral-300'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                            )}
                          </div>
                          {getNotificationTypeBadge(notification.type)}
                        </div>
                        
                        <p className="text-base text-neutral-400 mb-2">
                          {notification.message}
                        </p>
                        
                        <p className="capitalize text-sm text-neutral-500" title={formatFullDate(notification.createdAt)}>
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || isLoading}
                      className="!h-10"
                    >
                      Previous
                    </Button>
                    <span className="px-4 text-neutral-400">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || isLoading}
                      className="!h-10"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </TransitionPanel>
    </div>
  );
}

