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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
  Print as PrintIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { legalService, PagareDto, FiltroPagaresDto, CreatePagareDto, updatePagareDto } from '../../services/legal.service';

const estadosPagare = [
  { value: 1, label: 'Vigente', color: 'success' },
  { value: 2, label: 'Pagado', color: 'info' },
  { value: 3, label: 'Vencido', color: 'error' },
  { value: 4, label: 'En Cobranza', color: 'warning' },
  { value: 5, label: 'Protestado', color: 'error' },
  { value: 6, label: 'Castigado', color: 'default' },
  { value: 9, label: 'Anulado', color: 'default' }
];

const Pagares: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [pagares, setPagares] = useState<PagareDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtros
  const [filtro, setFiltro] = useState<FiltroPagaresDto>({
    soloVigentes: true
  });
  
  // Diálogo
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPagare, setSelectedPagare] = useState<PagareDto | null>(null);
  const [formData, setFormData] = useState<CreatePagareDto>({
    rutCliente: 0,
    numeroOperacion: undefined,
    numeroLinea: undefined,
    montoOriginal: 0,
    fechaEmision: new Date().toISOString(),
    fechaVencimiento: new Date().toISOString(),
    tipoEmision: 1,
    codigoNotaria: undefined,
    observaciones: ''
  });

  const loadPagares = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await legalService.consultarPagares(filtro);
      setPagares(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagarés');
    } finally {
      setLoading(false);
    }
  }, [filtro]);

  useEffect(() => {
    loadPagares();
  }, [loadPagares]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFiltro(prev => ({
      ...prev,
      soloVigentes: newValue === 0,
      soloVencidos: newValue === 1
    }));
  };

  const handleFilterChange = (field: keyof FiltroPagaresDto, value: any) => {
    setFiltro(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFiltro({ soloVigentes: true });
  };

  const handleOpenCreate = () => {
    setDialogMode('create');
    setSelectedPagare(null);
    setFormData({
      rutCliente: 0,
      numeroOperacion: undefined,
      numeroLinea: undefined,
      montoOriginal: 0,
      fechaEmision: new Date().toISOString(),
      fechaVencimiento: new Date().toISOString(),
      tipoEmision: 1,
      codigoNotaria: undefined,
      observaciones: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEdit = (pagare: PagareDto) => {
    setDialogMode('edit');
    setSelectedPagare(pagare);
    setFormData({
      rutCliente: pagare.rutCliente,
      numeroOperacion: pagare.numeroOperacion,
      numeroLinea: pagare.numeroLinea,
      montoOriginal: pagare.montoOriginal,
      fechaEmision: pagare.fechaEmision,
      fechaVencimiento: pagare.fechaVencimiento,
      tipoEmision: pagare.tipoEmision,
      codigoNotaria: pagare.codigoNotaria,
      observaciones: pagare.observaciones
    });
    setOpenDialog(true);
  };

  const handleOpenView = (pagare: PagareDto) => {
    setDialogMode('view');
    setSelectedPagare(pagare);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPagare(null);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      if (dialogMode === 'create') {
        await legalService.createPagare(formData);
      } else if (dialogMode === 'edit' && selectedPagare) {
        await legalService.updatePagare(selectedPagare.id, formData as updatePagareDto);
      }
      handleCloseDialog();
      loadPagares();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de anular este pagaré?')) return;
    try {
      await legalService.deletePagare(id);
      loadPagares();
    } catch (err: any) {
      setError(err.message || 'Error al anular');
    }
  };

  const getEstadoChip = (estado: number) => {
    const estadoInfo = estadosPagare.find(e => e.value === estado);
    return (
      <Chip 
        label={estadoInfo?.label || 'Desconocido'} 
        size="small" 
        color={estadoInfo?.color as any || 'default'}
      />
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDayjs = (DayjsStr: string) => {
    return new Date(DayjsStr).toLocaleDateString('es-CL');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Gestión de Pagarés
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consulta, ingreso y administración de pagarés - Migrado de F_LE1100/F_LE1400.frm
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Nuevo Pagaré
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs de estado */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Vigentes" />
          <Tab label="Vencidos" />
          <Tab label="Todos" />
        </Tabs>

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
                label="Nº Operación"
                type="number"
                value={filtro.numeroOperacion || ''}
                onChange={(e) => handleFilterChange('numeroOperacion', e.target.value ? parseInt(e.target.value) : undefined)}
              />
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
                  {estadosPagare.map(e => (
                    <MenuItem key={e.value} value={e.value}>{e.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Vence desde"
                value={filtro.vencimientoDesde ? dayjs(filtro.vencimientoDesde) : null}
                onChange={(Dayjs) => handleFilterChange('vencimientoDesde', Dayjs?.toISOString())}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <DatePicker
                label="Vence hasta"
                value={filtro.vencimientoHasta ? dayjs(filtro.vencimientoHasta) : null}
                onChange={(Dayjs) => handleFilterChange('vencimientoHasta', Dayjs?.toISOString())}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={loadPagares}
                >
                  Buscar
                </Button>
                <IconButton onClick={handleClearFilters}>
                  <ClearIcon />
                </IconButton>
                <IconButton onClick={loadPagares}>
                  <RefreshIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Tabla de resultados */}
        <Paper>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell><strong>Nº Pagaré</strong></TableCell>
                  <TableCell><strong>RUT Cliente</strong></TableCell>
                  <TableCell><strong>Nombre Cliente</strong></TableCell>
                  <TableCell align="right"><strong>Monto Original</strong></TableCell>
                  <TableCell align="right"><strong>Monto Actual</strong></TableCell>
                  <TableCell><strong>F. Emisión</strong></TableCell>
                  <TableCell><strong>F. Vencimiento</strong></TableCell>
                  <TableCell align="center"><strong>Estado</strong></TableCell>
                  <TableCell align="center"><strong>Días</strong></TableCell>
                  <TableCell align="center"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagares.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      <Typography color="text.secondary" py={3}>
                        {loading ? 'Cargando...' : 'No se encontraron pagarés'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagares
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((pagare) => (
                      <TableRow key={pagare.id} hover>
                        <TableCell>{pagare.numeroPagare}</TableCell>
                        <TableCell>{pagare.rutCliente}</TableCell>
                        <TableCell>{pagare.nombreCliente}</TableCell>
                        <TableCell align="right">{formatCurrency(pagare.montoOriginal)}</TableCell>
                        <TableCell align="right">{formatCurrency(pagare.montoActual)}</TableCell>
                        <TableCell>{formatDayjs(pagare.fechaEmision)}</TableCell>
                        <TableCell>{formatDayjs(pagare.fechaVencimiento)}</TableCell>
                        <TableCell align="center">{getEstadoChip(pagare.estado)}</TableCell>
                        <TableCell align="center">
                          {pagare.estaVencido ? (
                            <Chip 
                              label={`${Math.abs(pagare.diasParaVencimiento)} días vencido`}
                              size="small"
                              color="error"
                              icon={<WarningIcon />}
                            />
                          ) : (
                            <Chip 
                              label={`${pagare.diasParaVencimiento} días`}
                              size="small"
                              color={pagare.diasParaVencimiento <= 30 ? 'warning' : 'default'}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Ver detalle">
                            <IconButton size="small" onClick={() => handleOpenView(pagare)}>
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenEdit(pagare)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Imprimir">
                            <IconButton size="small">
                              <PrintIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Anular">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDelete(pagare.id)}
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
            count={pagares.length}
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
            {dialogMode === 'create' ? 'Nuevo Pagaré' : 
             dialogMode === 'edit' ? 'Editar Pagaré' : 'Detalle de Pagaré'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="RUT Cliente"
                  type="number"
                  value={dialogMode === 'view' ? selectedPagare?.rutCliente : formData.rutCliente}
                  onChange={(e) => setFormData({...formData, rutCliente: parseInt(e.target.value)})}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nº Pagaré"
                  value={selectedPagare?.numeroPagare || 'Auto-generado'}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nº Operación"
                  type="number"
                  value={dialogMode === 'view' ? selectedPagare?.numeroOperacion : formData.numeroOperacion || ''}
                  onChange={(e) => setFormData({...formData, numeroOperacion: e.target.value ? parseInt(e.target.value) : undefined})}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nº Línea"
                  type="number"
                  value={dialogMode === 'view' ? selectedPagare?.numeroLinea : formData.numeroLinea || ''}
                  onChange={(e) => setFormData({...formData, numeroLinea: e.target.value ? parseInt(e.target.value) : undefined})}
                  disabled={dialogMode === 'view'}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Monto Original"
                  type="number"
                  value={dialogMode === 'view' ? selectedPagare?.montoOriginal : formData.montoOriginal}
                  onChange={(e) => setFormData({...formData, montoOriginal: parseFloat(e.target.value)})}
                  disabled={dialogMode === 'view'}
                  required
                />
              </Grid>
              {dialogMode === 'view' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Monto Actual"
                    value={formatCurrency(selectedPagare?.montoActual || 0)}
                    disabled
                  />
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha Emisión"
                  value={dialogMode === 'view' 
                    ? dayjs(selectedPagare?.fechaEmision || '') 
                    : dayjs(formData.fechaEmision)}
                  onChange={(Dayjs) => setFormData({...formData, fechaEmision: Dayjs?.toISOString() || ''})}
                  disabled={dialogMode === 'view'}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Fecha Vencimiento"
                  value={dialogMode === 'view' 
                    ? dayjs(selectedPagare?.fechaVencimiento || '') 
                    : dayjs(formData.fechaVencimiento)}
                  onChange={(Dayjs) => setFormData({...formData, fechaVencimiento: Dayjs?.toISOString() || ''})}
                  disabled={dialogMode === 'view'}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
              </Grid>
              {dialogMode === 'view' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Estado"
                    value={estadosPagare.find(e => e.value === selectedPagare?.estado)?.label || 'Desconocido'}
                    disabled
                  />
                </Grid>
              )}
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={dialogMode === 'view' ? selectedPagare?.observaciones : formData.observaciones}
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
              <Button variant="contained" onClick={handleSave} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Pagares;
