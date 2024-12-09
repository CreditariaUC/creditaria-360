import { supabase } from '../lib/supabase';
import type { Notification, NotificationFilters } from '../types/notification.types';

export const notificationService = {
  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read);
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('read', false);

    if (error) throw error;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at' | 'read'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...notification, read: false }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};