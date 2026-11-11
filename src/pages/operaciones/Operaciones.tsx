import React, { useState, useEffect, useCallback } from 'react';
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
  TablePagination,
  IconButton,
  TextField,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import operacionService from '../../services/operacion.service';
import type { Operacion, OperacionSearchDto } from '../../services/operacion.service';
import ConfirmDialog from '../../components/ConfirmDialog';

// Estados de operación
const estadosOperacion = [
  { codigo: 1, descripcion: 'Ingresada', color: 'info' as const },
  { codigo: 2, descripcion: 'Otorgada', color: 'success' as const },
  { codigo: 3, descripcion: 'Anulada', color: 'error' as const },
  { codigo: 4, descripcion: 'Pagada', color: 'default' as const },
];

// Tipos de documento
const tiposDocumento = [
  { codigo: 1, descripcion: 'Factura' },
  { codigo: 2, descripcion: 'Cheque' },
  { codigo: 3, descripcion: 'Letra' },
  { codigo: 4, descripcion: 'Otro' },
];

const formatMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
};

const Operaciones: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Estado de datos
  const [operaciones, setOperaciones] = useState<Operacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Estado de filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<OperacionSearchDto>({});

  // Estado de diálogo
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operacionToDelete, setOperacionToDelete] = useState<Operacion | null>(null);

  // Cargar operaciones
  const loadOperaciones = useCallback(async () => {
    setLoading(true);
    try {
      let data: Operacion[];
      
      if (Object.keys(filters).length > 0 && Object.values(filters).some(v => v !== undefined)) {
        data = await operacionService.search(filters);
      } else {
        data = await operacionService.getAll();
      }
      
      setOperaciones(data);
    } catch (error) {
      console.error('Error loading operaciones:', error);
      enqueueSnackbar('Error al cargar operaciones', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters, enqueueSnackbar]);

  useEffect(() => {
    loadOperaciones();
  }, [loadOperaciones]);

  // Handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field: keyof OperacionSearchDto, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleApplyFilters = () => {
    setPage(0);
    loadOperaciones();
  };

  const handleDeleteClick = (operacion: Operacion) => {
    setOperacionToDelete(operacion);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!operacionToDelete) return;

    try {
      await operacionService.delete(operacionToDelete.correlativoOperacion);
      enqueueSnackbar('Operación eliminada correctamente', { variant: 'success' });
      loadOperaciones();
    } catch (error) {
      console.error('Error deleting operacion:', error);
      enqueueSnackbar('Error al eliminar la operación', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setOperacionToDelete(null);
    }
  };

  const handleOtorgar = async (operacion: Operacion) => {
    try {
      await operacionService.otorgar(operacion.correlativoOperacion, new Date().toISOString().split('T')[0]);
      enqueueSnackbar('Operación otorgada correctamente', { variant: 'success' });
      loadOperaciones();
    } catch (error) {
      console.error('Error otorgando operacion:', error);
      enqueueSnackbar('Error al otorgar la operación', { variant: 'error' });
    }
  };

  const getEstadoChip = (estado: number) => {
    const estadoInfo = estadosOperacion.find(e => e.codigo === estado);
    if (!estadoInfo) return <Chip label="Desconocido" size="small" />;
    return <Chip label={estadoInfo.descripcion} size="small" color={estadoInfo.color} />;
  };

  // Datos paginados
  const paginatedOperaciones = operaciones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Operaciones de Factoring
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadOperaciones}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/operaciones/nueva')}
          >
            Nueva Operación
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="Fecha Desde"
                type="Dayjs"
                value={filters.fechaDesde || ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="Fecha Hasta"
                type="Dayjs"
                value={filters.fechaHasta || ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                label="RUT Cliente"
                value={filters.rutCliente || ''}
                onChange={(e) => handleFilterChange('rutCliente', e.target.value ? parseInt(e.target.value) : undefined)}
                size="small"
                type="number"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filters.estado || ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {estadosOperacion.map(e => (
                    <MenuItem key={e.codigo} value={e.codigo}>{e.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Documento</InputLabel>
                <Select
                  value={filters.tipoDocumento || ''}
                  onChange={(e) => handleFilterChange('tipoDocumento', e.target.value || undefined)}
                  label="Tipo Documento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {tiposDocumento.map(t => (
                    <MenuItem key={t.codigo} value={t.codigo}>{t.descripcion}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleApplyFilters} startIcon={<SearchIcon />}>
                  Buscar
                </Button>
                <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Tabla */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : operaciones.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No se encontraron operaciones
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nº Oper.</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Tipo Doc.</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="right">Monto Total</TableCell>
                    <TableCell align="right">Monto Giro</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOperaciones.map((op) => (
                    <TableRow key={op.correlativoOperacion} hover>
                      <TableCell>{op.correlativoOperacion}</TableCell>
                      <TableCell>{new Date(op.fechaOperacion).toLocaleDateString('es-CL')}</TableCell>
                      <TableCell>{op.nombreCliente || op.rutCliente}</TableCell>
                      <TableCell>{op.nombreTipoDocumento || tiposDocumento.find(t => t.codigo === op.tipoDocumento)?.descripcion}</TableCell>
                      <TableCell>{getEstadoChip(op.estadoOperacion)}</TableCell>
                      <TableCell align="right">{formatMonto(op.montoTotal)}</TableCell>
                      <TableCell align="right">{formatMonto(op.montoGiro)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver Detalle">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/operaciones/${op.correlativoOperacion}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {op.estadoOperacion === 1 && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/operaciones/${op.correlativoOperacion}/editar`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Otorgar">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleOtorgar(op)}
                              >
                                <CheckIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(op)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={operaciones.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Filas por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </>
        )}
      </Paper>

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Eliminar Operación"
        message={`¿Está seguro que desea eliminar la operación ${operacionToDelete?.correlativoOperacion}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setOperacionToDelete(null);
        }}
      />
    </Box>
  );
};

export default Operaciones;
