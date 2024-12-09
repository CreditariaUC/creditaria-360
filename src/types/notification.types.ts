export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationActionType = 'view' | 'action' | 'dismiss';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  action_type: NotificationActionType;
  link?: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  read?: boolean;
  startDate?: string;
  endDate?: string;
}