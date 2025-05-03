import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  IconButton, 
  TextField, 
  Checkbox, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Chip,
  FormControlLabel,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon,
  AccessTime as TimeIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAppContext, Task } from '../../context/AppContext';

export default function TaskList() {
  const { tasks, addTask, updateTask, deleteTask, completeTask } = useAppContext();
  
  // State for filtering and tabs
  const [tabValue, setTabValue] = useState(0);
  const [filter, setFilter] = useState("all");
  
  // State for add/edit task dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Work',
    estimatedTime: 25,
    completed: false,
    actualTime: 0,
  });
  
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
  
  // Filter tasks based on completion status
  const filteredTasks = tasks.filter(task => {
    if (tabValue === 0) return !task.completed; // Active tasks
    if (tabValue === 1) return task.completed; // Completed tasks
    return true; // All tasks
  }).filter(task => {
    if (filter === "all") return true;
    return task.category === filter;
  });
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilter(event.target.value);
  };
  
  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setNewTask({
        title: task.title,
        description: task.description,
        category: task.category,
        estimatedTime: task.estimatedTime,
        completed: task.completed,
        actualTime: task.actualTime
      });
    } else {
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        category: 'Work',
        estimatedTime: 25,
        completed: false,
        actualTime: 0
      });
    }
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };
  
  const handleSaveTask = () => {
    if (editingTask) {
      // Update existing task
      updateTask(editingTask.id, newTask);
    } else {
      // Add new task with required fields for Task type
      addTask(newTask);
    }
    setIsDialogOpen(false);
  };
  
  const handleTaskComplete = (id: string, completed: boolean) => {
    if (completed) {
      completeTask(id);
    } else {
      updateTask(id, { completed: false });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Tasks
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Task
        </Button>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ width: 250 }} variant="outlined" size="small">
            <InputLabel id="category-filter-label">Filter by Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={filter}
              onChange={handleFilterChange}
              label="Filter by Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Active (${tasks.filter(t => !t.completed).length})`} />
          <Tab label={`Completed (${tasks.filter(t => t.completed).length})`} />
          <Tab label="All" />
        </Tabs>
      </Box>
      
      <Box>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <Card 
              key={task.id} 
              variant="outlined" 
              sx={{ 
                mb: 2, 
                borderRadius: 2, 
                borderColor: task.completed ? 'success.light' : undefined, 
                bgcolor: task.completed ? 'rgba(76, 175, 80, 0.04)' : undefined
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={task.completed} 
                        onChange={(e) => handleTaskComplete(task.id, e.target.checked)} 
                      />
                    }
                    label=""
                    sx={{ mr: 0 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
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
                      {task.actualTime > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          • Spent: {task.actualTime} min
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!task.completed && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayIcon />}
                        component={Link}
                        to={`/focus?taskId=${task.id}`}
                        sx={{ borderRadius: 1.5 }}
                      >
                        Focus
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(task)}
                      aria-label="edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => deleteTask(task.id)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {tabValue === 0 
                ? "You haven't created any active tasks yet." 
                : tabValue === 1 
                  ? "You haven't completed any tasks yet." 
                  : "You haven't created any tasks yet."}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Your First Task
            </Button>
          </Box>
        )}
      </Box>
      
      {/* Add/Edit Task Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
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
            {editingTask ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 