import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Breadcrumbs,
  Link,
  Container,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';

interface SolicitudLinea {
  rutCliente: number;
  numeroLinea: number;
  nombreCliente: string;
  fechaSolicitud: string;
  tipoMoneda: string;
  montoSolicitado: number;
  tasaNegocio: number;
  spread: number;
  categoriaRiesgo?: string;
  estadoSolicitud: number;
  descripcionEstadoSolicitud: string;
}

const AprobacionLineas: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudLinea[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudLinea | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [accion, setAccion] = useState<'aprobar' | 'rechazar'>('aprobar');
  const [filtroEstado, setFiltroEstado] = useState<number>(1);
  
  const [formAprobacion, setFormAprobacion] = useState({
    montoAprobado: 0,
    vigenciaDesde: '',
    vigenciaHasta: '',
    observaciones: '',
  });

  useEffect(() => {
    cargarSolicitudes();
  }, [filtroEstado]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      // Datos de ejemplo
      setSolicitudes([
        {
          rutCliente: 12345678,
          numeroLinea: 1,
          nombreCliente: 'Empresa ABC Ltda.',
          fechaSolicitud: '2024-12-15',
          tipoMoneda: 'Peso',
          montoSolicitado: 100000000,
          tasaNegocio: 1.8,
          spread: 0.5,
          categoriaRiesgo: 'A',
          estadoSolicitud: 1,
          descripcionEstadoSolicitud: 'Creada',
        },
        {
          rutCliente: 98765432,
          numeroLinea: 1,
          nombreCliente: 'Comercial XYZ S.A.',
          fechaSolicitud: '2024-12-18',
          tipoMoneda: 'Peso',
          montoSolicitado: 50000000,
          tasaNegocio: 2.0,
          spread: 0.3,
          categoriaRiesgo: 'B',
          estadoSolicitud: 1,
          descripcionEstadoSolicitud: 'Creada',
        },
      ]);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (solicitud: SolicitudLinea, tipo: 'aprobar' | 'rechazar') => {
    setSelectedSolicitud(solicitud);
    setAccion(tipo);
    setFormAprobacion({
      montoAprobado: solicitud.montoSolicitado,
      vigenciaDesde: new Date().toISOString().split('T')[0],
      vigenciaHasta: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      observaciones: '',
    });
    setOpenDialog(true);
  };

  const handleProcesar = async () => {
    if (!selectedSolicitud) return;
    
    setLoading(true);
    try {
      console.log(`Procesando ${accion}:`, {
        rutCliente: selectedSolicitud.rutCliente,
        numeroLinea: selectedSolicitud.numeroLinea,
        ...formAprobacion,
      });
      
      setOpenDialog(false);
      await cargarSolicitudes();
    } catch (error) {
      console.error('Error procesando solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const pendientes = solicitudes.filter(s => s.estadoSolicitud === 1).length;
  const aprobadas = solicitudes.filter(s => s.estadoSolicitud === 2).length;
  const rechazadas = solicitudes.filter(s => s.estadoSolicitud === 3).length;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/principal'); }}>
          Inicio
        </Link>
        <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/lineas-credito'); }}>
          Líneas de Crédito
        </Link>
        <Typography color="text.primary">Aprobación</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/lineas-credito')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Aprobación de Líneas de Crédito</Typography>
        </Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargarSolicitudes}>
          Actualizar
        </Button>
      </Box>

      {/* Resumen */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ cursor: 'pointer', border: filtroEstado === 1 ? 2 : 0, borderColor: 'warning.main' }}
                onClick={() => setFiltroEstado(1)}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Pendientes</Typography>
              <Typography variant="h4" color="warning.main">{pendientes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ cursor: 'pointer', border: filtroEstado === 2 ? 2 : 0, borderColor: 'success.main' }}
                onClick={() => setFiltroEstado(2)}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Aprobadas</Typography>
              <Typography variant="h4" color="success.main">{aprobadas}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ cursor: 'pointer', border: filtroEstado === 3 ? 2 : 0, borderColor: 'error.main' }}
                onClick={() => setFiltroEstado(3)}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Rechazadas</Typography>
              <Typography variant="h4" color="error.main">{rechazadas}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de solicitudes */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>RUT Cliente</TableCell>
                <TableCell>Nombre Cliente</TableCell>
                <TableCell>N° Línea</TableCell>
                <TableCell>Fecha Solicitud</TableCell>
                <TableCell>Moneda</TableCell>
                <TableCell align="right">Monto Solicitado</TableCell>
                <TableCell align="right">Tasa %</TableCell>
                <TableCell align="right">Spread %</TableCell>
                <TableCell>Riesgo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {solicitudes
                .filter(s => filtroEstado === 0 || s.estadoSolicitud === filtroEstado)
                .map((solicitud) => (
                <TableRow key={`${solicitud.rutCliente}-${solicitud.numeroLinea}`} hover>
                  <TableCell>{solicitud.rutCliente}</TableCell>
                  <TableCell>{solicitud.nombreCliente}</TableCell>
                  <TableCell>{solicitud.numeroLinea}</TableCell>
                  <TableCell>{new Date(solicitud.fechaSolicitud).toLocaleDateString()}</TableCell>
                  <TableCell>{solicitud.tipoMoneda}</TableCell>
                  <TableCell align="right">{formatCurrency(solicitud.montoSolicitado)}</TableCell>
                  <TableCell align="right">{solicitud.tasaNegocio.toFixed(2)}</TableCell>
                  <TableCell align="right">{solicitud.spread.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={solicitud.categoriaRiesgo || 'N/A'} 
                      size="small"
                      color={solicitud.categoriaRiesgo === 'A' ? 'success' : 
                             solicitud.categoriaRiesgo === 'B' ? 'warning' : 'error'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={solicitud.descripcionEstadoSolicitud} 
                      size="small"
                      color={solicitud.estadoSolicitud === 1 ? 'warning' : 
                             solicitud.estadoSolicitud === 2 ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {solicitud.estadoSolicitud === 1 && (
                      <>
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleOpenDialog(solicitud, 'aprobar')}
                          title="Aprobar"
                        >
                          <ApproveIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDialog(solicitud, 'rechazar')}
                          title="Rechazar"
                        >
                          <RejectIcon />
                        </IconButton>
                      </>
                    )}
                    <IconButton size="small" title="Ver detalle">
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {solicitudes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Alert severity="info" sx={{ m: 2 }}>
                      No hay solicitudes pendientes
                    </Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de aprobación/rechazo */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          backgroundColor: accion === 'aprobar' ? 'success.light' : 'error.light',
          color: 'white'
        }}>
          {accion === 'aprobar' ? 'Aprobar Línea de Crédito' : 'Rechazar Línea de Crédito'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedSolicitud && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  <strong>Cliente:</strong> {selectedSolicitud.nombreCliente}<br />
                  <strong>Monto Solicitado:</strong> {formatCurrency(selectedSolicitud.montoSolicitado)}
                </Alert>
              </Grid>
              
              {accion === 'aprobar' && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Monto Aprobado"
                      type="number"
                      value={formAprobacion.montoAprobado}
                      onChange={(e) => setFormAprobacion({ ...formAprobacion, montoAprobado: parseFloat(e.target.value) })}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Vigencia Desde"
                      type="Dayjs"
                      value={formAprobacion.vigenciaDesde}
                      onChange={(e) => setFormAprobacion({ ...formAprobacion, vigenciaDesde: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <TextField
                      fullWidth
                      label="Vigencia Hasta"
                      type="Dayjs"
                      value={formAprobacion.vigenciaHasta}
                      onChange={(e) => setFormAprobacion({ ...formAprobacion, vigenciaHasta: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Observaciones"
                  multiline
                  rows={3}
                  value={formAprobacion.observaciones}
                  onChange={(e) => setFormAprobacion({ ...formAprobacion, observaciones: e.target.value })}
                  placeholder={accion === 'rechazar' ? 'Motivo del rechazo...' : 'Observaciones...'}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            color={accion === 'aprobar' ? 'success' : 'error'}
            onClick={handleProcesar}
            disabled={loading}
          >
            {accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AprobacionLineas;
