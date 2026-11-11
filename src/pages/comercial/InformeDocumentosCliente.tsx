// ====================================================
// Informe de Documentos por Cliente - Migrado de F_CM1700.frm
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
  Tabs,
  Tab,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as DocIcon,
  Warning as VencidoIcon,
  Schedule as PorVencerIcon,
  Assessment as ReporteIcon,
  FileDownload as ExportIcon,
  Person as ClienteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

// ====== Interfaces ======
interface DocumentoCliente {
  numeroOperacion: number;
  tipoDocumento: number;
  tipoDocumentoDescripcion: string;
  numeroDocumento: string;
  rutCliente: number;
  nombreCliente: string;
  rutDeudor: number;
  nombreDeudor: string;
  montoDocumento: number;
  saldoDocumento: number;
  fechaOperacion: string;
  fechaVencimiento: string;
  diasVencido: number;
  estado: number;
  estadoDescripcion: string;
}

interface ResumenDocumentos {
  rutCliente: number;
  nombreCliente: string;
  totalDocumentos: number;
  montoTotal: number;
  saldoTotal: number;
  documentosVencidos: number;
  montoVencido: number;
  documentosPorVencer: number;
  montoPorVencer: number;
}

interface FiltroDocumentos {
  rutCliente: string;
  tipoDocumento: string;
  fechaOperacionDesde: Dayjs | null;
  fechaOperacionHasta: Dayjs | null;
  fechaVencimientoDesde: Dayjs | null;
  fechaVencimientoHasta: Dayjs | null;
  estado: string;
  soloVencidos: boolean;
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
const InformeDocumentosCliente: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [documentos, setDocumentos] = useState<DocumentoCliente[]>([]);
  const [documentosVencidos, setDocumentosVencidos] = useState<DocumentoCliente[]>([]);
  const [documentosPorVencer, setDocumentosPorVencer] = useState<DocumentoCliente[]>([]);
  const [resumen, setResumen] = useState<ResumenDocumentos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<{ rut: number; nombre: string } | null>(null);
  const [diasPorVencer, setDiasPorVencer] = useState<number>(30);
  
  const [filtro, setFiltro] = useState<FiltroDocumentos>({
    rutCliente: '',
    tipoDocumento: '',
    fechaOperacionDesde: null,
    fechaOperacionHasta: null,
    fechaVencimientoDesde: null,
    fechaVencimientoHasta: null,
    estado: '',
    soloVencidos: false,
  });

  // ====== API Calls ======
  const buscarDocumentos = async () => {
    if (!filtro.rutCliente) {
      setError('Ingrese el RUT del cliente');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('rutCliente', filtro.rutCliente);
      if (filtro.tipoDocumento) params.append('tipoDocumento', filtro.tipoDocumento);
      if (filtro.fechaOperacionDesde) params.append('fechaOperacionDesde', filtro.fechaOperacionDesde.toISOString());
      if (filtro.fechaOperacionHasta) params.append('fechaOperacionHasta', filtro.fechaOperacionHasta.toISOString());
      if (filtro.fechaVencimientoDesde) params.append('fechaVencimientoDesde', filtro.fechaVencimientoDesde.toISOString());
      if (filtro.fechaVencimientoHasta) params.append('fechaVencimientoHasta', filtro.fechaVencimientoHasta.toISOString());
      if (filtro.estado) params.append('estado', filtro.estado);
      if (filtro.soloVencidos) params.append('soloVencidos', 'true');

      const response = await fetch(`/api/comercial/documentos-cliente?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al buscar documentos');
      
      const data = await response.json();
      setDocumentos(data);
      
      // Obtener nombre cliente del primer documento
      if (data.length > 0) {
        setClienteSeleccionado({
          rut: data[0].rutCliente,
          nombre: data[0].nombreCliente,
        });
      }
    } catch (err) {
      setError('Error al buscar documentos del cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarResumen = async () => {
    if (!filtro.rutCliente) return;

    try {
      const response = await fetch(`/api/comercial/documentos-cliente/${filtro.rutCliente}/resumen`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar resumen');
      
      const data = await response.json();
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    }
  };

  const cargarDocumentosVencidos = async () => {
    if (!filtro.rutCliente) return;

    try {
      const response = await fetch(`/api/comercial/documentos-cliente/${filtro.rutCliente}/vencidos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar documentos vencidos');
      
      const data = await response.json();
      setDocumentosVencidos(data);
    } catch (err) {
      console.error('Error al cargar documentos vencidos:', err);
    }
  };

  const cargarDocumentosPorVencer = async () => {
    if (!filtro.rutCliente) return;

    try {
      const response = await fetch(`/api/comercial/documentos-cliente/${filtro.rutCliente}/por-vencer?dias=${diasPorVencer}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar documentos por vencer');
      
      const data = await response.json();
      setDocumentosPorVencer(data);
    } catch (err) {
      console.error('Error al cargar documentos por vencer:', err);
    }
  };

  // Cargar todo cuando se busca cliente
  const buscarTodo = async () => {
    await buscarDocumentos();
    await cargarResumen();
    await cargarDocumentosVencidos();
    await cargarDocumentosPorVencer();
  };

  useEffect(() => {
    if (clienteSeleccionado) {
      cargarDocumentosPorVencer();
    }
  }, [diasPorVencer]);

  // ====== Helpers ======
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  const getEstadoColor = (estado: number): 'success' | 'warning' | 'error' | 'default' => {
    switch (estado) {
      case 1: return 'success';  // Vigente
      case 2: return 'default';  // Pagado
      case 3: return 'error';    // Protestado
      default: return 'default';
    }
  };

  const getDiasVencidoColor = (dias: number) => {
    if (dias > 0) return 'error.main';
    if (dias > -7) return 'warning.main';
    return 'text.primary';
  };

  const exportarExcel = () => {
    // Implementar exportación a Excel
    alert('Funcionalidad de exportación en desarrollo');
  };

  // ====== Render ======
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            <ReporteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Informe de Documentos por Cliente
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={exportarExcel}
            disabled={documentos.length === 0}
          >
            Exportar Excel
          </Button>
        </Box>

        {/* Alerta de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros de búsqueda */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            <SearchIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
            Búsqueda de Cliente
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="RUT Cliente *"
                value={filtro.rutCliente}
                onChange={(e) => setFiltro({ ...filtro, rutCliente: e.target.value })}
                size="small"
                placeholder="12345678"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Doc.</InputLabel>
                <Select
                  value={filtro.tipoDocumento}
                  label="Tipo Doc."
                  onChange={(e) => setFiltro({ ...filtro, tipoDocumento: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="1">Factura</MenuItem>
                  <MenuItem value="2">Cheque</MenuItem>
                  <MenuItem value="3">Letra</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtro.estado}
                  label="Estado"
                  onChange={(e) => setFiltro({ ...filtro, estado: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="1">Vigente</MenuItem>
                  <MenuItem value="2">Pagado</MenuItem>
                  <MenuItem value="3">Protestado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <DatePicker
                label="Vto. Desde"
                value={filtro.fechaVencimientoDesde}
                onChange={(newValue) => setFiltro({ ...filtro, fechaVencimientoDesde: newValue as Dayjs | null })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <DatePicker
                label="Vto. Hasta"
                value={filtro.fechaVencimientoHasta}
                onChange={(newValue) => setFiltro({ ...filtro, fechaVencimientoHasta: newValue as Dayjs | null })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 1 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={buscarTodo}
                disabled={loading}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Info del cliente seleccionado */}
        {clienteSeleccionado && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid>
                <ClienteIcon fontSize="large" />
              </Grid>
              <Grid size="grow">
                <Typography variant="h6">{clienteSeleccionado.nombre}</Typography>
                <Typography variant="body2">RUT: {clienteSeleccionado.rut}</Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Resumen del cliente */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Documentos
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {resumen.totalDocumentos}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Monto: {formatCurrency(resumen.montoTotal)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Saldo Total
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(resumen.saldoTotal)}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(resumen.saldoTotal / resumen.montoTotal) * 100} 
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderLeft: 4, borderColor: 'error.main' }}>
                <CardContent>
                  <Typography color="error" gutterBottom>
                    <VencidoIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} />
                    Documentos Vencidos
                  </Typography>
                  <Typography variant="h4" color="error">
                    {resumen.documentosVencidos}
                  </Typography>
                  <Typography variant="body2" color="error">
                    Monto: {formatCurrency(resumen.montoVencido)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
                <CardContent>
                  <Typography color="warning.main" gutterBottom>
                    <PorVencerIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} />
                    Por Vencer ({diasPorVencer} días)
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'warning.main' }}>
                    {resumen.documentosPorVencer}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'warning.main' }}>
                    Monto: {formatCurrency(resumen.montoPorVencer)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs de documentos */}
        {clienteSeleccionado && (
          <Paper>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab 
                label={`Todos (${documentos.length})`} 
                icon={<DocIcon />} 
                iconPosition="start" 
              />
              <Tab 
                label={`Vencidos (${documentosVencidos.length})`} 
                icon={<VencidoIcon />} 
                iconPosition="start"
                sx={{ color: documentosVencidos.length > 0 ? 'error.main' : 'inherit' }}
              />
              <Tab 
                label={`Por Vencer (${documentosPorVencer.length})`} 
                icon={<PorVencerIcon />} 
                iconPosition="start"
                sx={{ color: documentosPorVencer.length > 0 ? 'warning.main' : 'inherit' }}
              />
            </Tabs>

            {loading && <LinearProgress />}

            {/* Tab: Todos los documentos */}
            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'primary.main' }}>
                      <TableCell sx={{ color: 'white' }}>Operación</TableCell>
                      <TableCell sx={{ color: 'white' }}>Tipo</TableCell>
                      <TableCell sx={{ color: 'white' }}>N° Documento</TableCell>
                      <TableCell sx={{ color: 'white' }}>Deudor</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Monto</TableCell>
                      <TableCell sx={{ color: 'white' }} align="right">Saldo</TableCell>
                      <TableCell sx={{ color: 'white' }}>Fec. Operación</TableCell>
                      <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                      <TableCell sx={{ color: 'white' }} align="center">Días</TableCell>
                      <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documentos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          No se encontraron documentos
                        </TableCell>
                      </TableRow>
                    ) : (
                      documentos.map((doc, idx) => (
                        <TableRow 
                          key={`${doc.tipoDocumento}-${doc.numeroDocumento}-${idx}`}
                          hover
                          sx={{ 
                            bgcolor: doc.diasVencido > 0 ? 'error.50' : 
                                    doc.diasVencido > -7 ? 'warning.50' : 'inherit' 
                          }}
                        >
                          <TableCell>{doc.numeroOperacion}</TableCell>
                          <TableCell>{doc.tipoDocumentoDescripcion}</TableCell>
                          <TableCell>{doc.numeroDocumento}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{doc.nombreDeudor}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {doc.rutDeudor}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
                          <TableCell align="right">{formatCurrency(doc.saldoDocumento)}</TableCell>
                          <TableCell>{formatDayjs(doc.fechaOperacion)}</TableCell>
                          <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
                          <TableCell align="center">
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: getDiasVencidoColor(doc.diasVencido),
                                fontWeight: doc.diasVencido > 0 ? 'bold' : 'normal'
                              }}
                            >
                              {doc.diasVencido > 0 ? `+${doc.diasVencido}` : doc.diasVencido}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={doc.estadoDescripcion}
                              color={getEstadoColor(doc.estado)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {documentos.length > 0 && (
                <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2">
                        <strong>Total Documentos:</strong> {documentos.length}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2">
                        <strong>Total Monto:</strong> {formatCurrency(documentos.reduce((sum, d) => sum + d.montoDocumento, 0))}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Typography variant="body2">
                        <strong>Total Saldo:</strong> {formatCurrency(documentos.reduce((sum, d) => sum + d.saldoDocumento, 0))}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </TabPanel>

            {/* Tab: Documentos Vencidos */}
            <TabPanel value={tabValue} index={1}>
              {documentosVencidos.length === 0 ? (
                <Alert severity="success">
                  No hay documentos vencidos para este cliente
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'error.main' }}>
                        <TableCell sx={{ color: 'white' }}>Operación</TableCell>
                        <TableCell sx={{ color: 'white' }}>Tipo</TableCell>
                        <TableCell sx={{ color: 'white' }}>N° Documento</TableCell>
                        <TableCell sx={{ color: 'white' }}>Deudor</TableCell>
                        <TableCell sx={{ color: 'white' }} align="right">Saldo</TableCell>
                        <TableCell sx={{ color: 'white' }}>Vencimiento</TableCell>
                        <TableCell sx={{ color: 'white' }} align="center">Días Vencido</TableCell>
                        <TableCell sx={{ color: 'white' }}>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documentosVencidos.map((doc, idx) => (
                        <TableRow key={`v-${doc.tipoDocumento}-${doc.numeroDocumento}-${idx}`} hover>
                          <TableCell>{doc.numeroOperacion}</TableCell>
                          <TableCell>{doc.tipoDocumentoDescripcion}</TableCell>
                          <TableCell>{doc.numeroDocumento}</TableCell>
                          <TableCell>{doc.nombreDeudor}</TableCell>
                          <TableCell align="right">{formatCurrency(doc.saldoDocumento)}</TableCell>
                          <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${doc.diasVencido} días`} 
                              color="error" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={doc.estadoDescripcion}
                              color={getEstadoColor(doc.estado)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {documentosVencidos.length > 0 && (
                <Box sx={{ p: 2, bgcolor: 'error.50' }}>
                  <Typography variant="body2" color="error">
                    <strong>Total Vencido:</strong> {formatCurrency(documentosVencidos.reduce((sum, d) => sum + d.saldoDocumento, 0))}
                  </Typography>
                </Box>
              )}
            </TabPanel>

            {/* Tab: Documentos Por Vencer */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography>Documentos por vencer en los próximos:</Typography>
                <TextField
                  type="number"
                  size="small"
                  value={diasPorVencer}
                  onChange={(e) => setDiasPorVencer(Number(e.target.value))}
                  sx={{ width: 80 }}
                  inputProps={{ min: 1, max: 365 }}
                />
                <Typography>días</Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  onClick={cargarDocumentosPorVencer}
                >
                  Actualizar
                </Button>
              </Box>

              {documentosPorVencer.length === 0 ? (
                <Alert severity="info">
                  No hay documentos por vencer en los próximos {diasPorVencer} días
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'warning.main' }}>
                        <TableCell>Operación</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>N° Documento</TableCell>
                        <TableCell>Deudor</TableCell>
                        <TableCell align="right">Saldo</TableCell>
                        <TableCell>Vencimiento</TableCell>
                        <TableCell align="center">Días Restantes</TableCell>
                        <TableCell>Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documentosPorVencer.map((doc, idx) => (
                        <TableRow key={`pv-${doc.tipoDocumento}-${doc.numeroDocumento}-${idx}`} hover>
                          <TableCell>{doc.numeroOperacion}</TableCell>
                          <TableCell>{doc.tipoDocumentoDescripcion}</TableCell>
                          <TableCell>{doc.numeroDocumento}</TableCell>
                          <TableCell>{doc.nombreDeudor}</TableCell>
                          <TableCell align="right">{formatCurrency(doc.saldoDocumento)}</TableCell>
                          <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${Math.abs(doc.diasVencido)} días`} 
                              color="warning" 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={doc.estadoDescripcion}
                              color={getEstadoColor(doc.estado)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {documentosPorVencer.length > 0 && (
                <Box sx={{ p: 2, bgcolor: 'warning.50' }}>
                  <Typography variant="body2" sx={{ color: 'warning.dark' }}>
                    <strong>Total Por Vencer:</strong> {formatCurrency(documentosPorVencer.reduce((sum, d) => sum + d.saldoDocumento, 0))}
                  </Typography>
                </Box>
              )}
            </TabPanel>
          </Paper>
        )}

        {/* Mensaje inicial si no hay cliente */}
        {!clienteSeleccionado && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <DocIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              Ingrese el RUT de un cliente para ver sus documentos
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Podrá visualizar el resumen, documentos vencidos y por vencer
            </Typography>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default InformeDocumentosCliente;
