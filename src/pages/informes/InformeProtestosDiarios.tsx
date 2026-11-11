// ====================================================
// Informe de Protestos Diarios - Migrado de F_INF1200.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  Warning as ProtestoIcon,
} from '@mui/icons-material';

// ====== Interfaces ======
interface ProtestoDiario {
  fechaProtesto: string;
  codigoEjecutivo: number;
  nombreEjecutivo: string;
  rutCliente: number;
  dvCliente: string;
  rutClienteFormateado: string;
  razonSocialCliente: string;
  rutDeudor: number;
  dvDeudor: string;
  rutDeudorFormateado: string;
  nombreDeudor: string;
  numeroOperacion: number;
  numeroDocumento: string;
  tipoDocumento: string;
  montoDocumento: number;
  fechaVencimiento: string;
  diasVencido: number;
  causalProtesto: string;
}

interface Ejecutivo {
  codigo: number;
  nombre: string;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: ProtestoDiario[];
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

const formatDayjs = (DayjsString: string): string => {
  return new Date(DayjsString).toLocaleDateString('es-CL');
};

// ====== Componente Principal ======
const InformeProtestosDiarios: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(
    dayjs().startOf('month')
  );
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs());
  const [codigoEjecutivo, setCodigoEjecutivo] = useState<number | ''>('');
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
    if (!fechaDesde || !fechaHasta) {
      setError('Las fechas son requeridas');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        fechaDesde: fechaDesde.toISOString(),
        fechaHasta: fechaHasta.toISOString(),
      });
      
      if (codigoEjecutivo) {
        params.append('codigoEjecutivo', codigoEjecutivo.toString());
      }

      const response = await fetch(`/api/informes/protestos-diarios?${params.toString()}`, {
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
    if (!fechaDesde || !fechaHasta) return;
    
    try {
      const params = new URLSearchParams({
        fechaDesde: fechaDesde.toISOString(),
        fechaHasta: fechaHasta.toISOString(),
        formato: 'excel',
      });
      
      if (codigoEjecutivo) {
        params.append('codigoEjecutivo', codigoEjecutivo.toString());
      }

      window.open(`/api/informes/protestos-diarios/exportar?${params.toString()}`, '_blank');
    } catch (err) {
      setError('Error al exportar');
    }
  };

  // Resumen
  const resumen = resultado ? {
    totalProtestos: resultado.totalRegistros,
    montoTotal: resultado.datos.reduce((sum, p) => sum + p.montoDocumento, 0),
    ejecutivos: [...new Set(resultado.datos.map(p => p.nombreEjecutivo))].length,
    clientes: [...new Set(resultado.datos.map(p => p.rutCliente))].length,
  } : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <ProtestoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Informe de Protestos Diarios
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Protestos diarios por ejecutivo (F_INF1200)
        </Typography>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <DatePicker
                label="Fecha Desde"
                value={fechaDesde}
                onChange={setFechaDesde}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <DatePicker
                label="Fecha Hasta"
                value={fechaHasta}
                onChange={setFechaHasta}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
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
            <Grid size={{ xs: 12, sm: 3 }}>
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

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography color="error.dark" gutterBottom>Total Protestos</Typography>
                  <Typography variant="h4" color="error.dark">{resumen.totalProtestos}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Monto Total</Typography>
                  <Typography variant="h5">{formatCurrency(resumen.montoTotal)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Ejecutivos</Typography>
                  <Typography variant="h4">{resumen.ejecutivos}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Clientes Afectados</Typography>
                  <Typography variant="h4">{resumen.clientes}</Typography>
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
                    <TableCell sx={{ color: 'white' }}>Fecha</TableCell>
                    <TableCell sx={{ color: 'white' }}>Ejecutivo</TableCell>
                    <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white' }}>Deudor</TableCell>
                    <TableCell sx={{ color: 'white' }}>Operación</TableCell>
                    <TableCell sx={{ color: 'white' }}>Documento</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto</TableCell>
                    <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Días</TableCell>
                    <TableCell sx={{ color: 'white' }}>Causal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultado.datos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((protesto, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{formatDayjs(protesto.fechaProtesto)}</TableCell>
                        <TableCell>{protesto.nombreEjecutivo}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{protesto.razonSocialCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {protesto.rutClienteFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{protesto.nombreDeudor}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {protesto.rutDeudorFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>#{protesto.numeroOperacion}</TableCell>
                        <TableCell>
                          <Chip label={protesto.tipoDocumento} size="small" />
                          <Typography variant="caption" display="block">{protesto.numeroDocumento}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(protesto.montoDocumento)}
                        </TableCell>
                        <TableCell>{formatDayjs(protesto.fechaVencimiento)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={protesto.diasVencido}
                            size="small"
                            color={protesto.diasVencido > 30 ? 'error' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>{protesto.causalProtesto}</TableCell>
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
              <Typography color="textSecondary">
                {resultado ? 'No se encontraron protestos en el período seleccionado' : 'Ingrese los filtros y presione Buscar'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
};

export default InformeProtestosDiarios;
