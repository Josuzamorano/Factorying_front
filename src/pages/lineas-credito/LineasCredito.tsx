import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Typography,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  CreditScore as LineaIcon,
  Assessment as ConsultaIcon,
  Approval as AprobacionIcon,
  Category as ProductoIcon,
  Person as DeudorIcon,
  TrendingUp as EndeudamientoIcon,
  Warning as VencidasIcon,
  Schedule as PorVencerIcon,
} from '@mui/icons-material';

interface MenuOption {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const menuOptions: MenuOption[] = [
  {
    title: 'Líneas de Crédito',
    description: 'Gestión de líneas de crédito por cliente',
    icon: <LineaIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/gestion',
    color: '#1976d2',
  },
  {
    title: 'Consulta Endeudamiento',
    description: 'Consulta de endeudamiento del cliente',
    icon: <EndeudamientoIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/endeudamiento',
    color: '#2e7d32',
  },
  {
    title: 'Aprobación Líneas',
    description: 'Aprobar o rechazar solicitudes de línea',
    icon: <AprobacionIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/aprobacion',
    color: '#ed6c02',
  },
  {
    title: 'Sublínea Producto',
    description: 'Gestión de sublíneas por tipo de producto',
    icon: <ProductoIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/sublinea-producto',
    color: '#9c27b0',
  },
  {
    title: 'Sublínea Deudor',
    description: 'Gestión de sublíneas por deudor',
    icon: <DeudorIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/sublinea-deudor',
    color: '#0288d1',
  },
  {
    title: 'Líneas Por Vencer',
    description: 'Líneas próximas a vencer',
    icon: <PorVencerIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/por-vencer',
    color: '#f57c00',
  },
  {
    title: 'Líneas Vencidas',
    description: 'Líneas con vencimiento cumplido',
    icon: <VencidasIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/vencidas',
    color: '#d32f2f',
  },
  {
    title: 'Informe Líneas',
    description: 'Reportes y consultas de líneas',
    icon: <ConsultaIcon sx={{ fontSize: 48 }} />,
    path: '/lineas-credito/informe',
    color: '#7b1fa2',
  },
];

const LineasCredito: React.FC = () => {
  const navigate = useNavigate();

  return (
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
        <Typography color="text.primary">Líneas de Crédito</Typography>
      </Breadcrumbs>

      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Módulo de Líneas de Crédito
      </Typography>

      <Grid container spacing={3}>
        {menuOptions.map((option) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={option.title}>
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
                onClick={() => navigate(option.path)}
                sx={{ height: '100%' }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    py: 3,
                  }}
                >
                  <Box sx={{ color: option.color, mb: 2 }}>{option.icon}</Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LineasCredito;
