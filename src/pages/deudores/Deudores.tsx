// =============================================
// Página Deudores - Módulo 3
// Lista y gestión de deudores (Migrado de F_CD1100.frm)
// =============================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  LinearProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  AccountBalance as DeudorIcon,
  Person as ClienteIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import deudorService, {
  type DeudorList,
  type DeudorSearchParams,
  categoriasRiesgo,
  estadosDeudor,
  formatCurrency,
  getMontoDisponible,
  getCategoriaColor
} from '../../services/deudor.service';
import { clienteService } from '../../services/cliente.service';

interface ClienteOption {
  rutCliente: number;
  razonSocial: string;
}

export default function Deudores() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados
  const [deudores, setDeudores] = useState<DeudorList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filtros
  const [filtroRutDeudor, setFiltroRutDeudor] = useState('');
  const [filtroRazonSocial, setFiltroRazonSocial] = useState('');
  const [filtroCliente, setFiltroCliente] = useState<number | ''>('');
  const [filtroEstado, setFiltroEstado] = useState<number | ''>('');
  const [filtroCategoria, setFiltroCategoria] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Lista de clientes para filtro
  const [clientes, setClientes] = useState<ClienteOption[]>([]);

  // Cargar clientes para el filtro
  useEffect(() => {
    const loadClientes = async () => {
      try {
        const data = await clienteService.getAll();
        setClientes(data.map((c: { rutCliente: number; nombreCompleto: string }) => ({
          rutCliente: c.rutCliente,
          razonSocial: c.nombreCompleto
        })));
      } catch (err) {
        console.error('Error cargando clientes:', err);
      }
    };
    loadClientes();
  }, []);

  // Cargar filtro de cliente desde URL si existe
  useEffect(() => {
    const clienteParam = searchParams.get('cliente');
    if (clienteParam) {
      setFiltroCliente(parseInt(clienteParam));
    }
  }, [searchParams]);

  // Cargar deudores
  const loadDeudores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: DeudorSearchParams = {
        page: page + 1,
        pageSize: rowsPerPage
      };

      if (filtroRutDeudor) params.rutDeudor = filtroRutDeudor;
      if (filtroRazonSocial) params.razonSocial = filtroRazonSocial;
      if (filtroCliente !== '') params.rutCliente = filtroCliente as number;
      if (filtroEstado !== '') params.estado = filtroEstado as number;
      if (filtroCategoria !== '') params.categoriaRiesgo = filtroCategoria as number;

      const result = await deudorService.search(params);
      setDeudores(result.items);
      setTotalCount(result.totalCount);
    } catch (err: any) {
      console.error('Error cargando deudores:', err);
      setError(err.response?.data?.message || 'Error al cargar deudores');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, filtroRutDeudor, filtroRazonSocial, filtroCliente, filtroEstado, filtroCategoria]);

  useEffect(() => {
    loadDeudores();
  }, [loadDeudores]);

  // Handlers
  const handleSearch = () => {
    setPage(0);
    loadDeudores();
  };

  const handleClearFilters = () => {
    setFiltroRutDeudor('');
    setFiltroRazonSocial('');
    setFiltroCliente('');
    setFiltroEstado('');
    setFiltroCategoria('');
    setSearchParams({});
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (rutCliente: number, rutDeudor: number) => {
    navigate(`/deudores/${rutCliente}/${rutDeudor}`);
  };

  const handleDelete = async (rutCliente: number, rutDeudor: number, razonSocial: string) => {
    if (window.confirm(`¿Está seguro de eliminar el deudor "${razonSocial}"?`)) {
      try {
        await deudorService.delete(rutCliente, rutDeudor);
        loadDeudores();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al eliminar deudor');
      }
    }
  };

  const handleNuevo = () => {
    const clienteId = filtroCliente !== '' ? `?cliente=${filtroCliente}` : '';
    navigate(`/deudores/nuevo${clienteId}`);
  };

  // Calcular totales
  const totalOtorgado = deudores.reduce((sum, d) => sum + d.montoOtorgado, 0);
  const totalOcupado = deudores.reduce((sum, d) => sum + d.montoOcupado, 0);
  const totalDisponible = totalOtorgado - totalOcupado;

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DeudorIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" component="h1">
              Carpeta Deudor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestión de deudores - Módulo CD (Migrado de F_CD1100.frm)
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<GroupIcon />}
            onClick={() => navigate('/deudores/grupos')}
          >
            Grupos
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadDeudores}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNuevo}
          >
            Nuevo Deudor
          </Button>
        </Box>
      </Box>

      {/* Resumen de totales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Otorgado
              </Typography>
              <Typography variant="h5" color="primary">
                {formatCurrency(totalOtorgado)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Ocupado
              </Typography>
              <Typography variant="h5" color="warning.main">
                {formatCurrency(totalOcupado)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Disponible
              </Typography>
              <Typography variant="h5" color="success.main">
                {formatCurrency(totalDisponible)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT Deudor"
                value={filtroRutDeudor}
                onChange={(e) => setFiltroRutDeudor(e.target.value)}
                placeholder="12345678-9"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Razón Social"
                value={filtroRazonSocial}
                onChange={(e) => setFiltroRazonSocial(e.target.value)}
                placeholder="Buscar por nombre..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Cliente</InputLabel>
                <Select
                  value={filtroCliente}
                  label="Cliente"
                  onChange={(e) => setFiltroCliente(e.target.value as number | '')}
                  startAdornment={
                    <InputAdornment position="start">
                      <ClienteIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="">Todos</MenuItem>
                  {clientes.map((c) => (
                    <MenuItem key={c.rutCliente} value={c.rutCliente}>
                      {c.razonSocial}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filtroEstado}
                  label="Estado"
                  onChange={(e) => setFiltroEstado(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {estadosDeudor.map((e) => (
                    <MenuItem key={e.value} value={e.value}>
                      {e.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría Riesgo</InputLabel>
                <Select
                  value={filtroCategoria}
                  label="Categoría Riesgo"
                  onChange={(e) => setFiltroCategoria(e.target.value as number | '')}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categoriasRiesgo.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="contained" startIcon={<SearchIcon />} onClick={handleSearch}>
              Buscar
            </Button>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClearFilters}>
              Limpiar
            </Button>
          </Box>
        </Paper>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <Paper>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>RUT</TableCell>
                <TableCell>Razón Social</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell align="right">Monto Otorgado</TableCell>
                <TableCell align="right">Monto Ocupado</TableCell>
                <TableCell align="right">Disponible</TableCell>
                <TableCell align="center">Categoría</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {deudores.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No se encontraron deudores
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                deudores.map((deudor) => (
                  <TableRow 
                    key={`${deudor.rutCliente}-${deudor.rutDeudor}`} 
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleEdit(deudor.rutCliente, deudor.rutDeudor)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {deudor.rutFormateado}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {deudor.razonSocial}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {deudor.nombreCliente || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(deudor.montoOtorgado)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="warning.main">
                        {formatCurrency(deudor.montoOcupado)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {formatCurrency(getMontoDisponible(deudor.montoOtorgado, deudor.montoOcupado))}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={categoriasRiesgo.find(c => c.value === deudor.categoriaRiesgo)?.label.charAt(0) || '?'}
                        color={getCategoriaColor(deudor.categoriaRiesgo)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={deudor.estado}
                        color={deudor.estado === 'Activo' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(deudor.rutCliente, deudor.rutDeudor)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(deudor.rutCliente, deudor.rutDeudor, deudor.razonSocial)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
}
