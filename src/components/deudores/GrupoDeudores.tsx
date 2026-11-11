// =============================================
// GrupoDeudores.tsx
// Component for managing Grupos de Deudores
// Migrated from F_CD1300.frm
// =============================================

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Tooltip,
  InputAdornment,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  type GrupoDeudorDto,
  type DeudorGrupoDto,
  type CupoGrupoDto,
  grupoDeudorService,
  deudorGrupoService,
  formatRutGrupo,
  formatMoney,
} from '../../services/grupoDeudor.service';

const GrupoDeudores: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State
  const [grupos, setGrupos] = useState<GrupoDeudorDto[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoDeudorDto | null>(null);
  const [deudoresGrupo, setDeudoresGrupo] = useState<DeudorGrupoDto[]>([]);
  const [cupoGrupo, setCupoGrupo] = useState<CupoGrupoDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [openGrupoDialog, setOpenGrupoDialog] = useState(false);
  const [openDeudorDialog, setOpenDeudorDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [formGrupo, setFormGrupo] = useState<{
    rutGrupo: string;
    razonSocial: string;
    montoLineaAprobada: string;
    fechaVencimiento: Dayjs | null;
  }>({
    rutGrupo: '',
    razonSocial: '',
    montoLineaAprobada: '',
    fechaVencimiento: null,
  });
  
  const [formDeudor, setFormDeudor] = useState({
    rutDeudor: '',
  });

  // Load grupos
  const loadGrupos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await grupoDeudorService.getAll();
      setGrupos(data);
    } catch (error) {
      console.error('Error loading grupos:', error);
      enqueueSnackbar('Error al cargar grupos de deudores', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Load deudores of selected grupo
  const loadDeudoresGrupo = useCallback(async (rutGrupo: number) => {
    try {
      const [deudores, cupo] = await Promise.all([
        deudorGrupoService.getByGrupo(rutGrupo),
        grupoDeudorService.getCupo(rutGrupo),
      ]);
      setDeudoresGrupo(deudores);
      setCupoGrupo(cupo);
    } catch (error) {
      console.error('Error loading deudores:', error);
      enqueueSnackbar('Error al cargar deudores del grupo', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Initial load
  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  // Load deudores when grupo is selected
  useEffect(() => {
    if (selectedGrupo) {
      loadDeudoresGrupo(selectedGrupo.rutGrupo);
    } else {
      setDeudoresGrupo([]);
      setCupoGrupo(null);
    }
  }, [selectedGrupo, loadDeudoresGrupo]);

  // Search grupos
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadGrupos();
      return;
    }
    
    setLoading(true);
    try {
      const data = await grupoDeudorService.search(searchTerm);
      setGrupos(data);
    } catch (error) {
      console.error('Error searching:', error);
      enqueueSnackbar('Error en la búsqueda', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for new grupo
  const handleNewGrupo = () => {
    setFormGrupo({
      rutGrupo: '',
      razonSocial: '',
      montoLineaAprobada: '',
      fechaVencimiento: null,
    });
    setIsEditing(false);
    setOpenGrupoDialog(true);
  };

  // Open dialog for edit grupo
  const handleEditGrupo = (grupo: GrupoDeudorDto) => {
    setFormGrupo({
      rutGrupo: grupo.rutGrupo.toString(),
      razonSocial: grupo.razonSocial,
      montoLineaAprobada: grupo.montoLineaAprobada.toString(),
      fechaVencimiento: grupo.fechaVencimiento ? dayjs(grupo.fechaVencimiento) : null,
    });
    setIsEditing(true);
    setOpenGrupoDialog(true);
  };

  // Save grupo
  const handleSaveGrupo = async () => {
    try {
      if (isEditing) {
        await grupoDeudorService.update(parseInt(formGrupo.rutGrupo), {
          razonSocial: formGrupo.razonSocial,
          montoLineaAprobada: parseFloat(formGrupo.montoLineaAprobada) || 0,
          fechaVencimiento: formGrupo.fechaVencimiento?.toISOString() ?? null,
        });
        enqueueSnackbar('Grupo actualizado correctamente', { variant: 'success' });
      } else {
        await grupoDeudorService.create({
          rutGrupo: parseInt(formGrupo.rutGrupo),
          razonSocial: formGrupo.razonSocial,
          montoLineaAprobada: parseFloat(formGrupo.montoLineaAprobada) || 0,
          fechaVencimiento: formGrupo.fechaVencimiento?.toISOString() ?? null,
        });
        enqueueSnackbar('Grupo creado correctamente', { variant: 'success' });
      }
      
      setOpenGrupoDialog(false);
      loadGrupos();
    } catch (error: unknown) {
      console.error('Error saving grupo:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      enqueueSnackbar(
        axiosError.response?.data?.message || 'Error al guardar grupo',
        { variant: 'error' }
      );
    }
  };

  // Delete grupo
  const handleDeleteGrupo = async (grupo: GrupoDeudorDto) => {
    if (!window.confirm(`¿Está seguro de eliminar el grupo ${grupo.razonSocial}?`)) {
      return;
    }
    
    try {
      await grupoDeudorService.delete(grupo.rutGrupo);
      enqueueSnackbar('Grupo eliminado correctamente', { variant: 'success' });
      if (selectedGrupo?.rutGrupo === grupo.rutGrupo) {
        setSelectedGrupo(null);
      }
      loadGrupos();
    } catch (error) {
      console.error('Error deleting grupo:', error);
      enqueueSnackbar('Error al eliminar grupo', { variant: 'error' });
    }
  };

  // Add deudor to grupo
  const handleAddDeudor = async () => {
    if (!selectedGrupo) return;
    
    try {
      const rutDeudor = parseInt(formDeudor.rutDeudor);
      if (isNaN(rutDeudor)) {
        enqueueSnackbar('RUT de deudor inválido', { variant: 'error' });
        return;
      }
      
      await deudorGrupoService.add(selectedGrupo.rutGrupo, rutDeudor);
      enqueueSnackbar('Deudor agregado al grupo', { variant: 'success' });
      setOpenDeudorDialog(false);
      setFormDeudor({ rutDeudor: '' });
      loadDeudoresGrupo(selectedGrupo.rutGrupo);
      loadGrupos(); // Refresh count
    } catch (error: unknown) {
      console.error('Error adding deudor:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      enqueueSnackbar(
        axiosError.response?.data?.message || 'Error al agregar deudor',
        { variant: 'error' }
      );
    }
  };

  // Remove deudor from grupo
  const handleRemoveDeudor = async (deudor: DeudorGrupoDto) => {
    if (!window.confirm(`¿Está seguro de eliminar a ${deudor.nombreDeudor} del grupo?`)) {
      return;
    }
    
    try {
      await deudorGrupoService.deleteById(deudor.rutGrupo, deudor.id);
      enqueueSnackbar('Deudor eliminado del grupo', { variant: 'success' });
      loadDeudoresGrupo(deudor.rutGrupo);
      loadGrupos(); // Refresh count
    } catch (error) {
      console.error('Error removing deudor:', error);
      enqueueSnackbar('Error al eliminar deudor del grupo', { variant: 'error' });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GroupIcon /> Grupos de Deudores
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Administración de grupos de deudores con líneas de crédito compartidas
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        <Grid container spacing={3}>
          {/* Panel izquierdo - Lista de grupos */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              {/* Search bar */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Buscar por RUT o razón social..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 1 }}
                />
                <Button variant="contained" onClick={handleSearch}>
                  Buscar
                </Button>
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleNewGrupo}
                >
                  Nuevo Grupo
                </Button>
                <IconButton onClick={loadGrupos} title="Refrescar">
                  <RefreshIcon />
                </IconButton>
              </Box>

              {/* Grupos table */}
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>RUT</TableCell>
                      <TableCell>Razón Social</TableCell>
                      <TableCell align="center">#</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grupos.map((grupo) => (
                      <TableRow
                        key={grupo.rutGrupo}
                        hover
                        selected={selectedGrupo?.rutGrupo === grupo.rutGrupo}
                        onClick={() => setSelectedGrupo(grupo)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          {formatRutGrupo(grupo.rutGrupo, grupo.digitoVerificador)}
                        </TableCell>
                        <TableCell>{grupo.razonSocial}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={grupo.cantidadDeudores}
                            size="small"
                            color={grupo.cantidadDeudores > 0 ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Editar">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGrupo(grupo);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGrupo(grupo);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {grupos.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No hay grupos registrados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Panel derecho - Detalle del grupo */}
          <Grid size={{ xs: 12, md: 7 }}>
            {selectedGrupo ? (
              <Paper sx={{ p: 2 }}>
                {/* Header del grupo */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    {selectedGrupo.razonSocial}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    RUT: {formatRutGrupo(selectedGrupo.rutGrupo, selectedGrupo.digitoVerificador)}
                  </Typography>
                </Box>

                {/* Cupo information */}
                {cupoGrupo && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Línea Aprobada
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {formatMoney(cupoGrupo.montoLinea)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Monto Ocupado
                          </Typography>
                          <Typography variant="h6" color="warning.main">
                            {formatMoney(cupoGrupo.montoOcupado)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            Disponible
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            {formatMoney(cupoGrupo.montoDisponible)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">Utilización:</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(cupoGrupo.porcentajeUtilizacion, 100)}
                          sx={{ flex: 1, height: 10, borderRadius: 5 }}
                          color={cupoGrupo.porcentajeUtilizacion > 80 ? 'error' : 'primary'}
                        />
                        <Typography variant="body2">
                          {cupoGrupo.porcentajeUtilizacion.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Deudores del grupo */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Deudores del Grupo ({deudoresGrupo.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    onClick={() => setOpenDeudorDialog(true)}
                  >
                    Agregar Deudor
                  </Button>
                </Box>

                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>RUT</TableCell>
                        <TableCell>Razón Social</TableCell>
                        <TableCell>Giro</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deudoresGrupo.map((deudor, index) => (
                        <TableRow key={deudor.id} hover>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {formatRutGrupo(deudor.rutDeudor, deudor.digitoVerificador)}
                          </TableCell>
                          <TableCell>{deudor.nombreDeudor}</TableCell>
                          <TableCell>{deudor.giro || '-'}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Quitar del grupo">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveDeudor(deudor)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                      {deudoresGrupo.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No hay deudores en este grupo
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <GroupIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                <Typography variant="h6" color="text.secondary">
                  Seleccione un grupo
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Haga clic en un grupo de la lista para ver sus detalles y deudores
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>

        {/* Dialog for Grupo */}
        <Dialog open={openGrupoDialog} onClose={() => setOpenGrupoDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isEditing ? 'Editar Grupo de Deudores' : 'Nuevo Grupo de Deudores'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="RUT del Grupo"
                  value={formGrupo.rutGrupo}
                  onChange={(e) => setFormGrupo({ ...formGrupo, rutGrupo: e.target.value })}
                  fullWidth
                  required
                  disabled={isEditing}
                  placeholder="Sin puntos ni guión"
                  type="number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Monto Línea Aprobada"
                  value={formGrupo.montoLineaAprobada}
                  onChange={(e) => setFormGrupo({ ...formGrupo, montoLineaAprobada: e.target.value })}
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Razón Social"
                  value={formGrupo.razonSocial}
                  onChange={(e) => setFormGrupo({ ...formGrupo, razonSocial: e.target.value.toUpperCase() })}
                  fullWidth
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha Vencimiento"
                  value={formGrupo.fechaVencimiento}
                  onChange={(newValue) => setFormGrupo({ ...formGrupo, fechaVencimiento: newValue as Dayjs | null })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenGrupoDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleSaveGrupo}
              disabled={!formGrupo.rutGrupo || !formGrupo.razonSocial}
            >
              {isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog for adding Deudor */}
        <Dialog open={openDeudorDialog} onClose={() => setOpenDeudorDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Agregar Deudor al Grupo</DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
              Ingrese el RUT del deudor que desea agregar al grupo <strong>{selectedGrupo?.razonSocial}</strong>
            </Alert>
            <TextField
              label="RUT del Deudor"
              value={formDeudor.rutDeudor}
              onChange={(e) => setFormDeudor({ rutDeudor: e.target.value })}
              fullWidth
              required
              placeholder="Sin puntos ni guión"
              type="number"
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeudorDialog(false)}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleAddDeudor}
              disabled={!formDeudor.rutDeudor}
            >
              Agregar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default GrupoDeudores;
