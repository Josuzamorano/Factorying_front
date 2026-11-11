import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  TrendingUp as TasasIcon,
  Calculate as SimularIcon,
  History as HistoricoIcon,
  Assessment as IndicadoresIcon,
  FileCopy as CopiarIcon,
  Analytics as ResumenIcon,
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
    title: 'Tasas y Plazos',
    description: 'Gestión de tasas por tramos de monto y días',
    icon: <TasasIcon sx={{ fontSize: 48 }} />,
    path: '/finanzas/tasas',
    color: '#1e88e5',
  },
  {
    title: 'Simulador',
    description: 'Simular cálculo de tasas para operaciones',
    icon: <SimularIcon sx={{ fontSize: 48 }} />,
    path: '/finanzas/simulador',
    color: '#43a047',
  },
  {
    title: 'Histórico Tasas',
    description: 'Consulta histórica de tasas para análisis',
    icon: <HistoricoIcon sx={{ fontSize: 48 }} />,
    path: '/finanzas/historico',
    color: '#fb8c00',
  },
  {
    title: 'Indicadores',
    description: 'UF, Dólar y otros indicadores económicos',
    icon: <IndicadoresIcon sx={{ fontSize: 48 }} />,
    path: '/finanzas/indicadores',
    color: '#8e24aa',
  },
  {
    title: 'Copiar Tasas',
    description: 'Copiar tasas de una fecha a otra',
    icon: <CopiarIcon sx={{ fontSize: 48 }} />,
    path: '/finanzas/copiar',
    color: '#00acc1',
  },
  {
    title: 'Resumen Tasas',
    description: 'Resumen y estadísticas de tasas',
    icon: <ResumenIcon sx={{ fontSize: 48 }} />,
    path: '/finanzas/resumen',
    color: '#e53935',
  },
];

const Finanzas: React.FC = () => {
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
        <Typography color="text.primary">Finanzas</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Módulo de Finanzas
      </Typography>

      <Grid container spacing={3}>
        {menuOptions.map((option) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={option.path}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(option.path)}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  py: 4,
                }}
              >
                <Box
                  sx={{
                    color: option.color,
                    mb: 2,
                  }}
                >
                  {option.icon}
                </Box>
                <Typography variant="h6" component="h2" gutterBottom>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Finanzas;
