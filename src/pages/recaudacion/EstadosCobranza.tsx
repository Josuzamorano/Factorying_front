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
  Chip,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Search,
  Assessment,
  Download,
  PictureAsPdf,
} from '@mui/icons-material';

interface EstadoCobranzaDoc {
  rutCliente: number;
  nombreCliente: string;
  rutDeudor: number;
  nombreDeudor: string;
  tipoDocumento: number;
  descripcionTipoDocumento: string;
  numeroDocumento: number;
  fechaVencimiento: string;
  estadoCobranza: number;
  fechaPago?: string;
  montoDocumento: number;
  nombreBanco: string;
  nombreEjecutivo: string;
  nombreCobrador: string;
  descripcionEstadoDocumento: string;
  descripcionEstadoCobranza: string;
}

interface Resumen {
  fechaDesde: string;
  fechaHasta: string;
  totalDocumentos: number;
  montoTotal: number;
  totalClientes: number;
  porEstado: { [key: string]: { estadoCobranza: number; descripcionEstado: string; cantidadDocumentos: number; monto: number } };
}

/**
 * Página de Estados de Cobranza - Migrada de F_GC2600.frm (VB6)
 */
const EstadosCobranza: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentos, setDocumentos] = useState<EstadoCobranzaDoc[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);

  // Filtros
  const [fechaDesde, setFechaDesde] = useState(() => {
    const Dayjs = new Date();
    Dayjs.setMonth(Dayjs.getMonth() - 1);
    return Dayjs.toISOString().split('T')[0];
  });
  const [fechaHasta, setFechaHasta] = useState(() => new Date().toISOString().split('T')[0]);
  const [rutCliente, setRutCliente] = useState('');

  const getToken = () => localStorage.getItem('token') || '';

  const buscar = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtro = {
        fechaDesde,
        fechaHasta,
        rutCliente: rutCliente ? parseInt(rutCliente) : null,
      };

      const response = await fetch(`${API_BASE_URL}/recaudacion/estados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(filtro),
      });

      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      } else {
        setError('Error al buscar estados de cobranza');
      }

      // Obtener resumen
      const resumenResponse = await fetch(`${API_BASE_URL}/recaudacion/estados/resumen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(filtro),
      });

      if (resumenResponse.ok) {
        const resumenData = await resumenResponse.json();
        setResumen(resumenData);
      }
    } catch (err) {
      console.error('Error buscando estados:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatDayjs = (DayjsStr: string) => {
    if (!DayjsStr) return '-';
    return new Date(DayjsStr).toLocaleDateString('es-CL');
  };

  const getEstadoColor = (estado: number): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
    switch (estado) {
      case 21: return 'success'; // Promesa de pago
      case 19: return 'info'; // Contactado
      case 18: return 'default'; // Sin gestionar
      case 46: return 'error'; // Problema
      case 47: return 'warning'; // Reclamo
      default: return 'default';
    }
  };

  const exportarExcel = () => {
    // Implementar exportación a Excel
    console.log('Exportar a Excel');
  };

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
          <Assessment sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Estados de Cobranza
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
          <Typography color="text.primary">Estados Cobranza</Typography>
        </Breadcrumbs>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filtros de Búsqueda</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Fecha Desde"
                type="Dayjs"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="Fecha Hasta"
                type="Dayjs"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="RUT Cliente (opcional)"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                placeholder="Ej: 12345678"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Search />}
                onClick={buscar}
                disabled={loading}
                sx={{ height: '56px' }}
              >
                Buscar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: '#1976d2', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4">{resumen.totalDocumentos}</Typography>
                  <Typography variant="subtitle1">Total Documentos</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: '#388e3c', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4">{formatCurrency(resumen.montoTotal)}</Typography>
                  <Typography variant="subtitle1">Monto Total</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ bgcolor: '#f57c00', color: 'white' }}>
                <CardContent>
                  <Typography variant="h4">{resumen.totalClientes}</Typography>
                  <Typography variant="subtitle1">Total Clientes</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Resumen por estado */}
            {Object.values(resumen.porEstado).map((estado) => (
              <Grid size={{ xs: 12, sm: 3 }} key={estado.estadoCobranza}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{estado.cantidadDocumentos}</Typography>
                    <Typography variant="body2">{estado.descripcionEstado}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(estado.monto)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Tabla de resultados */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Detalle de Estados</Typography>
            <Box>
              <Button startIcon={<Download />} onClick={exportarExcel} sx={{ mr: 1 }}>
                Excel
              </Button>
              <Button startIcon={<PictureAsPdf />} color="error">
                PDF
              </Button>
            </Box>
          </Box>

          {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 3 }} />}

          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Deudor</TableCell>
                  <TableCell>Tipo Doc</TableCell>
                  <TableCell>N° Doc</TableCell>
                  <TableCell>Vencimiento</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell>Estado Doc</TableCell>
                  <TableCell>Estado Cobranza</TableCell>
                  <TableCell>Cobrador</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documentos.map((doc, idx) => (
                  <TableRow key={`${doc.rutCliente}-${doc.numeroDocumento}-${idx}`} hover>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.nombreCliente}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {doc.nombreDeudor}
                    </TableCell>
                    <TableCell>{doc.descripcionTipoDocumento}</TableCell>
                    <TableCell>{doc.numeroDocumento}</TableCell>
                    <TableCell>{formatDayjs(doc.fechaVencimiento)}</TableCell>
                    <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
                    <TableCell>{doc.descripcionEstadoDocumento}</TableCell>
                    <TableCell>
                      <Chip
                        label={doc.descripcionEstadoCobranza}
                        size="small"
                        color={getEstadoColor(doc.estadoCobranza)}
                      />
                    </TableCell>
                    <TableCell>{doc.nombreCobrador || '-'}</TableCell>
                  </TableRow>
                ))}
                {documentos.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      No hay documentos que mostrar. Use los filtros para buscar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default EstadosCobranza;
