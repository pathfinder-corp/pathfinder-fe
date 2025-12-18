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
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { notificationService } from '@/services';
import type { INotification, NotificationType } from '@/types';

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
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications({ limit: 20 });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
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
      await notificationService.markAsRead({ notificationIds: [notificationId] });
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      setIsMarkingRead(true);
      await notificationService.markAsRead({ notificationIds: unreadIds });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
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

    setIsOpen(false);
  };

  const getNotificationIcon = (type: NotificationType) => {
    const className = `size-4 mt-0.5 flex-shrink-0 text-neutral-400`;
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
          className="relative size-12 rounded-full"
        >
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 size-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0 bg-neutral-900 border-neutral-800"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead}
              className="text-sm text-neutral-400 hover:text-white h-8"
            >
              {isMarkingRead ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Mark all read
                  <CheckCheck className="size-4" />
                </>
              )}
            </Button>
          )}
        </div>

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-neutral-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-neutral-500">
              <Bell className="size-8 mb-2 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/50">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left px-4 py-3 hover:bg-neutral-800/50 transition-colors cursor-pointer ${
                    !notification.isRead ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {getNotificationIcon(notification.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium line-clamp-1 ${
                          !notification.isRead ? 'text-white' : 'text-neutral-300'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="size-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      
                      <p className="text-sm text-neutral-400 line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-neutral-500 mt-1 capitalize">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-neutral-800 p-2">
          <Button
            variant="ghost"
            className="w-full h-9 text-sm text-neutral-400 hover:text-white"
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