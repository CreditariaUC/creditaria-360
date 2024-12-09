import React from 'react';
import { Button } from '@nextui-org/react';
import { Check, Trash2, ExternalLink } from 'lucide-react';
import type { Notification } from '../../types/notification.types';

interface NotificationActionsProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationActions: React.FC<NotificationActionsProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  return (
    <div className="flex gap-2">
      {!notification.read && (
        <Button
          size="sm"
          variant="light"
          startContent={<Check size={16} />}
          onPress={() => onMarkAsRead(notification.id)}
        >
          Marcar como leída
        </Button>
      )}
      {notification.link && (
        <Button
          size="sm"
          variant="light"
          startContent={<ExternalLink size={16} />}
          as="a"
          href={notification.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver más
        </Button>
      )}
      <Button
        size="sm"
        color="danger"
        variant="light"
        isIconOnly
        onPress={() => onDelete(notification.id)}
      >
        <Trash2 size={16} />
      </Button>
    </div>
  );
};

export default NotificationActions;