// ====================================================
// Contrato Global en Pesos - Migrado de F_LE1700.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Breadcrumbs,
  Link,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tooltip,
  CircularProgress,
  Chip,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Description as ContratoIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  Business as ClienteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';


// ====== Interfaces ======
interface ContratoMarco {
  id: number;
  rutCliente: number;
  dvCliente: string;
  rutFormateado: string;
  nombreCliente: string;
  numeroContrato: number;
  fechaSolicitud: string;
  fechaResolucion?: string;
  montoSolicitado: number;
  montoAprobado: number;
  montoDisponible: number;
  estadoSolicitud: number;
  descripcionEstadoSolicitud: string;
  estadoLinea: number;
  descripcionEstadoLinea: string;
  tasaNegocio?: number;
  spread?: number;
  codigoNotaria?: number;
  nombreNotaria?: string;
  fechaEscritura?: string;
  numeroEscritura?: string;
  observaciones?: string;
  porcentajeUtilizacion: number;
}



const estadosSolicitud = [
  { valor: 1, descripcion: 'Pendiente', color: 'warning' },
  { valor: 2, descripcion: 'Aprobado', color: 'success' },
  { valor: 3, descripcion: 'Rechazado', color: 'error' },
  { valor: 4, descripcion: 'Anulado', color: 'default' },
];

const estadosLinea = [
  { valor: 1, descripcion: 'Activa', color: 'success' },
  { valor: 2, descripcion: 'Suspendida', color: 'warning' },
  { valor: 3, descripcion: 'Bloqueada', color: 'error' },
  { valor: 4, descripcion: 'Vencida', color: 'error' },
  { valor: 9, descripcion: 'Cerrada', color: 'default' },
];

// ====== Componente Principal ======
const ContratoGlobal: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [contratos, setContratos] = useState<ContratoMarco[]>([]);
  
  // Filtros
  const [rutCliente, setRutCliente] = useState('');
  const [estadoSolicitud, setEstadoSolicitud] = useState<number | ''>('');
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(null);
  
  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'new' | 'edit' | 'view'>('new');
  const [contratoSeleccionado, setContratoSeleccionado] = useState<ContratoMarco | null>(null);
  
  // Dialog Aprobar/Rechazar
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);
  const [montoAprobar, setMontoAprobar] = useState(0);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  
  // Form
  const [formData, setFormData] = useState({
    rutCliente: 0,
    dvCliente: '',
    fechaSolicitud: dayjs(),
    montoSolicitado: 0,
    tasaNegocio: 0,
    spread: 0,
    codigoNotaria: '',
    observaciones: '',
    // Para edición
    estadoLinea: 1,
    fechaEscritura: null as Dayjs | null,
    numeroEscritura: '',
  });

  useEffect(() => {
    cargarContratos();
  }, []);

  // ====== API Calls ======
  const cargarContratos = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (rutCliente) params.append('rutCliente', rutCliente);
      if (estadoSolicitud) params.append('estadoSolicitud', estadoSolicitud.toString());
      if (fechaDesde) params.append('fechaDesde', fechaDesde.format('YYYY-MM-DD'));
      if (fechaHasta) params.append('fechaHasta', fechaHasta.format('YYYY-MM-DD'));

      const response = await fetch(`/api/legal/contratos?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar contratos');
      
      const data = await response.json();
      setContratos(data);
    } catch (err) {
      setError('Error al cargar contratos marco');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const guardarContrato = async () => {
    if (!formData.rutCliente || formData.montoSolicitado <= 0) {
      setError('Complete los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const payload = dialogMode === 'new' 
        ? {
            rutCliente: formData.rutCliente,
            dvCliente: formData.dvCliente,
            fechaSolicitud: formData.fechaSolicitud.toISOString(),
            montoSolicitado: formData.montoSolicitado,
            tasaNegocio: formData.tasaNegocio || null,
            spread: formData.spread || null,
            codigoNotaria: formData.codigoNotaria ? parseInt(formData.codigoNotaria) : null,
            observaciones: formData.observaciones,
          }
        : {
            estadoLinea: formData.estadoLinea,
            tasaNegocio: formData.tasaNegocio || null,
            spread: formData.spread || null,
            codigoNotaria: formData.codigoNotaria ? parseInt(formData.codigoNotaria) : null,
            fechaEscritura: formData.fechaEscritura?.toISOString(),
            numeroEscritura: formData.numeroEscritura,
            observaciones: formData.observaciones,
          };

      const url = dialogMode === 'new'
        ? '/api/legal/contratos'
        : `/api/legal/contratos/${contratoSeleccionado?.id}`;

      const response = await fetch(url, {
        method: dialogMode === 'new' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar contrato');
      }

      setSuccess(dialogMode === 'new' ? 'Contrato creado exitosamente' : 'Contrato actualizado exitosamente');
      setOpenDialog(false);
      cargarContratos();
    } catch (err: any) {
      setError(err.message || 'Error al guardar contrato');
    } finally {
      setLoading(false);
    }
  };

  const aprobarContrato = async () => {
    if (!contratoSeleccionado || montoAprobar <= 0) {
      setError('Ingrese un monto válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/legal/contratos/${contratoSeleccionado.id}/aprobar?montoAprobado=${montoAprobar}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al aprobar contrato');

      setSuccess('Contrato aprobado exitosamente');
      setOpenAprobar(false);
      cargarContratos();
    } catch (err) {
      setError('Error al aprobar contrato');
    } finally {
      setLoading(false);
    }
  };

  const rechazarContrato = async () => {
    if (!contratoSeleccionado) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/legal/contratos/${contratoSeleccionado.id}/rechazar?motivo=${encodeURIComponent(motivoRechazo || 'Sin especificar')}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al rechazar contrato');

      setSuccess('Contrato rechazado');
      setOpenRechazar(false);
      cargarContratos();
    } catch (err) {
      setError('Error al rechazar contrato');
    } finally {
      setLoading(false);
    }
  };

  const eliminarContrato = async (id: number) => {
    if (!confirm('¿Está seguro de anular este contrato?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/legal/contratos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al anular contrato');

      setSuccess('Contrato anulado');
      cargarContratos();
    } catch (err) {
      setError('Error al anular contrato');
    } finally {
      setLoading(false);
    }
  };

  // ====== Handlers ======
  const handleNuevo = () => {
    setFormData({
      rutCliente: 0,
      dvCliente: '',
      fechaSolicitud: dayjs(),
      montoSolicitado: 0,
      tasaNegocio: 0,
      spread: 0,
      codigoNotaria: '',
      observaciones: '',
      estadoLinea: 1,
      fechaEscritura: null,
      numeroEscritura: '',
    });
    setDialogMode('new');
    setOpenDialog(true);
  };

  const handleEditar = (contrato: ContratoMarco) => {
    setContratoSeleccionado(contrato);
    setFormData({
      rutCliente: contrato.rutCliente,
      dvCliente: contrato.dvCliente,
      fechaSolicitud: dayjs(contrato.fechaSolicitud),
      montoSolicitado: contrato.montoSolicitado,
      tasaNegocio: contrato.tasaNegocio || 0,
      spread: contrato.spread || 0,
      codigoNotaria: contrato.codigoNotaria?.toString() || '',
      observaciones: contrato.observaciones || '',
      estadoLinea: contrato.estadoLinea,
      fechaEscritura: contrato.fechaEscritura ? dayjs(contrato.fechaEscritura) : null,
      numeroEscritura: contrato.numeroEscritura || '',
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleAprobar = (contrato: ContratoMarco) => {
    setContratoSeleccionado(contrato);
    setMontoAprobar(contrato.montoSolicitado);
    setOpenAprobar(true);
  };

  const handleRechazar = (contrato: ContratoMarco) => {
    setContratoSeleccionado(contrato);
    setMotivoRechazo('');
    setOpenRechazar(true);
  };

  // ====== Helpers ======
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  const getEstadoSolicitudColor = (estado: number): 'default' | 'success' | 'warning' | 'error' => {
    const e = estadosSolicitud.find(s => s.valor === estado);
    return (e?.color || 'default') as any;
  };


  // Filtrar por tabs
  const contratosFiltrados = contratos.filter(c => {
    if (tabValue === 0) return true; // Todos
    if (tabValue === 1) return c.estadoSolicitud === 1; // Pendientes
    if (tabValue === 2) return c.estadoSolicitud === 2; // Aprobados
    if (tabValue === 3) return c.estadoSolicitud === 3; // Rechazados
    return true;
  });

  // Resumen
  const resumen = {
    total: contratos.length,
    pendientes: contratos.filter(c => c.estadoSolicitud === 1).length,
    aprobados: contratos.filter(c => c.estadoSolicitud === 2).length,
    rechazados: contratos.filter(c => c.estadoSolicitud === 3).length,
    montoAprobado: contratos.filter(c => c.estadoSolicitud === 2).reduce((sum, c) => sum + c.montoAprobado, 0),
    montoDisponible: contratos.filter(c => c.estadoSolicitud === 2).reduce((sum, c) => sum + c.montoDisponible, 0),
  };

  // ====== Render ======
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/legal')}
          >
            Legal
          </Link>
          <Typography color="text.primary">Contrato Global en Pesos</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/legal')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              <ContratoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Contrato Global en Pesos
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarContratos}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNuevo}
            >
              Nuevo Contrato
            </Button>
          </Box>
        </Box>

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Cliente"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                placeholder="12345678"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={estadoSolicitud}
                  label="Estado"
                  onChange={(e) => setEstadoSolicitud(e.target.value as number)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {estadosSolicitud.map((e) => (
                    <MenuItem key={e.valor} value={e.valor}>{e.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <DatePicker
                label="Fecha Desde"
                value={fechaDesde}
                onChange={(Dayjs) => setFechaDesde(Dayjs)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <DatePicker
                label="Fecha Hasta"
                value={fechaHasta}
                onChange={(Dayjs) => setFechaHasta(Dayjs)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={cargarContratos}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Total</Typography>
                <Typography variant="h4" color="primary">{resumen.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography color="warning.dark" gutterBottom>Pendientes</Typography>
                <Typography variant="h4" color="warning.dark">{resumen.pendientes}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography color="success.dark" gutterBottom>Aprobados</Typography>
                <Typography variant="h4" color="success.dark">{resumen.aprobados}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Monto Aprobado</Typography>
                <Typography variant="h6" color="success.main">{formatCurrency(resumen.montoAprobado)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Monto Disponible</Typography>
                <Typography variant="h6" color="info.main">{formatCurrency(resumen.montoDisponible)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label={`Todos (${resumen.total})`} />
            <Tab label={`Pendientes (${resumen.pendientes})`} />
            <Tab label={`Aprobados (${resumen.aprobados})`} />
            <Tab label={`Rechazados (${resumen.rechazados})`} />
          </Tabs>
        </Paper>

        {/* Tabla */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>N° Contrato</TableCell>
                  <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                  <TableCell sx={{ color: 'white' }}>Fecha Solicitud</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Monto Solicitado</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Monto Aprobado</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Utilización</TableCell>
                  <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contratosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No hay contratos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  contratosFiltrados.map((contrato) => (
                    <TableRow key={contrato.id} hover>
                      <TableCell>
                        <Typography fontWeight="bold">#{contrato.numeroContrato}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{contrato.nombreCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {contrato.rutFormateado}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDayjs(contrato.fechaSolicitud)}</TableCell>
                      <TableCell align="right">{formatCurrency(contrato.montoSolicitado)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {contrato.montoAprobado > 0 ? formatCurrency(contrato.montoAprobado) : '-'}
                      </TableCell>
                      <TableCell align="center">
                        {contrato.montoAprobado > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={contrato.porcentajeUtilizacion}
                              sx={{ width: 60, height: 8, borderRadius: 4 }}
                              color={contrato.porcentajeUtilizacion > 80 ? 'error' : contrato.porcentajeUtilizacion > 50 ? 'warning' : 'success'}
                            />
                            <Typography variant="caption">{contrato.porcentajeUtilizacion.toFixed(0)}%</Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={contrato.descripcionEstadoSolicitud}
                          color={getEstadoSolicitudColor(contrato.estadoSolicitud)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {contrato.estadoSolicitud === 1 && (
                          <>
                            <Tooltip title="Aprobar">
                              <IconButton size="small" color="success" onClick={() => handleAprobar(contrato)}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Rechazar">
                              <IconButton size="small" color="error" onClick={() => handleRechazar(contrato)}>
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEditar(contrato)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Anular">
                          <IconButton size="small" color="error" onClick={() => eliminarContrato(contrato.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Dialog Nuevo/Editar Contrato */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <ContratoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {dialogMode === 'new' ? 'Nuevo Contrato Global' : 'Editar Contrato Global'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Cliente */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  <ClienteIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
                  Datos del Cliente
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="RUT Cliente"
                  type="number"
                  value={formData.rutCliente || ''}
                  onChange={(e) => setFormData({ ...formData, rutCliente: parseInt(e.target.value) || 0 })}
                  disabled={dialogMode === 'edit'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="DV"
                  value={formData.dvCliente}
                  onChange={(e) => setFormData({ ...formData, dvCliente: e.target.value.toUpperCase() })}
                  inputProps={{ maxLength: 1 }}
                  disabled={dialogMode === 'edit'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha Solicitud"
                  value={formData.fechaSolicitud}
                  onChange={(value) => setFormData({ ...formData, fechaSolicitud: value || dayjs() })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  disabled={dialogMode === 'edit'}
                />
              </Grid>

              {/* Montos y Tasas */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Montos y Tasas
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Monto Solicitado"
                  type="number"
                  value={formData.montoSolicitado || ''}
                  onChange={(e) => setFormData({ ...formData, montoSolicitado: parseFloat(e.target.value) || 0 })}
                  disabled={dialogMode === 'edit'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tasa Negocio (%)"
                  type="number"
                  value={formData.tasaNegocio || ''}
                  onChange={(e) => setFormData({ ...formData, tasaNegocio: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Spread (%)"
                  type="number"
                  value={formData.spread || ''}
                  onChange={(e) => setFormData({ ...formData, spread: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.01 }}
                />
              </Grid>

              {/* Notaría y Escritura (solo edición) */}
              {dialogMode === 'edit' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                      Datos Notariales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Código Notaría"
                      value={formData.codigoNotaria}
                      onChange={(e) => setFormData({ ...formData, codigoNotaria: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <DatePicker
                      label="Fecha Escritura"
                      value={formData.fechaEscritura}
                      onChange={(Dayjs) => setFormData({ ...formData, fechaEscritura: Dayjs })}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Número Escritura"
                      value={formData.numeroEscritura}
                      onChange={(e) => setFormData({ ...formData, numeroEscritura: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado Línea</InputLabel>
                      <Select
                        value={formData.estadoLinea}
                        label="Estado Línea"
                        onChange={(e) => setFormData({ ...formData, estadoLinea: Number(e.target.value) })}
                      >
                        {estadosLinea.map((e) => (
                          <MenuItem key={e.valor} value={e.valor}>{e.descripcion}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {/* Observaciones */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={guardarContrato} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Aprobar */}
        <Dialog open={openAprobar} onClose={() => setOpenAprobar(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            <ApproveIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
            Aprobar Contrato
          </DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Contrato #{contratoSeleccionado?.numeroContrato}
            </Typography>
            <Typography gutterBottom color="textSecondary">
              Cliente: {contratoSeleccionado?.nombreCliente}
            </Typography>
            <TextField
              fullWidth
              label="Monto a Aprobar"
              type="number"
              value={montoAprobar}
              onChange={(e) => setMontoAprobar(parseFloat(e.target.value) || 0)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAprobar(false)}>Cancelar</Button>
            <Button variant="contained" color="success" onClick={aprobarContrato} disabled={loading}>
              Aprobar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Rechazar */}
        <Dialog open={openRechazar} onClose={() => setOpenRechazar(false)} maxWidth="xs" fullWidth>
          <DialogTitle>
            <RejectIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'error.main' }} />
            Rechazar Contrato
          </DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Contrato #{contratoSeleccionado?.numeroContrato}
            </Typography>
            <TextField
              fullWidth
              label="Motivo del Rechazo"
              multiline
              rows={3}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenRechazar(false)}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={rechazarContrato} disabled={loading}>
              Rechazar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default ContratoGlobal;
