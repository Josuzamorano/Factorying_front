import { useState, useEffect } from 'react';
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
  TablePagination,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
  Tooltip,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Receipt as ReceiptIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface DocumentoConsultaMasiva {
  numeroOperacion: number;
  tipoDocumento: number;
  descripcionTipoDocumento: string;
  numeroDocumento: number;
  rutCliente: number;
  rutClienteFormateado: string;
  nombreCliente: string;
  rutDeudor: number;
  rutDeudorFormateado: string;
  nombreDeudor: string;
  fechaEmision: string | null;
  fechaVencimiento: string | null;
  fechaVencimientoReal: string | null;
  montoDocumento: number;
  saldoPendiente: number;
  montoAbonado: number;
  estadoDocumento: number;
  descripcionEstado: string;
  estadoCesion: number;
  descripcionCesion: string;
  diasVencidos: number;
  protestado: boolean;
  enCobranza: boolean;
  ejecutivo: string;
  codigoEjecutivo: number | null;
}

interface ResumenConsultaMasiva {
  totalDocumentos: number;
  montoTotal: number;
  saldoTotal: number;
  documentosVigentes: number;
  montoVigente: number;
  documentosVencidos: number;
  montoVencido: number;
  documentosProtestados: number;
  montoProtestado: number;
  documentosEnCobranza: number;
  montoEnCobranza: number;
  porTipoDocumento: { tipoDocumento: number; descripcionTipoDocumento: string; cantidad: number; monto: number; saldo: number }[];
  porEstado: { estado: number; descripcionEstado: string; cantidad: number; monto: number }[];
}

interface FiltroConsultaMasiva {
  rutCliente?: number | null;
  rutDeudor?: number | null;
  tipoDocumento?: number | null;
  numeroDocumento?: number | null;
  numeroOperacion?: number | null;
  fechaEmisionDesde?: string | null;
  fechaEmisionHasta?: string | null;
  fechaVencimientoDesde?: string | null;
  fechaVencimientoHasta?: string | null;
  montoMinimo?: number | null;
  montoMaximo?: number | null;
  estadoDocumento?: number | null;
  estadoCesion?: number | null;
  soloVencidos?: boolean;
  soloProtestados?: boolean;
  soloEnCobranza?: boolean;
}

const ConsultaMasiva = () => {
  const theme = useTheme();
  const [documentos, setDocumentos] = useState<DocumentoConsultaMasiva[]>([]);
  const [resumen, setResumen] = useState<ResumenConsultaMasiva | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(true);

  // Filtros
  const [rutCliente, setRutCliente] = useState('');
  const [rutDeudor, setRutDeudor] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<number | ''>('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [numeroOperacion, setNumeroOperacion] = useState('');
  const [fechaEmisionDesde, setFechaEmisionDesde] = useState<Dayjs | null>(null);
  const [fechaEmisionHasta, setFechaEmisionHasta] = useState<Dayjs | null>(null);
  const [fechaVencimientoDesde, setFechaVencimientoDesde] = useState<Dayjs | null>(null);
  const [fechaVencimientoHasta, setFechaVencimientoHasta] = useState<Dayjs | null>(null);
  const [montoMinimo, setMontoMinimo] = useState('');
  const [montoMaximo, setMontoMaximo] = useState('');
  const [estadoDocumento, setEstadoDocumento] = useState<number | ''>('');
  const [estadoCesion, setEstadoCesion] = useState<number | ''>('');
  const [soloVencidos, setSoloVencidos] = useState(false);
  const [soloProtestados, setSoloProtestados] = useState(false);
  const [soloEnCobranza, setSoloEnCobranza] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const buildFiltro = (): FiltroConsultaMasiva => {
    return {
      rutCliente: rutCliente ? parseInt(rutCliente.replace(/\D/g, '')) : null,
      rutDeudor: rutDeudor ? parseInt(rutDeudor.replace(/\D/g, '')) : null,
      tipoDocumento: tipoDocumento !== '' ? tipoDocumento : null,
      numeroDocumento: numeroDocumento ? parseInt(numeroDocumento) : null,
      numeroOperacion: numeroOperacion ? parseInt(numeroOperacion) : null,
      fechaEmisionDesde: fechaEmisionDesde?.format('YYYY-MM-DD') || null,
      fechaEmisionHasta: fechaEmisionHasta?.format('YYYY-MM-DD') || null,
      fechaVencimientoDesde: fechaVencimientoDesde?.format('YYYY-MM-DD') || null,
      fechaVencimientoHasta: fechaVencimientoHasta?.format('YYYY-MM-DD') || null,
      montoMinimo: montoMinimo ? parseFloat(montoMinimo) : null,
      montoMaximo: montoMaximo ? parseFloat(montoMaximo) : null,
      estadoDocumento: estadoDocumento !== '' ? estadoDocumento : null,
      estadoCesion: estadoCesion !== '' ? estadoCesion : null,
      soloVencidos: soloVencidos || undefined,
      soloProtestados: soloProtestados || undefined,
      soloEnCobranza: soloEnCobranza || undefined,
    };
  };

  const buscarDocumentos = async () => {
    setLoading(true);
    setError(null);

    try {
      const filtro = buildFiltro();

      const [documentosRes, resumenRes] = await Promise.all([
        fetch('/api/cobranza/consulta-masiva', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtro),
        }),
        fetch('/api/cobranza/consulta-masiva/resumen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(filtro),
        }),
      ]);

      if (!documentosRes.ok) throw new Error('Error al obtener documentos');
      if (!resumenRes.ok) throw new Error('Error al obtener resumen');

      const documentosData = await documentosRes.json();
      const resumenData = await resumenRes.json();

      setDocumentos(documentosData);
      setResumen(resumenData);
      setPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setRutCliente('');
    setRutDeudor('');
    setTipoDocumento('');
    setNumeroDocumento('');
    setNumeroOperacion('');
    setFechaEmisionDesde(null);
    setFechaEmisionHasta(null);
    setFechaVencimientoDesde(null);
    setFechaVencimientoHasta(null);
    setMontoMinimo('');
    setMontoMaximo('');
    setEstadoDocumento('');
    setEstadoCesion('');
    setSoloVencidos(false);
    setSoloProtestados(false);
    setSoloEnCobranza(false);
    setDocumentos([]);
    setResumen(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const exportarExcel = () => {
    // Exportar a CSV
    const headers = ['Operación', 'Tipo Doc', 'N° Documento', 'Cliente', 'Deudor', 'Vencimiento', 'Monto', 'Saldo', 'Días Venc.', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...documentos.map(d => [
        d.numeroOperacion,
        d.descripcionTipoDocumento,
        d.numeroDocumento,
        d.nombreCliente.replace(/,/g, ' '),
        d.nombreDeudor.replace(/,/g, ' '),
        formatDate(d.fechaVencimiento),
        d.montoDocumento,
        d.saldoPendiente,
        d.diasVencidos,
        d.descripcionEstado,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consulta_masiva_${dayjs().format('YYYYMMDD_HHmmss')}.csv`;
    link.click();
  };

  useEffect(() => {
    // Cargar datos iniciales (últimos 30 días)
    setFechaVencimientoDesde(dayjs().subtract(30, 'day'));
    setFechaVencimientoHasta(dayjs().add(30, 'day'));
  }, []);

  const getChipColor = (doc: DocumentoConsultaMasiva): 'default' | 'success' | 'warning' | 'error' => {
    if (doc.protestado) return 'error';
    if (doc.enCobranza) return 'warning';
    if (doc.diasVencidos > 0) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
        Consulta Masiva de Documentos
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterListIcon color="primary" />
            <Typography variant="h6">Filtros de Búsqueda</Typography>
          </Box>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={showFilters}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="RUT Cliente"
                value={rutCliente}
                onChange={(e) => setRutCliente(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="RUT Deudor"
                value={rutDeudor}
                onChange={(e) => setRutDeudor(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo Documento</InputLabel>
                <Select
                  value={tipoDocumento}
                  onChange={(e) => setTipoDocumento(e.target.value as number)}
                  label="Tipo Documento"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value={1}>Factura</MenuItem>
                  <MenuItem value={2}>Cheque</MenuItem>
                  <MenuItem value={3}>Letra</MenuItem>
                  <MenuItem value={4}>Otro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="N° Documento"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="N° Operación"
                value={numeroOperacion}
                onChange={(e) => setNumeroOperacion(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Vencimiento Desde"
                value={fechaVencimientoDesde}
                onChange={setFechaVencimientoDesde}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <DatePicker
                label="Vencimiento Hasta"
                value={fechaVencimientoHasta}
                onChange={setFechaVencimientoHasta}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={estadoDocumento}
                  onChange={(e) => setEstadoDocumento(e.target.value as number)}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value={1}>Vigente</MenuItem>
                  <MenuItem value={2}>Vencido</MenuItem>
                  <MenuItem value={3}>En Cobranza</MenuItem>
                  <MenuItem value={4}>Protestado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Monto Mínimo"
                value={montoMinimo}
                onChange={(e) => setMontoMinimo(e.target.value)}
                size="small"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Monto Máximo"
                value={montoMaximo}
                onChange={(e) => setMontoMaximo(e.target.value)}
                size="small"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Cesión</InputLabel>
                <Select
                  value={estadoCesion}
                  onChange={(e) => setEstadoCesion(e.target.value as number)}
                  label="Cesión"
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value={0}>No Cedido</MenuItem>
                  <MenuItem value={1}>Cedido</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={<Checkbox checked={soloVencidos} onChange={(e) => setSoloVencidos(e.target.checked)} size="small" />}
                  label="Vencidos"
                />
                <FormControlLabel
                  control={<Checkbox checked={soloProtestados} onChange={(e) => setSoloProtestados(e.target.checked)} size="small" />}
                  label="Protestados"
                />
                <FormControlLabel
                  control={<Checkbox checked={soloEnCobranza} onChange={(e) => setSoloEnCobranza(e.target.checked)} size="small" />}
                  label="Cobranza"
                />
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={limpiarFiltros}>
              Limpiar
            </Button>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={buscarDocumentos} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Buscar'}
            </Button>
          </Box>
        </Collapse>
      </Paper>

      {/* Resumen */}
      {resumen && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon />
                  <Typography variant="subtitle2">Total Documentos</Typography>
                </Box>
                <Typography variant="h4">{resumen.totalDocumentos}</Typography>
                <Typography variant="body2">{formatCurrency(resumen.montoTotal)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachMoneyIcon />
                  <Typography variant="subtitle2">Vigentes</Typography>
                </Box>
                <Typography variant="h4">{resumen.documentosVigentes}</Typography>
                <Typography variant="body2">{formatCurrency(resumen.montoVigente)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon />
                  <Typography variant="subtitle2">Vencidos</Typography>
                </Box>
                <Typography variant="h4">{resumen.documentosVencidos}</Typography>
                <Typography variant="body2">{formatCurrency(resumen.montoVencido)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: theme.palette.error.main, color: 'white' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GavelIcon />
                  <Typography variant="subtitle2">Protestados / Cobranza</Typography>
                </Box>
                <Typography variant="h4">{resumen.documentosProtestados + resumen.documentosEnCobranza}</Typography>
                <Typography variant="body2">{formatCurrency(resumen.montoProtestado + resumen.montoEnCobranza)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Barra de acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1">
          {documentos.length > 0 && `${documentos.length} documentos encontrados`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Actualizar">
            <IconButton onClick={buscarDocumentos} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Exportar Excel">
            <IconButton onClick={exportarExcel} disabled={documentos.length === 0}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir">
            <IconButton onClick={() => window.print()} disabled={documentos.length === 0}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabla de documentos */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Operación</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N° Doc</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cliente</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Deudor</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vencimiento</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Monto</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Saldo</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Días</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : documentos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    No se encontraron documentos. Use los filtros para buscar.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              documentos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doc, index) => (
                  <TableRow
                    key={`${doc.numeroOperacion}-${doc.tipoDocumento}-${doc.numeroDocumento}-${index}`}
                    hover
                    sx={{
                      bgcolor: doc.diasVencidos > 30 ? 'rgba(211, 47, 47, 0.1)' :
                               doc.diasVencidos > 0 ? 'rgba(237, 108, 2, 0.1)' : 'inherit'
                    }}
                  >
                    <TableCell>{doc.numeroOperacion}</TableCell>
                    <TableCell>
                      <Chip label={doc.descripcionTipoDocumento} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{doc.numeroDocumento}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {doc.nombreCliente}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {doc.rutClienteFormateado}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {doc.nombreDeudor}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {doc.rutDeudorFormateado}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{formatDate(doc.fechaVencimiento)}</TableCell>
                    <TableCell align="right">{formatCurrency(doc.montoDocumento)}</TableCell>
                    <TableCell align="right">{formatCurrency(doc.saldoPendiente)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={doc.diasVencidos}
                        size="small"
                        color={doc.diasVencidos > 30 ? 'error' : doc.diasVencidos > 0 ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.protestado ? 'Protestado' : doc.enCobranza ? 'Cobranza' : doc.descripcionEstado}
                        size="small"
                        color={getChipColor(doc)}
                      />
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={documentos.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Filas por página"
        />
      </TableContainer>
    </Box>
  );
};

export default ConsultaMasiva;
