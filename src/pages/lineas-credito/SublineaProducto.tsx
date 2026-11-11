// ====================================================
// Sublínea por Producto - Migrado de F_LC*.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Category as ProductIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';


// ====== Interfaces ======
interface SublineaProducto {
  rutCliente: number;
  numeroLinea: number;
  tipoDocumento: number;
  descripcionTipoDocumento: string;
  tipoMoneda: number;
  descripcionMoneda: string;
  porcentajeAnticipo: number;
  montoSolicitado: number;
  montoAprobado: number;
  montoDisponible: number;
  numeroContrato?: number;
  fechaContrato?: string;
  vencimientoContrato?: string;
  estadoContrato?: number;
  descripcionEstadoContrato?: string;
  plazoVencimiento?: number;
  plazoCesion?: number;
  comisionMinima?: number;
  comisionMaxima?: number;
  comisionPorcentual?: number;
}

interface ResumenSublineas {
  cantidadSublineas: number;
  montoTotalSolicitado: number;
  montoTotalAprobado: number;
  montoTotalDisponible: number;
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

// ====== Componente Principal ======
const SublineaProducto: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Params from URL
  const rutClienteParam = searchParams.get('rutCliente');
  const numeroLineaParam = searchParams.get('numeroLinea');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Búsqueda
  const [rutCliente, setRutCliente] = useState(rutClienteParam || '');
  const [numeroLinea, setNumeroLinea] = useState(numeroLineaParam || '');
  
  // Datos
  const [lineaCredito, setLineaCredito] = useState<LineaCredito | null>(null);
  const [sublineas, setSublineas] = useState<SublineaProducto[]>([]);
  const [resumen, setResumen] = useState<ResumenSublineas | null>(null);
  
  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'new' | 'edit'>('new');
  // Variable usada para tracking del item seleccionado en edición
  const [, setSublineaSeleccionada] = useState<SublineaProducto | null>(null);
  
  // Form
  const [formData, setFormData] = useState({
    tipoDocumento: 1,
    tipoMoneda: 1,
    porcentajeAnticipo: 80,
    montoSolicitado: 0,
    montoAprobado: 0,
    numeroContrato: '',
    fechaContrato: null as Dayjs | null,
    vencimientoContrato: null as Dayjs | null,
    estadoContrato: 1,
    plazoVencimiento: 30,
    plazoCesion: 30,
    comisionMinima: 0,
    comisionMaxima: 0,
    comisionPorcentual: 0,
  });

  useEffect(() => {
    if (rutClienteParam && numeroLineaParam) {
      buscarSublineas();
    }
  }, [rutClienteParam, numeroLineaParam]);

  // ====== API Calls ======
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

      // Cargar sublíneas por producto
      const response = await fetch(`/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-producto`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar sublíneas');
      
      const data = await response.json();
      setSublineas(data);

      // Cargar resumen
      const resumenResponse = await fetch(`/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-resumen`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      
      if (resumenResponse.ok) {
        const resumenData = await resumenResponse.json();
        setResumen(resumenData);
      }
    } catch (err) {
      setError('Error al cargar sublíneas por producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const guardarSublinea = async () => {
    if (!rutCliente || !numeroLinea) return;

    setLoading(true);
    try {
      const payload = {
        rutCliente: parseInt(rutCliente),
        numeroLinea: parseInt(numeroLinea),
        tipoDocumento: formData.tipoDocumento,
        tipoMoneda: formData.tipoMoneda,
        porcentajeAnticipo: formData.porcentajeAnticipo,
        montoSolicitado: formData.montoSolicitado,
        montoAprobado: formData.montoAprobado,
        numeroContrato: formData.numeroContrato ? parseInt(formData.numeroContrato) : null,
        fechaContrato: formData.fechaContrato?.toISOString(),
        vencimientoContrato: formData.vencimientoContrato?.toISOString(),
        estadoContrato: formData.estadoContrato,
        plazoVencimiento: formData.plazoVencimiento,
        plazoCesion: formData.plazoCesion,
        comisionMinima: formData.comisionMinima,
        comisionMaxima: formData.comisionMaxima,
        comisionPorcentual: formData.comisionPorcentual,
      };

      const url = dialogMode === 'new'
        ? `/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-producto`
        : `/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-producto/${formData.tipoDocumento}`;

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

  const eliminarSublinea = async (tipoDocumento: number) => {
    if (!confirm('¿Está seguro de eliminar esta sublínea?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/lineas-credito/${rutCliente}/${numeroLinea}/sublineas-producto/${tipoDocumento}`, {
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
      tipoDocumento: 1,
      tipoMoneda: 1,
      porcentajeAnticipo: 80,
      montoSolicitado: 0,
      montoAprobado: 0,
      numeroContrato: '',
      fechaContrato: null,
      vencimientoContrato: null,
      estadoContrato: 1,
      plazoVencimiento: 30,
      plazoCesion: 30,
      comisionMinima: 0,
      comisionMaxima: 0,
      comisionPorcentual: 0,
    });
    setDialogMode('new');
    setOpenDialog(true);
  };

  const handleEditar = (sublinea: SublineaProducto) => {
    setSublineaSeleccionada(sublinea);
    setFormData({
      tipoDocumento: sublinea.tipoDocumento,
      tipoMoneda: sublinea.tipoMoneda,
      porcentajeAnticipo: sublinea.porcentajeAnticipo,
      montoSolicitado: sublinea.montoSolicitado,
      montoAprobado: sublinea.montoAprobado,
      numeroContrato: sublinea.numeroContrato?.toString() || '',
      fechaContrato: sublinea.fechaContrato ? dayjs(sublinea.fechaContrato) : null,
      vencimientoContrato: sublinea.vencimientoContrato ? dayjs(sublinea.vencimientoContrato) : null,
      estadoContrato: sublinea.estadoContrato || 1,
      plazoVencimiento: sublinea.plazoVencimiento || 30,
      plazoCesion: sublinea.plazoCesion || 30,
      comisionMinima: sublinea.comisionMinima || 0,
      comisionMaxima: sublinea.comisionMaxima || 0,
      comisionPorcentual: sublinea.comisionPorcentual || 0,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // ====== Helpers ======
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const getUtilizacion = (aprobado: number, disponible: number) => {
    if (aprobado === 0) return 0;
    return ((aprobado - disponible) / aprobado) * 100;
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
          <Typography color="text.primary">Sublínea por Producto</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/lineas-credito')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              <ProductIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Sublínea por Producto
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

        {/* Búsqueda */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Buscar Línea de Crédito
          </Typography>
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
        </Paper>

        {/* Info Línea de Crédito */}
        {lineaCredito && (
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

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Sublíneas
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {resumen.cantidadSublineas}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Solicitado
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(resumen.montoTotalSolicitado)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Aprobado
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(resumen.montoTotalAprobado)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Disponible
                  </Typography>
                  <Typography variant="h6" color="info.main">
                    {formatCurrency(resumen.montoTotalDisponible)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabla Sublíneas */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>Tipo Documento</TableCell>
                  <TableCell sx={{ color: 'white' }}>Moneda</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">% Anticipo</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Monto Solicitado</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Monto Aprobado</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Disponible</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Utilización</TableCell>
                  <TableCell sx={{ color: 'white' }}>Contrato</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sublineas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {lineaCredito ? 'No hay sublíneas por producto registradas' : 'Ingrese RUT y Línea para buscar'}
                    </TableCell>
                  </TableRow>
                ) : (
                  sublineas.map((sub) => {
                    const utilizacion = getUtilizacion(sub.montoAprobado, sub.montoDisponible);
                    return (
                      <TableRow key={sub.tipoDocumento} hover>
                        <TableCell>
                          <Chip label={sub.descripcionTipoDocumento} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>{sub.descripcionMoneda}</TableCell>
                        <TableCell align="center">{sub.porcentajeAnticipo}%</TableCell>
                        <TableCell align="right">{formatCurrency(sub.montoSolicitado)}</TableCell>
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
                          {sub.numeroContrato ? (
                            <Typography variant="body2">
                              #{sub.numeroContrato}
                              {sub.descripcionEstadoContrato && (
                                <Chip label={sub.descripcionEstadoContrato} size="small" sx={{ ml: 1 }} />
                              )}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="textSecondary">Sin contrato</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEditar(sub)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton size="small" color="error" onClick={() => eliminarSublinea(sub.tipoDocumento)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Dialog Nueva/Editar Sublínea */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <ProductIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {dialogMode === 'new' ? 'Nueva Sublínea por Producto' : 'Editar Sublínea por Producto'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* Datos Básicos */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Datos Básicos
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

              {/* Montos */}
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
                <TextField
                  fullWidth
                  size="small"
                  label="Monto Aprobado"
                  type="number"
                  value={formData.montoAprobado}
                  onChange={(e) => setFormData({ ...formData, montoAprobado: Number(e.target.value) })}
                />
              </Grid>

              {/* Contrato */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Datos Contrato
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="N° Contrato"
                  value={formData.numeroContrato}
                  onChange={(e) => setFormData({ ...formData, numeroContrato: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <DatePicker
                  label="Fecha Contrato"
                  value={formData.fechaContrato}
                  onChange={(Dayjs) => setFormData({ ...formData, fechaContrato: Dayjs })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <DatePicker
                  label="Vencimiento"
                  value={formData.vencimientoContrato}
                  onChange={(Dayjs) => setFormData({ ...formData, vencimientoContrato: Dayjs })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Estado Contrato</InputLabel>
                  <Select
                    value={formData.estadoContrato}
                    label="Estado Contrato"
                    onChange={(e) => setFormData({ ...formData, estadoContrato: Number(e.target.value) })}
                  >
                    <MenuItem value={1}>Vigente</MenuItem>
                    <MenuItem value={2}>Vencido</MenuItem>
                    <MenuItem value={3}>Anulado</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Plazos */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                  Plazos y Comisiones
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Plazo Vencimiento (días)"
                  type="number"
                  value={formData.plazoVencimiento}
                  onChange={(e) => setFormData({ ...formData, plazoVencimiento: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Plazo Cesión (días)"
                  type="number"
                  value={formData.plazoCesion}
                  onChange={(e) => setFormData({ ...formData, plazoCesion: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Comisión %"
                  type="number"
                  value={formData.comisionPorcentual}
                  onChange={(e) => setFormData({ ...formData, comisionPorcentual: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Comisión Mínima"
                  type="number"
                  value={formData.comisionMinima}
                  onChange={(e) => setFormData({ ...formData, comisionMinima: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Comisión Máxima"
                  type="number"
                  value={formData.comisionMaxima}
                  onChange={(e) => setFormData({ ...formData, comisionMaxima: Number(e.target.value) })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={guardarSublinea}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default SublineaProducto;
