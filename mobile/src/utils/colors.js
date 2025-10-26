/**\n * @file colors.js - Paleta de colores de la aplicación\n * @description Define colores, gradientes y temas para diseño consistente\n */\n\n/**\n * Paleta de colores principal organizada por categorías\n */\nexport const colors = {
  forest: {
    dark: '#1B4332',
    medium: '#2D6A4F',
    light: '#95D5B2',
  },
  
  ocean: {
    dark: '#014F86',
    medium: '#2A9D8F',
    light: '#A9D6E5',
  },
  
  neutral: {
    backgroundLight: '#F5F8F6',
    backgroundDark: '#0B1D1B',
    textLight: '#1C1C1C',
    textDark: '#E8F0EE',
    muted: '#A0B1AD',
    border: '#DDE5E2',
  },
  
  status: {
    success: '#2D6A4F',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2A9D8F',
  },
  
  gradients: {
    primary: ['#2D6A4F', '#2A9D8F'],
    secondary: ['#1B4332', '#014F86'],
    accent: ['#95D5B2', '#A9D6E5'],
  }
};

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
