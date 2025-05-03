import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  LinearProgress, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  IconButton,
  Tooltip,
  Checkbox,
  Fab,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { 
  AccessTime as TimeIcon, 
  Add as AddIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckCircleIcon,
  Today as TodayIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  FilterList as FilterListIcon,
  Psychology as PsychologyIcon,
  Bolt as BoltIcon,
  LocalFireDepartment as FireIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import Calendar from './Calendar';
import { format, differenceInMinutes } from 'date-fns';

// Motion components
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionTypography = motion(Typography);
const MotionIcon = motion(IconButton);

export default function Dashboard() {
  const { 
    tasks, 
    sessions, 
    completionRate,
    addTask,
    streak
  } = useAppContext();
  
  const [showStreakCelebration, setShowStreakCelebration] = useState(false);
  
  // Initialize streak celebration effect when streak increases past milestone
  useEffect(() => {
    if (streak > 0 && streak % 5 === 0) {  // Celebrate milestones (5, 10, 15, etc.)
      setShowStreakCelebration(true);
      
      // Hide celebration after a few seconds
      const timer = setTimeout(() => {
        setShowStreakCelebration(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [streak]);
  
  // Task dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Work',
    estimatedTime: 25,
    completed: false,
    actualTime: 0,
  });
  
  // Brain Dump dialog state
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [brainDumpText, setBrainDumpText] = useState('');
  const [brainDumpAction, setBrainDumpAction] = useState<'task' | 'habit' | 'process' | null>(null);
  
  // Pre-defined categories
  const categories = [
    "Work", 
    "Personal", 
    "Study", 
    "Exercise", 
    "Shopping", 
    "Household", 
    "Finance", 
    "Other"
  ];
  
  // Get incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  
  // Format time as hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  // Calculate daily stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tasksCompletedToday = tasks.filter(task => 
    task.completed && new Date(task.created) >= today
  ).length;
  
  const focusSessionsToday = sessions.filter(session => 
    new Date(session.startTime) >= today
  );
  
  const focusTimeToday = focusSessionsToday.reduce(
    (total, session) => total + session.duration / 60, 0
  );

  // Calculate time between tasks for completed tasks with sessions
  const getTimeBetweenTasks = () => {
    // Sort sessions by start time
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    // Calculate time between consecutive sessions
    const timeBetween = [];
    for (let i = 0; i < sortedSessions.length - 1; i++) {
      const currentSession = sortedSessions[i];
      const nextSession = sortedSessions[i + 1];
      
      if (currentSession.endTime) {
        const endTime = new Date(currentSession.endTime);
        const nextStartTime = new Date(nextSession.startTime);
        
        const minutesBetween = differenceInMinutes(nextStartTime, endTime);
        
        if (minutesBetween > 0 && minutesBetween < 120) { // Only show reasonable breaks (less than 2 hours)
          timeBetween.push({
            time: minutesBetween,
            fromTask: tasks.find(t => t.id === currentSession.taskId)?.title || 'Unknown task',
            toTask: tasks.find(t => t.id === nextSession.taskId)?.title || 'Unknown task',
            date: format(nextStartTime, 'MMM d')
          });
        }
      }
    }
    
    return timeBetween.slice(0, 3); // Return last 3 breaks
  };
  
  const timeBetweenTasks = getTimeBetweenTasks();

  // Task dialog handlers
  const handleOpenDialog = () => {
    setNewTask({
      title: '',
      description: '',
      category: 'Work',
      estimatedTime: 25,
      completed: false,
      actualTime: 0
    });
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  const handleSaveTask = () => {
    // Add new task with required fields
    addTask(newTask);
    setIsDialogOpen(false);
  };
  
  // Brain Dump handlers
  const handleOpenBrainDump = () => {
    setBrainDumpText('');
    setBrainDumpAction(null);
    setIsBrainDumpOpen(true);
  };
  
  const handleCloseBrainDump = () => {
    setIsBrainDumpOpen(false);
  };
  
  const handleBrainDumpActionChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAction: 'task' | 'habit' | 'process' | null,
  ) => {
    setBrainDumpAction(newAction);
  };
  
  const handleSaveBrainDump = () => {
    if (!brainDumpText.trim()) {
      handleCloseBrainDump();
      return;
    }
    
    if (brainDumpAction === 'task') {
      // Create a new task from brain dump text
      const newTaskFromDump = {
        title: brainDumpText.split('\n')[0] || 'Brain Dump Task',
        description: brainDumpText,
        category: 'Personal',
        estimatedTime: 25,
        completed: false,
        actualTime: 0
      };
      addTask(newTaskFromDump);
    } else if (brainDumpAction === 'habit') {
      // Add habit functionality would go here
      console.log('Create habit:', brainDumpText);
    } else {
      // Just process without creating anything
      console.log('Processed brain dump:', brainDumpText);
    }
    
    handleCloseBrainDump();
  };

  // Calculate flame size based on streak length
  const getStreakFlameSize = () => {
    if (streak <= 0) return 40;
    if (streak < 3) return 50;
    if (streak < 7) return 60;
    if (streak < 14) return 70;
    if (streak < 30) return 80;
    return 90;
  };
  
  // Get streak status text and color
  const getStreakStatus = () => {
    if (streak <= 0) {
      return { text: "Start your streak today!", color: "text.secondary" };
    } else if (streak === 1) {
      return { text: "First day - keep going!", color: "primary.main" };
    } else if (streak < 3) {
      return { text: "Building momentum!", color: "primary.main" };
    } else if (streak < 7) {
      return { text: "Getting consistent!", color: "secondary.main" };
    } else if (streak < 14) {
      return { text: "Impressive streak!", color: "#FF9800" };
    } else if (streak < 30) {
      return { text: "You're on fire! 🔥", color: "#FF5722" };
    } else {
      return { text: "LEGENDARY! 🏆", color: "#9C27B0" };
    }
  };
  
  const streakStatus = getStreakStatus();
  
  // Enhanced Streak Card
  const StreakCard = () => (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: streak > 0 ? `rgba(255, 87, 34, ${Math.min(0.05 + streak * 0.01, 0.2)})` : 'rgba(255, 87, 34, 0.05)',
        border: '1px solid rgba(255, 87, 34, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Background flames for high streaks */}
      {streak >= 7 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -10,
            left: 0,
            right: 0,
            height: '40%',
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='40' viewBox='0 0 100 40' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 40C15 30 25 20 15 0C15 0 30 15 25 30C25 30 35 25 35 0C35 0 40 15 38 25C38 25 50 15 50 0C50 0 50 25 45 30C45 30 55 25 65 0C65 0 60 25 55 35C55 35 70 25 75 0C75 0 80 30 65 40L20 40Z' fill='%23FF5722'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: '100px 40px',
          }}
        />
      )}

      <MotionTypography
        variant="subtitle1"
        color="textSecondary"
        sx={{ fontWeight: 'bold', mb: 1 }}
        animate={{ scale: showStreakCelebration ? [1, 1.1, 1] : 1 }}
        transition={{ duration: 0.5, repeat: showStreakCelebration ? 2 : 0 }}
      >
        Current Streak
      </MotionTypography>

      <MotionBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          my: 1,
        }}
      >
        {/* Flame icon with pulse animation for active streaks */}
        <MotionIcon
          component={FireIcon}
          sx={{
            fontSize: getStreakFlameSize(),
            color: streak > 0 ? 'rgba(255, 87, 34, 0.8)' : 'rgba(255, 87, 34, 0.3)',
            padding: 0,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: streak > 0 ? [1, 1.1, 1] : 1,
            opacity: streak > 0 ? [0.8, 1, 0.8] : 0.3,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <MotionTypography
          variant="h2"
          sx={{
            fontWeight: 'bold',
            zIndex: 1,
            color: streak > 0 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
            textShadow: streak >= 7 ? '0 0 10px rgba(255, 87, 34, 0.3)' : 'none',
          }}
          animate={{ 
            scale: showStreakCelebration ? [1, 1.3, 1] : 1,
            y: showStreakCelebration ? [0, -20, 0] : 0
          }}
          transition={{ duration: 0.8 }}
        >
          {streak}
        </MotionTypography>
      </MotionBox>

      {/* Streak Indicator */}
      <Box sx={{ width: '100%', my: 1, px: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 0.5
          }}
        >
          <Typography variant="caption" color="text.secondary">Beginner</Typography>
          <Typography variant="caption" color="text.secondary">Expert</Typography>
        </Box>
        <Box
          sx={{
            height: 8,
            bgcolor: 'rgba(0,0,0,0.05)',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <MotionBox
            sx={{
              height: '100%',
              borderRadius: 4,
              background: `linear-gradient(90deg, #FFB74D, #FF9800, #FF5722)`,
              width: `${Math.min((streak / 30) * 100, 100)}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
            transition={{ duration: 1, type: 'spring' }}
          />
          
          {/* Milestone markers */}
          {[7, 14, 30].map((milestone) => (
            <Tooltip 
              key={milestone} 
              title={`${milestone} day milestone`} 
              arrow
              placement="top"
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${(milestone / 30) * 100}%`,
                  height: '100%',
                  width: 2,
                  bgcolor: 'rgba(0,0,0,0.2)',
                  zIndex: 1,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: 8,
                    height: 8,
                    bgcolor: streak >= milestone ? '#4CAF50' : 'white',
                    border: '1px solid rgba(0,0,0,0.2)',
                    borderRadius: '50%',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 2,
                  }
                }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>

      <MotionTypography
        variant="body2"
        sx={{ 
          color: streakStatus.color,
          fontWeight: 'medium',
          textAlign: 'center',
          mt: 1
        }}
        animate={{ 
          scale: showStreakCelebration ? [1, 1.1, 1] : 1
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {streakStatus.text}
      </MotionTypography>

      {/* Streak benefits for higher streaks */}
      {streak >= 3 && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <StarIcon sx={{ fontSize: 14, color: 'rgba(255, 87, 34, 0.8)' }} />
          <Typography variant="caption" color="text.secondary">
            {streak >= 7 ? '+20% bonus points' : '+10% bonus points'}
          </Typography>
        </Box>
      )}

      {/* Celebration effects */}
      {showStreakCelebration && (
        <Box sx={{ position: 'absolute', inset: 0 }}>
          {[...Array(20)].map((_, i) => (
            <MotionBox
              key={i}
              sx={{
                position: 'absolute',
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                backgroundColor: [
                  '#FF5722',
                  '#FF9800',
                  '#FFC107',
                  '#FFEB3B',
                ][Math.floor(Math.random() * 4)],
                borderRadius: '50%',
              }}
              initial={{
                x: '50%',
                y: '50%',
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </Box>
      )}
    </MotionPaper>
  );

  return (
    <Box>
      {/* Header with stats */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              sx={{ borderRadius: 2 }}
            >
              Filter
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              sx={{ borderRadius: 2 }}
            >
              Add Task
            </Button>
          </Box>
        </Box>
        
        {/* Overview Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mb: 4 }}>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                height: '100%',
                borderRadius: 2, 
                bgcolor: 'rgba(25, 118, 210, 0.08)',
                border: '1px solid rgba(25, 118, 210, 0.2)'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Tasks Remaining
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {tasks.filter(task => !task.completed).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {tasksCompletedToday} completed today
              </Typography>
            </Paper>
          </Box>
          
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                height: '100%',
                borderRadius: 2,
                bgcolor: 'rgba(76, 175, 80, 0.08)',
                border: '1px solid rgba(76, 175, 80, 0.2)'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Focus Time Today
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {formatTime(focusTimeToday)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {focusSessionsToday.length} sessions
              </Typography>
            </Paper>
          </Box>
          
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                height: '100%',
                borderRadius: 2,
                bgcolor: 'rgba(255, 193, 7, 0.08)',
                border: '1px solid rgba(255, 193, 7, 0.2)'
              }}
            >
              <Typography variant="subtitle2" color="textSecondary">
                Completion Rate
              </Typography>
              <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
                {completionRate.toFixed(0)}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={completionRate} 
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Paper>
          </Box>
          
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
            <StreakCard />
          </Box>
        </Box>
      </Box>
      
      {/* Main content: Calendar (2/3) and Task List (1/3) */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Calendar Section (2/3) */}
        <Box sx={{ flex: { md: 2 } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              minHeight: '600px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TodayIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Calendar View
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Invite team member">
                  <IconButton size="small">
                    <PersonAddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More options">
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ flex: 1, height: 'calc(100% - 80px)', minHeight: '500px' }}>
              <Calendar />
            </Box>
            
            {/* Time Between Tasks Analysis */}
            {timeBetweenTasks.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Recent Task Transitions
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1, 
                  bgcolor: 'rgba(0, 0, 0, 0.02)', 
                  p: 2, 
                  borderRadius: 2 
                }}>
                  {timeBetweenTasks.map((item, i) => (
                    <Box key={i} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'white',
                      border: '1px solid rgba(0, 0, 0, 0.05)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {item.fromTask} → {item.toTask}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.date}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip 
                        label={`${item.time} min`}
                        size="small"
                        color={item.time < 5 ? "success" : item.time < 15 ? "primary" : "warning"}
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
        
        {/* Task List Section (1/3) */}
        <Box sx={{ flex: { md: 1 } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                My Tasks
              </Typography>
              <Button 
                component={Link}
                to="/tasks"
                size="small"
              >
                View All
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {incompleteTasks.length > 0 ? (
              <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                {incompleteTasks.map((task, _) => (
                  <Card 
                    key={task.id} 
                    variant="outlined" 
                    sx={{ 
                      mb: 2, 
                      borderRadius: 2, 
                      boxShadow: 'none',
                      borderLeft: `4px solid ${
                        task.category === 'Work' ? '#1976d2' : 
                        task.category === 'Personal' ? '#9c27b0' : 
                        task.category === 'Study' ? '#ff9800' :
                        task.category === 'Exercise' ? '#4caf50' : 
                        '#757575'
                      }`
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Checkbox 
                            size="small"
                            sx={{ 
                              color: 'action.disabled',
                              '&:hover': { 
                                color: 'primary.main' 
                              }
                            }}
                          />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                              {task.title}
                            </Typography>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {task.description.length > 60 
                                  ? `${task.description.substring(0, 60)}...` 
                                  : task.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Chip 
                                label={task.category} 
                                size="small" 
                                sx={{ 
                                  borderRadius: 1, 
                                  bgcolor: 'rgba(25, 118, 210, 0.08)',
                                  height: 24,
                                  fontSize: '0.75rem'
                                }} 
                              />
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TimeIcon fontSize="small" sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {task.estimatedTime} min
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          size="small"
                          component={Link}
                          to={`/focus?taskId=${task.id}`}
                          startIcon={<PlayIcon />}
                          sx={{ fontWeight: 'medium', borderRadius: 1.5 }}
                        >
                          Focus
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No tasks remaining</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleOpenDialog}
                  sx={{ mt: 2 }}
                >
                  Add New Task
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
      
      {/* Brain Dump Floating Button */}
      <Fab
        color="warning"
        aria-label="brain dump"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}
        onClick={handleOpenBrainDump}
      >
        <PsychologyIcon />
      </Fab>
      
      {/* Add Task Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Task Title"
              fullWidth
              variant="outlined"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              label="Description (optional)"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <FormControl fullWidth margin="dense">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    value={newTask.category}
                    label="Category"
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                <TextField
                  margin="dense"
                  label="Estimated Time (minutes)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={newTask.estimatedTime}
                  onChange={(e) => setNewTask({ ...newTask, estimatedTime: parseInt(e.target.value) || 0 })}
                  InputProps={{ inputProps: { min: 1 } }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveTask} 
            variant="contained"
            disabled={!newTask.title.trim() || newTask.estimatedTime <= 0}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Brain Dump Dialog */}
      <Dialog open={isBrainDumpOpen} onClose={handleCloseBrainDump} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="warning" />
            Brain Dump
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Quickly capture your thoughts or ideas. You can later convert them into tasks, habits, or just process them.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={6}
            placeholder="Just start typing whatever's on your mind..."
            variant="outlined"
            value={brainDumpText}
            onChange={(e) => setBrainDumpText(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle2" gutterBottom>
            What would you like to do with this?
          </Typography>
          
          <ToggleButtonGroup
            value={brainDumpAction}
            exclusive
            onChange={handleBrainDumpActionChange}
            aria-label="brain dump action"
            sx={{ mb: 2, width: '100%' }}
          >
            <ToggleButton 
              value="task" 
              aria-label="convert to task"
              sx={{ 
                flex: 1, 
                borderRadius: 1, 
                py: 1.5, 
                borderColor: 'primary.main',
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AddIcon />
                <Typography variant="caption" sx={{ mt: 0.5 }}>Create Task</Typography>
              </Box>
            </ToggleButton>
            <ToggleButton 
              value="habit" 
              aria-label="convert to habit"
              sx={{ 
                flex: 1, 
                borderRadius: 1, 
                py: 1.5,
                borderColor: 'success.main',
                '&.Mui-selected': {
                  bgcolor: 'success.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <BoltIcon />
                <Typography variant="caption" sx={{ mt: 0.5 }}>Create Habit</Typography>
              </Box>
            </ToggleButton>
            <ToggleButton 
              value="process" 
              aria-label="just process"
              sx={{ 
                flex: 1, 
                borderRadius: 1, 
                py: 1.5,
                borderColor: 'info.main',
                '&.Mui-selected': {
                  bgcolor: 'info.light',
                  color: 'primary.contrastText'
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CheckCircleIcon />
                <Typography variant="caption" sx={{ mt: 0.5 }}>Just Process</Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBrainDump}>Cancel</Button>
          <Button 
            onClick={handleSaveBrainDump} 
            variant="contained"
            color="warning"
            disabled={!brainDumpText.trim() || !brainDumpAction}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 