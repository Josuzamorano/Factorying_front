import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Refresh,
  ExpandMore,
} from '@mui/icons-material';
import type { ParametroDto } from '../../services/master.service';
import { parametroService, PARAM_TABLES } from "../../services/master.service";

/**
 * Página de Parámetros - Migrada de F_MA1100.frm (VB6)
 * Consulta de parámetros del sistema por tabla
 */

// Mapeo de tablas de parámetros
const TABLA_NOMBRES: Record<number, string> = {
  [PARAM_TABLES.TIPO_DOCUMENTO]: 'Tipos de Documento',
  [PARAM_TABLES.ESTADO_DOCUMENTO]: 'Estados de Documento',
  [PARAM_TABLES.ESTADO_OPERACION]: 'Estados de Operación',
  [PARAM_TABLES.TIPO_CLIENTE]: 'Tipos de Cliente',
  [PARAM_TABLES.TIPO_GARANTIA]: 'Tipos de Garantía',
  [PARAM_TABLES.SUCURSAL_FACTORING]: 'Sucursales Factoring',
};

const Parametros: React.FC = () => {
  const navigate = useNavigate();
  const [parametros, setParametros] = useState<ParametroDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTabla, setSelectedTabla] = useState<number>(PARAM_TABLES.TIPO_DOCUMENTO);
  const [allParametros, setAllParametros] = useState<Map<number, ParametroDto[]>>(new Map());
  const [loadingAll, setLoadingAll] = useState(true);

  useEffect(() => {
    loadAllParametros();
  }, []);

  useEffect(() => {
    if (selectedTabla > 0) {
      loadParametrosByTabla(selectedTabla);
    }
  }, [selectedTabla]);

  const loadAllParametros = async () => {
    try {
      setLoadingAll(true);
      const data = await parametroService.getAll();
      
      // Agrupar por tabla
      const grouped = new Map<number, ParametroDto[]>();
      data.forEach((param: ParametroDto) => {
        const tablaParams = grouped.get(param.codigoTabla) || [];
        tablaParams.push(param);
        grouped.set(param.codigoTabla, tablaParams);
      });
      
      setAllParametros(grouped);
    } catch (err) {
      setError('Error al cargar los parámetros');
      console.error(err);
    } finally {
      setLoadingAll(false);
    }
  };

  const loadParametrosByTabla = async (codigoTabla: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parametroService.getByTabla(codigoTabla);
      setParametros(data);
    } catch (err) {
      setError('Error al cargar los parámetros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAllParametros();
    if (selectedTabla > 0) {
      loadParametrosByTabla(selectedTabla);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/mantenimiento')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Parámetros del Sistema
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      <Box sx={{ bgcolor: '#f5f5f5', px: 3, py: 1 }}>
        <Breadcrumbs>
          <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/principal')}>
            Inicio
          </Link>
          <Link component="button" underline="hover" color="inherit" onClick={() => navigate('/mantenimiento')}>
            Mantenimiento
          </Link>
          <Typography color="text.primary">Parámetros</Typography>
        </Breadcrumbs>
      </Box>

      {/* Contenido */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3, flex: 1 }}>
        {/* Toolbar de acciones */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Typography variant="h5">Parámetros por Tabla</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 250 }} size="small">
              <InputLabel>Tabla de Parámetros</InputLabel>
              <Select
                value={selectedTabla}
                label="Tabla de Parámetros"
                onChange={(e) => setSelectedTabla(Number(e.target.value))}
              >
                {Object.entries(PARAM_TABLES).map(([key, value]) => (
                  <MenuItem key={value} value={value}>
                    {TABLA_NOMBRES[value] || key}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Actualizar
            </Button>
          </Box>
        </Box>

        {/* Mensaje de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabla de parámetros seleccionados */}
        <Paper sx={{ width: '100%', overflow: 'hidden', mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6">
              {TABLA_NOMBRES[selectedTabla] || `Tabla ${selectedTabla}`}
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 300 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Código</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Código Auxiliar</TableCell>
                  <TableCell>Valor Numérico</TableCell>
                  <TableCell>Valor Texto</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : parametros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No hay parámetros en esta tabla
                    </TableCell>
                  </TableRow>
                ) : (
                  parametros.map((param) => (
                    <TableRow key={`${param.codigoTabla}-${param.codigoParametro}`} hover>
                      <TableCell>{param.codigoParametro}</TableCell>
                      <TableCell>{param.descripcion}</TableCell>
                      <TableCell>{param.codigoAuxiliar || '-'}</TableCell>
                      <TableCell>{param.valorNumerico ?? '-'}</TableCell>
                      <TableCell>{param.valorTexto || '-'}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={param.estado === 0 ? 'Activo' : 'Inactivo'} 
                          color={param.estado === 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Vista de todas las tablas agrupadas */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Todas las Tablas de Parámetros
        </Typography>
        
        {loadingAll ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          Array.from(allParametros.entries()).map(([tablaId, params]) => (
            <Accordion key={tablaId} sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ fontWeight: 'medium' }}>
                  {TABLA_NOMBRES[tablaId] || `Tabla ${tablaId}`}
                  <Chip 
                    label={params.length} 
                    size="small" 
                    sx={{ ml: 2 }}
                    color="primary"
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Descripción</TableCell>
                        <TableCell align="center">Estado</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {params.map((param) => (
                        <TableRow key={`${param.codigoTabla}-${param.codigoParametro}`}>
                          <TableCell>{param.codigoParametro}</TableCell>
                          <TableCell>{param.descripcion}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={param.estado === 0 ? 'Activo' : 'Inactivo'} 
                              color={param.estado === 0 ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Container>
    </Box>
  );
};

export default Parametros;
