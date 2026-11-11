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
  Payment,
  AccountBalanceWallet,
  Receipt,
  Assessment,
  TrendingUp,
  MoneyOff,
} from '@mui/icons-material';

/**
 * Página de Tesorería - Migrada de F_TS1000.frm (VB6)
 * Menú principal del módulo de Tesorería
 */

interface TesoreriaOption {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactElement;
  ruta: string;
  color: string;
}

const opciones: TesoreriaOption[] = [
  {
    id: 'movimientos',
    nombre: 'Movimientos',
    descripcion: 'Pizarra de movimientos diarios',
    icono: <TrendingUp sx={{ fontSize: 40 }} />,
    ruta: '/tesoreria/movimientos',
    color: '#1976d2',
  },
  {
    id: 'giros',
    nombre: 'Giros',
    descripcion: 'Emisión y consulta de giros',
    icono: <Payment sx={{ fontSize: 40 }} />,
    ruta: '/tesoreria/giros',
    color: '#388e3c',
  },
  {
    id: 'pagos',
    nombre: 'Pagos',
    descripcion: 'Registro de pagos a clientes',
    icono: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
    ruta: '/tesoreria/pagos',
    color: '#f57c00',
  },
  {
    id: 'arqueo',
    nombre: 'Arqueo',
    descripcion: 'Informe de arqueo de caja',
    icono: <Assessment sx={{ fontSize: 40 }} />,
    ruta: '/tesoreria/arqueo',
    color: '#7b1fa2',
  },
  {
    id: 'colilla',
    nombre: 'Colilla Depósito',
    descripcion: 'Colillas de depósito bancario',
    icono: <Receipt sx={{ fontSize: 40 }} />,
    ruta: '/tesoreria/colilla',
    color: '#c2185b',
  },
  {
    id: 'protestos',
    nombre: 'Protestos',
    descripcion: 'Gestión de documentos protestados',
    icono: <MoneyOff sx={{ fontSize: 40 }} />,
    ruta: '/tesoreria/protestos',
    color: '#d32f2f',
  },
];

const Tesoreria: React.FC = () => {
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
            Tesorería
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
          <Typography color="text.primary">Tesorería</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Módulo de Tesorería
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Gestión de giros, pagos y movimientos financieros
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
          Sistema de Factoring - Módulo de Tesorería
        </Typography>
      </Box>
    </Box>
  );
};

export default Tesoreria;
