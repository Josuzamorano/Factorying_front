// ====================================================
// Informe de Cupo por Cliente - Migrado de F_INF1700.frm
// ====================================================

import React, { useState, useEffect } from 'react';
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  AccountBalanceWallet as CupoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

// ====== Interfaces ======
interface CupoCliente {
  codigoEjecutivo: number;
  nombreEjecutivo: string;
  rutCliente: number;
  dvCliente: string;
  rutClienteFormateado: string;
  razonSocialCliente: string;
  lineaAprobada: number;
  montoUtilizado: number;
  montoDisponible: number;
  porcentajeUtilizacion: number;
  fechaVencimientoLinea: string | null;
  estadoLinea: string;
}

interface Ejecutivo {
  codigo: number;
  nombre: string;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: CupoCliente[];
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
const InformeCupoCliente: React.FC = () => {
  const [codigoEjecutivo, setCodigoEjecutivo] = useState<number | ''>('');
  const [rutCliente, setRutCliente] = useState('');
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([]);
  
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    cargarEjecutivos();
  }, []);

  const cargarEjecutivos = async () => {
    try {
      const response = await fetch('/api/ejecutivos', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      if (response.ok) {
        const data = await response.json();
        setEjecutivos(data);
      }
    } catch (err) {
      console.error('Error cargando ejecutivos:', err);
    }
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (codigoEjecutivo) {
        params.append('codigoEjecutivo', codigoEjecutivo.toString());
      }
      
      if (rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }

      const response = await fetch(`/api/informes/cupo-cliente?${params.toString()}`, {
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
      
      if (codigoEjecutivo) {
        params.append('codigoEjecutivo', codigoEjecutivo.toString());
      }
      
      if (rutCliente) {
        params.append('rutCliente', rutCliente.replace(/\./g, '').split('-')[0]);
      }

      window.open(`/api/informes/cupo-cliente/exportar?${params.toString()}`, '_blank');
    } catch (err) {
      setError('Error al exportar');
    }
  };

  const getUtilizacionColor = (porcentaje: number): 'success' | 'warning' | 'error' => {
    if (porcentaje < 70) return 'success';
    if (porcentaje < 90) return 'warning';
    return 'error';
  };

  const getEstadoColor = (estado: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (estado.toLowerCase()) {
      case 'vigente': return 'success';
      case 'vencida': return 'error';
      case 'bloqueada': return 'warning';
      default: return 'default';
    }
  };

  // Resumen
  const resumen = resultado ? {
    totalClientes: resultado.totalRegistros,
    lineaTotal: resultado.datos.reduce((sum, c) => sum + c.lineaAprobada, 0),
    montoUtilizado: resultado.datos.reduce((sum, c) => sum + c.montoUtilizado, 0),
    montoDisponible: resultado.datos.reduce((sum, c) => sum + c.montoDisponible, 0),
    utilizacionPromedio: resultado.datos.length > 0
      ? resultado.datos.reduce((sum, c) => sum + c.porcentajeUtilizacion, 0) / resultado.datos.length
      : 0,
    ejecutivos: [...new Set(resultado.datos.map(c => c.codigoEjecutivo))].length,
    conAltoRiesgo: resultado.datos.filter(c => c.porcentajeUtilizacion >= 90).length,
  } : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <CupoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Cupo por Cliente
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Cupo cliente por ejecutivo (F_INF1700)
        </Typography>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Ejecutivo</InputLabel>
                <Select
                  value={codigoEjecutivo}
                  label="Ejecutivo"
                  onChange={(e) => setCodigoEjecutivo(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {ejecutivos.map((ej) => (
                    <MenuItem key={ej.codigo} value={ej.codigo}>
                      {ej.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Cliente"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                placeholder="12.345.678-9 (opcional)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 6, sm: 1.7 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Clientes</Typography>
                  <Typography variant="h5">{resumen.totalClientes}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 1.7 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Ejecutivos</Typography>
                  <Typography variant="h5">{resumen.ejecutivos}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.2 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Línea Total</Typography>
                  <Typography variant="h6">{formatCurrency(resumen.lineaTotal)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.2 }}>
              <Card sx={{ bgcolor: 'primary.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="primary.dark" variant="caption">Utilizado</Typography>
                  <Typography variant="h6" color="primary.dark">{formatCurrency(resumen.montoUtilizado)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.2 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="success.dark" variant="caption">Disponible</Typography>
                  <Typography variant="h6" color="success.dark">{formatCurrency(resumen.montoDisponible)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card sx={{ bgcolor: resumen.conAltoRiesgo > 0 ? 'error.light' : 'grey.100' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color={resumen.conAltoRiesgo > 0 ? 'error.dark' : 'textSecondary'} variant="caption">
                    <WarningIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                    Alto Uso (≥90%)
                  </Typography>
                  <Typography variant="h5" color={resumen.conAltoRiesgo > 0 ? 'error.dark' : 'textSecondary'}>
                    {resumen.conAltoRiesgo}
                  </Typography>
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
                    <TableCell sx={{ color: 'white' }}>Ejecutivo</TableCell>
                    <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Línea Aprobada</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Utilizado</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Disponible</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">% Utilización</TableCell>
                    <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                    <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultado.datos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((cupo, index) => (
                      <TableRow 
                        key={index} 
                        hover
                        sx={{ 
                          bgcolor: cupo.porcentajeUtilizacion >= 90 ? 'error.50' : 'inherit' 
                        }}
                      >
                        <TableCell>{cupo.nombreEjecutivo}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{cupo.razonSocialCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cupo.rutClienteFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(cupo.lineaAprobada)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(cupo.montoUtilizado)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {formatCurrency(cupo.montoDisponible)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={cupo.porcentajeUtilizacion >= 90 ? <WarningIcon /> : <CheckIcon />}
                            label={formatPercent(cupo.porcentajeUtilizacion)}
                            size="small"
                            color={getUtilizacionColor(cupo.porcentajeUtilizacion)}
                          />
                        </TableCell>
                        <TableCell>{formatDayjs(cupo.fechaVencimientoLinea)}</TableCell>
                        <TableCell>
                          <Chip
                            label={cupo.estadoLinea}
                            size="small"
                            color={getEstadoColor(cupo.estadoLinea)}
                          />
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
              <CupoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="textSecondary">
                {resultado ? 'No se encontraron datos de cupo' : 'Presione Buscar para generar el informe'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
};

export default InformeCupoCliente;
