// Exportaciones del sistema de temas

// Paletas de colores
export { lightPalette, darkPalette, statusColors } from './palette';

// Tipografía
export { typography } from './typography';

// Componentes
export { getComponentOverrides } from './components';

// Transiciones y animaciones
export {
  durations,
  easings,
  transitions,
  createTransition
} from './transitions';

// Factory de temas
export {
  createAppTheme,
  lightTheme,
  darkTheme,
  type ThemeMode,
  type ThemeConfig,
} from './createAppTheme';
