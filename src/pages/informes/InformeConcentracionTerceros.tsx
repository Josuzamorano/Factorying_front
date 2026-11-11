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
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  Print as PrintIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { informesService } from '../../services/informes.service';

interface ConcentracionTerceros {
  rutDeudor: number;
  dvDeudor: string;
  rutFormateado: string;
  razonSocialDeudor: string;
  tipoDeudor: string;
  cantidadClientes: number;
  cantidadDocumentos: number;
  montoTotal: number;
  porcentajeConcentracion: number;
  clasificacionRiesgo: string;
  detallePorCliente: DetalleConcentracion[];
}

interface DetalleConcentracion {
  rutCliente: number;
  dvCliente: string;
  rutFormateado: string;
  razonSocialCliente: string;
  cantidadDocumentos: number;
  montoDocumentos: number;
  porcentajeParticipacion: number;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: ConcentracionTerceros[];
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

const getRiesgoColor = (clasificacion: string): string => {
  switch (clasificacion?.toLowerCase()) {
    case 'alto':
      return 'error';
    case 'medio':
      return 'warning';
    case 'bajo':
      return 'success';
    default:
      return 'info';
  }
};

const getConcentracionColor = (porcentaje: number): 'error' | 'warning' | 'success' | 'info' => {
  if (porcentaje >= 20) return 'error';
  if (porcentaje >= 10) return 'warning';
  if (porcentaje >= 5) return 'info';
  return 'success';
};

const InformeConcentracionTerceros: React.FC = () => {
  const [porcentajeMinimo, setPorcentajeMinimo] = useState<string>('5');
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleBuscar = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await informesService.getConcentracionTerceros({
        porcentajeMinimo: parseFloat(porcentajeMinimo) || 5,
      });

      setResultado(response.data);
      setPage(0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

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

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Concentración de Terceros
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análisis de concentración de deudores en la cartera
        </Typography>
      </Box>

      {/* Alerta de riesgo */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<WarningIcon />}>
        Este informe identifica deudores que concentran un alto porcentaje de la cartera total,
        lo cual puede representar un riesgo de concentración.
      </Alert>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              label="Porcentaje Mínimo de Concentración (%)"
              type="number"
              value={porcentajeMinimo}
              onChange={(e) => setPorcentajeMinimo(e.target.value)}
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              helperText="Solo muestra deudores sobre este porcentaje"
            />
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
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Deudores Concentrados
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {resultado.totalRegistros}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Cartera Total
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {formatCurrency(resultado.totales?.CarteraTotal || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Monto Concentrado
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {formatCurrency(resultado.totales?.MontoConcentrado || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ backgroundColor: 'error.light' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="error.contrastText">
                    % Concentración Total
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="error.contrastText">
                    {(resultado.totales?.PorcentajeConcentrado || 0).toFixed(1)}%
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

          {/* Tabla */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white', width: 50 }}></TableCell>
                  <TableCell sx={{ color: 'white' }}>RUT Deudor</TableCell>
                  <TableCell sx={{ color: 'white' }}>Razón Social</TableCell>
                  <TableCell sx={{ color: 'white' }}>Tipo</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Clientes</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Documentos</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Monto Total</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center" width={200}>Concentración</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Riesgo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resultado.datos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <React.Fragment key={index}>
                      <TableRow
                        hover
                        onClick={() => toggleRow(index)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography>{expandedRow === index ? '▼' : '▶'}</Typography>
                        </TableCell>
                        <TableCell>{row.rutFormateado}</TableCell>
                        <TableCell>{row.razonSocialDeudor}</TableCell>
                        <TableCell>{row.tipoDeudor}</TableCell>
                        <TableCell align="right">{formatNumber(row.cantidadClientes)}</TableCell>
                        <TableCell align="right">{formatNumber(row.cantidadDocumentos)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.montoTotal)}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(row.porcentajeConcentracion, 100)}
                                color={getConcentracionColor(row.porcentajeConcentracion)}
                                sx={{ height: 8, borderRadius: 1 }}
                              />
                            </Box>
                            <Typography variant="body2" sx={{ minWidth: 50 }}>
                              {row.porcentajeConcentracion.toFixed(1)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: `${getRiesgoColor(row.clasificacionRiesgo)}.light`,
                              color: `${getRiesgoColor(row.clasificacionRiesgo)}.dark`,
                              display: 'inline-block',
                            }}
                          >
                            <Typography variant="caption" fontWeight="bold">
                              {row.clasificacionRiesgo}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                      {/* Detalle expandible */}
                      {expandedRow === index && row.detallePorCliente && (
                        <TableRow>
                          <TableCell colSpan={9} sx={{ py: 0 }}>
                            <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Detalle por Cliente
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>RUT Cliente</TableCell>
                                    <TableCell>Razón Social</TableCell>
                                    <TableCell align="right">Documentos</TableCell>
                                    <TableCell align="right">Monto</TableCell>
                                    <TableCell align="right">Participación</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {row.detallePorCliente.map((detalle, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{detalle.rutFormateado}</TableCell>
                                      <TableCell>{detalle.razonSocialCliente}</TableCell>
                                      <TableCell align="right">
                                        {formatNumber(detalle.cantidadDocumentos)}
                                      </TableCell>
                                      <TableCell align="right">
                                        {formatCurrency(detalle.montoDocumentos)}
                                      </TableCell>
                                      <TableCell align="right">
                                        {detalle.porcentajeParticipacion.toFixed(1)}%
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                {resultado.datos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No se encontraron deudores con concentración sobre el {porcentajeMinimo}%
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
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
        </>
      )}
    </Container>
  );
};

export default InformeConcentracionTerceros;
