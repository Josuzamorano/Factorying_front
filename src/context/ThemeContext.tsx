import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, useMediaQuery } from '@mui/material';
import { createAppTheme, ThemeMode } from '../theme';

// Constantes
const STORAGE_KEY = 'factoring-theme-preferences';

interface ThemePreferences {
  mode: ThemeMode;
  primaryColor?: string;
  secondaryColor?: string;
}

interface ThemeContextType {
  // Estado actual
  mode: ThemeMode;
  primaryColor?: string;
  secondaryColor?: string;
  // Acciones para el modo
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  // Acciones para colores (branding)
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
  // Reset
  resetToDefaults: () => void;
  // Helpers
  isDarkMode: boolean;
}

const defaultPreferences: ThemePreferences = {
  mode: 'light',
  primaryColor: undefined,
  secondaryColor: undefined,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Función para leer preferencias de localStorage
const getStoredPreferences = (): ThemePreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Error reading theme preferences:', error);
  }
  return defaultPreferences;
};

// Función para guardar preferencias en localStorage
const savePreferences = (prefs: ThemePreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Error saving theme preferences:', error);
  }
};

interface ThemeProviderProps {
  children: ReactNode;
  // Colores de branding global (configurados por admin)
  brandingPrimaryColor?: string;
  brandingSecondaryColor?: string;
}

export const ThemeContextProvider: React.FC<ThemeProviderProps> = ({
  children,
  brandingPrimaryColor,
  brandingSecondaryColor,
}) => {
  // Detectar preferencia del sistema
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Estado de preferencias
  const [preferences, setPreferences] = useState<ThemePreferences>(() => {
    const stored = getStoredPreferences();
    // Si no hay preferencia guardada, usar la del sistema
    if (!localStorage.getItem(STORAGE_KEY)) {
      return {
        ...stored,
        mode: prefersDarkMode ? 'dark' : 'light',
      };
    }
    return stored;
  });

  // Sincronizar con cambios del sistema (solo si el usuario no ha elegido manualmente)
  useEffect(() => {
    const hasStoredPreference = localStorage.getItem(STORAGE_KEY);
    if (!hasStoredPreference) {
      setPreferences(prev => ({
        ...prev,
        mode: prefersDarkMode ? 'dark' : 'light',
      }));
    }
  }, [prefersDarkMode]);

  // Guardar cambios en localStorage
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Acciones
  const toggleMode = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    setPreferences(prev => ({
      ...prev,
      mode,
    }));
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    setPreferences(prev => ({
      ...prev,
      primaryColor: color,
    }));
  }, []);

  const setSecondaryColor = useCallback((color: string) => {
    setPreferences(prev => ({
      ...prev,
      secondaryColor: color,
    }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setPreferences(defaultPreferences);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Crear tema memoizado
  const theme = useMemo(() => {
    return createAppTheme({
      mode: preferences.mode,
      // Priorizar colores de branding global sobre preferencias del usuario
      primaryColor: brandingPrimaryColor || preferences.primaryColor,
      secondaryColor: brandingSecondaryColor || preferences.secondaryColor,
    });
  }, [
    preferences.mode,
    preferences.primaryColor,
    preferences.secondaryColor,
    brandingPrimaryColor,
    brandingSecondaryColor,
  ]);

  // Valor del contexto
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      mode: preferences.mode,
      primaryColor: brandingPrimaryColor || preferences.primaryColor,
      secondaryColor: brandingSecondaryColor || preferences.secondaryColor,
      toggleMode,
      setMode,
      setPrimaryColor,
      setSecondaryColor,
      resetToDefaults,
      isDarkMode: preferences.mode === 'dark',
    }),
    [
      preferences.mode,
      preferences.primaryColor,
      preferences.secondaryColor,
      brandingPrimaryColor,
      brandingSecondaryColor,
      toggleMode,
      setMode,
      setPrimaryColor,
      setSecondaryColor,
      resetToDefaults,
    ]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de tema
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
};

/**
 * Hook simplificado para toggle de tema
 */
export const useThemeMode = () => {
  const { mode, toggleMode, isDarkMode } = useThemeContext();
  return { mode, toggleMode, isDarkMode };
};

export default ThemeContextProvider;
