import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';


interface LineaCredito {
  rutCliente: number;
  numeroLinea: number;
  tipoMoneda: number;
  descripcionMoneda: string;
  fechaSolicitud: string;
  fechaResolucion?: string;
  vigenciaDesde?: string;
  vigenciaHasta?: string;
  estadoSolicitud: number;
  descripcionEstadoSolicitud: string;
  tasaNegocio: number;
  spread: number;
  montoSolicitado: number;
  montoAprobado: number;
  montoDisponible: number;
  estadoLinea: number;
  descripcionEstadoLinea: string;
  nombreCliente?: string;
  categoriaRiesgo?: string;
}

interface ResumenEndeudamiento {
  rutCliente: number;
  nombreCliente: string;
  totalSolicitado: number;
  totalAprobado: number;
  totalDisponible: number;
  totalUtilizado: number;
  porcentajeUtilizado: number;
  cantidadLineas: number;
  lineasVigentes: number;
  lineasVencidas: number;
  categoriaRiesgo?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const GestionLineas: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rutCliente, setRutCliente] = useState('');
  const [lineas, setLineas] = useState<LineaCredito[]>([]);
  const [resumen, setResumen] = useState<ResumenEndeudamiento | null>(null);
  const [_selectedLinea, setSelectedLinea] = useState<LineaCredito | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'new' | 'edit' | 'view'>('new');

  // Form fields for new/edit line
  const [formData, setFormData] = useState({
    tipoMoneda: 1,
    fechaSolicitud: dayjs(),
    estadoSolicitud: 1,
    tasaNegocio: 0,
    spread: 0,
    montoSolicitado: 0,
    montoAprobado: 0,
    estadoLinea: 1,
  });

  const buscarCliente = async () => {
    if (!rutCliente) return;
    
    setLoading(true);
    try {
      // Simulated API call
      // const response = await fetch(`/api/lineas-credito/cliente/${rutCliente}`);
      // const data = await response.json();
      
      // Datos de ejemplo
      setLineas([
        {
          rutCliente: parseInt(rutCliente),
          numeroLinea: 1,
          tipoMoneda: 1,
          descripcionMoneda: 'Peso',
          fechaSolicitud: '2024-01-15',
          vigenciaDesde: '2024-02-01',
          vigenciaHasta: '2025-02-01',
          estadoSolicitud: 2,
          descripcionEstadoSolicitud: 'Aprobada',
          tasaNegocio: 1.5,
          spread: 0.5,
          montoSolicitado: 50000000,
          montoAprobado: 40000000,
          montoDisponible: 25000000,
          estadoLinea: 2,
          descripcionEstadoLinea: 'Vigente',
          nombreCliente: 'Empresa Demo S.A.',
          categoriaRiesgo: 'A',
        },
      ]);

      setResumen({
        rutCliente: parseInt(rutCliente),
        nombreCliente: 'Empresa Demo S.A.',
        totalSolicitado: 50000000,
        totalAprobado: 40000000,
        totalDisponible: 25000000,
        totalUtilizado: 15000000,
        porcentajeUtilizado: 37.5,
        cantidadLineas: 1,
        lineasVigentes: 1,
        lineasVencidas: 0,
        categoriaRiesgo: 'A',
      });
    } catch (error) {
      console.error('Error buscando cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaLinea = () => {
    setFormData({
      tipoMoneda: 1,
      fechaSolicitud: dayjs(),
      estadoSolicitud: 1,
      tasaNegocio: 0,
      spread: 0,
      montoSolicitado: 0,
      montoAprobado: 0,
      estadoLinea: 1,
    });
    setDialogMode('new');
    setOpenDialog(true);
  };

  const handleEditLinea = (linea: LineaCredito) => {
    setSelectedLinea(linea);
    setFormData({
      tipoMoneda: linea.tipoMoneda,
      fechaSolicitud: dayjs(linea.fechaSolicitud),
      estadoSolicitud: linea.estadoSolicitud,
      tasaNegocio: linea.tasaNegocio,
      spread: linea.spread,
      montoSolicitado: linea.montoSolicitado,
      montoAprobado: linea.montoAprobado,
      estadoLinea: linea.estadoLinea,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleViewLinea = (linea: LineaCredito) => {
    setSelectedLinea(linea);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleSaveLinea = async () => {
    setLoading(true);
    try {
      // API call to save
      console.log('Guardando línea:', formData);
      setOpenDialog(false);
      await buscarCliente();
    } catch (error) {
      console.error('Error guardando línea:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getEstadoColor = (estado: number) => {
    switch (estado) {
      case 1: return 'default';     // Creada
      case 2: return 'success';     // Vigente
      case 3: return 'primary';     // Aprobada
      case 4: return 'error';       // Vencida
      case 5: return 'warning';     // Suspendida
      default: return 'default';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/principal'); }}>
            Inicio
          </Link>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/lineas-credito'); }}>
            Líneas de Crédito
          </Link>
          <Typography color="text.primary">Gestión</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/lineas-credito')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Gestión de Líneas de Crédito</Typography>
        </Box>

        {/* Búsqueda de cliente */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="RUT Cliente"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarCliente()}
                placeholder="Ej: 12345678"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={buscarCliente}
                disabled={loading}
              >
                Buscar
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleNuevaLinea}
                disabled={!rutCliente}
              >
                Nueva Línea
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen de endeudamiento */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Aprobado</Typography>
                  <Typography variant="h5">{formatCurrency(resumen.totalAprobado)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Disponible</Typography>
                  <Typography variant="h5" color="success.main">{formatCurrency(resumen.totalDisponible)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>Total Utilizado</Typography>
                  <Typography variant="h5" color="primary">{formatCurrency(resumen.totalUtilizado)}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>% Utilización</Typography>
                  <Typography variant="h5">{resumen.porcentajeUtilizado.toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs para líneas */}
        {lineas.length > 0 && (
          <Paper sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab label="Endeudamiento Cliente" />
              <Tab label="Sublínea por Producto" />
              <Tab label="Sublínea Deudores" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>N° Línea</TableCell>
                      <TableCell>Fecha Solicitud</TableCell>
                      <TableCell>Vigencia Desde</TableCell>
                      <TableCell>Vigencia Hasta</TableCell>
                      <TableCell>Estado Solicitud</TableCell>
                      <TableCell align="right">Spread</TableCell>
                      <TableCell align="right">Monto Solicitado</TableCell>
                      <TableCell align="right">Monto Aprobado</TableCell>
                      <TableCell>Estado Línea</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lineas.map((linea) => (
                      <TableRow key={linea.numeroLinea} hover>
                        <TableCell>{linea.numeroLinea}</TableCell>
                        <TableCell>{new Date(linea.fechaSolicitud).toLocaleDateString()}</TableCell>
                        <TableCell>{linea.vigenciaDesde ? new Date(linea.vigenciaDesde).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{linea.vigenciaHasta ? new Date(linea.vigenciaHasta).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{linea.descripcionEstadoSolicitud}</TableCell>
                        <TableCell align="right">{linea.spread.toFixed(2)}%</TableCell>
                        <TableCell align="right">{formatCurrency(linea.montoSolicitado)}</TableCell>
                        <TableCell align="right">{formatCurrency(linea.montoAprobado)}</TableCell>
                        <TableCell>
                          <Chip
                            label={linea.descripcionEstadoLinea}
                            size="small"
                            color={getEstadoColor(linea.estadoLinea) as any}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleViewLinea(linea)} title="Ver">
                            <ViewIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEditLinea(linea)} title="Editar">
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Alert severity="info">
                Seleccione una línea para ver o editar las sublíneas por producto
              </Alert>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Alert severity="info">
                Seleccione una línea para ver o editar las sublíneas por deudor
              </Alert>
            </TabPanel>
          </Paper>
        )}

        {/* Dialog para nueva/editar línea */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {dialogMode === 'new' ? 'Nueva Línea de Crédito' : dialogMode === 'edit' ? 'Editar Línea' : 'Ver Línea'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo Moneda</InputLabel>
                  <Select
                    value={formData.tipoMoneda}
                    label="Tipo Moneda"
                    onChange={(e) => setFormData({ ...formData, tipoMoneda: e.target.value as number })}
                    disabled={dialogMode === 'view'}
                  >
                    <MenuItem value={1}>Peso</MenuItem>
                    <MenuItem value={2}>Dólar</MenuItem>
                    <MenuItem value={3}>UF</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  label="Fecha Solicitud"
                  value={formData.fechaSolicitud}
                  onChange={(Dayjs) => Dayjs && setFormData({ ...formData, fechaSolicitud: Dayjs })}
                  disabled={dialogMode === 'view'}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Tasa Negocio %"
                  type="number"
                  value={formData.tasaNegocio}
                  onChange={(e) => setFormData({ ...formData, tasaNegocio: parseFloat(e.target.value) })}
                  disabled={dialogMode === 'view'}
                  inputProps={{ step: 0.01, min: 0, max: 100 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Spread %"
                  type="number"
                  value={formData.spread}
                  onChange={(e) => setFormData({ ...formData, spread: parseFloat(e.target.value) })}
                  disabled={dialogMode === 'view'}
                  inputProps={{ step: 0.01, min: 0, max: 100 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado Línea</InputLabel>
                  <Select
                    value={formData.estadoLinea}
                    label="Estado Línea"
                    onChange={(e) => setFormData({ ...formData, estadoLinea: e.target.value as number })}
                    disabled={dialogMode === 'view'}
                  >
                    <MenuItem value={1}>Creada</MenuItem>
                    <MenuItem value={2}>Vigente</MenuItem>
                    <MenuItem value={3}>Aprobada</MenuItem>
                    <MenuItem value={4}>Vencida</MenuItem>
                    <MenuItem value={5}>Suspendida</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Monto Solicitado"
                  type="number"
                  value={formData.montoSolicitado}
                  onChange={(e) => setFormData({ ...formData, montoSolicitado: parseFloat(e.target.value) })}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Monto Aprobado"
                  type="number"
                  value={formData.montoAprobado}
                  onChange={(e) => setFormData({ ...formData, montoAprobado: parseFloat(e.target.value) })}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            {dialogMode !== 'view' && (
              <Button variant="contained" onClick={handleSaveLinea} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default GestionLineas;
