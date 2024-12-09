import React from 'react';
import type { Notification } from '../../types/notification.types';
import NotificationIcon from './NotificationIcon';
import NotificationActions from './NotificationActions';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  return (
    <div className={`p-4 border-b ${notification.read ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <NotificationIcon type={notification.type} />
        </div>
        <div className="flex-grow">
          <h4 className="text-sm font-medium">{notification.title}</h4>
          <p className="text-sm text-gray-600">{notification.message}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(notification.created_at).toLocaleDateString()}
            </span>
            <NotificationActions
              notification={notification}
              onMarkAsRead={onMarkAsRead}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;