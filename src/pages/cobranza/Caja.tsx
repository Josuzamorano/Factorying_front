import { useState } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem,
  FormControlLabel, RadioGroup, Radio, Card, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';

interface MovimientoCaja {
  numeroMovimiento: number;
  fechaMovimiento: string;
  tipoDocumento: number;
  descripcionTipoDocumento: string;
  numeroDocumento: number;
  numeroOperacion: number;
  rutCliente: number;
  nombreCliente: string;
  rutDeudor: number;
  nombreDeudor: string;
  monto: number;
  estadoPago: number;
  usuarioCaja: string;
}

const Caja = () => {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const [estadoCaja, setEstadoCaja] = useState<string>('actuales');
  const [estadoPago, setEstadoPago] = useState<string>('todos');
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const tiposDocumento = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Factura' },
    { value: '2', label: 'Cheque' },
    { value: '3', label: 'Letra' },
  ];

  const buscar = async () => {
    setLoading(true);
    try {
      const filtro = {
        fecha,
        tipoDocumento: tipoDocumento ? parseInt(tipoDocumento) : null,
        estadoCaja: estadoCaja === 'actuales' ? 1 : estadoCaja === 'retencion' ? 2 : 3,
        estadoPago: estadoPago === 'todos' ? 0 : 
                    estadoPago === 'pendientes' ? 1 :
                    estadoPago === 'rechazados' ? 3 :
                    estadoPago === 'aprobados' ? 2 : 4
      };

      const response = await fetch('/api/cobranza/caja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtro)
      });

      if (response.ok) {
        const data = await response.json();
        setMovimientos(data);
      }
    } catch (error) {
      console.error('Error buscando movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!selectedRow) return;
    try {
      const response = await fetch(`/api/cobranza/caja/aprobar/${selectedRow}?usuario=admin`, {
        method: 'PUT'
      });
      if (response.ok) {
        buscar();
        setSelectedRow(null);
      }
    } catch (error) {
      console.error('Error aprobando pago:', error);
    }
  };

  const handleRechazar = async () => {
    if (!selectedRow) return;
    try {
      const response = await fetch(`/api/cobranza/caja/rechazar/${selectedRow}?usuario=admin`, {
        method: 'PUT'
      });
      if (response.ok) {
        buscar();
        setSelectedRow(null);
      }
    } catch (error) {
      console.error('Error rechazando pago:', error);
    }
  };

  const handleEliminar = async () => {
    if (!selectedRow) return;
    try {
      const response = await fetch(`/api/cobranza/caja/eliminar/${selectedRow}?usuario=admin`, {
        method: 'PUT'
      });
      if (response.ok) {
        buscar();
        setSelectedRow(null);
      }
    } catch (error) {
      console.error('Error eliminando pago:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const getEstadoChip = (estado: number) => {
    switch (estado) {
      case 1: return <Chip label="Pendiente" size="small" color="warning" />;
      case 2: return <Chip label="Aprobado" size="small" color="success" />;
      case 3: return <Chip label="Rechazado" size="small" color="error" />;
      case 4: return <Chip label="Eliminado" size="small" color="default" />;
      default: return <Chip label="Desconocido" size="small" />;
    }
  };

  const totalMonto = movimientos.reduce((sum, m) => sum + m.monto, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Caja - Gestión de Pagos
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              label="Fecha"
              type="Dayjs"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo Documento</InputLabel>
              <Select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} label="Tipo Documento">
                {tiposDocumento.map(t => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ p: 1 }}>
              <Typography variant="caption" color="primary">Estado Caja</Typography>
              <RadioGroup row value={estadoCaja} onChange={(e) => setEstadoCaja(e.target.value)}>
                <FormControlLabel value="actuales" control={<Radio size="small" />} label="Actuales" />
                <FormControlLabel value="retencion" control={<Radio size="small" />} label="En Retención" />
                <FormControlLabel value="procesados" control={<Radio size="small" />} label="Procesados" />
              </RadioGroup>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined" sx={{ p: 1 }}>
              <Typography variant="caption" color="primary">Estado Pago</Typography>
              <RadioGroup row value={estadoPago} onChange={(e) => setEstadoPago(e.target.value)}>
                <FormControlLabel value="todos" control={<Radio size="small" />} label="Todos" />
                <FormControlLabel value="pendientes" control={<Radio size="small" />} label="Pendientes" />
                <FormControlLabel value="rechazados" control={<Radio size="small" />} label="Rechazados" />
                <FormControlLabel value="aprobados" control={<Radio size="small" />} label="Aprobados" />
                <FormControlLabel value="eliminados" control={<Radio size="small" />} label="Eliminados" />
              </RadioGroup>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" startIcon={<SearchIcon />} onClick={buscar} disabled={loading}>
            Buscar
          </Button>
        </Box>
      </Paper>

      {/* Resultados */}
      <Paper>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nro. Mov</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Nro. Doc</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Deudor</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Usuario</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((m) => (
                <TableRow 
                  key={m.numeroMovimiento} 
                  hover 
                  selected={selectedRow === m.numeroMovimiento}
                  onClick={() => setSelectedRow(m.numeroMovimiento)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{m.numeroMovimiento}</TableCell>
                  <TableCell>{new Date(m.fechaMovimiento).toLocaleDateString()}</TableCell>
                  <TableCell>{m.descripcionTipoDocumento}</TableCell>
                  <TableCell>{m.numeroDocumento}</TableCell>
                  <TableCell>{m.nombreCliente}</TableCell>
                  <TableCell>{m.nombreDeudor}</TableCell>
                  <TableCell align="right">{formatCurrency(m.monto)}</TableCell>
                  <TableCell>{getEstadoChip(m.estadoPago)}</TableCell>
                  <TableCell>{m.usuarioCaja}</TableCell>
                </TableRow>
              ))}
              {movimientos.length > 0 && (
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell colSpan={6}><strong>TOTAL: {movimientos.length} registros</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(totalMonto)}</strong></TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Acciones */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<CheckCircleIcon />} 
            onClick={handleAprobar}
            disabled={!selectedRow}
          >
            Aprobar
          </Button>
          <Button 
            variant="contained" 
            color="warning" 
            startIcon={<CancelIcon />} 
            onClick={handleRechazar}
            disabled={!selectedRow}
          >
            Rechazar
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={handleEliminar}
            disabled={!selectedRow}
          >
            Eliminar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Caja;
