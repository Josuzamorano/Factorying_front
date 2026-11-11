// ====================================================
// Gestión de Excedentes - Migrado de F_CM1200.frm
// ====================================================

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Receipt as ReceiptIcon,
  PlayArrow as ApplyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

interface ResumenExcedente {
  rutCliente: number;
  rutClienteFormateado: string;
  nombreCliente: string;
  montoTotalExcedentes: number;
  saldoTotalExcedentes: number;
  cantidadExcedentes: number;
}

interface ExcedenteDetalle {
  numeroExcedente: number;
  numeroDocumento: string;
  fechaGeneracion: string;
  montoExcedente: number;
  saldoExcedente: number;
  seleccionado: boolean;
}

interface Filtro {
  rutCliente: string;
  tipoDocumento: string;
  fechaDesde: Dayjs | null;
  fechaHasta: Dayjs | null;
  estado: string;
}

const Excedentes: React.FC = () => {
  const [resumen, setResumen] = useState<ResumenExcedente[]>([]);
  const [excedentesDetalle, setExcedentesDetalle] = useState<ExcedenteDetalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ResumenExcedente | null>(null);
  const [dialogAplicar, setDialogAplicar] = useState(false);
  const [excedentesSeleccionados, setExcedentesSeleccionados] = useState<ExcedenteDetalle[]>([]);
  const [montoAplicar, setMontoAplicar] = useState<string>('');
  
  const [filtro, setFiltro] = useState<Filtro>({
    rutCliente: '',
    tipoDocumento: '',
    fechaDesde: null,
    fechaHasta: null,
    estado: '',
  });

  // Totales
  const [totales, setTotales] = useState({
    montoTotal: 0,
    saldoTotal: 0,
    cantidadClientes: 0,
  });

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filtro.rutCliente) params.append('rutCliente', filtro.rutCliente);
      if (filtro.tipoDocumento) params.append('tipoDocumento', filtro.tipoDocumento);
      if (filtro.fechaDesde) params.append('fechaDesde', filtro.fechaDesde.toISOString());
      if (filtro.fechaHasta) params.append('fechaHasta', filtro.fechaHasta.toISOString());

      const response = await fetch(`/api/comercial/excedentes/resumen?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar resumen de excedentes');
      
      const data = await response.json();
      setResumen(data);
      
      // Calcular totales
      const montoTotal = data.reduce((sum: number, r: ResumenExcedente) => sum + r.montoTotalExcedentes, 0);
      const saldoTotal = data.reduce((sum: number, r: ResumenExcedente) => sum + r.saldoTotalExcedentes, 0);
      setTotales({
        montoTotal,
        saldoTotal,
        cantidadClientes: data.length,
      });
    } catch (err) {
      setError('Error al cargar resumen de excedentes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarExcedentesCliente = async (rutCliente: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/comercial/excedentes/disponibles/${rutCliente}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Error al cargar excedentes');
      
      const data = await response.json();
      setExcedentesDetalle(data);
    } catch (err) {
      setError('Error al cargar excedentes del cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteClick = (cliente: ResumenExcedente) => {
    setClienteSeleccionado(cliente);
    cargarExcedentesCliente(cliente.rutCliente);
  };

  const handleAplicarExcedente = async () => {
    if (!excedentesSeleccionados.length || !montoAplicar) return;

    setLoading(true);
    try {
      for (const exc of excedentesSeleccionados) {
        await fetch('/api/comercial/excedentes/aplicar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            numeroExcedente: exc.numeroExcedente,
            numeroDocumento: exc.numeroDocumento,
            montoAplicar: parseFloat(montoAplicar),
          }),
        });
      }

      setDialogAplicar(false);
      setMontoAplicar('');
      setExcedentesSeleccionados([]);
      cargarResumen();
      if (clienteSeleccionado) {
        cargarExcedentesCliente(clienteSeleccionado.rutCliente);
      }
    } catch (err) {
      setError('Error al aplicar excedente');
      console.error(err);
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

  const formatDayjs = (DayjsString: string) => {
    return new Date(DayjsString).toLocaleDateString('es-CL');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
          Gestión de Excedentes
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="RUT Cliente"
                value={filtro.rutCliente}
                onChange={(e) => setFiltro({ ...filtro, rutCliente: e.target.value })}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Documento</InputLabel>
                <Select
                  value={filtro.tipoDocumento}
                  label="Tipo Documento"
                  onChange={(e) => setFiltro({ ...filtro, tipoDocumento: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="1">Factura</MenuItem>
                  <MenuItem value="2">Cheque</MenuItem>
                  <MenuItem value="3">Letra</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <DatePicker
                label="Fecha Desde"
                value={filtro.fechaDesde}
                onChange={(newValue) => setFiltro({ ...filtro, fechaDesde: newValue as Dayjs | null })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <DatePicker
                label="Fecha Hasta"
                value={filtro.fechaHasta}
                onChange={(newValue) => setFiltro({ ...filtro, fechaHasta: newValue as Dayjs | null })}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={cargarResumen}
                sx={{ mr: 1 }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setFiltro({
                    rutCliente: '',
                    tipoDocumento: '',
                    fechaDesde: null,
                    fechaHasta: null,
                    estado: '',
                  });
                  cargarResumen();
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tarjetas Resumen */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#e3f2fd' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{totales.cantidadClientes}</Typography>
                    <Typography color="text.secondary">Clientes con Excedentes</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#e8f5e9' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
                  <Box>
                    <Typography variant="h5">{formatCurrency(totales.montoTotal)}</Typography>
                    <Typography color="text.secondary">Monto Total</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ bgcolor: '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MoneyIcon sx={{ fontSize: 40, color: '#ed6c02', mr: 2 }} />
                  <Box>
                    <Typography variant="h5">{formatCurrency(totales.saldoTotal)}</Typography>
                    <Typography color="text.secondary">Saldo Disponible</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Grilla de Resumen por Cliente */}
        <Paper sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            Excedentes por Cliente
          </Typography>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>RUT Cliente</TableCell>
                  <TableCell>Nombre Cliente</TableCell>
                  <TableCell align="right">Monto Total</TableCell>
                  <TableCell align="right">Saldo Disponible</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && !resumen.length ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : resumen.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No se encontraron excedentes
                    </TableCell>
                  </TableRow>
                ) : (
                  resumen.map((r) => (
                    <TableRow 
                      key={r.rutCliente}
                      hover
                      selected={clienteSeleccionado?.rutCliente === r.rutCliente}
                      onClick={() => handleClienteClick(r)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{r.rutClienteFormateado}</TableCell>
                      <TableCell>{r.nombreCliente}</TableCell>
                      <TableCell align="right">{formatCurrency(r.montoTotalExcedentes)}</TableCell>
                      <TableCell align="right">{formatCurrency(r.saldoTotalExcedentes)}</TableCell>
                      <TableCell align="center">
                        <Chip label={r.cantidadExcedentes} size="small" color="primary" />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Ver detalle">
                          <IconButton size="small" color="primary">
                            <SearchIcon />
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

        {/* Detalle de Excedentes del Cliente Seleccionado */}
        {clienteSeleccionado && (
          <Paper>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
              Excedentes Disponibles - {clienteSeleccionado.nombreCliente}
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>N° Excedente</TableCell>
                    <TableCell>N° Documento</TableCell>
                    <TableCell>Fecha Generación</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell align="right">Saldo</TableCell>
                    <TableCell align="center">Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {excedentesDetalle.map((exc) => (
                    <TableRow key={`${exc.numeroExcedente}-${exc.numeroDocumento}`} hover>
                      <TableCell>{exc.numeroExcedente}</TableCell>
                      <TableCell>{exc.numeroDocumento}</TableCell>
                      <TableCell>{formatDayjs(exc.fechaGeneracion)}</TableCell>
                      <TableCell align="right">{formatCurrency(exc.montoExcedente)}</TableCell>
                      <TableCell align="right">{formatCurrency(exc.saldoExcedente)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Aplicar excedente">
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => {
                              setExcedentesSeleccionados([exc]);
                              setDialogAplicar(true);
                            }}
                            disabled={exc.saldoExcedente <= 0}
                          >
                            <ApplyIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Dialog para Aplicar Excedente */}
        <Dialog open={dialogAplicar} onClose={() => setDialogAplicar(false)}>
          <DialogTitle>Aplicar Excedente</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ingrese el monto a aplicar del excedente seleccionado.
            </Typography>
            <TextField
              fullWidth
              label="Monto a Aplicar"
              type="number"
              value={montoAplicar}
              onChange={(e) => setMontoAplicar(e.target.value)}
              inputProps={{ min: 0, step: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogAplicar(false)}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={handleAplicarExcedente}
              disabled={!montoAplicar || loading}
            >
              Aplicar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Excedentes;
