import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createTheme, Theme } from '@mui/material';

// Define theme types
export type ThemeName = 
  | 'default' 
  | 'nebulaBlast' 
  | 'cosmiCrystal' 
  | 'vaporSynth' 
  | 'plasmaVortex' 
  | 'quantumFlux' 
  | 'psychedeliCore' 
  | 'stellarDream';

// Define the properties for each theme
export interface ThemeOption {
  name: ThemeName;
  displayName: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientStart: string;
  gradientEnd: string;
  backgroundImage?: string;
  theme: Theme;
}

// Create the actual themes
const createThemeOption = (
  name: ThemeName, 
  displayName: string, 
  description: string,
  primaryColor: string, 
  secondaryColor: string, 
  accentColor: string,
  gradientStart: string,
  gradientEnd: string,
  backgroundImage?: string,
): ThemeOption => {
  return {
    name,
    displayName,
    description,
    primaryColor,
    secondaryColor,
    accentColor,
    gradientStart,
    gradientEnd,
    backgroundImage,
    theme: createTheme({
      palette: {
        primary: {
          main: primaryColor,
        },
        secondary: {
          main: secondaryColor,
        },
        background: {
          default: '#f5f5f5',
          paper: 'rgba(255, 255, 255, 0.9)',
        },
      },
      typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      },
      shape: {
        borderRadius: 10,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
              '&:hover': {
                background: `linear-gradient(135deg, ${gradientEnd}, ${gradientStart})`,
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backdropFilter: 'blur(10px)',
              borderRadius: 16,
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
            },
          },
        },
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundImage: backgroundImage,
              backgroundSize: 'cover',
              backgroundAttachment: 'fixed',
              backgroundRepeat: 'no-repeat',
              transition: 'all 0.5s ease-in-out',
            },
          },
        },
      },
    }),
  };
};

// Define all 7 intergalactic themes with trippy colors
export const themeOptions: ThemeOption[] = [
  createThemeOption(
    'default',
    'Default',
    'The standard theme with a clean, modern look',
    '#1976d2',
    '#9c27b0',
    '#ff9800',
    '#1976d2',
    '#9c27b0',
  ),
  createThemeOption(
    'nebulaBlast',
    'Nebula Blast',
    'Cosmic purples and pinks inspired by deep space nebulae',
    '#9333ea',
    '#ec4899',
    '#f97316',
    '#9333ea',
    '#ec4899',
    'linear-gradient(45deg, #9333ea, #ec4899, #6b21a8)',
  ),
  createThemeOption(
    'cosmiCrystal',
    'Cosmi Crystal',
    'Iridescent blues and teals that shimmer like crystals in space',
    '#06b6d4',
    '#0ea5e9',
    '#8b5cf6',
    '#06b6d4',
    '#0ea5e9',
    'linear-gradient(135deg, #0ea5e9, #06b6d4, #0891b2)',
  ),
  createThemeOption(
    'vaporSynth',
    'Vapor Synth',
    'Retro-futuristic neons with pink and cyan hues',
    '#ec4899',
    '#3b82f6',
    '#34d399',
    '#ec4899',
    '#3b82f6',
    'linear-gradient(135deg, #ec4899, #3b82f6, #8b5cf6)',
  ),
  createThemeOption(
    'plasmaVortex',
    'Plasma Vortex',
    'Electric oranges and pulsing yellows swirling in dynamic patterns',
    '#f97316',
    '#facc15',
    '#ec4899',
    '#f97316',
    '#facc15',
    'linear-gradient(135deg, #f97316, #facc15, #f43f5e)',
  ),
  createThemeOption(
    'quantumFlux',
    'Quantum Flux',
    'Shifting greens and violets that represent quantum probability waves',
    '#8b5cf6',
    '#10b981',
    '#f97316',
    '#8b5cf6',
    '#10b981',
    'linear-gradient(135deg, #8b5cf6, #10b981, #6366f1)',
  ),
  createThemeOption(
    'psychedeliCore',
    'Psychedeli Core',
    'Radiant rainbow colors that pulse and shift across the spectrum',
    '#f43f5e',
    '#8b5cf6',
    '#10b981',
    '#f43f5e',
    '#8b5cf6',
    'linear-gradient(135deg, #f43f5e, #8b5cf6, #10b981, #f97316)',
  ),
  createThemeOption(
    'stellarDream',
    'Stellar Dream',
    'Deep blues and shimmering golds like a starry night sky',
    '#1e40af',
    '#fbbf24',
    '#ec4899',
    '#1e40af',
    '#fbbf24',
    'linear-gradient(135deg, #1e40af, #3b82f6, #1e3a8a)',
  ),
];

// Theme context type
interface ThemeContextType {
  currentTheme: ThemeOption;
  setTheme: (themeName: ThemeName) => void;
  themeOptions: ThemeOption[];
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Get saved theme from localStorage or default to 'default'
  const [currentTheme, setCurrentTheme] = useState<ThemeOption>(
    themeOptions.find(t => t.name === 'default') || themeOptions[0]
  );

  // Load saved theme on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      const foundTheme = themeOptions.find(t => t.name === savedTheme);
      if (foundTheme) {
        setCurrentTheme(foundTheme);
      }
    }
  }, []);

  // Function to set theme and save to localStorage
  const setTheme = (themeName: ThemeName) => {
    const newTheme = themeOptions.find(t => t.name === themeName);
    if (newTheme) {
      setCurrentTheme(newTheme);
      localStorage.setItem('theme', themeName);
      
      // Apply CSS variables to the document root for global access
      document.documentElement.style.setProperty('--primary-color', newTheme.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', newTheme.secondaryColor);
      document.documentElement.style.setProperty('--accent-color', newTheme.accentColor);
      document.documentElement.style.setProperty('--gradient-start', newTheme.gradientStart);
      document.documentElement.style.setProperty('--gradient-end', newTheme.gradientEnd);
      
      // Apply background image
      if (newTheme.backgroundImage) {
        document.body.style.background = newTheme.backgroundImage;
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeOptions }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
} 