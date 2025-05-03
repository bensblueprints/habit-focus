import { Task, TimeBlock } from '../context/AppContext';

// Notification types
export type NotificationType = 
  | 'progress' 
  | 'streak' 
  | 'inactivity' 
  | 'habitReminder' 
  | 'taskReminder'
  | 'motivation';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Extended NotificationOptions to include vibrate
interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
}

// Check if browser supports notifications
const checkNotificationSupport = (): boolean => {
  return 'Notification' in window;
};

// Request permission for notifications
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!checkNotificationSupport()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Show a browser notification
export const showNotification = (
  title: string, 
  options: ExtendedNotificationOptions = {}
): void => {
  if (!checkNotificationSupport() || Notification.permission !== 'granted') {
    console.warn('Notifications not enabled');
    return;
  }

  try {
    // Set notification icon if not provided
    if (!options.icon) {
      options.icon = '/app-icon.png'; // Default icon path
    }

    // Create and show notification
    const notification = new Notification(title, options);

    // Handle notification click
    if (options.data && options.data.url) {
      notification.onclick = () => {
        window.focus();
        window.location.href = options.data?.url;
      };
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Progress notification functions
export const showProgressNotification = (percentage: number): void => {
  let message = '';
  if (percentage === 25) {
    message = '¼ done! Keep it up! 🚀';
  } else if (percentage === 50) {
    message = 'Halfway there! You\'re crushing it! 💪';
  } else if (percentage === 75) {
    message = 'Almost there! Final push! 🔥';
  } else if (percentage === 100) {
    message = 'You did it! Awesome job! 🎉';
  }

  if (message) {
    showNotification(`${percentage}% Complete`, {
      body: message,
      badge: '/badge-icon.png',
      vibrate: [200, 100, 200],
      data: { url: '/focus' }
    });
  }
};

// Streak notification functions
export const showStreakNotification = (streakDays: number): void => {
  if (streakDays % 3 === 0) { // Show for every 3 days of streak
    showNotification(`${streakDays} Day Streak! 🔥`, {
      body: `You've been productive for ${streakDays} days in a row! Keep it up!`,
      badge: '/badge-icon.png',
      vibrate: [200, 100, 200],
      data: { url: '/habits' }
    });
  }
};

// Inactivity notification
export const showInactivityNotification = (inactiveDays: number): void => {
  const messages = [
    "We haven't seen you in a while! Ready to get back on track?",
    "Your tasks are waiting for you! Come back and crush your goals!",
    "Missing your productivity streak! Jump back in now!",
    "Small steps each day lead to big results. Let's take one today!",
    "Your future self will thank you for being productive today!"
  ];

  // Select a random message
  const message = messages[Math.floor(Math.random() * messages.length)];

  showNotification("Miss You! 👋", {
    body: message + (inactiveDays > 2 ? ` It's been ${inactiveDays} days since your last visit.` : ''),
    badge: '/badge-icon.png',
    vibrate: [200, 100, 200],
    data: { url: '/' }
  });
};

// Reminder notifications for habits and events
export const scheduleHabitReminder = (timeBlock: TimeBlock): void => {
  const now = new Date();
  const start = new Date(timeBlock.start);
  
  // Calculate times for each reminder
  const oneHourBefore = new Date(start.getTime() - 60 * 60 * 1000);
  const thirtyMinBefore = new Date(start.getTime() - 30 * 60 * 1000);
  const fifteenMinBefore = new Date(start.getTime() - 15 * 60 * 1000);
  const fiveMinBefore = new Date(start.getTime() - 5 * 60 * 1000);
  
  // Only schedule notifications that are in the future
  const reminderTimes = [
    { time: oneHourBefore, message: `1 hour until: ${timeBlock.title}` },
    { time: thirtyMinBefore, message: `30 minutes until: ${timeBlock.title}` },
    { time: fifteenMinBefore, message: `15 minutes until: ${timeBlock.title}` },
    { time: fiveMinBefore, message: `Starting soon: ${timeBlock.title}` }
  ].filter(reminder => reminder.time > now);
  
  // Schedule each notification
  reminderTimes.forEach(reminder => {
    const timeUntilReminder = reminder.time.getTime() - now.getTime();
    
    setTimeout(() => {
      showNotification("Upcoming: " + timeBlock.title, {
        body: reminder.message,
        silent: true, // Silent notifications for reminders
        badge: '/badge-icon.png',
        data: { url: '/calendar' }
      });
    }, timeUntilReminder);
  });
};

// Schedule task reminder
export const scheduleTaskReminder = (task: Task): void => {
  if (task.dueDate) {
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    
    // Calculate times for each reminder
    const oneDayBefore = new Date(dueDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    
    const fourHoursBefore = new Date(dueDate.getTime() - 4 * 60 * 60 * 1000);
    
    // Only schedule notifications that are in the future
    const reminderTimes = [
      { time: oneDayBefore, message: `Due tomorrow: ${task.title}` },
      { time: fourHoursBefore, message: `Due in 4 hours: ${task.title}` }
    ].filter(reminder => reminder.time > now);
    
    // Schedule each notification
    reminderTimes.forEach(reminder => {
      const timeUntilReminder = reminder.time.getTime() - now.getTime();
      
      setTimeout(() => {
        showNotification("Task Due Soon: " + task.title, {
          body: reminder.message,
          badge: '/badge-icon.png',
          vibrate: [100, 50, 100],
          data: { url: '/tasks' }
        });
      }, timeUntilReminder);
    });
  }
};

// Motivational notifications
export const scheduleMotivationalNotifications = (): void => {
  const motivationalMessages = [
    "Small steps add up to big progress! 🌱",
    "You don't have to be perfect to make progress! 🚀",
    "Focus on progress, not perfection! 💪",
    "Your effort today determines your success tomorrow! ⭐",
    "Every task you complete is a victory! 🏆",
    "The hardest part is starting. Let's start now! 🎯",
    "ADHD superpowers activated! Time to hyperfocus! 💥",
    "Remember to take breaks. They help you perform better! 🧘‍♂️",
    "Celebrate your wins, no matter how small! 🎉",
    "You've got this! One task at a time! 👊"
  ];

  // Show a random motivational message several times per day
  const scheduleRandomMessage = () => {
    // Get random message
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    // Show notification
    showNotification("Motivation Boost! ✨", {
      body: message,
      badge: '/badge-icon.png',
      data: { url: '/' }
    });
    
    // Schedule the next one (2-4 hours later)
    const nextInterval = (2 + Math.random() * 2) * 60 * 60 * 1000; // 2-4 hours in ms
    setTimeout(scheduleRandomMessage, nextInterval);
  };
  
  // Start the cycle
  scheduleRandomMessage();
};

// Detect inactivity
export const setupInactivityDetection = (): void => {
  // Check if the user has been inactive
  const checkInactivity = () => {
    const lastActive = localStorage.getItem('lastActiveTimestamp');
    
    if (lastActive) {
      const lastActiveDate = new Date(parseInt(lastActive));
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 2) {
        // If inactive for 2+ days, show notification
        showInactivityNotification(diffDays);
      }
    }
    
    // Update last active timestamp
    localStorage.setItem('lastActiveTimestamp', Date.now().toString());
  };
  
  // Check for inactivity when the app loads
  checkInactivity();
  
  // Update the last active timestamp when the user interacts with the app
  const updateActivityTimestamp = () => {
    localStorage.setItem('lastActiveTimestamp', Date.now().toString());
  };
  
  // Listen for user activity
  window.addEventListener('click', updateActivityTimestamp);
  window.addEventListener('keypress', updateActivityTimestamp);
  window.addEventListener('scroll', updateActivityTimestamp);
  window.addEventListener('mousemove', updateActivityTimestamp);
  
  // Also set a daily check for inactivity
  setInterval(checkInactivity, 24 * 60 * 60 * 1000); // Check once per day
};

// Initialize all notification features
export const initializeNotifications = async (): Promise<void> => {
  const permissionGranted = await requestNotificationPermission();
  
  if (permissionGranted) {
    console.log('Notification permission granted');
    setupInactivityDetection();
    scheduleMotivationalNotifications();
  } else {
    console.warn('Notification permission denied');
  }
};

// Export default service object
const notificationService = {
  requestPermission: requestNotificationPermission,
  showNotification,
  showProgressNotification,
  showStreakNotification,
  scheduleHabitReminder,
  scheduleTaskReminder,
  initializeNotifications
};

export default notificationService; 