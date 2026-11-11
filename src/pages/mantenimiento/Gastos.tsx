import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Refresh,
} from '@mui/icons-material';
import type { GastoDto, SelectItemDto } from '../../services/master.service';
import { gastoService, parametroService, PARAM_TABLES } from "../../services/master.service";

/**
 * Página de Gastos - Migrada de F_MA1700.frm (VB6)
 * CRUD completo de tipos de gastos
 */

const Gastos: React.FC = () => {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState<GastoDto[]>([]);
  const [tiposGasto, setTiposGasto] = useState<SelectItemDto[]>([]);
  const [subTipos, setSubTipos] = useState<SelectItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedGasto, setSelectedGasto] = useState<Partial<GastoDto>>({});
  const [saving, setSaving] = useState(false);

  // Estado del diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [gastoToDelete, setGastoToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [gastosData, tiposData, subTiposData] = await Promise.all([
        gastoService.getAll(),
        parametroService.getSelectByTabla(PARAM_TABLES.TIPO_GASTO),
        parametroService.getSelectByTabla(PARAM_TABLES.SUBTIPO_GASTO),
      ]);
      setGastos(gastosData);
      setTiposGasto(tiposData);
      setSubTipos(subTiposData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedGasto({
      codigo: 0,
      descripcion: '',
      tipoGasto: tiposGasto.length > 0 ? tiposGasto[0].codigo : 1,
      subTipo: subTipos.length > 0 ? subTipos[0].codigo : 1,
      montoDefecto: 0,
      porcentajeDefecto: 0,
      activo: true,
    });
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (gasto: GastoDto) => {
    setSelectedGasto({ ...gasto });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (codigo: number) => {
    setGastoToDelete(codigo);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (gastoToDelete === null) return;
    
    try {
      await gastoService.delete(gastoToDelete);
      await loadData();
      setConfirmOpen(false);
      setGastoToDelete(null);
    } catch (err) {
      setError('Error al eliminar el gasto');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedGasto.descripcion?.trim()) {
      setError('La descripción es requerida');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (dialogMode === 'create') {
        await gastoService.create(selectedGasto);
      } else {
        await gastoService.update(selectedGasto.codigo!, selectedGasto);
      }

      await loadData();
      setDialogOpen(false);
    } catch (err) {
      setError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el gasto`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/mantenimiento')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mantenedor de Gastos
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: '#f5f5f5', px: 3, py: 1 }}>
        <Breadcrumbs>
          <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/principal')}>
            Inicio
          </Link>
          <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/mantenimiento')}>
            Mantenimiento
          </Link>
          <Typography color="text.primary">Gastos</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {/* Toolbar de acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Tipos de Gasto</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadData}
              sx={{ mr: 1 }}
            >
              Actualizar
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNew}
            >
              Nuevo
            </Button>
          </Box>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabla */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Tipo Gasto</TableCell>
                  <TableCell>Clasificación</TableCell>
                  <TableCell align="right">Monto Defecto</TableCell>
                  <TableCell align="center">% Defecto</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : gastos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      No hay gastos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  gastos.map((gasto) => (
                    <TableRow key={gasto.codigo} hover>
                      <TableCell>{gasto.codigo}</TableCell>
                      <TableCell>{gasto.descripcion}</TableCell>
                      <TableCell>{gasto.tipoGastoDescripcion || `Tipo ${gasto.tipoGasto}`}</TableCell>
                      <TableCell>{gasto.subTipoDescripcion || `Subtipo ${gasto.subTipo}`}</TableCell>
                      <TableCell align="right">{formatMoney(gasto.montoDefecto)}</TableCell>
                      <TableCell align="center">{gasto.porcentajeDefecto.toFixed(2)}%</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={gasto.activo ? 'Activo' : 'Inactivo'} 
                          color={gasto.activo ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(gasto)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDelete(gasto.codigo)} color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      {/* Diálogo de Edición/Creación */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Nuevo Gasto' : 'Editar Gasto'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código"
              type="number"
              value={selectedGasto.codigo || ''}
              onChange={(e) => setSelectedGasto({ ...selectedGasto, codigo: parseInt(e.target.value) || 0 })}
              disabled={dialogMode === 'edit'}
              fullWidth
            />
            <TextField
              label="Descripción"
              value={selectedGasto.descripcion || ''}
              onChange={(e) => setSelectedGasto({ ...selectedGasto, descripcion: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              select
              label="Tipo de Gasto"
              value={selectedGasto.tipoGasto || ''}
              onChange={(e) => setSelectedGasto({ ...selectedGasto, tipoGasto: parseInt(e.target.value) })}
              fullWidth
            >
              {tiposGasto.map((tipo) => (
                <MenuItem key={tipo.codigo} value={tipo.codigo}>
                  {tipo.descripcion}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Clasificación (Sub-tipo)"
              value={selectedGasto.subTipo || ''}
              onChange={(e) => setSelectedGasto({ ...selectedGasto, subTipo: parseInt(e.target.value) })}
              fullWidth
            >
              {subTipos.map((sub) => (
                <MenuItem key={sub.codigo} value={sub.codigo}>
                  {sub.descripcion}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Monto por Defecto"
              type="number"
              value={selectedGasto.montoDefecto || 0}
              onChange={(e) => setSelectedGasto({ ...selectedGasto, montoDefecto: parseFloat(e.target.value) || 0 })}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              label="Porcentaje por Defecto"
              type="number"
              value={selectedGasto.porcentajeDefecto || 0}
              onChange={(e) => setSelectedGasto({ ...selectedGasto, porcentajeDefecto: parseFloat(e.target.value) || 0 })}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ step: 0.01, min: 0, max: 100 }}
            />
            {dialogMode === 'edit' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedGasto.activo ?? true}
                    onChange={(e) => setSelectedGasto({ ...selectedGasto, activo: e.target.checked })}
                  />
                }
                label="Activo"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este gasto?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Gastos;
