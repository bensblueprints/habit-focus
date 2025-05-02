import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isAfter, isBefore, isSameDay } from 'date-fns';

// Badge types and levels
export type BadgeCategory = 
  | 'habit_streak' 
  | 'completion_rate' 
  | 'focus_master' 
  | 'early_bird' 
  | 'night_owl'
  | 'consistency'
  | 'perfect_week'
  | 'app_usage'
  | 'first_time';

export type BadgeLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

// Badge interface
export interface Badge {
  id: string;
  category: BadgeCategory;
  title: string;
  description: string;
  level: BadgeLevel;
  icon: string;
  awardedAt: Date;
  viewed: boolean;
  thresholdValue?: number; // Value that triggered the badge (e.g., streak of 7 days)
}

// Required amount for each badge level
export const badgeLevelRequirements = {
  habit_streak: {
    bronze: 3,
    silver: 7,
    gold: 30,
    platinum: 100
  },
  completion_rate: {
    bronze: 50, // % completion
    silver: 70,
    gold: 85,
    platinum: 95
  },
  focus_master: {
    bronze: 5, // sessions
    silver: 25,
    gold: 50,
    platinum: 100
  },
  consistency: {
    bronze: 3, // days in a row using the app
    silver: 7,
    gold: 30,
    platinum: 365
  },
  perfect_week: {
    bronze: 1, // weeks
    silver: 4,
    gold: 12,
    platinum: 52
  }
};

// Interface for the badge store state
interface BadgeState {
  badges: Badge[];
  lastUsedDate: Date | null;
  consecutiveDaysStreak: number;
  highestConsecutiveDaysStreak: number;
  
  // Badge operations
  awardBadge: (category: BadgeCategory, level: BadgeLevel, thresholdValue?: number) => void;
  hasBadge: (category: BadgeCategory, level: BadgeLevel) => boolean;
  getUnviewedBadges: () => Badge[];
  markBadgeAsViewed: (id: string) => void;
  markAllBadgesAsViewed: () => void;
  getBadgesByCategory: (category: BadgeCategory) => Badge[];
  
  // Streak operations
  incrementConsecutiveDaysStreak: () => void;
  resetConsecutiveDaysStreak: () => void;
  
  // Check for badges to award
  checkForBadges: () => void;
  
  // App usage tracking
  trackAppUsage: () => void;
}

const useBadgeStore = create<BadgeState>()(
  persist(
    (set, get) => ({
      badges: [],
      lastUsedDate: null,
      consecutiveDaysStreak: 0,
      highestConsecutiveDaysStreak: 0,
      
      awardBadge: (category, level, thresholdValue) => set((state) => {
        // Check if badge already exists
        const existingBadge = state.badges.find(
          badge => badge.category === category && badge.level === level
        );
        
        if (existingBadge) return state;
        
        // Generate badge details based on category and level
        const badgeDetails = getBadgeDetails(category, level, thresholdValue);
        
        return {
          badges: [...state.badges, {
            id: uuidv4(),
            category,
            level,
            thresholdValue,
            awardedAt: new Date(),
            viewed: false,
            ...badgeDetails
          }]
        };
      }),
      
      hasBadge: (category, level) => {
        const { badges } = get();
        return badges.some(badge => badge.category === category && badge.level === level);
      },
      
      getUnviewedBadges: () => {
        const { badges } = get();
        return badges.filter(badge => !badge.viewed);
      },
      
      markBadgeAsViewed: (id) => set((state) => ({
        badges: state.badges.map(badge => 
          badge.id === id ? { ...badge, viewed: true } : badge
        )
      })),
      
      markAllBadgesAsViewed: () => set((state) => ({
        badges: state.badges.map(badge => ({ ...badge, viewed: true }))
      })),
      
      getBadgesByCategory: (category) => {
        const { badges } = get();
        return badges.filter(badge => badge.category === category);
      },
      
      incrementConsecutiveDaysStreak: () => set((state) => {
        const newStreak = state.consecutiveDaysStreak + 1;
        const newHighestStreak = Math.max(newStreak, state.highestConsecutiveDaysStreak);
        
        return {
          consecutiveDaysStreak: newStreak,
          highestConsecutiveDaysStreak: newHighestStreak
        };
      }),
      
      resetConsecutiveDaysStreak: () => set({
        consecutiveDaysStreak: 0
      }),
      
      checkForBadges: () => {
        const { consecutiveDaysStreak, highestConsecutiveDaysStreak, awardBadge, hasBadge } = get();
        
        // Check for consistency badges
        const consistencyLevels = Object.entries(badgeLevelRequirements.consistency);
        for (const [level, threshold] of consistencyLevels) {
          if (consecutiveDaysStreak >= threshold && !hasBadge('consistency', level as BadgeLevel)) {
            awardBadge('consistency', level as BadgeLevel, consecutiveDaysStreak);
          }
        }
        
        // Additional badge checks would go here
      },
      
      trackAppUsage: () => set((state) => {
        const today = new Date();
        const yesterday = addDays(today, -1);
        
        // If first time using the app
        if (!state.lastUsedDate) {
          // Award first-time badge
          const updatedState = {
            lastUsedDate: today,
            consecutiveDaysStreak: 1,
            highestConsecutiveDaysStreak: 1
          };
          
          // We need to use set directly to ensure the badge is awarded
          setTimeout(() => {
            get().awardBadge('first_time', 'bronze');
          }, 0);
          
          return updatedState;
        }
        
        // Check if the user already logged in today
        if (isSameDay(state.lastUsedDate, today)) {
          return { lastUsedDate: today };
        }
        
        // Check if the user logged in yesterday to maintain streak
        if (isSameDay(state.lastUsedDate, yesterday)) {
          const newStreak = state.consecutiveDaysStreak + 1;
          const newHighestStreak = Math.max(newStreak, state.highestConsecutiveDaysStreak);
          
          setTimeout(() => {
            get().checkForBadges();
          }, 0);
          
          return {
            lastUsedDate: today,
            consecutiveDaysStreak: newStreak,
            highestConsecutiveDaysStreak: newHighestStreak
          };
        }
        
        // If more than a day has passed, reset the streak
        return {
          lastUsedDate: today,
          consecutiveDaysStreak: 1
        };
      })
    }),
    {
      name: 'badge-storage'
    }
  )
);

// Helper function to get badge details based on category and level
function getBadgeDetails(category: BadgeCategory, level: BadgeLevel, thresholdValue?: number) {
  const details = {
    title: '',
    description: '',
    icon: 'award' // Default icon
  };
  
  switch (category) {
    case 'habit_streak':
      details.title = `${capitalizeFirstLetter(level)} Streak Master`;
      details.description = `Maintained a habit streak of ${thresholdValue} days`;
      details.icon = 'trending-up';
      break;
      
    case 'completion_rate':
      details.title = `${capitalizeFirstLetter(level)} Completer`;
      details.description = `Achieved a ${thresholdValue}% task completion rate`;
      details.icon = 'check-circle';
      break;
      
    case 'focus_master':
      details.title = `${capitalizeFirstLetter(level)} Focus Master`;
      details.description = `Completed ${thresholdValue} focus sessions`;
      details.icon = 'zap';
      break;
      
    case 'early_bird':
      details.title = 'Early Bird';
      details.description = 'Completed tasks before 9 AM';
      details.icon = 'sunrise';
      break;
      
    case 'night_owl':
      details.title = 'Night Owl';
      details.description = 'Productive after 10 PM';
      details.icon = 'moon';
      break;
      
    case 'consistency':
      details.title = `${capitalizeFirstLetter(level)} Consistency`;
      details.description = `Used the app for ${thresholdValue} consecutive days`;
      details.icon = 'calendar';
      break;
      
    case 'perfect_week':
      details.title = `${capitalizeFirstLetter(level)} Week Perfectionist`;
      details.description = 'Completed all planned tasks for an entire week';
      details.icon = 'award';
      break;
      
    case 'app_usage':
      details.title = `${capitalizeFirstLetter(level)} User`;
      details.description = 'Regular app usage milestone reached';
      details.icon = 'user-check';
      break;
      
    case 'first_time':
      details.title = 'Welcome!';
      details.description = 'Started your productivity journey';
      details.icon = 'smile';
      break;
  }
  
  return details;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default useBadgeStore; 