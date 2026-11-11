import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import {
  Person,
  Lock,
  Visibility,
  VisibilityOff,
  VpnKey,
} from '@mui/icons-material';
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import type { LoginRequest } from '../../types/auth.types';

/**
 * Página de Login - Migrada de F_AC1000.frm (VB6)
 * Funcionalidad original:
 * - TextUSUARIO: Campo de usuario
 * - TextPASSWORD: Campo de contraseña
 * - CommandAceptar: Botón para iniciar sesión
 * - CommandCancelar: Botón para cancelar
 * - Validación de credenciales contra tabla USR
 * - Registro en bitácora BIT_IOS
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, cambiarPassword, verificar2FA } = useAuth();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Estado del formulario
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para cambio de contraseña
  const [showCambiarPassword, setShowCambiarPassword] = useState(false);
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [showNuevoPassword, setShowNuevoPassword] = useState(false);

  // Estado para verificación 2FA
  const [show2FA, setShow2FA] = useState(false);
  const [codigo2FA, setCodigo2FA] = useState('');
  const [tokenTemporal2FA, setTokenTemporal2FA] = useState('');

  /**
   * Maneja el submit del formulario
   * Equivalente a CommandAceptar_Click en VB6
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const request: LoginRequest = {
        usuario: usuario.toUpperCase(),
        password,
      };

      const response = await login(request);

      if (response.exitoso) {
        navigate('/principal');
      } else if (response.requiere2FA && response.tokenTemporal2FA) {
        setTokenTemporal2FA(response.tokenTemporal2FA);
        setShow2FA(true);
        setError('Se requiere verificación en dos pasos. Ingrese el código de su app autenticadora.');
      } else if (response.requiereCambioPassword) {
        setShowCambiarPassword(true);
      } else {
        setError(response.mensaje || 'Error al iniciar sesión');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja el cambio de contraseña
   */
  const handleCambiarPassword = async () => {
    if (nuevoPassword !== confirmarPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (nuevoPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: LoginRequest = {
        usuario: usuario.toUpperCase(),
        password,
        cambiarPassword: true,
        nuevoPassword,
      };

      const response = await cambiarPassword(request);

      if (response.exitoso) {
        setShowCambiarPassword(false);
        navigate('/principal');
      } else {
        setError(response.mensaje || 'Error al cambiar contraseña');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar2FA = async () => {
    if (!codigo2FA.trim()) {
      setError('Debe ingresar el código 2FA.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verificar2FA(usuario.toUpperCase(), codigo2FA.trim(), tokenTemporal2FA);

      if (response.exitoso) {
        setShow2FA(false);
        navigate('/principal');
      } else {
        setError(response.mensaje || 'Código 2FA inválido');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error de conexión con el servidor';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancela y cierra la aplicación
   * Equivalente a CommandCancelar_Click en VB6
   */
  const handleCancelar = () => {
    window.close();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode
          ? theme.palette.background.default
          : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        padding: 2,
        transition: 'background 0.3s ease',
      }}
    >
      {/* Toggle de tema en esquina superior derecha */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
        }}
      >
        <ThemeToggle color={isDarkMode ? 'default' : 'inherit'} />
      </Box>
      <Card
        sx={{
          minWidth: 350,
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Título */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <VpnKey sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5" component="h1" fontWeight="bold">
              Sistema de Factoring
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ingrese sus credenciales
            </Typography>
          </Box>

          {/* Mensaje de error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            {/* Campo Usuario - TextUSUARIO */}
            <TextField
              fullWidth
              label="Usuario"
              variant="outlined"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
              autoFocus
            />

            {/* Campo Password - TextPASSWORD */}
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* CommandAceptar */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !usuario || !password}
              >
                {loading ? <CircularProgress size={24} /> : 'Ingresar'}
              </Button>

              {/* CommandCancelar */}
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleCancelar}
                disabled={loading}
              >
                Cancelar
              </Button>
            </Box>
          </form>

          {/* Versión */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            Versión 2.0 - React Migration
          </Typography>
        </CardContent>
      </Card>

      {/* Diálogo Cambiar Contraseña */}
      <Dialog open={showCambiarPassword} onClose={() => setShowCambiarPassword(false)}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Su contraseña ha expirado. Por favor ingrese una nueva contraseña.
          </Typography>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type={showNuevoPassword ? 'text' : 'password'}
            value={nuevoPassword}
            onChange={(e) => setNuevoPassword(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNuevoPassword(!showNuevoPassword)}>
                    {showNuevoPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type={showNuevoPassword ? 'text' : 'password'}
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCambiarPassword(false)}>Cancelar</Button>
          <Button onClick={handleCambiarPassword} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Cambiar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de verificación 2FA */}
      <Dialog open={show2FA} onClose={() => setShow2FA(false)}>
        <DialogTitle>Verificación de seguridad</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Ingrese el código de 6 dígitos de su app autenticadora para continuar.
          </Typography>
          <TextField
            fullWidth
            label="Código 2FA"
            value={codigo2FA}
            onChange={(e) => setCodigo2FA(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow2FA(false)}>Cancelar</Button>
          <Button onClick={handleVerificar2FA} variant="contained" disabled={loading || !codigo2FA.trim()}>
            {loading ? <CircularProgress size={24} /> : 'Verificar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
