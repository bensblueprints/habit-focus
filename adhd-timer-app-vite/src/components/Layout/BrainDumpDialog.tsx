import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as BrainIcon,
  AddTask as AddTaskIcon,
  Bolt as BoltIcon,
  CheckCircle as CheckCircleIcon,
  AlarmAdd as ReminderIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { useThemeContext } from '../../context/ThemeContext';

const MotionBox = motion(Box);

interface BrainDumpDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function BrainDumpDialog({ open, onClose }: BrainDumpDialogProps) {
  const theme = useTheme();
  const { addTask } = useAppContext();
  const { currentTheme } = useThemeContext();
  
  const [thought, setThought] = useState('');
  const [thoughType, setThoughtType] = useState('task');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [category, setCategory] = useState('');
  
  const handleSubmit = () => {
    if (!thought.trim()) return;
    
    // Different handling based on type
    if (thoughType === 'task') {
      // Add as a task
      addTask({
        title: thought,
        description: 'Created from Brain Dump',
        completed: false,
        category: category || 'Personal',
        estimatedTime: 25, // Default 25 min
        actualTime: 0,
      });
    } else if (thoughType === 'habit') {
      // Would add as a habit if we had that functionality
      console.log('Adding habit:', thought);
    } else if (thoughType === 'reminder') {
      // Would schedule a reminder
      console.log('Adding reminder:', thought);
    } else {
      // Just process the thought (archive it)
      console.log('Archiving thought:', thought);
    }
    
    // Show success message
    setShowSuccessMessage(true);
    
    // Reset form
    setTimeout(() => {
      setThought('');
      setThoughtType('task');
      setCategory('');
      setShowSuccessMessage(false);
      onClose();
    }, 1500);
  };
  
  const categories = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Social'];
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { 
          borderRadius: 3,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header with color from theme */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${currentTheme.gradientStart}, ${currentTheme.gradientEnd})`,
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BrainIcon sx={{ color: 'white', fontSize: 28 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            Brain Dump
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <DialogContent sx={{ pt: 3, pb: 1 }}>
        {!showSuccessMessage ? (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Get those thoughts out of your head! What's on your mind right now?
            </Typography>
            
            <TextField
              placeholder="Type whatever is distracting you..."
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              autoFocus
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              What would you like to do with this thought?
            </Typography>
            
            <RadioGroup
              value={thoughType}
              onChange={(e) => setThoughtType(e.target.value)}
              sx={{ mb: 2 }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FormControlLabel 
                    value="task" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddTaskIcon color="primary" />
                        <Typography>Convert to Task</Typography>
                      </Box>
                    }
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1,
                      pr: 2,
                      m: 0
                    }}
                  />
                </MotionBox>
                
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FormControlLabel 
                    value="habit" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BoltIcon color="secondary" />
                        <Typography>Convert to Habit</Typography>
                      </Box>
                    }
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1,
                      pr: 2,
                      m: 0
                    }}
                  />
                </MotionBox>
                
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FormControlLabel 
                    value="reminder" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReminderIcon color="warning" />
                        <Typography>Set Reminder</Typography>
                      </Box>
                    }
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1,
                      pr: 2,
                      m: 0
                    }}
                  />
                </MotionBox>
                
                <MotionBox
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FormControlLabel 
                    value="archive" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArchiveIcon color="action" />
                        <Typography>Just Archive It</Typography>
                      </Box>
                    }
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      p: 1,
                      pr: 2,
                      m: 0
                    }}
                  />
                </MotionBox>
              </Box>
            </RadioGroup>
            
            {thoughType === 'task' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Category:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categories.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      onClick={() => setCategory(cat)}
                      color={category === cat ? 'primary' : 'default'}
                      variant={category === cat ? 'filled' : 'outlined'}
                      sx={{ px: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </>
        ) : (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4
            }}
          >
            <MotionBox
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'success.main',
                  mb: 2
                }} 
              />
            </MotionBox>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              Thought captured successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Now you can focus without that distraction.
            </Typography>
          </MotionBox>
        )}
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handleSubmit}
          disabled={!thought.trim() || showSuccessMessage}
          sx={{ 
            borderRadius: 2, 
            px: 3,
            background: `linear-gradient(135deg, ${currentTheme.gradientStart}, ${currentTheme.gradientEnd})`,
          }}
        >
          Process Thought
        </Button>
      </DialogActions>
    </Dialog>
  );
} 