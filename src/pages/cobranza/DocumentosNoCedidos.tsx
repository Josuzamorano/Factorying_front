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
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';

// Tipos
interface DocumentoNoCedido {
  numeroOperacion: number;
  tipoDocumento: number;
  descripcionTipoDocumento?: string;
  numeroDocumento: number;
  rutCliente: number;
  rutClienteFormateado?: string;
  nombreCliente: string;
  rutDeudor: number;
  rutDeudorFormateado?: string;
  nombreDeudor: string;
  fechaVencimiento: string;
  montoDocumento: number;
  motivoNoCesion?: string;
  fechaRegistro?: string;
}

interface ResumenDocumentosNoCedidos {
  totalDocumentos: number;
  montoTotal: number;
  porTipoDocumento: {
    tipoDocumento: number;
    descripcionTipoDocumento: string;
    cantidad: number;
    monto: number;
  }[];
  porCliente: {
    rutCliente: number;
    nombreCliente: string;
    cantidad: number;
    monto: number;
  }[];
}

interface RegistrarNoCedidoDto {
  tipoDocumento: number;
  numeroDocumento: number;
  numeroOperacion: number;
  motivo: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Formatea un número como moneda chilena
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value);
};

/**
 * Formatea una fecha
 */
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  return dayjs(dateString).format('DD/MM/YYYY');
};

/**
 * Página de Documentos No Cedidos - Migrada de F_CO2600.frm (VB6)
 * Permite consultar y gestionar documentos que no fueron cedidos a la empresa de factoring
 */
const DocumentosNoCedidos: React.FC = () => {
  const theme = useTheme();

  // Estado de filtros
  const [filtroCliente, setFiltroCliente] = useState('');
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(dayjs().subtract(1, 'month'));
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs());

  // Estado de datos
  const [documentos, setDocumentos] = useState<DocumentoNoCedido[]>([]);
  const [resumen, setResumen] = useState<ResumenDocumentosNoCedidos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado del diálogo de registro
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formNoCedido, setFormNoCedido] = useState<RegistrarNoCedidoDto>({
    tipoDocumento: 1,
    numeroDocumento: 0,
    numeroOperacion: 0,
    motivo: '',
  });
  const [savingNoCedido, setSavingNoCedido] = useState(false);

  // Documentos seleccionados para operaciones masivas
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  /**
   * Carga los documentos no cedidos
   */
  const cargarDocumentos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/cobranza/documentos-no-cedidos`;

      // Si hay filtro de cliente, usar ese endpoint
      if (filtroCliente.trim()) {
        const rut = filtroCliente.replace(/\./g, '').split('-')[0];
        if (rut) {
          url = `${API_BASE_URL}/cobranza/documentos-no-cedidos/cliente/${rut}`;
        }
      } else if (fechaDesde && fechaHasta) {
        url = `${API_BASE_URL}/cobranza/documentos-no-cedidos/fecha?fechaDesde=${fechaDesde.format('YYYY-MM-DD')}&fechaHasta=${fechaHasta.format('YYYY-MM-DD')}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar documentos no cedidos');
      const data = await response.json();
      setDocumentos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [filtroCliente, fechaDesde, fechaHasta]);

  /**
   * Carga el resumen de documentos no cedidos
   */
  const cargarResumen = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cobranza/documentos-no-cedidos/resumen`);
      if (!response.ok) throw new Error('Error al cargar resumen');
      const data = await response.json();
      setResumen(data);
    } catch (err) {
      console.error('Error cargando resumen:', err);
    }
  }, []);

  // Cargar datos al montar y cuando cambian los filtros
  useEffect(() => {
    cargarDocumentos();
    cargarResumen();
  }, [cargarDocumentos, cargarResumen]);

  /**
   * Maneja la búsqueda
   */
  const handleBuscar = () => {
    cargarDocumentos();
    cargarResumen();
  };

  /**
   * Abre el diálogo para registrar un documento como no cedido
   */
  const handleAbrirDialogo = () => {
    setFormNoCedido({
      tipoDocumento: 1,
      numeroDocumento: 0,
      numeroOperacion: 0,
      motivo: '',
    });
    setDialogOpen(true);
  };

  /**
   * Guarda el documento como no cedido
   */
  const handleGuardarNoCedido = async () => {
    setSavingNoCedido(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/cobranza/documentos-no-cedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formNoCedido),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al registrar documento como no cedido');
      }

      setDialogOpen(false);
      cargarDocumentos();
      cargarResumen();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setSavingNoCedido(false);
    }
  };

  /**
   * Maneja la selección de un documento
   */
  const handleToggleSeleccion = (doc: DocumentoNoCedido) => {
    const key = `${doc.numeroOperacion}-${doc.tipoDocumento}-${doc.numeroDocumento}`;
    const nuevaSeleccion = new Set(seleccionados);
    if (nuevaSeleccion.has(key)) {
      nuevaSeleccion.delete(key);
    } else {
      nuevaSeleccion.add(key);
    }
    setSeleccionados(nuevaSeleccion);
  };

  /**
   * Calcula totales de documentos seleccionados
   */
  const calcularTotalSeleccionado = (): number => {
    return documentos
      .filter(d => seleccionados.has(`${d.numeroOperacion}-${d.tipoDocumento}-${d.numeroDocumento}`))
      .reduce((sum, d) => sum + d.montoDocumento, 0);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <Box sx={{ p: 3 }}>
        {/* Título */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Documentos No Cedidos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Gestión de documentos que no fueron cedidos a la empresa de factoring (F_CO2600)
        </Typography>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tarjetas de Resumen */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon />
                  <Typography variant="h6">Total Documentos</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {resumen?.totalDocumentos || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  <Typography variant="h6">Monto Total</Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(resumen?.montoTotal || 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.info.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon />
                  <Typography variant="h6">Clientes</Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {resumen?.porCliente?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  <Typography variant="h6">Seleccionado</Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(calcularTotalSeleccionado())}
                </Typography>
                <Typography variant="caption">
                  {seleccionados.size} documentos
                </Typography>
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
                label="Cliente (RUT)"
                placeholder="12.345.678-9"
                value={filtroCliente}
                onChange={(e) => setFiltroCliente(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <DatePicker
                label="Fecha Desde"
                value={fechaDesde}
                onChange={(newValue) => setFechaDesde(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <DatePicker
                label="Fecha Hasta"
                value={fechaHasta}
                onChange={(newValue) => setFechaHasta(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleBuscar}
                  disabled={loading}
                >
                  Buscar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setFiltroCliente('');
                    setFechaDesde(dayjs().subtract(1, 'month'));
                    setFechaHasta(dayjs());
                    cargarDocumentos();
                  }}
                >
                  Limpiar
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={handleAbrirDialogo}
                >
                  Nuevo D.N.C.
                </Button>
                <Tooltip title="Exportar a Excel">
                  <IconButton color="primary">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Imprimir">
                  <IconButton color="primary">
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de Documentos */}
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ fontWeight: 'bold' }}>Sel</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Deudor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fec. Pago</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>N° Dcto.</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Monto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Motivo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : documentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No se encontraron documentos no cedidos
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  documentos.map((doc) => {
                    const key = `${doc.numeroOperacion}-${doc.tipoDocumento}-${doc.numeroDocumento}`;
                    const isSelected = seleccionados.has(key);
                    return (
                      <TableRow
                        key={key}
                        hover
                        selected={isSelected}
                        onClick={() => handleToggleSeleccion(doc)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSeleccion(doc)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {doc.nombreCliente}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.rutClienteFormateado || doc.rutCliente}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {doc.nombreDeudor}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {doc.rutDeudorFormateado || doc.rutDeudor}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatDate(doc.fechaVencimiento)}</TableCell>
                        <TableCell>{doc.numeroDocumento}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
                            {formatCurrency(doc.montoDocumento)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doc.descripcionTipoDocumento || `Tipo ${doc.tipoDocumento}`}
                            size="small"
                            color="default"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                            {doc.motivoNoCesion || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totales */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
            <Typography variant="body1">
              <strong>Total:</strong> {formatCurrency(documentos.reduce((sum, d) => sum + d.montoDocumento, 0))}
            </Typography>
            <Typography variant="body1" color="primary">
              <strong>Total Selec.:</strong> {formatCurrency(calcularTotalSeleccionado())}
            </Typography>
          </Box>
        </Paper>

        {/* Diálogo para registrar documento como no cedido */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Ingreso Documento No Cedido</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="N° Operación"
                  type="number"
                  value={formNoCedido.numeroOperacion || ''}
                  onChange={(e) => setFormNoCedido({ ...formNoCedido, numeroOperacion: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="N° Documento"
                  type="number"
                  value={formNoCedido.numeroDocumento || ''}
                  onChange={(e) => setFormNoCedido({ ...formNoCedido, numeroDocumento: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Tipo Documento"
                  value={formNoCedido.tipoDocumento}
                  onChange={(e) => setFormNoCedido({ ...formNoCedido, tipoDocumento: parseInt(e.target.value) })}
                  SelectProps={{ native: true }}
                >
                  <option value={1}>Factura</option>
                  <option value={2}>Cheque</option>
                  <option value={3}>Letra</option>
                  <option value={4}>Otro</option>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Motivo / Descripción"
                  multiline
                  rows={3}
                  value={formNoCedido.motivo}
                  onChange={(e) => setFormNoCedido({ ...formNoCedido, motivo: e.target.value })}
                  placeholder="Ingrese el motivo por el cual el documento no fue cedido..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleGuardarNoCedido}
              variant="contained"
              disabled={savingNoCedido || !formNoCedido.numeroDocumento || !formNoCedido.numeroOperacion}
            >
              {savingNoCedido ? <CircularProgress size={24} /> : 'Aceptar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default DocumentosNoCedidos;
