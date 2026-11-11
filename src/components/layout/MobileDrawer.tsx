import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Close,
  Home,
  AccountCircle,
  Person,
  BusinessCenter,
  AttachMoney,
  Receipt,
  AccountBalance,
  Storefront,
  CreditCard,
  TrendingUp,
  Assessment,
  Gavel,
  Settings,
} from '@mui/icons-material';

interface MenuItemData {
  id: string;
  nombre: string;
  icono: React.ReactElement;
  ruta: string;
}

// Módulos del sistema
const menuItems: MenuItemData[] = [
  { id: 'principal', nombre: 'Inicio', icono: <Home />, ruta: '/principal' },
  { id: 'clientes', nombre: 'Clientes', icono: <AccountCircle />, ruta: '/clientes' },
  { id: 'deudores', nombre: 'Deudores', icono: <Person />, ruta: '/deudores' },
  { id: 'operaciones', nombre: 'Operaciones', icono: <BusinessCenter />, ruta: '/operaciones' },
  { id: 'cobranza', nombre: 'Cobranza', icono: <AttachMoney />, ruta: '/cobranza' },
  { id: 'recaudacion', nombre: 'Recaudación', icono: <Receipt />, ruta: '/recaudacion' },
  { id: 'tesoreria', nombre: 'Tesorería', icono: <AccountBalance />, ruta: '/tesoreria' },
  { id: 'comercial', nombre: 'Comercial', icono: <Storefront />, ruta: '/comercial' },
  { id: 'lineas-credito', nombre: 'Líneas de Crédito', icono: <CreditCard />, ruta: '/lineas-credito' },
  { id: 'finanzas', nombre: 'Finanzas', icono: <TrendingUp />, ruta: '/finanzas' },
  { id: 'informes', nombre: 'Informes', icono: <Assessment />, ruta: '/informes' },
  { id: 'legal', nombre: 'Legal', icono: <Gavel />, ruta: '/legal' },
  { id: 'mantenimiento', nombre: 'Mantenimiento', icono: <Settings />, ruta: '/mantenimiento' },
];

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Drawer lateral para navegación en dispositivos móviles
 */
export const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleNavigate = (ruta: string) => {
    navigate(ruta);
    onClose();
  };

  const isActive = (ruta: string) => {
    if (ruta === '/principal') {
      return location.pathname === '/principal';
    }
    return location.pathname.startsWith(ruta);
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            backgroundColor: theme.palette.background.paper,
          },
        },
      }}
    >
      {/* Header del drawer */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          background: theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white',
          borderBottom: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
        }}
      >
        <Typography variant="h6" fontWeight={500}>
          Menú
        </Typography>
        <IconButton onClick={onClose} sx={{ color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <Divider />

      {/* Lista de navegación */}
      <List sx={{ pt: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.ruta);
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.ruta)}
                selected={active}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '15',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '25',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? theme.palette.primary.main : 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icono}
                </ListItemIcon>
                <ListItemText
                  primary={item.nombre}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 400,
                    color: active ? 'primary' : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer del drawer */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          Sistema de Factoring v2.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;
