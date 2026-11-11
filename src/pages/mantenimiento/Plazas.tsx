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
import type { PlazaDto } from '../../services/master.service';
import { plazaService } from "../../services/master.service";

/**
 * Página de Plazas - Migrada de F_MA1400.frm (VB6)
 * CRUD completo de plazas de pago
 */

const Plazas: React.FC = () => {
  const navigate = useNavigate();
  const [plazas, setPlazas] = useState<PlazaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedPlaza, setSelectedPlaza] = useState<Partial<PlazaDto>>({});
  const [saving, setSaving] = useState(false);

  // Estado del diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [plazaToDelete, setPlazaToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadPlazas();
  }, []);

  const loadPlazas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await plazaService.getAll();
      setPlazas(data);
    } catch (err) {
      setError('Error al cargar las plazas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedPlaza({
      codigo: 0,
      descripcion: '',
      diasCanje: 0,
      plazaFuera: 'N',
    });
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (plaza: PlazaDto) => {
    setSelectedPlaza({ ...plaza });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (codigo: number) => {
    setPlazaToDelete(codigo);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (plazaToDelete === null) return;
    
    try {
      await plazaService.delete(plazaToDelete);
      await loadPlazas();
      setConfirmOpen(false);
      setPlazaToDelete(null);
    } catch (err) {
      setError('Error al eliminar la plaza');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedPlaza.descripcion?.trim()) {
      setError('La descripción es requerida');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (dialogMode === 'create') {
        await plazaService.create(selectedPlaza);
      } else {
        await plazaService.update(selectedPlaza.codigo!, selectedPlaza);
      }

      await loadPlazas();
      setDialogOpen(false);
    } catch (err) {
      setError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} la plaza`);
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
            Mantenedor de Plazas
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
          <Typography color="text.primary">Plazas</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {/* Toolbar de acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Plazas de Pago</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadPlazas}
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
                  <TableCell align="center">Días Canje</TableCell>
                  <TableCell align="center">Plaza Fuera</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : plazas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      No hay plazas registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  plazas.map((plaza) => (
                    <TableRow key={plaza.codigo} hover>
                      <TableCell>{plaza.codigo}</TableCell>
                      <TableCell>{plaza.descripcion}</TableCell>
                      <TableCell align="center">{plaza.diasCanje}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={plaza.plazaFuera === 'S' ? 'Sí' : 'No'} 
                          color={plaza.plazaFuera === 'S' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={plaza.estado === 0 ? 'Activo' : 'Inactivo'} 
                          color={plaza.estado === 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(plaza)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(plaza.codigo)} 
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
          {dialogMode === 'create' ? 'Nueva Plaza' : 'Editar Plaza'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código"
              type="number"
              value={selectedPlaza.codigo || ''}
              onChange={(e) => setSelectedPlaza({ ...selectedPlaza, codigo: parseInt(e.target.value) || 0 })}
              disabled={dialogMode === 'edit'}
              fullWidth
            />
            <TextField
              label="Descripción"
              value={selectedPlaza.descripcion || ''}
              onChange={(e) => setSelectedPlaza({ ...selectedPlaza, descripcion: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Días de Canje"
              type="number"
              value={selectedPlaza.diasCanje || 0}
              onChange={(e) => setSelectedPlaza({ ...selectedPlaza, diasCanje: parseInt(e.target.value) || 0 })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedPlaza.plazaFuera === 'S'}
                  onChange={(e) => setSelectedPlaza({ ...selectedPlaza, plazaFuera: e.target.checked ? 'S' : 'N' })}
                />
              }
              label="Plaza Fuera"
            />
            {dialogMode === 'edit' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedPlaza.estado === 0}
                    onChange={(e) => setSelectedPlaza({ ...selectedPlaza, estado: e.target.checked ? 0 : 1 })}
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
          <Typography>¿Está seguro que desea eliminar esta plaza?</Typography>
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

export default Plazas;
