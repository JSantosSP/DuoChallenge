// Forest and Ocean Color Palette
// Inspired by natural tones for a romantic, elegant feel

export const colors = {
  // Primary colors (for "her" elements or warm accents)
  forest: {
    dark: '#1B4332',      // Dark forest green
    medium: '#2D6A4F',   // Medium moss green
    light: '#95D5B2',    // Soft green accent
  },
  
  // Secondary colors (for "his" elements or cool zones)
  ocean: {
    dark: '#014F86',      // Deep ocean blue
    medium: '#2A9D8F',    // Medium turquoise
    light: '#A9D6E5',     // Light blue accent
  },
  
  // Neutral colors
  neutral: {
    backgroundLight: '#F5F8F6',  // Light background
    backgroundDark: '#0B1D1B',   // Dark background
    textLight: '#1C1C1C',        // Text for light mode
    textDark: '#E8F0EE',         // Text for dark mode
    muted: '#A0B1AD',            // Muted text
    border: '#DDE5E2',           // Soft borders
  },
  
  // Status colors
  status: {
    success: '#2D6A4F',    // Forest green for success
    warning: '#FF9800',    // Orange for warnings (keep existing)
    error: '#F44336',      // Red for errors (keep existing)
    info: '#2A9D8F',       // Turquoise for info
  },
  
  // Gradients
  gradients: {
    primary: ['#2D6A4F', '#2A9D8F'],      // Forest to turquoise
    secondary: ['#1B4332', '#014F86'],    // Dark forest to deep ocean
    accent: ['#95D5B2', '#A9D6E5'],      // Light green to light blue
  }
};

// Theme variants for different contexts
export const themes = {
  light: {
    background: colors.neutral.backgroundLight,
    text: colors.neutral.textLight,
    primary: colors.forest.medium,
    secondary: colors.ocean.medium,
    accent: colors.forest.light,
  },
  dark: {
    background: colors.neutral.backgroundDark,
    text: colors.neutral.textDark,
    primary: colors.forest.light,
    secondary: colors.ocean.light,
    accent: colors.ocean.medium,
  }
};

export default colors;
