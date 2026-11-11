import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Description as PagareIcon,
  VerifiedUser as AvalIcon,
  Draw as FirmaIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { legalService, ResumenLegalDto, ResumenGarantiasClienteDto } from '../../services/legal.service';

const LegalDashboard: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenLegalDto | null>(null);
  const [resumenClientes, setResumenClientes] = useState<ResumenGarantiasClienteDto[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resumenData, clientesData] = await Promise.all([
        legalService.getResumenGeneral(),
        legalService.getResumenTodosClientes()
      ]);
      setResumen(resumenData);
      setResumenClientes(clientesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Dashboard Legal - Resumen de Garantías
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Vista consolidada del estado de pagarés, avales y firmas
      </Typography>

      {/* Tarjetas principales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pagarés */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary">
                  Pagarés
                </Typography>
                <PagareIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {resumen?.totalPagaresVigentes || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vigentes
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {resumen?.totalPagaresPorVencer || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Por vencer
                  </Typography>
                </Grid>
                <Grid size={4}>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {resumen?.totalPagaresVencidos || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vencidos
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Monto total vigente
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(resumen?.montoTotalPagaresVigentes || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Avales */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary">
                  Avales
                </Typography>
                <AvalIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {resumen?.totalAvalesActivos || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Activos
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="h4" fontWeight="bold" color="text.secondary">
                    {resumen?.totalAvales || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total registrados
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Por vencer (30 días)
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {resumen?.totalAvalesPorVencer || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Firmas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary">
                  Firmas
                </Typography>
                <FirmaIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {resumen?.totalFirmasVigentes || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Vigentes
                  </Typography>
                </Grid>
                <Grid size={6}>
                  <Typography variant="h4" fontWeight="bold" color="text.secondary">
                    {resumen?.totalFirmas || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total registradas
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Por vencer (30 días)
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {resumen?.totalFirmasPorVencer || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertas */}
      {(resumen?.totalPagaresVencidos || 0) > 0 && (
        <Alert 
          severity="error" 
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          Hay {resumen?.totalPagaresVencidos} pagarés vencidos que requieren atención inmediata
        </Alert>
      )}

      {(resumen?.totalPagaresPorVencer || 0) > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
        >
          {resumen?.totalPagaresPorVencer} pagarés vencerán en los próximos 30 días
        </Alert>
      )}

      {/* Tabla de resumen por cliente */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Resumen por Cliente
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell><strong>RUT Cliente</strong></TableCell>
                <TableCell><strong>Nombre</strong></TableCell>
                <TableCell align="center"><strong>Pagarés Vigentes</strong></TableCell>
                <TableCell align="center"><strong>Avales Activos</strong></TableCell>
                <TableCell align="center"><strong>Firmas Vigentes</strong></TableCell>
                <TableCell align="right"><strong>Monto Garantía</strong></TableCell>
                <TableCell align="center"><strong>Estado</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resumenClientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">No hay datos disponibles</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                resumenClientes.slice(0, 10).map((cliente) => (
                  <TableRow key={cliente.rutCliente} hover>
                    <TableCell>{cliente.rutCliente}</TableCell>
                    <TableCell>{cliente.nombreCliente}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={cliente.totalPagaresVigentes} 
                        size="small" 
                        color={cliente.totalPagaresVigentes > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={cliente.totalAvalesActivos} 
                        size="small" 
                        color={cliente.totalAvalesActivos > 0 ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={cliente.totalFirmasVigentes} 
                        size="small" 
                        color={cliente.totalFirmasVigentes > 0 ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(cliente.montoTotalGarantias)}
                    </TableCell>
                    <TableCell align="center">
                      {cliente.tieneDocumentosVencidos ? (
                        <Chip label="Vencido" size="small" color="error" icon={<WarningIcon />} />
                      ) : (
                        <Chip label="Al día" size="small" color="success" icon={<CheckIcon />} />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LegalDashboard;
