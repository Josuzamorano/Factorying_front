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
  Check as CheckIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { giroService } from '../../services/tesoreria.service';
import type { GiroDto, GiroCreateDto, GiroupdateDto, ResumenGirosDto } from '../../services/tesoreria.service';
import { clienteService } from '../../services/cliente.service';
import type { ClienteListDto } from '../../services/cliente.service';
import { bancoService } from '../../services/banco.service';
import type { Banco } from '../../services/banco.service';

interface FormData {
  girRutCli: string;
  girNumOpe: number;
  girTipGir: number;
  girFecGir: Dayjs | null;
  girMonGir: number;
  girCtaCte: string;
  girCodBco: string;
  girBenGir: string;
  girForCan: string;
}

const tiposGiro = [
  { value: 1, label: 'Adelanto' },
  { value: 2, label: 'Otorgamiento' },
  { value: 3, label: 'Otorgamiento 2' },
];

const formasCancelacion = [
  { value: 'CHE', label: 'Cheque' },
  { value: 'TRF', label: 'Transferencia' },
  { value: 'DEP', label: 'Depósito' },
  { value: 'EFE', label: 'Efectivo' },
];

const initialFormData: FormData = {
  girRutCli: '',
  girNumOpe: 0,
  girTipGir: 1,
  girFecGir: dayjs(),
  girMonGir: 0,
  girCtaCte: '',
  girCodBco: '',
  girBenGir: '',
  girForCan: 'TRF',
};

const Giros: React.FC = () => {
  const [giros, setGiros] = useState<GiroDto[]>([]);
  const [clientes, setClientes] = useState<ClienteListDto[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEmitirDialog, setOpenEmitirDialog] = useState(false);
  const [openAnularDialog, setOpenAnularDialog] = useState(false);
  const [selectedGiro, setSelectedGiro] = useState<GiroDto | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [fechaFiltroDesde, setFechaFiltroDesde] = useState<Dayjs | null>(dayjs().startOf('month'));
  const [fechaFiltroHasta, setFechaFiltroHasta] = useState<Dayjs | null>(dayjs());
  const [resumen, setResumen] = useState<ResumenGirosDto | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (fechaFiltroDesde && fechaFiltroHasta) {
      loadGiros();
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
      await loadGiros();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar datos iniciales';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadGiros = async () => {
    try {
      setLoading(true);
      const fechaDesde = fechaFiltroDesde?.format('YYYY-MM-DD') || dayjs().startOf('month').format('YYYY-MM-DD');
      const fechaHasta = fechaFiltroHasta?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD');
      const data = await giroService.getByFecha(fechaDesde, fechaHasta);
      setGiros(data);
      setError(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar giros';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadResumen = async () => {
    try {
      const fecha = fechaFiltroHasta?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD');
      const data = await giroService.getResumen(fecha);
      setResumen(data);
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    }
  };

  const handleOpenDialog = (giro?: GiroDto) => {
    if (giro) {
      setSelectedGiro(giro);
      setFormData({
        girRutCli: giro.girRutCli,
        girNumOpe: giro.girNumOpe,
        girTipGir: giro.girTipGir,
        girFecGir: dayjs(giro.girFecGir),
        girMonGir: giro.girMonGir,
        girCtaCte: giro.girCtaCte,
        girCodBco: giro.girCodBco,
        girBenGir: giro.girBenGir,
        girForCan: giro.girForCan,
      });
    } else {
      setSelectedGiro(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGiro(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const valiDayjsForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.girRutCli) errors.girRutCli = 'El cliente es requerido';
    if (!formData.girFecGir) errors.girFecGir = 'La fecha es requerida';
    if (formData.girMonGir <= 0) errors.girMonGir = 'El monto debe ser mayor a 0';
    if (!formData.girCodBco) errors.girCodBco = 'El banco es requerido';
    if (!formData.girBenGir) errors.girBenGir = 'El beneficiario es requerido';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!valiDayjsForm()) return;

    try {
      setLoading(true);
      if (selectedGiro) {
        const UpdateData: GiroupdateDto = {
          girRutCli: formData.girRutCli,
          girNumOpe: formData.girNumOpe,
          girTipGir: formData.girTipGir,
          girFecGir: formData.girFecGir?.format('YYYY-MM-DD') || '',
          girMonGir: formData.girMonGir,
          girCtaCte: formData.girCtaCte,
          girCodBco: formData.girCodBco,
          girBenGir: formData.girBenGir,
          girForCan: formData.girForCan,
          girUsrMod: 'ADMIN',
        };
        await giroService.update(selectedGiro.girNumGir, UpdateData);
        setSuccess('Giro actualizado exitosamente');
      } else {
        const createData: GiroCreateDto = {
          girRutCli: formData.girRutCli,
          girNumOpe: formData.girNumOpe,
          girTipGir: formData.girTipGir,
          girFecGir: formData.girFecGir?.format('YYYY-MM-DD') || '',
          girMonGir: formData.girMonGir,
          girCtaCte: formData.girCtaCte,
          girCodBco: formData.girCodBco,
          girBenGir: formData.girBenGir,
          girForCan: formData.girForCan,
          girUsrCre: 'ADMIN',
        };
        await giroService.create(createData);
        setSuccess('Giro creado exitosamente');
      }
      handleCloseDialog();
      await loadGiros();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar giro';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmitir = async () => {
    if (!selectedGiro) return;
    try {
      setLoading(true);
      await giroService.emitir(selectedGiro.girNumGir, 'ADMIN');
      setSuccess('Giro emitido exitosamente');
      setOpenEmitirDialog(false);
      setSelectedGiro(null);
      await loadGiros();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al emitir giro';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnular = async () => {
    if (!selectedGiro) return;
    try {
      setLoading(true);
      await giroService.anular(selectedGiro.girNumGir, 'ADMIN');
      setSuccess('Giro anulado exitosamente');
      setOpenAnularDialog(false);
      setSelectedGiro(null);
      await loadGiros();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al anular giro';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGiro) return;
    try {
      setLoading(true);
      await giroService.delete(selectedGiro.girNumGir);
      setSuccess('Giro eliminado exitosamente');
      setOpenDeleteDialog(false);
      setSelectedGiro(null);
      await loadGiros();
      await loadResumen();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar giro';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const getTipoChip = (tipo: number) => {
    switch (tipo) {
      case 1:
        return <Chip label="Adelanto" color="warning" size="small" />;
      case 2:
        return <Chip label="Otorgamiento" color="primary" size="small" />;
      case 3:
        return <Chip label="Otorgamiento 2" color="secondary" size="small" />;
      default:
        return <Chip label="Desconocido" size="small" />;
    }
  };

  const getEstadoChip = (estado: number) => {
    switch (estado) {
      case 1:
        return <Chip label="Digitado" color="default" size="small" />;
      case 2:
        return <Chip label="Emitido" color="success" size="small" icon={<CheckIcon />} />;
      case 3:
        return <Chip label="Anulado" color="error" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label="Desconocido" size="small" />;
    }
  };

  const canEdit = (giro: GiroDto) => giro.girEstGir === 1;
  const canEmitir = (giro: GiroDto) => giro.girEstGir === 1;
  const canAnular = (giro: GiroDto) => giro.girEstGir === 2;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon fontSize="large" color="primary" />
          Giros
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
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    Total Giros
                  </Typography>
                  <Typography variant="h5">{resumen.cantidadGiros}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'primary.light' }}>
                <CardContent>
                  <Typography color="white" gutterBottom variant="caption">
                    Monto Total
                  </Typography>
                  <Typography variant="h6" color="white">
                    {formatCurrency(resumen.montoTotal)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'warning.light' }}>
                <CardContent>
                  <Typography color="white" gutterBottom variant="caption">
                    Adelantos
                  </Typography>
                  <Typography variant="h6" color="white">
                    {formatCurrency(resumen.montoAdelanto)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom variant="caption">
                    Digitados
                  </Typography>
                  <Typography variant="h5">{resumen.girosDigitados}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'success.light' }}>
                <CardContent>
                  <Typography color="white" gutterBottom variant="caption">
                    Emitidos
                  </Typography>
                  <Typography variant="h5" color="white">
                    {resumen.girosEmitidos}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Card sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography color="white" gutterBottom variant="caption">
                    Anulados
                  </Typography>
                  <Typography variant="h5" color="white">
                    {resumen.girosAnulados}
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
                  onClick={loadGiros}
                >
                  Actualizar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Nuevo Giro
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de giros */}
        <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Giro</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Beneficiario</TableCell>
                  <TableCell>Banco</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {giros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay giros para el período seleccionado
                    </TableCell>
                  </TableRow>
                ) : (
                  giros.map((giro) => (
                    <TableRow key={giro.girNumGir} hover>
                      <TableCell>{giro.girNumGir}</TableCell>
                      <TableCell>{dayjs(giro.girFecGir).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{getTipoChip(giro.girTipGir)}</TableCell>
                      <TableCell>
                        <Tooltip title={giro.girRutCli}>
                          <span>{giro.nombreCliente || giro.girRutCli}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{giro.girBenGir}</TableCell>
                      <TableCell>{giro.nombreBanco || giro.girCodBco}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(giro.girMonGir)}
                      </TableCell>
                      <TableCell>{getEstadoChip(giro.girEstGir)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <span>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenDialog(giro)}
                              size="small"
                              disabled={!canEdit(giro)}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Emitir">
                          <span>
                            <IconButton
                              color="success"
                              onClick={() => {
                                setSelectedGiro(giro);
                                setOpenEmitirDialog(true);
                              }}
                              size="small"
                              disabled={!canEmitir(giro)}
                            >
                              <CheckIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Anular">
                          <span>
                            <IconButton
                              color="warning"
                              onClick={() => {
                                setSelectedGiro(giro);
                                setOpenAnularDialog(true);
                              }}
                              size="small"
                              disabled={!canAnular(giro)}
                            >
                              <CancelIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => {
                                setSelectedGiro(giro);
                                setOpenDeleteDialog(true);
                              }}
                              size="small"
                              disabled={!canEdit(giro)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
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
            {selectedGiro ? 'Editar Giro' : 'Nuevo Giro'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!formErrors.girRutCli}>
                  <InputLabel>Cliente</InputLabel>
                  <Select
                    value={formData.girRutCli}
                    label="Cliente"
                    onChange={(e) => setFormData({ ...formData, girRutCli: e.target.value })}
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
                <DatePicker
                  label="Fecha"
                  value={formData.girFecGir}
                  onChange={(newValue) => setFormData({ ...formData, girFecGir: newValue as Dayjs | null })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.girFecGir,
                      helperText: formErrors.girFecGir,
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Giro</InputLabel>
                  <Select
                    value={formData.girTipGir}
                    label="Tipo de Giro"
                    onChange={(e) => setFormData({ ...formData, girTipGir: Number(e.target.value) })}
                  >
                    {tiposGiro.map((tipo) => (
                      <MenuItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="N° Operación"
                  type="number"
                  fullWidth
                  value={formData.girNumOpe}
                  onChange={(e) => setFormData({ ...formData, girNumOpe: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Monto"
                  type="number"
                  fullWidth
                  value={formData.girMonGir}
                  onChange={(e) => setFormData({ ...formData, girMonGir: Number(e.target.value) })}
                  error={!!formErrors.girMonGir}
                  helperText={formErrors.girMonGir}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!formErrors.girCodBco}>
                  <InputLabel>Banco</InputLabel>
                  <Select
                    value={formData.girCodBco}
                    label="Banco"
                    onChange={(e) => setFormData({ ...formData, girCodBco: e.target.value })}
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
                  label="Cuenta Corriente"
                  fullWidth
                  value={formData.girCtaCte}
                  onChange={(e) => setFormData({ ...formData, girCtaCte: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Forma Cancelación</InputLabel>
                  <Select
                    value={formData.girForCan}
                    label="Forma Cancelación"
                    onChange={(e) => setFormData({ ...formData, girForCan: e.target.value })}
                  >
                    {formasCancelacion.map((forma) => (
                      <MenuItem key={forma.value} value={forma.value}>
                        {forma.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Beneficiario"
                  fullWidth
                  value={formData.girBenGir}
                  onChange={(e) => setFormData({ ...formData, girBenGir: e.target.value })}
                  error={!!formErrors.girBenGir}
                  helperText={formErrors.girBenGir}
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

        {/* Dialog Emitir */}
        <Dialog open={openEmitirDialog} onClose={() => setOpenEmitirDialog(false)}>
          <DialogTitle>Confirmar Emisión</DialogTitle>
          <DialogContent>
            ¿Está seguro que desea emitir el giro N° {selectedGiro?.girNumGir} por {selectedGiro && formatCurrency(selectedGiro.girMonGir)}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEmitirDialog(false)}>Cancelar</Button>
            <Button onClick={handleEmitir} color="success" variant="contained">
              Emitir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Anular */}
        <Dialog open={openAnularDialog} onClose={() => setOpenAnularDialog(false)}>
          <DialogTitle>Confirmar Anulación</DialogTitle>
          <DialogContent>
            ¿Está seguro que desea anular el giro N° {selectedGiro?.girNumGir}?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAnularDialog(false)}>Cancelar</Button>
            <Button onClick={handleAnular} color="warning" variant="contained">
              Anular
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog Eliminar */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirmar Eliminación</DialogTitle>
          <DialogContent>
            ¿Está seguro que desea eliminar el giro N° {selectedGiro?.girNumGir}?
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

export default Giros;
