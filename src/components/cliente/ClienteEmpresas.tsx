import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Chip,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  empresaService,
  rutUtils,
} from '../../services/cliente.service';
import type {
  ClienteEmpresaDto,
  ClienteEmpresaCreateDto,
} from '../../services/cliente.service';

interface ClienteEmpresasProps {
  rutCliente: number;
  readonly?: boolean;
}

const INITIAL_FORM: ClienteEmpresaCreateDto = {
  rutEmpresa: 0,
  digitoVerificador: '',
  razonSocial: '',
  fechaSituacion: new Date().toISOString().split('T')[0],
  montoDeudaDirecta: 0,
  montoDeudaIndirecta: 0,
  situacionDicom: false,
};

const ClienteEmpresas: React.FC<ClienteEmpresasProps> = ({ rutCliente, readonly = false }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<ClienteEmpresaDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClienteEmpresaDto | null>(null);
  const [formData, setFormData] = useState<ClienteEmpresaCreateDto>(INITIAL_FORM);
  const [rutInput, setRutInput] = useState('');

  useEffect(() => {
    loadData();
  }, [rutCliente]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await empresaService.getByCliente(rutCliente);
      setEmpresas(data);
    } catch (error) {
      enqueueSnackbar('Error al cargar empresas relacionadas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (item?: ClienteEmpresaDto) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        rutEmpresa: item.rutEmpresa,
        digitoVerificador: item.digitoVerificador,
        razonSocial: item.razonSocial,
        fechaSituacion: item.fechaSituacion?.split('T')[0],
        montoDeudaDirecta: item.montoDeudaDirecta,
        montoDeudaIndirecta: item.montoDeudaIndirecta,
        situacionDicom: item.situacionDicom,
      });
      setRutInput(rutUtils.formatear(item.rutEmpresa, item.digitoVerificador));
    } else {
      setSelectedItem(null);
      setFormData(INITIAL_FORM);
      setRutInput('');
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setFormData(INITIAL_FORM);
    setRutInput('');
  };

  const handleRutChange = (value: string) => {
    setRutInput(value);
    const parsed = rutUtils.limpiar(value);
    if (parsed) {
      setFormData({
        ...formData,
        rutEmpresa: parsed.rut,
        digitoVerificador: parsed.dv,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.rutEmpresa) {
        enqueueSnackbar('Debe ingresar el RUT de la empresa', { variant: 'warning' });
        return;
      }
      if (!formData.razonSocial.trim()) {
        enqueueSnackbar('Debe ingresar la razón social', { variant: 'warning' });
        return;
      }

      if (selectedItem) {
        await empresaService.update(rutCliente, selectedItem.rutEmpresa, {
          razonSocial: formData.razonSocial,
          fechaSituacion: formData.fechaSituacion,
          montoDeudaDirecta: formData.montoDeudaDirecta,
          montoDeudaIndirecta: formData.montoDeudaIndirecta,
          situacionDicom: formData.situacionDicom,
          estado: 0,
        });
        enqueueSnackbar('Empresa actualizada', { variant: 'success' });
      } else {
        await empresaService.create(rutCliente, formData);
        enqueueSnackbar('Empresa agregada', { variant: 'success' });
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.mensaje || 'Error al guardar', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await empresaService.delete(rutCliente, selectedItem.rutEmpresa);
      enqueueSnackbar('Empresa eliminada', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      enqueueSnackbar('Error al eliminar', { variant: 'error' });
    }
  };

  const openDeleteDialog = (item: ClienteEmpresaDto) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Empresas Relacionadas (SBIF)</Typography>
        {!readonly && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="small"
          >
            Nuevo
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>RUT</TableCell>
              <TableCell>Razón Social</TableCell>
              <TableCell>Datos Al</TableCell>
              <TableCell align="right">Deuda Directa</TableCell>
              <TableCell align="right">Deuda Indirecta</TableCell>
              <TableCell align="center">DICOM</TableCell>
              {!readonly && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {empresas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readonly ? 6 : 7} align="center">
                  No hay empresas relacionadas registradas
                </TableCell>
              </TableRow>
            ) : (
              empresas.map((item) => (
                <TableRow key={item.rutEmpresa}>
                  <TableCell>{item.rutFormateado}</TableCell>
                  <TableCell>{item.razonSocial}</TableCell>
                  <TableCell>
                    {item.fechaSituacion
                      ? new Date(item.fechaSituacion).toLocaleDateString('es-CL')
                      : '-'}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(item.montoDeudaDirecta)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.montoDeudaIndirecta)}</TableCell>
                  <TableCell align="center">
                    {item.situacionDicom ? (
                      <Chip
                        icon={<WarningIcon />}
                        label="Con Deuda"
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="OK"
                        color="success"
                        size="small"
                      />
                    )}
                  </TableCell>
                  {!readonly && (
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => openDeleteDialog(item)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Crear/Editar */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Modificar Empresa Relacionada' : 'Nueva Empresa Relacionada'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="RUT Empresa"
              value={rutInput}
              onChange={(e) => handleRutChange(e.target.value)}
              placeholder="12.345.678-9"
              fullWidth
              required
              disabled={!!selectedItem}
              autoFocus={!selectedItem}
            />

            <TextField
              label="Razón Social"
              value={formData.razonSocial}
              onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Datos Al"
              type="Dayjs"
              value={formData.fechaSituacion || ''}
              onChange={(e) => setFormData({ ...formData, fechaSituacion: e.target.value })}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Situación Financiera Directa"
              type="number"
              value={formData.montoDeudaDirecta}
              onChange={(e) =>
                setFormData({ ...formData, montoDeudaDirecta: parseFloat(e.target.value) || 0 })
              }
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />

            <TextField
              label="Situación Financiera Indirecta"
              type="number"
              value={formData.montoDeudaIndirecta}
              onChange={(e) =>
                setFormData({ ...formData, montoDeudaIndirecta: parseFloat(e.target.value) || 0 })
              }
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.situacionDicom}
                  onChange={(e) => setFormData({ ...formData, situacionDicom: e.target.checked })}
                />
              }
              label="Tiene deuda en DICOM"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedItem ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro que desea eliminar la empresa <strong>{selectedItem?.razonSocial}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClienteEmpresas;
