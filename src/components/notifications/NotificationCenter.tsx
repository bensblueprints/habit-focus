import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, X, Award, TrendingUp, Clock, Check, AlertTriangle, Info } from 'lucide-react';
import useNotificationStore from '../../hooks/useNotificationStore';

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotificationStore(state => state.notifications);
  const unreadNotifications = useNotificationStore(state => state.getUnreadNotifications());
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const removeNotification = useNotificationStore(state => state.removeNotification);
  const clearExpiredNotifications = useNotificationStore(state => state.clearExpiredNotifications);
  
  // Clear expired notifications on mount
  useEffect(() => {
    clearExpiredNotifications();
  }, [clearExpiredNotifications]);
  
  // Sort notifications by creation date (newest first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get icon component based on notification icon string
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'award':
        return <Award className="h-5 w-5 text-amber-500" />;
      case 'trending-up':
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      case 'clock':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'check-square':
        return <Check className="h-5 w-5 text-purple-500" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Get color class based on notification priority
  const getPriorityColorClass = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/20';
      case 'medium':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/20';
      case 'low':
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/20';
    }
  };
  
  // Handle notification click, based on action
  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    
    if (notification.action && notification.action.handler) {
      // In a real implementation, you would handle navigation or other actions here
      console.log('Notification action:', notification.action.handler);
    }
  };
  
  // Notification bell with badge for unread notifications
  const NotificationBell = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 shadow-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-800"
    >
      <Bell className="h-6 w-6 text-white" />
      {unreadNotifications.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
          {unreadNotifications.length}
        </span>
      )}
    </button>
  );
  
  return (
    <>
      <NotificationBell />
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Notification panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-md overflow-hidden bg-white shadow-xl dark:bg-gray-800 sm:max-w-lg"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
                  
                  <div className="flex gap-2">
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      >
                        Mark all as read
                      </button>
                    )}
                    
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Notification list */}
                <div className="flex-1 overflow-y-auto p-4">
                  {sortedNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-md bg-gray-50 p-6 text-center dark:bg-gray-700">
                      <Bell className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        You don't have any notifications yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedNotifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`relative rounded-md border p-4 ${getPriorityColorClass(notification.priority)} ${
                            !notification.read ? 'border-l-4 border-l-primary-500' : ''
                          }`}
                        >
                          <div className="flex">
                            <div className="flex-shrink-0">
                              {getIconComponent(notification.icon)}
                            </div>
                            
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {notification.title}
                                </p>
                                <button
                                  onClick={() => removeNotification(notification.id)}
                                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {notification.message}
                              </p>
                              
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                  {new Date(notification.createdAt).toLocaleString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                                
                                {notification.action && (
                                  <button
                                    onClick={() => handleNotificationClick(notification)}
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                  >
                                    {notification.action.label}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationCenter; 