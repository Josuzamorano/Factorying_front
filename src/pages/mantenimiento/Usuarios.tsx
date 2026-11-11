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
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Refresh,
  LockReset,
  LockOpen,
} from '@mui/icons-material';
import type { UsuarioDto, SelectItemDto } from '../../services/master.service';
import { usuarioService, sucursalService } from "../../services/master.service";

interface PerfilDto {
  codigo: number;
  descripcion: string;
}

/**
 * Página de Usuarios - Migrada de F_MA1700.frm (VB6)
 * CRUD completo de usuarios del sistema
 */

const Usuarios: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioDto[]>([]);
  const [sucursales, setSucursales] = useState<SelectItemDto[]>([]);
  const [perfiles, setPerfiles] = useState<PerfilDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Estado del diálogo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedUsuario, setSelectedUsuario] = useState<Partial<UsuarioDto & { password?: string }>>({});
  const [saving, setSaving] = useState(false);

  // Estado del diálogo de confirmación
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<string | null>(null);

  // Estado del diálogo de reset password
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLogin, setResetLogin] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usuariosData, sucursalesData] = await Promise.all([
        usuarioService.getAll(),
        sucursalService.getActivos(),
      ]);
      setUsuarios(usuariosData);
      setSucursales(sucursalesData);
      // Perfiles hardcodeados por ahora (deberían venir de API)
      setPerfiles([
        { codigo: 1, descripcion: 'Administrador' },
        { codigo: 2, descripcion: 'Ejecutivo' },
        { codigo: 3, descripcion: 'Consulta' },
      ]);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedUsuario({
      login: '',
      password: '',
      nombre: '',
      email: '',
      codigoPerfil: perfiles.length > 0 ? perfiles[0].codigo : 1,
      codigoSucursal: sucursales.length > 0 ? sucursales[0].codigo : undefined,
      activo: true,
    });
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (usuario: UsuarioDto) => {
    setSelectedUsuario({ ...usuario });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDelete = (login: string) => {
    setUsuarioToDelete(login);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (usuarioToDelete === null) return;
    
    try {
      await usuarioService.delete(usuarioToDelete);
      await loadData();
      setConfirmOpen(false);
      setUsuarioToDelete(null);
      setSuccessMsg('Usuario eliminado correctamente');
    } catch (err) {
      setError('Error al eliminar el usuario');
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedUsuario.login?.trim()) {
      setError('El login es requerido');
      return;
    }
    if (!selectedUsuario.nombre?.trim()) {
      setError('El nombre es requerido');
      return;
    }
    if (dialogMode === 'create' && !selectedUsuario.password?.trim()) {
      setError('El password es requerido');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (dialogMode === 'create') {
        await usuarioService.create({
          login: selectedUsuario.login!,
          password: selectedUsuario.password!,
          nombre: selectedUsuario.nombre!,
          email: selectedUsuario.email,
          codigoPerfil: selectedUsuario.codigoPerfil,
          codigoEjecutivo: selectedUsuario.codigoEjecutivo,
          codigoSucursal: selectedUsuario.codigoSucursal,
          fechaExpiracion: selectedUsuario.fechaExpiracion,
        });
      } else {
        await usuarioService.update(selectedUsuario.login!, {
          nombre: selectedUsuario.nombre,
          email: selectedUsuario.email,
          codigoPerfil: selectedUsuario.codigoPerfil,
          codigoEjecutivo: selectedUsuario.codigoEjecutivo,
          codigoSucursal: selectedUsuario.codigoSucursal,
          fechaExpiracion: selectedUsuario.fechaExpiracion,
          activo: selectedUsuario.activo,
        });
      }

      await loadData();
      setDialogOpen(false);
      setSuccessMsg(`Usuario ${dialogMode === 'create' ? 'creado' : 'actualizado'} correctamente`);
    } catch (err) {
      setError(`Error al ${dialogMode === 'create' ? 'crear' : 'actualizar'} el usuario`);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = (login: string) => {
    setResetLogin(login);
    setNewPassword('');
    setResetOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!resetLogin || !newPassword.trim()) return;

    try {
      await usuarioService.resetPassword(resetLogin, newPassword);
      setResetOpen(false);
      setResetLogin(null);
      setNewPassword('');
      setSuccessMsg('Password reseteado correctamente');
    } catch (err) {
      setError('Error al resetear el password');
      console.error(err);
    }
  };

  const handleDesbloquear = async (login: string) => {
    try {
      await usuarioService.desbloquear(login);
      await loadData();
      setSuccessMsg('Usuario desbloqueado correctamente');
    } catch (err) {
      setError('Error al desbloquear el usuario');
      console.error(err);
    }
  };

  const getEstadoChip = (estado: number) => {
    switch (estado) {
      case 0:
        return <Chip label="Normal" color="success" size="small" />;
      case 1:
        return <Chip label="Cambio Solicitado" color="warning" size="small" />;
      case 2:
        return <Chip label="Primer Acceso" color="info" size="small" />;
      case 3:
        return <Chip label="Bloqueado" color="error" size="small" />;
      default:
        return <Chip label="Desconocido" size="small" />;
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
            Administración de Usuarios
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
          <Typography color="text.primary">Usuarios</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {/* Toolbar de acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Usuarios del Sistema</Typography>
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

        {/* Mensajes */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMsg(null)}>
            {successMsg}
          </Alert>
        )}

        {/* Tabla */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Login</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Perfil</TableCell>
                  <TableCell>Sucursal</TableCell>
                  <TableCell align="center">Estado Password</TableCell>
                  <TableCell align="center">Activo</TableCell>
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
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      No hay usuarios registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.login} hover>
                      <TableCell sx={{ fontWeight: 'bold' }}>{usuario.login}</TableCell>
                      <TableCell>{usuario.nombre}</TableCell>
                      <TableCell>{usuario.email || '-'}</TableCell>
                      <TableCell>{usuario.nombrePerfil || '-'}</TableCell>
                      <TableCell>{usuario.nombreSucursal || '-'}</TableCell>
                      <TableCell align="center">
                        {getEstadoChip(usuario.estadoPassword)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={usuario.activo ? 'Sí' : 'No'} 
                          color={usuario.activo ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleEdit(usuario)}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Resetear Password">
                          <IconButton size="small" onClick={() => handleResetPassword(usuario.login)} color="warning">
                            <LockReset />
                          </IconButton>
                        </Tooltip>
                        {usuario.estadoPassword === 3 && (
                          <Tooltip title="Desbloquear">
                            <IconButton size="small" onClick={() => handleDesbloquear(usuario.login)} color="success">
                              <LockOpen />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Eliminar">
                          <IconButton size="small" onClick={() => handleDelete(usuario.login)} color="error">
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
          {dialogMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Login"
              value={selectedUsuario.login || ''}
              onChange={(e) => setSelectedUsuario({ ...selectedUsuario, login: e.target.value.toUpperCase() })}
              disabled={dialogMode === 'edit'}
              fullWidth
              inputProps={{ maxLength: 20 }}
            />
            {dialogMode === 'create' && (
              <TextField
                label="Password"
                type="password"
                value={selectedUsuario.password || ''}
                onChange={(e) => setSelectedUsuario({ ...selectedUsuario, password: e.target.value })}
                fullWidth
              />
            )}
            <TextField
              label="Nombre Completo"
              value={selectedUsuario.nombre || ''}
              onChange={(e) => setSelectedUsuario({ ...selectedUsuario, nombre: e.target.value })}
              fullWidth
              autoFocus={dialogMode === 'edit'}
            />
            <TextField
              label="Email"
              type="email"
              value={selectedUsuario.email || ''}
              onChange={(e) => setSelectedUsuario({ ...selectedUsuario, email: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Perfil"
              value={selectedUsuario.codigoPerfil || ''}
              onChange={(e) => setSelectedUsuario({ ...selectedUsuario, codigoPerfil: parseInt(e.target.value) })}
              fullWidth
            >
              {perfiles.map((perfil) => (
                <MenuItem key={perfil.codigo} value={perfil.codigo}>
                  {perfil.descripcion}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Sucursal"
              value={selectedUsuario.codigoSucursal || ''}
              onChange={(e) => setSelectedUsuario({ ...selectedUsuario, codigoSucursal: parseInt(e.target.value) || undefined })}
              fullWidth
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {sucursales.map((suc) => (
                <MenuItem key={suc.codigo} value={suc.codigo}>
                  {suc.descripcion}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fecha Expiración"
              type="Dayjs"
              value={selectedUsuario.fechaExpiracion?.split('T')[0] || ''}
              onChange={(e) => setSelectedUsuario({ ...selectedUsuario, fechaExpiracion: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {dialogMode === 'edit' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={selectedUsuario.activo ?? true}
                    onChange={(e) => setSelectedUsuario({ ...selectedUsuario, activo: e.target.checked })}
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

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar este usuario?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Reset Password */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Resetear Password</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Usuario: <strong>{resetLogin}</strong>
            </Typography>
            <TextField
              label="Nuevo Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              autoFocus
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancelar</Button>
          <Button onClick={confirmResetPassword} variant="contained" disabled={!newPassword.trim()}>
            Resetear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
