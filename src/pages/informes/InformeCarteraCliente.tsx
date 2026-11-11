// ====================================================
// Informe de Cartera por Cliente - Migrado de F_INF1400.frm
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  Search as SearchIcon,
  FileDownload as ExcelIcon,
  Folder as CarteraIcon,
  ExpandMore as ExpandMoreIcon,
  Business as ClienteIcon,
} from '@mui/icons-material';

// ====== Interfaces ======
interface DetalleCartera {
  numeroOperacion: number;
  numeroDocumento: string;
  tipoDocumento: string;
  rutDeudor: number;
  nombreDeudor: string;
  fechaOperacion: string;
  fechaVencimiento: string;
  montoOriginal: number;
  saldo: number;
  diasVencido: number;
  estado: string;
}

interface CarteraCliente {
  rutCliente: number;
  dvCliente: string;
  rutClienteFormateado: string;
  razonSocialCliente: string;
  nombreEjecutivo: string;
  tipoDocumento: string;
  totalDocumentos: number;
  montoVigente: number;
  montoMora: number;
  montoTotal: number;
  porcentajeConcentracion: number;
  detalle: DetalleCartera[];
}

interface ResultadoInforme {
  tipoInforme: number;
  nombreInforme: string;
  fechaGeneracion: string;
  datos: CarteraCliente[];
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

const formatDayjs = (DayjsString: string): string => {
  return new Date(DayjsString).toLocaleDateString('es-CL');
};

// ====== Componente Principal ======
const InformeCarteraCliente: React.FC = () => {
  const [rutCliente, setRutCliente] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<number>(0);
  
  const [resultado, setResultado] = useState<ResultadoInforme | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCliente, setExpandedCliente] = useState<number | false>(false);

  const handleBuscar = async () => {
    if (!rutCliente) {
      setError('El RUT del cliente es requerido');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        rutCliente: rutCliente.replace(/\./g, '').split('-')[0],
      });
      
      if (tipoDocumento > 0) {
        params.append('tipoDocumento', tipoDocumento.toString());
      }

      const response = await fetch(`/api/informes/cartera-cliente?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        throw new Error('Error al generar el informe');
      }

      const data = await response.json();
      setResultado(data);
    } catch (err: any) {
      setError(err.message || 'Error al generar el informe');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!rutCliente) return;
    
    try {
      const params = new URLSearchParams({
        rutCliente: rutCliente.replace(/\./g, '').split('-')[0],
        formato: 'excel',
      });

      window.open(`/api/informes/cartera-cliente/exportar?${params.toString()}`, '_blank');
    } catch (err) {
      setError('Error al exportar');
    }
  };

  // Resumen
  const resumen = resultado && resultado.datos.length > 0 ? {
    totalDocumentos: resultado.datos.reduce((sum, c) => sum + c.totalDocumentos, 0),
    montoVigente: resultado.datos.reduce((sum, c) => sum + c.montoVigente, 0),
    montoMora: resultado.datos.reduce((sum, c) => sum + c.montoMora, 0),
    montoTotal: resultado.datos.reduce((sum, c) => sum + c.montoTotal, 0),
    porcentajeMora: 0,
  } : null;
  
  if (resumen && resumen.montoTotal > 0) {
    resumen.porcentajeMora = (resumen.montoMora / resumen.montoTotal) * 100;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <CarteraIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Cartera por Cliente
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Cartera de documentos del cliente (F_INF1400)
        </Typography>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Cliente"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                placeholder="12.345.678-9"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Documentos</Typography>
                  <Typography variant="h4">{resumen.totalDocumentos}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography color="success.dark" gutterBottom>Monto Vigente</Typography>
                  <Typography variant="h5" color="success.dark">{formatCurrency(resumen.montoVigente)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography color="warning.dark" gutterBottom>Monto en Mora</Typography>
                  <Typography variant="h5" color="warning.dark">{formatCurrency(resumen.montoMora)}</Typography>
                  <Typography variant="caption" color="warning.dark">
                    {resumen.porcentajeMora.toFixed(1)}% del total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Monto Total</Typography>
                  <Typography variant="h5">{formatCurrency(resumen.montoTotal)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Resultados por Cliente */}
        {resultado && resultado.datos.length > 0 ? (
          resultado.datos.map((cliente) => (
            <Accordion
              key={cliente.rutCliente}
              expanded={expandedCliente === cliente.rutCliente}
              onChange={(_, isExpanded) => setExpandedCliente(isExpanded ? cliente.rutCliente : false)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid container spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClienteIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle1">{cliente.razonSocialCliente}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {cliente.rutClienteFormateado} | Ejecutivo: {cliente.nombreEjecutivo}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography variant="body2" color="textSecondary">Documentos</Typography>
                    <Typography variant="h6">{cliente.totalDocumentos}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography variant="body2" color="success.main">Vigente</Typography>
                    <Typography variant="body1">{formatCurrency(cliente.montoVigente)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography variant="body2" color="warning.main">En Mora</Typography>
                    <Typography variant="body1">{formatCurrency(cliente.montoMora)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography variant="body2" color="textSecondary">Total</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(cliente.montoTotal)}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'grey.100' }}>
                        <TableCell>Operación</TableCell>
                        <TableCell>Documento</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Deudor</TableCell>
                        <TableCell>Fecha Op.</TableCell>
                        <TableCell>Vencimiento</TableCell>
                        <TableCell align="right">Monto</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell align="center">Días</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cliente.detalle.map((doc, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>#{doc.numeroOperacion}</TableCell>
                          <TableCell>{doc.numeroDocumento}</TableCell>
                          <TableCell>
                            <Chip label={doc.tipoDocumento} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>{doc.nombreDeudor}</TableCell>
                          <TableCell>{formatDayjs(doc.fechaOperacion)}</TableCell>
                          <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
                          <TableCell align="right">{formatCurrency(doc.montoOriginal)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(doc.saldo)}
                          </TableCell>
                          <TableCell align="center">
                            {doc.diasVencido > 0 ? (
                              <Chip
                                label={doc.diasVencido}
                                size="small"
                                color={doc.diasVencido > 30 ? 'error' : 'warning'}
                              />
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={doc.estado}
                              size="small"
                              color={doc.estado === 'Vigente' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))
        ) : !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CarteraIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="textSecondary">
              {resultado ? 'No se encontró cartera para este cliente' : 'Ingrese el RUT del cliente y presione Buscar'}
            </Typography>
          </Paper>
        )}
      </Container>
    </LocalizationProvider>
  );
};

export default InformeCarteraCliente;
