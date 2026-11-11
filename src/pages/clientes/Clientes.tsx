import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridPaginationModel,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  clienteService,
  type ClienteListDto,
  type ClienteSearchDto,
  type PagedResult,
} from '../../services/cliente.service';

const Clientes: React.FC = () => {
  const navigate = useNavigate();

  // Estado de datos
  const [clientes, setClientes] = useState<ClienteListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estado de búsqueda
  const [searchRut, setSearchRut] = useState('');
  const [searchRazonSocial, setSearchRazonSocial] = useState('');
  const [searchTipoCliente, setSearchTipoCliente] = useState<number | ''>('');
  const [searchEstado, setSearchEstado] = useState<number | ''>('');

  // Estado de paginación
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 25,
  });
  const [totalRows, setTotalRows] = useState(0);

  // Búsqueda de clientes
  const buscarClientes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams: ClienteSearchDto = {
        rut: searchRut || undefined,
        razonSocial: searchRazonSocial || undefined,
        tipoCliente: searchTipoCliente || undefined,
        estadoCliente: searchEstado !== '' ? searchEstado : undefined,
        pageNumber: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
      };

      const result: PagedResult<ClienteListDto> = await clienteService.search(searchParams);
      setClientes(result.items);
      setTotalRows(result.totalItems);
    } catch (err: unknown) {
      console.error('Error buscando clientes:', err);
      setError('Error al buscar clientes. Verifique la conexión con el servidor.');
      setClientes([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [searchRut, searchRazonSocial, searchTipoCliente, searchEstado, paginationModel]);

  // Cargar datos iniciales
  useEffect(() => {
    buscarClientes();
  }, [paginationModel]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setSearchRut('');
    setSearchRazonSocial('');
    setSearchTipoCliente('');
    setSearchEstado('');
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize });
  };

  // Navegación
  const handleNuevo = () => {
    navigate('/clientes/nuevo');
  };

  const handleVer = (rut: number) => {
    navigate(`/clientes/${rut}`);
  };

  const handleEditar = (rut: number) => {
    navigate(`/clientes/${rut}/editar`);
  };

  const handleEliminar = async (rut: number) => {
    if (window.confirm('¿Está seguro de desactivar este cliente?')) {
      try {
        await clienteService.delete(rut);
        buscarClientes();
      } catch (err) {
        console.error('Error eliminando cliente:', err);
        setError('Error al desactivar el cliente.');
      }
    }
  };

  // Columnas del DataGrid
  const columns: GridColDef[] = [
    {
      field: 'rutFormateado',
      headerName: 'RUT',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" fontWeight="medium">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'nombreCompleto',
      headerName: 'Nombre / Razón Social',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'nombreEjecutivo',
      headerName: 'Ejecutivo',
      width: 150,
      renderCell: (params: GridRenderCellParams) => params.value || '-',
    },
    {
      field: 'activo',
      headerName: 'Estado',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value ? 'Activo' : 'Inactivo'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 150,
      sortable: false,
      filterable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<ClienteListDto>) => (
        <Box>
          <Tooltip title="Ver detalle">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleVer(params.row.rutCliente)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditar(params.row.rutCliente)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Desactivar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleEliminar(params.row.rutCliente)}
              disabled={!params.row.activo}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Título */}
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Carpeta Cliente
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Gestión de clientes del sistema de factoring
      </Typography>

      {/* Filtros de búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Búsqueda
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="RUT"
                placeholder="Ej: 12345678-9"
                value={searchRut}
                onChange={(e) => setSearchRut(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarClientes()}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Razón Social / Nombre"
                value={searchRazonSocial}
                onChange={(e) => setSearchRazonSocial(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarClientes()}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={searchTipoCliente}
                  label="Tipo"
                  onChange={(e) => setSearchTipoCliente(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value={1}>Natural</MenuItem>
                  <MenuItem value={2}>Jurídico</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={searchEstado}
                  label="Estado"
                  onChange={(e) => setSearchEstado(e.target.value as number | '')}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value={1}>Activo</MenuItem>
                  <MenuItem value={0}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={buscarClientes}
                  fullWidth
                >
                  Buscar
                </Button>
                <Tooltip title="Limpiar filtros">
                  <IconButton onClick={limpiarFiltros}>
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Barra de acciones */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={handleNuevo}
        >
          Nuevo Cliente
        </Button>
        <Tooltip title="Refrescar">
          <IconButton onClick={buscarClientes}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabla de clientes */}
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={clientes}
          columns={columns}
          getRowId={(row: ClienteListDto) => row.rutCliente}
          loading={loading}
          paginationMode="server"
          rowCount={totalRows}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          localeText={{
            noRowsLabel: 'No hay clientes para mostrar',
          }}
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default Clientes;
