// =============================================
// Formulario Deudor - Módulo 3
// Detalle y edición de deudores (Migrado de F_CD1200.frm)
// =============================================

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Description as DocIcon,
  AccountBalance as DeudorIcon,
  Person as ClienteIcon
} from '@mui/icons-material';
import deudorService, {
  type DeudorCreate,
  type Deudorupdate,
  type DeudorTelefono,
  tiposComunicacion,
  categoriasRiesgo,
  estadosDeudor,
  formatCurrency,
  getMontoDisponible,
  getCategoriaColor
} from '../../services/deudor.service';
import { clienteService } from '../../services/cliente.service';
import { parametroService } from '../../services/parametro.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`deudor-tabpanel-${index}`}
      aria-labelledby={`deudor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface ClienteOption {
  rutCliente: number;
  razonSocial: string;
}

interface ComunaOption {
  codigo: number;
  descripcion: string;
}

export default function DeudorForm() {
  const navigate = useNavigate();
  const { rutCliente, rutDeudor } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(rutCliente && rutDeudor);

  // Estados del formulario
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Datos del deudor
  const [formData, setFormData] = useState<{
    rutCliente: number | '';
    rutDeudor: string;
    razonSocial: string;
    direccion: string;
    codigoComuna: number | '';
    estadoDeudor: number;
    contactoCobranza: string;
    porcentajeVentas: number;
    notificacion: string;
    montoOtorgado: number;
    montoOcupado: number;
    categoriaRiesgo: number;
    giroDeudor: string;
  }>({
    rutCliente: '',
    rutDeudor: '',
    razonSocial: '',
    direccion: '',
    codigoComuna: '',
    estadoDeudor: 1,
    contactoCobranza: '',
    porcentajeVentas: 0,
    notificacion: '',
    montoOtorgado: 0,
    montoOcupado: 0,
    categoriaRiesgo: 1,
    giroDeudor: ''
  });

  // Teléfonos
  const [telefonos, setTelefonos] = useState<DeudorTelefono[]>([]);
  const [telefonoDialog, setTelefonoDialog] = useState(false);
  const [nuevoTelefono, setNuevoTelefono] = useState<DeudorTelefono>({
    tipoComunicacion: 1,
    descripcion: '',
    numeroComunicacion: ''
  });

  // Opciones para selects
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [comunas, setComunas] = useState<ComunaOption[]>([]);

  // Cargar opciones
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Cargar clientes
        const clientesData = await clienteService.getAll();
        setClientes(clientesData.map((c: { rutCliente: number; nombreCompleto: string }) => ({
          rutCliente: c.rutCliente,
          razonSocial: c.nombreCompleto
        })));

        // Cargar comunas (tabla PAR, código 1)
        const comunasData = await parametroService.getByTabla(1);
        setComunas(comunasData.map((p: { codigoElemento: number; descripcion: string }) => ({
          codigo: p.codigoElemento,
          descripcion: p.descripcion
        })));
      } catch (err) {
        console.error('Error cargando opciones:', err);
      }
    };
    loadOptions();
  }, []);

  // Cargar cliente desde URL si es nuevo
  useEffect(() => {
    const clienteParam = searchParams.get('cliente');
    if (!isEditing && clienteParam) {
      setFormData(prev => ({ ...prev, rutCliente: parseInt(clienteParam) }));
    }
  }, [isEditing, searchParams]);

  // Cargar datos si es edición
  useEffect(() => {
    if (isEditing) {
      loadDeudor();
    }
  }, [rutCliente, rutDeudor]);

  const loadDeudor = async () => {
    try {
      setLoading(true);
      setError(null);
      const deudor = await deudorService.getById(parseInt(rutCliente!), parseInt(rutDeudor!));
      
      setFormData({
        rutCliente: deudor.rutCliente,
        rutDeudor: deudor.rutFormateado,
        razonSocial: deudor.razonSocial,
        direccion: deudor.direccion || '',
        codigoComuna: deudor.codigoComuna || '',
        estadoDeudor: deudor.estadoDeudor || 1,
        contactoCobranza: deudor.contactoCobranza || '',
        porcentajeVentas: deudor.porcentajeVentas || 0,
        notificacion: deudor.notificacion || '',
        montoOtorgado: deudor.montoOtorgado,
        montoOcupado: deudor.montoOcupado,
        categoriaRiesgo: deudor.categoriaRiesgo || 1,
        giroDeudor: deudor.giroDeudor || ''
      });

      setTelefonos(deudor.telefonos || []);
    } catch (err: any) {
      console.error('Error cargando deudor:', err);
      setError(err.response?.data?.message || 'Error al cargar deudor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rutCliente) {
      setError('Debe seleccionar un cliente');
      return;
    }

    if (!formData.rutDeudor) {
      setError('Debe ingresar el RUT del deudor');
      return;
    }

    if (!formData.razonSocial) {
      setError('Debe ingresar la razón social');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isEditing) {
        const UpdateData: Deudorupdate = {
          razonSocial: formData.razonSocial,
          direccion: formData.direccion,
          codigoComuna: formData.codigoComuna !== '' ? formData.codigoComuna as number : undefined,
          estadoDeudor: formData.estadoDeudor,
          contactoCobranza: formData.contactoCobranza,
          porcentajeVentas: formData.porcentajeVentas,
          notificacion: formData.notificacion,
          montoOtorgado: formData.montoOtorgado,
          categoriaRiesgo: formData.categoriaRiesgo,
          giroDeudor: formData.giroDeudor
        };
        await deudorService.update(parseInt(rutCliente!), parseInt(rutDeudor!), UpdateData);
        setSuccess('Deudor actualizado correctamente');
      } else {
        const createData: DeudorCreate = {
          rutCliente: formData.rutCliente as number,
          rutDeudor: formData.rutDeudor,
          razonSocial: formData.razonSocial,
          direccion: formData.direccion,
          codigoComuna: formData.codigoComuna !== '' ? formData.codigoComuna as number : undefined,
          contactoCobranza: formData.contactoCobranza,
          porcentajeVentas: formData.porcentajeVentas,
          notificacion: formData.notificacion,
          montoOtorgado: formData.montoOtorgado,
          categoriaRiesgo: formData.categoriaRiesgo,
          giroDeudor: formData.giroDeudor,
          telefonos: telefonos.map(t => ({
            tipoComunicacion: t.tipoComunicacion,
            descripcion: t.descripcion,
            numeroComunicacion: t.numeroComunicacion
          }))
        };
        const created = await deudorService.create(createData);
        setSuccess('Deudor creado correctamente');
        // Redirigir a la edición del deudor creado
        setTimeout(() => {
          navigate(`/deudores/${created.rutCliente}/${created.rutDeudor}`);
        }, 1000);
      }
    } catch (err: any) {
      console.error('Error guardando deudor:', err);
      setError(err.response?.data?.message || 'Error al guardar deudor');
    } finally {
      setSaving(false);
    }
  };

  // Funciones para teléfonos
  const handleAddTelefono = () => {
    if (!nuevoTelefono.numeroComunicacion) {
      setError('Debe ingresar el número');
      return;
    }

    if (isEditing) {
      // Guardar en el servidor
      deudorService.addTelefono(parseInt(rutCliente!), parseInt(rutDeudor!), {
        tipoComunicacion: nuevoTelefono.tipoComunicacion,
        descripcion: nuevoTelefono.descripcion,
        numeroComunicacion: nuevoTelefono.numeroComunicacion
      }).then(() => {
        loadDeudor();
        setTelefonoDialog(false);
        setNuevoTelefono({ tipoComunicacion: 1, descripcion: '', numeroComunicacion: '' });
      }).catch(err => {
        setError(err.response?.data?.message || 'Error al agregar teléfono');
      });
    } else {
      // Agregar a la lista local
      setTelefonos([...telefonos, { ...nuevoTelefono }]);
      setTelefonoDialog(false);
      setNuevoTelefono({ tipoComunicacion: 1, descripcion: '', numeroComunicacion: '' });
    }
  };

  const handleDeleteTelefono = (telefono: DeudorTelefono) => {
    if (isEditing) {
      deudorService.deleteTelefono(
        parseInt(rutCliente!), 
        parseInt(rutDeudor!), 
        telefono.tipoComunicacion, 
        telefono.numeroComunicacion
      ).then(() => {
        loadDeudor();
      }).catch(err => {
        setError(err.response?.data?.message || 'Error al eliminar teléfono');
      });
    } else {
      setTelefonos(telefonos.filter(t => 
        t.tipoComunicacion !== telefono.tipoComunicacion || 
        t.numeroComunicacion !== telefono.numeroComunicacion
      ));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DeudorIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              {isEditing ? 'Editar Deudor' : 'Nuevo Deudor'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing 
                ? `${formData.rutDeudor} - ${formData.razonSocial}`
                : 'Registrar nuevo deudor en el sistema'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/deudores')}
          >
            Volver
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      </Box>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Resumen de montos (solo en edición) */}
      {isEditing && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Monto Otorgado</Typography>
                <Typography variant="h5" color="primary">
                  {formatCurrency(formData.montoOtorgado)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Monto Ocupado</Typography>
                <Typography variant="h5" color="warning.main">
                  {formatCurrency(formData.montoOcupado)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>Disponible</Typography>
                <Typography variant="h5" color="success.main">
                  {formatCurrency(getMontoDisponible(formData.montoOtorgado, formData.montoOcupado))}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Datos Generales" icon={<DeudorIcon />} iconPosition="start" />
          <Tab label="Teléfonos" icon={<PhoneIcon />} iconPosition="start" />
          {isEditing && <Tab label="Documentos" icon={<DocIcon />} iconPosition="start" />}
        </Tabs>

        {/* Tab: Datos Generales */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Cliente */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required disabled={isEditing}>
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={formData.rutCliente}
                  label="Cliente"
                  onChange={(e) => handleChange('rutCliente', e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <ClienteIcon />
                    </InputAdornment>
                  }
                >
                  {clientes.map((c) => (
                    <MenuItem key={c.rutCliente} value={c.rutCliente}>
                      {c.razonSocial}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* RUT Deudor */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="RUT Deudor"
                value={formData.rutDeudor}
                onChange={(e) => handleChange('rutDeudor', e.target.value)}
                placeholder="12345678-9"
                disabled={isEditing}
                helperText={!isEditing ? 'Formato: 12345678-9' : ''}
              />
            </Grid>

            {/* Razón Social */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Razón Social"
                value={formData.razonSocial}
                onChange={(e) => handleChange('razonSocial', e.target.value.toUpperCase())}
              />
            </Grid>

            {/* Giro */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Giro / Actividad Económica"
                value={formData.giroDeudor}
                onChange={(e) => handleChange('giroDeudor', e.target.value.toUpperCase())}
              />
            </Grid>

            {/* Dirección */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.direccion}
                onChange={(e) => handleChange('direccion', e.target.value.toUpperCase())}
              />
            </Grid>

            {/* Comuna */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Comuna</InputLabel>
                <Select
                  value={formData.codigoComuna}
                  label="Comuna"
                  onChange={(e) => handleChange('codigoComuna', e.target.value)}
                >
                  <MenuItem value="">Seleccione...</MenuItem>
                  {comunas.map((c) => (
                    <MenuItem key={c.codigo} value={c.codigo}>
                      {c.descripcion}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Información Comercial
              </Typography>
            </Grid>

            {/* Monto Otorgado */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Monto Otorgado"
                type="number"
                value={formData.montoOtorgado}
                onChange={(e) => handleChange('montoOtorgado', parseFloat(e.target.value) || 0)}
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }
                }}
              />
            </Grid>

            {/* Categoría Riesgo */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Categoría de Riesgo</InputLabel>
                <Select
                  value={formData.categoriaRiesgo}
                  label="Categoría de Riesgo"
                  onChange={(e) => handleChange('categoriaRiesgo', e.target.value)}
                >
                  {categoriasRiesgo.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      <Chip 
                        label={c.label} 
                        color={getCategoriaColor(c.value)} 
                        size="small" 
                        sx={{ mr: 1 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Estado */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estadoDeudor}
                  label="Estado"
                  onChange={(e) => handleChange('estadoDeudor', e.target.value)}
                >
                  {estadosDeudor.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Contacto Cobranza */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contacto de Cobranza"
                value={formData.contactoCobranza}
                onChange={(e) => handleChange('contactoCobranza', e.target.value)}
              />
            </Grid>

            {/* Porcentaje Ventas */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Porcentaje de Ventas"
                type="number"
                value={formData.porcentajeVentas}
                onChange={(e) => handleChange('porcentajeVentas', parseFloat(e.target.value) || 0)}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }
                }}
              />
            </Grid>

            {/* Notificación */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notificación / Observaciones"
                value={formData.notificacion}
                onChange={(e) => handleChange('notificacion', e.target.value)}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Teléfonos */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTelefonoDialog(true)}
            >
              Agregar Teléfono
            </Button>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {telefonos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No hay teléfonos registrados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  telefonos.map((tel, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip 
                          label={tiposComunicacion.find(t => t.value === tel.tipoComunicacion)?.label || 'Otro'} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{tel.descripcion || '-'}</TableCell>
                      <TableCell>{tel.numeroComunicacion}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTelefono(tel)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Tab: Documentos (solo edición) */}
        {isEditing && (
          <TabPanel value={tabValue} index={2}>
            <Alert severity="info">
              La gestión de documentos estará disponible en una próxima versión.
            </Alert>
          </TabPanel>
        )}
      </Paper>

      {/* Dialog para agregar teléfono */}
      <Dialog open={telefonoDialog} onClose={() => setTelefonoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Teléfono</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={nuevoTelefono.tipoComunicacion}
                  label="Tipo"
                  onChange={(e) => setNuevoTelefono({ ...nuevoTelefono, tipoComunicacion: e.target.value as number })}
                >
                  {tiposComunicacion.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Número"
                value={nuevoTelefono.numeroComunicacion}
                onChange={(e) => setNuevoTelefono({ ...nuevoTelefono, numeroComunicacion: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción / Contacto"
                value={nuevoTelefono.descripcion}
                onChange={(e) => setNuevoTelefono({ ...nuevoTelefono, descripcion: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTelefonoDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddTelefono}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
