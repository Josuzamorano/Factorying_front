import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
  TextField,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { arqueoService } from '../../services/tesoreria.service';
import type { ArqueoDocumentoDto, FiltroArqueoDto, ResumenArqueoDto } from '../../services/tesoreria.service';
import { clienteService } from '../../services/cliente.service';
import type { ClienteListDto } from '../../services/cliente.service';

const tiposDocumento = [
  { value: '', label: 'Todos' },
  { value: 'FAO', label: 'Facturas' },
  { value: 'CHO', label: 'Cheques' },
  { value: 'LEO', label: 'Letras' },
];

const estadosDocumento = [
  { value: 0, label: 'Todos' },
  { value: 1, label: 'Vigente' },
  { value: 2, label: 'Prorrogado' },
  { value: 3, label: 'Renovado' },
  { value: 4, label: 'Cancelado' },
  { value: 5, label: 'Moroso' },
];

const Arqueo: React.FC = () => {
  const [documentos, setDocumentos] = useState<ArqueoDocumentoDto[]>([]);
  const [clientes, setClientes] = useState<ClienteListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<ResumenArqueoDto | null>(null);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs().endOf('month'));
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteListDto | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [estado, setEstado] = useState<number>(0);
  const [todosClientes, setTodosClientes] = useState<boolean>(true);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const data = await clienteService.getAll();
      setClientes(data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const handleConsultar = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtro: FiltroArqueoDto = {
        fechaDesde: fechaDesde?.format('YYYY-MM-DD') || dayjs().startOf('month').format('YYYY-MM-DD'),
        fechaHasta: fechaHasta?.format('YYYY-MM-DD') || dayjs().endOf('month').format('YYYY-MM-DD'),
        rutCliente: todosClientes ? undefined : clienteSeleccionado?.rutCliente ? Number(clienteSeleccionado.rutCliente) : undefined,
        tipoDocumento: tipoDocumento || undefined,
        estado: estado > 0 ? estado : undefined,
      };

      const [docs, res] = await Promise.all([
        arqueoService.consultar(filtro),
        arqueoService.getResumen(filtro),
      ]);

      setDocumentos(docs);
      setResumen(res);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al consultar arqueo';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleExportarExcel = () => {
    // Exportar a CSV (simulando Excel)
    if (documentos.length === 0) {
      setError('No hay datos para exportar');
      return;
    }

    const headers = ['Fecha Vto', 'N° Doc', 'N° Operación', 'Tipo', 'Banco', 'Cuenta', 'Rut Cliente', 'Cliente', 'Rut Deudor', 'Deudor', 'Monto', 'Estado'];
    const rows = documentos.map(d => [
      d.fechaVencimiento ? dayjs(d.fechaVencimiento).format('DD/MM/YYYY') : '',
      d.numeroDocumento,
      d.numeroOperacion,
      d.descripcionTipoDocumento || d.tipoDocumento,
      d.nombreBanco || '',
      d.cuentaCorriente || '',
      d.rutCliente,
      d.nombreCliente || '',
      d.rutDeudor,
      d.nombreDeudor || '',
      d.montoDocumento,
      d.descripcionEstado || '',
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `arqueo_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const getTipoChip = (tipo: string) => {
    switch (tipo) {
      case 'FAO':
        return <Chip label="Factura" color="primary" size="small" />;
      case 'CHO':
        return <Chip label="Cheque" color="secondary" size="small" />;
      case 'LEO':
        return <Chip label="Letra" color="info" size="small" />;
      default:
        return <Chip label={tipo} size="small" />;
    }
  };

  const getEstadoChip = (estado: number) => {
    switch (estado) {
      case 1:
        return <Chip label="Vigente" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 2:
        return <Chip label="Prorrogado" color="warning" size="small" />;
      case 3:
        return <Chip label="Renovado" color="info" size="small" />;
      case 4:
        return <Chip label="Cancelado" color="default" size="small" />;
      case 5:
        return <Chip label="Moroso" color="error" size="small" icon={<ErrorIcon />} />;
      default:
        return <Chip label="Desconocido" size="small" />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon fontSize="large" color="primary" />
          Informe de Arqueo
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Parámetros de Consulta
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Fecha Vencimiento Desde"
                value={fechaDesde}
                onChange={(newValue) => setFechaDesde(newValue as Dayjs | null)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Fecha Vencimiento Hasta"
                value={fechaHasta}
                onChange={(newValue) => setFechaHasta(newValue as Dayjs | null)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Documento</InputLabel>
                <Select
                  value={tipoDocumento}
                  label="Tipo Documento"
                  onChange={(e) => setTipoDocumento(e.target.value)}
                >
                  {tiposDocumento.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={estado}
                  label="Estado"
                  onChange={(e) => setEstado(Number(e.target.value))}
                >
                  {estadosDocumento.map((est) => (
                    <MenuItem key={est.value} value={est.value}>
                      {est.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                options={clientes}
                getOptionLabel={(option) => `${option.rutCliente} - ${option.nombreCompleto}`}
                value={clienteSeleccionado}
                onChange={(_, newValue) => {
                  setClienteSeleccionado(newValue);
                  setTodosClientes(newValue === null);
                }}
                disabled={todosClientes}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    size="small"
                    placeholder={todosClientes ? 'Todos los clientes' : 'Seleccione cliente'}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                variant={todosClientes ? 'contained' : 'outlined'}
                fullWidth
                onClick={() => {
                  setTodosClientes(!todosClientes);
                  if (!todosClientes) setClienteSeleccionado(null);
                }}
              >
                {todosClientes ? '✓ Todos' : 'Todos'}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleConsultar}
                  disabled={loading}
                >
                  Consultar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportarExcel}
                  disabled={documentos.length === 0}
                >
                  Excel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen */}
        {resumen && resumen.totalDocumentos > 0 && (
          <>
            <Typography variant="h6" gutterBottom>
              Resumen del Período
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" variant="caption">
                      Total Documentos
                    </Typography>
                    <Typography variant="h5">{resumen.totalDocumentos}</Typography>
                    <Typography variant="body2" color="primary">
                      {formatCurrency(resumen.montoTotal)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Card sx={{ borderLeft: '4px solid #1976d2' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="caption">
                      Facturas
                    </Typography>
                    <Typography variant="h5">{resumen.totalFacturas}</Typography>
                    <Typography variant="body2">
                      {formatCurrency(resumen.montoFacturas)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Card sx={{ borderLeft: '4px solid #9c27b0' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="caption">
                      Cheques
                    </Typography>
                    <Typography variant="h5">{resumen.totalCheques}</Typography>
                    <Typography variant="body2">
                      {formatCurrency(resumen.montoCheques)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Card sx={{ borderLeft: '4px solid #0288d1' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="caption">
                      Letras
                    </Typography>
                    <Typography variant="h5">{resumen.totalLetras}</Typography>
                    <Typography variant="body2">
                      {formatCurrency(resumen.montoLetras)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Card sx={{ bgcolor: 'success.light' }}>
                  <CardContent>
                    <Typography color="white" variant="caption">
                      Vigentes
                    </Typography>
                    <Typography variant="h5" color="white">
                      {resumen.documentosVigentes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Card sx={{ bgcolor: 'error.light' }}>
                  <CardContent>
                    <Typography color="white" variant="caption">
                      Morosos
                    </Typography>
                    <Typography variant="h5" color="white">
                      {resumen.documentosMorosos}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {/* Tabla de documentos */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : documentos.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                {resumen ? 'No se encontraron documentos para los filtros seleccionados' : 'Ingrese los parámetros y presione Consultar'}
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha Vto</TableCell>
                  <TableCell>N° Doc</TableCell>
                  <TableCell>N° Ope</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Banco</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Deudor</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.map((doc, index) => (
                  <TableRow key={`${doc.tipoDocumento}-${doc.numeroDocumento}-${index}`} hover>
                    <TableCell>
                      {doc.fechaVencimiento ? dayjs(doc.fechaVencimiento).format('DD/MM/YYYY') : '-'}
                    </TableCell>
                    <TableCell>{doc.numeroDocumento}</TableCell>
                    <TableCell>{doc.numeroOperacion}</TableCell>
                    <TableCell>{getTipoChip(doc.tipoDocumento)}</TableCell>
                    <TableCell>{doc.nombreBanco || doc.codigoBanco || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {doc.nombreCliente || doc.rutCliente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {doc.nombreDeudor || doc.rutDeudor}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(doc.montoDocumento)}
                    </TableCell>
                    <TableCell>{getEstadoChip(doc.estadoDocumento)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {documentos.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Total: {documentos.length} documentos
            </Typography>
            <Typography variant="h6">
              Monto Total: {formatCurrency(documentos.reduce((sum, d) => sum + d.montoDocumento, 0))}
            </Typography>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Arqueo;
