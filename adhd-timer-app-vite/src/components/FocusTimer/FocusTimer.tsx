import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField,
  Stack,
  Chip,
  Divider,
  Tabs,
  Tab,
  IconButton,
  useTheme,
  Zoom,
  Grow
} from '@mui/material';
import { 
  PlayArrow as PlayIcon, 
  Pause as PauseIcon, 
  Refresh as RefreshIcon,
  SkipNext as SkipNextIcon,
  Close as CloseIcon,
  EmojiObjects as LightbulbIcon,
  LocalFireDepartment as FireIcon,
  Vibration as VibrationIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';

// Timer modes
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const MotionIconButton = motion(IconButton);
const MotionBox = motion(Box);

export default function FocusTimer() {
  const theme = useTheme();
  const { 
    tasks, 
    startFocusSession, 
    pauseFocusSession, 
    resumeFocusSession, 
    endFocusSession, 
    currentSession 
  } = useAppContext();
  
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  
  // Timer state
  const [timerMode, setTimerMode] = useState<TimerMode>('focus');
  const [time, setTime] = useState(25 * 60); // Default 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [focusTaskInput, setFocusTaskInput] = useState('');
  
  // Pause dialog
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [pauseReason, setPauseReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  
  // Timer duration settings
  const [focusDuration, setFocusDuration] = useState(25 * 60); // 25 minutes
  const [shortBreakDuration] = useState(5 * 60); // 5 minutes
  const [longBreakDuration] = useState(15 * 60); // 15 minutes
  
  // Visual effects
  const [pulseEffect, setPulseEffect] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  
  const task = tasks.find(t => t.id === taskId);
  
  // Initialize timer with task's estimated time if available
  useEffect(() => {
    if (task?.estimatedTime) {
      const duration = task.estimatedTime * 60;
      setFocusDuration(duration);
      setTime(duration);
    }
  }, [task]);
  
  // Handle timer mode changes
  useEffect(() => {
    if (timerMode === 'focus') {
      setTime(focusDuration);
    } else if (timerMode === 'shortBreak') {
      setTime(shortBreakDuration);
    } else if (timerMode === 'longBreak') {
      setTime(longBreakDuration);
    }
    
    // Reset timer state when changing modes
    setIsActive(false);
    setIsPaused(false);
  }, [timerMode, focusDuration, shortBreakDuration, longBreakDuration]);
  
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          // Create a pulse effect every minute
          if (prevTime % 60 === 0) {
            setPulseEffect(true);
            setTimeout(() => setPulseEffect(false), 1000);
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused]);
  
  const handleModeChange = (_event: React.SyntheticEvent, newMode: TimerMode) => {
    setTimerMode(newMode);
  };
  
  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
    
    // Start a focus session in the context (only in focus mode)
    if (timerMode === 'focus' && taskId) {
      startFocusSession(taskId);
    }
  };
  
  const handlePause = () => {
    setIsPaused(true);
    
    if (timerMode === 'focus') {
      setShowPauseDialog(true);
    }
  };
  
  const handlePauseConfirm = () => {
    // Record the reason in the context
    const finalReason = pauseReason === "Other" ? customReason : pauseReason;
    
    if (finalReason) {
      pauseFocusSession(finalReason);
    }
    
    setShowPauseDialog(false);
  };
  
  const handleResume = () => {
    setIsPaused(false);
    if (timerMode === 'focus') {
      resumeFocusSession();
    }
  };
  
  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    
    // Reset to appropriate time based on mode
    if (timerMode === 'focus') {
      setTime(focusDuration);
    } else if (timerMode === 'shortBreak') {
      setTime(shortBreakDuration);
    } else {
      setTime(longBreakDuration);
    }
  };
  
  const handleSkip = () => {
    // Move to the next timer mode
    if (timerMode === 'focus') {
      setTimerMode('shortBreak');
    } else if (timerMode === 'shortBreak') {
      setTimerMode('focus');
    } else if (timerMode === 'longBreak') {
      setTimerMode('focus');
    }
  };
  
  const handleComplete = () => {
    setIsActive(false);
    
    if (timerMode === 'focus') {
      endFocusSession();
      // Automatically transition to break
      setTimerMode('shortBreak');
    } else {
      // After break, go back to focus mode
      setTimerMode('focus');
    }
  };
  
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const calculateProgress = () => {
    let totalTime;
    if (timerMode === 'focus') {
      totalTime = focusDuration;
    } else if (timerMode === 'shortBreak') {
      totalTime = shortBreakDuration;
    } else {
      totalTime = longBreakDuration;
    }
    
    return ((totalTime - time) / totalTime) * 100;
  };

  // Get mode-specific colors and icons
  const getModeTheme = () => {
    switch(timerMode) {
      case 'focus':
        return {
          color: '#FF6B6B',
          gradient: 'linear-gradient(135deg, #FF6B6B, #FF3636)',
          icon: <FireIcon fontSize="large" sx={{ color: '#FF6B6B' }} />
        };
      case 'shortBreak':
        return {
          color: '#6BFF9E',
          gradient: 'linear-gradient(135deg, #6BFF9E, #00FF66)',
          icon: <LightbulbIcon fontSize="large" sx={{ color: '#6BFF9E' }} />
        };
      case 'longBreak':
        return {
          color: '#9E6BFF',
          gradient: 'linear-gradient(135deg, #9E6BFF, #7700FF)',
          icon: <VibrationIcon fontSize="large" sx={{ color: '#9E6BFF' }} />
        };
    }
  };

  const modeTheme = getModeTheme();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Tabs 
          value={timerMode} 
          onChange={handleModeChange}
          indicatorColor="primary"
          textColor="primary"
          centered
          sx={{
            '& .MuiTab-root': {
              mx: 0.5,
              borderRadius: 1.5,
              px: 3,
              py: 1.5,
              minWidth: 0,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: 'medium',
              transition: 'all 0.3s ease',
            },
            '& .Mui-selected': {
              bgcolor: modeTheme.color,
              color: 'white !important',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Tab 
            value="focus" 
            label="Focus" 
            icon={<FireIcon />} 
            iconPosition="start" 
          />
          <Tab 
            value="shortBreak" 
            label="Short Break" 
            icon={<LightbulbIcon />} 
            iconPosition="start" 
          />
          <Tab 
            value="longBreak" 
            label="Long Break" 
            icon={<VibrationIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Box>
      
      <Grow in={true} timeout={600}>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            mb: 3,
            background: modeTheme.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {timerMode === 'focus' ? 'Time to Focus!' : timerMode === 'shortBreak' ? 'Take a Quick Break' : 'Take a Long Break'}
        </Typography>
      </Grow>
      
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <MotionBox 
          sx={{ 
            position: 'relative', 
            display: 'inline-flex',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))'
          }}
          animate={{ 
            scale: pulseEffect ? 1.05 : 1,
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 15 
          }}
        >
          <CircularProgress
            variant="determinate"
            value={calculateProgress()}
            size={280}
            thickness={3}
            sx={{ 
              color: modeTheme.color,
              position: 'relative',
              zIndex: 1,
            }}
          />
          
          {/* Glowing effect */}
          <CircularProgress
            variant="determinate"
            value={calculateProgress()}
            size={280}
            thickness={3}
            sx={{ 
              color: modeTheme.color,
              opacity: 0.3,
              position: 'absolute',
              filter: 'blur(8px)',
              zIndex: 0,
            }}
          />
          
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MotionBox
              animate={{ scale: pulseEffect ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Typography 
                variant="h1" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: '4.5rem',
                  color: modeTheme.color
                }}
              >
                {formatTime()}
              </Typography>
            </MotionBox>
            
            {modeTheme.icon}
          </Box>
        </MotionBox>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 4 }}>
        <MotionIconButton 
          size="large"
          color="primary"
          sx={{ 
            width: 70, 
            height: 70, 
            border: `2px solid rgba(0,0,0,0.1)`,
            backgroundColor: 'rgba(255,255,255,0.7)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            }
          }}
          onClick={handleReset}
          disabled={!isActive}
          whileHover={{ rotate: 180, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <RefreshIcon sx={{ fontSize: 32 }} />
        </MotionIconButton>
        
        <MotionIconButton 
          size="large"
          sx={{ 
            width: 90, 
            height: 90, 
            background: !isActive || isPaused ? modeTheme.gradient : 'white',
            color: !isActive || isPaused ? 'white' : modeTheme.color,
            border: `3px solid ${modeTheme.color}`,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            '&:hover': {
              background: !isActive || isPaused ? modeTheme.gradient : 'white',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
            }
          }}
          onClick={!isActive ? handleStart : isPaused ? handleResume : handlePause}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {!isActive || isPaused ? (
            <PlayIcon sx={{ fontSize: 40 }} />
          ) : (
            <PauseIcon sx={{ fontSize: 40 }} />
          )}
        </MotionIconButton>
        
        <MotionIconButton 
          size="large"
          color="primary"
          sx={{ 
            width: 70, 
            height: 70, 
            border: `2px solid rgba(0,0,0,0.1)`,
            backgroundColor: 'rgba(255,255,255,0.7)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.9)',
            }
          }}
          onClick={handleSkip}
          whileHover={{ x: 5, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SkipNextIcon sx={{ fontSize: 32 }} />
        </MotionIconButton>
      </Box>
      
      {timerMode === 'focus' && (
        <Zoom in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <PlayIcon color="primary" fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                What are you focusing on?
              </Typography>
            </Box>
            
            {task ? (
              <Box sx={{ mt: 3, display: 'inline-block', textAlign: 'left' }}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    display: 'inline-block',
                    minWidth: 350,
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {task.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {task.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={task.category} 
                      size="medium" 
                      sx={{ 
                        borderRadius: 2, 
                        py: 2,
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        color: 'primary.main',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 6px rgba(0,0,0,0.05)'
                      }} 
                    />
                  </Box>
                </Paper>
              </Box>
            ) : (
              <TextField
                placeholder="Enter what you're working on..."
                variant="outlined"
                size="medium"
                value={focusTaskInput}
                onChange={(e) => setFocusTaskInput(e.target.value)}
                sx={{ 
                  mt: 3,
                  width: '100%',
                  maxWidth: 500,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                    '&:hover': {
                      boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '16px 20px',
                    fontSize: '1.1rem'
                  }
                }}
              />
            )}
          </Box>
        </Zoom>
      )}
      
      {currentSession && currentSession.interruptions.length > 0 && timerMode === 'focus' && (
        <Zoom in={true} timeout={1000}>
          <Box sx={{ mt: 5, textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#FF6B6B' }}>
              Session Interruptions:
            </Typography>
            <Stack spacing={2}>
              {currentSession.interruptions.map((interruption, index) => (
                <MotionBox 
                  key={interruption.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper 
                    elevation={2}
                    sx={{ 
                      p: 2, 
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 152, 0, 0.08)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 152, 0, 0.15)',
                      boxShadow: '0 5px 15px rgba(255, 152, 0, 0.1)'
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {new Date(interruption.timestamp).toLocaleTimeString()} - {interruption.reason}
                    </Typography>
                  </Paper>
                </MotionBox>
              ))}
            </Stack>
          </Box>
        </Zoom>
      )}
      
      {/* Pause Dialog */}
      <Dialog 
        open={showPauseDialog} 
        onClose={() => setShowPauseDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: 4,
            p: 1,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }
        }}
      >
        <DialogTitle sx={{ pr: 6, typography: 'h5', fontWeight: 'bold' }}>
          Why did you pause?
          <IconButton
            onClick={() => setShowPauseDialog(false)}
            sx={{ position: 'absolute', right: 16, top: 16 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Understanding your interruptions helps improve focus over time.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="What interrupted your focus?"
            fullWidth
            variant="outlined"
            value={customReason}
            onChange={(e) => {
              setCustomReason(e.target.value);
              setPauseReason("Other");
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem'
              }
            }}
            InputProps={{
              sx: { py: 1 }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setShowPauseDialog(false)}
            variant="outlined"
            size="large"
            sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 'bold' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePauseConfirm} 
            variant="contained"
            size="large" 
            disabled={!customReason.trim()}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              py: 1, 
              textTransform: 'none', 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)'
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </MotionBox>
  );
} 