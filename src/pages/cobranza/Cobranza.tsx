import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import TodayIcon from '@mui/icons-material/Today';
import DescriptionIcon from '@mui/icons-material/Description';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoIcon from '@mui/icons-material/Info';

interface MenuOption {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  visible: boolean;
}

const Cobranza = () => {
  const navigate = useNavigate();

  const menuOptions: MenuOption[] = [
    {
      id: 0,
      title: 'Pago Deudor',
      description: 'Registrar pagos realizados por deudores',
      icon: <PaymentIcon sx={{ fontSize: 48, color: '#1976d2' }} />,
      path: '/cobranza/pago-deudor',
      visible: true
    },
    {
      id: 1,
      title: 'Pago Cliente',
      description: 'Registrar pagos realizados por clientes',
      icon: <PersonIcon sx={{ fontSize: 48, color: '#2e7d32' }} />,
      path: '/cobranza/pago-cliente',
      visible: true
    },
    {
      id: 2,
      title: 'Verificación',
      description: 'Verificar documentos pendientes',
      icon: <VerifiedIcon sx={{ fontSize: 48, color: '#ed6c02' }} />,
      path: '/cobranza/verificacion',
      visible: true
    },
    {
      id: 5,
      title: 'Caja',
      description: 'Gestión de caja y pagos',
      icon: <PointOfSaleIcon sx={{ fontSize: 48, color: '#9c27b0' }} />,
      path: '/cobranza/caja',
      visible: true
    },
    {
      id: 6,
      title: 'Verificación Diaria',
      description: 'Control de verificación diaria',
      icon: <TodayIcon sx={{ fontSize: 48, color: '#0288d1' }} />,
      path: '/cobranza/verificacion-diaria',
      visible: true
    },
    {
      id: 8,
      title: 'Doc. No Cedidos',
      description: 'Documentos no cedidos (D.N.C.)',
      icon: <DescriptionIcon sx={{ fontSize: 48, color: '#d32f2f' }} />,
      path: '/cobranza/dnc',
      visible: true
    },
    {
      id: 9,
      title: 'Consulta Masiva',
      description: 'Consulta masiva de documentos',
      icon: <AssessmentIcon sx={{ fontSize: 48, color: '#5c6bc0' }} />,
      path: '/cobranza/consulta-masiva',
      visible: true
    },
    {
      id: 10,
      title: 'Informe Abonos',
      description: 'Reporte de abonos realizados',
      icon: <InfoIcon sx={{ fontSize: 48, color: '#00897b' }} />,
      path: '/cobranza/informe-abonos',
      visible: true
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#1976d2' }}>
        Cobranzas - Recaudador
      </Typography>

      <Grid container spacing={3}>
        {menuOptions.filter(opt => opt.visible).map((option) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={option.id}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleNavigate(option.path)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  {option.icon}
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
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

export default Cobranza;
