import React from 'react';
import { ScrollShadow, Button } from '@nextui-org/react';
import { Check, Trash2 } from 'lucide-react';
import type { Notification } from '../../types/notification.types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No tienes notificaciones
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 py-2 border-b flex justify-between items-center">
        <span className="text-sm font-semibold">Notificaciones</span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="light"
            startContent={<Check size={16} />}
            onPress={onMarkAllAsRead}
          >
            Marcar todas como leídas
          </Button>
        </div>
      </div>
      <ScrollShadow className="max-h-[400px]">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </ScrollShadow>
    </div>
  );
};

export default NotificationList;