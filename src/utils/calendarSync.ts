import { supabase } from './supabase';
import { Habit, Task } from '../types';

// Calendar sync providers
export type CalendarProvider = 'google' | 'outlook' | 'apple';

// Google OAuth credentials
const GOOGLE_CLIENT_ID = '99975345020-i9tjsvnoq26947ltmpjfjomc9lr6h8hl.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

// Calendar sync settings
export interface CalendarSyncSettings {
  provider: CalendarProvider;
  enabled: boolean;
  syncHabits: boolean;
  syncTasks: boolean;
  lastSync: string | null;
  calendarId?: string;
}

// Function to get auth URL for the specified provider
export const getCalendarAuthUrl = (provider: CalendarProvider, userId: string): string => {
  const redirectUrl = `${window.location.origin}/calendar-callback`;
  
  switch (provider) {
    case 'google':
      // Google Calendar OAuth2 URL with the provided client ID
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&state=${userId}`;
    
    case 'outlook':
      // Microsoft OAuth URL (you would need to register your app with Microsoft)
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_MICROSOFT_CLIENT_ID&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=Calendars.ReadWrite&state=${userId}`;
    
    case 'apple':
      // Apple Calendar integration would likely use CalDAV
      // This is a placeholder, as Apple Calendar integration is more complex
      return '#';
    
    default:
      return '#';
  }
};

// Save calendar sync settings to Supabase
export const saveCalendarSettings = async (
  userId: string, 
  settings: CalendarSyncSettings
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('calendar_settings')
      .upsert({ 
        user_id: userId,
        provider: settings.provider,
        enabled: settings.enabled,
        sync_habits: settings.syncHabits,
        sync_tasks: settings.syncTasks,
        last_sync: settings.lastSync,
        calendar_id: settings.calendarId
      }, { onConflict: 'user_id' });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error saving calendar settings:', error);
    throw error;
  }
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (
  code: string,
  provider: CalendarProvider
): Promise<any> => {
  try {
    const redirectUrl = `${window.location.origin}/calendar-callback`;
    
    if (provider === 'google') {
      // For Google Calendar
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUrl,
          grant_type: 'authorization_code',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }
      
      return await response.json();
    }
    
    // Add support for other providers as needed
    throw new Error(`Token exchange not implemented for provider: ${provider}`);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
};

// Get calendar sync settings from Supabase
export const getCalendarSettings = async (
  userId: string
): Promise<CalendarSyncSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('calendar_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    return {
      provider: data.provider,
      enabled: data.enabled,
      syncHabits: data.sync_habits,
      syncTasks: data.sync_tasks,
      lastSync: data.last_sync,
      calendarId: data.calendar_id
    };
  } catch (error) {
    console.error('Error getting calendar settings:', error);
    throw error;
  }
};

// Generic function to sync items to calendar
// This is a placeholder - actual implementation would use the appropriate API for each provider
export const syncToCalendar = async (
  userId: string,
  habits: Habit[],
  tasks: Task[],
  settings: CalendarSyncSettings
): Promise<boolean> => {
  try {
    // This would be implemented with the actual calendar provider API
    // For now, we'll just update the last_sync time
    
    const { error } = await supabase
      .from('calendar_settings')
      .update({ 
        last_sync: new Date().toISOString() 
      })
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error syncing to calendar:', error);
    return false;
  }
};

// Handle OAuth callback (would be called by a callback component)
export const handleCalendarCallback = async (
  code: string, 
  state: string, 
  provider: CalendarProvider
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the user ID from the state parameter
    const userId = state;
    
    // Exchange the authorization code for tokens
    const tokens = await exchangeCodeForTokens(code, provider);
    
    // Store token information securely
    // In a production app, you would store refresh tokens securely
    // and use them to get new access tokens when needed
    
    // Save calendar settings
    await saveCalendarSettings(userId, {
      provider,
      enabled: true,
      syncHabits: true,
      syncTasks: true,
      lastSync: null,
      calendarId: 'primary' // Default calendar ID
    });
    
    return {
      success: true,
      message: 'Calendar connected successfully!'
    };
  } catch (error) {
    console.error('Error handling calendar callback:', error);
    return {
      success: false,
      message: 'Failed to connect calendar. Please try again.'
    };
  }
}; 