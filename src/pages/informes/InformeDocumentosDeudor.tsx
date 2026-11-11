// ====================================================
// Informe de Documentos por Deudor - Migrado de F_INF1300.frm
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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  Description as DocIcon,
  Person as DeudorIcon,
} from '@mui/icons-material';

// ====== Interfaces ======
interface DocumentoDeudor {
  rutDeudor: number;
  dvDeudor: string;
  rutDeudorFormateado: string;
  nombreDeudor: string;
  rutCliente: number;
  dvCliente: string;
  rutClienteFormateado: string;
  razonSocialCliente: string;
  numeroOperacion: number;
  numeroDocumento: string;
  tipoDocumento: string;
  fechaOperacion: string;
  fechaVencimiento: string | null;
  montoDocumento: number;
  saldoDocumento: number;
  estadoDocumento: string;
  diasVencido: number;
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: DocumentoDeudor[];
  totalRegistros: number;
  totales: { [key: string]: number };
  exitoso: boolean;
  mensajeError?: string;
}

const tiposDocumento = [
  { valor: 0, descripcion: 'Todos' },
  { valor: 1, descripcion: 'Factura' },
  { valor: 2, descripcion: 'Cheque' },
  { valor: 3, descripcion: 'Letra' },
  { valor: 4, descripcion: 'Pagaré' },
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
const InformeDocumentosDeudor: React.FC = () => {
  const [rutDeudor, setRutDeudor] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<number>(0);
  const [tipoDetalle, setTipoDetalle] = useState<'resumido' | 'detallado'>('detallado');
  
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleBuscar = async () => {
    if (!rutDeudor) {
      setError('El RUT del deudor es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        rutDeudor: rutDeudor.replace(/\./g, '').split('-')[0],
        tipoDetalle: tipoDetalle === 'resumido' ? '1' : '2',
      });
      
      if (tipoDocumento > 0) {
        params.append('tipoDocumento', tipoDocumento.toString());
      }

      const response = await fetch(`/api/informes/documentos-deudor?${params.toString()}`, {
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
    if (!rutDeudor) return;
    
    try {
      const params = new URLSearchParams({
        rutDeudor: rutDeudor.replace(/\./g, '').split('-')[0],
        formato: 'excel',
      });

      window.open(`/api/informes/documentos-deudor/exportar?${params.toString()}`, '_blank');
    } catch (err) {
      setError('Error al exportar');
    }
  };

  const getEstadoColor = (estado: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (estado.toLowerCase()) {
      case 'vigente': return 'success';
      case 'vencido': return 'warning';
      case 'protestado': return 'error';
      default: return 'default';
    }
  };

  // Resumen
  const resumen = resultado ? {
    totalDocumentos: resultado.totalRegistros,
    montoTotal: resultado.datos.reduce((sum, d) => sum + d.montoDocumento, 0),
    saldoTotal: resultado.datos.reduce((sum, d) => sum + d.saldoDocumento, 0),
    clientes: [...new Set(resultado.datos.map(d => d.rutCliente))].length,
    vigentes: resultado.datos.filter(d => d.estadoDocumento.toLowerCase() === 'vigente').length,
    vencidos: resultado.datos.filter(d => d.diasVencido > 0).length,
  } : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <DeudorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Documentos por Deudor
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Documentos comprados por deudor (F_INF1300)
        </Typography>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Deudor"
                value={rutDeudor}
                onChange={(e) => setRutDeudor(e.target.value)}
                placeholder="12.345.678-9"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Documento</InputLabel>
                <Select
                  value={tipoDocumento}
                  label="Tipo Documento"
                  onChange={(e) => setTipoDocumento(Number(e.target.value))}
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.valor} value={tipo.valor}>
                      {tipo.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <ToggleButtonGroup
                value={tipoDetalle}
                exclusive
                onChange={(_, value) => value && setTipoDetalle(value)}
                size="small"
                fullWidth
              >
                <ToggleButton value="resumido">Resumido</ToggleButton>
                <ToggleButton value="detallado">Detallado</ToggleButton>
              </ToggleButtonGroup>
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
                  <Typography color="textSecondary" variant="caption">Monto Total</Typography>
                  <Typography variant="h6">{formatCurrency(resumen.montoTotal)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="textSecondary" variant="caption">Saldo Total</Typography>
                  <Typography variant="h6">{formatCurrency(resumen.saldoTotal)}</Typography>
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
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="success.dark" variant="caption">Vigentes</Typography>
                  <Typography variant="h5" color="success.dark">{resumen.vigentes}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 2 }}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent sx={{ py: 1 }}>
                  <Typography color="warning.dark" variant="caption">Vencidos</Typography>
                  <Typography variant="h5" color="warning.dark">{resumen.vencidos}</Typography>
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
                    <TableCell sx={{ color: 'white' }}>Deudor</TableCell>
                    <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white' }}>Operación</TableCell>
                    <TableCell sx={{ color: 'white' }}>Documento</TableCell>
                    <TableCell sx={{ color: 'white' }}>Tipo</TableCell>
                    <TableCell sx={{ color: 'white' }}>Fecha Op.</TableCell>
                    <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Saldo</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Días</TableCell>
                    <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultado.datos
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((doc, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2">{doc.nombreDeudor}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {doc.rutDeudorFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{doc.razonSocialCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {doc.rutClienteFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>#{doc.numeroOperacion}</TableCell>
                        <TableCell>{doc.numeroDocumento}</TableCell>
                        <TableCell>
                          <Chip label={doc.tipoDocumento} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{formatDayjs(doc.fechaOperacion)}</TableCell>
                        <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
                        <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                          {formatCurrency(doc.saldoDocumento)}
                        </TableCell>
                        <TableCell align="center">
                          {doc.diasVencido > 0 ? (
                            <Chip label={doc.diasVencido} size="small" color="warning" />
                          ) : (
                            <Typography variant="body2">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.estadoDocumento}
                            size="small"
                            color={getEstadoColor(doc.estadoDocumento)}
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
              <DocIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="textSecondary">
                {resultado ? 'No se encontraron documentos para este deudor' : 'Ingrese el RUT del deudor y presione Buscar'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Container>
    </LocalizationProvider>
  );
};

export default InformeDocumentosDeudor;
