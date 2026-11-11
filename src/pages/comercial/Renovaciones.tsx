// ====================================================
// Gestión de Renovaciones - Migrado de F_CM1500.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  SwapHoriz as RenovarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

// ====== Interfaces ======
interface Renovacion {
  numeroRenovacion: number;
  tipoDocumentoOriginal: number;
  tipoDocumentoOriginalDescripcion: string;
  numeroDocumentoOriginal: string;
  numeroOperacionOriginal: number;
  tipoDocumentoNuevo: number;
  tipoDocumentoNuevoDescripcion: string;
  numeroDocumentoNuevo: string;
  numeroOperacionNueva: number | null;
  rutCliente: number;
  rutClienteFormateado: string;
  nombreCliente: string;
  rutDeudor: number;
  rutDeudorFormateado: string;
  nombreDeudor: string;
  montoOriginal: number;
  montoNuevo: number;
  fechaVencimientoOriginal: string;
  fechaVencimientoNueva: string;
  diasPlazo: number;
  observaciones: string;
  estado: number;
  estadoDescripcion: string;
  fechaRenovacion: string;
  usuarioRegistra: string;
}

interface DocumentoParaRenovar {
  numeroOperacion: number;
  tipoDocumento: number;
  numeroDocumento: string;
  rutCliente: number;
  nombreCliente: string;
  rutDeudor: number;
  nombreDeudor: string;
  montoDocumento: number;
  saldoDocumento: number;
  fechaVencimiento: string;
  diasVencido: number;
}

interface Filtro {
  rutCliente: string;
  estado: string;
  fechaDesde: Dayjs | null;
  fechaHasta: Dayjs | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

// ====== Componente Principal ======
const Renovaciones: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [renovaciones, setRenovaciones] = useState<Renovacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogNueva, setDialogNueva] = useState(false);
  const [dialogProcesar, setDialogProcesar] = useState(false);
  const [renovacionSeleccionada, setRenovacionSeleccionada] = useState<Renovacion | null>(null);
  const [accionProcesar, setAccionProcesar] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [observacionesProcesar, setObservacionesProcesar] = useState('');
  
  const [filtro, setFiltro] = useState<Filtro>({
    rutCliente: '',
    estado: '',
    fechaDesde: null,
    fechaHasta: null,
  });

  // Form nueva renovación
  const [tipoDocBuscar, setTipoDocBuscar] = useState<string>('1');
  const [numeroDocBuscar, setNumeroDocBuscar] = useState<string>('');
  const [documentoEncontrado, setDocumentoEncontrado] = useState<DocumentoParaRenovar | null>(null);
  const [nuevaRenovacion, setNuevaRenovacion] = useState({
    tipoDocumentoNuevo: 1,
    numeroDocumentoNuevo: '',
    montoNuevo: 0,
    fechaVencimientoNueva: null as Dayjs | null,
    diasPlazo: 30,
    observaciones: '',
  });

  useEffect(() => {
    cargarRenovaciones();
  }, []);

  // ====== API Calls ======
  const cargarRenovaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtro.rutCliente) params.append('rutCliente', filtro.rutCliente);
      if (filtro.estado) params.append('estado', filtro.estado);
      if (filtro.fechaDesde) params.append('fechaDesde', filtro.fechaDesde.toISOString());
      if (filtro.fechaHasta) params.append('fechaHasta', filtro.fechaHasta.toISOString());

      const response = await fetch(`/api/comercial/renovaciones?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar renovaciones');
      
      const data = await response.json();
      setRenovaciones(data);
    } catch (err) {
      setError('Error al cargar renovaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buscarDocumento = async () => {
    if (!tipoDocBuscar || !numeroDocBuscar) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/comercial/renovaciones/buscar-documento?tipoDocumento=${tipoDocBuscar}&numeroDocumento=${numeroDocBuscar}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        setError('Documento no encontrado o no apto para renovación');
        setDocumentoEncontrado(null);
        return;
      }
      
      const data = await response.json();
      setDocumentoEncontrado(data);
      // Prellenar monto nuevo con saldo actual
      setNuevaRenovacion(prev => ({
        ...prev,
        montoNuevo: data.saldoDocumento,
      }));
      setError(null);
    } catch (err) {
      setError('Error al buscar documento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const crearRenovacion = async () => {
    if (!documentoEncontrado || !nuevaRenovacion.fechaVencimientoNueva) {
      setError('Complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tipoDocumentoOriginal: documentoEncontrado.tipoDocumento,
        numeroDocumentoOriginal: documentoEncontrado.numeroDocumento,
        numeroOperacionOriginal: documentoEncontrado.numeroOperacion,
        tipoDocumentoNuevo: nuevaRenovacion.tipoDocumentoNuevo,
        numeroDocumentoNuevo: nuevaRenovacion.numeroDocumentoNuevo,
        montoNuevo: nuevaRenovacion.montoNuevo,
        fechaVencimientoNueva: nuevaRenovacion.fechaVencimientoNueva.toISOString(),
        diasPlazo: nuevaRenovacion.diasPlazo,
        observaciones: nuevaRenovacion.observaciones,
      };

      const response = await fetch('/api/comercial/renovaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear renovación');
      }

      setSuccess('Renovación creada exitosamente');
      setDialogNueva(false);
      limpiarFormulario();
      cargarRenovaciones();
    } catch (err: any) {
      setError(err.message || 'Error al crear renovación');
    } finally {
      setLoading(false);
    }
  };

  const procesarRenovacion = async () => {
    if (!renovacionSeleccionada) return;

    setLoading(true);
    try {
      const endpoint = accionProcesar === 'aprobar' 
        ? `/api/comercial/renovaciones/${renovacionSeleccionada.numeroRenovacion}/aprobar`
        : `/api/comercial/renovaciones/${renovacionSeleccionada.numeroRenovacion}/rechazar`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ motivo: observacionesProcesar }),
      });

      if (!response.ok) throw new Error(`Error al ${accionProcesar} renovación`);

      setSuccess(`Renovación ${accionProcesar === 'aprobar' ? 'aprobada' : 'rechazada'} exitosamente`);
      setDialogProcesar(false);
      setObservacionesProcesar('');
      cargarRenovaciones();
    } catch (err) {
      setError(`Error al ${accionProcesar} renovación`);
    } finally {
      setLoading(false);
    }
  };

  // ====== Helpers ======
  const limpiarFormulario = () => {
    setTipoDocBuscar('1');
    setNumeroDocBuscar('');
    setDocumentoEncontrado(null);
    setNuevaRenovacion({
      tipoDocumentoNuevo: 1,
      numeroDocumentoNuevo: '',
      montoNuevo: 0,
      fechaVencimientoNueva: null,
      diasPlazo: 30,
      observaciones: '',
    });
  };

  const getEstadoColor = (estado: number): 'warning' | 'success' | 'error' | 'default' => {
    switch (estado) {
      case 1: return 'warning';  // Pendiente
      case 2: return 'success';  // Aprobada
      case 3: return 'error';    // Rechazada
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  // ====== Render ======
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            <RenovarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Renovación de Documentos
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogNueva(true)}
          >
            Nueva Renovación
          </Button>
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

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Listado Renovaciones" />
            <Tab label="Pendientes de Aprobación" />
          </Tabs>
        </Paper>

        {/* Tab 0: Listado General */}
        <TabPanel value={tabValue} index={0}>
          {/* Filtros */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Filtros de Búsqueda
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  label="RUT Cliente"
                  value={filtro.rutCliente}
                  onChange={(e) => setFiltro({ ...filtro, rutCliente: e.target.value })}
                  size="small"
                  placeholder="12345678"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={filtro.estado}
                    label="Estado"
                    onChange={(e) => setFiltro({ ...filtro, estado: e.target.value })}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="1">Pendiente</MenuItem>
                    <MenuItem value="2">Aprobada</MenuItem>
                    <MenuItem value="3">Rechazada</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <DatePicker
                  label="Fecha Desde"
                  value={filtro.fechaDesde}
                  onChange={(newValue) => setFiltro({ ...filtro, fechaDesde: newValue as Dayjs | null })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <DatePicker
                  label="Fecha Hasta"
                  value={filtro.fechaHasta}
                  onChange={(newValue) => setFiltro({ ...filtro, fechaHasta: newValue as Dayjs | null })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={cargarRenovaciones}
                  >
                    Buscar
                  </Button>
                  <IconButton onClick={cargarRenovaciones} title="Refrescar">
                    <RefreshIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabla de Renovaciones */}
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}>N°</TableCell>
                    <TableCell sx={{ color: 'white' }}>Doc. Original</TableCell>
                    <TableCell sx={{ color: 'white' }}>Doc. Nuevo</TableCell>
                    <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white' }}>Deudor</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Orig.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Monto Nuevo</TableCell>
                    <TableCell sx={{ color: 'white' }}>Vto. Nuevo</TableCell>
                    <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renovaciones.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        No se encontraron renovaciones
                      </TableCell>
                    </TableRow>
                  ) : (
                    renovaciones.map((r) => (
                      <TableRow key={r.numeroRenovacion} hover>
                        <TableCell>{r.numeroRenovacion}</TableCell>
                        <TableCell>
                          <Typography variant="body2">{r.tipoDocumentoOriginalDescripcion}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {r.numeroDocumentoOriginal}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{r.tipoDocumentoNuevoDescripcion}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {r.numeroDocumentoNuevo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{r.nombreCliente}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {r.rutClienteFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{r.nombreDeudor}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {r.rutDeudorFormateado}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(r.montoOriginal)}</TableCell>
                        <TableCell align="right">{formatCurrency(r.montoNuevo)}</TableCell>
                        <TableCell>{formatDayjs(r.fechaVencimientoNueva)}</TableCell>
                        <TableCell>
                          <Chip
                            label={r.estadoDescripcion}
                            color={getEstadoColor(r.estado)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {r.estado === 1 && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="Aprobar">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setRenovacionSeleccionada(r);
                                    setAccionProcesar('aprobar');
                                    setDialogProcesar(true);
                                  }}
                                >
                                  <ApproveIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Rechazar">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setRenovacionSeleccionada(r);
                                    setAccionProcesar('rechazar');
                                    setDialogProcesar(true);
                                  }}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </TabPanel>

        {/* Tab 1: Pendientes */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Renovaciones Pendientes de Aprobación
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'warning.light' }}>
                    <TableCell>N°</TableCell>
                    <TableCell>Documento Original</TableCell>
                    <TableCell>Documento Nuevo</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell>Fecha Registro</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {renovaciones.filter(r => r.estado === 1).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No hay renovaciones pendientes
                      </TableCell>
                    </TableRow>
                  ) : (
                    renovaciones.filter(r => r.estado === 1).map((r) => (
                      <TableRow key={r.numeroRenovacion} hover>
                        <TableCell>{r.numeroRenovacion}</TableCell>
                        <TableCell>
                          {r.tipoDocumentoOriginalDescripcion} - {r.numeroDocumentoOriginal}
                        </TableCell>
                        <TableCell>
                          {r.tipoDocumentoNuevoDescripcion} - {r.numeroDocumentoNuevo}
                        </TableCell>
                        <TableCell>{r.nombreCliente}</TableCell>
                        <TableCell align="right">{formatCurrency(r.montoNuevo)}</TableCell>
                        <TableCell>{formatDayjs(r.fechaRenovacion)}</TableCell>
                        <TableCell>{r.usuarioRegistra}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<ApproveIcon />}
                              onClick={() => {
                                setRenovacionSeleccionada(r);
                                setAccionProcesar('aprobar');
                                setDialogProcesar(true);
                              }}
                            >
                              Aprobar
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<RejectIcon />}
                              onClick={() => {
                                setRenovacionSeleccionada(r);
                                setAccionProcesar('rechazar');
                                setDialogProcesar(true);
                              }}
                            >
                              Rechazar
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Dialog: Nueva Renovación */}
        <Dialog open={dialogNueva} onClose={() => setDialogNueva(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <RenovarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Nueva Renovación de Documento
          </DialogTitle>
          <DialogContent dividers>
            {/* Buscar documento original */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                  1. Buscar Documento a Renovar
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo Documento</InputLabel>
                      <Select
                        value={tipoDocBuscar}
                        label="Tipo Documento"
                        onChange={(e) => setTipoDocBuscar(e.target.value)}
                      >
                        <MenuItem value="1">Factura</MenuItem>
                        <MenuItem value="2">Cheque</MenuItem>
                        <MenuItem value="3">Letra</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Número Documento"
                      value={numeroDocBuscar}
                      onChange={(e) => setNumeroDocBuscar(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={buscarDocumento}
                      disabled={loading}
                    >
                      Buscar
                    </Button>
                  </Grid>
                </Grid>

                {/* Datos documento encontrado */}
                {documentoEncontrado && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="textSecondary">Operación</Typography>
                        <Typography variant="body2">{documentoEncontrado.numeroOperacion}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="textSecondary">Cliente</Typography>
                        <Typography variant="body2">{documentoEncontrado.nombreCliente}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="textSecondary">Deudor</Typography>
                        <Typography variant="body2">{documentoEncontrado.nombreDeudor}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="textSecondary">Monto</Typography>
                        <Typography variant="body2">{formatCurrency(documentoEncontrado.montoDocumento)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="textSecondary">Saldo</Typography>
                        <Typography variant="body2" color="primary">{formatCurrency(documentoEncontrado.saldoDocumento)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="textSecondary">Vencimiento</Typography>
                        <Typography variant="body2">{formatDayjs(documentoEncontrado.fechaVencimiento)}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="textSecondary">Días Vencido</Typography>
                        <Typography variant="body2" color={documentoEncontrado.diasVencido > 0 ? 'error' : 'inherit'}>
                          {documentoEncontrado.diasVencido}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Datos nuevo documento */}
            {documentoEncontrado && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                    2. Datos del Nuevo Documento
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipo Documento Nuevo</InputLabel>
                        <Select
                          value={nuevaRenovacion.tipoDocumentoNuevo}
                          label="Tipo Documento Nuevo"
                          onChange={(e) => setNuevaRenovacion({ ...nuevaRenovacion, tipoDocumentoNuevo: Number(e.target.value) })}
                        >
                          <MenuItem value={1}>Factura</MenuItem>
                          <MenuItem value={2}>Cheque</MenuItem>
                          <MenuItem value={3}>Letra</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Número Documento Nuevo"
                        value={nuevaRenovacion.numeroDocumentoNuevo}
                        onChange={(e) => setNuevaRenovacion({ ...nuevaRenovacion, numeroDocumentoNuevo: e.target.value })}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Monto Nuevo"
                        value={nuevaRenovacion.montoNuevo}
                        onChange={(e) => setNuevaRenovacion({ ...nuevaRenovacion, montoNuevo: Number(e.target.value) })}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <DatePicker
                        label="Nuevo Vencimiento"
                        value={nuevaRenovacion.fechaVencimientoNueva}
                        onChange={(Dayjs) => setNuevaRenovacion({ ...nuevaRenovacion, fechaVencimientoNueva: Dayjs })}
                        slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Días Plazo"
                        value={nuevaRenovacion.diasPlazo}
                        onChange={(e) => setNuevaRenovacion({ ...nuevaRenovacion, diasPlazo: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                        label="Observaciones"
                        value={nuevaRenovacion.observaciones}
                        onChange={(e) => setNuevaRenovacion({ ...nuevaRenovacion, observaciones: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setDialogNueva(false); limpiarFormulario(); }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={crearRenovacion}
              disabled={loading || !documentoEncontrado}
            >
              {loading ? <CircularProgress size={24} /> : 'Crear Renovación'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog: Procesar (Aprobar/Rechazar) */}
        <Dialog open={dialogProcesar} onClose={() => setDialogProcesar(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {accionProcesar === 'aprobar' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                <ApproveIcon sx={{ mr: 1 }} />
                Aprobar Renovación
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                <RejectIcon sx={{ mr: 1 }} />
                Rechazar Renovación
              </Box>
            )}
          </DialogTitle>
          <DialogContent>
            {renovacionSeleccionada && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Renovación N°:</strong> {renovacionSeleccionada.numeroRenovacion}
                </Typography>
                <Typography variant="body2">
                  <strong>Cliente:</strong> {renovacionSeleccionada.nombreCliente}
                </Typography>
                <Typography variant="body2">
                  <strong>Documento Original:</strong> {renovacionSeleccionada.tipoDocumentoOriginalDescripcion} - {renovacionSeleccionada.numeroDocumentoOriginal}
                </Typography>
                <Typography variant="body2">
                  <strong>Documento Nuevo:</strong> {renovacionSeleccionada.tipoDocumentoNuevoDescripcion} - {renovacionSeleccionada.numeroDocumentoNuevo}
                </Typography>
                <Typography variant="body2">
                  <strong>Monto:</strong> {formatCurrency(renovacionSeleccionada.montoNuevo)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <TextField
              fullWidth
              multiline
              rows={3}
              label={accionProcesar === 'rechazar' ? 'Motivo del Rechazo' : 'Observaciones (opcional)'}
              value={observacionesProcesar}
              onChange={(e) => setObservacionesProcesar(e.target.value)}
              required={accionProcesar === 'rechazar'}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogProcesar(false)}>Cancelar</Button>
            <Button
              variant="contained"
              color={accionProcesar === 'aprobar' ? 'success' : 'error'}
              onClick={procesarRenovacion}
              disabled={loading || (accionProcesar === 'rechazar' && !observacionesProcesar)}
            >
              {loading ? <CircularProgress size={24} /> : (accionProcesar === 'aprobar' ? 'Aprobar' : 'Rechazar')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Renovaciones;
