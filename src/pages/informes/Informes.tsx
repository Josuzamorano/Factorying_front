import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Warning as WarningIcon,
  PieChart as PieChartIcon,
  Group as GroupIcon,
  MonetizationOn as MoneyIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

interface MenuOption {
  titulo: string;
  descripcion: string;
  ruta: string;
  icono: React.ReactNode;
  categoria: string;
  color: string;
}

const menuOptions: MenuOption[] = [
  {
    titulo: 'Dashboard',
    descripcion: 'Resumen general de indicadores',
    ruta: '/informes/dashboard',
    icono: <DashboardIcon sx={{ fontSize: 40 }} />,
    categoria: 'General',
    color: '#1976d2',
  },
  {
    titulo: 'Anticipos Cursados',
    descripcion: 'Informe de anticipos por período',
    ruta: '/informes/anticipos',
    icono: <MoneyIcon sx={{ fontSize: 40 }} />,
    categoria: 'Operaciones',
    color: '#2e7d32',
  },
  {
    titulo: 'Protestos Diarios',
    descripcion: 'Protestos por ejecutivo',
    ruta: '/informes/protestos',
    icono: <WarningIcon sx={{ fontSize: 40 }} />,
    categoria: 'Cobranza',
    color: '#d32f2f',
  },
  {
    titulo: 'Documentos por Deudor',
    descripcion: 'Documentos comprados por deudor',
    ruta: '/informes/documentos-deudor',
    icono: <ReceiptIcon sx={{ fontSize: 40 }} />,
    categoria: 'Cartera',
    color: '#7b1fa2',
  },
  {
    titulo: 'Cartera Cliente',
    descripcion: 'Cartera vigente y vencida por cliente',
    ruta: '/informes/cartera',
    icono: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
    categoria: 'Cartera',
    color: '#0288d1',
  },
  {
    titulo: 'Devengamiento',
    descripcion: 'Detalle de intereses devengados',
    ruta: '/informes/devengamiento',
    icono: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    categoria: 'Finanzas',
    color: '#f57c00',
  },
  {
    titulo: 'Cupo por Ejecutivo',
    descripcion: 'Líneas y utilización por ejecutivo',
    ruta: '/informes/cupo-cliente',
    icono: <GroupIcon sx={{ fontSize: 40 }} />,
    categoria: 'Comercial',
    color: '#5c6bc0',
  },
  {
    titulo: 'Volumen Operaciones',
    descripcion: 'Estadísticas de operaciones por período',
    ruta: '/informes/volumen',
    icono: <AssessmentIcon sx={{ fontSize: 40 }} />,
    categoria: 'Estadísticas',
    color: '#00897b',
  },
  {
    titulo: 'Excedentes',
    descripcion: 'Detalle de excedentes pendientes',
    ruta: '/informes/excedentes',
    icono: <BusinessIcon sx={{ fontSize: 40 }} />,
    categoria: 'Comercial',
    color: '#8e24aa',
  },
  {
    titulo: 'Concentración Terceros',
    descripcion: 'Análisis de riesgo por deudor',
    ruta: '/informes/concentracion',
    icono: <PieChartIcon sx={{ fontSize: 40 }} />,
    categoria: 'Riesgo',
    color: '#c62828',
  },
  {
    titulo: 'Adelantos',
    descripcion: 'Informe de adelantos otorgados',
    ruta: '/informes/adelantos',
    icono: <MoneyIcon sx={{ fontSize: 40 }} />,
    categoria: 'Operaciones',
    color: '#388e3c',
  },
  {
    titulo: 'Historial Informes',
    descripcion: 'Informes generados anteriormente',
    ruta: '/informes/historial',
    icono: <HistoryIcon sx={{ fontSize: 40 }} />,
    categoria: 'General',
    color: '#616161',
  },
];

const categoriaColors: { [key: string]: string } = {
  General: '#1976d2',
  Operaciones: '#2e7d32',
  Cobranza: '#d32f2f',
  Cartera: '#7b1fa2',
  Finanzas: '#f57c00',
  Comercial: '#5c6bc0',
  Estadísticas: '#00897b',
  Riesgo: '#c62828',
};

const Informes: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (ruta: string) => {
    navigate(ruta);
  };

  // Agrupar por categoría
  const categorias = [...new Set(menuOptions.map(o => o.categoria))];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Emisión de Informes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generación de informes y reportes del sistema de factoring
        </Typography>
      </Box>

      {categorias.map((categoria) => (
        <Box key={categoria} sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: categoriaColors[categoria] || '#000',
              borderBottom: `2px solid ${categoriaColors[categoria] || '#000'}`,
              pb: 1,
              display: 'inline-block'
            }}
          >
            {categoria}
          </Typography>
          
          <Grid container spacing={3}>
            {menuOptions
              .filter(o => o.categoria === categoria)
              .map((option) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={option.titulo}>
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
                      onClick={() => handleNavigate(option.ruta)}
                      sx={{ height: '100%' }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                          }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '50%',
                              backgroundColor: `${option.color}15`,
                              color: option.color,
                              mb: 2,
                            }}
                          >
                            {option.icono}
                          </Box>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {option.titulo}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {option.descripcion}
                          </Typography>
                          <Chip 
                            label={option.categoria} 
                            size="small" 
                            sx={{ 
                              mt: 2, 
                              backgroundColor: `${categoriaColors[option.categoria]}20`,
                              color: categoriaColors[option.categoria]
                            }} 
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default Informes;
