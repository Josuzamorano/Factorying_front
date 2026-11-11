import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Phone,
  History,
  Person,
  Description,
} from '@mui/icons-material';

interface Cobrador {
  codigoCobrador: string;
  nombreCobrador: string;
}

interface Deudor {
  rutDeudor: number;
  nombreDeudor: string;
}

interface Cliente {
  rutCliente: number;
  nombreCliente: string;
}

interface Documento {
  rutCliente: number;
  rutDeudor: number;
  numeroOperacion: number;
  tipoDocumento: number;
  numeroDocumento: number;
  fechaVencimiento: string;
  montoDocumento: number;
  estadoDocumento: number;
  estadoCobranza: number;
  tieneProblema: boolean;
  descripcionTipoDocumento: string;
  descripcionEstadoDocumento: string;
  descripcionEstadoCobranza: string;
}

interface Gestion {
  correlativo: number;
  fechaGestion: string;
  horaGestion: string;
  estadoCobranza: number;
  observacion: string;
  fechaPago?: string;
  fechaProximaGestion?: string;
  descripcionEstadoCobranza: string;
  nombreCobrador: string;
}

interface EstadoCobranza {
  codigo: number;
  descripcion: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Página de Gestión de Cobranza Telefónica - Migrada de F_GC1100.frm (VB6)
 */
const GestionCobranza: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Datos de selección
  const [cobradores, setCobradores] = useState<Cobrador[]>([]);
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [historial, setHistorial] = useState<Gestion[]>([]);
  const [estadosCobranza] = useState<EstadoCobranza[]>([
    { codigo: 18, descripcion: 'SIN GESTIONAR' },
    { codigo: 19, descripcion: 'CONTACTADO' },
    { codigo: 20, descripcion: 'NO CONTESTA' },
    { codigo: 21, descripcion: 'PROMESA DE PAGO' },
    { codigo: 22, descripcion: 'PAGO PARCIAL' },
    { codigo: 46, descripcion: 'PROBLEMA' },
    { codigo: 47, descripcion: 'RECLAMO' },
  ]);

  // Selecciones actuales
  const [cobradorSeleccionado, setCobradorSeleccionado] = useState<string>('');
  const [deudorSeleccionado, setDeudorSeleccionado] = useState<number | ''>('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number | ''>('');
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<Documento | null>(null);

  // Formulario de gestión
  const [nuevaGestion, setNuevaGestion] = useState({
    estadoCobranza: 18,
    fechaPago: '',
    horaPago: '',
    fechaProximaGestion: '',
    horaProximaGestion: '',
    observacion: '',
    documentoNecesario: '',
  });

  // Diálogos
  const [historialOpen, setHistorialOpen] = useState(false);

  // Cargar cobradores al inicio
  useEffect(() => {
    cargarCobradores();
  }, []);

  // Cargar deudores al seleccionar cobrador
  useEffect(() => {
    if (cobradorSeleccionado) {
      cargarDeudores(cobradorSeleccionado);
    } else {
      setDeudores([]);
      setDeudorSeleccionado('');
    }
  }, [cobradorSeleccionado]);

  // Cargar clientes al seleccionar deudor
  useEffect(() => {
    if (cobradorSeleccionado && deudorSeleccionado) {
      cargarClientes(cobradorSeleccionado, deudorSeleccionado as number);
    } else {
      setClientes([]);
      setClienteSeleccionado('');
    }
  }, [deudorSeleccionado]);

  // Cargar documentos al seleccionar cliente
  useEffect(() => {
    if (clienteSeleccionado && deudorSeleccionado) {
      cargarDocumentos(clienteSeleccionado as number, deudorSeleccionado as number);
    } else {
      setDocumentos([]);
      setDocumentoSeleccionado(null);
    }
  }, [clienteSeleccionado]);

  const getToken = () => localStorage.getItem('token') || '';

  const cargarCobradores = async () => {
    try {
      const response = await fetch(`${API_URL}/recaudacion/cobradores/activos`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCobradores(data);
      }
    } catch (err) {
      console.error('Error cargando cobradores:', err);
    }
  };

  const cargarDeudores = async (codigoCobrador: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/recaudacion/gestiones/deudores/${codigoCobrador}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDeudores(data);
      }
    } catch (err) {
      console.error('Error cargando deudores:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarClientes = async (codigoCobrador: string, rutDeudor: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/recaudacion/gestiones/clientes/${codigoCobrador}/${rutDeudor}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (err) {
      console.error('Error cargando clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarDocumentos = async (rutCliente: number, rutDeudor: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/recaudacion/gestiones/documentos/${rutCliente}/${rutDeudor}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      }
    } catch (err) {
      console.error('Error cargando documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async (doc: Documento) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        rutCliente: doc.rutCliente.toString(),
        rutDeudor: doc.rutDeudor.toString(),
        numeroOperacion: doc.numeroOperacion.toString(),
        tipoDocumento: doc.tipoDocumento.toString(),
        numeroDocumento: doc.numeroDocumento.toString(),
      });
      const response = await fetch(`${API_URL}/recaudacion/gestiones/historial?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistorial(data);
        setHistorialOpen(true);
      }
    } catch (err) {
      console.error('Error cargando historial:', err);
    } finally {
      setLoading(false);
    }
  };

  const guardarGestion = async () => {
    if (!documentoSeleccionado) {
      setError('Debe seleccionar un documento');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const gestion = {
        rutCliente: documentoSeleccionado.rutCliente,
        rutDeudor: documentoSeleccionado.rutDeudor,
        numeroOperacion: documentoSeleccionado.numeroOperacion,
        tipoDocumento: documentoSeleccionado.tipoDocumento,
        numeroDocumento: documentoSeleccionado.numeroDocumento,
        codigoCobrador: cobradorSeleccionado,
        fechaGestion: new Date().toISOString().split('T')[0],
        horaGestion: new Date().toTimeString().slice(0, 5),
        estadoCobranza: nuevaGestion.estadoCobranza,
        fechaPago: nuevaGestion.fechaPago || null,
        horaPago: nuevaGestion.horaPago || null,
        fechaProximaGestion: nuevaGestion.fechaProximaGestion || null,
        horaProximaGestion: nuevaGestion.horaProximaGestion || null,
        observacion: nuevaGestion.observacion,
        documentoNecesario: nuevaGestion.documentoNecesario,
        codigoRecaudador: cobradorSeleccionado,
      };

      const response = await fetch(`${API_URL}/recaudacion/gestiones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(gestion),
      });

      if (response.ok) {
        setSuccess('Gestión guardada correctamente');
        // Limpiar formulario
        setNuevaGestion({
          estadoCobranza: 18,
          fechaPago: '',
          horaPago: '',
          fechaProximaGestion: '',
          horaProximaGestion: '',
          observacion: '',
          documentoNecesario: '',
        });
        // Recargar documentos
        if (clienteSeleccionado && deudorSeleccionado) {
          cargarDocumentos(clienteSeleccionado as number, deudorSeleccionado as number);
        }
      } else {
        const err = await response.text();
        setError(err || 'Error al guardar gestión');
      }
    } catch (err) {
      console.error('Error guardando gestión:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatDayjs = (DayjsStr: string) => {
    if (!DayjsStr) return '-';
    return new Date(DayjsStr).toLocaleDateString('es-CL');
  };

  const getEstadoColor = (estado: number, tieneProblema: boolean) => {
    if (tieneProblema) return 'error';
    if (estado === 21) return 'success'; // Promesa de pago
    if (estado === 19) return 'info'; // Contactado
    if (estado === 18) return 'default'; // Sin gestionar
    return 'warning';
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/recaudacion')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Phone sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestión de Cobranza Telefónica
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/principal'); }}>
            Inicio
          </Link>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/recaudacion'); }}>
            Recaudación
          </Link>
          <Typography color="text.primary">Gestión Telefónica</Typography>
        </Breadcrumbs>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Panel de selección */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ mr: 1 }} /> Selección
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cobrador</InputLabel>
                <Select
                  value={cobradorSeleccionado}
                  label="Cobrador"
                  onChange={(e) => setCobradorSeleccionado(e.target.value)}
                >
                  {cobradores.map((c) => (
                    <MenuItem key={c.codigoCobrador} value={c.codigoCobrador}>
                      {c.nombreCobrador}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Deudor</InputLabel>
                <Select
                  value={deudorSeleccionado}
                  label="Deudor"
                  onChange={(e) => setDeudorSeleccionado(e.target.value as number)}
                  disabled={!cobradorSeleccionado}
                >
                  {deudores.map((d) => (
                    <MenuItem key={d.rutDeudor} value={d.rutDeudor}>
                      {d.nombreDeudor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={clienteSeleccionado}
                  label="Cliente"
                  onChange={(e) => setClienteSeleccionado(e.target.value as number)}
                  disabled={!deudorSeleccionado}
                >
                  {clientes.map((c) => (
                    <MenuItem key={c.rutCliente} value={c.rutCliente}>
                      {c.nombreCliente}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Formulario de nueva gestión */}
            {documentoSeleccionado && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>Nueva Gestión</Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Estado Cobranza</InputLabel>
                  <Select
                    value={nuevaGestion.estadoCobranza}
                    label="Estado Cobranza"
                    onChange={(e) => setNuevaGestion({ ...nuevaGestion, estadoCobranza: e.target.value as number })}
                  >
                    {estadosCobranza.map((e) => (
                      <MenuItem key={e.codigo} value={e.codigo}>
                        {e.descripcion}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Fecha Promesa Pago"
                  type="Dayjs"
                  value={nuevaGestion.fechaPago}
                  onChange={(e) => setNuevaGestion({ ...nuevaGestion, fechaPago: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Próxima Gestión"
                  type="Dayjs"
                  value={nuevaGestion.fechaProximaGestion}
                  onChange={(e) => setNuevaGestion({ ...nuevaGestion, fechaProximaGestion: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Observación"
                  multiline
                  rows={3}
                  value={nuevaGestion.observacion}
                  onChange={(e) => setNuevaGestion({ ...nuevaGestion, observacion: e.target.value })}
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Save />}
                  onClick={guardarGestion}
                  disabled={loading}
                >
                  Guardar Gestión
                </Button>
              </Paper>
            )}
          </Grid>

          {/* Panel de documentos */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ mr: 1 }} /> Documentos Pendientes
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 3 }} />}

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipo</TableCell>
                      <TableCell>N° Doc</TableCell>
                      <TableCell>Vencimiento</TableCell>
                      <TableCell align="right">Monto</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Cobranza</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documentos.map((doc, idx) => (
                      <TableRow
                        key={`${doc.tipoDocumento}-${doc.numeroDocumento}-${idx}`}
                        hover
                        selected={documentoSeleccionado?.numeroDocumento === doc.numeroDocumento}
                        onClick={() => setDocumentoSeleccionado(doc)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{doc.descripcionTipoDocumento}</TableCell>
                        <TableCell>{doc.numeroDocumento}</TableCell>
                        <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
                        <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
                        <TableCell>{doc.descripcionEstadoDocumento}</TableCell>
                        <TableCell>
                          <Chip
                            label={doc.descripcionEstadoCobranza || 'SIN GESTIÓN'}
                            size="small"
                            color={getEstadoColor(doc.estadoCobranza, doc.tieneProblema)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => cargarHistorial(doc)} title="Ver historial">
                            <History />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {documentos.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          Seleccione un cliente para ver sus documentos
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {documentoSeleccionado && (
                <Card sx={{ mt: 2, bgcolor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Documento Seleccionado: {documentoSeleccionado.descripcionTipoDocumento} #{documentoSeleccionado.numeroDocumento}
                    </Typography>
                    <Typography variant="body2">
                      Operación: {documentoSeleccionado.numeroOperacion} | Monto: {formatCurrency(documentoSeleccionado.montoDocumento)} | Vence: {formatDayjs(documentoSeleccionado.fechaVencimiento)}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Diálogo de historial */}
      <Dialog open={historialOpen} onClose={() => setHistorialOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Historial de Gestiones</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Cobrador</TableCell>
                  <TableCell>Observación</TableCell>
                  <TableCell>Próx. Gestión</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historial.map((g) => (
                  <TableRow key={g.correlativo}>
                    <TableCell>{formatDayjs(g.fechaGestion)}</TableCell>
                    <TableCell>{g.horaGestion}</TableCell>
                    <TableCell>
                      <Chip label={g.descripcionEstadoCobranza} size="small" />
                    </TableCell>
                    <TableCell>{g.nombreCobrador}</TableCell>
                    <TableCell>{g.observacion}</TableCell>
                    <TableCell>{g.fechaProximaGestion ? formatDayjs(g.fechaProximaGestion) : '-'}</TableCell>
                  </TableRow>
                ))}
                {historial.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">Sin historial de gestiones</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistorialOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GestionCobranza;
