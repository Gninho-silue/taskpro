import React, { useEffect } from 'react';
import { XMarkIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  fetchNotifications, 
  markAsRead, 
  markAllAsRead, 
  clearAllNotifications 
} from '../../store/slices/notificationsSlice';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { notifications, isLoading, unreadCount } = useAppSelector((state) => state.notifications);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotifications());
  }
  }, [isOpen, dispatch]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications());
  };
    
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return '📋';
      case 'TASK_COMPLETED':
        return '✅';
      case 'TASK_COMMENT':
        return '💬';
      case 'PROJECT_INVITATION':
        return '📢';
      case 'TEAM_INVITATION':
        return '👥';
      default:
        return '🔔';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" 
          onClick={onClose} 
        />
      )}

      {/* Notification Panel */}
      <div
        className={clsx(
          'fixed top-16 right-0 z-50 w-80 h-full bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex space-x-2 p-3 border-b border-gray-100">
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 rounded-md border border-blue-200 hover:border-blue-300"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Mark all read</span>
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 rounded-md border border-red-200 hover:border-red-300"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Clear all</span>
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <div className="text-4xl mb-4">🔔</div>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={clsx(
                      'p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100',
                      !notification.read && 'bg-blue-50 border-l-4 border-l-blue-500'
                    )}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-lg">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        {notification.projectName && (
                          <p className="text-xs text-gray-500 mt-1">
                            Project: {notification.projectName}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatNotificationTime(notification.sentAt || notification.createdAt || '')}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
