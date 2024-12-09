import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { NotificationType } from '../../types/notification.types';

interface NotificationIconProps {
  type: NotificationType;
  size?: number;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type, size = 20 }) => {
  switch (type) {
    case 'info':
      return <Info className="text-blue-500" size={size} />;
    case 'warning':
      return <AlertTriangle className="text-yellow-500" size={size} />;
    case 'error':
      return <AlertCircle className="text-red-500" size={size} />;
    case 'success':
      return <CheckCircle2 className="text-green-500" size={size} />;
    default:
      return <Info className="text-blue-500" size={size} />;
  }
};

export default NotificationIcon;