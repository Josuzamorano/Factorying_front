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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  BarChart as ChartIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { informesService } from '../../services/informes.service';

interface VolumenOperacion {
  anio: number;
  mes: number;
  nombreMes: string;
  cantidadOperaciones: number;
  cantidadClientes: number;
  montoTotalDocumentos: number;
  montoTotalAnticipado: number;
  comisionesGeneradas: number;
  interesesGenerados: number;
  ingresosTotales: number;
  porcentajeComisionPromedio: number;
  porcentajeInteresPromedio: number;
  variacionMesAnterior: number;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: VolumenOperacion[];
  totalRegistros: number;
  totales: { [key: string]: number };
  exitoso: boolean;
  mensajeError?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-CL').format(value);
};

const getMeses = (): { value: number; label: string }[] => [
  { value: 0, label: 'Todos los meses' },
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

const InformeVolumenOperaciones: React.FC = () => {
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [mes, setMes] = useState<number>(0);
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [showChart, setShowChart] = useState(false);

  const getAniosDisponibles = (): number[] => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= currentYear - 5; y--) {
      years.push(y);
    }
    return years;
  };

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await informesService.getVolumenOperaciones({
        anio,
        mes: mes === 0 ? undefined : mes,
      });

      setResultado(response.data);
      setPage(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleBuscar();
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportExcel = () => {
    console.log('Exportar a Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  const getVariacionColor = (variacion: number): string => {
    if (variacion > 0) return 'success.main';
    if (variacion < 0) return 'error.main';
    return 'text.secondary';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Volumen de Operaciones
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Análisis de volumen de operaciones por período
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Año</InputLabel>
                <Select
                  value={anio}
                  label="Año"
                  onChange={(e) => setAnio(e.target.value as number)}
                >
                  {getAniosDisponibles().map((a) => (
                    <MenuItem key={a} value={a}>
                      {a}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Mes</InputLabel>
                <Select
                  value={mes}
                  label="Mes"
                  onChange={(e) => setMes(e.target.value as number)}
                >
                  {getMeses().map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                onClick={handleBuscar}
                disabled={loading}
              >
                Generar Informe
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ChartIcon />}
                onClick={() => setShowChart(!showChart)}
              >
                {showChart ? 'Ver Tabla' : 'Ver Gráfico'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Resultados */}
        {resultado && (
          <>
            {/* Resumen */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Operaciones
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {formatNumber(resultado.totales?.TotalOperaciones || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Clientes
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {formatNumber(resultado.totales?.TotalClientes || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Monto Anticipado
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(resultado.totales?.TotalAnticipado || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Comisiones
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {formatCurrency(resultado.totales?.TotalComisiones || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Ingresos Totales
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="info.main">
                      {formatCurrency(resultado.totales?.TotalIngresos || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Acciones */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Tooltip title="Exportar a Excel">
                <IconButton onClick={handleExportExcel} color="primary">
                  <ExcelIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Imprimir">
                <IconButton onClick={handlePrint} color="primary">
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {!showChart ? (
              /* Tabla */
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white' }}>Período</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Operaciones</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Clientes</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Monto Documentos</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Monto Anticipado</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Comisiones</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Intereses</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Ingresos</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Variación</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {resultado.datos
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography fontWeight="medium">
                              {row.nombreMes} {row.anio}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{formatNumber(row.cantidadOperaciones)}</TableCell>
                          <TableCell align="right">{formatNumber(row.cantidadClientes)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.montoTotalDocumentos)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.montoTotalAnticipado)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.comisionesGeneradas)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.interesesGenerados)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.ingresosTotales)}</TableCell>
                          <TableCell align="right">
                            <Typography
                              fontWeight="medium"
                              sx={{ color: getVariacionColor(row.variacionMesAnterior) }}
                            >
                              {row.variacionMesAnterior > 0 ? '+' : ''}
                              {row.variacionMesAnterior.toFixed(1)}%
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    {resultado.datos.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No se encontraron registros
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[6, 12, 24]}
                  component="div"
                  count={resultado.datos.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </TableContainer>
            ) : (
              /* Gráfico simple con barras CSS */
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Evolución Mensual del Volumen
                </Typography>
                <Box sx={{ mt: 3 }}>
                  {resultado.datos.map((row, index) => {
                    const maxMonto = Math.max(
                      ...resultado.datos.map((d) => d.montoTotalAnticipado)
                    );
                    const percentage = (row.montoTotalAnticipado / maxMonto) * 100;
                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2">
                            {row.nombreMes} {row.anio}
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatCurrency(row.montoTotalAnticipado)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 24,
                            backgroundColor: 'grey.200',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: 'primary.main',
                              transition: 'width 0.5s ease-in-out',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              pr: 1,
                            }}
                          >
                            {percentage > 20 && (
                              <Typography variant="caption" color="white">
                                {formatNumber(row.cantidadOperaciones)} ops
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            )}
          </>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default InformeVolumenOperaciones;
