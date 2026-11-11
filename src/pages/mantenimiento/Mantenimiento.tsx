import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Container,
  Avatar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  ArrowBack,
  AccountBalance,
  LocationCity,
  Business,
  Settings,
  Group,
  PersonAdd,
  Tune,
  Category,
  AttachMoney,
} from '@mui/icons-material';

/**
 * Página de Mantenimiento - Migrada de F_MA1000.frm (VB6)
 * Menú principal del módulo de Mantención/Maestros
 */

interface MantenimientoOption {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactElement;
  ruta: string;
  color: string;
}

const opciones: MantenimientoOption[] = [
  {
    id: 'parametros',
    nombre: 'Parámetros',
    descripcion: 'Parámetros generales del sistema',
    icono: <Tune sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/parametros',
    color: '#1976d2',
  },
  {
    id: 'bancos',
    nombre: 'Bancos',
    descripcion: 'Mantenedor de bancos',
    icono: <AccountBalance sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/bancos',
    color: '#388e3c',
  },
  {
    id: 'plazas',
    nombre: 'Plazas',
    descripcion: 'Mantenedor de plazas bancarias',
    icono: <LocationCity sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/plazas',
    color: '#f57c00',
  },
  {
    id: 'sucursales',
    nombre: 'Sucursales',
    descripcion: 'Sucursales de la empresa',
    icono: <Business sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/sucursales',
    color: '#7b1fa2',
  },
  {
    id: 'ejecutivos',
    nombre: 'Ejecutivos',
    descripcion: 'Mantenedor de ejecutivos',
    icono: <PersonAdd sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/ejecutivos',
    color: '#c2185b',
  },
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    descripcion: 'Administración de usuarios',
    icono: <Group sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/usuarios',
    color: '#00796b',
  },
  {
    id: 'perfiles',
    nombre: 'Perfiles',
    descripcion: 'Perfiles y permisos',
    icono: <Settings sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/perfiles',
    color: '#5d4037',
  },
  {
    id: 'comunas',
    nombre: 'Comunas',
    descripcion: 'Catálogo de comunas',
    icono: <Category sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/comunas',
    color: '#455a64',
  },
  {
    id: 'gastos',
    nombre: 'Gastos',
    descripcion: 'Tipos de gastos operacionales',
    icono: <AttachMoney sx={{ fontSize: 40 }} />,
    ruta: '/mantenimiento/gastos',
    color: '#e91e63',
  },
];

const Mantenimiento: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/principal')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mantenimiento
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: '#f5f5f5', px: 3, py: 1 }}>
        <Breadcrumbs>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/principal')}
          >
            Inicio
          </Link>
          <Typography color="text.primary">Mantenimiento</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Módulo de Mantención
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Administración de tablas maestras del sistema
        </Typography>

        <Grid container spacing={3}>
          {opciones.map((opcion) => (
            <Grid key={opcion.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(opcion.ruta)}
                  sx={{ height: '100%' }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      py: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 70,
                        height: 70,
                        bgcolor: opcion.color,
                        mb: 2,
                      }}
                    >
                      {opcion.icono}
                    </Avatar>
                    <Typography variant="h6" component="div" textAlign="center">
                      {opcion.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ mt: 1 }}
                    >
                      {opcion.descripcion}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2,
          px: 2,
          mt: 'auto',
          backgroundColor: '#f5f5f5',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Sistema de Factoring - Módulo de Mantención
        </Typography>
      </Box>
    </Box>
  );
};

export default Mantenimiento;
