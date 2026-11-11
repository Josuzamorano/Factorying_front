// ====================================================
// Cartola Cliente - Migrado de F_GC1900.frm
// ====================================================

import React, { useState } from 'react';
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
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as CargoIcon,
  TrendingDown as AbonoIcon,
  AccountBalance as SaldoIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';

interface MovimientoCartola {
  rutCliente: number;
  nombreCliente: string;
  fecha: string;
  tipoMovimiento: string;
  tipoMovimientoDescripcion: string;
  descripcion: string;
  referencia: string;
  cargo: number;
  abono: number;
  saldo: number;
}

interface ResumenCartola {
  rutCliente: number;
  nombreCliente: string;
  totalCargos: number;
  totalAbonos: number;
  saldoActual: number;
  cantidadMovimientos: number;
}

interface Filtro {
  rutCliente: string;
  fechaDesde: Dayjs | null;
  fechaHasta: Dayjs | null;
  tipoMovimiento: string;
}

const CartolaCliente: React.FC = () => {
  const [movimientos, setMovimientos] = useState<MovimientoCartola[]>([]);
  const [resumen, setResumen] = useState<ResumenCartola | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filtro, setFiltro] = useState<Filtro>({
    rutCliente: '',
    fechaDesde: null,
    fechaHasta: null,
    tipoMovimiento: '',
  });

  const cargarCartola = async () => {
    if (!filtro.rutCliente) {
      setError('Debe ingresar un RUT de cliente');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('rutCliente', filtro.rutCliente);
      if (filtro.fechaDesde) params.append('fechaDesde', filtro.fechaDesde.toISOString());
      if (filtro.fechaHasta) params.append('fechaHasta', filtro.fechaHasta.toISOString());
      if (filtro.tipoMovimiento) params.append('tipoMovimiento', filtro.tipoMovimiento);

      const [cartolaRes, resumenRes] = await Promise.all([
        fetch(`/api/comercial/cartola?${params}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch(`/api/comercial/cartola/resumen/${filtro.rutCliente}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (!cartolaRes.ok) throw new Error('Error al cargar cartola');
      if (!resumenRes.ok) throw new Error('Error al cargar resumen');
      
      const cartolaData = await cartolaRes.json();
      const resumenData = await resumenRes.json();
      
      setMovimientos(cartolaData);
      setResumen(resumenData);
    } catch (err) {
      setError('Error al cargar cartola del cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = () => {
    // Crear CSV simple para exportar
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Referencia', 'Cargo', 'Abono', 'Saldo'];
    const rows = movimientos.map(m => [
      formatDayjs(m.fecha),
      m.tipoMovimientoDescripcion,
      m.descripcion,
      m.referencia,
      m.cargo.toString(),
      m.abono.toString(),
      m.saldo.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cartola_${filtro.rutCliente}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
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

  const getTipoMovimientoChip = (tipo: string) => {
    const config: Record<string, { color: 'error' | 'success' | 'info' | 'warning' | 'default'; label: string }> = {
      'OPE': { color: 'error', label: 'Operación' },
      'PAG': { color: 'success', label: 'Pago' },
      'EXC': { color: 'info', label: 'Excedente' },
      'PRO': { color: 'warning', label: 'Prórroga' },
      'GIR': { color: 'default', label: 'Giro' },
    };
    const c = config[tipo] || { color: 'default', label: tipo };
    return <Chip label={c.label} color={c.color} size="small" />;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#7b1fa2' }}>
          Cartola de Cliente
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
                required
                label="RUT Cliente"
                value={filtro.rutCliente}
                onChange={(e) => setFiltro({ ...filtro, rutCliente: e.target.value })}
                size="small"
                placeholder="Ej: 12345678"
              />
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
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Movimiento</InputLabel>
                <Select
                  value={filtro.tipoMovimiento}
                  label="Tipo Movimiento"
                  onChange={(e) => setFiltro({ ...filtro, tipoMovimiento: e.target.value })}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="OPE">Operación</MenuItem>
                  <MenuItem value="PAG">Pago</MenuItem>
                  <MenuItem value="EXC">Excedente</MenuItem>
                  <MenuItem value="PRO">Prórroga</MenuItem>
                  <MenuItem value="GIR">Giro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={cargarCartola}
                sx={{ mr: 1 }}
              >
                Buscar
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setFiltro({ rutCliente: '', fechaDesde: null, fechaHasta: null, tipoMovimiento: '' });
                  setMovimientos([]);
                  setResumen(null);
                }}
              >
                Limpiar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Tarjetas Resumen */}
        {resumen && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                {resumen.nombreCliente}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: '#ffebee' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CargoIcon sx={{ fontSize: 40, color: '#d32f2f', mr: 2 }} />
                    <Box>
                      <Typography variant="h5">{formatCurrency(resumen.totalCargos)}</Typography>
                      <Typography color="text.secondary">Total Cargos</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: '#e8f5e9' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AbonoIcon sx={{ fontSize: 40, color: '#388e3c', mr: 2 }} />
                    <Box>
                      <Typography variant="h5">{formatCurrency(resumen.totalAbonos)}</Typography>
                      <Typography color="text.secondary">Total Abonos</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card sx={{ bgcolor: resumen.saldoActual >= 0 ? '#e3f2fd' : '#fff3e0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SaldoIcon sx={{ fontSize: 40, color: resumen.saldoActual >= 0 ? '#1976d2' : '#ed6c02', mr: 2 }} />
                    <Box>
                      <Typography variant="h5">{formatCurrency(resumen.saldoActual)}</Typography>
                      <Typography color="text.secondary">Saldo Actual</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ExportIcon />}
                      onClick={exportarExcel}
                      disabled={movimientos.length === 0}
                    >
                      Exportar CSV
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabla de Movimientos */}
        <Paper>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Referencia</TableCell>
                  <TableCell align="right">Cargo</TableCell>
                  <TableCell align="right">Abono</TableCell>
                  <TableCell align="right">Saldo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : movimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {filtro.rutCliente 
                        ? 'No se encontraron movimientos'
                        : 'Ingrese un RUT de cliente para consultar su cartola'}
                    </TableCell>
                  </TableRow>
                ) : (
                  movimientos.map((m, index) => (
                    <TableRow key={`${m.fecha}-${m.referencia}-${index}`} hover>
                      <TableCell>{formatDayjs(m.fecha)}</TableCell>
                      <TableCell>{getTipoMovimientoChip(m.tipoMovimiento)}</TableCell>
                      <TableCell>{m.descripcion}</TableCell>
                      <TableCell>{m.referencia}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: m.cargo > 0 ? '#d32f2f' : 'inherit' }}
                      >
                        {m.cargo > 0 ? formatCurrency(m.cargo) : '-'}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: m.abono > 0 ? '#388e3c' : 'inherit' }}
                      >
                        {m.abono > 0 ? formatCurrency(m.abono) : '-'}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          fontWeight: 'bold',
                          color: m.saldo >= 0 ? '#1976d2' : '#d32f2f',
                        }}
                      >
                        {formatCurrency(m.saldo)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default CartolaCliente;
