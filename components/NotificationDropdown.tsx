'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Users,
  FileText,
  MessageCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { notificationService } from '@/services';
import type { INotification, NotificationType } from '@/types';
import { toast } from 'sonner';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMarkingRead, setIsMarkingRead] = useState<boolean>(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch unread count';
      toast.error('Failed to fetch unread count', {
        description: errorMessage,
      });
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications({
        limit: 20,
      });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch notifications';
      toast.error('Failed to fetch notifications', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead({
        notificationIds: [notificationId],
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to mark notification as read';
      toast.error('Failed to mark notification as read', {
        description: errorMessage,
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      setIsMarkingRead(true);
      await notificationService.markAsRead({ notificationIds: unreadIds });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to mark all as read';
      toast.error('Failed to mark all as read', {
        description: errorMessage,
      });
    } finally {
      setIsMarkingRead(false);
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
        router.push('/mentor/requests');
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
        router.push('/mentor/requests');
        break;
      case 'mentor_role_granted':
        router.push('/mentor/profile');
        break;
      case 'mentor_role_revoked':
        router.push('/mentor/applications');
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (type: NotificationType) => {
    const className = `size-5 mt-1 shrink-0 text-neutral-400`;
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
      case 'mentor_role_granted':
      case 'mentor_role_revoked':
        return <Users className={className} />;
      default:
        return <AlertCircle className={className} />;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-14 rounded-full"
        >
          <Bell className="size-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="flex h-[300px] w-md flex-col border-neutral-800 bg-neutral-900 p-0"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-5 py-4">
          <h3 className="text-2xl font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead}
              className="h-10 text-base text-neutral-400 hover:text-white"
            >
              {isMarkingRead ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Mark all read
                  <CheckCheck className="size-5" />
                </>
              )}
            </Button>
          )}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-7 animate-spin text-neutral-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="absolute top-0 left-0 flex size-full flex-col items-center justify-center text-neutral-500">
              <Bell className="mb-3 size-10 opacity-40" />
              <p className="text-lg">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/50">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full cursor-pointer px-5 py-4 text-left transition-colors hover:bg-neutral-800/50 ${
                    !notification.isRead ? 'bg-white/2' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`line-clamp-1 text-base font-medium ${
                            !notification.isRead
                              ? 'text-white'
                              : 'text-neutral-300'
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-2 size-2 shrink-0 animate-pulse rounded-full bg-green-500" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-base text-neutral-400">
                        {notification.message}
                      </p>

                      <p className="mt-1.5 text-sm text-neutral-500 capitalize">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="shrink-0 border-t border-neutral-800 p-3">
          <Button
            variant="ghost"
            className="h-11 w-full text-base text-neutral-400 hover:text-white"
            onClick={() => {
              router.push('/notifications');
              setIsOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
