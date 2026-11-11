// ====================================================
// Gestión de Prórrogas - Migrado de F_CM1400.frm
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  AccountBalance as ContabIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

interface Prorroga {
  numeroProrrroga: number;
  tipoDocumento: number;
  tipoDocumentoDescripcion: string;
  numeroDocumento: string;
  numeroOperacion: number;
  rutCliente: number;
  rutClienteFormateado: string;
  nombreCliente: string;
  rutDeudor: number;
  rutDeudorFormateado: string;
  nombreDeudor: string;
  fechaVencimientoOriginal: string;
  fechaVencimientoNueva: string;
  diasProrrroga: number;
  porcentajeProrrroga: number;
  montoAbono: number;
  observaciones: string;
  estado: number;
  estadoDescripcion: string;
  fechaSolicitud: string;
  fechaAprobacion: string | null;
  usuarioSolicita: string;
  usuarioAprueba: string | null;
}

interface DocumentoParaProrroga {
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

const Prorrogas: React.FC = () => {
  const [prorrogas, setProrrogas] = useState<Prorroga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogNueva, setDialogNueva] = useState(false);
  const [dialogProcesar, setDialogProcesar] = useState(false);
  const [prorrogaSeleccionada, setProrrogaSeleccionada] = useState<Prorroga | null>(null);
  const [accionProcesar, setAccionProcesar] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [observacionesProcesar, setObservacionesProcesar] = useState('');
  
  const [filtro, setFiltro] = useState<Filtro>({
    rutCliente: '',
    estado: '',
    fechaDesde: null,
    fechaHasta: null,
  });

  // Form nueva prórroga
  const [tipoDocBuscar, setTipoDocBuscar] = useState<string>('1');
  const [numeroDocBuscar, setNumeroDocBuscar] = useState<string>('');
  const [documentoEncontrado, setDocumentoEncontrado] = useState<DocumentoParaProrroga | null>(null);
  const [nuevaProrroga, setNuevaProrroga] = useState({
    fechaVencimientoNueva: null as Dayjs | null,
    diasProrrroga: 0,
    porcentajeProrrroga: 0,
    montoAbono: 0,
    tipoAbono: 1,
    observaciones: '',
  });

  useEffect(() => {
    cargarProrrogas();
  }, []);

  const cargarProrrogas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtro.rutCliente) params.append('rutCliente', filtro.rutCliente);
      if (filtro.estado) params.append('estado', filtro.estado);
      if (filtro.fechaDesde) params.append('fechaDesde', filtro.fechaDesde.toISOString());
      if (filtro.fechaHasta) params.append('fechaHasta', filtro.fechaHasta.toISOString());

      const response = await fetch(`/api/comercial/prorrogas?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar prórrogas');
      
      const data = await response.json();
      setProrrogas(data);
    } catch (err) {
      setError('Error al cargar prórrogas');
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
        `/api/comercial/prorrogas/buscar-documento?tipoDocumento=${tipoDocBuscar}&numeroDocumento=${numeroDocBuscar}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        setError('Documento no encontrado');
        setDocumentoEncontrado(null);
        return;
      }
      
      const data = await response.json();
      setDocumentoEncontrado(data);
    } catch (err) {
      setError('Error al buscar documento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const crearProrroga = async () => {
    if (!documentoEncontrado || !nuevaProrroga.fechaVencimientoNueva) return;

    setLoading(true);
    try {
      const response = await fetch('/api/comercial/prorrogas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          tipoDocumento: documentoEncontrado.tipoDocumento,
          numeroDocumento: documentoEncontrado.numeroDocumento,
          numeroOperacion: documentoEncontrado.numeroOperacion,
          fechaVencimientoNueva: nuevaProrroga.fechaVencimientoNueva.toISOString(),
          diasProrrroga: nuevaProrroga.diasProrrroga,
          porcentajeProrrroga: nuevaProrroga.porcentajeProrrroga,
          montoAbono: nuevaProrroga.montoAbono,
          tipoAbono: nuevaProrroga.tipoAbono,
          observaciones: nuevaProrroga.observaciones,
        }),
      });

      if (!response.ok) throw new Error('Error al crear prórroga');
      
      setSuccess('Prórroga creada correctamente');
      setDialogNueva(false);
      resetFormNueva();
      cargarProrrogas();
    } catch (err) {
      setError('Error al crear prórroga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const procesarProrroga = async () => {
    if (!prorrogaSeleccionada) return;

    setLoading(true);
    try {
      const response = await fetch('/api/comercial/prorrogas/procesar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          numeroProrrroga: prorrogaSeleccionada.numeroProrrroga,
          aprobar: accionProcesar === 'aprobar',
          observaciones: observacionesProcesar,
        }),
      });

      if (!response.ok) throw new Error('Error al procesar prórroga');
      
      setSuccess(accionProcesar === 'aprobar' ? 'Prórroga aprobada' : 'Prórroga rechazada');
      setDialogProcesar(false);
      setObservacionesProcesar('');
      cargarProrrogas();
    } catch (err) {
      setError('Error al procesar prórroga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const contabilizarProrroga = async (numeroProrrroga: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comercial/prorrogas/${numeroProrrroga}/contabilizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al contabilizar prórroga');
      
      setSuccess('Prórroga contabilizada correctamente');
      cargarProrrogas();
    } catch (err) {
      setError('Error al contabilizar prórroga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFormNueva = () => {
    setTipoDocBuscar('1');
    setNumeroDocBuscar('');
    setDocumentoEncontrado(null);
    setNuevaProrroga({
      fechaVencimientoNueva: null,
      diasProrrroga: 0,
      porcentajeProrrroga: 0,
      montoAbono: 0,
      tipoAbono: 1,
      observaciones: '',
    });
  };

  const getEstadoChip = (estado: number) => {
    const config: Record<number, { color: 'default' | 'primary' | 'success' | 'error' | 'warning'; label: string }> = {
      1: { color: 'warning', label: 'Pendiente' },
      2: { color: 'success', label: 'Aprobada' },
      3: { color: 'error', label: 'Rechazada' },
      4: { color: 'primary', label: 'Contabilizada' },
    };
    const c = config[estado] || { color: 'default', label: 'Desconocido' };
    return <Chip label={c.label} color={c.color} size="small" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  // Contadores por estado
  const pendientes = prorrogas.filter(p => p.estado === 1).length;
  const aprobadas = prorrogas.filter(p => p.estado === 2).length;
  const contabilizadas = prorrogas.filter(p => p.estado === 4).length;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: '#ed6c02' }}>
            Gestión de Prórrogas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogNueva(true)}
          >
            Nueva Prórroga
          </Button>
        </Box>

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

        {/* Tarjetas Resumen */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Typography variant="h4">{pendientes}</Typography>
                <Typography color="text.secondary">Pendientes de Aprobación</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="h4">{aprobadas}</Typography>
                <Typography color="text.secondary">Aprobadas (por contabilizar)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="h4">{contabilizadas}</Typography>
                <Typography color="text.secondary">Contabilizadas</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="RUT Cliente"
                value={filtro.rutCliente}
                onChange={(e) => setFiltro({ ...filtro, rutCliente: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
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
                  <MenuItem value="4">Contabilizada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <DatePicker
                label="Fecha Desde"
                value={filtro.fechaDesde}
                onChange={(newValue) => setFiltro({ ...filtro, fechaDesde: newValue as Dayjs | null })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <DatePicker
                label="Fecha Hasta"
                value={filtro.fechaHasta}
                onChange={(newValue) => setFiltro({ ...filtro, fechaHasta: newValue as Dayjs | null })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={cargarProrrogas}
                sx={{ mr: 1 }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setFiltro({ rutCliente: '', estado: '', fechaDesde: null, fechaHasta: null });
                  cargarProrrogas();
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Prórrogas */}
        <Paper>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>N° Prórroga</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Tipo Doc.</TableCell>
                  <TableCell>N° Doc.</TableCell>
                  <TableCell>Vto. Original</TableCell>
                  <TableCell>Vto. Nuevo</TableCell>
                  <TableCell align="center">Días</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : prorrogas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No se encontraron prórrogas
                    </TableCell>
                  </TableRow>
                ) : (
                  prorrogas.map((p) => (
                    <TableRow key={p.numeroProrrroga} hover>
                      <TableCell>{p.numeroProrrroga}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{p.nombreCliente}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {p.rutClienteFormateado}
                        </Typography>
                      </TableCell>
                      <TableCell>{p.tipoDocumentoDescripcion}</TableCell>
                      <TableCell>{p.numeroDocumento}</TableCell>
                      <TableCell>{formatDayjs(p.fechaVencimientoOriginal)}</TableCell>
                      <TableCell>{formatDayjs(p.fechaVencimientoNueva)}</TableCell>
                      <TableCell align="center">{p.diasProrrroga}</TableCell>
                      <TableCell align="center">{getEstadoChip(p.estado)}</TableCell>
                      <TableCell align="center">
                        {p.estado === 1 && (
                          <>
                            <Tooltip title="Aprobar">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => {
                                  setProrrogaSeleccionada(p);
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
                                  setProrrogaSeleccionada(p);
                                  setAccionProcesar('rechazar');
                                  setDialogProcesar(true);
                                }}
                              >
                                <RejectIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {p.estado === 2 && (
                          <Tooltip title="Contabilizar">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => contabilizarProrroga(p.numeroProrrroga)}
                            >
                              <ContabIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog Nueva Prórroga */}
        <Dialog open={dialogNueva} onClose={() => setDialogNueva(false)} maxWidth="md" fullWidth>
          <DialogTitle>Nueva Prórroga</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Buscar Documento
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
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
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Número Documento"
                  value={numeroDocBuscar}
                  onChange={(e) => setNumeroDocBuscar(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Button variant="contained" onClick={buscarDocumento} fullWidth>
                  Buscar
                </Button>
              </Grid>

              {documentoEncontrado && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Información del Documento
                    </Typography>
                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">Cliente: {documentoEncontrado.nombreCliente}</Typography>
                          <Typography variant="body2">Deudor: {documentoEncontrado.nombreDeudor}</Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="body2">Monto: {formatCurrency(documentoEncontrado.montoDocumento)}</Typography>
                          <Typography variant="body2">Vencimiento: {formatDayjs(documentoEncontrado.fechaVencimiento)}</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Datos de la Prórroga
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePicker
                      label="Nueva Fecha Vencimiento"
                      value={nuevaProrroga.fechaVencimientoNueva}
                      onChange={(newValue) => setNuevaProrroga({ ...nuevaProrroga, fechaVencimientoNueva: newValue as Dayjs | null })}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="Días Prórroga"
                      type="number"
                      value={nuevaProrroga.diasProrrroga}
                      onChange={(e) => setNuevaProrroga({ ...nuevaProrroga, diasProrrroga: parseInt(e.target.value) || 0 })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      label="% Prórroga"
                      type="number"
                      value={nuevaProrroga.porcentajeProrrroga}
                      onChange={(e) => setNuevaProrroga({ ...nuevaProrroga, porcentajeProrrroga: parseFloat(e.target.value) || 0 })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Monto Abono"
                      type="number"
                      value={nuevaProrroga.montoAbono}
                      onChange={(e) => setNuevaProrroga({ ...nuevaProrroga, montoAbono: parseFloat(e.target.value) || 0 })}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tipo Abono</InputLabel>
                      <Select
                        value={nuevaProrroga.tipoAbono}
                        label="Tipo Abono"
                        onChange={(e) => setNuevaProrroga({ ...nuevaProrroga, tipoAbono: e.target.value as number })}
                      >
                        <MenuItem value={1}>Efectivo</MenuItem>
                        <MenuItem value={2}>Cheque</MenuItem>
                        <MenuItem value={3}>Transferencia</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Observaciones"
                      multiline
                      rows={2}
                      value={nuevaProrroga.observaciones}
                      onChange={(e) => setNuevaProrroga({ ...nuevaProrroga, observaciones: e.target.value })}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setDialogNueva(false); resetFormNueva(); }}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={crearProrroga}
              disabled={!documentoEncontrado || !nuevaProrroga.fechaVencimientoNueva || loading}
            >
              Guardar Prórroga
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Procesar Prórroga */}
        <Dialog open={dialogProcesar} onClose={() => setDialogProcesar(false)}>
          <DialogTitle>
            {accionProcesar === 'aprobar' ? 'Aprobar Prórroga' : 'Rechazar Prórroga'}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              ¿Está seguro que desea {accionProcesar === 'aprobar' ? 'aprobar' : 'rechazar'} la prórroga N° {prorrogaSeleccionada?.numeroProrrroga}?
            </Typography>
            <TextField
              fullWidth
              label="Observaciones"
              multiline
              rows={3}
              value={observacionesProcesar}
              onChange={(e) => setObservacionesProcesar(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogProcesar(false)}>Cancelar</Button>
            <Button 
              variant="contained" 
              color={accionProcesar === 'aprobar' ? 'success' : 'error'}
              onClick={procesarProrroga}
              disabled={loading}
            >
              {accionProcesar === 'aprobar' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Prorrogas;
