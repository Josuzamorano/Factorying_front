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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { informesService } from '../../services/informes.service';

interface AnticipoCursado {
  rutCliente: number;
  dvCliente: string;
  rutFormateado: string;
  razonSocialCliente: string;
  numeroOperacion: number;
  fechaOperacion: string;
  fechaCurse: string;
  tipoDocumento: string;
  cantidadDocumentos: number;
  montoDocumentos: number;
  montoAnticipo: number;
  tasaOperacion: number;
  diferencia: number;
  comision: number;
  gastos: number;
  nombreEjecutivo: string;
  nombreBanco: string;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: AnticipoCursado[];
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

const formatDayjs = (DayjsString: string): string => {
  return new Date(DayjsString).toLocaleDateString('es-CL');
};

const InformeAnticipos: React.FC = () => {
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(
    dayjs().startOf('month')
  );
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs());
  const [rutCliente, setRutCliente] = useState<string>('');
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleBuscar = async () => {
    if (!fechaDesde || !fechaHasta) {
      setError('Las fechas son requeridas');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await informesService.getAnticiposCursados({
        fechaDesde: fechaDesde.toISOString(),
        fechaHasta: fechaHasta.toISOString(),
        rutCliente: rutCliente ? parseInt(rutCliente) : undefined,
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
    // TODO: Implementar exportación a Excel
    console.log('Exportar a Excel');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Informe de Anticipos Cursados
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Consulta de anticipos cursados por período de fecha
          </Typography>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Fecha Desde"
                value={fechaDesde}
                onChange={(Dayjs) => setFechaDesde(Dayjs)}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Fecha Hasta"
                value={fechaHasta}
                onChange={(Dayjs) => setFechaHasta(Dayjs)}
                slotProps={{
                  textField: { fullWidth: true, size: 'small' },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Cliente (opcional)"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                placeholder="Ej: 12345678"
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
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Registros
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {resultado.totalRegistros}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Documentos
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {formatCurrency(resultado.totales?.TotalMontoDocumentos || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Anticipos
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {formatCurrency(resultado.totales?.TotalMontoAnticipo || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Comisiones
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {formatCurrency(resultado.totales?.TotalComision || 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Diferencia
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="info.main">
                      {formatCurrency(resultado.totales?.TotalDiferencia || 0)}
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
                    <TableCell sx={{ color: 'white' }}>RUT Cliente</TableCell>
                    <TableCell sx={{ color: 'white' }}>Razón Social</TableCell>
                    <TableCell sx={{ color: 'white' }}>N° Operación</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Curse</TableCell>
                    <TableCell sx={{ color: 'white' }}>Tipo Doc.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Cant.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Docs</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Anticipo</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Tasa %</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Comisión</TableCell>
                    <TableCell sx={{ color: 'white' }}>Ejecutivo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultado.datos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.rutFormateado}</TableCell>
                        <TableCell>{row.razonSocialCliente}</TableCell>
                        <TableCell>{row.numeroOperacion}</TableCell>
                        <TableCell>{formatDayjs(row.fechaCurse)}</TableCell>
                        <TableCell>{row.tipoDocumento}</TableCell>
                        <TableCell align="right">{row.cantidadDocumentos}</TableCell>
                        <TableCell align="right">{formatCurrency(row.montoDocumentos)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.montoAnticipo)}</TableCell>
                        <TableCell align="right">{row.tasaOperacion.toFixed(2)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.comision)}</TableCell>
                        <TableCell>{row.nombreEjecutivo}</TableCell>
                      </TableRow>
                    ))}
                  {resultado.datos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        No se encontraron registros
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
    </LocalizationProvider>
  );
};

export default InformeAnticipos;
