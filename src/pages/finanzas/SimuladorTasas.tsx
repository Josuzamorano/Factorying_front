import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Breadcrumbs,
  Link,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Divider,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

interface SimulacionResultado {
  tasaBase: number;
  tasaMora: number;
  tasaMaximaConvencional: number;
  spread: number;
  tasaFinal: number;
  interesNeto: number;
  interesMora: number;
  totalDescuento: number;
  montoLiquido: number;
  tramoAplicado: string;
  observaciones: string;
}

const tiposMoneda = [
  { valor: 1, descripcion: 'Peso', simbolo: '$' },
  { valor: 2, descripcion: 'Dólar', simbolo: 'USD' },
  { valor: 3, descripcion: 'UF', simbolo: 'UF' },
];

const SimuladorTasas: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<SimulacionResultado | null>(null);
  
  const [formData, setFormData] = useState({
    fecha: dayjs(),
    tipoMoneda: 1,
    diasOperacion: 30,
    montoOperacion: 10000000,
    spread: 0.5,
  });

  const simular = async () => {
    setLoading(true);
    try {
      // Simulación con datos de ejemplo
      const tasaBase = 1.5;
      const tasaMora = 3.0;
      const tasaMaximaConvencional = 2.5;
      const spread = formData.spread;
      const tasaFinal = tasaBase + spread;
      
      const interesNeto = formData.montoOperacion * (tasaFinal / 100) * (formData.diasOperacion / 30);
      const interesMora = formData.montoOperacion * (tasaMora / 100) * (formData.diasOperacion / 30);
      const totalDescuento = interesNeto;
      const montoLiquido = formData.montoOperacion - totalDescuento;

      setResultado({
        tasaBase,
        tasaMora,
        tasaMaximaConvencional,
        spread,
        tasaFinal,
        interesNeto: Math.round(interesNeto),
        interesMora: Math.round(interesMora),
        totalDescuento: Math.round(totalDescuento),
        montoLiquido: Math.round(montoLiquido),
        tramoAplicado: 'De 5 a 20 Millones',
        observaciones: `Tasa vigente desde ${formData.fecha.format('DD/MM/YYYY')}, tramo ${formData.diasOperacion} días`,
      });
    } catch (error) {
      console.error('Error en simulación:', error);
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    setFormData({
      fecha: dayjs(),
      tipoMoneda: 1,
      diasOperacion: 30,
      montoOperacion: 10000000,
      spread: 0.5,
    });
    setResultado(null);
  };

  const formatCurrency = (value: number) => {
    const moneda = tiposMoneda.find(m => m.valor === formData.tipoMoneda);
    if (moneda?.valor === 1) {
      return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
      }).format(value);
    }
    return `${moneda?.simbolo} ${value.toLocaleString('es-CL', { minimumFractionDigits: 2 })}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/principal'); }}>
            Inicio
          </Link>
          <Link underline="hover" color="inherit" href="#" onClick={(e) => { e.preventDefault(); navigate('/finanzas'); }}>
            Finanzas
          </Link>
          <Typography color="text.primary">Simulador</Typography>
        </Breadcrumbs>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/finanzas')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Simulador de Tasas</Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Formulario de entrada */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Parámetros de Simulación</Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid size={12}>
                  <DatePicker
                    label="Fecha Operación"
                    value={formData.fecha}
                    onChange={(newValue) => setFormData({ ...formData, fecha: newValue || dayjs() })}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>

                <Grid size={12}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo Moneda</InputLabel>
                    <Select
                      value={formData.tipoMoneda}
                      label="Tipo Moneda"
                      onChange={(e) => setFormData({ ...formData, tipoMoneda: Number(e.target.value) })}
                    >
                      {tiposMoneda.map((m) => (
                        <MenuItem key={m.valor} value={m.valor}>{m.descripcion}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Días de Operación"
                    type="number"
                    value={formData.diasOperacion}
                    onChange={(e) => setFormData({ ...formData, diasOperacion: parseInt(e.target.value) })}
                    inputProps={{ min: 1, max: 360 }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Monto de Operación"
                    type="number"
                    value={formData.montoOperacion}
                    onChange={(e) => setFormData({ ...formData, montoOperacion: parseFloat(e.target.value) })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Spread Cliente (%)"
                    type="number"
                    value={formData.spread}
                    onChange={(e) => setFormData({ ...formData, spread: parseFloat(e.target.value) })}
                    inputProps={{ min: 0, max: 10, step: 0.1 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={limpiar}
                  >
                    Limpiar
                  </Button>
                </Grid>
                <Grid size={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CalculateIcon />}
                    onClick={simular}
                    disabled={loading}
                  >
                    Simular
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Resultados */}
          <Grid size={{ xs: 12, md: 7 }}>
            {resultado ? (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>Resultado de la Simulación</Typography>
                <Divider sx={{ mb: 3 }} />

                <Alert severity="success" sx={{ mb: 3 }}>
                  <strong>Tramo Aplicado:</strong> {resultado.tramoAplicado}<br />
                  {resultado.observaciones}
                </Alert>

                {/* Tasas */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Tasas Aplicadas
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ backgroundColor: '#e3f2fd' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">Tasa Base</Typography>
                        <Typography variant="h5">{resultado.tasaBase.toFixed(2)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ backgroundColor: '#fff3e0' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">Spread</Typography>
                        <Typography variant="h5">{resultado.spread.toFixed(2)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ backgroundColor: '#e8f5e9' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">Tasa Final</Typography>
                        <Typography variant="h5" color="success.main">{resultado.tasaFinal.toFixed(2)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Card sx={{ backgroundColor: '#fce4ec' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">Tasa Mora</Typography>
                        <Typography variant="h5">{resultado.tasaMora.toFixed(2)}%</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Montos */}
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Cálculo de Montos
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary">Monto Operación</Typography>
                        <Typography variant="h6">{formatCurrency(formData.montoOperacion)}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary">Interés Neto</Typography>
                        <Typography variant="h6" color="warning.main">
                          - {formatCurrency(resultado.interesNeto)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary">Total Descuento</Typography>
                        <Typography variant="h6" color="error.main">
                          - {formatCurrency(resultado.totalDescuento)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card sx={{ backgroundColor: '#e8f5e9' }}>
                      <CardContent>
                        <Typography variant="body2" color="textSecondary">Monto Líquido</Typography>
                        <Typography variant="h5" color="success.main">
                          {formatCurrency(resultado.montoLiquido)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Información adicional */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Interés mora estimado (referencial):</strong> {formatCurrency(resultado.interesMora)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Tasa máxima convencional:</strong> {resultado.tasaMaximaConvencional.toFixed(2)}%
                  </Typography>
                </Box>
              </Paper>
            ) : (
              <Paper sx={{ p: 5, textAlign: 'center' }}>
                <CalculateIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Ingrese los parámetros y presione "Simular"
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Obtendrá el detalle de tasas y montos calculados
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default SimuladorTasas;
