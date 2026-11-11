import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  AccountBalance as AccountBalanceIcon,
  Group as GroupIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { informesService } from '../../services/informes.service';

interface ResumenData {
  fechaCorte: string;
  totalOperacionesMes: number;
  montoOperadoMes: number;
  totalClientesActivos: number;
  carteraVigente: number;
  carteraVencida: number;
  porcentajeMorosidad: number;
  documentosProtestados: number;
  montoProtestado: number;
  excedentesPendientes: number;
}

interface StatCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: React.ReactNode;
  color: string;
  tendencia?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ titulo, valor, subtitulo, icono, color, tendencia }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {titulo}
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
            {valor}
          </Typography>
          {subtitulo && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              {tendencia === 'up' && <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />}
              {tendencia === 'down' && <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />}
              <Typography variant="caption" color="text.secondary">
                {subtitulo}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: `${color}15`,
            color: color,
          }}
        >
          {icono}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-CL').format(value);
};

const InformesDashboard: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResumen();
  }, []);

  const fetchResumen = async () => {
    try {
      setLoading(true);
      const response = await informesService.getResumen();
      setResumen(response.data);
    } catch (err) {
      setError('Error al cargar el resumen');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !resumen) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography color="error">{error || 'Error al cargar datos'}</Typography>
      </Container>
    );
  }

  const carteraTotal = resumen.carteraVigente + resumen.carteraVencida;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Informes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen general al {new Date(resumen.fechaCorte).toLocaleDateString('es-CL')}
        </Typography>
      </Box>

      {/* Indicadores principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            titulo="Operaciones del Mes"
            valor={formatNumber(resumen.totalOperacionesMes)}
            subtitulo="Operaciones cursadas"
            icono={<ReceiptIcon />}
            color="#1976d2"
            tendencia="up"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            titulo="Monto Operado"
            valor={formatCurrency(resumen.montoOperadoMes)}
            subtitulo="Total del mes"
            icono={<AssessmentIcon />}
            color="#2e7d32"
            tendencia="up"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            titulo="Clientes Activos"
            valor={formatNumber(resumen.totalClientesActivos)}
            subtitulo="Últimos 3 meses"
            icono={<GroupIcon />}
            color="#7b1fa2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            titulo="Morosidad"
            valor={`${resumen.porcentajeMorosidad.toFixed(2)}%`}
            subtitulo="Cartera vencida / total"
            icono={resumen.porcentajeMorosidad > 10 ? <WarningIcon /> : <CheckCircleIcon />}
            color={resumen.porcentajeMorosidad > 10 ? '#d32f2f' : '#2e7d32'}
            tendencia={resumen.porcentajeMorosidad > 10 ? 'down' : 'up'}
          />
        </Grid>
      </Grid>

      {/* Cartera */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Composición de Cartera
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <AccountBalanceIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                  <Typography variant="h5" color="#1976d2" fontWeight="bold">
                    {formatCurrency(carteraTotal)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cartera Total
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 1 }} />
                  <Typography variant="h5" color="#2e7d32" fontWeight="bold">
                    {formatCurrency(resumen.carteraVigente)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cartera Vigente
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {carteraTotal > 0 ? ((resumen.carteraVigente / carteraTotal) * 100).toFixed(1) : 0}%
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <WarningIcon sx={{ fontSize: 48, color: '#d32f2f', mb: 1 }} />
                  <Typography variant="h5" color="#d32f2f" fontWeight="bold">
                    {formatCurrency(resumen.carteraVencida)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cartera Vencida
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {carteraTotal > 0 ? ((resumen.carteraVencida / carteraTotal) * 100).toFixed(1) : 0}%
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Alertas del Mes
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Documentos Protestados
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="error.main">
                  {formatNumber(resumen.documentosProtestados)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Monto Protestado
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="error.main">
                  {formatCurrency(resumen.montoProtestado)}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Excedentes Pendientes
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="warning.main">
                  {formatCurrency(resumen.excedentesPendientes)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default InformesDashboard;
