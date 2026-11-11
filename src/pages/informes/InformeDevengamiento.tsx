// ====================================================
// Informe de Devengamiento - Migrado de F_INF1500.frm
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
  FormControlLabel,
  Switch,
  LinearProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  TrendingUp as DevengamientoIcon,
} from '@mui/icons-material';

// ====== Interfaces ======
interface Devengamiento {
  fechaCorte: string;
  rutCliente: number;
  dvCliente: string;
  rutClienteFormateado: string;
  razonSocialCliente: string;
  numeroOperacion: number;
  numeroDocumento: string;
  fechaOperacion: string;
  fechaVencimiento: string;
  plazoTotal: number;
  diasDevengados: number;
  diasPorDevengar: number;
  montoDocumento: number;
  tasaOperacion: number;
  interesTotal: number;
  interesDevengado: number;
  interesPorDevengar: number;
  centroCosto: number | null;
  descripcionCentroCosto: string;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: Devengamiento[];
  totalRegistros: number;
  totales: { [key: string]: number };
  exitoso: boolean;
  mensajeError?: string;
}

interface CentroCosto {
  codigo: number;
  descripcion: string;
}

// ====== Helpers ======
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatDayjs = (DayjsString: string): string => {
  return new Date(DayjsString).toLocaleDateString('es-CL');
};

const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// ====== Componente Principal ======
const InformeDevengamiento: React.FC = () => {
  const [fechaCorte, setFechaCorte] = useState<Dayjs | null>(dayjs());
  const [rutCliente, setRutCliente] = useState('');
  const [todosLosClientes, setTodosLosClientes] = useState(false);
  const [centroCosto, setCentroCosto] = useState<number | ''>('');
  const [centrosCosto] = useState<CentroCosto[]>([]);
  
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleBuscar = async () => {
    if (!fechaCorte) {
      setError('La fecha de corte es requerida');
      return;
    }

    if (!todosLosClientes && !rutCliente) {
      setError('Debe indicar un RUT de cliente o seleccionar todos los clientes');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        fechaCorte: fechaCorte.toISOString(),
        todosLosClientes: todosLosClientes.toString(),
      });
      
      if (!todosLosClientes && rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }
      
      if (centroCosto) {
        params.append('centroCosto', centroCosto.toString());
      }

      const response = await fetch(`/api/informes/devengamiento?${params.toString()}`, {
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
    if (!fechaCorte) return;
    
    try {
      const params = new URLSearchParams({
        fechaCorte: fechaCorte.toISOString(),
        todosLosClientes: todosLosClientes.toString(),
        formato: 'excel',
      });
      
      if (!todosLosClientes && rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }

      window.open(`/api/informes/devengamiento/exportar?${params.toString()}`, '_blank');
    } catch (err) {
      setError('Error al exportar');
    }
  };

  // Resumen
  const resumen = resultado ? {
    totalDocumentos: resultado.totalRegistros,
    interesTotal: resultado.datos.reduce((sum, d) => sum + d.interesTotal, 0),
    interesDevengado: resultado.datos.reduce((sum, d) => sum + d.interesDevengado, 0),
    interesPorDevengar: resultado.datos.reduce((sum, d) => sum + d.interesPorDevengar, 0),
    montoDocumentos: resultado.datos.reduce((sum, d) => sum + d.montoDocumento, 0),
    clientes: [...new Set(resultado.datos.map(d => d.rutCliente))].length,
  } : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <DevengamientoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Detalle de Devengamiento
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Detalle de devengamiento de intereses (F_INF1500)
        </Typography>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <DatePicker
                label="Fecha de Corte"
                value={fechaCorte}
                onChange={setFechaCorte}
                slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
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
              <FormControl fullWidth size="small">
                <InputLabel>Centro Costo</InputLabel>
                <Select
                  value={centroCosto}
                  label="Centro Costo"
                  onChange={(e) => setCentroCosto(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {centrosCosto.map((cc) => (
                    <MenuItem key={cc.codigo} value={cc.codigo}>
                      {cc.descripcion}
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
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Documentos</Typography>
                  <Typography variant="h5">{resumen.totalDocumentos}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
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
                  <Typography color="textSecondary" variant="caption">Monto Docs.</Typography>
                  <Typography variant="h6">{formatCurrency(resumen.montoDocumentos)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Interés Total</Typography>
                  <Typography variant="h6">{formatCurrency(resumen.interesTotal)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="success.dark" variant="caption">Devengado</Typography>
                  <Typography variant="h6" color="success.dark">{formatCurrency(resumen.interesDevengado)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card sx={{ bgcolor: 'info.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="info.dark" variant="caption">Por Devengar</Typography>
                  <Typography variant="h6" color="info.dark">{formatCurrency(resumen.interesPorDevengar)}</Typography>
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
                    <TableCell sx={{ color: 'white' }}>Documento</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Op.</TableCell>
                    <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Plazo</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Deveng.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Por Dev.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Doc.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Tasa</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Int. Total</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Int. Deveng.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Int. x Dev.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultado.datos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((dev, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2">{dev.razonSocialCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {dev.rutClienteFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>#{dev.numeroOperacion}</TableCell>
                        <TableCell>{dev.numeroDocumento}</TableCell>
                        <TableCell>{formatDayjs(dev.fechaOperacion)}</TableCell>
                        <TableCell>{formatDayjs(dev.fechaVencimiento)}</TableCell>
                        <TableCell align="center">{dev.plazoTotal}</TableCell>
                        <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {dev.diasDevengados}
                        </TableCell>
                        <TableCell align="center" sx={{ color: 'info.main' }}>
                          {dev.diasPorDevengar}
                        </TableCell>
                        <TableCell align="right">{formatCurrency(dev.montoDocumento)}</TableCell>
                        <TableCell align="right">{formatPercent(dev.tasaOperacion)}</TableCell>
                        <TableCell align="right">{formatCurrency(dev.interesTotal)}</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                          {formatCurrency(dev.interesDevengado)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'info.main' }}>
                          {formatCurrency(dev.interesPorDevengar)}
                        </TableCell>
                      </TableRow>
                    ))}
                  {/* Fila de totales */}
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell colSpan={8} sx={{ fontWeight: 'bold' }}>TOTALES</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(resumen?.montoDocumentos || 0)}
                    </TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(resumen?.interesTotal || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      {formatCurrency(resumen?.interesDevengado || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                      {formatCurrency(resumen?.interesPorDevengar || 0)}
                    </TableCell>
                  </TableRow>
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
              <DevengamientoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="textSecondary">
                {resultado ? 'No se encontraron datos de devengamiento' : 'Ingrese los filtros y presione Buscar'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
};

export default InformeDevengamiento;
