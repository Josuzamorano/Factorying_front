import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
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
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { movimientoService } from '../../services/tesoreria.service';
import type { MovimientoDto, MovimientoCreateDto, MovimientoupdateDto, ResumenMovimientosDto } from '../../services/tesoreria.service';
import { clienteService } from '../../services/cliente.service';
import type { ClienteListDto } from '../../services/cliente.service';
import { bancoService } from '../../services/banco.service';
import type { Banco } from '../../services/banco.service';

interface FormData {
  movFecMov: Dayjs | null;
  movTipMov: string;
  movRutCli: string;
  movNumOpe: number;
  movNumGir: number;
  movMonMov: number;
  movGlsMov: string;
  movCodBco: string;
  movCtaBco: string;
}

const tiposMovimiento = [
  { value: 'I', label: 'Ingreso' },
  { value: 'E', label: 'Egreso' },
  { value: 'T', label: 'Transferencia' },
  { value: 'D', label: 'Depósito' },
  { value: 'R', label: 'Retiro' },
];

const initialFormData: FormData = {
  movFecMov: dayjs(),
  movTipMov: 'I',
  movRutCli: '',
  movNumOpe: 0,
  movNumGir: 0,
  movMonMov: 0,
  movGlsMov: '',
  movCodBco: '',
  movCtaBco: '',
};

const Movimientos: React.FC = () => {
  const [movimientos, setMovimientos] = useState<MovimientoDto[]>([]);
  const [clientes, setClientes] = useState<ClienteListDto[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<MovimientoDto | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fechaFiltroDesde, setFechaFiltroDesde] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [fechaFiltroHasta, setFechaFiltroHasta] = useState<Dayjs | null>(dayjs());
  const [resumen, setResumen] = useState<ResumenMovimientosDto | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (fechaFiltroDesde && fechaFiltroHasta) {
      loadMovimientos();
      loadResumen();
    }
  }, [fechaFiltroDesde, fechaFiltroHasta]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clientesData, bancosData] = await Promise.all([
        clienteService.getAll(),
        bancoService.getAll(),
      ]);
      setClientes(clientesData);
      setBancos(bancosData);
      await loadMovimientos();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos iniciales';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const fechaDesde = fechaFiltroDesde?.format('YYYY-MM-DD') || dayjs().startOf('month').format('YYYY-MM-DD');
      const fechaHasta = fechaFiltroHasta?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD');
      const data = await movimientoService.getPizarra(fechaDesde, fechaHasta);
      setMovimientos(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar movimientos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadResumen = async () => {
    try {
      const fecha = fechaFiltroHasta?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD');
      const data = await movimientoService.getResumen(fecha);
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    }
  };

  const handleOpenDialog = (movimiento?: MovimientoDto) => {
    if (movimiento) {
      setSelectedMovimiento(movimiento);
      setFormData({
        movFecMov: dayjs(movimiento.movFecMov),
        movTipMov: movimiento.movTipMov,
        movRutCli: movimiento.movRutCli,
        movNumOpe: movimiento.movNumOpe,
        movNumGir: movimiento.movNumGir,
        movMonMov: movimiento.movMonMov,
        movGlsMov: movimiento.movGlsMov,
        movCodBco: movimiento.movCodBco,
        movCtaBco: movimiento.movCtaBco,
      });
    } else {
      setSelectedMovimiento(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMovimiento(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const valiDayjsForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.movFecMov) errors.movFecMov = 'La fecha es requerida';
    if (!formData.movTipMov) errors.movTipMov = 'El tipo es requerido';
    if (!formData.movRutCli) errors.movRutCli = 'El cliente es requerido';
    if (formData.movMonMov <= 0) errors.movMonMov = 'El monto debe ser mayor a 0';
    if (!formData.movCodBco) errors.movCodBco = 'El banco es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!valiDayjsForm()) return;

    try {
      setLoading(true);
      if (selectedMovimiento) {
        const UpdateData: MovimientoupdateDto = {
          movFecMov: formData.movFecMov?.format('YYYY-MM-DD') || '',
          movTipMov: formData.movTipMov,
          movRutCli: formData.movRutCli,
          movNumOpe: formData.movNumOpe,
          movNumGir: formData.movNumGir,
          movMonMov: formData.movMonMov,
          movGlsMov: formData.movGlsMov,
          movCodBco: formData.movCodBco,
          movCtaBco: formData.movCtaBco,
          movUsrMod: 'ADMIN',
        };
        await movimientoService.update(selectedMovimiento.movNumMov, UpdateData);
        setSuccess('Movimiento actualizado exitosamente');
      } else {
        const createData: MovimientoCreateDto = {
          movFecMov: formData.movFecMov?.format('YYYY-MM-DD') || '',
          movTipMov: formData.movTipMov,
          movRutCli: formData.movRutCli,
          movNumOpe: formData.movNumOpe,
          movNumGir: formData.movNumGir,
          movMonMov: formData.movMonMov,
          movGlsMov: formData.movGlsMov,
          movCodBco: formData.movCodBco,
          movCtaBco: formData.movCtaBco,
          movUsrCre: 'ADMIN',
        };
        await movimientoService.create(createData);
        setSuccess('Movimiento creado exitosamente');
      }
      handleCloseDialog();
      await loadMovimientos();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar movimiento';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMovimiento) return;
    try {
      setLoading(true);
      await movimientoService.delete(selectedMovimiento.movNumMov);
      setSuccess('Movimiento eliminado exitosamente');
      setOpenDeleteDialog(false);
      setSelectedMovimiento(null);
      await loadMovimientos();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar movimiento';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmation = (movimiento: MovimientoDto) => {
    setSelectedMovimiento(movimiento);
    setOpenDeleteDialog(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const getTipoChip = (tipo: string) => {
    switch (tipo) {
      case 'I':
        return <Chip label="Ingreso" color="success" size="small" icon={<TrendingUpIcon />} />;
      case 'E':
        return <Chip label="Egreso" color="error" size="small" icon={<TrendingDownIcon />} />;
      case 'T':
        return <Chip label="Transferencia" color="info" size="small" />;
      case 'D':
        return <Chip label="Depósito" color="primary" size="small" />;
      case 'R':
        return <Chip label="Retiro" color="warning" size="small" />;
      default:
        return <Chip label={tipo} size="small" />;
    }
  };

  const getEstadoChip = (estado: number) => {
    switch (estado) {
      case 1:
        return <Chip label="Activo" color="success" size="small" />;
      case 2:
        return <Chip label="Procesado" color="info" size="small" />;
      case 3:
        return <Chip label="Anulado" color="error" size="small" />;
      default:
        return <Chip label="Desconocido" size="small" />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceIcon fontSize="large" color="primary" />
          Pizarra de Movimientos
        </Typography>

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

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Movimientos
                  </Typography>
                  <Typography variant="h5">{resumen.cantidadMovimientos}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography color="white" gutterBottom>
                    Total Ingresos
                  </Typography>
                  <Typography variant="h5" color="white">
                    {formatCurrency(resumen.totalIngresos)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography color="white" gutterBottom>
                    Total Egresos
                  </Typography>
                  <Typography variant="h5" color="white">
                    {formatCurrency(resumen.totalEgresos)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: resumen.saldoNeto >= 0 ? 'info.light' : 'warning.light' }}>
                <CardContent>
                  <Typography color="white" gutterBottom>
                    Saldo Neto
                  </Typography>
                  <Typography variant="h5" color="white">
                    {formatCurrency(resumen.saldoNeto)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filtros y acciones */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <DatePicker
                label="Fecha Desde"
                value={fechaFiltroDesde}
                onChange={(newValue) => setFechaFiltroDesde(newValue as Dayjs | null)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <DatePicker
                label="Fecha Hasta"
                value={fechaFiltroHasta}
                onChange={(newValue) => setFechaFiltroHasta(newValue as Dayjs | null)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadMovimientos}
                >
                  Actualizar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Nuevo Movimiento
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de movimientos */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Mov</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Banco</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Glosa</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay movimientos para el período seleccionado
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientos.map((mov) => (
                    <TableRow key={mov.movNumMov} hover>
                      <TableCell>{mov.movNumMov}</TableCell>
                      <TableCell>{dayjs(mov.movFecMov).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{getTipoChip(mov.movTipMov)}</TableCell>
                      <TableCell>
                        <Tooltip title={mov.movRutCli}>
                          <span>{mov.nombreCliente || mov.movRutCli}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{mov.nombreBanco || mov.movCodBco}</TableCell>
                      <TableCell align="right" sx={{ 
                        color: mov.movTipMov === 'I' || mov.movTipMov === 'D' ? 'success.main' : 'error.main',
                        fontWeight: 'bold'
                      }}>
                        {formatCurrency(mov.movMonMov)}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={mov.movGlsMov}>
                          <span>{mov.movGlsMov.substring(0, 30)}...</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{getEstadoChip(mov.movEstMov)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(mov)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => openDeleteConfirmation(mov)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Dialog Crear/Editar */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedMovimiento ? 'Editar Movimiento' : 'Nuevo Movimiento'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha"
                  value={formData.movFecMov}
                  onChange={(newValue) => setFormData({ ...formData, movFecMov: newValue as Dayjs | null })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.movFecMov,
                      helperText: formErrors.movFecMov,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!formErrors.movTipMov}>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={formData.movTipMov}
                    label="Tipo"
                    onChange={(e) => setFormData({ ...formData, movTipMov: e.target.value })}
                  >
                    {tiposMovimiento.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!formErrors.movRutCli}>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formData.movRutCli}
                    label="Cliente"
                    onChange={(e) => setFormData({ ...formData, movRutCli: e.target.value })}
                  >
                    {clientes.map((cliente) => (
                      <MenuItem key={cliente.rutFormateado} value={cliente.rutFormateado}>
                        {cliente.nombreCompleto} ({cliente.rutFormateado})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!formErrors.movCodBco}>
                  <InputLabel>Banco</InputLabel>
                  <Select
                    value={formData.movCodBco}
                    label="Banco"
                    onChange={(e) => setFormData({ ...formData, movCodBco: e.target.value })}
                  >
                    {bancos.map((banco) => (
                      <MenuItem key={banco.codigoBanco} value={banco.codigoBanco}>
                        {banco.nombreBanco}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Monto"
                  type="number"
                  fullWidth
                  value={formData.movMonMov}
                  onChange={(e) => setFormData({ ...formData, movMonMov: Number(e.target.value) })}
                  error={!!formErrors.movMonMov}
                  helperText={formErrors.movMonMov}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Cuenta Banco"
                  fullWidth
                  value={formData.movCtaBco}
                  onChange={(e) => setFormData({ ...formData, movCtaBco: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="N° Operación"
                  type="number"
                  fullWidth
                  value={formData.movNumOpe}
                  onChange={(e) => setFormData({ ...formData, movNumOpe: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="N° Giro"
                  type="number"
                  fullWidth
                  value={formData.movNumGir}
                  onChange={(e) => setFormData({ ...formData, movNumGir: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Glosa"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.movGlsMov}
                  onChange={(e) => setFormData({ ...formData, movGlsMov: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Eliminar */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            ¿Está seguro que desea eliminar el movimiento N° {selectedMovimiento?.movNumMov}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Movimientos;
