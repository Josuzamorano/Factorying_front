// ====================================================
// Indicadores Económicos - Migrado de F_FI*.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  Tooltip,
  CircularProgress,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Timeline as TimelineIcon,
  AttachMoney as DolarIcon,
  Euro as EuroIcon,
  AccountBalance as UFIcon,
  ShowChart as ChartIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

// ====== Interfaces ======
interface IndicadorEconomico {
  id: number;
  codigo: string;
  nombre: string;
  fecha: string;
  valor: number;
  variacionDiaria?: number;
  variacionMensual?: number;
  variacionAnual?: number;
}

// ====== Componente Principal ======
const IndicadoresEconomicos: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [indicadores, setIndicadores] = useState<IndicadorEconomico[]>([]);
  const [indicadorHistorico, setIndicadorHistorico] = useState<IndicadorEconomico[]>([]);
  
  // Dialog Histórico
  const [openHistorico, setOpenHistorico] = useState(false);
  const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(dayjs().subtract(1, 'month'));
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs());
  
  // Dialog Editar
  const [openEditar, setOpenEditar] = useState(false);
  const [indicadorEditar, setIndicadorEditar] = useState<IndicadorEconomico | null>(null);
  const [nuevoValor, setNuevoValor] = useState<number>(0);

  useEffect(() => {
    cargarIndicadores();
  }, []);

  // ====== API Calls ======
  const cargarIndicadores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/finanzas/indicadores', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar indicadores');
      
      const data = await response.json();
      setIndicadores(data);
    } catch (err) {
      setError('Error al cargar indicadores económicos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorico = async (codigo: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fechaDesde', fechaDesde.toISOString().split('T')[0]);
      if (fechaHasta) params.append('fechaHasta', fechaHasta.toISOString().split('T')[0]);

      const response = await fetch(`/api/finanzas/indicadores/${codigo}/historico?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar histórico');
      
      const data = await response.json();
      setIndicadorHistorico(data);
    } catch (err) {
      setError('Error al cargar histórico');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actualizarIndicador = async () => {
    if (!indicadorEditar) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/finanzas/indicadores/${indicadorEditar.codigo}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          codigo: indicadorEditar.codigo,
          valor: nuevoValor,
          fecha: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar indicador');

      setSuccess('Indicador actualizado exitosamente');
      setOpenEditar(false);
      cargarIndicadores();
    } catch (err) {
      setError('Error al actualizar indicador');
    } finally {
      setLoading(false);
    }
  };

  // ====== Handlers ======
  const handleVerHistorico = (codigo: string) => {
    setIndicadorSeleccionado(codigo);
    setOpenHistorico(true);
    cargarHistorico(codigo);
  };

  const handleEditar = (indicador: IndicadorEconomico) => {
    setIndicadorEditar(indicador);
    setNuevoValor(indicador.valor);
    setOpenEditar(true);
  };

  // ====== Helpers ======
  const formatCurrency = (value: number, codigo: string) => {
    if (codigo === 'UF') {
      return new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
    }
    if (codigo === 'DOLAR' || codigo === 'USD') {
      return `$${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
    }
    if (codigo === 'EURO' || codigo === 'EUR') {
      return `€${new Intl.NumberFormat('es-CL', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
    }
    if (codigo === 'IPC' || codigo === 'TMC') {
      return `${value.toFixed(2)}%`;
    }
    return value.toLocaleString('es-CL');
  };

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  const formatVariacion = (variacion?: number) => {
    if (variacion === undefined || variacion === null) return '-';
    const prefix = variacion > 0 ? '+' : '';
    return `${prefix}${variacion.toFixed(2)}%`;
  };

  const getVariacionColor = (variacion?: number) => {
    if (!variacion) return 'inherit';
    return variacion > 0 ? 'success.main' : variacion < 0 ? 'error.main' : 'inherit';
  };

  const getVariacionIcon = (variacion?: number) => {
    if (!variacion) return <TrendingFlatIcon fontSize="small" />;
    return variacion > 0 ? <TrendingUpIcon fontSize="small" color="success" /> : <TrendingDownIcon fontSize="small" color="error" />;
  };

  const getIndicadorIcon = (codigo: string) => {
    switch (codigo.toUpperCase()) {
      case 'UF':
        return <UFIcon color="primary" sx={{ fontSize: 40 }} />;
      case 'DOLAR':
      case 'USD':
        return <DolarIcon color="success" sx={{ fontSize: 40 }} />;
      case 'EURO':
      case 'EUR':
        return <EuroIcon color="secondary" sx={{ fontSize: 40 }} />;
      default:
        return <ChartIcon color="info" sx={{ fontSize: 40 }} />;
    }
  };

  const getIndicadorColor = (codigo: string): 'primary' | 'success' | 'secondary' | 'info' => {
    switch (codigo.toUpperCase()) {
      case 'UF': return 'primary';
      case 'DOLAR':
      case 'USD': return 'success';
      case 'EURO':
      case 'EUR': return 'secondary';
      default: return 'info';
    }
  };

  // ====== Render ======
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/finanzas')}
          >
            Finanzas
          </Link>
          <Typography color="text.primary">Indicadores Económicos</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/finanzas')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Indicadores Económicos
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarIndicadores}
          >
            Actualizar
          </Button>
        </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Cards Indicadores Principales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {indicadores.slice(0, 4).map((indicador) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={indicador.codigo}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: `linear-gradient(135deg, ${getIndicadorColor(indicador.codigo) === 'primary' ? '#1e3c72' : getIndicadorColor(indicador.codigo) === 'success' ? '#2e7d32' : getIndicadorColor(indicador.codigo) === 'secondary' ? '#9c27b0' : '#0288d1'} 0%, ${getIndicadorColor(indicador.codigo) === 'primary' ? '#2a5298' : getIndicadorColor(indicador.codigo) === 'success' ? '#4caf50' : getIndicadorColor(indicador.codigo) === 'secondary' ? '#ba68c8' : '#03a9f4'} 100%)`,
                  color: 'white'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="overline" sx={{ opacity: 0.8 }}>
                        {indicador.nombre}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                        {formatCurrency(indicador.valor, indicador.codigo)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getVariacionIcon(indicador.variacionDiaria)}
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {formatVariacion(indicador.variacionDiaria)} hoy
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ opacity: 0.6 }}>
                      {getIndicadorIcon(indicador.codigo)}
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.7 }}>
                    Actualizado: {formatDayjs(indicador.fecha)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Tabla Completa */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">Todos los Indicadores</Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell>Código</TableCell>
                  <TableCell>Indicador</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="center">Var. Diaria</TableCell>
                  <TableCell align="center">Var. Mensual</TableCell>
                  <TableCell align="center">Var. Anual</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {indicadores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No hay indicadores registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  indicadores.map((indicador) => (
                    <TableRow key={indicador.id} hover>
                      <TableCell>
                        <Chip
                          label={indicador.codigo}
                          color={getIndicadorColor(indicador.codigo)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{indicador.nombre}</Typography>
                      </TableCell>
                      <TableCell>{formatDayjs(indicador.fecha)}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(indicador.valor, indicador.codigo)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          {getVariacionIcon(indicador.variacionDiaria)}
                          <Typography sx={{ color: getVariacionColor(indicador.variacionDiaria) }}>
                            {formatVariacion(indicador.variacionDiaria)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ color: getVariacionColor(indicador.variacionMensual) }}>
                          {formatVariacion(indicador.variacionMensual)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ color: getVariacionColor(indicador.variacionAnual) }}>
                          {formatVariacion(indicador.variacionAnual)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver Histórico">
                          <IconButton size="small" onClick={() => handleVerHistorico(indicador.codigo)}>
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar Valor">
                          <IconButton size="small" onClick={() => handleEditar(indicador)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog Histórico */}
        <Dialog open={openHistorico} onClose={() => setOpenHistorico(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Histórico: {indicadorSeleccionado}
          </DialogTitle>
          <DialogContent dividers>
            {/* Filtros de fecha */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <DatePicker
                  label="Fecha Desde"
                  value={fechaDesde}
                  onChange={(newValue) => setFechaDesde(newValue as Dayjs | null)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <DatePicker
                  label="Fecha Hasta"
                  value={fechaHasta}
                  onChange={(newValue) => setFechaHasta(newValue as Dayjs | null)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => cargarHistorico(indicadorSeleccionado)}
                  sx={{ height: '100%' }}
                >
                  Buscar
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="center">Var. Diaria</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {indicadorHistorico.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No hay datos históricos
                        </TableCell>
                      </TableRow>
                    ) : (
                      indicadorHistorico.map((item, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{formatDayjs(item.fecha)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(item.valor, indicadorSeleccionado)}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                              {getVariacionIcon(item.variacionDiaria)}
                              <Typography sx={{ color: getVariacionColor(item.variacionDiaria) }}>
                                {formatVariacion(item.variacionDiaria)}
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenHistorico(false)}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Editar Indicador */}
        <Dialog open={openEditar} onClose={() => setOpenEditar(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            <EditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Actualizar {indicadorEditar?.nombre}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Valor actual: {indicadorEditar ? formatCurrency(indicadorEditar.valor, indicadorEditar.codigo) : '-'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Nuevo Valor"
                  type="number"
                  value={nuevoValor}
                  onChange={(e) => setNuevoValor(parseFloat(e.target.value) || 0)}
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  Este cambio quedará registrado con la fecha actual
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={actualizarIndicador}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default IndicadoresEconomicos;
