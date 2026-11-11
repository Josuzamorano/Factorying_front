// ====================================================
// Informe de Excedentes - Migrado de F_INF1900.frm
// ====================================================

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  MoneyOff as ExcedenteIcon,
  CheckCircle as DevueltoIcon,
  Schedule as PendienteIcon,
} from '@mui/icons-material';

// ====== Interfaces ======
interface Excedente {
  rutCliente: number;
  dvCliente: string;
  rutClienteFormateado: string;
  razonSocialCliente: string;
  numeroOperacion: number;
  fechaOperacion: string;
  montoExcedente: number;
  fechaGeneracion: string;
  fechaDevolucion: string | null;
  montoDevuelto: number | null;
  estado: string;
  formaPago: string;
  nombreEjecutivo: string;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: Excedente[];
  totalRegistros: number;
  totales: { [key: string]: number };
  exitoso: boolean;
  mensajeError?: string;
}

const estadosExcedente = [
  { valor: '', descripcion: 'Todos' },
  { valor: 'pendiente', descripcion: 'Pendiente' },
  { valor: 'devuelto', descripcion: 'Devuelto' },
  { valor: 'compensado', descripcion: 'Compensado' },
];

// ====== Helpers ======
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDayjs = (DayjsString: string | null): string => {
  if (!DayjsString) return '-';
  return new Date(DayjsString).toLocaleDateString('es-CL');
};

// ====== Componente Principal ======
const InformeExcedentes: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(
    dayjs().startOf('month')
  );
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs());
  const [rutCliente, setRutCliente] = useState('');
  const [estado, setEstado] = useState('');
  
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (fechaDesde) params.append('fechaDesde', fechaDesde.toISOString());
      if (fechaHasta) params.append('fechaHasta', fechaHasta.toISOString());
      if (rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }
      if (estado) params.append('estado', estado);

      const response = await fetch(`/api/informes/excedentes?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        throw new Error('Error al generar el informe');
      }

      const data = await response.json();
      setResultado(data);
      setPage(0);
    } catch (err: any) {
      setError(err.message || 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const params = new URLSearchParams({ formato: 'excel' });
      
      if (fechaDesde) params.append('fechaDesde', fechaDesde.toISOString());
      if (fechaHasta) params.append('fechaHasta', fechaHasta.toISOString());
      if (rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }
      if (estado) params.append('estado', estado);

      window.open(`/api/informes/excedentes/exportar?${params.toString()}`, '_blank');
    } catch (err) {
      setError('Error al exportar');
    }
  };

  const getEstadoColor = (estado: string): 'success' | 'warning' | 'info' | 'default' => {
    switch (estado.toLowerCase()) {
      case 'devuelto': return 'success';
      case 'pendiente': return 'warning';
      case 'compensado': return 'info';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'devuelto': return <DevueltoIcon />;
      case 'pendiente': return <PendienteIcon />;
      default: return undefined;
    }
  };

  // Resumen
  const resumen = resultado ? {
    totalExcedentes: resultado.totalRegistros,
    montoTotal: resultado.datos.reduce((sum, e) => sum + e.montoExcedente, 0),
    montoDevuelto: resultado.datos.reduce((sum, e) => sum + (e.montoDevuelto || 0), 0),
    montoPendiente: resultado.datos
      .filter(e => e.estado.toLowerCase() === 'pendiente')
      .reduce((sum, e) => sum + e.montoExcedente, 0),
    clientes: [...new Set(resultado.datos.map(e => e.rutCliente))].length,
    pendientes: resultado.datos.filter(e => e.estado.toLowerCase() === 'pendiente').length,
    devueltos: resultado.datos.filter(e => e.estado.toLowerCase() === 'devuelto').length,
    compensados: resultado.datos.filter(e => e.estado.toLowerCase() === 'compensado').length,
  } : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <ExcedenteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Detalle de Excedentes
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Detalle de excedentes generados (F_INF1900)
        </Typography>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 2.5 }}>
              <DatePicker
                label="Fecha Desde"
                value={fechaDesde}
                onChange={setFechaDesde}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2.5 }}>
              <DatePicker
                label="Fecha Hasta"
                value={fechaHasta}
                onChange={setFechaHasta}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Cliente"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                placeholder="12.345.678-9 (opcional)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={estado}
                  label="Estado"
                  onChange={(e) => setEstado(e.target.value)}
                >
                  {estadosExcedente.map((est) => (
                    <MenuItem key={est.valor} value={est.valor}>
                      {est.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleBuscar}
                  disabled={loading}
                  fullWidth
                >
                  Buscar
                </Button>
                <Tooltip title="Exportar Excel">
                  <IconButton color="success" onClick={handleExportExcel} disabled={!resultado}>
                    <ExcelIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 1.5 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Excedentes</Typography>
                  <Typography variant="h5">{resumen.totalExcedentes}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 1.5 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Clientes</Typography>
                  <Typography variant="h5">{resumen.clientes}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Monto Total</Typography>
                  <Typography variant="h6">{formatCurrency(resumen.montoTotal)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="warning.dark" variant="caption">
                    <PendienteIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    Pendiente ({resumen.pendientes})
                  </Typography>
                  <Typography variant="h6" color="warning.dark">{formatCurrency(resumen.montoPendiente)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="success.dark" variant="caption">
                    <DevueltoIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    Devuelto ({resumen.devueltos})
                  </Typography>
                  <Typography variant="h6" color="success.dark">{formatCurrency(resumen.montoDevuelto)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: 'info.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="info.dark" variant="caption">Compensados</Typography>
                  <Typography variant="h5" color="info.dark">{resumen.compensados}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabla de Resultados */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : resultado && resultado.datos.length > 0 ? (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white' }}>Ejecutivo</TableCell>
                    <TableCell sx={{ color: 'white' }}>Operación</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Op.</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Generación</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Excedente</TableCell>
                    <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white' }}>Forma Pago</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Devolución</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Devuelto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultado.datos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((excedente, index) => (
                      <TableRow 
                        key={index} 
                        hover
                        sx={{
                          bgcolor: excedente.estado.toLowerCase() === 'pendiente' ? 'warning.50' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">{excedente.razonSocialCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {excedente.rutClienteFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>{excedente.nombreEjecutivo}</TableCell>
                        <TableCell>#{excedente.numeroOperacion}</TableCell>
                        <TableCell>{formatDayjs(excedente.fechaOperacion)}</TableCell>
                        <TableCell>{formatDayjs(excedente.fechaGeneracion)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(excedente.montoExcedente)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getEstadoIcon(excedente.estado)}
                            label={excedente.estado}
                            size="small"
                            color={getEstadoColor(excedente.estado)}
                          />
                        </TableCell>
                        <TableCell>{excedente.formaPago || '-'}</TableCell>
                        <TableCell>{formatDayjs(excedente.fechaDevolucion)}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {excedente.montoDevuelto ? formatCurrency(excedente.montoDevuelto) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={resultado.totalRegistros}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Filas por página:"
              />
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ExcedenteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="textSecondary">
                {resultado ? 'No se encontraron excedentes en el período' : 'Ingrese los filtros y presione Buscar'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
};

export default InformeExcedentes;
