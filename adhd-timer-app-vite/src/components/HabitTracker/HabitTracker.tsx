import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
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
  Chip,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  FormControlLabel,
  Slider,
  InputAdornment,
  Stack
} from '@mui/material';
import { 
  Add as AddIcon, 
  Check as CheckIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  List as ListIcon,
  GridView as GridViewIcon,
  CalendarMonth as CalendarIcon,
  Close as CloseIcon,
  BoltOutlined as BoltIcon
} from '@mui/icons-material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Types
interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  startTime?: Date;
  endTime?: Date;
  color: string;
  difficulty: number;
  motivation: string;
  syncWithCalendar: boolean;
  streak: number;
  completedDates: string[];
}

// Color options for habits
const colorOptions = [
  "#3B82F6", // Blue
  "#22C55E", // Green
  "#F97316", // Orange
  "#EF4444", // Red
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#06B6D4"  // Cyan
];

// View options
type ViewMode = 'list' | 'grid' | 'calendar';

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [open, setOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  
  // New habit state
  const [newHabit, setNewHabit] = useState<Omit<Habit, 'id' | 'streak' | 'completedDates'>>({
    title: '',
    description: '',
    category: 'Health',
    frequency: 'Daily',
    startTime: undefined,
    endTime: undefined,
    color: colorOptions[0],
    difficulty: 3,
    motivation: '',
    syncWithCalendar: false
  });
  
  // Categories for habits
  const categories = [
    "Health", 
    "Productivity", 
    "Learning", 
    "Mindfulness",
    "Exercise", 
    "Reading", 
    "Social", 
    "Other"
  ];
  
  const handleViewChange = (_event: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };
  
  const handleOpenDialog = (habit?: Habit) => {
    if (habit) {
      setEditingHabit(habit);
      setNewHabit({
        title: habit.title,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        startTime: habit.startTime,
        endTime: habit.endTime,
        color: habit.color,
        difficulty: habit.difficulty,
        motivation: habit.motivation,
        syncWithCalendar: habit.syncWithCalendar
      });
    } else {
      setEditingHabit(null);
      setNewHabit({
        title: '',
        description: '',
        category: 'Health',
        frequency: 'Daily',
        startTime: undefined,
        endTime: undefined,
        color: colorOptions[0],
        difficulty: 3,
        motivation: '',
        syncWithCalendar: false
      });
    }
    setOpen(true);
  };
  
  const handleCloseDialog = () => {
    setOpen(false);
  };
  
  const handleSaveHabit = () => {
    if (editingHabit) {
      // Update existing habit
      setHabits(
        habits.map((h) =>
          h.id === editingHabit.id
            ? {
                ...h,
                ...newHabit,
              }
            : h
        )
      );
    } else {
      // Add new habit
      const habit: Habit = {
        ...newHabit,
        id: Date.now().toString(),
        streak: 0,
        completedDates: [],
      };
      setHabits([...habits, habit]);
    }
    setOpen(false);
  };
  
  const handleDeleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Habit Tracker
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            borderRadius: 6, 
            px: 3,
            py: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Add Habit
        </Button>
      </Box>
      
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Build consistent routines to achieve your goals
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" component="span">
            View:
          </Typography>
          
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewChange}
            aria-label="view mode"
            size="small"
            sx={{ 
              border: '1px solid #eee',
              borderRadius: 2,
              '& .MuiToggleButton-root': {
                border: 'none',
                px: 2
              }
            }}
          >
            <ToggleButton value="list" aria-label="list view">
              <ListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="category-filter-label">Category:</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="All Categories">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {habits.length > 0 ? (
        <Box>
          {/* Habits list will go here */}
          {habits.map((habit) => (
            <Card 
              key={habit.id} 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                borderLeft: `4px solid ${habit.color}`,
              }}
            >
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6">{habit.title}</Typography>
                  <Chip 
                    label={habit.category} 
                    size="small" 
                    sx={{ borderRadius: 1 }} 
                  />
                  <Typography variant="body2" color="text.secondary">
                    daily • {habit.streak} day streak
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton size="small" onClick={() => handleOpenDialog(habit)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteHabit(habit.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 10,
          textAlign: 'center'
        }}>
          <BoltIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No habits
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Get started by creating a new habit.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            New Habit
          </Button>
        </Box>
      )}
      
      {/* Add/Edit Habit Dialog */}
      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          {editingHabit ? 'Edit Habit' : 'Add New Habit'}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              required
              label="Habit Title"
              placeholder="e.g., Drink water, Meditate, Exercise..."
              fullWidth
              variant="outlined"
              value={newHabit.title}
              onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Description"
              placeholder="Why is this habit important to you?"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={newHabit.description}
              onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              sx={{ mb: 3 }}
            />
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newHabit.frequency}
                label="Frequency"
                onChange={(e) => setNewHabit({ 
                  ...newHabit, 
                  frequency: e.target.value as 'Daily' | 'Weekly' | 'Monthly'
                })}
              >
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TimePicker
                  label="Start Time"
                  value={newHabit.startTime}
                  onChange={(newValue) => setNewHabit({
                    ...newHabit,
                    startTime: newValue || undefined
                  })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      InputProps: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {newHabit.startTime && (
                              <IconButton
                                size="small"
                                onClick={() => setNewHabit({ ...newHabit, startTime: undefined })}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
                <TimePicker
                  label="End Time"
                  value={newHabit.endTime}
                  onChange={(newValue) => setNewHabit({
                    ...newHabit,
                    endTime: newValue || undefined
                  })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      InputProps: {
                        endAdornment: (
                          <InputAdornment position="end">
                            {newHabit.endTime && (
                              <IconButton
                                size="small"
                                onClick={() => setNewHabit({ ...newHabit, endTime: undefined })}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            )}
                          </InputAdornment>
                        )
                      }
                    }
                  }}
                />
              </Box>
            </LocalizationProvider>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={newHabit.category}
                label="Category"
                onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Typography variant="subtitle2" gutterBottom>Color</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              {colorOptions.map(color => (
                <IconButton 
                  key={color} 
                  sx={{ 
                    backgroundColor: color, 
                    width: 32, 
                    height: 32,
                    border: newHabit.color === color ? '2px solid #000' : 'none',
                    '&:hover': {
                      backgroundColor: color
                    }
                  }}
                  onClick={() => setNewHabit({ ...newHabit, color })}
                >
                  {newHabit.color === color && (
                    <CheckIcon sx={{ color: 'white', fontSize: 18 }} />
                  )}
                </IconButton>
              ))}
            </Stack>
            
            <Typography variant="subtitle2" gutterBottom>
              Difficulty (1-5)
            </Typography>
            <Slider
              value={newHabit.difficulty}
              onChange={(_e, value) => setNewHabit({ ...newHabit, difficulty: value as number })}
              step={1}
              marks
              min={1}
              max={5}
              valueLabelDisplay="auto"
              sx={{ mb: 3 }}
            />
            
            <TextField
              label="Motivation (Why is this important?)"
              placeholder="What will this habit help you achieve?"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={newHabit.motivation}
              onChange={(e) => setNewHabit({ ...newHabit, motivation: e.target.value })}
              sx={{ mb: 3 }}
            />
            
            <FormControlLabel
              control={
                <Checkbox 
                  checked={newHabit.syncWithCalendar}
                  onChange={(e) => setNewHabit({ ...newHabit, syncWithCalendar: e.target.checked })}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon fontSize="small" color="primary" />
                  <Typography variant="body2">Calendar Sync</Typography>
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveHabit} 
            variant="contained"
            disabled={!newHabit.title.trim()}
            sx={{ borderRadius: 1 }}
          >
            Add Habit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 