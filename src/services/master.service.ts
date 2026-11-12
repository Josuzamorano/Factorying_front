import api from './api';

// =============================================
// Tipos para Maestros
// =============================================
export interface BancoDto {
  codigo: number;
  descripcion: string;
  permiteDeposito: string;
  cuentaCorriente?: string;
  cuentaContable?: number;
  transferenciaElectronica: string;
  estado: number;
  activo: boolean;
}

export interface PlazaDto {
  codigo: number;
  descripcion: string;
  diasCanje: number;
  plazaFuera: string;
  estado: number;
  activo: boolean;
}

export interface SucursalDto {
  codigo: number;
  descripcion: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  estado: number;
  activo: boolean;
}

export interface EjecutivoDto {
  codigo: number;
  nombre: string;
  rut?: string;
  email?: string;
  telefono?: string;
  codigoSucursal?: number;
  nombreSucursal?: string;
  estado: number;
  activo: boolean;
}

export interface ParametroDto {
  codigoTabla: number;
  codigoParametro: number;
  descripcion: string;
  codigoAuxiliar?: string;
  valorNumerico?: number;
  valorTexto?: string;
  estado: number;
  activo: boolean;
}

export interface SelectItemDto {
  codigo: number;
  descripcion: string;
}

export interface GastoDto {
  codigo: number;
  descripcion: string;
  tipoGasto: number;
  tipoGastoDescripcion?: string;
  subTipo: number;
  subTipoDescripcion?: string;
  montoDefecto: number;
  porcentajeDefecto: number;
  activo: boolean;
}

export interface UsuarioDto {
  login: string;
  nombre: string;
  email?: string;
  estadoPassword: number;
  estadoPasswordDescripcion?: string;
  codigoPerfil?: number;
  nombrePerfil?: string;
  codigoEjecutivo?: number;
  nombreEjecutivo?: string;
  codigoSucursal?: number;
  nombreSucursal?: string;
  fechaExpiracion?: string;
  ultimoCambioPassword?: string;
  activo: boolean;
  fechaCreacion: string;
}

export interface UsuarioActivoDto {
  login: string;
  nombre: string;
}

// =============================================
// Servicio de Bancos - Migrado de F_MA1300.frm
// =============================================
export const bancoService = {
  getAll: async (): Promise<BancoDto[]> => {
    const response = await api.get<BancoDto[]>('/bancos');
    return response.data;
  },

  getActivos: async (): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>('/bancos/activos');
    return response.data;
  },

  getById: async (id: number): Promise<BancoDto> => {
    const response = await api.get<BancoDto>(`/bancos/${id}`);
    return response.data;
  },

  create: async (banco: Partial<BancoDto>): Promise<BancoDto> => {
    const response = await api.post<BancoDto>('/bancos', banco);
    return response.data;
  },

  update: async (id: number, banco: Partial<BancoDto>): Promise<void> => {
    await api.put(`/bancos/${id}`, banco);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/bancos/${id}`);
  },
};

// =============================================
// Servicio de Plazas - Migrado de F_MA1400.frm
// =============================================
export const plazaService = {
  getAll: async (): Promise<PlazaDto[]> => {
    const response = await api.get<PlazaDto[]>('/plazas');
    return response.data;
  },

  getActivos: async (): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>('/plazas/activos');
    return response.data;
  },

  getById: async (id: number): Promise<PlazaDto> => {
    const response = await api.get<PlazaDto>(`/plazas/${id}`);
    return response.data;
  },

  create: async (plaza: Partial<PlazaDto>): Promise<PlazaDto> => {
    const response = await api.post<PlazaDto>('/plazas', plaza);
    return response.data;
  },

  update: async (id: number, plaza: Partial<PlazaDto>): Promise<void> => {
    await api.put(`/plazas/${id}`, plaza);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/plazas/${id}`);
  },
};

// =============================================
// Servicio de Sucursales
// =============================================
export const sucursalService = {
  getAll: async (): Promise<SucursalDto[]> => {
    const response = await api.get<SucursalDto[]>('/sucursales');
    return response.data;
  },

  getActivos: async (): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>('/sucursales/activos');
    return response.data;
  },

  getById: async (id: number): Promise<SucursalDto> => {
    const response = await api.get<SucursalDto>(`/sucursales/${id}`);
    return response.data;
  },

  create: async (sucursal: Partial<SucursalDto>): Promise<SucursalDto> => {
    const response = await api.post<SucursalDto>('/sucursales', sucursal);
    return response.data;
  },

  update: async (id: number, sucursal: Partial<SucursalDto>): Promise<void> => {
    await api.put(`/sucursales/${id}`, sucursal);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/sucursales/${id}`);
  },
};

// =============================================
// Servicio de Ejecutivos - Migrado de F_MA1200.frm
// =============================================
export const ejecutivoService = {
  getAll: async (): Promise<EjecutivoDto[]> => {
    const response = await api.get<EjecutivoDto[]>('/ejecutivos');
    return response.data;
  },

  getActivos: async (): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>('/ejecutivos/activos');
    return response.data;
  },

  getBySucursal: async (codigoSucursal: number): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>(`/ejecutivos/sucursal/${codigoSucursal}`);
    return response.data;
  },

  getById: async (id: number): Promise<EjecutivoDto> => {
    const response = await api.get<EjecutivoDto>(`/ejecutivos/${id}`);
    return response.data;
  },

  create: async (ejecutivo: Partial<EjecutivoDto>): Promise<EjecutivoDto> => {
    const response = await api.post<EjecutivoDto>('/ejecutivos', ejecutivo);
    return response.data;
  },

  update: async (id: number, ejecutivo: Partial<EjecutivoDto>): Promise<void> => {
    await api.put(`/ejecutivos/${id}`, ejecutivo);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/ejecutivos/${id}`);
  },
};

// =============================================
// Servicio de Parámetros - Migrado de F_MA1100.frm
// =============================================
export const parametroService = {
  getAll: async (): Promise<ParametroDto[]> => {
    const response = await api.get<ParametroDto[]>('/parametros');
    return response.data;
  },

  getByTabla: async (codigoTabla: number): Promise<ParametroDto[]> => {
    const response = await api.get<ParametroDto[]>(`/parametros/tabla/${codigoTabla}`);
    return response.data;
  },

  getSelectByTabla: async (codigoTabla: number): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>(`/parametros/tabla/${codigoTabla}/select`);
    return response.data;
  },

  getById: async (codigoTabla: number, codigoParametro: number): Promise<ParametroDto> => {
    const response = await api.get<ParametroDto>(`/parametros/${codigoTabla}/${codigoParametro}`);
    return response.data;
  },
};

// Constantes de tablas de parámetros (migradas de VB6)
export const PARAM_TABLES = {
  TIPO_DOCUMENTO: 1,
  ESTADO_DOCUMENTO: 2,
  ESTADO_OPERACION: 3,
  TIPO_CLIENTE: 4,
  TIPO_GARANTIA: 5,
  SUCURSAL_FACTORING: 100,
  TIPO_GASTO: 33,
  SUBTIPO_GASTO: 34,
};

// =============================================
// Servicio de Gastos - Migrado de F_MA1700.frm
// =============================================
export const gastoService = {
  getAll: async (): Promise<GastoDto[]> => {
    const response = await api.get<GastoDto[]>('/gastos');
    return response.data;
  },

  getActivos: async (): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>('/gastos/activos');
    return response.data;
  },

  getByTipo: async (tipoGasto: number): Promise<GastoDto[]> => {
    const response = await api.get<GastoDto[]>(`/gastos/tipo/${tipoGasto}`);
    return response.data;
  },

  getById: async (id: number): Promise<GastoDto> => {
    const response = await api.get<GastoDto>(`/gastos/${id}`);
    return response.data;
  },

  create: async (gasto: Partial<GastoDto>): Promise<GastoDto> => {
    const response = await api.post<GastoDto>('/gastos', gasto);
    return response.data;
  },

  update: async (id: number, gasto: Partial<GastoDto>): Promise<void> => {
    await api.put(`/gastos/${id}`, gasto);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/gastos/${id}`);
  },
};

// =============================================
// Servicio de Usuarios - CRUD de Administración
// =============================================
export const usuarioService = {
  getAll: async (): Promise<UsuarioDto[]> => {
    const response = await api.get<UsuarioDto[]>('/usuarios');
    return response.data;
  },

  getPerfiles: async (): Promise<SelectItemDto[]> => {
    const response = await api.get<SelectItemDto[]>('/usuarios/perfiles');
    return response.data;
  },

  getActivos: async (): Promise<UsuarioActivoDto[]> => {
    const response = await api.get<UsuarioActivoDto[]>('/usuarios/activos');
    return response.data;
  },

  getByLogin: async (login: string): Promise<UsuarioDto> => {
    const response = await api.get<UsuarioDto>(`/usuarios/${login}`);
    return response.data;
  },

  create: async (usuario: {
    login: string;
    password: string;
    nombre: string;
    email?: string;
    codigoPerfil?: number;
    codigoEjecutivo?: number;
    codigoSucursal?: number;
    fechaExpiracion?: string;
  }): Promise<UsuarioDto> => {
    const response = await api.post<UsuarioDto>('/usuarios', usuario);
    return response.data;
  },

  update: async (login: string, usuario: Partial<UsuarioDto>): Promise<void> => {
    await api.put(`/usuarios/${login}`, usuario);
  },

  delete: async (login: string): Promise<void> => {
    await api.delete(`/usuarios/${login}`);
  },

  resetPassword: async (login: string, nuevoPassword: string): Promise<void> => {
    await api.post(`/usuarios/${login}/reset-password`, { nuevoPassword });
  },

  desbloquear: async (login: string): Promise<void> => {
    await api.post(`/usuarios/${login}/desbloquear`);
  },
};
