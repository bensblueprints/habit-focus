import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  Clock, 
  CheckSquare, 
  Sunrise, 
  Moon, 
  Calendar, 
  UserCheck, 
  Smile,
  Lock,
  Filter
} from 'lucide-react';
import useBadgeStore, { Badge, BadgeCategory, BadgeLevel, badgeLevelRequirements } from '../hooks/useBadgeStore';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// Badge level colors
const levelColors = {
  bronze: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30',
  silver: 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600',
  gold: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30',
  platinum: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/30'
};

// Badge level tag styles
const levelTagColors = {
  bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  silver: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  platinum: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
};

const Badges: React.FC = () => {
  const { user } = useAuth();
  const badges = useBadgeStore(state => state.badges);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedLevel, setSelectedLevel] = useState<BadgeLevel | 'all'>('all');
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Filter badges based on selected category and level
  const filteredBadges = badges.filter(badge => 
    (selectedCategory === 'all' || badge.category === selectedCategory) &&
    (selectedLevel === 'all' || badge.level === selectedLevel)
  );
  
  // Group badges by category
  const badgesByCategory = badges.reduce<Record<BadgeCategory, Badge[]>>((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<BadgeCategory, Badge[]>);
  
  // Get icon based on category
  const getCategoryIcon = (category: BadgeCategory) => {
    switch (category) {
      case 'habit_streak':
        return <TrendingUp className="h-5 w-5" />;
      case 'completion_rate':
        return <CheckSquare className="h-5 w-5" />;
      case 'focus_master':
        return <Clock className="h-5 w-5" />;
      case 'early_bird':
        return <Sunrise className="h-5 w-5" />;
      case 'night_owl':
        return <Moon className="h-5 w-5" />;
      case 'consistency':
        return <Calendar className="h-5 w-5" />;
      case 'perfect_week':
        return <Award className="h-5 w-5" />;
      case 'app_usage':
        return <UserCheck className="h-5 w-5" />;
      case 'first_time':
        return <Smile className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };
  
  // Get category name for display
  const getCategoryName = (category: BadgeCategory) => {
    switch (category) {
      case 'habit_streak':
        return 'Habit Streaks';
      case 'completion_rate':
        return 'Task Completion';
      case 'focus_master':
        return 'Focus Sessions';
      case 'early_bird':
        return 'Early Bird';
      case 'night_owl':
        return 'Night Owl';
      case 'consistency':
        return 'Consistency';
      case 'perfect_week':
        return 'Perfect Week';
      case 'app_usage':
        return 'App Usage';
      case 'first_time':
        return 'First Steps';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="container mx-auto p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Achievements</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Badges and rewards earned through your productivity journey
        </p>
      </div>
      
      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter Badges:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as BadgeCategory | 'all')}
              className="rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="habit_streak">Habit Streaks</option>
              <option value="completion_rate">Task Completion</option>
              <option value="focus_master">Focus Sessions</option>
              <option value="consistency">Consistency</option>
              <option value="perfect_week">Perfect Week</option>
              <option value="app_usage">App Usage</option>
              <option value="first_time">First Steps</option>
            </select>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as BadgeLevel | 'all')}
              className="rounded-md border-gray-300 py-1.5 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Levels</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Badge statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary-100 p-3 dark:bg-primary-900/20">
              <Award className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Badges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{badges.length}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platinum Badges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {badges.filter(b => b.level === 'platinum').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/20">
              <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Streak Badges</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {badges.filter(b => b.category === 'habit_streak').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {useBadgeStore.getState().consecutiveDaysStreak}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Badges grid view */}
      {selectedCategory === 'all' && selectedLevel === 'all' ? (
        // By category
        Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
          <div key={category} className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              {getCategoryIcon(category as BadgeCategory)}
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {getCategoryName(category as BadgeCategory)}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* Earned badges */}
              {categoryBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex flex-col rounded-lg border p-4 shadow-sm ${levelColors[badge.level]}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelTagColors[badge.level]}`}>
                      {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(badge.awardedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="mb-2 rounded-full bg-white/80 p-3 dark:bg-gray-800/80">
                      {getCategoryIcon(badge.category)}
                    </div>
                    <h3 className="mb-1 text-lg font-semibold">{badge.title}</h3>
                    <p className="text-sm">{badge.description}</p>
                  </div>
                </div>
              ))}
              
              {/* Locked badges - Only display the next level */}
              {category === 'habit_streak' && (
                <>
                  {!categoryBadges.some(b => b.level === 'bronze') && (
                    <LockedBadge 
                      category="habit_streak" 
                      level="bronze" 
                      threshold={badgeLevelRequirements.habit_streak.bronze} 
                    />
                  )}
                  {categoryBadges.some(b => b.level === 'bronze') && 
                  !categoryBadges.some(b => b.level === 'silver') && (
                    <LockedBadge 
                      category="habit_streak" 
                      level="silver" 
                      threshold={badgeLevelRequirements.habit_streak.silver} 
                    />
                  )}
                  {categoryBadges.some(b => b.level === 'silver') && 
                  !categoryBadges.some(b => b.level === 'gold') && (
                    <LockedBadge 
                      category="habit_streak" 
                      level="gold" 
                      threshold={badgeLevelRequirements.habit_streak.gold} 
                    />
                  )}
                  {categoryBadges.some(b => b.level === 'gold') && 
                  !categoryBadges.some(b => b.level === 'platinum') && (
                    <LockedBadge 
                      category="habit_streak" 
                      level="platinum" 
                      threshold={badgeLevelRequirements.habit_streak.platinum} 
                    />
                  )}
                </>
              )}
            </div>
          </div>
        ))
      ) : (
        // Filtered view
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredBadges.length === 0 ? (
            <div className="col-span-full rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
              <Lock className="mx-auto h-10 w-10 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No badges found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                You haven't earned any badges in this category or level yet.
              </p>
            </div>
          ) : (
            filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col rounded-lg border p-4 shadow-sm ${levelColors[badge.level]}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${levelTagColors[badge.level]}`}>
                    {badge.level.charAt(0).toUpperCase() + badge.level.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(badge.awardedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="mb-2 rounded-full bg-white/80 p-3 dark:bg-gray-800/80">
                    {getCategoryIcon(badge.category)}
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">{badge.title}</h3>
                  <p className="text-sm">{badge.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Component for locked badges
const LockedBadge: React.FC<{
  category: BadgeCategory;
  level: BadgeLevel;
  threshold: number;
}> = ({ category, level, threshold }) => {
  const getCategoryDescription = (category: BadgeCategory, level: BadgeLevel, threshold: number) => {
    switch (category) {
      case 'habit_streak':
        return `Keep a habit streak for ${threshold} days`;
      case 'consistency':
        return `Use the app for ${threshold} consecutive days`;
      case 'perfect_week':
        return `Complete all habits for ${threshold} weeks`;
      default:
        return 'Keep going to unlock this badge';
    }
  };
  
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Locked</span>
      </div>
      
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-2 rounded-full bg-gray-200 p-3 dark:bg-gray-700/80">
          <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-gray-500 dark:text-gray-400">
          {level.charAt(0).toUpperCase() + level.slice(1)} Badge
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {getCategoryDescription(category, level, threshold)}
        </p>
      </div>
    </div>
  );
};

export default Badges; 