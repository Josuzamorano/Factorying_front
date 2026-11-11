import { useState } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  FormControlLabel, Checkbox, RadioGroup, Radio, Card, CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface VerificacionItem {
  rutCliente: number;
  nombreCliente: string;
  rutDeudor: number;
  nombreDeudor: string;
  numeroOperacion: number;
  cantidadDocumentos: number;
  montoTotal: number;
}

const VerificacionDocumentos = () => {
  const [tipoDocumento, setTipoDocumento] = useState<number>(0);
  const [otorgado, setOtorgado] = useState<string>('no');
  const [verificado, setVerificado] = useState<string>('no');
  const [soloCaratula, setSoloCaratula] = useState(false);
  const [fechaDesde, setFechaDesde] = useState(new Date().toISOString().split('T')[0]);
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split('T')[0]);
  const [verificaciones, setVerificaciones] = useState<VerificacionItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros por monto
  const [rango1, setRango1] = useState(true);  // 0 - 9,999,999
  const [rango2, setRango2] = useState(true);  // 10,000,000 - 19,999,999
  const [rango3, setRango3] = useState(true);  // >= 20,000,000

  const tiposDocumento = [
    { value: 0, label: 'Factura' },
    { value: 1, label: 'Letra' },
    { value: 2, label: 'Cheque' },
    { value: 3, label: 'Otros' },
  ];

  const buscar = async () => {
    setLoading(true);
    try {
      const filtro = {
        tipoDocumento,
        fechaDesde,
        fechaHasta,
        otorgado: otorgado === 'si',
        verificado: verificado === 'si',
        soloCaratula,
        montoMinimo1: rango1 ? 0 : null,
        montoMaximo1: rango1 ? 9999999 : null,
        montoMinimo2: rango2 ? 10000000 : null,
        montoMaximo2: rango2 ? 19999999 : null,
        montoMinimo3: rango3 ? 20000000 : null,
        montoMaximo3: rango3 ? 9999999999999.99 : null,
      };

      const endpoint = otorgado === 'si' ? '/api/cobranza/verificacion/otorgados' : '/api/cobranza/verificacion';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtro)
      });

      if (response.ok) {
        const data = await response.json();
        setVerificaciones(data);
      }
    } catch (error) {
      console.error('Error buscando verificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatRut = (rut: number) => {
    return rut.toLocaleString('es-CL');
  };

  const totalMonto = verificaciones.reduce((sum, v) => sum + v.montoTotal, 0);
  const totalDocumentos = verificaciones.reduce((sum, v) => sum + v.cantidadDocumentos, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Verificación de Documentos
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Operación */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>Operación</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption">Otorgado</Typography>
                  <RadioGroup row value={otorgado} onChange={(e) => setOtorgado(e.target.value)}>
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                    <FormControlLabel value="si" control={<Radio size="small" />} label="Sí" />
                  </RadioGroup>
                </Box>
                {otorgado === 'no' && (
                  <FormControlLabel
                    control={<Checkbox checked={soloCaratula} onChange={(e) => setSoloCaratula(e.target.checked)} size="small" />}
                    label="Carátula"
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Documento */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>Documento</Typography>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 8 }}>
                    <Typography variant="caption">Tipo Documento</Typography>
                    <RadioGroup value={tipoDocumento} onChange={(e) => setTipoDocumento(parseInt(e.target.value))}>
                      {tiposDocumento.map(t => (
                        <FormControlLabel key={t.value} value={t.value} control={<Radio size="small" />} label={t.label} />
                      ))}
                    </RadioGroup>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Typography variant="caption">Verificado</Typography>
                    <RadioGroup value={verificado} onChange={(e) => setVerificado(e.target.value)}>
                      <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                      <FormControlLabel value="si" control={<Radio size="small" />} label="Sí" />
                    </RadioGroup>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Monto */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>Monto</Typography>
                <FormControlLabel
                  control={<Checkbox checked={rango1} onChange={(e) => setRango1(e.target.checked)} size="small" />}
                  label="0 - 9.999.999"
                />
                <FormControlLabel
                  control={<Checkbox checked={rango2} onChange={(e) => setRango2(e.target.checked)} size="small" />}
                  label="10.000.000 - 19.999.999"
                />
                <FormControlLabel
                  control={<Checkbox checked={rango3} onChange={(e) => setRango3(e.target.checked)} size="small" />}
                  label="Mayor a 20.000.000"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Fechas */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="primary" gutterBottom>Fechas</Typography>
                <TextField
                  label="Desde"
                  type="Dayjs"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mb: 1 }}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="Hasta"
                  type="Dayjs"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <Button 
                  variant="contained" 
                  startIcon={<SearchIcon />} 
                  onClick={buscar} 
                  disabled={loading}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Aceptar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados */}
      <Paper>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>RUT Cliente</TableCell>
                <TableCell>Razón Social Cliente</TableCell>
                <TableCell>RUT Deudor</TableCell>
                <TableCell>Razón Social Deudor</TableCell>
                <TableCell align="right">Nro. Ope.</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Monto</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {verificaciones.map((v, idx) => (
                <TableRow key={idx} hover sx={{ cursor: 'pointer' }}>
                  <TableCell>{formatRut(v.rutCliente)}</TableCell>
                  <TableCell>{v.nombreCliente}</TableCell>
                  <TableCell>{formatRut(v.rutDeudor)}</TableCell>
                  <TableCell>{v.nombreDeudor}</TableCell>
                  <TableCell align="right">{v.numeroOperacion}</TableCell>
                  <TableCell align="right">{v.cantidadDocumentos}</TableCell>
                  <TableCell align="right">{formatCurrency(v.montoTotal)}</TableCell>
                </TableRow>
              ))}
              {verificaciones.length > 0 && (
                <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                  <TableCell colSpan={5}><strong>TOTAL</strong></TableCell>
                  <TableCell align="right"><strong>{totalDocumentos}</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(totalMonto)}</strong></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default VerificacionDocumentos;
