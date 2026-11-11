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
import type { BancoDto } from '../../services/master.service';
import { bancoService } from "../../services/master.service";

/**
 * Página de Bancos - Migrada de F_MA1300.frm (VB6)
 * CRUD completo de bancos
 */

const Bancos: React.FC = () => {
  const navigate = useNavigate();
  const [bancos, setBancos] = useState<BancoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedBanco, setSelectedBanco] = useState<Partial<BancoDto>>({});
  const [saving, setSaving] = useState(false);

  // Estado del diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bancoToDelete, setBancoToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadBancos();
  }, []);

  const loadBancos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bancoService.getAll();
      setBancos(data);
    } catch (err) {
      setError('Error al cargar los bancos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedBanco({
      codigo: 0,
      descripcion: '',
      permiteDeposito: 'S',
      cuentaCorriente: '',
      cuentaContable: undefined,
      transferenciaElectronica: 'S',
    });
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (banco: BancoDto) => {
    setSelectedBanco({ ...banco });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (codigo: number) => {
    setBancoToDelete(codigo);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (bancoToDelete === null) return;
    
    try {
      await bancoService.delete(bancoToDelete);
      await loadBancos();
      setConfirmOpen(false);
      setBancoToDelete(null);
    } catch (err) {
      setError('Error al eliminar el banco');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedBanco.descripcion?.trim()) {
      setError('La descripción es requerida');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (dialogMode === 'create') {
        await bancoService.create(selectedBanco);
      } else {
        await bancoService.update(selectedBanco.codigo!, selectedBanco);
      }

      await loadBancos();
      setDialogOpen(false);
    } catch (err) {
      setError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el banco`);
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
            Mantenedor de Bancos
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
          <Typography color="text.primary">Bancos</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {/* Toolbar de acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Bancos</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadBancos}
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
                  <TableCell align="center">Depósito</TableCell>
                  <TableCell>Cuenta Corriente</TableCell>
                  <TableCell align="center">Trans. Elect.</TableCell>
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
                ) : bancos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      No hay bancos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  bancos.map((banco) => (
                    <TableRow key={banco.codigo} hover>
                      <TableCell>{banco.codigo}</TableCell>
                      <TableCell>{banco.descripcion}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={banco.permiteDeposito === 'S' ? 'Sí' : 'No'} 
                          color={banco.permiteDeposito === 'S' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{banco.cuentaCorriente || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={banco.transferenciaElectronica === 'S' ? 'Sí' : 'No'} 
                          color={banco.transferenciaElectronica === 'S' ? 'info' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={banco.estado === 0 ? 'Activo' : 'Inactivo'} 
                          color={banco.estado === 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(banco)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDelete(banco.codigo)} color="error">
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
          {dialogMode === 'create' ? 'Nuevo Banco' : 'Editar Banco'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Código"
              type="number"
              value={selectedBanco.codigo || ''}
              onChange={(e) => setSelectedBanco({ ...selectedBanco, codigo: parseInt(e.target.value) || 0 })}
              disabled={dialogMode === 'edit'}
              fullWidth
            />
            <TextField
              label="Descripción"
              value={selectedBanco.descripcion || ''}
              onChange={(e) => setSelectedBanco({ ...selectedBanco, descripcion: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Cuenta Corriente"
              value={selectedBanco.cuentaCorriente || ''}
              onChange={(e) => setSelectedBanco({ ...selectedBanco, cuentaCorriente: e.target.value })}
              fullWidth
            />
            <TextField
              label="Cuenta Contable"
              type="number"
              value={selectedBanco.cuentaContable || ''}
              onChange={(e) => setSelectedBanco({ ...selectedBanco, cuentaContable: parseInt(e.target.value) || undefined })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedBanco.permiteDeposito === 'S'}
                  onChange={(e) => setSelectedBanco({ ...selectedBanco, permiteDeposito: e.target.checked ? 'S' : 'N' })}
                />
              }
              label="Permite Depósito"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedBanco.transferenciaElectronica === 'S'}
                  onChange={(e) => setSelectedBanco({ ...selectedBanco, transferenciaElectronica: e.target.checked ? 'S' : 'N' })}
                />
              }
              label="Transferencia Electrónica"
            />
            {dialogMode === 'edit' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedBanco.estado === 0}
                    onChange={(e) => setSelectedBanco({ ...selectedBanco, estado: e.target.checked ? 0 : 1 })}
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
          <Typography>¿Está seguro que desea eliminar este banco?</Typography>
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

export default Bancos;
