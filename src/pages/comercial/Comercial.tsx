// ====================================================
// Menú Comercial - Migrado de F_CM1000.frm
// ====================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import {
  Receipt as ExcedentesIcon,
  Description as DocumentosIcon,
  Update as ProrrogaIcon,
  Refresh as RenovacionIcon,
  Dashboard as PizarraIcon,
  CheckCircle as OtorgamientoIcon,
  AccountBalance as CartolaIcon,
  Approval as AprobacionIcon,
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
    title: 'Excedentes',
    description: 'Gestión de excedentes de operaciones',
    icon: <ExcedentesIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/excedentes',
    color: '#1976d2',
  },
  {
    title: 'Documentos Cliente',
    description: 'Informe de documentos comprados por cliente',
    icon: <DocumentosIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/documentos',
    color: '#2e7d32',
  },
  {
    title: 'Prórroga',
    description: 'Solicitud de prórroga de documentos',
    icon: <ProrrogaIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/prorrogas',
    color: '#ed6c02',
  },
  {
    title: 'Aprobación Prórrogas',
    description: 'Aprobación y rechazo de prórrogas',
    icon: <AprobacionIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/aprobacion-prorrogas',
    color: '#9c27b0',
  },
  {
    title: 'Renovación',
    description: 'Renovación de documentos',
    icon: <RenovacionIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/renovaciones',
    color: '#0288d1',
  },
  {
    title: 'Consulta Otorgamiento',
    description: 'Consulta de operaciones otorgadas',
    icon: <OtorgamientoIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/otorgamientos',
    color: '#388e3c',
  },
  {
    title: 'Pizarra Comercial',
    description: 'Consulta de pizarra de giros',
    icon: <PizarraIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/pizarra',
    color: '#f57c00',
  },
  {
    title: 'Cartola Cliente',
    description: 'Cartola de movimientos por cliente',
    icon: <CartolaIcon sx={{ fontSize: 48 }} />,
    path: '/comercial/cartola',
    color: '#7b1fa2',
  },
];

const Comercial: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, color: '#1976d2' }}>
        Módulo Comercial
      </Typography>
      
      <Grid container spacing={3}>
        {menuOptions.map((option) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={option.path}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardActionArea 
                onClick={() => navigate(option.path)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ color: option.color, mb: 2 }}>
                    {option.icon}
                  </Box>
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
    </Box>
  );
};

export default Comercial;
