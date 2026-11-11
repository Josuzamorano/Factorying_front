import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Divider,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout,
  Person,
  AccountCircle,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface AppHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

/**
 * Componente de header/AppBar reutilizable
 * Incluye toggle de tema, menú de usuario y navegación
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Sistema de Factoring',
  onMenuClick,
  showMenuButton = true,
}) => {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleGoHome = () => {
    handleMenuClose();
    navigate('/principal');
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <AppBar
      position="static"
      sx={{
        background: isDarkMode
          ? theme.palette.background.paper
          : `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        borderBottom: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none',
      }}
    >
      <Toolbar>
        {/* Botón de menú hamburguesa */}
        {showMenuButton && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
            aria-label="abrir menú"
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Título */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: isMobile ? '1rem' : '1.25rem',
          }}
        >
          {title}
        </Typography>

        {/* Acciones de la derecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Toggle de tema */}
          <ThemeToggle size={isMobile ? 'small' : 'medium'} />

          {/* Nombre de usuario (solo en desktop) */}
          {!isMobile && (
            <Typography variant="body2" sx={{ mr: 1 }}>
              {usuario?.nombre || usuario?.login || 'Usuario'}
            </Typography>
          )}

          {/* Botón de menú de usuario */}
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
            aria-label="menú de usuario"
          >
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Menú desplegable de usuario */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: { minWidth: 200 },
          },
        }}
      >
        {/* Información del usuario */}
        <MenuItem disabled>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {usuario?.nombre || 'Usuario'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {usuario?.login}
            </Typography>
          </Box>
        </MenuItem>
        <Divider />

        {/* Ir al inicio */}
        <MenuItem onClick={handleGoHome}>
          <ListItemIcon>
            <Home fontSize="small" />
          </ListItemIcon>
          Menú Principal
        </MenuItem>

        {/* Cerrar sesión */}
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Cerrar Sesión
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default AppHeader;
