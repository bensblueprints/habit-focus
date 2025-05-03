import { useState, useEffect } from 'react';
import { Box } from '@mui/material';

// Collection of animated background URLs
const backgroundVideos = [
  'https://player.vimeo.com/external/303072660.sd.mp4?s=15b9b1f7b1d3f13f50f916eeedbba0c1503b3a4e&profile_id=164&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/321837978.sd.mp4?s=3fdc4e46a8fdc85be7823bf7d94f67e5c8eddd55&profile_id=164&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/323293687.sd.mp4?s=d3a398485db87dc58bab4068d203f7d98d95b4ca&profile_id=164&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/247695477.sd.mp4?s=9a26952d95b76a57c766a4b36aed9d88d9b0cf60&profile_id=164&oauth2_token_id=57447761',
  'https://player.vimeo.com/external/368763065.sd.mp4?s=13b81605a3bcde51d3c0906b8a9bc83c8359ab0e&profile_id=164&oauth2_token_id=57447761'
];

// Gradient backgrounds for different sections
const gradientBackgrounds = {
  default: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
  focus: 'linear-gradient(135deg, #FF6B6B 0%, #FF0000 100%)',
  tasks: 'linear-gradient(135deg, #6BFF9E 0%, #00FF66 100%)',
  habits: 'linear-gradient(135deg, #FFD86B 0%, #FFBB00 100%)',
  settings: 'linear-gradient(135deg, #9E6BFF 0%, #7700FF 100%)'
};

interface AnimatedBackgroundProps {
  section?: 'default' | 'focus' | 'tasks' | 'habits' | 'settings';
  useVideo?: boolean;
}

export default function AnimatedBackground({ section = 'default', useVideo = true }: AnimatedBackgroundProps) {
  const [videoUrl, setVideoUrl] = useState('');
  
  useEffect(() => {
    // Randomly select a video background
    if (useVideo) {
      const randomIndex = Math.floor(Math.random() * backgroundVideos.length);
      setVideoUrl(backgroundVideos[randomIndex]);
    }
  }, [useVideo]);

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
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradientBackgrounds[section],
          opacity: 0.8,
          zIndex: 1
        }
      }}
    >
      {useVideo && videoUrl && (
        <video
          autoPlay
          muted
          loop
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute'
          }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}
    </Box>
  );
} 