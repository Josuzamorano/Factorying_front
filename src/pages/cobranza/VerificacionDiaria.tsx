import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControlLabel,
  Checkbox,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Today as TodayIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { API_BASE_URL } from '../../services/api';

// Tipos
interface VerificacionDiaria {
  fechaVerificacion: string;
  horaVerificacion?: string;
  tipoDocumento: number;
  descripcionTipoDocumento?: string;
  rutCliente: number;
  rutClienteFormateado?: string;
  nombreCliente: string;
  rutDeudor: number;
  rutDeudorFormateado?: string;
  nombreDeudor: string;
  numeroOperacion: number;
  numeroDocumento: number;
  fechaVencimiento: string;
  montoDocumento: number;
  estadoVerificacion: number;
  descripcionEstadoVerificacion?: string;
  resultado?: string;
  observacion?: string;
  usuarioVerificacion?: string;
  personaContacto?: string;
  cargoPersona?: string;
  facturaRecibida?: string;
  facturaIngresada?: string;
  aceptaNotificacion?: string;
  documentoCedido?: string;
  depositoCliente?: string;
  entregaInformacion?: string;
  timbreDeudor?: string;
}

interface ResumenVerificacion {
  fecha: string;
  totalDocumentos: number;
  documentosVerificados: number;
  documentosPendientes: number;
  montoTotalVerificado: number;
  montoTotalPendiente: number;
  porEstado: { estadoVerificacion: number; descripcionEstado: string; cantidad: number; monto: number }[];
}

interface RegistrarVerificacionDto {
  rutCliente: number;
  rutDeudor: number;
  numeroOperacion: number;
  numeroDocumento: number;
  tipoDocumento: number;
  estadoVerificacion: number;
  observacion?: string;
  personaContacto?: string;
  cargoPersona?: string;
  facturaRecibida?: string;
  facturaIngresada?: string;
  aceptaNotificacion?: string;
  documentoCedido?: string;
  depositoCliente?: string;
  entregaInformacion?: string;
  timbreDeudor?: string;
}

// Estados de verificación comunes
const ESTADOS_VERIFICACION = [
  { id: 0, descripcion: 'Pendiente', color: 'default' },
  { id: 1, descripcion: 'Verificado OK', color: 'success' },
  { id: 2, descripcion: 'No Contesta', color: 'warning' },
  { id: 3, descripcion: 'Número Equivocado', color: 'error' },
  { id: 4, descripcion: 'Buzón de Voz', color: 'info' },
  { id: 5, descripcion: 'Rechaza Documento', color: 'error' },
  { id: 6, descripcion: 'Promete Pago', color: 'success' },
];

/**
 * Página de Verificación Diaria - Migrada de F_CO2510.frm (VB6)
 * Permite consultar y registrar verificaciones diarias de documentos
 */
const VerificacionDiaria: React.FC = () => {
  const theme = useTheme();

  // Estado
  const [fecha, setFecha] = useState<Dayjs>(dayjs());
  const [tabValue, setTabValue] = useState(0);
  const [verificaciones, setVerificaciones] = useState<VerificacionDiaria[]>([]);
  const [pendientes, setPendientes] = useState<VerificacionDiaria[]>([]);
  const [resumen, setResumen] = useState<ResumenVerificacion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del diálogo de registro
  const [dialogOpen, setDialogOpen] = useState(false);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<VerificacionDiaria | null>(null);
  const [formVerificacion, setFormVerificacion] = useState<RegistrarVerificacionDto>({
    rutCliente: 0,
    rutDeudor: 0,
    numeroOperacion: 0,
    numeroDocumento: 0,
    tipoDocumento: 0,
    estadoVerificacion: 1,
    observacion: '',
    personaContacto: '',
    cargoPersona: '',
    facturaRecibida: 'N',
    facturaIngresada: 'N',
    aceptaNotificacion: 'N',
    documentoCedido: 'N',
    depositoCliente: 'N',
    entregaInformacion: 'N',
    timbreDeudor: 'N',
  });

  // Cargar datos
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fechaStr = fecha.format('YYYY-MM-DD');

      const [verificacionesRes, pendientesRes, resumenRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cobranza/verificacion-diaria?fecha=${fechaStr}`),
        fetch(`${API_BASE_URL}/cobranza/verificacion-diaria/pendientes?fecha=${fechaStr}`),
        fetch(`${API_BASE_URL}/cobranza/verificacion-diaria/resumen?fecha=${fechaStr}`),
      ]);

      if (verificacionesRes.ok) {
        const data = await verificacionesRes.json();
        setVerificaciones(data);
      }

      if (pendientesRes.ok) {
        const data = await pendientesRes.json();
        setPendientes(data);
      }

      if (resumenRes.ok) {
        const data = await resumenRes.json();
        setResumen(data);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Verifique la conexión al servidor.');
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Abrir diálogo de registro
  const handleAbrirRegistro = (doc: VerificacionDiaria) => {
    setDocumentoSeleccionado(doc);
    setFormVerificacion({
      rutCliente: doc.rutCliente,
      rutDeudor: doc.rutDeudor,
      numeroOperacion: doc.numeroOperacion,
      numeroDocumento: doc.numeroDocumento,
      tipoDocumento: doc.tipoDocumento,
      estadoVerificacion: 1,
      observacion: '',
      personaContacto: '',
      cargoPersona: '',
      facturaRecibida: 'N',
      facturaIngresada: 'N',
      aceptaNotificacion: 'N',
      documentoCedido: 'N',
      depositoCliente: 'N',
      entregaInformacion: 'N',
      timbreDeudor: 'N',
    });
    setDialogOpen(true);
  };

  // Registrar verificación
  const handleRegistrarVerificacion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cobranza/verificacion-diaria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formVerificacion),
      });

      if (response.ok) {
        setDialogOpen(false);
        cargarDatos();
      } else {
        const errorData = await response.json();
        setError(errorData.mensaje || 'Error al registrar la verificación');
      }
    } catch (err) {
      console.error('Error al registrar:', err);
      setError('Error al registrar la verificación');
    }
  };

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dayjs(dateStr).format('DD/MM/YYYY');
  };

  // Obtener color del estado
  const getEstadoColor = (estado: number): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const estadoInfo = ESTADOS_VERIFICACION.find(e => e.id === estado);
    return (estadoInfo?.color || 'default') as 'default' | 'success' | 'warning' | 'error' | 'info';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ p: 3 }}>
        {/* Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TodayIcon sx={{ fontSize: 40, mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h4" fontWeight="bold">
            Verificación Diaria
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <DatePicker
                label="Fecha de Verificación"
                value={fecha}
                onChange={(newValue) => newValue && setFecha(newValue)}
                format="DD/MM/YYYY"
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={cargarDatos}
                disabled={loading}
                fullWidth
              >
                Buscar
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarDatos}
                disabled={loading}
                fullWidth
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Documentos
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {resumen.totalDocumentos}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderLeft: `4px solid ${theme.palette.success.main}` }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Verificados
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {resumen.documentosVerificados}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(resumen.montoTotalVerificado)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderLeft: `4px solid ${theme.palette.warning.main}` }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Pendientes
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {resumen.documentosPendientes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(resumen.montoTotalPendiente)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Progreso
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {resumen.totalDocumentos > 0
                      ? Math.round((resumen.documentosVerificados / resumen.totalDocumentos) * 100)
                      : 0}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab
              icon={<ScheduleIcon />}
              label={`Pendientes (${pendientes.length})`}
              iconPosition="start"
            />
            <Tab
              icon={<CheckCircleIcon />}
              label={`Verificados (${verificaciones.length})`}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tabla */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell>Operación</TableCell>
                  <TableCell>Documento</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Deudor</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell>Estado</TableCell>
                  {tabValue === 1 && <TableCell>Hora</TableCell>}
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(tabValue === 0 ? pendientes : verificaciones).map((doc, index) => (
                  <TableRow key={`${doc.numeroOperacion}-${doc.numeroDocumento}-${index}`} hover>
                    <TableCell>{doc.numeroOperacion}</TableCell>
                    <TableCell>{doc.numeroDocumento}</TableCell>
                    <TableCell>
                      <Chip label={doc.descripcionTipoDocumento || 'N/A'} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {doc.rutClienteFormateado}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150, display: 'block' }}>
                        {doc.nombreCliente}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                        {doc.rutDeudorFormateado}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150, display: 'block' }}>
                        {doc.nombreDeudor}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
                    <TableCell>{formatDate(doc.fechaVencimiento)}</TableCell>
                    <TableCell>
                      <Chip
                        label={doc.descripcionEstadoVerificacion || 'Pendiente'}
                        size="small"
                        color={getEstadoColor(doc.estadoVerificacion)}
                      />
                    </TableCell>
                    {tabValue === 1 && <TableCell>{doc.horaVerificacion || '-'}</TableCell>}
                    <TableCell align="center">
                      {tabValue === 0 && (
                        <Tooltip title="Registrar Verificación">
                          <IconButton size="small" color="primary" onClick={() => handleAbrirRegistro(doc)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(tabValue === 0 ? pendientes : verificaciones).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No hay documentos {tabValue === 0 ? 'pendientes' : 'verificados'} para esta fecha
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Botones de acción */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<PrintIcon />}>
            Imprimir
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Exportar Excel
          </Button>
        </Box>

        {/* Diálogo de Registro de Verificación */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Registrar Verificación</DialogTitle>
          <DialogContent dividers>
            {documentoSeleccionado && (
              <Box>
                {/* Info del documento */}
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Operación</Typography>
                      <Typography variant="body1" fontWeight="bold">{documentoSeleccionado.numeroOperacion}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Documento</Typography>
                      <Typography variant="body1" fontWeight="bold">{documentoSeleccionado.numeroDocumento}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Monto</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatCurrency(documentoSeleccionado.montoDocumento)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <Typography variant="caption" color="text.secondary">Vencimiento</Typography>
                      <Typography variant="body1">{formatDate(documentoSeleccionado.fechaVencimiento)}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Cliente</Typography>
                      <Typography variant="body1">{documentoSeleccionado.nombreCliente}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="caption" color="text.secondary">Deudor</Typography>
                      <Typography variant="body1">{documentoSeleccionado.nombreDeudor}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Formulario de verificación */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Estado de Verificación</InputLabel>
                      <Select
                        value={formVerificacion.estadoVerificacion}
                        label="Estado de Verificación"
                        onChange={(e) => setFormVerificacion({ ...formVerificacion, estadoVerificacion: Number(e.target.value) })}
                      >
                        {ESTADOS_VERIFICACION.filter(e => e.id > 0).map((estado) => (
                          <MenuItem key={estado.id} value={estado.id}>
                            {estado.descripcion}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Se conversó con"
                      value={formVerificacion.personaContacto || ''}
                      onChange={(e) => setFormVerificacion({ ...formVerificacion, personaContacto: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cargo"
                      value={formVerificacion.cargoPersona || ''}
                      onChange={(e) => setFormVerificacion({ ...formVerificacion, cargoPersona: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Observación"
                      multiline
                      rows={3}
                      value={formVerificacion.observacion || ''}
                      onChange={(e) => setFormVerificacion({ ...formVerificacion, observacion: e.target.value })}
                    />
                  </Grid>

                  {/* Checkboxes */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Verificaciones adicionales:</Typography>
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formVerificacion.facturaRecibida === 'S'}
                              onChange={(e) => setFormVerificacion({ ...formVerificacion, facturaRecibida: e.target.checked ? 'S' : 'N' })}
                              size="small"
                            />
                          }
                          label="Factura Recibida"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formVerificacion.facturaIngresada === 'S'}
                              onChange={(e) => setFormVerificacion({ ...formVerificacion, facturaIngresada: e.target.checked ? 'S' : 'N' })}
                              size="small"
                            />
                          }
                          label="Factura Ingresada"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formVerificacion.aceptaNotificacion === 'S'}
                              onChange={(e) => setFormVerificacion({ ...formVerificacion, aceptaNotificacion: e.target.checked ? 'S' : 'N' })}
                              size="small"
                            />
                          }
                          label="Acepta Notificación"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formVerificacion.documentoCedido === 'S'}
                              onChange={(e) => setFormVerificacion({ ...formVerificacion, documentoCedido: e.target.checked ? 'S' : 'N' })}
                              size="small"
                            />
                          }
                          label="Documento Cedido"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formVerificacion.depositoCliente === 'S'}
                              onChange={(e) => setFormVerificacion({ ...formVerificacion, depositoCliente: e.target.checked ? 'S' : 'N' })}
                              size="small"
                            />
                          }
                          label="Depósito al Cliente"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formVerificacion.entregaInformacion === 'S'}
                              onChange={(e) => setFormVerificacion({ ...formVerificacion, entregaInformacion: e.target.checked ? 'S' : 'N' })}
                              size="small"
                            />
                          }
                          label="Entrega Información"
                        />
                      </Grid>
                      <Grid size={{ xs: 6, md: 4 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formVerificacion.timbreDeudor === 'S'}
                              onChange={(e) => setFormVerificacion({ ...formVerificacion, timbreDeudor: e.target.checked ? 'S' : 'N' })}
                              size="small"
                            />
                          }
                          label="Timbre Deudor"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleRegistrarVerificacion}>
              Registrar Verificación
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default VerificacionDiaria;
