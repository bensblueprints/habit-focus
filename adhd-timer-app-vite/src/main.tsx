import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import './index.css';

import { AppProvider } from './context/AppContext';
import { ThemeProvider, useThemeContext } from './context/ThemeContext';
import notificationService from './utils/notificationService';

import AppLayout from './components/Layout/AppLayout';
import Dashboard from './components/Dashboard/Dashboard';
import TaskList from './components/Tasks/TaskList';
import FocusTimer from './components/FocusTimer/FocusTimer';
import HabitTracker from './components/HabitTracker/HabitTracker';
import Settings from './components/Settings/Settings';

// Wrapper component to use the theme context
const ThemedApp = () => {
  const { currentTheme } = useThemeContext();
  
  // Initialize notifications when app loads
  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      // Only initialize if permission is already granted
      if (Notification.permission === 'granted') {
        notificationService.initializeNotifications();
      }
    }
  }, []);
  
  return (
    <MuiThemeProvider theme={currentTheme.theme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<TaskList />} />
              <Route path="focus" element={<FocusTimer />} />
              <Route path="habits" element={<HabitTracker />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </MuiThemeProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemedApp />
    </ThemeProvider>
  </React.StrictMode>,
);
