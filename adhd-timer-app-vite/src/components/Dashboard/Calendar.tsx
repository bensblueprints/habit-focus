import { useState, useEffect } from 'react';
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
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  ArrowForward as ArrowForwardIcon,
  PlayArrow as PlayIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  format, 
  startOfWeek, 
  endOfWeek,
  addDays, 
  isSameDay, 
  addWeeks, 
  subWeeks, 
  isToday,
  startOfDay,
  addHours,
  isSameHour,
  isWithinInterval,
  parseISO
} from 'date-fns';
import { useAppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

// Define time slots for the day
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

export default function Calendar() {
  const theme = useTheme();
  const { tasks, timeBlocks } = useAppContext();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const handlePrevWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const handleEventClick = (event: any, domEvent: React.MouseEvent<HTMLElement>) => {
    setSelectedEvent(event);
    setAnchorEl(domEvent.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  // Generate days of the current week (7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Get events for a specific day and hour
  const getEventsForTimeSlot = (day: Date, hour: number) => {
    const start = addHours(startOfDay(day), hour);
    const end = addHours(startOfDay(day), hour + 1);
    
    const timeBlocksInSlot = timeBlocks.filter(block => {
      const blockStart = new Date(block.start);
      const blockEnd = new Date(block.end);
      
      return isWithinInterval(blockStart, { start, end }) || 
             isWithinInterval(blockEnd, { start, end }) ||
             (blockStart <= start && blockEnd >= end);
    });
    
    const tasksWithDueTime = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day) && 
             taskDate.getHours() === hour;
    });
    
    return [...timeBlocksInSlot, ...tasksWithDueTime];
  };
  
  // Format the week range for display
  const formatWeekRange = () => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    
    if (sameMonth) {
      return `${format(weekStart, 'MMMM d')} – ${format(weekEnd, 'd, yyyy')}`;
    } else {
      return `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d, yyyy')}`;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Calendar header with navigation */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 4,
              textTransform: 'none',
              px: 2
            }}
          >
            Today
          </Button>
          <IconButton onClick={handlePrevWeek}>
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={handleNextWeek}>
            <ArrowForwardIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
            {formatWeekRange()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined"
            endIcon={<ArrowForwardIcon fontSize="small" />}
            sx={{ borderRadius: 4, textTransform: 'none' }}
          >
            Week
          </Button>
          <Tooltip title="Search">
            <IconButton>
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Days of week header */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'minmax(60px, auto) repeat(7, 1fr)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        bgcolor: 'background.paper'
      }}>
        {/* Empty cell for time column */}
        <Box sx={{ 
          py: 1, 
          px: 1, 
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography variant="caption" color="text.secondary">GMT+07</Typography>
        </Box>
        
        {/* Day headers */}
        {weekDays.map((day, index) => {
          const isCurrentDay = isToday(day);
          
          return (
            <Box 
              key={index}
              sx={{ 
                py: 1,
                borderRight: index < 6 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                bgcolor: isCurrentDay ? 'primary.main' : 'transparent',
                color: isCurrentDay ? 'white' : 'inherit',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                {format(day, 'EEE').toUpperCase()}
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: isCurrentDay ? 'bold' : 'medium',
                  ...(isCurrentDay && {
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                  })
                }}
              >
                {format(day, 'd')}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Time grid */}
      <Box sx={{ 
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(60px, auto) repeat(7, 1fr)',
        gridTemplateRows: `repeat(${HOURS.length}, minmax(60px, 1fr))`,
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Time labels column */}
        {HOURS.map((hour, index) => (
          <Box 
            key={hour}
            sx={{ 
              gridColumn: 1,
              gridRow: index + 1,
              borderRight: '1px solid rgba(0, 0, 0, 0.1)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
              py: 1,
              pr: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour-12} PM` : `${hour} AM`}
            </Typography>
          </Box>
        ))}

        {/* Time slots for each day */}
        {weekDays.map((day, dayIndex) => (
          HOURS.map((hour, hourIndex) => {
            const events = getEventsForTimeSlot(day, hour);
            const isCurrentTimeSlot = isToday(day) && new Date().getHours() === hour;
            
            return (
              <Box 
                key={`${dayIndex}-${hour}`}
                sx={{ 
                  gridColumn: dayIndex + 2,
                  gridRow: hourIndex + 1,
                  borderRight: dayIndex < 6 ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  bgcolor: isCurrentTimeSlot ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer'
                  }
                }}
              >
                {events.length > 0 && (
                  <Box sx={{ p: 0.5 }}>
                    {events.map((event, idx) => (
                      <Box
                        key={idx}
                        onClick={(e) => handleEventClick(event, e)}
                        sx={{
                          p: 0.5,
                          borderRadius: 0.5,
                          mb: 0.5,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          cursor: 'pointer',
                          '&:hover': {
                            filter: 'brightness(0.95)'
                          }
                        }}
                      >
                        {event.title}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            );
          })
        ))}

        {/* Current time indicator */}
        {weekDays.some(day => isToday(day)) && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `calc(${(new Date().getHours() - HOURS[0] + new Date().getMinutes() / 60) * 100 / HOURS.length}%)`,
              height: '2px',
              bgcolor: 'error.main',
              zIndex: 5,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 60, // width of time column
                top: '-4px',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                bgcolor: 'error.main'
              }
            }}
          />
        )}
      </Box>

      {/* Event Popover */}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        sx={{ mt: 1 }}
      >
        {selectedEvent && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {selectedEvent.title}
            </Typography>
            
            {selectedEvent.description && (
              <Typography variant="body2" paragraph>
                {selectedEvent.description}
              </Typography>
            )}
            
            <Typography variant="body2" color="text.secondary">
              {selectedEvent.start && format(
                typeof selectedEvent.start === 'string' 
                  ? new Date(selectedEvent.start) 
                  : selectedEvent.start, 
                'h:mm a'
              )}
              {selectedEvent.end && ` - ${format(
                typeof selectedEvent.end === 'string'
                  ? new Date(selectedEvent.end)
                  : selectedEvent.end,
                'h:mm a'
              )}`}
            </Typography>
            
            {selectedEvent.id && !selectedEvent.completed && (
              <Button
                component={Link}
                to={`/focus?taskId=${selectedEvent.id}`}
                variant="contained"
                size="small"
                startIcon={<PlayIcon />}
                sx={{ mt: 2 }}
              >
                Focus
              </Button>
            )}
          </Box>
        )}
      </Popover>
    </Box>
  );
} 