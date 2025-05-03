import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormGroup,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Grid as MuiGrid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Timer as TimerIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  VolumeUp as VolumeIcon,
  ColorLens as ColorLensIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeContext, ThemeOption } from '../../context/ThemeContext';
import notificationService from '../../utils/notificationService';

// Motion Components
const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Settings interface
interface AppSettings {
  // Appearance
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  highContrast: boolean;
  
  // Timer
  focusLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  
  // Notifications
  timerSounds: boolean;
  enableNotifications: boolean;
  motivationalNotifications: boolean;
  taskReminders: boolean;
  habitReminders: boolean;
  inactivityReminders: boolean;
}

export default function Settings() {
  const theme = useTheme();
  const { currentTheme, setTheme, themeOptions } = useThemeContext();
  
  // Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  
  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  // Default settings
  const [settings, setSettings] = useState<AppSettings>({
    // Appearance
    theme: 'light',
    fontSize: 'medium',
    reduceMotion: false,
    highContrast: false,
    
    // Timer
    focusLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: true,
    autoStartFocus: false,
    
    // Notifications
    timerSounds: true,
    enableNotifications: true,
    motivationalNotifications: true,
    taskReminders: true,
    habitReminders: true,
    inactivityReminders: true
  });
  
  // Handle setting changes
  const handleChange = (section: keyof AppSettings, value: any) => {
    setSettings({
      ...settings,
      [section]: value
    });
  };
  
  // Handle theme change
  const handleThemeChange = (_event: React.MouseEvent<HTMLElement>, newTheme: 'light' | 'dark' | null) => {
    if (newTheme !== null) {
      handleChange('theme', newTheme);
    }
  };
  
  // Handle notification permission request
  const handleRequestPermission = async () => {
    const permissionGranted = await notificationService.requestPermission();
    setNotificationPermission(Notification.permission);
    
    if (permissionGranted) {
      setShowPermissionAlert(true);
      // Initialize notifications
      notificationService.initializeNotifications();
    }
  };

  // Specify Mui Grid component types for TypeScript
  const Grid = MuiGrid as typeof MuiGrid;
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Customize your productivity experience
        </Typography>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        {/* Cosmic Themes */}
        <Box sx={{ gridColumn: 'span 12' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <ColorLensIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Cosmic Themes</Typography>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Choose from our collection of intergalactic trippy color schemes to completely transform your app experience.
            </Typography>
            
            <Grid container spacing={2}>
              {themeOptions.map((option: ThemeOption) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={option.name}>
                  <MotionCard 
                    whileHover={{ 
                      y: -5, 
                      boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
                      background: `linear-gradient(135deg, ${option.gradientStart}22, ${option.gradientEnd}22)`
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    onClick={() => setTheme(option.name)}
                    elevation={currentTheme.name === option.name ? 6 : 1}
                    sx={{ 
                      borderRadius: 3,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: currentTheme.name === option.name ? 
                        `2px solid ${option.primaryColor}` : 
                        '2px solid transparent',
                      transform: currentTheme.name === option.name ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <CardActionArea>
                      <Box 
                        sx={{ 
                          height: 120, 
                          background: `linear-gradient(135deg, ${option.gradientStart}, ${option.gradientEnd})`,
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {option.displayName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {option.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </MotionCard>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
        
        {/* Appearance Settings */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PaletteIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Appearance</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Theme
              </Typography>
              <ToggleButtonGroup
                value={settings.theme}
                exclusive
                onChange={handleThemeChange}
                aria-label="theme"
                sx={{ 
                  display: 'flex',
                  '& .MuiToggleButton-root': {
                    flex: 1,
                    py: 1.5
                  }
                }}
              >
                <ToggleButton 
                  value="light" 
                  aria-label="light mode"
                  sx={{ 
                    borderRadius: '4px 0 0 4px',
                    borderColor: theme.palette.divider
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LightModeIcon sx={{ mr: 1 }} />
                    <Typography>Light</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton 
                  value="dark" 
                  aria-label="dark mode"
                  sx={{ 
                    borderRadius: '0 4px 4px 0',
                    borderColor: theme.palette.divider
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DarkModeIcon sx={{ mr: 1 }} />
                    <Typography>Dark</Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Font Size
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={settings.fontSize}
                  onChange={(e) => handleChange('fontSize', e.target.value)}
                >
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.reduceMotion}
                    onChange={(e) => handleChange('reduceMotion', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Reduce motion</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Minimizes animations
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.highContrast}
                    onChange={(e) => handleChange('highContrast', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>High contrast</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Improves readability
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Paper>
        </Box>
        
        {/* Notifications Settings */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Notifications</Typography>
            </Box>
            
            {notificationPermission !== 'granted' && (
              <MotionBox 
                sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255, 152, 0, 0.1)',
                  border: '1px solid rgba(255, 152, 0, 0.3)'
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Enable notifications to get timely reminders and motivation boosts.
                </Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  color="warning"
                  onClick={handleRequestPermission}
                >
                  Enable Notifications
                </Button>
              </MotionBox>
            )}
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.enableNotifications}
                    onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                    disabled={notificationPermission !== 'granted'}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Enable all notifications</Typography>
                  </Box>
                }
              />
              
              <Divider sx={{ my: 2 }} />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.motivationalNotifications}
                    onChange={(e) => handleChange('motivationalNotifications', e.target.checked)}
                    disabled={!settings.enableNotifications || notificationPermission !== 'granted'}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Motivational messages</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Regular ADHD-friendly tips
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.taskReminders}
                    onChange={(e) => handleChange('taskReminders', e.target.checked)}
                    disabled={!settings.enableNotifications || notificationPermission !== 'granted'}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Task reminders</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Notifications for upcoming tasks
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.habitReminders}
                    onChange={(e) => handleChange('habitReminders', e.target.checked)}
                    disabled={!settings.enableNotifications || notificationPermission !== 'granted'}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Habit reminders</Typography>
                    <Typography variant="body2" color="text.secondary">
                      1h, 30m, 15m, 5m before habits
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.inactivityReminders}
                    onChange={(e) => handleChange('inactivityReminders', e.target.checked)}
                    disabled={!settings.enableNotifications || notificationPermission !== 'granted'}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Inactivity reminders</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Gentle nudges when you're away
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Paper>
        </Box>
        
        {/* Timer Settings */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimerIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Timer</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Focus Session Length (minutes)
              </Typography>
              <TextField
                type="number"
                value={settings.focusLength}
                onChange={(e) => handleChange('focusLength', parseInt(e.target.value) || 25)}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 120 } }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Short Break Length (minutes)
              </Typography>
              <TextField
                type="number"
                value={settings.shortBreakLength}
                onChange={(e) => handleChange('shortBreakLength', parseInt(e.target.value) || 5)}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 30 } }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Long Break Length (minutes)
              </Typography>
              <TextField
                type="number"
                value={settings.longBreakLength}
                onChange={(e) => handleChange('longBreakLength', parseInt(e.target.value) || 15)}
                fullWidth
                InputProps={{ inputProps: { min: 5, max: 60 } }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Focus Sessions Until Long Break
              </Typography>
              <TextField
                type="number"
                value={settings.sessionsUntilLongBreak}
                onChange={(e) => handleChange('sessionsUntilLongBreak', parseInt(e.target.value) || 4)}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 10 } }}
              />
            </Box>
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.autoStartBreaks}
                    onChange={(e) => handleChange('autoStartBreaks', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Auto-start breaks</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatically start breaks
                    </Typography>
                  </Box>
                }
              />
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.autoStartFocus}
                    onChange={(e) => handleChange('autoStartFocus', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>Auto-start focus sessions</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Automatically start next focus session
                    </Typography>
                  </Box>
                }
              />
            </FormGroup>
          </Paper>
        </Box>
        
        {/* About Section */}
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InfoIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">About</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                FocusFlow
              </Typography>
              <Typography variant="body2" color="text.secondary">
                version 0.2.0
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              An ADHD-friendly productivity tracker designed to help you manage tasks, 
              build habits, and improve focus with cosmic themes and supportive notifications.
            </Typography>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Feature Suggestions?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Have an idea for how to make FocusFlow better for ADHD brains? Let us know!
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
      
      {/* Notification permission alert */}
      <Snackbar 
        open={showPermissionAlert} 
        autoHideDuration={6000}
        onClose={() => setShowPermissionAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowPermissionAlert(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          Notifications enabled successfully! You'll now receive reminders and motivational messages.
        </Alert>
      </Snackbar>
    </Box>
  );
} 