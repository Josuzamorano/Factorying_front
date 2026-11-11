// ====================================================
// Tasas Bases - Migrado de F_FI1200.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';


// ====== Interfaces ======
interface TasaBase {
  id: number;
  tipoPeriodo: string;
  descripcionPeriodo: string;
  fechaVigencia: string;
  codigoMoneda: number;
  descripcionMoneda: string;
  valorTasa: number;
  tasaMora: number;
  tasaMaximaLegal: number;
  fechaActualizacion: string;
}


const tiposMoneda = [
  { valor: 1, descripcion: 'Peso' },
  { valor: 2, descripcion: 'Dólar' },
  { valor: 3, descripcion: 'UF' },
  { valor: 4, descripcion: 'Euro' },
];

const tiposPeriodo = [
  { valor: '30', descripcion: 'Mensual (30 días)' },
  { valor: '60', descripcion: 'Bimestral (60 días)' },
  { valor: '90', descripcion: 'Trimestral (90 días)' },
  { valor: '180', descripcion: 'Semestral (180 días)' },
  { valor: '360', descripcion: 'Anual (360 días)' },
];

// ====== Componente Principal ======
const TasasBases: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [tasas, setTasas] = useState<TasaBase[]>([]);
  const [tasasFiltradas, setTasasFiltradas] = useState<TasaBase[]>([]);
  
  // Filtros
  const [fechaDesde, setFechaDesde] = useState<Dayjs | null>(dayjs().subtract(1, 'month'));
  const [fechaHasta, setFechaHasta] = useState<Dayjs | null>(dayjs());
  const [tipoMoneda, setTipoMoneda] = useState<number>(1);
  const [tipoPeriodo, setTipoPeriodo] = useState<string>('');
  
  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'new' | 'edit'>('new');
  const [tasaSeleccionada, setTasaSeleccionada] = useState<TasaBase | null>(null);
  
  // Form
  const [formData, setFormData] = useState({
    tipoPeriodo: '30',
    codigoMoneda: 1,
    valorTasa: 0,
    tasaMora: 0,
    tasaMaximaLegal: 0,
    fechaVigencia: dayjs(),
  });

  useEffect(() => {
    cargarTasas();
  }, []);

  // ====== API Calls ======
  const cargarTasas = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fechaDesde) params.append('fechaDesde', fechaDesde.format('YYYY-MM-DD'));
      if (fechaHasta) params.append('fechaHasta', fechaHasta.format('YYYY-MM-DD'));
      if (tipoMoneda) params.append('tipoMoneda', tipoMoneda.toString());
      if (tipoPeriodo) params.append('tipoPeriodo', tipoPeriodo);

      const response = await fetch(`/api/finanzas/tasas-bases?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al cargar tasas bases');
      
      const data = await response.json();
      setTasas(data);
      setTasasFiltradas(data);
    } catch (err) {
      setError('Error al cargar tasas bases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const buscar = () => {
    let filtradas = [...tasas];
    
    if (tipoMoneda) {
      filtradas = filtradas.filter(t => t.codigoMoneda === tipoMoneda);
    }
    
    if (tipoPeriodo) {
      filtradas = filtradas.filter(t => t.tipoPeriodo === tipoPeriodo);
    }
    
    setTasasFiltradas(filtradas);
  };

  const guardarTasa = async () => {
    setLoading(true);
    try {
      const payload = {
        tipoPeriodo: formData.tipoPeriodo,
        codigoMoneda: formData.codigoMoneda,
        valorTasa: formData.valorTasa,
        tasaMora: formData.tasaMora,
        tasaMaximaLegal: formData.tasaMaximaLegal,
        fechaVigencia: formData.fechaVigencia.toISOString(),
      };

      const url = dialogMode === 'new'
        ? '/api/finanzas/tasas-bases'
        : `/api/finanzas/tasas-bases/${tasaSeleccionada?.id}`;

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
        throw new Error(errorData.message || 'Error al guardar tasa');
      }

      setSuccess(dialogMode === 'new' ? 'Tasa creada exitosamente' : 'Tasa actualizada exitosamente');
      setOpenDialog(false);
      cargarTasas();
    } catch (err: any) {
      setError(err.message || 'Error al guardar tasa');
    } finally {
      setLoading(false);
    }
  };

  const eliminarTasa = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta tasa?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/finanzas/tasas-bases/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) throw new Error('Error al eliminar tasa');

      setSuccess('Tasa eliminada exitosamente');
      cargarTasas();
    } catch (err) {
      setError('Error al eliminar tasa');
    } finally {
      setLoading(false);
    }
  };

  // ====== Handlers ======
  const handleNueva = () => {
    setFormData({
      tipoPeriodo: '30',
      codigoMoneda: 1,
      valorTasa: 0,
      tasaMora: 0,
      tasaMaximaLegal: 0,
      fechaVigencia: dayjs(),
    });
    setDialogMode('new');
    setOpenDialog(true);
  };

  const handleEditar = (tasa: TasaBase) => {
    setTasaSeleccionada(tasa);
    setFormData({
      tipoPeriodo: tasa.tipoPeriodo,
      codigoMoneda: tasa.codigoMoneda,
      valorTasa: tasa.valorTasa,
      tasaMora: tasa.tasaMora,
      tasaMaximaLegal: tasa.tasaMaximaLegal,
      fechaVigencia: dayjs(tasa.fechaVigencia),
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  // ====== Helpers ======
  const formatPercent = (value: number) => `${value.toFixed(4)}%`;
  
  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  const getMonedaColor = (codigo: number): 'primary' | 'secondary' | 'success' | 'warning' => {
    switch (codigo) {
      case 1: return 'primary';  // Peso
      case 2: return 'success';  // Dólar
      case 3: return 'secondary'; // UF
      default: return 'warning';
    }
  };

  // Calcular resumen
  const resumen = {
    total: tasasFiltradas.length,
    promedioBase: tasasFiltradas.length > 0 
      ? tasasFiltradas.reduce((acc, t) => acc + t.valorTasa, 0) / tasasFiltradas.length 
      : 0,
    promedioMora: tasasFiltradas.length > 0 
      ? tasasFiltradas.reduce((acc, t) => acc + t.tasaMora, 0) / tasasFiltradas.length 
      : 0,
    maxTasa: tasasFiltradas.length > 0 
      ? Math.max(...tasasFiltradas.map(t => t.valorTasa)) 
      : 0,
    minTasa: tasasFiltradas.length > 0 
      ? Math.min(...tasasFiltradas.map(t => t.valorTasa)) 
      : 0,
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
            onClick={() => navigate('/finanzas')}
          >
            Finanzas
          </Link>
          <Typography color="text.primary">Tasas Bases</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/finanzas')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              <ChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Tasas Bases
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarTasas}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNueva}
            >
              Nueva Tasa
            </Button>
          </Box>
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

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filtros</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <DatePicker
                label="Fecha Desde"
                value={fechaDesde}
                onChange={(Dayjs) => setFechaDesde(Dayjs)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <DatePicker
                label="Fecha Hasta"
                value={fechaHasta}
                onChange={(Dayjs) => setFechaHasta(Dayjs)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Moneda</InputLabel>
                <Select
                  value={tipoMoneda}
                  label="Moneda"
                  onChange={(e) => setTipoMoneda(Number(e.target.value))}
                >
                  <MenuItem value={0}>Todas</MenuItem>
                  {tiposMoneda.map((m) => (
                    <MenuItem key={m.valor} value={m.valor}>{m.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Período</InputLabel>
                <Select
                  value={tipoPeriodo}
                  label="Período"
                  onChange={(e) => setTipoPeriodo(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {tiposPeriodo.map((p) => (
                    <MenuItem key={p.valor} value={p.valor}>{p.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={buscar}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Registros
                </Typography>
                <Typography variant="h4" color="primary">
                  {resumen.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tasa Base Promedio
                </Typography>
                <Typography variant="h6">
                  {formatPercent(resumen.promedioBase)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Tasa Mora Promedio
                </Typography>
                <Typography variant="h6" color="error">
                  {formatPercent(resumen.promedioMora)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  <TrendingDownIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Mínima
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatPercent(resumen.minTasa)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Máxima
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {formatPercent(resumen.maxTasa)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs por Moneda */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label="Todas" />
            <Tab label="Peso" />
            <Tab label="Dólar" />
            <Tab label="UF" />
          </Tabs>
        </Paper>

        {/* Tabla */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'primary.main' }}>
                  <TableCell sx={{ color: 'white' }}>Fecha Vigencia</TableCell>
                  <TableCell sx={{ color: 'white' }}>Moneda</TableCell>
                  <TableCell sx={{ color: 'white' }}>Período</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Tasa Base</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Tasa Mora</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Tasa Máx. Legal</TableCell>
                  <TableCell sx={{ color: 'white' }} align="right">Tasa Mensual</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actualización</TableCell>
                  <TableCell sx={{ color: 'white' }} align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasasFiltradas
                  .filter(t => tabValue === 0 || t.codigoMoneda === tabValue)
                  .length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay tasas bases registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  tasasFiltradas
                    .filter(t => tabValue === 0 || t.codigoMoneda === tabValue)
                    .map((tasa) => (
                      <TableRow key={tasa.id} hover>
                        <TableCell>{formatDayjs(tasa.fechaVigencia)}</TableCell>
                        <TableCell>
                          <Chip
                            label={tasa.descripcionMoneda}
                            color={getMonedaColor(tasa.codigoMoneda)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{tasa.descripcionPeriodo || `${tasa.tipoPeriodo} días`}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">{formatPercent(tasa.valorTasa)}</Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {formatPercent(tasa.tasaMora)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'warning.main' }}>
                          {formatPercent(tasa.tasaMaximaLegal)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'info.main' }}>
                          {formatPercent(tasa.valorTasa / 12)}
                        </TableCell>
                        <TableCell>
                          {tasa.fechaActualizacion ? formatDayjs(tasa.fechaActualizacion) : '-'}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleEditar(tasa)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => eliminarTasa(tasa.id)}
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

        {/* Dialog Nueva/Editar Tasa */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <ChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {dialogMode === 'new' ? 'Nueva Tasa Base' : 'Editar Tasa Base'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha Vigencia"
                  value={formData.fechaVigencia}
                  onChange={(Dayjs) => setFormData({ ...formData, fechaVigencia: Dayjs || dayjs() })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Período</InputLabel>
                  <Select
                    value={formData.tipoPeriodo}
                    label="Período"
                    onChange={(e) => setFormData({ ...formData, tipoPeriodo: e.target.value })}
                  >
                    {tiposPeriodo.map((p) => (
                      <MenuItem key={p.valor} value={p.valor}>{p.descripcion}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }}>Tasas (%)</Divider>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tasa Base"
                  type="number"
                  value={formData.valorTasa}
                  onChange={(e) => setFormData({ ...formData, valorTasa: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.0001, min: 0 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tasa Mora"
                  type="number"
                  value={formData.tasaMora}
                  onChange={(e) => setFormData({ ...formData, tasaMora: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.0001, min: 0 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tasa Máx. Legal"
                  type="number"
                  value={formData.tasaMaximaLegal}
                  onChange={(e) => setFormData({ ...formData, tasaMaximaLegal: parseFloat(e.target.value) || 0 })}
                  inputProps={{ step: 0.0001, min: 0 }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  Tasa mensual calculada: {formatPercent(formData.valorTasa / 12)}
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={guardarTasa}
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

export default TasasBases;
