import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import useHabitStore from '../hooks/useHabitStore';
import useTaskStore from '../hooks/useTaskStore';
import { Habit, Task } from '../types';
import { CheckSquare, Cloud, Edit3, Loader, RefreshCw, Save, Settings, User, Calendar, Link as LinkIcon } from 'lucide-react';
import { CalendarProvider, CalendarSyncSettings, getCalendarAuthUrl, getCalendarSettings, saveCalendarSettings, syncToCalendar } from '../utils/calendarSync';

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  last_sync: string | null;
}

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [calendarSettings, setCalendarSettings] = useState<CalendarSyncSettings | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  const habits = useHabitStore(state => state.habits);
  const tasks = useTaskStore(state => state.tasks);
  
  // Fetch user profile
  useEffect(() => {
    if (!user) return;
    
    const fetchProfile = async () => {
      try {
        // Check if user profile exists
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setProfile(data);
        } else {
          // Create profile if it doesn't exist
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, email: user.email }])
            .select()
            .single();
          
          if (createError) throw createError;
          setProfile(newProfile);
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  // Fetch calendar settings
  useEffect(() => {
    if (!user) return;
    
    const fetchCalendarSettings = async () => {
      try {
        const settings = await getCalendarSettings(user.id);
        setCalendarSettings(settings);
      } catch (err: any) {
        console.error('Error fetching calendar settings:', err);
      }
    };
    
    fetchCalendarSettings();
  }, [user]);
  
  // Sync habits with Supabase
  const syncHabits = async () => {
    if (!user) return;
    
    try {
      setSyncStatus('syncing');
      
      // First, fetch existing habits from Supabase
      const { data: existingHabits, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);
      
      if (fetchError) throw fetchError;
      
      // Prepare habits for upsert (update or insert)
      const habitsToUpsert = habits.map(habit => ({
        id: habit.id,
        user_id: user.id,
        title: habit.title,
        description: habit.description || null,
        frequency: habit.frequency,
        streak: habit.streak,
        color: habit.color,
        category: habit.category || null,
        difficulty: habit.difficulty,
        completed_dates: JSON.stringify(habit.completedDates),
        created_at: new Date(habit.createdAt).toISOString()
      }));
      
      // Upsert habits
      const { error: upsertError } = await supabase
        .from('habits')
        .upsert(habitsToUpsert, { onConflict: 'id' });
      
      if (upsertError) throw upsertError;
      
      // If calendar sync is enabled, sync to calendar as well
      if (calendarSettings?.enabled) {
        await syncToCalendar(user.id, habits, tasks, calendarSettings);
      }
      
      // Update last sync timestamp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // Refresh profile to get updated last_sync
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(updatedProfile);
      setSyncStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
      
    } catch (err: any) {
      console.error('Error syncing habits:', err);
      setError(err.message);
      setSyncStatus('error');
    }
  };
  
  // Connect to a calendar service
  const connectCalendar = (provider: CalendarProvider) => {
    if (!user) return;
    
    const authUrl = getCalendarAuthUrl(provider, user.id);
    window.location.href = authUrl;
  };
  
  // Toggle calendar sync settings
  const toggleCalendarSync = async (enabled: boolean) => {
    if (!user || !calendarSettings) return;
    
    try {
      const updatedSettings = {
        ...calendarSettings,
        enabled
      };
      
      await saveCalendarSettings(user.id, updatedSettings);
      setCalendarSettings(updatedSettings);
    } catch (err: any) {
      console.error('Error updating calendar settings:', err);
      setError(err.message);
    }
  };
  
  // Toggle which items to sync
  const toggleSyncItems = async (type: 'habits' | 'tasks') => {
    if (!user || !calendarSettings) return;
    
    try {
      const updatedSettings = {
        ...calendarSettings,
        syncHabits: type === 'habits' ? !calendarSettings.syncHabits : calendarSettings.syncHabits,
        syncTasks: type === 'tasks' ? !calendarSettings.syncTasks : calendarSettings.syncTasks
      };
      
      await saveCalendarSettings(user.id, updatedSettings);
      setCalendarSettings(updatedSettings);
    } catch (err: any) {
      console.error('Error updating calendar settings:', err);
      setError(err.message);
    }
  };
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="container mx-auto max-w-5xl p-4">
      <div className="mb-8 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.email}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {profile ? new Date(profile.created_at).toLocaleDateString() : 'Loading...'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={syncHabits}
              disabled={syncStatus === 'syncing'}
              className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-800"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Syncing...
                </>
              ) : syncStatus === 'success' ? (
                <>
                  <CheckSquare className="h-5 w-5" />
                  Synced!
                </>
              ) : (
                <>
                  <Cloud className="h-5 w-5" />
                  Sync Data
                </>
              )}
            </button>
            
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/10 dark:text-red-400">
            {error}
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sync Status</h2>
              <RefreshCw className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Last sync</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.last_sync ? new Date(profile.last_sync).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Habits synced</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{habits.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Tasks synced</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{tasks.length}</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Habits Overview</h2>
              <Edit3 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total habits</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{habits.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Active streaks</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {habits.filter(h => h.streak > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Highest streak</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Calendar Sync</h2>
              <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            
            {calendarSettings ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    calendarSettings.enabled 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {calendarSettings.enabled ? 'Connected' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Provider</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {calendarSettings.provider}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sync habits</span>
                  <button
                    onClick={() => toggleSyncItems('habits')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      calendarSettings.syncHabits ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        calendarSettings.syncHabits ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sync tasks</span>
                  <button
                    onClick={() => toggleSyncItems('tasks')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      calendarSettings.syncTasks ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        calendarSettings.syncTasks ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Last calendar sync</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {calendarSettings.lastSync 
                      ? new Date(calendarSettings.lastSync).toLocaleDateString() 
                      : 'Never'}
                  </span>
                </div>
                
                <button
                  onClick={() => toggleCalendarSync(!calendarSettings.enabled)}
                  className={`mt-2 w-full rounded-md px-4 py-2 text-sm font-medium ${
                    calendarSettings.enabled
                      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      : 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800'
                  }`}
                >
                  {calendarSettings.enabled ? 'Disable Sync' : 'Enable Sync'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Connect your calendar to sync your habits and tasks.
                </p>
                
                <button
                  onClick={() => connectCalendar('google')}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <LinkIcon className="h-4 w-4" />
                  Google Calendar
                </button>
                
                <button
                  onClick={() => connectCalendar('outlook')}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <LinkIcon className="h-4 w-4" />
                  Outlook Calendar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Habits</h2>
        <button className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-700 dark:hover:bg-primary-800">
          Add New Habit
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {habits.map(habit => (
          <div 
            key={habit.id} 
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 flex items-center">
              <div 
                className="mr-3 h-3 w-3 rounded-full" 
                style={{ backgroundColor: habit.color }}
              ></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{habit.title}</h3>
            </div>
            
            {habit.description && (
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{habit.description}</p>
            )}
            
            <div className="mt-2 flex flex-wrap gap-2">
              {habit.category && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                  {habit.category}
                </span>
              )}
              <span className="inline-flex items-center rounded-md bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
                {habit.streak} day streak
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard; 