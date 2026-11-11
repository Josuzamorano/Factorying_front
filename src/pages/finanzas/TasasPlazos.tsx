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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';


interface TasaPlazo {
  fechaVigencia: string;
  tipoTasa: number;
  descripcionTipoTasa: string;
  tipoMoneda: number;
  descripcionMoneda: string;
  diasTramo: number;
  tasaBase: number;
  tasaMora: number;
  tasaMaximaConvencional: number;
  tasaAuxiliar: number;
}

interface ResumenTasas {
  cantidadTramos: number;
  tasaBasePromedio: number;
  tasaBaseMinima: number;
  tasaBaseMaxima: number;
  tasaMoraPromedio: number;
}

const tiposMoneda = [
  { valor: 1, descripcion: 'Peso' },
  { valor: 2, descripcion: 'Dólar' },
  { valor: 3, descripcion: 'UF' },
];

const tiposRango = [
  { valor: 1, descripcion: 'Hasta 5 Millones' },
  { valor: 2, descripcion: 'De 5 a 20 Millones' },
  { valor: 3, descripcion: 'De 20 a 50 Millones' },
  { valor: 4, descripcion: 'De 50 a 100 Millones' },
  { valor: 5, descripcion: 'Más de 100 Millones' },
];

const TasasPlazos: React.FC = () => {
    const [, setSelectedTasa] = useState<TasaPlazo | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasas, setTasas] = useState<TasaPlazo[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCopiarDialog, setOpenCopiarDialog] = useState(false);
  const [modo, setModo] = useState<'crear' | 'editar'>('crear');
  
  // Filtros
  const [fecha, setFecha] = useState<Dayjs | null>(dayjs());
  const [tipoMoneda, setTipoMoneda] = useState<number>(1);
  
  // Form
  const [formData, setFormData] = useState({
    tipoTasa: 1,
    diasTramo: 30,
    tasaBase: 0,
    tasaMora: 0,
    tasaMaximaConvencional: 0,
    tasaAuxiliar: 0,
  });

  // Copiar
  const [copiarData, setCopiarData] = useState({
    fechaDestino: dayjs(),
    ajustePorcentual: 0,
  });

  // Resumen
  const [resumen, setResumen] = useState<ResumenTasas | null>(null);

  useEffect(() => {
    if (fecha && tipoMoneda) {
      cargarTasas();
    }
  }, [fecha, tipoMoneda]);

  const cargarTasas = async () => {
    setLoading(true);
    try {
      // Datos de ejemplo
      setTasas([
        {
          fechaVigencia: fecha?.toISOString() || '',
          tipoTasa: 1,
          descripcionTipoTasa: 'Hasta 5 Millones',
          tipoMoneda: tipoMoneda,
          descripcionMoneda: tiposMoneda.find(m => m.valor === tipoMoneda)?.descripcion || '',
          diasTramo: 30,
          tasaBase: 1.5,
          tasaMora: 3.0,
          tasaMaximaConvencional: 2.5,
          tasaAuxiliar: 0.5,
        },
        {
          fechaVigencia: fecha?.toISOString() || '',
          tipoTasa: 1,
          descripcionTipoTasa: 'Hasta 5 Millones',
          tipoMoneda: tipoMoneda,
          descripcionMoneda: tiposMoneda.find(m => m.valor === tipoMoneda)?.descripcion || '',
          diasTramo: 60,
          tasaBase: 1.8,
          tasaMora: 3.2,
          tasaMaximaConvencional: 2.8,
          tasaAuxiliar: 0.6,
        },
        {
          fechaVigencia: fecha?.toISOString() || '',
          tipoTasa: 2,
          descripcionTipoTasa: 'De 5 a 20 Millones',
          tipoMoneda: tipoMoneda,
          descripcionMoneda: tiposMoneda.find(m => m.valor === tipoMoneda)?.descripcion || '',
          diasTramo: 30,
          tasaBase: 1.3,
          tasaMora: 2.8,
          tasaMaximaConvencional: 2.3,
          tasaAuxiliar: 0.4,
        },
      ]);

      setResumen({
        cantidadTramos: 3,
        tasaBasePromedio: 1.53,
        tasaBaseMinima: 1.3,
        tasaBaseMaxima: 1.8,
        tasaMoraPromedio: 3.0,
      });
    } catch (error) {
      console.error('Error cargando tasas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevo = () => {
    setModo('crear');
    setFormData({
      tipoTasa: 1,
      diasTramo: 30,
      tasaBase: 0,
      tasaMora: 0,
      tasaMaximaConvencional: 0,
      tasaAuxiliar: 0,
    });
    setOpenDialog(true);
  };

  const handleEditar = (tasa: TasaPlazo) => {
    setModo('editar');
    setSelectedTasa(tasa);
    setFormData({
      tipoTasa: tasa.tipoTasa,
      diasTramo: tasa.diasTramo,
      tasaBase: tasa.tasaBase,
      tasaMora: tasa.tasaMora,
      tasaMaximaConvencional: tasa.tasaMaximaConvencional,
      tasaAuxiliar: tasa.tasaAuxiliar,
    });
    setOpenDialog(true);
  };

  const handleGuardar = async () => {
    setLoading(true);
    try {
      console.log('Guardando:', { fecha, tipoMoneda, ...formData });
      setOpenDialog(false);
      await cargarTasas();
    } catch (error) {
      console.error('Error guardando tasa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (tasa: TasaPlazo) => {
    if (!confirm('¿Está seguro de eliminar esta tasa?')) return;
    
    setLoading(true);
    try {
      console.log('Eliminando:', tasa);
      await cargarTasas();
    } catch (error) {
      console.error('Error eliminando tasa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = async () => {
    setLoading(true);
    try {
      console.log('Copiando tasas:', { fechaOrigen: fecha, ...copiarData, tipoMoneda });
      setOpenCopiarDialog(false);
    } catch (error) {
      console.error('Error copiando tasas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/principal'); }}>
            Inicio
          </Link>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/finanzas'); }}>
            Finanzas
          </Link>
          <Typography color="text.primary">Tasas y Plazos</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => navigate('/finanzas')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5">Tasas y Plazos por Tramos</Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<CopyIcon />} 
              onClick={() => setOpenCopiarDialog(true)}
              sx={{ mr: 1 }}
            >
              Copiar Tasas
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevo}>
              Nueva Tasa
            </Button>
          </Box>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="Fecha Vigencia"
                value={fecha}
                onChange={(newValue) => setFecha(newValue)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo Moneda</InputLabel>
                <Select
                  value={tipoMoneda}
                  label="Tipo Moneda"
                  onChange={(e) => setTipoMoneda(Number(e.target.value))}
                >
                  {tiposMoneda.map((m) => (
                    <MenuItem key={m.valor} value={m.valor}>{m.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<RefreshIcon />} onClick={cargarTasas}>
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ backgroundColor: '#e3f2fd' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Tramos</Typography>
                  <Typography variant="h4">{resumen.cantidadTramos}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ backgroundColor: '#e8f5e9' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Tasa Base Promedio</Typography>
                  <Typography variant="h4">{resumen.tasaBasePromedio.toFixed(2)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ backgroundColor: '#fff3e0' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Tasa Base Mínima</Typography>
                  <Typography variant="h4">{resumen.tasaBaseMinima.toFixed(2)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ backgroundColor: '#fce4ec' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Tasa Base Máxima</Typography>
                  <Typography variant="h4">{resumen.tasaBaseMaxima.toFixed(2)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Card sx={{ backgroundColor: '#f3e5f5' }}>
                <CardContent>
                  <Typography variant="body2" color="textSecondary">Tasa Mora Promedio</Typography>
                  <Typography variant="h4">{resumen.tasaMoraPromedio.toFixed(2)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabla de tasas */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell>Rango Montos</TableCell>
                  <TableCell align="center">A Días</TableCell>
                  <TableCell align="right">Tasa Base %</TableCell>
                  <TableCell align="right">Tasa Mora %</TableCell>
                  <TableCell align="right">Tasa Convencional %</TableCell>
                  <TableCell align="right">Tasa Auxiliar %</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasas.map((tasa, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{tasa.descripcionTipoTasa}</TableCell>
                    <TableCell align="center">{tasa.diasTramo}</TableCell>
                    <TableCell align="right">{tasa.tasaBase.toFixed(2)}</TableCell>
                    <TableCell align="right">{tasa.tasaMora.toFixed(2)}</TableCell>
                    <TableCell align="right">{tasa.tasaMaximaConvencional.toFixed(2)}</TableCell>
                    <TableCell align="right">{tasa.tasaAuxiliar.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleEditar(tasa)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={() => handleEliminar(tasa)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {tasas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Alert severity="info" sx={{ m: 2 }}>
                        No hay tasas registradas para esta fecha y moneda
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Dialog Crear/Editar */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {modo === 'crear' ? 'Nueva Tasa' : 'Editar Tasa'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={6}>
                <FormControl fullWidth>
                  <InputLabel>Rango Montos</InputLabel>
                  <Select
                    value={formData.tipoTasa}
                    label="Rango Montos"
                    onChange={(e) => setFormData({ ...formData, tipoTasa: Number(e.target.value) })}
                    disabled={modo === 'editar'}
                  >
                    {tiposRango.map((r) => (
                      <MenuItem key={r.valor} value={r.valor}>{r.descripcion}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="A Días"
                  type="number"
                  value={formData.diasTramo}
                  onChange={(e) => setFormData({ ...formData, diasTramo: parseInt(e.target.value) })}
                  disabled={modo === 'editar'}
                  inputProps={{ min: 1, max: 360 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Tasa Base %"
                  type="number"
                  value={formData.tasaBase}
                  onChange={(e) => setFormData({ ...formData, tasaBase: parseFloat(e.target.value) })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Tasa Mora %"
                  type="number"
                  value={formData.tasaMora}
                  onChange={(e) => setFormData({ ...formData, tasaMora: parseFloat(e.target.value) })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Tasa Convencional %"
                  type="number"
                  value={formData.tasaMaximaConvencional}
                  onChange={(e) => setFormData({ ...formData, tasaMaximaConvencional: parseFloat(e.target.value) })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Tasa Auxiliar %"
                  type="number"
                  value={formData.tasaAuxiliar}
                  onChange={(e) => setFormData({ ...formData, tasaAuxiliar: parseFloat(e.target.value) })}
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleGuardar} disabled={loading}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Copiar Tasas */}
        <Dialog open={openCopiarDialog} onClose={() => setOpenCopiarDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Copiar Tasas</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <Alert severity="info">
                  Las tasas de <strong>{fecha?.format('DD/MM/YYYY')}</strong> para <strong>{tiposMoneda.find(m => m.valor === tipoMoneda)?.descripcion}</strong> serán copiadas a la nueva fecha.
                </Alert>
              </Grid>
              <Grid size={12}>
                <DatePicker
                  label="Fecha Destino"
                  value={copiarData.fechaDestino}
                  onChange={(newValue) => setCopiarData({ ...copiarData, fechaDestino: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Ajuste Porcentual (%)"
                  type="number"
                  value={copiarData.ajustePorcentual}
                  onChange={(e) => setCopiarData({ ...copiarData, ajustePorcentual: parseFloat(e.target.value) })}
                  helperText="Ej: 0.5 para aumentar 0.5% a todas las tasas"
                  inputProps={{ step: 0.1 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCopiarDialog(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleCopiar} disabled={loading}>
              Copiar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default TasasPlazos;
