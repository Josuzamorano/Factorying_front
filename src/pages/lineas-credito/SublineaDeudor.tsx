// ====================================================
// Sublínea por Deudor - Migrado de F_LC*.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Breadcrumbs,
  Link,
  Container,
  Alert,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Person as DeudorIcon,
  CheckCircle as VerifiedIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


// ====== Interfaces ======
interface SublineaDeudor {
  rutCliente: number;
  numeroLinea: number;
  rutDeudor: number;
  nombreDeudor: string;
  tipoDocumento: number;
  descripcionTipoDocumento: string;
  tipoMoneda: number;
  descripcionMoneda: string;
  porcentajeAnticipo: number;
  montoSolicitado: number;
  montoAprobado: number;
  montoDisponible: number;
  fechaSolicitud: string;
  fechaResolucion?: string;
  fechaVencimiento?: string;
  estadoLinea: number;
  descripcionEstado: string;
  verificado: boolean;
}

interface LineaCredito {
  rutCliente: number;
  numeroLinea: number;
  nombreCliente: string;
  montoAprobado: number;
  montoDisponible: number;
  estadoLinea: number;
  descripcionEstadoLinea: string;
}

interface Deudor {
  rutDeudor: number;
  nombreDeudor: string;
  rutFormateado: string;
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
const SublineaDeudor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const rutClienteParam = searchParams.get('rutCliente');
  const numeroLineaParam = searchParams.get('numeroLinea');

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Búsqueda por Línea
  const [rutCliente, setRutCliente] = useState(rutClienteParam || '');
  const [numeroLinea, setNumeroLinea] = useState(numeroLineaParam || '');
  
  // Búsqueda por Deudor
  const [rutDeudorBuscar, setRutDeudorBuscar] = useState('');
  
  // Datos
  const [lineaCredito, setLineaCredito] = useState<LineaCredito | null>(null);
  const [sublineas, setSublineas] = useState<SublineaDeudor[]>([]);
  const [sublineasPorDeudor, setSublineasPorDeudor] = useState<SublineaDeudor[]>([]);
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  
  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'new' | 'edit'>('new');
  
  // Form
  const [formData, setFormData] = useState({
    rutDeudor: 0,
    tipoDocumento: 1,
    tipoMoneda: 1,
    porcentajeAnticipo: 80,
    montoSolicitado: 0,
    fechaSolicitud: dayjs(),
    estadoLinea: 1,
    verificado: false,
  });
  
  const [deudorSeleccionado, setDeudorSeleccionado] = useState<Deudor | null>(null);
  // Variable usada para tracking del item seleccionado en edición
  const [, setSublineaSeleccionada] = useState<SublineaDeudor | null>(null);

  useEffect(() => {
    if (rutClienteParam && numeroLineaParam) {
      buscarSublineas();
    }
    cargarDeudores();
  }, [rutClienteParam, numeroLineaParam]);

  // ====== API Calls ======
  const cargarDeudores = async () => {
    try {
      const response = await fetch('/api/deudores?pageSize=1000', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDeudores(data.items || data);
      }
    } catch (err) {
      console.error('Error cargando deudores:', err);
    }
  };

  const buscarSublineas = async () => {
    if (!rutCliente || !numeroLinea) {
      setError('Ingrese RUT Cliente y Número de Línea');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Cargar línea de crédito
      const lineaResponse = await fetch(`/api/lineas-credito/${rutCliente}/${numeroLinea}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (lineaResponse.ok) {
        const lineaData = await lineaResponse.json();
        setLineaCredito(lineaData);
      }

      // Cargar sublíneas por deudor
      const response = await fetch(`/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-deudor`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar sublíneas');
      
      const data = await response.json();
      setSublineas(data);
    } catch (err) {
      setError('Error al cargar sublíneas por deudor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buscarPorDeudor = async () => {
    if (!rutDeudorBuscar) {
      setError('Ingrese el RUT del deudor');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/lineas-credito/deudor/${rutDeudorBuscar}/sublineas`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al buscar sublíneas del deudor');
      
      const data = await response.json();
      setSublineasPorDeudor(data);
    } catch (err) {
      setError('Error al buscar sublíneas del deudor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const guardarSublinea = async () => {
    if (!rutCliente || !numeroLinea || !formData.rutDeudor) {
      setError('Complete todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        rutCliente: parseInt(rutCliente),
        numeroLinea: parseInt(numeroLinea),
        rutDeudor: formData.rutDeudor,
        tipoDocumento: formData.tipoDocumento,
        tipoMoneda: formData.tipoMoneda,
        porcentajeAnticipo: formData.porcentajeAnticipo,
        montoSolicitado: formData.montoSolicitado,
        fechaSolicitud: formData.fechaSolicitud.toISOString(),
        estadoLinea: formData.estadoLinea,
        verificado: formData.verificado,
      };

      const url = dialogMode === 'new'
        ? `/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-deudor`
        : `/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-deudor/${formData.rutDeudor}/${formData.tipoDocumento}`;

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
        throw new Error(errorData.message || 'Error al guardar sublínea');
      }

      setSuccess(dialogMode === 'new' ? 'Sublínea creada exitosamente' : 'Sublínea actualizada exitosamente');
      setOpenDialog(false);
      buscarSublineas();
    } catch (err: any) {
      setError(err.message || 'Error al guardar sublínea');
    } finally {
      setLoading(false);
    }
  };

  const eliminarSublinea = async (rutDeudor: number, tipoDocumento: number) => {
    if (!confirm('¿Está seguro de eliminar esta sublínea?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-deudor/${rutDeudor}/${tipoDocumento}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al eliminar sublínea');

      setSuccess('Sublínea eliminada exitosamente');
      buscarSublineas();
    } catch (err) {
      setError('Error al eliminar sublínea');
    } finally {
      setLoading(false);
    }
  };

  // ====== Handlers ======
  const handleNueva = () => {
    setFormData({
      rutDeudor: 0,
      tipoDocumento: 1,
      tipoMoneda: 1,
      porcentajeAnticipo: 80,
      montoSolicitado: 0,
      fechaSolicitud: dayjs(),
      estadoLinea: 1,
      verificado: false,
    });
    setDeudorSeleccionado(null);
    setDialogMode('new');
    setOpenDialog(true);
  };

  const handleEditar = (sublinea: SublineaDeudor) => {
    setSublineaSeleccionada(sublinea);
    setFormData({
      rutDeudor: sublinea.rutDeudor,
      tipoDocumento: sublinea.tipoDocumento,
      tipoMoneda: sublinea.tipoMoneda,
      porcentajeAnticipo: sublinea.porcentajeAnticipo,
      montoSolicitado: sublinea.montoSolicitado,
      fechaSolicitud: dayjs(sublinea.fechaSolicitud),
      estadoLinea: sublinea.estadoLinea,
      verificado: sublinea.verificado,
    });
    setDeudorSeleccionado({ 
      rutDeudor: sublinea.rutDeudor, 
      nombreDeudor: sublinea.nombreDeudor,
      rutFormateado: sublinea.rutDeudor.toString()
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // ====== Helpers ======
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  const getEstadoColor = (estado: number): 'default' | 'success' | 'warning' | 'error' => {
    switch (estado) {
      case 1: return 'default';   // Pendiente
      case 2: return 'success';   // Aprobada
      case 3: return 'error';     // Rechazada
      case 4: return 'warning';   // Suspendida
      default: return 'default';
    }
  };

  const getUtilizacion = (aprobado: number, disponible: number) => {
    if (aprobado === 0) return 0;
    return ((aprobado - disponible) / aprobado) * 100;
  };

  // Calcular resumen
  const resumen = {
    totalDeudores: new Set(sublineas.map(s => s.rutDeudor)).size,
    totalSolicitado: sublineas.reduce((sum, s) => sum + s.montoSolicitado, 0),
    totalAprobado: sublineas.reduce((sum, s) => sum + s.montoAprobado, 0),
    totalDisponible: sublineas.reduce((sum, s) => sum + s.montoDisponible, 0),
    verificados: sublineas.filter(s => s.verificado).length,
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
            onClick={() => navigate('/lineas-credito')}
          >
            Líneas de Crédito
          </Link>
          <Typography color="text.primary">Sublínea por Deudor</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/lineas-credito')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              <DeudorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sublínea por Deudor
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNueva}
            disabled={!lineaCredito}
          >
            Nueva Sublínea
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

        {/* Tabs de búsqueda */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Buscar por Línea" />
            <Tab label="Buscar por Deudor" />
          </Tabs>

          {/* Tab 0: Por Línea */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="RUT Cliente"
                  value={rutCliente}
                  onChange={(e) => setRutCliente(e.target.value)}
                  size="small"
                  placeholder="12345678"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Número Línea"
                  value={numeroLinea}
                  onChange={(e) => setNumeroLinea(e.target.value)}
                  size="small"
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={buscarSublineas}
                  disabled={loading}
                >
                  Buscar
                </Button>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Tab 1: Por Deudor */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="RUT Deudor"
                  value={rutDeudorBuscar}
                  onChange={(e) => setRutDeudorBuscar(e.target.value)}
                  size="small"
                  placeholder="Ingrese RUT del deudor"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={buscarPorDeudor}
                  disabled={loading}
                >
                  Buscar Sublíneas
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Info Línea de Crédito (solo en Tab 0) */}
        {tabValue === 0 && lineaCredito && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="h6">{lineaCredito.nombreCliente}</Typography>
                <Typography variant="body2">
                  Línea N° {lineaCredito.numeroLinea} - RUT: {lineaCredito.rutCliente}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2">Monto Aprobado</Typography>
                <Typography variant="h6">{formatCurrency(lineaCredito.montoAprobado)}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="body2">Disponible</Typography>
                <Typography variant="h6">{formatCurrency(lineaCredito.montoDisponible)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Resumen (solo en Tab 0 con datos) */}
        {tabValue === 0 && sublineas.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Deudores
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {resumen.totalDeudores}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Solicitado
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(resumen.totalSolicitado)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Aprobado
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(resumen.totalAprobado)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Disponible
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {formatCurrency(resumen.totalDisponible)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Verificados
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {resumen.verificados}/{sublineas.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabla Sublíneas por Línea (Tab 0) */}
        {tabValue === 0 && (
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white' }}>Deudor</TableCell>
                    <TableCell sx={{ color: 'white' }}>Tipo Doc.</TableCell>
                    <TableCell sx={{ color: 'white' }}>Moneda</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">% Anticipo</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Solicitado</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Aprobado</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Disponible</TableCell>
                    <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                    <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sublineas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        {lineaCredito ? 'No hay sublíneas por deudor registradas' : 'Ingrese RUT y Línea para buscar'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sublineas.map((sub, idx) => (
                      <TableRow key={`${sub.rutDeudor}-${sub.tipoDocumento}-${idx}`} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{sub.nombreDeudor}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              RUT: {sub.rutDeudor}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={sub.descripcionTipoDocumento} size="small" />
                        </TableCell>
                        <TableCell>{sub.descripcionMoneda}</TableCell>
                        <TableCell align="center">{sub.porcentajeAnticipo}%</TableCell>
                        <TableCell align="right">{formatCurrency(sub.montoSolicitado)}</TableCell>
                        <TableCell align="right">{formatCurrency(sub.montoAprobado)}</TableCell>
                        <TableCell align="right">{formatCurrency(sub.montoDisponible)}</TableCell>
                        <TableCell>
                          {sub.fechaVencimiento ? formatDayjs(sub.fechaVencimiento) : '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip
                              label={sub.descripcionEstado}
                              color={getEstadoColor(sub.estadoLinea)}
                              size="small"
                            />
                            {sub.verificado && (
                              <Tooltip title="Verificado">
                                <VerifiedIcon color="success" fontSize="small" />
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEditar(sub)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => eliminarSublinea(sub.rutDeudor, sub.tipoDocumento)}
                            >
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
        )}

        {/* Tabla Sublíneas por Deudor (Tab 1) */}
        {tabValue === 1 && (
          <TableContainer component={Paper}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'secondary.main' }}>
                    <TableCell sx={{ color: 'white' }}>Cliente</TableCell>
                    <TableCell sx={{ color: 'white' }}>Línea</TableCell>
                    <TableCell sx={{ color: 'white' }}>Tipo Doc.</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Aprobado</TableCell>
                    <TableCell sx={{ color: 'white' }} align="right">Disponible</TableCell>
                    <TableCell sx={{ color: 'white' }} align="center">Utilización</TableCell>
                    <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sublineasPorDeudor.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Ingrese RUT del deudor para ver sus sublíneas
                      </TableCell>
                    </TableRow>
                  ) : (
                    sublineasPorDeudor.map((sub, idx) => {
                      const utilizacion = getUtilizacion(sub.montoAprobado, sub.montoDisponible);
                      return (
                        <TableRow key={`pd-${sub.rutCliente}-${sub.numeroLinea}-${idx}`} hover>
                          <TableCell>RUT: {sub.rutCliente}</TableCell>
                          <TableCell>Línea #{sub.numeroLinea}</TableCell>
                          <TableCell>{sub.descripcionTipoDocumento}</TableCell>
                          <TableCell align="right">{formatCurrency(sub.montoAprobado)}</TableCell>
                          <TableCell align="right">{formatCurrency(sub.montoDisponible)}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={utilizacion}
                                sx={{ width: 60, height: 8, borderRadius: 4 }}
                                color={utilizacion > 80 ? 'error' : utilizacion > 50 ? 'warning' : 'success'}
                              />
                              <Typography variant="caption">{utilizacion.toFixed(0)}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={sub.descripcionEstado}
                              color={getEstadoColor(sub.estadoLinea)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        )}

        {/* Dialog Nueva/Editar Sublínea */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <DeudorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {dialogMode === 'new' ? 'Nueva Sublínea por Deudor' : 'Editar Sublínea por Deudor'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Selección de Deudor */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Deudor
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Autocomplete
                  options={deudores}
                  getOptionLabel={(option) => `${option.rutDeudor} - ${option.nombreDeudor}`}
                  value={deudorSeleccionado}
                  onChange={(_, newValue) => {
                    setDeudorSeleccionado(newValue);
                    setFormData({ ...formData, rutDeudor: newValue?.rutDeudor || 0 });
                  }}
                  disabled={dialogMode === 'edit'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seleccionar Deudor"
                      size="small"
                      required
                    />
                  )}
                />
              </Grid>

              {/* Datos Básicos */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Datos de la Sublínea
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tipo Documento</InputLabel>
                  <Select
                    value={formData.tipoDocumento}
                    label="Tipo Documento"
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: Number(e.target.value) })}
                    disabled={dialogMode === 'edit'}
                  >
                    <MenuItem value={1}>Factura</MenuItem>
                    <MenuItem value={2}>Cheque</MenuItem>
                    <MenuItem value={3}>Letra</MenuItem>
                    <MenuItem value={4}>Pagaré</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Moneda</InputLabel>
                  <Select
                    value={formData.tipoMoneda}
                    label="Moneda"
                    onChange={(e) => setFormData({ ...formData, tipoMoneda: Number(e.target.value) })}
                  >
                    <MenuItem value={1}>Peso</MenuItem>
                    <MenuItem value={2}>Dólar</MenuItem>
                    <MenuItem value={3}>UF</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="% Anticipo"
                  type="number"
                  value={formData.porcentajeAnticipo}
                  onChange={(e) => setFormData({ ...formData, porcentajeAnticipo: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Monto Solicitado"
                  type="number"
                  value={formData.montoSolicitado}
                  onChange={(e) => setFormData({ ...formData, montoSolicitado: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha Solicitud"
                  value={formData.fechaSolicitud}
                  onChange={(Dayjs) => setFormData({ ...formData, fechaSolicitud: Dayjs || dayjs() })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estadoLinea}
                    label="Estado"
                    onChange={(e) => setFormData({ ...formData, estadoLinea: Number(e.target.value) })}
                  >
                    <MenuItem value={1}>Pendiente</MenuItem>
                    <MenuItem value={2}>Aprobada</MenuItem>
                    <MenuItem value={3}>Rechazada</MenuItem>
                    <MenuItem value={4}>Suspendida</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Verificado</InputLabel>
                  <Select
                    value={formData.verificado ? 1 : 0}
                    label="Verificado"
                    onChange={(e) => setFormData({ ...formData, verificado: e.target.value === 1 })}
                  >
                    <MenuItem value={0}>No</MenuItem>
                    <MenuItem value={1}>Sí</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={guardarSublinea}
              disabled={loading || !formData.rutDeudor}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default SublineaDeudor;
