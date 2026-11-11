import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  AccountBalance as BankIcon,
  Groups as GroupsIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  clienteService,
  type ClienteCreateDto,
  type ClienteupdateDto,
  type ClienteTelefonoDto,
  type ClienteTelefonoCreateDto,
  type ClienteContactoDto,
  type ClienteContactoCreateDto,
  type ClienteBancoDto,
  type ClienteBancoCreateDto,
  rutUtils,
  TIPO_CLIENTE,
  TIPO_TELEFONO,
  TIPO_CUENTA,
} from '../../services/cliente.service';
import ClienteOrganigrama from '../../components/cliente/ClienteOrganigrama';
import ClienteEmpresas from '../../components/cliente/ClienteEmpresas';

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
      id={`cliente-tabpanel-${index}`}
      aria-labelledby={`cliente-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const ClienteForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { rut } = useParams<{ rut?: string }>();
  const isEditing = Boolean(rut) && rut !== 'nuevo';
  const isReadOnly = Boolean(rut) && !location.pathname.includes('/editar') && !location.pathname.endsWith('/nuevo');

  // Estado principal
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Datos del cliente
  const [formData, setFormData] = useState<ClienteCreateDto & { estadoCliente?: number }>({
    rutCliente: 0,
    digitoVerificador: '',
    tipoCliente: TIPO_CLIENTE.NATURAL,
    razonSocial: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    sexo: 1,
    direccion: '',
    codigoComuna: undefined,
    codigoGiro: undefined,
    codigoPostal: '',
    correoElectronico: '',
    codigoEjecutivo: '',
    codigoSucursal: '',
    observaciones: '',
    codigoActividad: undefined,
    estadoCliente: 1,
  });

  // RUT input
  const [rutInput, setRutInput] = useState('');
  const [rutValid, setRutValid] = useState<boolean | null>(null);

  // Datos relacionados
  const [telefonos, setTelefonos] = useState<ClienteTelefonoDto[]>([]);
  const [contactos, setContactos] = useState<ClienteContactoDto[]>([]);
  const [bancos, setBancos] = useState<ClienteBancoDto[]>([]);

  // Diálogos
  const [telefonoDialogOpen, setTelefonoDialogOpen] = useState(false);
  const [contactoDialogOpen, setContactoDialogOpen] = useState(false);
  const [bancoDialogOpen, setBancoDialogOpen] = useState(false);

  // Formularios de diálogos
  const [nuevoTelefono, setNuevoTelefono] = useState<ClienteTelefonoCreateDto>({
    tipoTelefono: TIPO_TELEFONO.FIJO,
    numeroTelefono: '',
    observacion: '',
  });

  const [nuevoContacto, setNuevoContacto] = useState<ClienteContactoCreateDto>({
    nombreContacto: '',
    cargo: '',
    telefono: '',
    celular: '',
    email: '',
    observaciones: '',
  });

  const [nuevoBanco, setNuevoBanco] = useState<ClienteBancoCreateDto>({
    codigoBanco: 0,
    tipoCuenta: TIPO_CUENTA.CORRIENTE,
    numeroCuenta: '',
  });

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (isEditing && rut) {
      cargarCliente(parseInt(rut, 10));
    }
  }, [isEditing, rut]);

  const cargarCliente = async (rutCliente: number) => {
    setLoading(true);
    setError(null);
    try {
      const [clienteData, telefonosData, contactosData, bancosData] = await Promise.all([
        clienteService.getByRut(rutCliente),
        clienteService.getTelefonos(rutCliente),
        clienteService.getContactos(rutCliente),
        clienteService.getBancos(rutCliente),
      ]);

      setFormData({
        rutCliente: clienteData.rutCliente,
        digitoVerificador: clienteData.digitoVerificador,
        tipoCliente: clienteData.tipoCliente,
        razonSocial: clienteData.razonSocial,
        apellidoPaterno: clienteData.apellidoPaterno,
        apellidoMaterno: clienteData.apellidoMaterno,
        sexo: 1,
        direccion: clienteData.direccion ?? '',
        codigoComuna: clienteData.codigoComuna,
        codigoGiro: clienteData.codigoGiro,
        codigoPostal: clienteData.codigoPostal ?? '',
        correoElectronico: clienteData.correoElectronico,
        codigoEjecutivo: clienteData.codigoEjecutivo,
        codigoSucursal: clienteData.codigoSucursal,
        observaciones: clienteData.observaciones,
        codigoActividad: clienteData.codigoActividad,
        estadoCliente: clienteData.estadoCliente,
      });
      setRutInput(clienteData.rutFormateado);
      setRutValid(true);
      setTelefonos(telefonosData);
      setContactos(contactosData);
      setBancos(bancosData);
    } catch (err) {
      console.error('Error cargando cliente:', err);
      setError('Error al cargar los datos del cliente.');
    } finally {
      setLoading(false);
    }
  };

  // Validar RUT
  const handleRutChange = (value: string) => {
    setRutInput(value);

    if (value.length < 2) {
      setRutValid(null);
      return;
    }

    const isValid = rutUtils.validar(value);
    setRutValid(isValid);

    if (isValid) {
      const parsed = rutUtils.limpiar(value);
      if (parsed) {
        setFormData((prev) => ({
          ...prev,
          rutCliente: parsed.rut,
          digitoVerificador: parsed.dv,
        }));
      }
    }
  };

  // Guardar cliente
  const handleGuardar = async () => {
    setError(null);
    setSuccess(null);

    if (isReadOnly) {
      setError('Este cliente está en modo de solo lectura.');
      return;
    }

    // Validaciones
    if (!isEditing && !rutValid) {
      setError('El RUT ingresado no es válido.');
      return;
    }

    if (!formData.razonSocial.trim()) {
      setError('La razón social es requerida.');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        const UpdateData: ClienteupdateDto = {
          tipoCliente: formData.tipoCliente,
          razonSocial: formData.razonSocial,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          sexo: formData.sexo,
          direccion: formData.direccion,
          codigoComuna: formData.codigoComuna,
          codigoGiro: formData.codigoGiro,
          codigoPostal: formData.codigoPostal,
          correoElectronico: formData.correoElectronico,
          codigoEjecutivo: formData.codigoEjecutivo,
          codigoSucursal: formData.codigoSucursal,
          observaciones: formData.observaciones,
          codigoActividad: formData.codigoActividad,
          estadoCliente: formData.estadoCliente || 1,
        };
        await clienteService.update(formData.rutCliente, UpdateData);
        setSuccess('Cliente actualizado correctamente.');
      } else {
        const createData: ClienteCreateDto = {
          rutCliente: formData.rutCliente,
          digitoVerificador: formData.digitoVerificador,
          tipoCliente: formData.tipoCliente,
          razonSocial: formData.razonSocial,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          sexo: formData.sexo,
          direccion: formData.direccion,
          codigoComuna: formData.codigoComuna,
          codigoGiro: formData.codigoGiro,
          codigoPostal: formData.codigoPostal,
          correoElectronico: formData.correoElectronico,
          codigoEjecutivo: formData.codigoEjecutivo,
          codigoSucursal: formData.codigoSucursal,
          observaciones: formData.observaciones,
          codigoActividad: formData.codigoActividad,
        };
        const nuevoCliente = await clienteService.create(createData);
        setSuccess('Cliente creado correctamente.');
        // Redirigir a edición del cliente creado
        setTimeout(() => {
          navigate(`/clientes/${nuevoCliente.rutCliente}/editar`);
        }, 1500);
      }
    } catch (err: unknown) {
      console.error('Error guardando cliente:', err);
      const apiError = err as { response?: { data?: { mensaje?: string; message?: string } } };
        setError(apiError?.response?.data?.mensaje || apiError?.response?.data?.message || 'Error al guardar el cliente.');
    } finally {
      setSaving(false);
    }
  };

  // Funciones para teléfonos
  const handleAgregarTelefono = async () => {
    if (!nuevoTelefono.numeroTelefono.trim()) {
      setError('El número de teléfono es requerido.');
      return;
    }

    try {
      await clienteService.addTelefono(formData.rutCliente, nuevoTelefono);
      const telefonosActualizados = await clienteService.getTelefonos(formData.rutCliente);
      setTelefonos(telefonosActualizados);
      setTelefonoDialogOpen(false);
      setNuevoTelefono({ tipoTelefono: TIPO_TELEFONO.FIJO, numeroTelefono: '', observacion: '' });
      setSuccess('Teléfono agregado correctamente.');
    } catch (err) {
      console.error('Error agregando teléfono:', err);
      setError('Error al agregar el teléfono.');
    }
  };

  const handleEliminarTelefono = async (tipo: number, numero: string) => {
    if (!window.confirm('¿Está seguro de eliminar este teléfono?')) return;

    try {
      await clienteService.deleteTelefono(formData.rutCliente, tipo, numero);
      setTelefonos((prev) =>
        prev.filter((t) => !(t.tipoTelefono === tipo && t.numeroTelefono === numero))
      );
      setSuccess('Teléfono eliminado correctamente.');
    } catch (err) {
      console.error('Error eliminando teléfono:', err);
      setError('Error al eliminar el teléfono.');
    }
  };

  // Funciones para contactos
  const handleAgregarContacto = async () => {
    if (!nuevoContacto.nombreContacto.trim()) {
      setError('El nombre del contacto es requerido.');
      return;
    }

    try {
      await clienteService.addContacto(formData.rutCliente, nuevoContacto);
      const contactosActualizados = await clienteService.getContactos(formData.rutCliente);
      setContactos(contactosActualizados);
      setContactoDialogOpen(false);
      setNuevoContacto({
        nombreContacto: '',
        cargo: '',
        telefono: '',
        celular: '',
        email: '',
        observaciones: '',
      });
      setSuccess('Contacto agregado correctamente.');
    } catch (err) {
      console.error('Error agregando contacto:', err);
      setError('Error al agregar el contacto.');
    }
  };

  const handleEliminarContacto = async (numeroContacto: number) => {
    if (!window.confirm('¿Está seguro de eliminar este contacto?')) return;

    try {
      await clienteService.deleteContacto(formData.rutCliente, numeroContacto);
      setContactos((prev) => prev.filter((c) => c.numeroContacto !== numeroContacto));
      setSuccess('Contacto eliminado correctamente.');
    } catch (err) {
      console.error('Error eliminando contacto:', err);
      setError('Error al eliminar el contacto.');
    }
  };

  // Funciones para bancos
  const handleAgregarBanco = async () => {
    if (!nuevoBanco.numeroCuenta.trim()) {
      setError('El número de cuenta es requerido.');
      return;
    }

    try {
      await clienteService.addBanco(formData.rutCliente, nuevoBanco);
      const bancosActualizados = await clienteService.getBancos(formData.rutCliente);
      setBancos(bancosActualizados);
      setBancoDialogOpen(false);
      setNuevoBanco({ codigoBanco: 0, tipoCuenta: TIPO_CUENTA.CORRIENTE, numeroCuenta: '' });
      setSuccess('Cuenta bancaria agregada correctamente.');
    } catch (err) {
      console.error('Error agregando banco:', err);
      setError('Error al agregar la cuenta bancaria.');
    }
  };

  const handleEliminarBanco = async (codigoBanco: number, numeroCuenta: string) => {
    if (!window.confirm('¿Está seguro de eliminar esta cuenta bancaria?')) return;

    try {
      await clienteService.deleteBanco(formData.rutCliente, codigoBanco, numeroCuenta);
      setBancos((prev) =>
        prev.filter((b) => !(b.codigoBanco === codigoBanco && b.numeroCuenta === numeroCuenta))
      );
      setSuccess('Cuenta bancaria eliminada correctamente.');
    } catch (err) {
      console.error('Error eliminando banco:', err);
      setError('Error al eliminar la cuenta bancaria.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/clientes')}
          underline="hover"
        >
          Clientes
        </Link>
        <Typography color="text.primary">
          {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
        </Typography>
      </Breadcrumbs>

      {/* Título */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      </Typography>

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

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Datos Generales" icon={<PersonIcon />} iconPosition="start" />
          <Tab
            label="Teléfonos"
            icon={<PhoneIcon />}
            iconPosition="start"
            disabled={!isEditing || isReadOnly}
          />
          <Tab
            label="Contactos"
            icon={<PersonIcon />}
            iconPosition="start"
            disabled={!isEditing || isReadOnly}
          />
          <Tab
            label="Bancos"
            icon={<BankIcon />}
            iconPosition="start"
            disabled={!isEditing || isReadOnly}
          />
          <Tab
            label="Organigrama"
            icon={<GroupsIcon />}
            iconPosition="start"
            disabled={!isEditing || isReadOnly}
          />
          <Tab
            label="Empresas Relacionadas"
            icon={<BusinessIcon />}
            iconPosition="start"
            disabled={!isEditing || isReadOnly}
          />
        </Tabs>

        {/* Tab: Datos Generales */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* RUT */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="RUT"
                placeholder="Ej: 12.345.678-9"
                value={rutInput}
                onChange={(e) => handleRutChange(e.target.value)}
                disabled={isEditing || isReadOnly}
                error={rutValid === false}
                helperText={
                  rutValid === false
                    ? 'RUT inválido'
                    : rutValid === true
                    ? 'RUT válido'
                    : ''
                }
                color={rutValid === true ? 'success' : undefined}
              />
            </Grid>

            {/* Tipo Cliente */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo Cliente</InputLabel>
                <Select
                  value={formData.tipoCliente}
                  label="Tipo Cliente"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tipoCliente: e.target.value as number }))
                  }
                >
                  <MenuItem value={TIPO_CLIENTE.NATURAL}>Natural</MenuItem>
                  <MenuItem value={TIPO_CLIENTE.JURIDICO}>Jurídico</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Estado */}
            {isEditing && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={formData.estadoCliente || 1}
                    label="Estado"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, estadoCliente: e.target.value as number }))
                    }
                  >
                    <MenuItem value={1}>Activo</MenuItem>
                    <MenuItem value={0}>Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Razón Social */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Razón Social / Nombre"
                value={formData.razonSocial}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, razonSocial: e.target.value }))
                }
                required
              />
            </Grid>

            {/* Apellidos (solo persona natural) */}
            {formData.tipoCliente === TIPO_CLIENTE.NATURAL && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Apellido Paterno"
                    value={formData.apellidoPaterno || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, apellidoPaterno: e.target.value }))
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Apellido Materno"
                    value={formData.apellidoMaterno || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, apellidoMaterno: e.target.value }))
                    }
                  />
                </Grid>
              </>
            )}

            {/* Dirección */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Dirección"
                value={formData.direccion || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, direccion: e.target.value }))
                }
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={formData.correoElectronico || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, correoElectronico: e.target.value }))
                }
              />
            </Grid>

            {/* Ejecutivo */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Código Ejecutivo"
                value={formData.codigoEjecutivo || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, codigoEjecutivo: e.target.value }))
                }
              />
            </Grid>

            {/* Observaciones */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                value={formData.observaciones || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, observaciones: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab: Teléfonos */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTelefonoDialogOpen(true)}
            >
              Agregar Teléfono
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Número</TableCell>
                  <TableCell>Observación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {telefonos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay teléfonos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  telefonos.map((tel, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{tel.tipoTelefonoDescripcion}</TableCell>
                      <TableCell>{tel.numeroTelefono}</TableCell>
                      <TableCell>{tel.observacion || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleEliminarTelefono(tel.tipoTelefono, tel.numeroTelefono)
                          }
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

        {/* Tab: Contactos */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setContactoDialogOpen(true)}
            >
              Agregar Contacto
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contactos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No hay contactos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  contactos.map((con) => (
                    <TableRow key={con.numeroContacto}>
                      <TableCell>{con.nombreContacto}</TableCell>
                      <TableCell>{con.cargo || '-'}</TableCell>
                      <TableCell>{con.telefono || con.celular || '-'}</TableCell>
                      <TableCell>{con.email || '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleEliminarContacto(con.numeroContacto)}
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

        {/* Tab: Bancos */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setBancoDialogOpen(true)}
            >
              Agregar Cuenta
            </Button>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Banco</TableCell>
                  <TableCell>Tipo Cuenta</TableCell>
                  <TableCell>Número Cuenta</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bancos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No hay cuentas bancarias registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  bancos.map((bco, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{bco.nombreBanco || `Código ${bco.codigoBanco}`}</TableCell>
                      <TableCell>{bco.tipoCuentaDescripcion}</TableCell>
                      <TableCell>{bco.numeroCuenta}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            handleEliminarBanco(bco.codigoBanco, bco.numeroCuenta)
                          }
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

        {/* Tab: Organigrama (F_CC1750.frm) */}
        <TabPanel value={tabValue} index={4}>
          {isEditing && formData.rutCliente && (
            <ClienteOrganigrama rutCliente={formData.rutCliente} />
          )}
        </TabPanel>

        {/* Tab: Empresas Relacionadas (F_CC1760.frm) */}
        <TabPanel value={tabValue} index={5}>
          {isEditing && formData.rutCliente && (
            <ClienteEmpresas rutCliente={formData.rutCliente} />
          )}
        </TabPanel>
      </Paper>

      {/* Botones de acción */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('/clientes')}>
          Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleGuardar}
          disabled={saving || isReadOnly}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Box>

      {/* Dialog: Agregar Teléfono */}
      <Dialog open={telefonoDialogOpen} onClose={() => setTelefonoDialogOpen(false)}>
        <DialogTitle>Agregar Teléfono</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={nuevoTelefono.tipoTelefono}
                  label="Tipo"
                  onChange={(e) =>
                    setNuevoTelefono((prev) => ({
                      ...prev,
                      tipoTelefono: e.target.value as number,
                    }))
                  }
                >
                  <MenuItem value={TIPO_TELEFONO.FIJO}>Fijo</MenuItem>
                  <MenuItem value={TIPO_TELEFONO.CELULAR}>Celular</MenuItem>
                  <MenuItem value={TIPO_TELEFONO.FAX}>Fax</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Número"
                value={nuevoTelefono.numeroTelefono}
                onChange={(e) =>
                  setNuevoTelefono((prev) => ({ ...prev, numeroTelefono: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Observación"
                value={nuevoTelefono.observacion || ''}
                onChange={(e) =>
                  setNuevoTelefono((prev) => ({ ...prev, observacion: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTelefonoDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAgregarTelefono}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Agregar Contacto */}
      <Dialog
        open={contactoDialogOpen}
        onClose={() => setContactoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Agregar Contacto</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={nuevoContacto.nombreContacto}
                onChange={(e) =>
                  setNuevoContacto((prev) => ({ ...prev, nombreContacto: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Cargo"
                value={nuevoContacto.cargo || ''}
                onChange={(e) =>
                  setNuevoContacto((prev) => ({ ...prev, cargo: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                value={nuevoContacto.email || ''}
                onChange={(e) =>
                  setNuevoContacto((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={nuevoContacto.telefono || ''}
                onChange={(e) =>
                  setNuevoContacto((prev) => ({ ...prev, telefono: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Celular"
                value={nuevoContacto.celular || ''}
                onChange={(e) =>
                  setNuevoContacto((prev) => ({ ...prev, celular: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactoDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAgregarContacto}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Agregar Banco */}
      <Dialog open={bancoDialogOpen} onClose={() => setBancoDialogOpen(false)}>
        <DialogTitle>Agregar Cuenta Bancaria</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Código Banco"
                type="number"
                value={nuevoBanco.codigoBanco || ''}
                onChange={(e) =>
                  setNuevoBanco((prev) => ({ ...prev, codigoBanco: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Tipo Cuenta</InputLabel>
                <Select
                  value={nuevoBanco.tipoCuenta}
                  label="Tipo Cuenta"
                  onChange={(e) =>
                    setNuevoBanco((prev) => ({ ...prev, tipoCuenta: e.target.value as number }))
                  }
                >
                  <MenuItem value={TIPO_CUENTA.CORRIENTE}>Corriente</MenuItem>
                  <MenuItem value={TIPO_CUENTA.AHORRO}>Ahorro</MenuItem>
                  <MenuItem value={TIPO_CUENTA.VISTA}>Vista</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Número Cuenta"
                value={nuevoBanco.numeroCuenta}
                onChange={(e) =>
                  setNuevoBanco((prev) => ({ ...prev, numeroCuenta: e.target.value }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBancoDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAgregarBanco}>
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClienteForm;
