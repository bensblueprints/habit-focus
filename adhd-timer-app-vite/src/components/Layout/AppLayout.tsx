import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  useTheme,
  Tooltip,
  Badge,
  Avatar,
  Zoom
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  TaskAlt as TaskIcon,
  Timer as TimerIcon,
  Bolt as BoltIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import AnimatedBackground from './AnimatedBackground';
import { motion } from 'framer-motion';

const drawerWidth = 260;

const MotionListItem = motion(ListItem);
const MotionIconButton = motion(IconButton);

export default function AppLayout() {
  const theme = useTheme();
  const location = useLocation();
  const { points, achievements } = useAppContext();
  
  const [open, setOpen] = useState(true);
  const [currentSection, setCurrentSection] = useState<'default' | 'focus' | 'tasks' | 'habits' | 'settings'>('default');
  const [showConfetti, setShowConfetti] = useState(false);

  // Determine current section based on location
  useEffect(() => {
    if (location.pathname.includes('focus')) {
      setCurrentSection('focus');
    } else if (location.pathname.includes('tasks')) {
      setCurrentSection('tasks');
    } else if (location.pathname.includes('habits')) {
      setCurrentSection('habits');
    } else if (location.pathname.includes('settings')) {
      setCurrentSection('settings');
    } else {
      setCurrentSection('default');
    }
  }, [location]);

  // Show celebration animation when points increase
  useEffect(() => {
    if (points > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [points]);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { label: 'Tasks', icon: <TaskIcon />, path: '/tasks' },
    { label: 'Focus Timer', icon: <TimerIcon />, path: '/focus' },
    { label: 'Habit Tracker', icon: <BoltIcon />, path: '/habits' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Animated Background */}
      <AnimatedBackground section={currentSection} />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: open ? `${drawerWidth}px` : 0,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          color: 'black',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <MotionIconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{ mr: 2 }}
            whileHover={{ rotate: open ? -180 : 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </MotionIconButton>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FF6B6B, #6B73FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            FocusFlow
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip 
              title={`You have ${points} points!`} 
              arrow
              TransitionComponent={Zoom}
            >
              <Badge 
                badgeContent={achievements.length} 
                color="secondary"
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    border: '2px solid white'
                  }}
                >
                  {points}
                </Avatar>
              </Badge>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0,0,0,0.1)',
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: theme.spacing(2),
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoltIcon 
              color="primary" 
              fontSize="large" 
              sx={{ 
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.6, transform: 'scale(1)' },
                  '50%': { opacity: 1, transform: 'scale(1.1)' },
                  '100%': { opacity: 0.6, transform: 'scale(1)' }
                }
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FF6B6B, #6B73FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              FocusFlow
            </Typography>
          </Box>
          {open && (
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {menuItems.map((item, index) => (
            <MotionListItem 
              key={item.label} 
              disablePadding 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, x: 5 }}
            >
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  my: 0.5,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(25, 118, 210, 0.12)',
                    borderRight: '4px solid #1976d2',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.18)',
                    }
                  },
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  minWidth: 45 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === item.path ? 'bold' : 'medium' 
                  }}
                />
              </ListItemButton>
            </MotionListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Made with ❤️ for ADHD brains
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          marginTop: '64px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 2,
            '& > *': {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              p: 3,
              border: '1px solid rgba(255, 255, 255, 0.18)',
            }
          }}
        >
          <Outlet />
        </Container>
      </Box>
      
      {/* Celebration Effect */}
      {showConfetti && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <CelebrationIcon
            sx={{
              color: 'gold',
              position: 'absolute',
              fontSize: 40,
              animation: 'fall 3s linear',
              left: `${Math.random() * 100}%`,
              '@keyframes fall': {
                '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: 1 },
                '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
              }
            }}
          />
          <CelebrationIcon
            sx={{
              color: 'pink',
              position: 'absolute',
              fontSize: 40,
              animation: 'fall 2.5s linear',
              left: `${Math.random() * 100}%`,
              '@keyframes fall': {
                '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: 1 },
                '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
              }
            }}
          />
          <CelebrationIcon
            sx={{
              color: 'cyan',
              position: 'absolute',
              fontSize: 40,
              animation: 'fall 3.5s linear',
              left: `${Math.random() * 100}%`,
              '@keyframes fall': {
                '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: 1 },
                '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
} 