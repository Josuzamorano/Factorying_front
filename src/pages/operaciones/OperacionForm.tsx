import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
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
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import operacionService from '../../services/operacion.service';
import type { 
  CreateOperacionDto, 
  CreateDocumentoDto,
  TipoGasto 
} from '../../services/operacion.service';
import { clienteService } from '../../services/cliente.service';
import type { ClienteListDto } from '../../services/cliente.service';
import deudorService from '../../services/deudor.service';
import type { DeudorList } from '../../services/deudor.service';
import bancoService from '../../services/banco.service';
import type { Banco } from '../../services/banco.service';

// Tipos de documento
const tiposDocumento = [
  { codigo: 1, descripcion: 'Factura' },
  { codigo: 2, descripcion: 'Cheque' },
  { codigo: 3, descripcion: 'Letra' },
  { codigo: 4, descripcion: 'Otro' },
];


// Tipos de moneda
const tiposMoneda = [
  { codigo: 1, descripcion: 'Pesos' },
  { codigo: 2, descripcion: 'Dólares' },
  { codigo: 3, descripcion: 'UF' },
];

const formatMonto = (monto: number): string => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
};

const OperacionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { enqueueSnackbar } = useSnackbar();
  const isEditing = !!id && id !== 'nuevo';

  // Estado del formulario
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState<ClienteListDto[]>([]);
  const [deudores, setDeudores] = useState<DeudorList[]>([]);
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [_tiposGasto, setTiposGasto] = useState<TipoGasto[]>([]);

  // Datos de la operación
  const [formData, setFormData] = useState<CreateOperacionDto>({
    rutCliente: 0,
    tipoDocumento: 1,
    fechaOperacion: new Date().toISOString().split('T')[0],
    tipoMoneda: 1,
    valorDolar: 1,
    porcentajeAdelanto: 80,
    codigoBanco: undefined,
    cuentaBancaria: '',
    observaciones: '',
    facturas: [],
    cheques: [],
    letras: [],
    otros: [],
    gastos: [],
  });

  // Estado para diálogo de agregar documento
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [docDialogType, setDocDialogType] = useState<'facturas' | 'cheques' | 'letras' | 'otros'>('facturas');
  const [newDoc, setNewDoc] = useState<CreateDocumentoDto>({
    rutDeudor: 0,
    numeroDocumento: '',
    fechaVencimiento: new Date().toISOString().split('T')[0],
    montoDocumento: 0,
    tipoMoneda: 1,
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [clientesRes, bancosRes, tiposGastoRes] = await Promise.all([
          clienteService.getAll(),
          bancoService.getAll(),
          operacionService.getTiposGasto(),
        ]);

        setClientes(clientesRes);
        setBancos(bancosRes);
        setTiposGasto(tiposGastoRes);

        if (isEditing) {
          const operacion = await operacionService.getById(parseInt(id));
          // Mapear a formData
          setFormData({
            rutCliente: operacion.rutCliente,
            tipoDocumento: operacion.tipoDocumento,
            fechaOperacion: operacion.fechaOperacion.split('T')[0],
            tipoMoneda: operacion.tipoMoneda,
            valorDolar: operacion.valorDolar,
            porcentajeAdelanto: operacion.porcentajeAdelanto,
            codigoBanco: operacion.codigoBanco,
            cuentaBancaria: operacion.cuentaBancaria || '',
            observaciones: operacion.observaciones || '',
            facturas: operacion.facturas.map(f => ({
              rutDeudor: f.rutDeudor,
              numeroDocumento: f.numeroDocumento,
              fechaEmision: f.fechaEmision?.split('T')[0],
              fechaVencimiento: f.fechaVencimiento.split('T')[0],
              montoDocumento: f.montoDocumento,
              tipoMoneda: f.tipoMoneda,
              observaciones: f.observaciones,
            })),
            cheques: operacion.cheques.map(c => ({
              rutDeudor: c.rutDeudor,
              numeroDocumento: c.numeroDocumento,
              fechaEmision: c.fechaEmision?.split('T')[0],
              fechaVencimiento: c.fechaVencimiento.split('T')[0],
              montoDocumento: c.montoDocumento,
              tipoMoneda: c.tipoMoneda,
              codigoBanco: c.codigoBanco,
              observaciones: c.observaciones,
            })),
            letras: operacion.letras.map(l => ({
              rutDeudor: l.rutDeudor,
              numeroDocumento: l.numeroDocumento,
              fechaEmision: l.fechaEmision?.split('T')[0],
              fechaVencimiento: l.fechaVencimiento.split('T')[0],
              montoDocumento: l.montoDocumento,
              tipoMoneda: l.tipoMoneda,
              observaciones: l.observaciones,
            })),
            otros: operacion.otros.map(o => ({
              rutDeudor: o.rutDeudor,
              numeroDocumento: o.numeroDocumento,
              fechaEmision: o.fechaEmision?.split('T')[0],
              fechaVencimiento: o.fechaVencimiento.split('T')[0],
              montoDocumento: o.montoDocumento,
              tipoMoneda: o.tipoMoneda,
              observaciones: o.observaciones,
            })),
            gastos: operacion.gastos.map(g => ({
              codigoGasto: g.codigoGasto,
              montoGasto: g.montoGasto,
              afectoIva: g.afectoIva,
            })),
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        enqueueSnackbar('Error al cargar datos', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditing, enqueueSnackbar]);

  // Cargar deudores cuando cambia el cliente
  useEffect(() => {
    const loadDeudores = async () => {
      if (formData.rutCliente > 0) {
        try {
          const response = await deudorService.getByCliente(formData.rutCliente);
          setDeudores(response);
        } catch (error) {
          console.error('Error loading deudores:', error);
        }
      }
    };
    loadDeudores();
  }, [formData.rutCliente]);

  // Handlers
  const handleChange = (field: keyof CreateOperacionDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDoc = () => {
    if (!newDoc.rutDeudor || !newDoc.numeroDocumento || !newDoc.montoDocumento) {
      enqueueSnackbar('Complete todos los campos requeridos', { variant: 'warning' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      [docDialogType]: [...prev[docDialogType], { ...newDoc }],
    }));

    setNewDoc({
      rutDeudor: 0,
      numeroDocumento: '',
      fechaVencimiento: new Date().toISOString().split('T')[0],
      montoDocumento: 0,
      tipoMoneda: 1,
    });
    setDocDialogOpen(false);
  };

  const handleRemoveDoc = (type: 'facturas' | 'cheques' | 'letras' | 'otros', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (formData.rutCliente === 0) {
      enqueueSnackbar('Seleccione un cliente', { variant: 'warning' });
      return;
    }

    const totalDocs = formData.facturas.length + formData.cheques.length + formData.letras.length + formData.otros.length;
    if (totalDocs === 0) {
      enqueueSnackbar('Agregue al menos un documento', { variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await operacionService.update(parseInt(id), {
          correlativoOperacion: parseInt(id),
          tipoDocumento: formData.tipoDocumento,
          fechaOperacion: formData.fechaOperacion,
          tipoMoneda: formData.tipoMoneda,
          valorDolar: formData.valorDolar,
          porcentajeAdelanto: formData.porcentajeAdelanto,
          codigoBanco: formData.codigoBanco,
          cuentaBancaria: formData.cuentaBancaria,
          observaciones: formData.observaciones,
        });
        enqueueSnackbar('Operación actualizada correctamente', { variant: 'success' });
      } else {
        await operacionService.create(formData);
        enqueueSnackbar('Operación creada correctamente', { variant: 'success' });
      }
      navigate('/operaciones');
    } catch (error) {
      console.error('Error saving operacion:', error);
      enqueueSnackbar('Error al guardar la operación', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Calcular totales
  const calcularTotales = () => {
    const montoFacturas = formData.facturas.reduce((sum, f) => sum + f.montoDocumento, 0);
    const montoCheques = formData.cheques.reduce((sum, c) => sum + c.montoDocumento, 0);
    const montoLetras = formData.letras.reduce((sum, l) => sum + l.montoDocumento, 0);
    const montoOtros = formData.otros.reduce((sum, o) => sum + o.montoDocumento, 0);
    const montoTotal = montoFacturas + montoCheques + montoLetras + montoOtros;
    const montoAdelanto = montoTotal * formData.porcentajeAdelanto / 100;
    const montoGastos = formData.gastos.reduce((sum, g) => sum + g.montoGasto, 0);
    const montoIva = formData.gastos.filter(g => g.afectoIva).reduce((sum, g) => sum + g.montoGasto * 0.19, 0);
    const montoGiro = montoAdelanto - montoGastos - montoIva;
    const montoRetencion = montoTotal - montoAdelanto;

    return { montoTotal, montoAdelanto, montoGastos, montoIva, montoGiro, montoRetencion };
  };

  const totales = calcularTotales();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/operaciones')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditing ? `Editar Operación #${id}` : 'Nueva Operación'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => navigate('/operaciones')}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      </Box>

      {/* Formulario Principal */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Datos de la Operación</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Cliente *</InputLabel>
              <Select
                value={formData.rutCliente || ''}
                onChange={(e) => handleChange('rutCliente', e.target.value)}
                label="Cliente *"
                disabled={isEditing}
              >
                {clientes.map(c => (
                  <MenuItem key={c.rutCliente} value={c.rutCliente}>
                    {c.nombreCompleto}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Tipo Documento</InputLabel>
              <Select
                value={formData.tipoDocumento}
                onChange={(e) => handleChange('tipoDocumento', e.target.value)}
                label="Tipo Documento"
              >
                {tiposDocumento.map(t => (
                  <MenuItem key={t.codigo} value={t.codigo}>{t.descripcion}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="Fecha Operación"
              type="Dayjs"
              value={formData.fechaOperacion}
              onChange={(e) => handleChange('fechaOperacion', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={formData.tipoMoneda}
                onChange={(e) => handleChange('tipoMoneda', e.target.value)}
                label="Moneda"
              >
                {tiposMoneda.map(m => (
                  <MenuItem key={m.codigo} value={m.codigo}>{m.descripcion}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              label="% Adelanto"
              type="number"
              value={formData.porcentajeAdelanto}
              onChange={(e) => handleChange('porcentajeAdelanto', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Banco</InputLabel>
              <Select
                value={formData.codigoBanco || ''}
                onChange={(e) => handleChange('codigoBanco', e.target.value || undefined)}
                label="Banco"
              >
                <MenuItem value="">Sin banco</MenuItem>
                {bancos.map(b => (
                  <MenuItem key={b.codigoBanco} value={b.codigoBanco}>{b.nombreBanco}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Cuenta Bancaria"
              value={formData.cuentaBancaria}
              onChange={(e) => handleChange('cuentaBancaria', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Observaciones"
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Documentos */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Documentos</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setDocDialogType('facturas'); setDocDialogOpen(true); }}
            >
              Factura
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setDocDialogType('cheques'); setDocDialogOpen(true); }}
            >
              Cheque
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setDocDialogType('letras'); setDocDialogOpen(true); }}
            >
              Letra
            </Button>
          </Box>
        </Box>

        {formData.facturas.length + formData.cheques.length + formData.letras.length + formData.otros.length === 0 ? (
          <Alert severity="info">No hay documentos agregados</Alert>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Nº Documento</TableCell>
                  <TableCell>Deudor</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.facturas.map((doc, idx) => (
                  <TableRow key={`fac-${idx}`}>
                    <TableCell>Factura</TableCell>
                    <TableCell>{doc.numeroDocumento}</TableCell>
                    <TableCell>{deudores.find(d => d.rutDeudor === doc.rutDeudor)?.razonSocial || doc.rutDeudor}</TableCell>
                    <TableCell>{new Date(doc.fechaVencimiento).toLocaleDateString('es-CL')}</TableCell>
                    <TableCell align="right">{formatMonto(doc.montoDocumento)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemoveDoc('facturas', idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {formData.cheques.map((doc, idx) => (
                  <TableRow key={`che-${idx}`}>
                    <TableCell>Cheque</TableCell>
                    <TableCell>{doc.numeroDocumento}</TableCell>
                    <TableCell>{deudores.find(d => d.rutDeudor === doc.rutDeudor)?.razonSocial || doc.rutDeudor}</TableCell>
                    <TableCell>{new Date(doc.fechaVencimiento).toLocaleDateString('es-CL')}</TableCell>
                    <TableCell align="right">{formatMonto(doc.montoDocumento)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemoveDoc('cheques', idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {formData.letras.map((doc, idx) => (
                  <TableRow key={`let-${idx}`}>
                    <TableCell>Letra</TableCell>
                    <TableCell>{doc.numeroDocumento}</TableCell>
                    <TableCell>{deudores.find(d => d.rutDeudor === doc.rutDeudor)?.razonSocial || doc.rutDeudor}</TableCell>
                    <TableCell>{new Date(doc.fechaVencimiento).toLocaleDateString('es-CL')}</TableCell>
                    <TableCell align="right">{formatMonto(doc.montoDocumento)}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemoveDoc('letras', idx)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Resumen de Montos */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Resumen</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="body2" color="text.secondary">Monto Total</Typography>
            <Typography variant="h6">{formatMonto(totales.montoTotal)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="body2" color="text.secondary">Monto Adelanto</Typography>
            <Typography variant="h6">{formatMonto(totales.montoAdelanto)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="body2" color="text.secondary">Gastos</Typography>
            <Typography variant="h6">{formatMonto(totales.montoGastos)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="body2" color="text.secondary">IVA Gastos</Typography>
            <Typography variant="h6">{formatMonto(totales.montoIva)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="body2" color="text.secondary">Monto Giro</Typography>
            <Typography variant="h6" color="primary">{formatMonto(totales.montoGiro)}</Typography>
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="body2" color="text.secondary">Retención</Typography>
            <Typography variant="h6">{formatMonto(totales.montoRetencion)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Diálogo para agregar documento */}
      <Dialog open={docDialogOpen} onClose={() => setDocDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar {docDialogType === 'facturas' ? 'Factura' : docDialogType === 'cheques' ? 'Cheque' : 'Letra'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Deudor *</InputLabel>
                <Select
                  value={newDoc.rutDeudor || ''}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, rutDeudor: e.target.value as number }))}
                  label="Deudor *"
                >
                  {deudores.map(d => (
                    <MenuItem key={d.rutDeudor} value={d.rutDeudor}>{d.razonSocial}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Número Documento *"
                value={newDoc.numeroDocumento}
                onChange={(e) => setNewDoc(prev => ({ ...prev, numeroDocumento: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Fecha Emisión"
                type="Dayjs"
                value={newDoc.fechaEmision || ''}
                onChange={(e) => setNewDoc(prev => ({ ...prev, fechaEmision: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Fecha Vencimiento *"
                type="Dayjs"
                value={newDoc.fechaVencimiento}
                onChange={(e) => setNewDoc(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Monto *"
                type="number"
                value={newDoc.montoDocumento || ''}
                onChange={(e) => setNewDoc(prev => ({ ...prev, montoDocumento: parseFloat(e.target.value) || 0 }))}
              />
            </Grid>
            {docDialogType === 'cheques' && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Banco del Cheque</InputLabel>
                  <Select
                    value={newDoc.codigoBanco || ''}
                    onChange={(e) => setNewDoc(prev => ({ ...prev, codigoBanco: e.target.value as number }))}
                    label="Banco del Cheque"
                  >
                    {bancos.map(b => (
                      <MenuItem key={b.codigoBanco} value={b.codigoBanco}>{b.nombreBanco}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddDoc}>Agregar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OperacionForm;
