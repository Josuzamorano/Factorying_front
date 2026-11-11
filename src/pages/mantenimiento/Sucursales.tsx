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
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Refresh,
} from '@mui/icons-material';
import type { SucursalDto } from '../../services/master.service';
import { sucursalService } from "../../services/master.service";

/**
 * Página de Sucursales - Migrada de F_MA1500.frm (VB6)
 * CRUD completo de sucursales de la empresa
 */

const Sucursales: React.FC = () => {
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState<SucursalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedSucursal, setSelectedSucursal] = useState<Partial<SucursalDto>>({});
  const [saving, setSaving] = useState(false);

  // Estado del diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sucursalToDelete, setSucursalToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadSucursales();
  }, []);

  const loadSucursales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sucursalService.getAll();
      setSucursales(data);
    } catch (err) {
      setError('Error al cargar las sucursales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedSucursal({
      codigo: 0,
      descripcion: '',
      direccion: '',
      telefono: '',
      email: '',
    });
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (sucursal: SucursalDto) => {
    setSelectedSucursal({ ...sucursal });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (codigo: number) => {
    setSucursalToDelete(codigo);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (sucursalToDelete === null) return;
    
    try {
      await sucursalService.delete(sucursalToDelete);
      await loadSucursales();
      setConfirmOpen(false);
      setSucursalToDelete(null);
    } catch (err) {
      setError('Error al eliminar la sucursal');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedSucursal.descripcion?.trim()) {
      setError('La descripción es requerida');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (dialogMode === 'create') {
        await sucursalService.create(selectedSucursal);
      } else {
        await sucursalService.update(selectedSucursal.codigo!, selectedSucursal);
      }

      await loadSucursales();
      setDialogOpen(false);
    } catch (err) {
      setError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} la sucursal`);
      console.error(err);
    } finally {
      setSaving(false);
    }
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
            Mantenedor de Sucursales
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
          <Typography color="text.primary">Sucursales</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {/* Toolbar de acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Sucursales de la Empresa</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadSucursales}
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
                  <TableCell>Dirección</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : sucursales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      No hay sucursales registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  sucursales.map((sucursal) => (
                    <TableRow key={sucursal.codigo} hover>
                      <TableCell>{sucursal.codigo}</TableCell>
                      <TableCell>{sucursal.descripcion}</TableCell>
                      <TableCell>{sucursal.direccion || '-'}</TableCell>
                      <TableCell>{sucursal.telefono || '-'}</TableCell>
                      <TableCell>{sucursal.email || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={sucursal.estado === 0 ? 'Activo' : 'Inactivo'} 
                          color={sucursal.estado === 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(sucursal)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(sucursal.codigo)} 
                            color="error"
                          >
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
          {dialogMode === 'create' ? 'Nueva Sucursal' : 'Editar Sucursal'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código"
              type="number"
              value={selectedSucursal.codigo || ''}
              onChange={(e) => setSelectedSucursal({ ...selectedSucursal, codigo: parseInt(e.target.value) || 0 })}
              disabled={dialogMode === 'edit'}
              fullWidth
            />
            <TextField
              label="Descripción"
              value={selectedSucursal.descripcion || ''}
              onChange={(e) => setSelectedSucursal({ ...selectedSucursal, descripcion: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Dirección"
              value={selectedSucursal.direccion || ''}
              onChange={(e) => setSelectedSucursal({ ...selectedSucursal, direccion: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Teléfono"
              value={selectedSucursal.telefono || ''}
              onChange={(e) => setSelectedSucursal({ ...selectedSucursal, telefono: e.target.value })}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={selectedSucursal.email || ''}
              onChange={(e) => setSelectedSucursal({ ...selectedSucursal, email: e.target.value })}
              fullWidth
            />
            {dialogMode === 'edit' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedSucursal.estado === 0}
                    onChange={(e) => setSelectedSucursal({ ...selectedSucursal, estado: e.target.checked ? 0 : 1 })}
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
          <Typography>¿Está seguro que desea eliminar esta sucursal?</Typography>
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

export default Sucursales;
