import dayjs from 'dayjs';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Draw as FirmaIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { legalService, FirmaDto, FiltroFirmasDto, CreateFirmaDto, updateFirmaDto } from '../../services/legal.service';

const Firmas: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [firmas, setFirmas] = useState<FirmaDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtros
  const [filtro, setFiltro] = useState<FiltroFirmasDto>({
    soloActivas: true
  });
  
  // Diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedFirma, setSelectedFirma] = useState<FirmaDto | null>(null);
  const [formData, setFormData] = useState<CreateFirmaDto>({
    rutCliente: 0,
    rutFirmante: 0,
    nombreFirmante: '',
    cargo: '',
    telefono: '',
    email: '',
    fechaVigenciaDesde: new Date().toISOString(),
    fechaVigenciaHasta: undefined,
    observaciones: ''
  });

  const loadFirmas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await legalService.consultarFirmas(filtro);
      setFirmas(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar firmas');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    loadFirmas();
  }, [loadFirmas]);

  const handleFilterChange = (field: keyof FiltroFirmasDto, value: any) => {
    setFiltro(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFiltro({ soloActivas: true });
  };

  const handleOpenCreate = () => {
    setDialogMode('create');
    setSelectedFirma(null);
    setFormData({
      rutCliente: 0,
      rutFirmante: 0,
      nombreFirmante: '',
      cargo: '',
      telefono: '',
      email: '',
      fechaVigenciaDesde: new Date().toISOString(),
      fechaVigenciaHasta: undefined,
      observaciones: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (firma: FirmaDto) => {
    setDialogMode('edit');
    setSelectedFirma(firma);
    setFormData({
      rutCliente: firma.rutCliente,
      rutFirmante: firma.rutFirmante,
      nombreFirmante: firma.nombreFirmante,
      cargo: firma.cargo,
      telefono: firma.telefono,
      email: firma.email,
      fechaVigenciaDesde: firma.fechaVigenciaDesde,
      fechaVigenciaHasta: firma.fechaVigenciaHasta,
      observaciones: firma.observaciones
    });
    setOpenDialog(true);
  };

  const handleOpenView = (firma: FirmaDto) => {
    setDialogMode('view');
    setSelectedFirma(firma);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFirma(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (dialogMode === 'create') {
        await legalService.createFirma(formData);
      } else if (dialogMode === 'edit' && selectedFirma) {
        await legalService.updateFirma(selectedFirma.id, formData as updateFirmaDto);
      }
      handleCloseDialog();
      loadFirmas();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiva = async (firma: FirmaDto) => {
    try {
      await legalService.activarDesactivarFirma(firma.id, !firma.activa);
      loadFirmas();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de desactivar esta firma?')) return;
    try {
      await legalService.deleteFirma(id);
      loadFirmas();
    } catch (err: any) {
      setError(err.message || 'Error al desactivar');
    }
  };

  const formatDayjs = (DayjsStr?: string) => {
    if (!DayjsStr) return '-';
    return new Date(DayjsStr).toLocaleDateString('es-CL');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Gestión de Firmas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Administración de firmas autorizadas por cliente - Migrado de F_LE1300/F_LE1600.frm
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ bgcolor: 'warning.main' }}
          >
            Nueva Firma
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Cliente"
                type="number"
                value={filtro.rutCliente || ''}
                onChange={(e) => handleFilterChange('rutCliente', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Firmante"
                type="number"
                value={filtro.rutFirmante || ''}
                onChange={(e) => handleFilterChange('rutFirmante', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Vigencia desde"
                value={filtro.fechaVigenciaDesde ? dayjs(filtro.fechaVigenciaDesde) : null}
                onChange={(Dayjs) => handleFilterChange('fechaVigenciaDesde', Dayjs?.toISOString())}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Vigencia hasta"
                value={filtro.fechaVigenciaHasta ? dayjs(filtro.fechaVigenciaHasta) : null}
                onChange={(Dayjs) => handleFilterChange('fechaVigenciaHasta', Dayjs?.toISOString())}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filtro.soloActivas || false}
                    onChange={(e) => handleFilterChange('soloActivas', e.target.checked)}
                  />
                }
                label="Solo activas"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={loadFirmas}
                >
                  Buscar
                </Button>
                <IconButton onClick={handleClearFilters}>
                  <ClearIcon />
                </IconButton>
                <IconButton onClick={loadFirmas}>
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de resultados */}
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <TableCell><strong>RUT Cliente</strong></TableCell>
                  <TableCell><strong>Nombre Cliente</strong></TableCell>
                  <TableCell><strong>RUT Firmante</strong></TableCell>
                  <TableCell><strong>Nombre Firmante</strong></TableCell>
                  <TableCell><strong>Cargo</strong></TableCell>
                  <TableCell><strong>Vigencia Desde</strong></TableCell>
                  <TableCell><strong>Vigencia Hasta</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {firmas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography color="text.secondary" py={3}>
                        {loading ? 'Cargando...' : 'No se encontraron firmas'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  firmas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((firma) => (
                      <TableRow key={firma.id} hover>
                        <TableCell>{firma.rutCliente}</TableCell>
                        <TableCell>{firma.nombreCliente}</TableCell>
                        <TableCell>{firma.rutFirmante}</TableCell>
                        <TableCell>{firma.nombreFirmante}</TableCell>
                        <TableCell>{firma.cargo}</TableCell>
                        <TableCell>{formatDayjs(firma.fechaVigenciaDesde)}</TableCell>
                        <TableCell>{formatDayjs(firma.fechaVigenciaHasta)}</TableCell>
                        <TableCell align="center">
                          {firma.activa ? (
                            firma.estaVigente ? (
                              <Chip label="Vigente" size="small" color="success" icon={<CheckIcon />} />
                            ) : (
                              <Chip label="Vencida" size="small" color="warning" />
                            )
                          ) : (
                            <Chip label="Inactiva" size="small" color="default" icon={<CancelIcon />} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => handleOpenView(firma)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenEdit(firma)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={firma.activa ? 'Desactivar' : 'Activar'}>
                            <IconButton 
                              size="small" 
                              color={firma.activa ? 'default' : 'success'}
                              onClick={() => handleToggleActiva(firma)}
                            >
                              {firma.activa ? <CancelIcon /> : <CheckIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(firma.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={firmas.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            labelRowsPerPage="Filas por página"
          />
        </Paper>

        {/* Diálogo de crear/editar/ver */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <FirmaIcon sx={{ color: 'warning.main' }} />
              {dialogMode === 'create' ? 'Nueva Firma' : 
               dialogMode === 'edit' ? 'Editar Firma' : 'Detalle de Firma'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Datos del Cliente
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="RUT Cliente"
                  type="number"
                  value={dialogMode === 'view' ? selectedFirma?.rutCliente : formData.rutCliente}
                  onChange={(e) => setFormData({...formData, rutCliente: parseInt(e.target.value)})}
                  disabled={dialogMode === 'view' || dialogMode === 'edit'}
                  required
                />
              </Grid>
              {dialogMode === 'view' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Nombre Cliente"
                    value={selectedFirma?.nombreCliente || ''}
                    disabled
                  />
                </Grid>
              )}
              
              <Grid size={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Datos del Firmante
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="RUT Firmante"
                  type="number"
                  value={dialogMode === 'view' ? selectedFirma?.rutFirmante : formData.rutFirmante}
                  onChange={(e) => setFormData({...formData, rutFirmante: parseInt(e.target.value)})}
                  disabled={dialogMode === 'view' || dialogMode === 'edit'}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre Firmante"
                  value={dialogMode === 'view' ? selectedFirma?.nombreFirmante : formData.nombreFirmante}
                  onChange={(e) => setFormData({...formData, nombreFirmante: e.target.value})}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Cargo"
                  value={dialogMode === 'view' ? selectedFirma?.cargo : formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={dialogMode === 'view' ? selectedFirma?.telefono : formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={dialogMode === 'view' ? selectedFirma?.email : formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              
              <Grid size={12}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                  Vigencia
                </Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Vigencia Desde"
                  value={dialogMode === 'view' 
                    ? (selectedFirma?.fechaVigenciaDesde ? dayjs(selectedFirma.fechaVigenciaDesde) : null)
                    : dayjs(formData.fechaVigenciaDesde)}
                  onChange={(Dayjs) => setFormData({...formData, fechaVigenciaDesde: Dayjs?.toISOString() || ''})}
                  disabled={dialogMode === 'view'}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Vigencia Hasta"
                  value={dialogMode === 'view' 
                    ? (selectedFirma?.fechaVigenciaHasta ? dayjs(selectedFirma.fechaVigenciaHasta) : null)
                    : (formData.fechaVigenciaHasta ? dayjs(formData.fechaVigenciaHasta) : null)}
                  onChange={(Dayjs) => setFormData({...formData, fechaVigenciaHasta: Dayjs?.toISOString()})}
                  disabled={dialogMode === 'view'}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  multiline
                  rows={2}
                  value={dialogMode === 'view' ? selectedFirma?.observaciones : formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>
              {dialogMode === 'view' ? 'Cerrar' : 'Cancelar'}
            </Button>
            {dialogMode !== 'view' && (
              <Button variant="contained" sx={{ bgcolor: 'warning.main' }} onClick={handleSave} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Firmas;
