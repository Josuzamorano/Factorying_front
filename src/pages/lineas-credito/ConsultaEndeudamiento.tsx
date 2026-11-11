import React, { useState } from 'react';
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
  Chip,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Breadcrumbs,
  Link,
  Container,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';

interface EndeudamientoCliente {
  rutCliente: number;
  nombreCliente: string;
  totalAprobado: number;
  totalUtilizado: number;
  totalDisponible: number;
  porcentajeUtilizado: number;
  cantidadLineas: number;
  lineasVigentes: number;
  lineasVencidas: number;
}

interface LineaResumen {
  numeroLinea: number;
  tipoMoneda: string;
  fechaSolicitud: string;
  vigenciaDesde: string;
  vigenciaHasta: string;
  montoAprobado: number;
  montoUtilizado: number;
  estadoLinea: number;
  descripcionEstadoLinea: string;
}

const ConsultaEndeudamiento: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rutBusqueda, setRutBusqueda] = useState('');
  const [endeudamiento, setEndeudamiento] = useState<EndeudamientoCliente | null>(null);
  const [lineas, setLineas] = useState<LineaResumen[]>([]);

  const buscarCliente = async () => {
    if (!rutBusqueda) return;
    
    setLoading(true);
    try {
      // Datos de ejemplo
      setEndeudamiento({
        rutCliente: parseInt(rutBusqueda.replace(/\D/g, '')),
        nombreCliente: 'Empresa ABC Ltda.',
        totalAprobado: 150000000,
        totalUtilizado: 85000000,
        totalDisponible: 65000000,
        porcentajeUtilizado: 56.67,
        cantidadLineas: 3,
        lineasVigentes: 2,
        lineasVencidas: 1,
      });

      setLineas([
        {
          numeroLinea: 1,
          tipoMoneda: 'Peso',
          fechaSolicitud: '2024-01-15',
          vigenciaDesde: '2024-02-01',
          vigenciaHasta: '2025-01-31',
          montoAprobado: 80000000,
          montoUtilizado: 50000000,
          estadoLinea: 2,
          descripcionEstadoLinea: 'Vigente',
        },
        {
          numeroLinea: 2,
          tipoMoneda: 'Peso',
          fechaSolicitud: '2024-06-10',
          vigenciaDesde: '2024-07-01',
          vigenciaHasta: '2025-06-30',
          montoAprobado: 50000000,
          montoUtilizado: 25000000,
          estadoLinea: 2,
          descripcionEstadoLinea: 'Vigente',
        },
        {
          numeroLinea: 3,
          tipoMoneda: 'Peso',
          fechaSolicitud: '2023-03-20',
          vigenciaDesde: '2023-04-01',
          vigenciaHasta: '2024-03-31',
          montoAprobado: 20000000,
          montoUtilizado: 10000000,
          estadoLinea: 4,
          descripcionEstadoLinea: 'Vencida',
        },
      ]);
    } catch (error) {
      console.error('Error buscando cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      buscarCliente();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getEstadoColor = (estado: number): 'default' | 'success' | 'primary' | 'error' | 'warning' => {
    switch (estado) {
      case 1: return 'default'; // Creada
      case 2: return 'success'; // Vigente
      case 3: return 'primary'; // Aprobada
      case 4: return 'error';   // Vencida
      case 5: return 'warning'; // Suspendida
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/principal'); }}>
          Inicio
        </Link>
        <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/lineas-credito'); }}>
          Líneas de Crédito
        </Link>
        <Typography color="text.primary">Consulta Endeudamiento</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/lineas-credito')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Consulta de Endeudamiento</Typography>
      </Box>

      {/* Búsqueda */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="RUT Cliente"
              value={rutBusqueda}
              onChange={(e) => setRutBusqueda(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ej: 12345678-9"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={buscarCliente}
              disabled={loading}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {endeudamiento && (
        <>
          {/* Información del cliente */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalanceIcon sx={{ mr: 2, fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6">{endeudamiento.nombreCliente}</Typography>
                <Typography variant="body2" color="textSecondary">
                  RUT: {endeudamiento.rutCliente.toLocaleString('es-CL')}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            
            {/* Resumen */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card sx={{ height: '100%', backgroundColor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                      Total Aprobado
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {formatCurrency(endeudamiento.totalAprobado)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card sx={{ height: '100%', backgroundColor: '#fff3e0' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                      Total Utilizado
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {formatCurrency(endeudamiento.totalUtilizado)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card sx={{ height: '100%', backgroundColor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                      Total Disponible
                    </Typography>
                    <Typography variant="h5" color="success.main">
                      {formatCurrency(endeudamiento.totalDisponible)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                      % Utilización
                    </Typography>
                    <Typography variant="h5" color={endeudamiento.porcentajeUtilizado > 80 ? 'error' : 'inherit'}>
                      {endeudamiento.porcentajeUtilizado.toFixed(1)}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(endeudamiento.porcentajeUtilizado, 100)}
                      color={endeudamiento.porcentajeUtilizado > 80 ? 'error' : 'primary'}
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Estadísticas de líneas */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Alert severity="info" icon={false}>
                  <strong>Total Líneas:</strong> {endeudamiento.cantidadLineas}
                </Alert>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Alert severity="success" icon={false}>
                  <strong>Líneas Vigentes:</strong> {endeudamiento.lineasVigentes}
                </Alert>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Alert severity="error" icon={false}>
                  <strong>Líneas Vencidas:</strong> {endeudamiento.lineasVencidas}
                </Alert>
              </Grid>
            </Grid>
          </Paper>

          {/* Detalle de líneas */}
          <Paper>
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6">Detalle de Líneas de Crédito</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#fafafa' }}>
                    <TableCell>N° Línea</TableCell>
                    <TableCell>Moneda</TableCell>
                    <TableCell>Fecha Solicitud</TableCell>
                    <TableCell>Vigencia Desde</TableCell>
                    <TableCell>Vigencia Hasta</TableCell>
                    <TableCell align="right">Monto Aprobado</TableCell>
                    <TableCell align="right">Monto Utilizado</TableCell>
                    <TableCell align="right">Disponible</TableCell>
                    <TableCell align="right">% Uso</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineas.map((linea) => {
                    const disponible = linea.montoAprobado - linea.montoUtilizado;
                    const porcentajeUso = linea.montoAprobado > 0 
                      ? (linea.montoUtilizado / linea.montoAprobado) * 100 
                      : 0;
                    
                    return (
                      <TableRow key={linea.numeroLinea} hover>
                        <TableCell>{linea.numeroLinea}</TableCell>
                        <TableCell>{linea.tipoMoneda}</TableCell>
                        <TableCell>{new Date(linea.fechaSolicitud).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(linea.vigenciaDesde).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(linea.vigenciaHasta).toLocaleDateString()}</TableCell>
                        <TableCell align="right">{formatCurrency(linea.montoAprobado)}</TableCell>
                        <TableCell align="right">{formatCurrency(linea.montoUtilizado)}</TableCell>
                        <TableCell align="right">{formatCurrency(disponible)}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(porcentajeUso, 100)}
                              sx={{ width: 50, height: 6, borderRadius: 3 }}
                              color={porcentajeUso > 80 ? 'error' : 'primary'}
                            />
                            <Typography variant="body2">{porcentajeUso.toFixed(0)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={linea.descripcionEstadoLinea} 
                            size="small"
                            color={getEstadoColor(linea.estadoLinea)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {!endeudamiento && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            Ingrese un RUT para consultar el endeudamiento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Visualice el detalle de líneas de crédito y utilización
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default ConsultaEndeudamiento;
