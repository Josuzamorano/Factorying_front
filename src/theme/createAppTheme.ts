import { createTheme, Theme, PaletteOptions } from '@mui/material';
import { lightPalette, darkPalette } from './palette';
import { typography } from './typography';
import { getComponentOverrides } from './components';

export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor?: string;
  secondaryColor?: string;
}

// Función para generar variantes de color (light/dark) a partir de un color base
const generateColorVariants = (baseColor: string) => {
  // Simplificado: ajusta la luminosidad para light/dark
  // En producción se podría usar una librería como chroma-js
  return {
    main: baseColor,
    light: baseColor, // Se podría calcular dinámicamente
    dark: baseColor,  // Se podría calcular dinámicamente
    contrastText: '#ffffff',
  };
};

// Función para mezclar paletas con colores personalizados
const createCustomPalette = (
  basePalette: PaletteOptions,
  primaryColor?: string,
  secondaryColor?: string
): PaletteOptions => {
  const customPalette = { ...basePalette };

  if (primaryColor) {
    customPalette.primary = generateColorVariants(primaryColor);
  }

  if (secondaryColor) {
    customPalette.secondary = generateColorVariants(secondaryColor);
  }

  return customPalette;
};

/**
 * Crea un tema MUI personalizado basado en la configuración proporcionada
 */
export const createAppTheme = (config: ThemeConfig): Theme => {
  const { mode, primaryColor, secondaryColor } = config;

  // Seleccionar paleta base según el modo
  const basePalette = mode === 'dark' ? darkPalette : lightPalette;

  // Aplicar colores personalizados si se proporcionan
  const palette = createCustomPalette(basePalette, primaryColor, secondaryColor);

  // Crear y retornar el tema
  return createTheme({
    palette,
    typography,
    components: getComponentOverrides(mode),
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  });
};

// Temas predefinidos para acceso rápido
export const lightTheme = createAppTheme({ mode: 'light' });
export const darkTheme = createAppTheme({ mode: 'dark' });
