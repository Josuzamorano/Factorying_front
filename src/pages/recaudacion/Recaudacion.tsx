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
  Phone,
  People,
  Assignment,
  Assessment,
  AccountBalance,
  LocalAtm,
  Mail,
  Schedule,
} from '@mui/icons-material';

/**
 * Página de Recaudación/Gestión de Cobranza - Migrada de F_GC1000.frm (VB6)
 * Menú principal del módulo de Recaudación
 */

interface RecaudacionOption {
  id: string;
  nombre: string;
  descripcion: string;
  icono: React.ReactElement;
  ruta: string;
  color: string;
}

const opciones: RecaudacionOption[] = [
  {
    id: 'gestion',
    nombre: 'Gestión Telefónica',
    descripcion: 'Gestión de cobranza telefónica',
    icono: <Phone sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/gestion',
    color: '#1976d2',
  },
  {
    id: 'cobradores',
    nombre: 'Cobradores',
    descripcion: 'Mantenimiento de cobradores',
    icono: <People sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/cobradores',
    color: '#388e3c',
  },
  {
    id: 'asignacion',
    nombre: 'Asignación Cobradores',
    descripcion: 'Asignar clientes a cobradores',
    icono: <Assignment sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/asignacion',
    color: '#f57c00',
  },
  {
    id: 'estados',
    nombre: 'Estados Cobranza',
    descripcion: 'Reporte de estados de cobranza',
    icono: <Assessment sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/estados',
    color: '#7b1fa2',
  },
  {
    id: 'deuda-total',
    nombre: 'Deuda Total Cliente',
    descripcion: 'Cálculo de deuda total por cliente',
    icono: <AccountBalance sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/deuda-total',
    color: '#c62828',
  },
  {
    id: 'cobranza-diaria',
    nombre: 'Cobranza Diaria',
    descripcion: 'Reporte de cobranza del día',
    icono: <LocalAtm sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/cobranza-diaria',
    color: '#00695c',
  },
  {
    id: 'cartas',
    nombre: 'Cartas Notificación',
    descripcion: 'Emisión de cartas de cobro',
    icono: <Mail sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/cartas',
    color: '#5d4037',
  },
  {
    id: 'agenda',
    nombre: 'Agenda Gestión',
    descripcion: 'Gestiones programadas',
    icono: <Schedule sx={{ fontSize: 40 }} />,
    ruta: '/recaudacion/agenda',
    color: '#455a64',
  },
];

const Recaudacion: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/principal')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Recaudación / Gestión de Cobranza
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/principal');
            }}
          >
            Inicio
          </Link>
          <Typography color="text.primary">Recaudación</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom sx={{ mb: 4, color: '#1976d2' }}>
          Módulo de Recaudación
        </Typography>

        <Grid container spacing={3}>
          {opciones.map((opcion) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={opcion.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(opcion.ruta)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box
                    sx={{
                      bgcolor: opcion.color,
                      p: 3,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 70,
                        height: 70,
                      }}
                    >
                      {React.cloneElement(opcion.icono as React.ReactElement<{ sx?: object }>, { sx: { fontSize: 40, color: 'white' } })}
                    </Avatar>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {opcion.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {opcion.descripcion}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Recaudacion;
