import { createContext, useContext, useState, ReactNode } from 'react';
import notificationService from '../utils/notificationService';

// Types
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  dueDate?: Date;
  created: Date;
}

export interface FocusSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  completed: boolean;
  interruptions: Interruption[];
}

export interface Interruption {
  id: string;
  reason: string;
  timestamp: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  date: Date;
}

export interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId?: string;
  completed: boolean;
}

interface AppContextType {
  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'created'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  
  // Focus Sessions
  currentSession: FocusSession | null;
  sessions: FocusSession[];
  startFocusSession: (taskId: string) => void;
  pauseFocusSession: (reason: string) => void;
  resumeFocusSession: () => void;
  endFocusSession: () => void;
  
  // Achievements & Points
  achievements: Achievement[];
  points: number;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'date'>) => void;
  
  // Time Blocks
  timeBlocks: TimeBlock[];
  addTimeBlock: (timeBlock: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, timeBlock: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  
  // Stats
  totalFocusTime: number;
  tasksByCategory: Record<string, number>;
  completionRate: number;
  
  // Streak
  streak: number;
  resetStreak: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export function AppProvider({ children }: { children: ReactNode }) {
  // Create sample tasks with due dates
  const sampleTasks: Task[] = [
    {
      id: 'task1',
      title: 'Complete Project Proposal',
      description: 'Finish the draft for client review',
      completed: false,
      category: 'Work',
      estimatedTime: 60,
      actualTime: 0,
      created: new Date(),
      dueDate: new Date(new Date().setHours(15, 0, 0, 0)) // Today at 3 PM
    },
    {
      id: 'task2',
      title: 'Review Code PR',
      description: 'Check teammates pull request',
      completed: false,
      category: 'Work',
      estimatedTime: 30,
      actualTime: 0,
      created: new Date(),
      dueDate: new Date(new Date().setHours(11, 0, 0, 0)) // Today at 11 AM
    },
    {
      id: 'task3',
      title: 'Grocery Shopping',
      description: 'Buy ingredients for dinner',
      completed: false,
      category: 'Personal',
      estimatedTime: 45,
      actualTime: 0,
      created: new Date(),
      dueDate: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(17, 0, 0, 0)) // Tomorrow at 5 PM
    }
  ];

  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [points, setPoints] = useState(0);
  
  // Add a new state for streaks
  const [streak, setStreak] = useState<number>(() => {
    const savedStreak = localStorage.getItem('streak');
    return savedStreak ? parseInt(savedStreak) : 0;
  });

  // Add a state for the last active date
  const [lastActiveDate, setLastActiveDate] = useState<string>(() => {
    const savedDate = localStorage.getItem('lastActiveDate');
    return savedDate || new Date().toISOString().split('T')[0];
  });

  // Create sample time blocks properly
  const createDate = (dayOffset: number, hours: number, minutes: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  const sampleTimeBlocks: TimeBlock[] = [
    // Today's blocks
    {
      id: '1',
      title: 'Team Meeting',
      start: createDate(0, 10), // Today at 10 AM
      end: createDate(0, 11),   // Today at 11 AM
      completed: false
    },
    {
      id: '2',
      title: 'Lunch Break',
      start: createDate(0, 12), // Today at 12 PM
      end: createDate(0, 13),   // Today at 1 PM
      completed: false
    },
    {
      id: '3',
      title: 'Focus Session',
      start: createDate(0, 14, 30), // Today at 2:30 PM
      end: createDate(0, 16),       // Today at 4 PM
      completed: false
    },
    // Tomorrow's blocks
    {
      id: '4',
      title: 'Project Planning',
      start: createDate(1, 9),    // Tomorrow at 9 AM
      end: createDate(1, 10, 30), // Tomorrow at 10:30 AM
      completed: false
    },
    {
      id: '5',
      title: 'Doctor Appointment',
      start: createDate(1, 15), // Tomorrow at 3 PM
      end: createDate(1, 16),   // Tomorrow at 4 PM
      completed: false
    }
  ];
  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(sampleTimeBlocks);

  // Task functions
  const addTask = (task: Omit<Task, 'id' | 'created'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      created: new Date(),
      completed: false,
      actualTime: 0,
    };
    setTasks([...tasks, newTask]);
    
    // Schedule task reminders if due date is set
    if (newTask.dueDate) {
      notificationService.scheduleTaskReminder(newTask);
    }
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const taskAfterUpdate = { ...task, ...updatedTask };
        
        // If due date is added or changed, schedule reminder
        if (updatedTask.dueDate && 
           (!task.dueDate || 
            new Date(task.dueDate).getTime() !== new Date(updatedTask.dueDate).getTime())) {
          notificationService.scheduleTaskReminder(taskAfterUpdate);
        }
        
        return taskAfterUpdate;
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Add a function to calculate streak bonus multiplier
  const getStreakBonusMultiplier = (streakCount: number): number => {
    if (streakCount < 3) return 1.0; // No bonus under 3 days
    if (streakCount < 7) return 1.1; // 10% bonus for 3-6 days
    if (streakCount < 14) return 1.2; // 20% bonus for 7-13 days
    if (streakCount < 30) return 1.3; // 30% bonus for 14-29 days
    return 1.5; // 50% bonus for 30+ days
  };

  // Update the completeTask function to apply streak bonus to points
  const completeTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ));
    
    // Apply streak bonus to points earned
    const streakMultiplier = getStreakBonusMultiplier(streak);
    const basePoints = 10;
    const bonusPoints = Math.floor(basePoints * streakMultiplier);
    
    // Award points for completing a task (with streak bonus applied)
    setPoints(prevPoints => prevPoints + bonusPoints);
    
    // Handle streak tracking
    const today = new Date().toISOString().split('T')[0];
    
    if (lastActiveDate !== today) {
      // It's a new day, update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastActiveDate === yesterdayStr) {
        // Consecutive day, increment streak
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem('streak', newStreak.toString());
        
        // Show streak notification for milestones
        notificationService.showStreakNotification(newStreak);
      } else {
        // Streak broken, reset to 1
        setStreak(1);
        localStorage.setItem('streak', '1');
      }
      
      // Update last active date
      setLastActiveDate(today);
      localStorage.setItem('lastActiveDate', today);
    }
    
    // Check if this completion should trigger an achievement
    const completedTasks = tasks.filter(task => task.completed).length + 1;
    
    if (completedTasks === 1) {
      addAchievement({
        title: 'First Step',
        description: 'Completed your first task',
        points: 20,
      });
    } else if (completedTasks === 5) {
      addAchievement({
        title: 'Getting Things Done',
        description: 'Completed 5 tasks',
        points: 50,
      });
    } else if (completedTasks === 10) {
      addAchievement({
        title: 'Productivity Master',
        description: 'Completed 10 tasks',
        points: 100,
      });
    }
  };

  // Focus session functions
  const startFocusSession = (taskId: string) => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      taskId,
      startTime: new Date(),
      duration: 0,
      completed: false,
      interruptions: [],
    };
    setCurrentSession(newSession);
  };

  const pauseFocusSession = (reason: string) => {
    if (currentSession) {
      const interruption: Interruption = {
        id: Date.now().toString(),
        reason,
        timestamp: new Date(),
      };
      
      setCurrentSession({
        ...currentSession,
        interruptions: [...currentSession.interruptions, interruption],
      });
    }
  };

  const resumeFocusSession = () => {
    // Simply continue the current session
  };

  // Also update the endFocusSession function to apply streak bonus
  const endFocusSession = () => {
    if (currentSession) {
      const endTime = new Date();
      const duration = (endTime.getTime() - currentSession.startTime.getTime()) / 1000;
      
      const completedSession: FocusSession = {
        ...currentSession,
        endTime,
        duration,
        completed: true,
      };
      
      setSessions([...sessions, completedSession]);
      setCurrentSession(null);
      
      // Update actual time for the task
      const task = tasks.find(t => t.id === completedSession.taskId);
      if (task) {
        updateTask(task.id, {
          actualTime: task.actualTime + Math.floor(duration / 60),
        });
      }
      
      // Apply streak bonus to points earned
      const streakMultiplier = getStreakBonusMultiplier(streak);
      const focusMinutes = Math.floor(duration / 60);
      const basePointsPerMinute = 2; // 2 points per minute
      const totalBasePoints = focusMinutes * basePointsPerMinute;
      const totalBonusPoints = Math.floor(totalBasePoints * streakMultiplier);
      
      // Award points for focus session (with streak bonus)
      setPoints(prevPoints => prevPoints + totalBonusPoints);
      
      // Check for achievements
      if (sessions.length === 0) {
        addAchievement({
          title: 'Focus Initiate',
          description: 'Completed your first focus session',
          points: 25,
        });
      }
      
      const totalFocusMinutes = 
        sessions.reduce((total, session) => total + Math.floor(session.duration / 60), 0) + 
        focusMinutes;
      
      if (totalFocusMinutes >= 60) {
        addAchievement({
          title: 'Hour of Power',
          description: 'Accumulated 1 hour of focus time',
          points: 60,
        });
      }
    }
  };

  // Achievement functions
  const addAchievement = (achievement: Omit<Achievement, 'id' | 'date'>) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: Date.now().toString(),
      date: new Date(),
    };
    
    setAchievements([...achievements, newAchievement]);
    setPoints(prevPoints => prevPoints + achievement.points);
  };

  // Time block functions
  const addTimeBlock = (timeBlock: Omit<TimeBlock, 'id'>) => {
    const newTimeBlock: TimeBlock = {
      ...timeBlock,
      id: Date.now().toString(),
    };
    setTimeBlocks([...timeBlocks, newTimeBlock]);
    
    // Schedule habit reminder
    notificationService.scheduleHabitReminder(newTimeBlock);
  };

  const updateTimeBlock = (id: string, updatedBlock: Partial<TimeBlock>) => {
    setTimeBlocks(timeBlocks.map(block => {
      if (block.id === id) {
        const blockAfterUpdate = { ...block, ...updatedBlock };
        
        // If start time has changed, reschedule reminders
        if (updatedBlock.start && 
           new Date(block.start).getTime() !== new Date(updatedBlock.start).getTime()) {
          notificationService.scheduleHabitReminder(blockAfterUpdate);
        }
        
        return blockAfterUpdate;
      }
      return block;
    }));
  };

  const deleteTimeBlock = (id: string) => {
    setTimeBlocks(timeBlocks.filter(block => block.id !== id));
  };

  // Calculated stats
  const totalFocusTime = sessions.reduce((total, session) => total + session.duration, 0) / 60; // in minutes
  
  const tasksByCategory = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const completionRate = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;

  const contextValue: AppContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    
    currentSession,
    sessions,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    endFocusSession,
    
    achievements,
    points,
    addAchievement,
    
    timeBlocks,
    addTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
    
    totalFocusTime,
    tasksByCategory,
    completionRate,
    
    streak,
    resetStreak: () => {
      setStreak(0);
      localStorage.setItem('streak', '0');
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the app context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 