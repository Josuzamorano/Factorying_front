// ====================================================
// Emisión de Pagaré - Migrado de F_LE1800.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  Receipt as PagareIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as EmitidoIcon,
  Schedule as PendienteIcon,
  Person as DeudorIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';


// ====== Interfaces ======
interface EmisionPagare {
  id: number;
  idPagare: number;
  rutDeudor: number;
  dvDeudor: string;
  rutDeudorFormateado: string;
  nombreDeudor: string;
  direccionDeudor: string;
  ciudadDeudor: string;
  codigoMoneda: number;
  descripcionMoneda: string;
  monto: number;
  tipoEmision: string; // "V" = Vista, "P" = Plazo
  fechaVencimiento?: string;
  fechaEmision: string;
  impreso: boolean;
  fechaImpresion?: string;
}

interface PagareParaEmision {
  id: number;
  numeroOperacion?: number;
  rutCliente: number;
  nombreCliente: string;
  montoOriginal: number;
  fechaVencimiento: string;
  estado: number;
  descripcionEstado: string;
}

const tiposMoneda = [
  { valor: 1, descripcion: 'Peso' },
  { valor: 2, descripcion: 'Dólar' },
  { valor: 3, descripcion: 'UF' },
];

// ====== Componente Principal ======
const EmisionPagare: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idPagareParam = searchParams.get('idPagare');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Lista de pagarés pendientes de emisión
  const [pagaresPendientes, setPagaresPendientes] = useState<PagareParaEmision[]>([]);
  const [emisiones, setEmisiones] = useState<EmisionPagare[]>([]);
  
  // Filtros
  const [rutDeudor, setRutDeudor] = useState('');
  const [soloNoImpresos, setSoloNoImpresos] = useState(true);
  
  // Dialog Emisión
  const [openDialog, setOpenDialog] = useState(false);
  const [pagareSeleccionado, setPagareSeleccionado] = useState<PagareParaEmision | null>(null);
  
  // Form Emisión
  const [formData, setFormData] = useState({
    rutDeudor: 0,
    dvDeudor: '',
    nombreDeudor: '',
    direccionDeudor: '',
    ciudadDeudor: '',
    codigoMoneda: 1,
    monto: 0,
    tipoEmision: 'V', // V = Vista, P = Plazo
    fechaVencimiento: null as Dayjs | null,
  });

  // Dialog Vista Previa
  const [openPreview, setOpenPreview] = useState(false);
  const [emisionPreview, setEmisionPreview] = useState<EmisionPagare | null>(null);

  useEffect(() => {
    cargarPagaresPendientes();
    cargarEmisiones();
    
    if (idPagareParam) {
      prepararEmision(parseInt(idPagareParam));
    }
  }, [idPagareParam]);

  // ====== API Calls ======
  const cargarPagaresPendientes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/legal/pagares?soloVigentes=true&sinEmision=true', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPagaresPendientes(data);
      }
    } catch (err) {
      console.error('Error cargando pagarés pendientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarEmisiones = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (rutDeudor) params.append('rutDeudor', rutDeudor);
      if (soloNoImpresos) params.append('soloNoImpresos', 'true');

      const response = await fetch(`/api/legal/emisiones?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        setEmisiones(data);
      }
    } catch (err) {
      console.error('Error cargando emisiones:', err);
    } finally {
      setLoading(false);
    }
  };

  const prepararEmision = async (idPagare: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/legal/emisiones/preparar/${idPagare}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          rutDeudor: data.rutDeudor || 0,
          dvDeudor: data.dvDeudor || '',
          nombreDeudor: data.nombreDeudor || '',
          direccionDeudor: data.direccionDeudor || '',
          ciudadDeudor: data.ciudadDeudor || '',
          codigoMoneda: data.codigoMoneda || 1,
          monto: data.monto || 0,
          tipoEmision: data.tipoEmision || 'V',
          fechaVencimiento: data.fechaVencimiento ? dayjs(data.fechaVencimiento) : null,
        });
        setPagareSeleccionado({ id: idPagare } as any);
        setOpenDialog(true);
      }
    } catch (err) {
      setError('Error al preparar emisión');
    } finally {
      setLoading(false);
    }
  };

  const emitirPagare = async () => {
    if (!formData.rutDeudor || !formData.nombreDeudor || formData.monto <= 0) {
      setError('Complete todos los campos requeridos');
      return;
    }

    if (formData.tipoEmision === 'P' && !formData.fechaVencimiento) {
      setError('Debe indicar la fecha de vencimiento para pagaré a plazo');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        idPagare: pagareSeleccionado?.id || 0,
        rutDeudor: formData.rutDeudor,
        dvDeudor: formData.dvDeudor,
        nombreDeudor: formData.nombreDeudor,
        direccionDeudor: formData.direccionDeudor,
        ciudadDeudor: formData.ciudadDeudor,
        codigoMoneda: formData.codigoMoneda,
        monto: formData.monto,
        tipoEmision: formData.tipoEmision,
        fechaVencimiento: formData.tipoEmision === 'P' ? formData.fechaVencimiento?.toISOString() : null,
        fechaEmision: dayjs().toISOString(),
      };

      const response = await fetch('/api/legal/emisiones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al emitir pagaré');
      }

      const emision = await response.json();
      setSuccess('Pagaré emitido exitosamente');
      setOpenDialog(false);
      setEmisionPreview(emision);
      setOpenPreview(true);
      cargarEmisiones();
      cargarPagaresPendientes();
    } catch (err: any) {
      setError(err.message || 'Error al emitir pagaré');
    } finally {
      setLoading(false);
    }
  };

  const imprimirPagare = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/legal/emisiones/${id}/imprimir`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.ok) {
        setSuccess('Pagaré marcado como impreso');
        cargarEmisiones();
        // Abrir ventana de impresión
        window.open(`/api/legal/emisiones/${id}/documento`, '_blank');
      }
    } catch (err) {
      setError('Error al imprimir pagaré');
    } finally {
      setLoading(false);
    }
  };

  // ====== Handlers ======
  const handleNuevaEmision = (pagare?: PagareParaEmision) => {
    if (pagare) {
      prepararEmision(pagare.id);
    } else {
      setFormData({
        rutDeudor: 0,
        dvDeudor: '',
        nombreDeudor: '',
        direccionDeudor: '',
        ciudadDeudor: '',
        codigoMoneda: 1,
        monto: 0,
        tipoEmision: 'V',
        fechaVencimiento: null,
      });
      setPagareSeleccionado(null);
      setOpenDialog(true);
    }
  };

  const handleVerEmision = (emision: EmisionPagare) => {
    setEmisionPreview(emision);
    setOpenPreview(true);
  };

  // ====== Helpers ======
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  const getTipoEmisionLabel = (tipo: string) => {
    return tipo === 'V' ? 'A la Vista' : 'A Plazo';
  };

  // Resumen
  const resumen = {
    pendientes: pagaresPendientes.length,
    emitidos: emisiones.length,
    impresos: emisiones.filter(e => e.impreso).length,
    noImpresos: emisiones.filter(e => !e.impreso).length,
    montoTotal: emisiones.reduce((sum, e) => sum + e.monto, 0),
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
          <Typography color="text.primary">Emisión de Pagaré</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/legal')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              <PagareIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Emisión de Pagaré
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => { cargarPagaresPendientes(); cargarEmisiones(); }}
          >
            Actualizar
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

        {/* Resumen Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography color="warning.dark" gutterBottom>
                  <PendienteIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                  Pendientes
                </Typography>
                <Typography variant="h4" color="warning.dark">{resumen.pendientes}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ bgcolor: 'success.light' }}>
              <CardContent>
                <Typography color="success.dark" gutterBottom>
                  <EmitidoIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                  Emitidos
                </Typography>
                <Typography variant="h4" color="success.dark">{resumen.emitidos}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  <PrintIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
                  Impresos
                </Typography>
                <Typography variant="h4" color="primary">{resumen.impresos}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card sx={{ bgcolor: 'info.light' }}>
              <CardContent>
                <Typography color="info.dark" gutterBottom>Sin Imprimir</Typography>
                <Typography variant="h4" color="info.dark">{resumen.noImpresos}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>Monto Total</Typography>
                <Typography variant="h6">{formatCurrency(resumen.montoTotal)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Pagarés Pendientes de Emisión */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <PendienteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Pagarés Pendientes de Emisión
          </Typography>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID Pagaré</TableCell>
                  <TableCell>Operación</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagaresPendientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No hay pagarés pendientes de emisión
                    </TableCell>
                  </TableRow>
                ) : (
                  pagaresPendientes.map((pagare) => (
                    <TableRow key={pagare.id} hover>
                      <TableCell>#{pagare.id}</TableCell>
                      <TableCell>{pagare.numeroOperacion || '-'}</TableCell>
                      <TableCell>{pagare.nombreCliente}</TableCell>
                      <TableCell align="right">{formatCurrency(pagare.montoOriginal)}</TableCell>
                      <TableCell>{formatDayjs(pagare.fechaVencimiento)}</TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<PagareIcon />}
                          onClick={() => handleNuevaEmision(pagare)}
                        >
                          Emitir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Filtros Emisiones */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Deudor"
                value={rutDeudor}
                onChange={(e) => setRutDeudor(e.target.value)}
                placeholder="Buscar por RUT"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado Impresión</InputLabel>
                <Select
                  value={soloNoImpresos ? 'pendientes' : 'todos'}
                  label="Estado Impresión"
                  onChange={(e) => setSoloNoImpresos(e.target.value === 'pendientes')}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="pendientes">Solo No Impresos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={cargarEmisiones}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla Emisiones */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>ID</TableCell>
                  <TableCell sx={{ color: 'white' }}>Deudor</TableCell>
                  <TableCell sx={{ color: 'white' }}>Moneda</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Monto</TableCell>
                  <TableCell sx={{ color: 'white' }}>Tipo</TableCell>
                  <TableCell sx={{ color: 'white' }}>Emisión</TableCell>
                  <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                  <TableCell sx={{ color: 'white' }}>Impreso</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emisiones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay emisiones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  emisiones.map((emision) => (
                    <TableRow key={emision.id} hover>
                      <TableCell>#{emision.id}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{emision.nombreDeudor}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {emision.rutDeudorFormateado}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={emision.descripcionMoneda} size="small" />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(emision.monto)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTipoEmisionLabel(emision.tipoEmision)}
                          color={emision.tipoEmision === 'V' ? 'info' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDayjs(emision.fechaEmision)}</TableCell>
                      <TableCell>
                        {emision.fechaVencimiento ? formatDayjs(emision.fechaVencimiento) : 'A la Vista'}
                      </TableCell>
                      <TableCell>
                        {emision.impreso ? (
                          <Chip label="Impreso" color="success" size="small" icon={<EmitidoIcon />} />
                        ) : (
                          <Chip label="Pendiente" color="warning" size="small" icon={<PendienteIcon />} />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver">
                          <IconButton size="small" onClick={() => handleVerEmision(emision)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {!emision.impreso && (
                          <Tooltip title="Imprimir">
                            <IconButton size="small" color="primary" onClick={() => imprimirPagare(emision.id)}>
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Dialog Emisión */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <PagareIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Emitir Pagaré
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Datos del Deudor */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  <DeudorIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }} />
                  Datos del Deudor
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="RUT Deudor"
                  type="number"
                  value={formData.rutDeudor || ''}
                  onChange={(e) => setFormData({ ...formData, rutDeudor: parseInt(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="DV"
                  value={formData.dvDeudor}
                  onChange={(e) => setFormData({ ...formData, dvDeudor: e.target.value.toUpperCase() })}
                  inputProps={{ maxLength: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nombre Deudor"
                  value={formData.nombreDeudor}
                  onChange={(e) => setFormData({ ...formData, nombreDeudor: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Dirección"
                  value={formData.direccionDeudor}
                  onChange={(e) => setFormData({ ...formData, direccionDeudor: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Ciudad"
                  value={formData.ciudadDeudor}
                  onChange={(e) => setFormData({ ...formData, ciudadDeudor: e.target.value })}
                />
              </Grid>

              {/* Datos del Pagaré */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Datos del Pagaré
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Moneda</InputLabel>
                  <Select
                    value={formData.codigoMoneda}
                    label="Moneda"
                    onChange={(e) => setFormData({ ...formData, codigoMoneda: Number(e.target.value) })}
                  >
                    {tiposMoneda.map((m) => (
                      <MenuItem key={m.valor} value={m.valor}>{m.descripcion}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Monto"
                  type="number"
                  value={formData.monto || ''}
                  onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>Tipo de Emisión:</Typography>
                <RadioGroup
                  row
                  value={formData.tipoEmision}
                  onChange={(e) => setFormData({ ...formData, tipoEmision: e.target.value })}
                >
                  <FormControlLabel value="V" control={<Radio />} label="A la Vista" />
                  <FormControlLabel value="P" control={<Radio />} label="A Plazo" />
                </RadioGroup>
              </Grid>
              {formData.tipoEmision === 'P' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DatePicker
                    label="Fecha de Vencimiento"
                    value={formData.fechaVencimiento}
                    onChange={(Dayjs) => setFormData({ ...formData, fechaVencimiento: Dayjs })}
                    slotProps={{ textField: { size: 'small', fullWidth: true, required: true } }}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={emitirPagare} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Emitir Pagaré'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Vista Previa */}
        <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <ViewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Detalle del Pagaré Emitido
          </DialogTitle>
          <DialogContent dividers>
            {emisionPreview && (
              <Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">ID Emisión</Typography>
                    <Typography variant="body1">#{emisionPreview.id}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">ID Pagaré</Typography>
                    <Typography variant="body1">#{emisionPreview.idPagare}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">Deudor</Typography>
                    <Typography variant="body1">{emisionPreview.nombreDeudor}</Typography>
                    <Typography variant="body2" color="textSecondary">{emisionPreview.rutDeudorFormateado}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="textSecondary">Dirección</Typography>
                    <Typography variant="body1">
                      {emisionPreview.direccionDeudor}, {emisionPreview.ciudadDeudor}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Moneda</Typography>
                    <Typography variant="body1">{emisionPreview.descripcionMoneda}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Monto</Typography>
                    <Typography variant="h6" color="primary">{formatCurrency(emisionPreview.monto)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Tipo</Typography>
                    <Typography variant="body1">{getTipoEmisionLabel(emisionPreview.tipoEmision)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="textSecondary">Fecha Emisión</Typography>
                    <Typography variant="body1">{formatDayjs(emisionPreview.fechaEmision)}</Typography>
                  </Grid>
                  {emisionPreview.fechaVencimiento && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="textSecondary">Fecha Vencimiento</Typography>
                      <Typography variant="body1">{formatDayjs(emisionPreview.fechaVencimiento)}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPreview(false)}>Cerrar</Button>
            {emisionPreview && !emisionPreview.impreso && (
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={() => {
                  imprimirPagare(emisionPreview.id);
                  setOpenPreview(false);
                }}
              >
                Imprimir
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default EmisionPagare;
