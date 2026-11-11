import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Avatar,
  useTheme,
} from '@mui/material';
import {
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
import { MainLayout } from '../../components/layout';

/**
 * Página Principal - Sistema de Factoring
 * Menú moderno con rutas estáticas de React Router
 */

interface ModuleCard {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactElement;
  ruta: string;
  color: string;
  colorDark: string;
}

// Módulos del sistema con rutas de React Router
const modulosSistema: ModuleCard[] = [
  {
    id: 'clientes',
    nombre: 'Clientes',
    descripcion: 'Gestión de clientes',
    icono: <AccountCircle sx={{ fontSize: 48 }} />,
    ruta: '/clientes',
    color: '#1976d2',
    colorDark: '#42a5f5',
  },
  {
    id: 'deudores',
    nombre: 'Deudores',
    descripcion: 'Gestión de deudores',
    icono: <Person sx={{ fontSize: 48 }} />,
    ruta: '/deudores',
    color: '#0288d1',
    colorDark: '#29b6f6',
  },
  {
    id: 'operaciones',
    nombre: 'Operaciones',
    descripcion: 'Gestión de operaciones',
    icono: <BusinessCenter sx={{ fontSize: 48 }} />,
    ruta: '/operaciones',
    color: '#388e3c',
    colorDark: '#66bb6a',
  },
  {
    id: 'cobranza',
    nombre: 'Cobranza',
    descripcion: 'Gestión de cobranzas',
    icono: <AttachMoney sx={{ fontSize: 48 }} />,
    ruta: '/cobranza',
    color: '#f57c00',
    colorDark: '#ffa726',
  },
  {
    id: 'recaudacion',
    nombre: 'Recaudación',
    descripcion: 'Control de recaudación',
    icono: <Receipt sx={{ fontSize: 48 }} />,
    ruta: '/recaudacion',
    color: '#7b1fa2',
    colorDark: '#ab47bc',
  },
  {
    id: 'tesoreria',
    nombre: 'Tesorería',
    descripcion: 'Control de tesorería',
    icono: <AccountBalance sx={{ fontSize: 48 }} />,
    ruta: '/tesoreria',
    color: '#c2185b',
    colorDark: '#ec407a',
  },
  {
    id: 'comercial',
    nombre: 'Comercial',
    descripcion: 'Gestión comercial',
    icono: <Storefront sx={{ fontSize: 48 }} />,
    ruta: '/comercial',
    color: '#00796b',
    colorDark: '#26a69a',
  },
  {
    id: 'lineas-credito',
    nombre: 'Líneas de Crédito',
    descripcion: 'Gestión de líneas',
    icono: <CreditCard sx={{ fontSize: 48 }} />,
    ruta: '/lineas-credito',
    color: '#5d4037',
    colorDark: '#8d6e63',
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas',
    descripcion: 'Tasas y simulador',
    icono: <TrendingUp sx={{ fontSize: 48 }} />,
    ruta: '/finanzas',
    color: '#1565c0',
    colorDark: '#42a5f5',
  },
  {
    id: 'informes',
    nombre: 'Informes',
    descripcion: 'Reportes del sistema',
    icono: <Assessment sx={{ fontSize: 48 }} />,
    ruta: '/informes',
    color: '#2e7d32',
    colorDark: '#66bb6a',
  },
  {
    id: 'legal',
    nombre: 'Legal',
    descripcion: 'Pagarés y contratos',
    icono: <Gavel sx={{ fontSize: 48 }} />,
    ruta: '/legal',
    color: '#455a64',
    colorDark: '#78909c',
  },
  {
    id: 'mantenimiento',
    nombre: 'Mantenimiento',
    descripcion: 'Configuración del sistema',
    icono: <Settings sx={{ fontSize: 48 }} />,
    ruta: '/mantenimiento',
    color: '#37474f',
    colorDark: '#78909c',
  },
];

const Principal: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  /**
   * Navegar a un módulo
   */
  const handleModuleClick = (ruta: string) => {
    navigate(ruta);
  };

  return (
    <MainLayout title="Sistema de Factoring">
      <Box sx={{ py: 2 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            mb: 4,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          Menú Principal
        </Typography>

        <Grid container spacing={3}>
          {modulosSistema.map((modulo) => (
            <Grid key={modulo.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleModuleClick(modulo.ruta)}
                  sx={{ height: '100%' }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 4,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: isDarkMode ? modulo.colorDark : modulo.color,
                        mb: 2,
                        transition: 'background-color 0.3s ease',
                      }}
                    >
                      {modulo.icono}
                    </Avatar>
                    <Typography variant="h6" component="div" textAlign="center">
                      {modulo.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                    >
                      {modulo.descripcion}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </MainLayout>
  );
};

export default Principal;
