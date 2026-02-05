'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  Check,
  ImageIcon,
  Music,
  Settings,
  Trash2,
  Video,
  Zap,
} from 'lucide-react';
import { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { NotificationTableType } from '@/db/schema/notification';
import {
  useGetNotifications,
  useUpdateNotification,
} from '@/app/_others/notification/actions/use-notification.action';
import moment from 'moment';

interface OptimisticNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | string; // Relaxed type to match DB
  iconType: string; // Keep original for helper
  icon: React.ReactNode;
  title: string;
  message: string;
  time: string;
  read: boolean;
  softDelete?: boolean;
}

export default function NotificationNavComp({
  currentUser,
}: {
  currentUser: User;
}) {
  const router = useRouter();

  // 1. Fetch Data
  const { data: serverNotifications = [], isLoading } = useGetNotifications();
  const updateNotificationMutation = useUpdateNotification();

  // 2. Transform Data (Memoized for performance)
  // We use the data directly from useGetNotifications. If the hook
  // does optimistic updates, 'serverNotifications' will implicitly update.
  const notifications = useMemo(() => {
    return serverNotifications
      .filter((n) => !n.softDelete)
      .map((n) => ({
        id: n.id,
        type: n.type,
        iconType: n.iconType,
        icon: getIconByType(n.iconType),
        title: n.title,
        message: n.message,
        time: moment(n.time).fromNow(),
        read: n.read,
        softDelete: n.softDelete,
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()); // Optional: Sort by newest
  }, [serverNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 3. Actions
  // Simplified: We just call mutate. The hook handles the optimistic UI update.
  const markAsRead = (id: string) => {
    updateNotificationMutation.mutate({ id, read: true });
  };

  const deleteNotification = (id: string) => {
    updateNotificationMutation.mutate({ id, softDelete: true });
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    // Note: Ideally, create a backend endpoint for "mark-all-read" to do this in 1 request.
    // Doing a loop here is okay for small numbers but inefficient.
    unreadIds.forEach((id) => {
      updateNotificationMutation.mutate({ id, read: true });
    });
  };

  const clearAll = () => {
    const allIds = notifications.map((n) => n.id);
    if (allIds.length === 0) return;

    // Note: Same as above, a "clear-all" endpoint is better.
    allIds.forEach((id) => {
      updateNotificationMutation.mutate({ id, softDelete: true });
    });
  };

  // 4. Styles Helpers
  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-600';
      case 'warning':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  function getIconByType(iconType: string) {
    switch (iconType) {
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'photo':
        return <ImageIcon className="w-4 h-4" />;
      case 'credits_low':
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  }

  // 5. Render
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative size-8 sm:size-9 rounded-full"
        disabled
      >
        <Bell className="size-4 sm:size-5 text-gray-600" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={unreadCount ? 'outline' : 'ghost'}
          size="icon"
          className="relative size-8 sm:size-9 rounded-full"
        >
          <Bell
            className="size-4 sm:size-5 text-gray-600"
            fill={unreadCount ? 'currentColor' : 'none'}
          />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-4 sm:size-[18px] items-center justify-center rounded-full bg-red-500 text-[8px] sm:text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[90vw] sm:w-[400px] p-0 mx-2 sm:mx-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-3 sm:p-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <p className="text-xs text-gray-500">
              {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs hover:bg-gray-100"
              >
                <Check className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Mark all</span>
              </Button>
            )}
            <Button
              onClick={() =>
                router.push(
                  `/${currentUser.role === 'admin' ? 'admin' : 'user'}/notification-management`
                )
              }
              size="sm"
              variant="ghost"
              className="h-7 sm:h-8 w-7 sm:w-8 p-0 sm:p-2"
            >
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[50vh] sm:max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <div className="mb-3 rounded-full bg-gray-100 p-3 sm:p-4">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                No notifications
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group border-b border-gray-100 p-3 sm:p-4 transition-colors hover:bg-gray-50 ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex gap-2 sm:gap-3">
                  <div
                    className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${getIconBgColor(notification.type)}`}
                  >
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1 sm:gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="mt-1 sm:mt-2 text-xs text-gray-400">
                          {notification.time}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Only show Mark Read if not read */}
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsRead(notification.id)}
                            className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-gray-200"
                          >
                            <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-gray-200 p-2 sm:p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="w-full h-8 sm:h-9 text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
