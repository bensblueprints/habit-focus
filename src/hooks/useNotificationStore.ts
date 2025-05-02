import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { isBefore, subDays } from 'date-fns';

// Notification types
export type NotificationType = 
  | 'badge_earned' 
  | 'streak_milestone' 
  | 'reminder' 
  | 'achievement' 
  | 'system';

// Notification priority
export type NotificationPriority = 'low' | 'medium' | 'high';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  priority: NotificationPriority;
  createdAt: Date;
  read: boolean;
  action?: {
    label: string;
    handler: string; // Route or action identifier
  };
  expiresAt?: Date;
  relatedItemId?: string; // ID of related item (badge, habit, etc.)
}

// Interface for the notification store state
interface NotificationState {
  notifications: Notification[];
  
  // Notification operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  removeAllNotifications: () => void;
  clearExpiredNotifications: () => void;
  
  // Notification getters
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  getNotificationsByRelatedItemId: (itemId: string) => Notification[];
}

const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      
      addNotification: (notification) => set((state) => {
        // For badge notifications, check if we already have one for the same badge
        if (notification.type === 'badge_earned' && notification.relatedItemId) {
          const existingNotification = state.notifications.find(
            notif => notif.type === 'badge_earned' && notif.relatedItemId === notification.relatedItemId
          );
          
          if (existingNotification) {
            return {
              notifications: state.notifications.map(n => 
                n.id === existingNotification.id ? { ...n, read: false, createdAt: new Date() } : n
              )
            };
          }
        }
        
        return {
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: uuidv4(),
              createdAt: new Date(),
              read: false
            }
          ]
        };
      }),
      
      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      })),
      
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(notification => ({
          ...notification,
          read: true
        }))
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(notification => notification.id !== id)
      })),
      
      removeAllNotifications: () => set({ notifications: [] }),
      
      clearExpiredNotifications: () => set((state) => {
        const now = new Date();
        return {
          notifications: state.notifications.filter(notification => 
            !notification.expiresAt || isBefore(now, notification.expiresAt)
          )
        };
      }),
      
      getUnreadNotifications: () => {
        const { notifications } = get();
        return notifications.filter(notification => !notification.read);
      },
      
      getNotificationsByType: (type) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.type === type);
      },
      
      getNotificationsByPriority: (priority) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.priority === priority);
      },
      
      getNotificationsByRelatedItemId: (itemId) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.relatedItemId === itemId);
      },
    }),
    {
      name: 'notification-storage'
    }
  )
);

// Utility function to create a badge notification
export const createBadgeNotification = (
  title: string,
  message: string,
  badgeId: string,
  priority: NotificationPriority = 'medium'
): Omit<Notification, 'id' | 'createdAt' | 'read'> => {
  return {
    type: 'badge_earned',
    title,
    message,
    icon: 'award',
    priority,
    relatedItemId: badgeId,
    action: {
      label: 'View Badge',
      handler: '/badges'
    },
    expiresAt: subDays(new Date(), -7) // Expires in 7 days
  };
};

// Utility function to create a streak notification
export const createStreakNotification = (
  title: string,
  message: string,
  habitId: string,
  streakCount: number,
  priority: NotificationPriority = 'medium'
): Omit<Notification, 'id' | 'createdAt' | 'read'> => {
  return {
    type: 'streak_milestone',
    title,
    message,
    icon: 'trending-up',
    priority,
    relatedItemId: habitId,
    expiresAt: subDays(new Date(), -3) // Expires in 3 days
  };
};

// Utility function to create a reminder notification
export const createReminderNotification = (
  title: string,
  message: string,
  itemId: string,
  itemType: 'habit' | 'task',
  priority: NotificationPriority = 'high'
): Omit<Notification, 'id' | 'createdAt' | 'read'> => {
  return {
    type: 'reminder',
    title,
    message,
    icon: itemType === 'habit' ? 'repeat' : 'check-square',
    priority,
    relatedItemId: itemId,
    action: {
      label: 'View',
      handler: itemType === 'habit' ? '/habits' : '/tasks'
    },
    expiresAt: subDays(new Date(), -1) // Expires in 1 day
  };
};

export default useNotificationStore; 