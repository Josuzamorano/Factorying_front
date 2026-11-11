import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, Divider, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface Deudor {
  rutDeudor: number;
  nombreDeudor: string;
}

interface Documento {
  numeroOperacion: number;
  tipoDocumento: number;
  descripcionTipoDocumento: string;
  numeroDocumento: number;
  fechaVencimiento: string;
  montoDocumento: number;
  saldoPendiente: number;
  saldoFinanciado: number;
  tasaMora: number;
  montoMora: number;
  deudaNeta: number;
  abono: number;
}

const PagoDeudor = () => {
  const [deudores, setDeudores] = useState<Deudor[]>([]);
  const [selectedDeudor, setSelectedDeudor] = useState<Deudor | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<number>(1);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [montoPago, setMontoPago] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{tipo: 'success' | 'error', texto: string} | null>(null);

  // Panel de recaudación (reserved for future use)
  const [_showRecaudacion, _setShowRecaudacion] = useState(false);
  const [_numDocRecaudacion, _setNumDocRecaudacion] = useState('');
  const [_codigoBanco, _setCodigoBanco] = useState('');
  const [_codigoPlaza, _setCodigoPlaza] = useState('');
  const [_montoRecaudacion, _setMontoRecaudacion] = useState('');
  const [_fechaDeposito, _setFechaDeposito] = useState(new Date().toISOString().split('T')[0]);

  const tiposDocumento = [
    { value: 1, label: 'Factura' },
    { value: 2, label: 'Cheque' },
    { value: 3, label: 'Letra' },
  ];

  useEffect(() => {
    // Cargar deudores
    fetchDeudores();
  }, []);

  const fetchDeudores = async () => {
    try {
      const response = await fetch('/api/deudor');
      if (response.ok) {
        const data = await response.json();
        setDeudores(data);
      }
    } catch (error) {
      console.error('Error cargando deudores:', error);
    }
  };

  const buscarDocumentos = async () => {
    if (!selectedDeudor) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/cobranza/documentos/deudor/${selectedDeudor.rutDeudor}?tipoDocumento=${tipoDocumento}`);
      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error('Error buscando documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDocumento = (doc: Documento) => {
    setSelectedDoc(doc);
    setMontoPago(doc.saldoPendiente.toString());
  };

  const handleGuardarPago = async () => {
    if (!selectedDoc || !selectedDeudor) return;
    
    try {
      const pago = {
        fechaPago: new Date().toISOString(),
        tipoDocumento: selectedDoc.tipoDocumento,
        numeroDocumento: selectedDoc.numeroDocumento,
        numeroOperacion: selectedDoc.numeroOperacion,
        rutCliente: 0, // Se obtiene del documento
        rutDeudor: selectedDeudor.rutDeudor,
        montoDocumento: selectedDoc.montoDocumento,
        saldoDocumento: selectedDoc.saldoPendiente,
        montoPago: parseFloat(montoPago),
        montoMora: selectedDoc.montoMora,
        montoDescuento: 0,
        montoAbono: parseFloat(montoPago),
        deudaNeta: selectedDoc.deudaNeta,
        tasaMora: selectedDoc.tasaMora,
        tasaNuevaMora: selectedDoc.tasaMora,
        tipoPago: 1, // Pago Deudor
        conGestion: false,
        usuario: 'admin'
      };

      const response = await fetch('/api/cobranza/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pago)
      });

      if (response.ok) {
        setMensaje({ tipo: 'success', texto: 'Pago registrado exitosamente' });
        setSelectedDoc(null);
        setMontoPago('');
        buscarDocumentos();
      } else {
        setMensaje({ tipo: 'error', texto: 'Error al registrar el pago' });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Pago Deudor - Recaudación
      </Typography>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 2 }} onClose={() => setMensaje(null)}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Búsqueda */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <Autocomplete
              options={deudores}
              getOptionLabel={(option) => `${option.rutDeudor} - ${option.nombreDeudor}`}
              value={selectedDeudor}
              onChange={(_, value) => setSelectedDeudor(value)}
              renderInput={(params) => <TextField {...params} label="Deudor" size="small" />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo Documento</InputLabel>
              <Select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as number)} label="Tipo Documento">
                {tiposDocumento.map(t => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={buscarDocumentos} disabled={!selectedDeudor || loading} fullWidth>
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista de documentos */}
      <Paper sx={{ mb: 3 }}>
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nro. Doc</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Nro. Ope</TableCell>
                <TableCell>Vencimiento</TableCell>
                <TableCell align="right">Monto</TableCell>
                <TableCell align="right">Saldo</TableCell>
                <TableCell align="right">Mora</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documentos.map((doc) => (
                <TableRow 
                  key={`${doc.tipoDocumento}-${doc.numeroDocumento}`}
                  hover
                  selected={selectedDoc?.numeroDocumento === doc.numeroDocumento}
                  onClick={() => handleSelectDocumento(doc)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{doc.numeroDocumento}</TableCell>
                  <TableCell>{doc.descripcionTipoDocumento}</TableCell>
                  <TableCell>{doc.numeroOperacion}</TableCell>
                  <TableCell>{doc.fechaVencimiento ? new Date(doc.fechaVencimiento).toLocaleDateString() : '-'}</TableCell>
                  <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
                  <TableCell align="right">{formatCurrency(doc.saldoPendiente)}</TableCell>
                  <TableCell align="right">{formatCurrency(doc.montoMora)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Detalle de pago */}
      {selectedDoc && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Detalle del Pago</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField label="Nro. Documento" value={selectedDoc.numeroDocumento} disabled fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField label="Saldo Documento" value={formatCurrency(selectedDoc.saldoPendiente)} disabled fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField label="Monto Mora" value={formatCurrency(selectedDoc.montoMora)} disabled fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField label="Deuda Neta" value={formatCurrency(selectedDoc.deudaNeta)} disabled fullWidth size="small" />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField
                label="Monto a Pagar"
                value={montoPago}
                onChange={(e) => setMontoPago(e.target.value)}
                type="number"
                fullWidth
                size="small"
                sx={{ backgroundColor: '#ffff00' }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => setSelectedDoc(null)}>
                  Cancelar
                </Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleGuardarPago}>
                  Aceptar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default PagoDeudor;
