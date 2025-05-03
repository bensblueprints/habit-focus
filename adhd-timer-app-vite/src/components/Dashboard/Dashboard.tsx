import { useState } from 'react';
import { Box, Typography, Paper, Button, Card, CardContent, Divider, LinearProgress, Chip } from '@mui/material';
import { 
  AccessTime as TimeIcon, 
  Add as AddIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { 
    tasks, 
    sessions, 
    points, 
    achievements, 
    completionRate
  } = useAppContext();
  
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  
  // Get incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed).slice(0, 3);
  
  // Get recent achievements
  const recentAchievements = achievements.slice(0, showAllAchievements ? achievements.length : 3);
  
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link}
          to="/tasks/new"
        >
          Add Task
        </Button>
      </Box>
      
      {/* Overview Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3, mb: 4 }}>
        <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6', md: 'span 3' } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
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
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              bgcolor: 'rgba(156, 39, 176, 0.08)',
              border: '1px solid rgba(156, 39, 176, 0.2)'
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Total Points
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold' }}>
              {points}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {achievements.length} achievements
            </Typography>
          </Paper>
        </Box>
      </Box>
      
      {/* Task List and Achievements */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}>
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Your Tasks
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
              incompleteTasks.map(task => (
                <Card 
                  key={task.id} 
                  variant="outlined" 
                  sx={{ mb: 2, borderRadius: 2, boxShadow: 'none' }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {task.title}
                        </Typography>
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
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small"
                        component={Link}
                        to={`/focus?taskId=${task.id}`}
                        sx={{ fontWeight: 'medium', borderRadius: 1.5 }}
                      >
                        Focus
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No tasks remaining</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  component={Link}
                  to="/tasks/new"
                  sx={{ mt: 2 }}
                >
                  Add New Task
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
        
        <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 5' } }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Achievements
              </Typography>
              <Button 
                size="small"
                onClick={() => setShowAllAchievements(!showAllAchievements)}
              >
                {showAllAchievements ? 'Show Less' : 'Show All'}
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            {recentAchievements.length > 0 ? (
              recentAchievements.map(achievement => (
                <Box 
                  key={achievement.id} 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: 'rgba(156, 39, 176, 0.04)', 
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <TrophyIcon sx={{ color: 'warning.main', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {achievement.description}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`+${achievement.points}`} 
                    size="small" 
                    color="secondary" 
                    sx={{ 
                      ml: 'auto', 
                      borderRadius: 1,
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
              ))
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Complete tasks to earn achievements</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
} 