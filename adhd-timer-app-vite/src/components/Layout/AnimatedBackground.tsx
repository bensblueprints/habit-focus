import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../context/ThemeContext';

// Motion components
const MotionBox = motion(Box);

const AnimatedBackground = () => {
  const { currentTheme } = useThemeContext();
  const [particles, setParticles] = useState<Array<any>>([]);
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate particles based on current theme
  useEffect(() => {
    const particleCount = 15; // Number of particles to generate
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        size: Math.random() * 100 + 50,
        duration: Math.random() * 20 + 10,
        color: i % 2 === 0 ? currentTheme.gradientStart : currentTheme.gradientEnd
      });
    }

    setParticles(newParticles);
  }, [currentTheme, windowSize]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${currentTheme.gradientStart}05, ${currentTheme.gradientEnd}08)`,
      }}
    >
      {particles.map((particle) => (
        <MotionBox
          key={particle.id}
          sx={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${particle.color}30 0%, transparent 70%)`,
            filter: 'blur(8px)',
          }}
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0.4,
          }}
          animate={{
            x: [particle.x, particle.x + Math.random() * 100 - 50],
            y: [particle.y, particle.y + Math.random() * 100 - 50],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedBackground; 