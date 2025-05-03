import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { 
  format, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  getHours,
  getMinutes,
  addWeeks,
  subWeeks
} from 'date-fns';

export default function Calendar() {
  const { timeBlocks } = useAppContext();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the start and end of the week for the current date
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday as first day
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Generate array of dates for the week
  const weekDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Navigate to next week
  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  // Navigate to previous week
  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  // Format hours for display (12-hour format)
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };
  
  // Calendar hours to display (7 AM to 9 PM)
  const calendarHours = Array.from({ length: 15 }, (_, i) => i + 7);
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Calendar navigation */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3
      }}>
        <Button 
          startIcon={<ChevronLeftIcon />} 
          onClick={handlePrevWeek}
          sx={{ minWidth: 'auto' }}
        >
          Previous
        </Button>
        
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
        </Typography>
        
        <Button 
          endIcon={<ChevronRightIcon />} 
          onClick={handleNextWeek}
          sx={{ minWidth: 'auto' }}
        >
          Next
        </Button>
      </Box>
      
      {/* Calendar days (header) */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto repeat(7, 1fr)', 
        gap: 0.5,
        mb: 1
      }}>
        {/* Empty cell for time column */}
        <Box sx={{ 
          height: 40, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderRadius: 1,
        }} />
        
        {/* Day headers */}
        {weekDays.map((day) => (
          <Box 
            key={day.toString()} 
            sx={{ 
              height: 40, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 1,
              bgcolor: isToday(day) ? 'primary.light' : 'transparent',
              color: isToday(day) ? 'primary.contrastText' : 'inherit',
              fontWeight: isToday(day) ? 'bold' : 'regular',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {format(day, 'EEE')}
            </Typography>
            <Typography variant="body2">
              {format(day, 'd')}
            </Typography>
          </Box>
        ))}
      </Box>
      
      {/* Calendar grid */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto repeat(7, 1fr)', 
        gap: 0.5,
        flexGrow: 1,
        overflowY: 'auto',
        px: 1,
        py: 1,
        height: 0, // Needed for the scroll to work with flexbox
      }}>
        {/* Time slots */}
        {calendarHours.map((hour) => (
          <React.Fragment key={`hour-${hour}`}>
            {/* Hour label */}
            <Box sx={{ 
              gridColumn: '1 / 2',
              height: 60,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              pr: 1,
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}>
              {formatHour(hour)}
            </Box>
            
            {/* Day cells for this hour */}
            {weekDays.map((day, dayIndex) => (
              <Box 
                key={`${day.toString()}-${hour}`}
                sx={{ 
                  gridColumn: dayIndex + 2,
                  height: 60,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                {/* Render events that occur during this hour */}
                {timeBlocks
                  .filter(block => {
                    const blockDate = new Date(block.start);
                    const blockHour = getHours(blockDate);
                    return isSameDay(blockDate, day) && blockHour === hour;
                  })
                  .map(block => {
                    const startMinutes = getMinutes(new Date(block.start));
                    const startTime = new Date(block.start);
                    const endTime = new Date(block.end);
                    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
                    const heightPercentage = Math.min(durationMinutes / 60 * 100, 95); // Cap at 95% to avoid overlapping next hour
                    
                    return (
                      <Box
                        key={block.id}
                        sx={{
                          position: 'absolute',
                          top: `${(startMinutes / 60) * 100}%`,
                          left: '2%',
                          width: '96%',
                          height: `${heightPercentage}%`,
                          backgroundColor: block.completed ? 'success.light' : 'primary.light',
                          color: block.completed ? 'success.contrastText' : 'primary.contrastText',
                          borderRadius: 1,
                          p: 0.5,
                          overflow: 'hidden',
                          fontSize: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                          cursor: 'pointer',
                          '&:hover': {
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          }
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                          {block.title}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}>
                          {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
                        </Typography>
                      </Box>
                    );
                  })}
              </Box>
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
} 