import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  useTheme,
  Popover,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const theme = useTheme();
  const { tasks, timeBlocks } = useAppContext();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const handlePrevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleDayClick = (day: Date, event: React.MouseEvent<HTMLElement>) => {
    setSelectedDay(day);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Generate the days of the current week
  const weekDaysDate = [...Array(7)].map((_, i) => addDays(weekStart, i));

  // Filter tasks and time blocks for the selected day
  const getTasksForDay = (day: Date) => {
    if (!day) return [];
    
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    });
  };

  const getTimeBlocksForDay = (day: Date) => {
    if (!day) return [];
    
    return timeBlocks.filter(block => {
      const blockDate = new Date(block.start);
      return isSameDay(blockDate, day);
    });
  };

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];
  const selectedDayBlocks = selectedDay ? getTimeBlocksForDay(selectedDay) : [];
  const hasEvents = selectedDayTasks.length > 0 || selectedDayBlocks.length > 0;

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Calendar
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<ArrowBackIcon />} 
            onClick={handlePrevWeek}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Prev
          </Button>
          <Button 
            variant="outlined" 
            size="small" 
            endIcon={<ArrowForwardIcon />} 
            onClick={handleNextWeek}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Next
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
        {weekDays.map((day) => (
          <Box key={day}>
            <Typography 
              variant="subtitle2" 
              align="center" 
              color="textSecondary"
              sx={{ fontWeight: 'medium', mb: 1 }}
            >
              {day}
            </Typography>
          </Box>
        ))}

        {weekDaysDate.map((day, index) => {
          const isCurrentDay = isToday(day);
          const dayTasks = getTasksForDay(day);
          const dayBlocks = getTimeBlocksForDay(day);
          const hasTasksOrBlocks = dayTasks.length > 0 || dayBlocks.length > 0;
          
          return (
            <Box key={index}>
              <Paper
                elevation={0}
                onClick={(e) => handleDayClick(day, e)}
                sx={{
                  p: 1,
                  height: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderRadius: 2,
                  backgroundColor: isCurrentDay 
                    ? 'rgba(25, 118, 210, 0.08)'
                    : 'white',
                  border: isCurrentDay
                    ? `1px solid ${theme.palette.primary.main}`
                    : '1px solid #eee',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  overflow: 'hidden'
                }}
              >
                <Typography
                  variant="subtitle1"
                  align="center"
                  sx={{
                    fontWeight: isCurrentDay ? 'bold' : 'medium',
                    color: isCurrentDay ? theme.palette.primary.main : 'inherit',
                    mb: 1
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                
                {hasTasksOrBlocks && (
                  <Box sx={{ flex: 1, overflow: 'hidden' }}>
                    {dayTasks.slice(0, 2).map((task, i) => (
                      <Box
                        key={i}
                        sx={{
                          p: 0.5,
                          borderRadius: 1,
                          mb: 0.5,
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          color: theme.palette.primary.main,
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {task.title}
                      </Box>
                    ))}
                    
                    {dayTasks.length > 2 && (
                      <Typography variant="caption" sx={{ pl: 0.5, color: 'text.secondary' }}>
                        +{dayTasks.length - 2} more
                      </Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })}
      </Box>
      
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: { 
            p: 2, 
            minWidth: 300, 
            maxWidth: 400, 
            borderRadius: 2
          }
        }}
      >
        {selectedDay && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {format(selectedDay, 'EEEE, MMMM d')}
            </Typography>
            
            {hasEvents ? (
              <>
                {selectedDayTasks.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
                      Tasks
                    </Typography>
                    <List disablePadding>
                      {selectedDayTasks.map((task) => (
                        <ListItem 
                          key={task.id} 
                          disablePadding 
                          sx={{ 
                            mb: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                          }}
                        >
                          <ListItemText
                            primary={task.title}
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                                <Chip
                                  label={task.category}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    borderRadius: 1,
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {task.estimatedTime} min
                                </Typography>
                              </Box>
                            }
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: 'medium',
                            }}
                          />
                          {!task.completed && (
                            <Button
                              component={Link}
                              to={`/focus?taskId=${task.id}`}
                              size="small"
                              variant="outlined"
                              startIcon={<PlayIcon sx={{ fontSize: 16 }} />}
                              sx={{ ml: 'auto', borderRadius: 1, py: 0.5 }}
                            >
                              Focus
                            </Button>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                
                {selectedDayBlocks.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
                      Time Blocks
                    </Typography>
                    <List disablePadding>
                      {selectedDayBlocks.map((block) => (
                        <ListItem
                          key={block.id}
                          disablePadding
                          sx={{
                            mb: 1,
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: 'rgba(76, 175, 80, 0.04)',
                          }}
                        >
                          <ListItemText
                            primary={block.title}
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(block.start), 'h:mm a')} - {format(new Date(block.end), 'h:mm a')}
                              </Typography>
                            }
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: 'medium',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            ) : (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No tasks or events scheduled for this day.
              </Typography>
            )}
          </>
        )}
      </Popover>
    </Paper>
  );
} 