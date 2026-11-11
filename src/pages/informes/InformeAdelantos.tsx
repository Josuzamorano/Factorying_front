// ====================================================
// Informe de Adelantos - Migrado de F_INF1600.frm
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
  FormControlLabel,
  Switch,
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
  AttachMoney as AdelantoIcon,
} from '@mui/icons-material';

// ====== Interfaces ======
interface Adelanto {
  rutCliente: number;
  dvCliente: string;
  rutClienteFormateado: string;
  razonSocialCliente: string;
  numeroOperacion: number;
  fechaOperacion: string;
  fechaAdelanto: string;
  montoAdelanto: number;
  montoDocumentos: number;
  porcentajeAdelanto: number;
  estado: string;
  fechaRecuperacion: string | null;
  montoRecuperado: number | null;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: Adelanto[];
  totalRegistros: number;
  totales: { [key: string]: number };
  exitoso: boolean;
  mensajeError?: string;
}

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

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// ====== Componente Principal ======
const InformeAdelantos: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(
    dayjs().startOf('month')
  );
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs());
  const [rutCliente, setRutCliente] = useState('');
  const [todosLosClientes, setTodosLosClientes] = useState(true);
  
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleBuscar = async () => {
    if (!todosLosClientes && !rutCliente) {
      setError('Debe indicar un RUT de cliente o seleccionar todos los clientes');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        todosLosClientes: todosLosClientes.toString(),
      });
      
      if (fechaDesde) params.append('fechaDesde', fechaDesde.toISOString());
      if (fechaHasta) params.append('fechaHasta', fechaHasta.toISOString());
      
      if (!todosLosClientes && rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }

      const response = await fetch(`/api/informes/adelantos?${params.toString()}`, {
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
      const params = new URLSearchParams({
        todosLosClientes: todosLosClientes.toString(),
        formato: 'excel',
      });
      
      if (fechaDesde) params.append('fechaDesde', fechaDesde.toISOString());
      if (fechaHasta) params.append('fechaHasta', fechaHasta.toISOString());
      
      if (!todosLosClientes && rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }

      window.open(`/api/informes/adelantos/exportar?${params.toString()}`, '_blank');
    } catch (err) {
      setError('Error al exportar');
    }
  };

  const getEstadoColor = (estado: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (estado.toLowerCase()) {
      case 'vigente': return 'warning';
      case 'recuperado': return 'success';
      case 'vencido': return 'error';
      default: return 'default';
    }
  };

  // Resumen
  const resumen = resultado ? {
    totalAdelantos: resultado.totalRegistros,
    montoTotalAdelanto: resultado.datos.reduce((sum, a) => sum + a.montoAdelanto, 0),
    montoTotalDocumentos: resultado.datos.reduce((sum, a) => sum + a.montoDocumentos, 0),
    montoRecuperado: resultado.datos.reduce((sum, a) => sum + (a.montoRecuperado || 0), 0),
    porcentajePromedio: resultado.datos.length > 0 
      ? resultado.datos.reduce((sum, a) => sum + a.porcentajeAdelanto, 0) / resultado.datos.length 
      : 0,
    clientes: [...new Set(resultado.datos.map(a => a.rutCliente))].length,
    vigentes: resultado.datos.filter(a => a.estado.toLowerCase() === 'vigente').length,
    recuperados: resultado.datos.filter(a => a.estado.toLowerCase() === 'recuperado').length,
  } : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <AdelantoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Informe de Adelantos
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Detalle de adelantos otorgados (F_INF1600)
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
                placeholder="12.345.678-9"
                disabled={todosLosClientes}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={todosLosClientes}
                    onChange={(e) => setTodosLosClientes(e.target.checked)}
                  />
                }
                label="Todos"
              />
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
                  <Typography color="textSecondary" variant="caption">Adelantos</Typography>
                  <Typography variant="h5">{resumen.totalAdelantos}</Typography>
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
              <Card sx={{ bgcolor: 'primary.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="primary.dark" variant="caption">Monto Adelantos</Typography>
                  <Typography variant="h6" color="primary.dark">{formatCurrency(resumen.montoTotalAdelanto)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Monto Documentos</Typography>
                  <Typography variant="h6">{formatCurrency(resumen.montoTotalDocumentos)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="success.dark" variant="caption">Recuperado</Typography>
                  <Typography variant="h6" color="success.dark">{formatCurrency(resumen.montoRecuperado)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 1.5 }}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="warning.dark" variant="caption">Vigentes</Typography>
                  <Typography variant="h5" color="warning.dark">{resumen.vigentes}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 1.5 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">% Promedio</Typography>
                  <Typography variant="h6">{formatPercent(resumen.porcentajePromedio)}</Typography>
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
                    <TableCell sx={{ color: 'white' }}>Operación</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Op.</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Adelanto</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Docs.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Adelanto</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">%</TableCell>
                    <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Recup.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Recup.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultado.datos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((adelanto, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2">{adelanto.razonSocialCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {adelanto.rutClienteFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>#{adelanto.numeroOperacion}</TableCell>
                        <TableCell>{formatDayjs(adelanto.fechaOperacion)}</TableCell>
                        <TableCell>{formatDayjs(adelanto.fechaAdelanto)}</TableCell>
                        <TableCell align="right">{formatCurrency(adelanto.montoDocumentos)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {formatCurrency(adelanto.montoAdelanto)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={formatPercent(adelanto.porcentajeAdelanto)} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={adelanto.estado}
                            size="small"
                            color={getEstadoColor(adelanto.estado)}
                          />
                        </TableCell>
                        <TableCell>{formatDayjs(adelanto.fechaRecuperacion)}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {adelanto.montoRecuperado ? formatCurrency(adelanto.montoRecuperado) : '-'}
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
              <AdelantoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="textSecondary">
                {resultado ? 'No se encontraron adelantos en el período' : 'Ingrese los filtros y presione Buscar'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
};

export default InformeAdelantos;
