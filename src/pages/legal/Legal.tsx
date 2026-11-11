import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Description as PagareIcon,
  VerifiedUser as AvalIcon,
  Draw as FirmaIcon,
  Article as ContratoIcon,
  Dashboard as DashboardIcon,
  Gavel as LegalIcon
} from '@mui/icons-material';

// Importar componentes
import LegalDashboard from './LegalDashboard';
import Pagares from './Pagares';
import Avales from './Avales';
import Firmas from './Firmas';

interface MenuOption {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  color: string;
}

const menuOptions: MenuOption[] = [
  {
    title: 'Dashboard Legal',
    description: 'Resumen de pagarés, avales y firmas',
    icon: <DashboardIcon sx={{ fontSize: 48 }} />,
    path: '/legal/dashboard',
    color: '#1976d2'
  },
  {
    title: 'Gestión de Pagarés',
    description: 'Consulta, ingreso y emisión de pagarés',
    icon: <PagareIcon sx={{ fontSize: 48 }} />,
    path: '/legal/pagares',
    color: '#7b1fa2'
  },
  {
    title: 'Gestión de Avales',
    description: 'Consulta e ingreso de avales por cliente',
    icon: <AvalIcon sx={{ fontSize: 48 }} />,
    path: '/legal/avales',
    color: '#388e3c'
  },
  {
    title: 'Gestión de Firmas',
    description: 'Administración de firmas autorizadas',
    icon: <FirmaIcon sx={{ fontSize: 48 }} />,
    path: '/legal/firmas',
    color: '#f57c00'
  },
  {
    title: 'Contratos Marco',
    description: 'Contratos globales en pesos',
    icon: <ContratoIcon sx={{ fontSize: 48 }} />,
    path: '/legal/contratos',
    color: '#c2185b'
  }
];

const LegalMenu: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LegalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Módulo Legal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestión de pagarés, avales, firmas y contratos - Migrado de F_LE1000.frm
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {menuOptions.map((option) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={option.path}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardActionArea
                component={Link}
                to={option.path}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(option.color, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      color: option.color
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {option.title}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Estadísticas rápidas */}
      <Paper sx={{ mt: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Acceso Rápido - Alertas
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: alpha('#f44336', 0.1), textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                --
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pagarés vencidos
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: alpha('#ff9800', 0.1), textAlign: 'center', p: 2 }}>
              <Typography variant="h4" sx={{ color: '#ff9800' }} fontWeight="bold">
                --
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por vencer (30 días)
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: alpha('#4caf50', 0.1), textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                --
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pagarés vigentes
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: alpha('#2196f3', 0.1), textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                --
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avales activos
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

const Legal: React.FC = () => {
  const location = useLocation();
  
  // Si estamos en la ruta base, mostrar el menú
  if (location.pathname === '/legal') {
    return <LegalMenu />;
  }

  // Si no, mostrar las rutas hijas
  return (
    <Routes>
      <Route path="dashboard" element={<LegalDashboard />} />
      <Route path="pagares" element={<Pagares />} />
      <Route path="avales" element={<Avales />} />
      <Route path="firmas" element={<Firmas />} />
      <Route path="contratos" element={<Box p={3}><Typography>Contratos Marco - En desarrollo</Typography></Box>} />
    </Routes>
  );
};

export default Legal;
