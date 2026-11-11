import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../../context/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  color?: 'inherit' | 'default' | 'primary' | 'secondary';
}

/**
 * Botón para alternar entre tema claro y oscuro
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'medium',
  showTooltip = true,
  color = 'inherit',
}) => {
  const { isDarkMode, toggleMode } = useThemeMode();
  const theme = useTheme();

  const button = (
    <IconButton
      onClick={toggleMode}
      color={color}
      size={size}
      aria-label={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      sx={{
        transition: theme.transitions.create(['transform', 'color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          transform: 'rotate(12deg)',
        },
      }}
    >
      {isDarkMode ? (
        <LightModeIcon
          fontSize={size}
          sx={{
            color: color === 'inherit' ? 'inherit' : theme.palette.warning.light,
          }}
        />
      ) : (
        <DarkModeIcon
          fontSize={size}
          sx={{
            color: color === 'inherit' ? 'inherit' : theme.palette.primary.main,
          }}
        />
      )}
    </IconButton>
  );

  if (showTooltip) {
    return (
      <Tooltip title={isDarkMode ? 'Modo claro' : 'Modo oscuro'} arrow>
        {button}
      </Tooltip>
    );
  }

  return button;
};

export default ThemeToggle;
