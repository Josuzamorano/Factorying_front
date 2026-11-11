import React, { useState } from 'react';
import { API_BASE_URL } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  AccountBalance,
  Description,
} from '@mui/icons-material';

interface DeudaTotal {
  rutCliente: number;
  nombreCliente: string;
  fechaCalculo: string;
  totalFacturas: number;
  totalCheques: number;
  totalLetras: number;
  totalOtros: number;
  cuentasPorPagar: number;
  cuentasPorCobrar: number;
  facturasNoFactoring: number;
  excedentes: number;
  deudaNeta: number;
}

interface DetalleDocumento {
  rutDeudor: number;
  nombreDeudor: string;
  numeroOperacion: number;
  tipoDocumentoCodigo: string;
  numeroDocumento: number;
  fechaVencimiento: string;
  montoDocumento: number;
  montoAnticipo: number;
  interesVencido: number;
  interesMora: number;
  interesNoDevengado: number;
  estadoDocumento: string;
  abono: number;
  deudaNeta: number;
}

/**
 * Página de Deuda Total Cliente - Migrada de F_GC2200.frm (VB6)
 */
const DeudaTotalCliente: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rutCliente, setRutCliente] = useState('');
  const [deudaTotal, setDeudaTotal] = useState<DeudaTotal | null>(null);
  const [detalleFacturas, setDetalleFacturas] = useState<DetalleDocumento[]>([]);
  const [detalleCheques, setDetalleCheques] = useState<DetalleDocumento[]>([]);
  const [detalleLetras, setDetalleLetras] = useState<DetalleDocumento[]>([]);
  const [detalleOtros, setDetalleOtros] = useState<DetalleDocumento[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const getToken = () => localStorage.getItem('token') || '';

  const buscar = async () => {
    if (!rutCliente) {
      setError('Debe ingresar un RUT de cliente');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Obtener deuda total
      const response = await fetch(`${API_BASE_URL}/recaudacion/deuda-total/${rutCliente}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response.ok) {
        const data = await response.json();
        setDeudaTotal(data);
        
        // Cargar detalles
        await cargarDetalles(parseInt(rutCliente));
      } else if (response.status === 404) {
        setError('Cliente no encontrado');
        setDeudaTotal(null);
      } else {
        setError('Error al consultar deuda');
      }
    } catch (err) {
      console.error('Error buscando deuda:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalles = async (rut: number) => {
    try {
      // Facturas (tipo 1)
      const facResponse = await fetch(`${API_BASE_URL}/recaudacion/deuda-total/${rut}/detalle/1`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (facResponse.ok) {
        setDetalleFacturas(await facResponse.json());
      }

      // Cheques (tipo 2)
      const cheResponse = await fetch(`${API_BASE_URL}/recaudacion/deuda-total/${rut}/detalle/2`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (cheResponse.ok) {
        setDetalleCheques(await cheResponse.json());
      }

      // Letras (tipo 3)
      const letResponse = await fetch(`${API_BASE_URL}/recaudacion/deuda-total/${rut}/detalle/3`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (letResponse.ok) {
        setDetalleLetras(await letResponse.json());
      }

      // Otros (tipo 4)
      const otroResponse = await fetch(`${API_BASE_URL}/recaudacion/deuda-total/${rut}/detalle/4`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (otroResponse.ok) {
        setDetalleOtros(await otroResponse.json());
      }
    } catch (err) {
      console.error('Error cargando detalles:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatDayjs = (DayjsStr: string) => {
    if (!DayjsStr) return '-';
    return new Date(DayjsStr).toLocaleDateString('es-CL');
  };

  const renderTablaDetalle = (data: DetalleDocumento[]) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#e3f2fd' }}>
            <TableCell>Deudor</TableCell>
            <TableCell>Ope</TableCell>
            <TableCell>N° Doc</TableCell>
            <TableCell>Vencimiento</TableCell>
            <TableCell align="right">Monto</TableCell>
            <TableCell align="right">Anticipo</TableCell>
            <TableCell align="right">Int. Venc.</TableCell>
            <TableCell align="right">Int. Mora</TableCell>
            <TableCell align="right">Abono</TableCell>
            <TableCell align="right">Deuda Neta</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((doc, idx) => (
            <TableRow key={`${doc.numeroOperacion}-${doc.numeroDocumento}-${idx}`} hover>
              <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {doc.nombreDeudor}
              </TableCell>
              <TableCell>{doc.numeroOperacion}</TableCell>
              <TableCell>{doc.numeroDocumento}</TableCell>
              <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
              <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
              <TableCell align="right">{formatCurrency(doc.montoAnticipo)}</TableCell>
              <TableCell align="right">{formatCurrency(doc.interesVencido)}</TableCell>
              <TableCell align="right">{formatCurrency(doc.interesMora)}</TableCell>
              <TableCell align="right">{formatCurrency(doc.abono)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(doc.deudaNeta)}</TableCell>
              <TableCell>{doc.estadoDocumento}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={11} align="center">Sin documentos</TableCell>
            </TableRow>
          )}
          {data.length > 0 && (
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell colSpan={4}><strong>Totales</strong></TableCell>
              <TableCell align="right"><strong>{formatCurrency(data.reduce((sum, d) => sum + d.montoDocumento, 0))}</strong></TableCell>
              <TableCell align="right"><strong>{formatCurrency(data.reduce((sum, d) => sum + d.montoAnticipo, 0))}</strong></TableCell>
              <TableCell align="right"><strong>{formatCurrency(data.reduce((sum, d) => sum + d.interesVencido, 0))}</strong></TableCell>
              <TableCell align="right"><strong>{formatCurrency(data.reduce((sum, d) => sum + d.interesMora, 0))}</strong></TableCell>
              <TableCell align="right"><strong>{formatCurrency(data.reduce((sum, d) => sum + d.abono, 0))}</strong></TableCell>
              <TableCell align="right"><strong>{formatCurrency(data.reduce((sum, d) => sum + d.deudaNeta, 0))}</strong></TableCell>
              <TableCell></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/recaudacion')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <AccountBalance sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Deuda Total Cliente
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/principal'); }}>
            Inicio
          </Link>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/recaudacion'); }}>
            Recaudación
          </Link>
          <Typography color="text.primary">Deuda Total</Typography>
        </Breadcrumbs>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {/* Búsqueda */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="RUT Cliente"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                placeholder="Ej: 12345678"
                onKeyPress={(e) => e.key === 'Enter' && buscar()}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Search />}
                onClick={buscar}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                Consultar
              </Button>
            </Grid>
            {deudaTotal && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="h6">{deudaTotal.nombreCliente}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Fecha de cálculo: {formatDayjs(deudaTotal.fechaCalculo)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 3 }} />}

        {/* Resumen de deuda */}
        {deudaTotal && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5">{formatCurrency(deudaTotal.totalFacturas)}</Typography>
                    <Typography variant="subtitle2">Facturas ({detalleFacturas.length})</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#388e3c', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5">{formatCurrency(deudaTotal.totalCheques)}</Typography>
                    <Typography variant="subtitle2">Cheques ({detalleCheques.length})</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#f57c00', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5">{formatCurrency(deudaTotal.totalLetras)}</Typography>
                    <Typography variant="subtitle2">Letras ({detalleLetras.length})</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: '#7b1fa2', color: 'white' }}>
                  <CardContent>
                    <Typography variant="h5">{formatCurrency(deudaTotal.totalOtros)}</Typography>
                    <Typography variant="subtitle2">Otros ({detalleOtros.length})</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Resumen financiero */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Resumen Financiero</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="body2" color="text.secondary">Cuentas por Pagar</Typography>
                  <Typography variant="h6" color="error">{formatCurrency(deudaTotal.cuentasPorPagar)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="body2" color="text.secondary">Cuentas por Cobrar</Typography>
                  <Typography variant="h6" color="success.main">{formatCurrency(deudaTotal.cuentasPorCobrar)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="body2" color="text.secondary">Fac. No Factoring</Typography>
                  <Typography variant="h6">{formatCurrency(deudaTotal.facturasNoFactoring)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="body2" color="text.secondary">Excedentes</Typography>
                  <Typography variant="h6">{formatCurrency(deudaTotal.excedentes)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Typography variant="body2" color="text.secondary">DEUDA NETA TOTAL</Typography>
                  <Typography variant="h4" color="primary">{formatCurrency(deudaTotal.deudaNeta)}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Tabs de detalle */}
            <Paper sx={{ p: 2 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
                <Tab label={`Facturas (${detalleFacturas.length})`} icon={<Description />} iconPosition="start" />
                <Tab label={`Cheques (${detalleCheques.length})`} icon={<Description />} iconPosition="start" />
                <Tab label={`Letras (${detalleLetras.length})`} icon={<Description />} iconPosition="start" />
                <Tab label={`Otros (${detalleOtros.length})`} icon={<Description />} iconPosition="start" />
              </Tabs>

              {tabValue === 0 && renderTablaDetalle(detalleFacturas)}
              {tabValue === 1 && renderTablaDetalle(detalleCheques)}
              {tabValue === 2 && renderTablaDetalle(detalleLetras)}
              {tabValue === 3 && renderTablaDetalle(detalleOtros)}
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default DeudaTotalCliente;
