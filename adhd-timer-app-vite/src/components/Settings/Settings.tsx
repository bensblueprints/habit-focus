import { useState } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Timer as TimerIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  VolumeUp as VolumeIcon
} from '@mui/icons-material';

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
}

export default function Settings() {
  const theme = useTheme();
  
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
    timerSounds: true
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
            
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch 
                    checked={settings.timerSounds}
                    onChange={(e) => handleChange('timerSounds', e.target.checked)}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography>Timer sounds</Typography>
                    </Box>
                    <Button 
                      size="small" 
                      startIcon={<VolumeIcon />}
                      variant="text"
                      disabled={!settings.timerSounds}
                    >
                      Play sound when timer ends
                    </Button>
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
                version 0.1.0
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 3 }}>
              An ADHD-friendly productivity tracker designed to help you manage tasks, 
              build habits, and improve focus.
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
    </Box>
  );
} 