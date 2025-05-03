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
  Celebration as CelebrationIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useThemeContext } from '../../context/ThemeContext';
import AnimatedBackground from './AnimatedBackground';
import BrainDumpDialog from './BrainDumpDialog';
import { motion } from 'framer-motion';

const drawerWidth = 260;

const MotionListItem = motion(ListItem);
const MotionIconButton = motion(IconButton);
const MotionBadge = motion(Badge);

export default function AppLayout() {
  const theme = useTheme();
  const location = useLocation();
  const { points, achievements } = useAppContext();
  const { currentTheme } = useThemeContext();
  
  const [open, setOpen] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBrainDump, setShowBrainDump] = useState(false);

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
      <AnimatedBackground />
      
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
              background: `linear-gradient(45deg, ${currentTheme.gradientStart}, ${currentTheme.gradientEnd})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            FocusFlow
          </Typography>
          
          {/* Brain Dump Button */}
          <MotionIconButton
            color="warning"
            onClick={() => setShowBrainDump(true)}
            sx={{ 
              mr: 2,
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              border: '2px solid rgba(255, 152, 0, 0.3)',
              '&:hover': {
                bgcolor: 'rgba(255, 152, 0, 0.2)',
              }
            }}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -10, 10, -5, 5, 0],
              transition: { duration: 0.5 }
            }}
            whileTap={{ scale: 0.9 }}
          >
            <BrainIcon />
          </MotionIconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip 
              title={`You have ${points} points!`} 
              arrow
              TransitionComponent={Zoom}
            >
              <MotionBadge 
                badgeContent={achievements.length} 
                color="secondary"
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: currentTheme.primaryColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    border: '2px solid white'
                  }}
                >
                  {points}
                </Avatar>
              </MotionBadge>
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
              sx={{ 
                color: currentTheme.primaryColor,
                fontSize: 'large',
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
                background: `linear-gradient(45deg, ${currentTheme.gradientStart}, ${currentTheme.gradientEnd})`,
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
                    bgcolor: `${currentTheme.primaryColor}22`,
                    borderRight: `4px solid ${currentTheme.primaryColor}`,
                    '&:hover': {
                      bgcolor: `${currentTheme.primaryColor}33`,
                    }
                  },
                  '&:hover': {
                    bgcolor: `${currentTheme.primaryColor}11`,
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? currentTheme.primaryColor : 'text.secondary',
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
          {[...Array(10)].map((_, i) => (
            <CelebrationIcon
              key={i}
              sx={{
                color: i % 3 === 0 ? currentTheme.primaryColor : 
                       i % 3 === 1 ? currentTheme.secondaryColor : 
                       currentTheme.accentColor,
                position: 'absolute',
                fontSize: 30 + Math.random() * 20,
                animation: `fall ${2 + Math.random() * 2}s linear`,
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 100}px`,
                '@keyframes fall': {
                  '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: 1 },
                  '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 }
                }
              }}
            />
          ))}
        </Box>
      )}
      
      {/* Floating Brain Dump Button (always visible) */}
      <MotionIconButton
        color="warning"
        onClick={() => setShowBrainDump(true)}
        sx={{ 
          position: 'fixed',
          bottom: 30,
          right: 30,
          width: 65,
          height: 65,
          zIndex: 100,
          bgcolor: '#FF9800',
          color: 'white',
          boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
          '&:hover': {
            bgcolor: '#F57C00',
          }
        }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 6px 20px rgba(255, 152, 0, 0.6)'
        }}
        whileTap={{ scale: 0.9 }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <BrainIcon sx={{ fontSize: 30 }} />
      </MotionIconButton>
      
      {/* Brain Dump Dialog */}
      <BrainDumpDialog 
        open={showBrainDump} 
        onClose={() => setShowBrainDump(false)} 
      />
    </Box>
  );
} 