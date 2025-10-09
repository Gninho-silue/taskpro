import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';

interface NotificationItemProps {
  id: number;
  message: string;
  type: string;
  read: boolean;
  sentAt: string;
  relatedProject?: {
    id: number;
    name: string;
  };
  onClick: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  message,
  type,
  read,
  sentAt,
  relatedProject,
  onClick
}) => {
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
    <div
      className={clsx(
        'p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100',
        !read && 'bg-blue-50 border-l-4 border-l-blue-500'
      )}
      onClick={onClick}
    >
      <div className="flex space-x-3">
        <div className="flex-shrink-0">
          <span className="text-lg">
            {getNotificationIcon(type)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {message}
          </p>
          {relatedProject && (
            <p className="text-xs text-gray-500 mt-1">
              Project: {relatedProject.name}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {formatNotificationTime(sentAt)}
          </p>
        </div>
        {!read && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;