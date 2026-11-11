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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import {
  organigramaService,
  rutUtils,
} from '../../services/cliente.service';
import type {
  ClienteOrganigramaDto,
  ClienteOrganigramaCreateDto,
} from '../../services/cliente.service';
import { parametroService } from '../../services/parametro.service';
import type { ParametroDto } from '../../services/parametro.service';

interface ClienteOrganigramaProps {
  rutCliente: number;
  readonly?: boolean;
}

const INITIAL_FORM: ClienteOrganigramaCreateDto = {
  nombrePersona: '',
  rutPersona: undefined,
  digitoVerificador: '',
  codigoCargo: undefined,
  atributoFirma: false,
};

const ClienteOrganigrama: React.FC<ClienteOrganigramaProps> = ({ rutCliente, readonly = false }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [organigrama, setOrganigrama] = useState<ClienteOrganigramaDto[]>([]);
  const [cargos, setCargos] = useState<ParametroDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClienteOrganigramaDto | null>(null);
  const [formData, setFormData] = useState<ClienteOrganigramaCreateDto>(INITIAL_FORM);
  const [rutInput, setRutInput] = useState('');

  useEffect(() => {
    loadData();
    loadCargos();
  }, [rutCliente]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await organigramaService.getByCliente(rutCliente);
      setOrganigrama(data);
    } catch (error) {
      enqueueSnackbar('Error al cargar organigrama', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCargos = async () => {
    try {
      const data = await parametroService.getByTabla(20); // TAB_CARGO = 20
      setCargos(data);
    } catch (error) {
      console.error('Error al cargar cargos:', error);
    }
  };

  const handleOpenDialog = (item?: ClienteOrganigramaDto) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        nombrePersona: item.nombrePersona,
        rutPersona: item.rutPersona,
        digitoVerificador: item.digitoVerificador,
        codigoCargo: item.codigoCargo,
        atributoFirma: item.atributoFirma,
      });
      setRutInput(item.rutPersona ? rutUtils.formatear(item.rutPersona, item.digitoVerificador) : '');
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
        rutPersona: parsed.rut,
        digitoVerificador: parsed.dv,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nombrePersona.trim()) {
        enqueueSnackbar('Debe ingresar el nombre', { variant: 'warning' });
        return;
      }

      if (selectedItem) {
        await organigramaService.update(rutCliente, selectedItem.numeroOrganigrama, {
          ...formData,
          estado: 0,
        });
        enqueueSnackbar('Organigrama actualizado', { variant: 'success' });
      } else {
        await organigramaService.create(rutCliente, formData);
        enqueueSnackbar('Organigrama creado', { variant: 'success' });
      }

      handleCloseDialog();
      loadData();
    } catch (error) {
      enqueueSnackbar('Error al guardar', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await organigramaService.delete(rutCliente, selectedItem.numeroOrganigrama);
      enqueueSnackbar('Organigrama eliminado', { variant: 'success' });
      setDeleteDialogOpen(false);
      setSelectedItem(null);
      loadData();
    } catch (error) {
      enqueueSnackbar('Error al eliminar', { variant: 'error' });
    }
  };

  const openDeleteDialog = (item: ClienteOrganigramaDto) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
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
        <Typography variant="h6">Organigrama</Typography>
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
              <TableCell>Nombre</TableCell>
              <TableCell>RUT</TableCell>
              <TableCell>Cargo</TableCell>
              <TableCell align="center">Firma</TableCell>
              {!readonly && <TableCell align="center">Acciones</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {organigrama.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readonly ? 4 : 5} align="center">
                  No hay registros en el organigrama
                </TableCell>
              </TableRow>
            ) : (
              organigrama.map((item) => (
                <TableRow key={item.numeroOrganigrama}>
                  <TableCell>{item.nombrePersona}</TableCell>
                  <TableCell>{item.rutFormateado || '-'}</TableCell>
                  <TableCell>{item.descripcionCargo || '-'}</TableCell>
                  <TableCell align="center">
                    {item.atributoFirma && (
                      <Tooltip title="Tiene atributo de firma">
                        <CheckCircleIcon color="success" fontSize="small" />
                      </Tooltip>
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
        <DialogTitle>{selectedItem ? 'Modificar Organigrama' : 'Nuevo Organigrama'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Nombre"
              value={formData.nombrePersona}
              onChange={(e) => setFormData({ ...formData, nombrePersona: e.target.value })}
              fullWidth
              required
              autoFocus
            />

            <TextField
              label="RUT"
              value={rutInput}
              onChange={(e) => handleRutChange(e.target.value)}
              placeholder="12.345.678-9"
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Cargo</InputLabel>
              <Select
                value={formData.codigoCargo || ''}
                onChange={(e) => setFormData({ ...formData, codigoCargo: e.target.value as number })}
                label="Cargo"
              >
                <MenuItem value="">
                  <em>Seleccione...</em>
                </MenuItem>
                {cargos.map((cargo) => (
                  <MenuItem key={cargo.codigoElemento} value={cargo.codigoElemento}>
                    {cargo.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.atributoFirma}
                  onChange={(e) => setFormData({ ...formData, atributoFirma: e.target.checked })}
                />
              }
              label="Tiene atributo de firma"
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
            ¿Está seguro que desea eliminar a <strong>{selectedItem?.nombrePersona}</strong> del organigrama?
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

export default ClienteOrganigrama;
