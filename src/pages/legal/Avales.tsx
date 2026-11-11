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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Person as PersonIcon,
  VerifiedUser as AvalIcon
} from '@mui/icons-material';
import { legalService, AvalDto, FiltroAvalesDto, CreateAvalDto, updateAvalDto } from '../../services/legal.service';

const tiposAval = [
  { value: 1, label: 'Solidario' },
  { value: 2, label: 'Simple' },
  { value: 3, label: 'Hipotecario' },
  { value: 4, label: 'Prendario' }
];

const estadosAval = [
  { value: 1, label: 'Activo', color: 'success' },
  { value: 2, label: 'Vencido', color: 'error' },
  { value: 3, label: 'Suspendido', color: 'warning' },
  { value: 4, label: 'Liberado', color: 'default' }
];

const regimenesMatrimoniales = [
  { value: 1, label: 'Soltero(a)' },
  { value: 2, label: 'Casado(a) Sociedad Conyugal' },
  { value: 3, label: 'Casado(a) Separación de Bienes' },
  { value: 4, label: 'Casado(a) Participación en Gananciales' },
  { value: 5, label: 'Viudo(a)' }
];

const Avales: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [avales, setAvales] = useState<AvalDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtros
  const [filtro, setFiltro] = useState<FiltroAvalesDto>({
    soloActivos: true
  });
  
  // Diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAval, setSelectedAval] = useState<AvalDto | null>(null);
  const [formData, setFormData] = useState<CreateAvalDto>({
    rutCliente: 0,
    rutAval: 0,
    nombreAval: '',
    direccion: '',
    comuna: '',
    telefono: '',
    email: '',
    tipoAval: 1,
    regimenMatrimonial: 1,
    rutConyuge: undefined,
    nombreConyuge: '',
    esSocio: false,
    porcentajeParticipacion: undefined,
    fechaVigenciaDesde: new Date().toISOString(),
    fechaVigenciaHasta: undefined,
    observaciones: ''
  });

  const loadAvales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await legalService.consultarAvales(filtro);
      setAvales(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar avales');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    loadAvales();
  }, [loadAvales]);

  const handleFilterChange = (field: keyof FiltroAvalesDto, value: any) => {
    setFiltro(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFiltro({ soloActivos: true });
  };

  const handleOpenCreate = () => {
    setDialogMode('create');
    setSelectedAval(null);
    setFormData({
      rutCliente: 0,
      rutAval: 0,
      nombreAval: '',
      direccion: '',
      comuna: '',
      telefono: '',
      email: '',
      tipoAval: 1,
      regimenMatrimonial: 1,
      rutConyuge: undefined,
      nombreConyuge: '',
      esSocio: false,
      porcentajeParticipacion: undefined,
      fechaVigenciaDesde: new Date().toISOString(),
      fechaVigenciaHasta: undefined,
      observaciones: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (aval: AvalDto) => {
    setDialogMode('edit');
    setSelectedAval(aval);
    setFormData({
      rutCliente: aval.rutCliente,
      rutAval: aval.rutAval,
      nombreAval: aval.nombreAval,
      direccion: aval.direccion,
      comuna: aval.comuna,
      telefono: aval.telefono,
      email: aval.email,
      tipoAval: aval.tipoAval,
      regimenMatrimonial: aval.regimenMatrimonial,
      rutConyuge: aval.rutConyuge,
      nombreConyuge: aval.nombreConyuge,
      esSocio: aval.esSocio,
      porcentajeParticipacion: aval.porcentajeParticipacion,
      fechaVigenciaDesde: aval.fechaVigenciaDesde,
      fechaVigenciaHasta: aval.fechaVigenciaHasta,
      observaciones: aval.observaciones
    });
    setOpenDialog(true);
  };

  const handleOpenView = (aval: AvalDto) => {
    setDialogMode('view');
    setSelectedAval(aval);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAval(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (dialogMode === 'create') {
        await legalService.createAval(formData);
      } else if (dialogMode === 'edit' && selectedAval) {
        await legalService.updateAval(selectedAval.id, formData as updateAvalDto);
      }
      handleCloseDialog();
      loadAvales();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de liberar este aval?')) return;
    try {
      await legalService.deleteAval(id);
      loadAvales();
    } catch (err: any) {
      setError(err.message || 'Error al liberar');
    }
  };

  const getEstadoChip = (estado: number) => {
    const estadoInfo = estadosAval.find(e => e.value === estado);
    return (
      <Chip 
        label={estadoInfo?.label || 'Desconocido'} 
        size="small" 
        color={estadoInfo?.color as any || 'default'}
      />
    );
  };

  const getTipoLabel = (tipo: number) => {
    return tiposAval.find(t => t.value === tipo)?.label || 'Desconocido';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Gestión de Avales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consulta e ingreso de avales por cliente - Migrado de F_LE1200/F_LE1500.frm
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          color="success"
        >
          Nuevo Aval
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
              label="RUT Aval"
              type="number"
              value={filtro.rutAval || ''}
              onChange={(e) => handleFilterChange('rutAval', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo Aval</InputLabel>
              <Select
                value={filtro.tipoAval || ''}
                label="Tipo Aval"
                onChange={(e) => handleFilterChange('tipoAval', e.target.value || undefined)}
              >
                <MenuItem value="">Todos</MenuItem>
                {tiposAval.map(t => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtro.estado || ''}
                label="Estado"
                onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
              >
                <MenuItem value="">Todos</MenuItem>
                {estadosAval.map(e => (
                  <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filtro.soloActivos || false}
                  onChange={(e) => handleFilterChange('soloActivos', e.target.checked)}
                />
              }
              label="Solo activos"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={loadAvales}
              >
                Buscar
              </Button>
              <IconButton onClick={handleClearFilters}>
                <ClearIcon />
              </IconButton>
              <IconButton onClick={loadAvales}>
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
              <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                <TableCell><strong>RUT Cliente</strong></TableCell>
                <TableCell><strong>Nombre Cliente</strong></TableCell>
                <TableCell><strong>RUT Aval</strong></TableCell>
                <TableCell><strong>Nombre Aval</strong></TableCell>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell align="center"><strong>Es Socio</strong></TableCell>
                <TableCell align="center"><strong>Estado</strong></TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {avales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" py={3}>
                      {loading ? 'Cargando...' : 'No se encontraron avales'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                avales
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((aval) => (
                    <TableRow key={aval.id} hover>
                      <TableCell>{aval.rutCliente}</TableCell>
                      <TableCell>{aval.nombreCliente}</TableCell>
                      <TableCell>{aval.rutAval}</TableCell>
                      <TableCell>{aval.nombreAval}</TableCell>
                      <TableCell>{getTipoLabel(aval.tipoAval)}</TableCell>
                      <TableCell align="center">
                        {aval.esSocio ? (
                          <Chip label="Sí" size="small" color="info" icon={<PersonIcon />} />
                        ) : (
                          <Chip label="No" size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell align="center">{getEstadoChip(aval.estadoAval)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalle">
                          <IconButton size="small" onClick={() => handleOpenView(aval)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenEdit(aval)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Liberar">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDelete(aval.id)}
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
          count={avales.length}
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
            <AvalIcon color="success" />
            {dialogMode === 'create' ? 'Nuevo Aval' : 
             dialogMode === 'edit' ? 'Editar Aval' : 'Detalle de Aval'}
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
                value={dialogMode === 'view' ? selectedAval?.rutCliente : formData.rutCliente}
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
                  value={selectedAval?.nombreCliente || ''}
                  disabled
                />
              </Grid>
            )}
            
            <Grid size={12}>
              <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>
                Datos del Aval
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="RUT Aval"
                type="number"
                value={dialogMode === 'view' ? selectedAval?.rutAval : formData.rutAval}
                onChange={(e) => setFormData({...formData, rutAval: parseInt(e.target.value)})}
                disabled={dialogMode === 'view' || dialogMode === 'edit'}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre Aval"
                value={dialogMode === 'view' ? selectedAval?.nombreAval : formData.nombreAval}
                onChange={(e) => setFormData({...formData, nombreAval: e.target.value})}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required disabled={dialogMode === 'view'}>
                <InputLabel>Tipo de Aval</InputLabel>
                <Select
                  value={dialogMode === 'view' ? selectedAval?.tipoAval : formData.tipoAval}
                  label="Tipo de Aval"
                  onChange={(e) => setFormData({...formData, tipoAval: e.target.value as number})}
                >
                  {tiposAval.map(t => (
                    <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required disabled={dialogMode === 'view'}>
                <InputLabel>Régimen Matrimonial</InputLabel>
                <Select
                  value={dialogMode === 'view' ? selectedAval?.regimenMatrimonial : formData.regimenMatrimonial}
                  label="Régimen Matrimonial"
                  onChange={(e) => setFormData({...formData, regimenMatrimonial: e.target.value as number})}
                >
                  {regimenesMatrimoniales.map(r => (
                    <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Dirección"
                value={dialogMode === 'view' ? selectedAval?.direccion : formData.direccion}
                onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Comuna"
                value={dialogMode === 'view' ? selectedAval?.comuna : formData.comuna}
                onChange={(e) => setFormData({...formData, comuna: e.target.value})}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={dialogMode === 'view' ? selectedAval?.telefono : formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={dialogMode === 'view' ? selectedAval?.email : formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={dialogMode === 'view' ? selectedAval?.esSocio : formData.esSocio}
                    onChange={(e) => setFormData({...formData, esSocio: e.target.checked})}
                    disabled={dialogMode === 'view'}
                  />
                }
                label="Es Socio de la empresa"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="% Participación"
                type="number"
                value={formData.porcentajeParticipacion || ''}
                onChange={(e) => setFormData({...formData, porcentajeParticipacion: e.target.value ? parseFloat(e.target.value) : undefined})}
                disabled={!formData.esSocio}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Observaciones"
                multiline
                rows={2}
                value={dialogMode === 'view' ? selectedAval?.observaciones : formData.observaciones}
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
            <Button variant="contained" color="success" onClick={handleSave} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Guardar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Avales;
