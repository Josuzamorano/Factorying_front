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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import type { EjecutivoDto, SelectItemDto } from '../../services/master.service';
import { ejecutivoService, sucursalService } from "../../services/master.service";

/**
 * Página de Ejecutivos - Migrada de F_MA1200.frm (VB6)
 * CRUD completo de ejecutivos de la empresa
 */

const Ejecutivos: React.FC = () => {
  const navigate = useNavigate();
  const [ejecutivos, setEjecutivos] = useState<EjecutivoDto[]>([]);
  const [sucursales, setSucursales] = useState<SelectItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedEjecutivo, setSelectedEjecutivo] = useState<Partial<EjecutivoDto>>({});
  const [saving, setSaving] = useState(false);

  // Estado del diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [ejecutivoToDelete, setEjecutivoToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ejecutivosData, sucursalesData] = await Promise.all([
        ejecutivoService.getAll(),
        sucursalService.getActivos()
      ]);
      setEjecutivos(ejecutivosData);
      setSucursales(sucursalesData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedEjecutivo({
      codigo: 0,
      nombre: '',
      rut: '',
      email: '',
      telefono: '',
      codigoSucursal: undefined,
    });
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (ejecutivo: EjecutivoDto) => {
    setSelectedEjecutivo({ ...ejecutivo });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (codigo: number) => {
    setEjecutivoToDelete(codigo);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (ejecutivoToDelete === null) return;
    
    try {
      await ejecutivoService.delete(ejecutivoToDelete);
      await loadData();
      setConfirmOpen(false);
      setEjecutivoToDelete(null);
    } catch (err) {
      setError('Error al eliminar el ejecutivo');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedEjecutivo.nombre?.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (dialogMode === 'create') {
        await ejecutivoService.create(selectedEjecutivo);
      } else {
        await ejecutivoService.update(selectedEjecutivo.codigo!, selectedEjecutivo);
      }

      await loadData();
      setDialogOpen(false);
    } catch (err) {
      setError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el ejecutivo`);
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
            Mantenedor de Ejecutivos
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
          <Typography color="text.primary">Ejecutivos</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {/* Toolbar de acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Ejecutivos de la Empresa</Typography>
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
                  <TableCell>Nombre</TableCell>
                  <TableCell>RUT</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Sucursal</TableCell>
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
                ) : ejecutivos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      No hay ejecutivos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  ejecutivos.map((ejecutivo) => (
                    <TableRow key={ejecutivo.codigo} hover>
                      <TableCell>{ejecutivo.codigo}</TableCell>
                      <TableCell>{ejecutivo.nombre}</TableCell>
                      <TableCell>{ejecutivo.rut || '-'}</TableCell>
                      <TableCell>{ejecutivo.email || '-'}</TableCell>
                      <TableCell>{ejecutivo.telefono || '-'}</TableCell>
                      <TableCell>{ejecutivo.nombreSucursal || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={ejecutivo.estado === 0 ? 'Activo' : 'Inactivo'} 
                          color={ejecutivo.estado === 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(ejecutivo)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(ejecutivo.codigo)} 
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
          {dialogMode === 'create' ? 'Nuevo Ejecutivo' : 'Editar Ejecutivo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código"
              type="number"
              value={selectedEjecutivo.codigo || ''}
              onChange={(e) => setSelectedEjecutivo({ ...selectedEjecutivo, codigo: parseInt(e.target.value) || 0 })}
              disabled={dialogMode === 'edit'}
              fullWidth
            />
            <TextField
              label="Nombre"
              value={selectedEjecutivo.nombre || ''}
              onChange={(e) => setSelectedEjecutivo({ ...selectedEjecutivo, nombre: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="RUT"
              value={selectedEjecutivo.rut || ''}
              onChange={(e) => setSelectedEjecutivo({ ...selectedEjecutivo, rut: e.target.value })}
              fullWidth
              placeholder="12.345.678-9"
            />
            <TextField
              label="Email"
              type="email"
              value={selectedEjecutivo.email || ''}
              onChange={(e) => setSelectedEjecutivo({ ...selectedEjecutivo, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="Teléfono"
              value={selectedEjecutivo.telefono || ''}
              onChange={(e) => setSelectedEjecutivo({ ...selectedEjecutivo, telefono: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                value={selectedEjecutivo.codigoSucursal || ''}
                onChange={(e) => setSelectedEjecutivo({ 
                  ...selectedEjecutivo, 
                  codigoSucursal: e.target.value ? Number(e.target.value) : undefined 
                })}
                label="Sucursal"
              >
                <MenuItem value="">
                  <em>Sin asignar</em>
                </MenuItem>
                {sucursales.map((suc) => (
                  <MenuItem key={suc.codigo} value={suc.codigo}>
                    {suc.descripcion}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {dialogMode === 'edit' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedEjecutivo.estado === 0}
                    onChange={(e) => setSelectedEjecutivo({ ...selectedEjecutivo, estado: e.target.checked ? 0 : 1 })}
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
          <Typography>¿Está seguro que desea eliminar este ejecutivo?</Typography>
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

export default Ejecutivos;
