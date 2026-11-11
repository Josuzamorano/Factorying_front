import { PaletteOptions } from '@mui/material';

// Colores base del sistema - Light Mode
export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#1e3c72',
    light: '#2a5298',
    dark: '#152a4f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f57c00',
    light: '#ff9d3f',
    dark: '#c25e00',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
  },
};

// Colores base del sistema - Dark Mode
export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#5c7cba',
    light: '#8aa8e5',
    dark: '#3d5a8f',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#ffb74d',
    light: '#ffe97d',
    dark: '#c88719',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
  },
  success: {
    main: '#66bb6a',
    light: '#81c784',
    dark: '#388e3c',
  },
};

// Colores semánticos para estados de documentos/operaciones
export const statusColors = {
  light: {
    activo: '#2e7d32',
    inactivo: '#9e9e9e',
    pendiente: '#ed6c02',
    aprobado: '#1976d2',
    rechazado: '#d32f2f',
    vencido: '#c62828',
    pagado: '#2e7d32',
    moroso: '#d32f2f',
    enProceso: '#0288d1',
  },
  dark: {
    activo: '#66bb6a',
    inactivo: '#bdbdbd',
    pendiente: '#ffa726',
    aprobado: '#42a5f5',
    rechazado: '#ef5350',
    vencido: '#e57373',
    pagado: '#66bb6a',
    moroso: '#ef5350',
    enProceso: '#29b6f6',
  },
};
