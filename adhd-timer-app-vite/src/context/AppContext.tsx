import { createContext, useContext, useState, ReactNode } from 'react';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [points, setPoints] = useState(0);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

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
  };

  const updateTask = (id: string, updatedTask: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: true } : task
    ));
    
    // Award points for completing a task
    setPoints(prevPoints => prevPoints + 10);
    
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
      
      // Award points for focus session
      const focusMinutes = Math.floor(duration / 60);
      const pointsEarned = focusMinutes * 2; // 2 points per minute
      setPoints(prevPoints => prevPoints + pointsEarned);
      
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
  };

  const updateTimeBlock = (id: string, updatedBlock: Partial<TimeBlock>) => {
    setTimeBlocks(timeBlocks.map(block => 
      block.id === id ? { ...block, ...updatedBlock } : block
    ));
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