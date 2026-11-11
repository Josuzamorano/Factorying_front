import api from './api';

// =============================================
// Tipos para Clientes - Migrado de F_CC1700.frm
// =============================================

export interface ClienteDto {
  rutCliente: number;
  digitoVerificador?: string;
  rutFormateado: string;
  tipoCliente: number;
  tipoClienteDescripcion: string;
  razonSocial: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreCompleto: string;
  direccion?: string;
  codigoComuna?: number;
  nombreComuna?: string;
  codigoGiro?: number;
  descripcionGiro?: string;
  codigoPostal?: string;
  correoElectronico?: string;
  fechaInicio: string;
  estadoCliente: number;
  estadoDescripcion: string;
  codigoEjecutivo?: string;
  nombreEjecutivo?: string;
  observaciones?: string;
  codigoSucursal?: string;
  nombreSucursal?: string;
  codigoActividad?: number;
  lineaBanco: number;
  utilizadoBanco: number;
  disponibleBanco: number;
  activo: boolean;
  fechaCreacion: string;
}

export interface ClienteListDto {
  rutCliente: number;
  rutFormateado: string;
  nombreCompleto: string;
  nombreEjecutivo?: string;
  estadoCliente: number;
  activo: boolean;
}

export interface ClienteCreateDto {
  rutCliente: number;
  digitoVerificador?: string;
  tipoCliente: number;
  razonSocial: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  sexo?: number;
  direccion?: string;
  codigoComuna?: number;
  codigoGiro?: number;
  codigoPostal?: string;
  correoElectronico?: string;
  codigoEjecutivo?: string;
  codigoSucursal?: string;
  observaciones?: string;
  codigoActividad?: number;
}

export interface ClienteupdateDto {
  tipoCliente: number;
  razonSocial: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  sexo?: number;
  direccion?: string;
  codigoComuna?: number;
  codigoGiro?: number;
  codigoPostal?: string;
  correoElectronico?: string;
  codigoEjecutivo?: string;
  codigoSucursal?: string;
  observaciones?: string;
  codigoActividad?: number;
  estadoCliente: number;
}

export interface ClienteSearchDto {
  rut?: string;
  razonSocial?: string;
  codigoEjecutivo?: string;
  tipoCliente?: number;
  estadoCliente?: number;
  codigoComuna?: number;
  pageNumber: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Teléfonos
export interface ClienteTelefonoDto {
  rutCliente: number;
  tipoTelefono: number;
  tipoTelefonoDescripcion: string;
  numeroTelefono: string;
  observacion?: string;
  estado: number;
}

export interface ClienteTelefonoCreateDto {
  tipoTelefono: number;
  numeroTelefono: string;
  observacion?: string;
}

// Contactos
export interface ClienteContactoDto {
  rutCliente: number;
  numeroContacto: number;
  nombreContacto: string;
  cargo?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  observaciones?: string;
  estado: number;
}

export interface ClienteContactoCreateDto {
  nombreContacto: string;
  cargo?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  observaciones?: string;
}

// Bancos
export interface ClienteBancoDto {
  rutCliente: number;
  codigoBanco: number;
  nombreBanco?: string;
  tipoCuenta: number;
  tipoCuentaDescripcion: string;
  numeroCuenta: string;
  estado: number;
}

export interface ClienteBancoCreateDto {
  codigoBanco: number;
  tipoCuenta: number;
  numeroCuenta: string;
}

// =============================================
// Constantes
// =============================================

export const TIPO_CLIENTE = {
  NATURAL: 1,
  JURIDICO: 2,
};

export const TIPO_TELEFONO = {
  FIJO: 1,
  CELULAR: 2,
  FAX: 3,
};

export const TIPO_CUENTA = {
  CORRIENTE: 1,
  AHORRO: 2,
  VISTA: 3,
};

// =============================================
// Servicio de Clientes
// =============================================

export const clienteService = {
  getAll: async (): Promise<ClienteListDto[]> => {
    const response = await api.get<ClienteListDto[]>('/clientes');
    return response.data;
  },

  getActivos: async (): Promise<ClienteListDto[]> => {
    const response = await api.get<ClienteListDto[]>('/clientes/activos');
    return response.data;
  },

  search: async (search: ClienteSearchDto): Promise<PagedResult<ClienteListDto>> => {
    const response = await api.post<PagedResult<ClienteListDto>>('/clientes/search', search);
    return response.data;
  },

  getByRut: async (rut: number): Promise<ClienteDto> => {
    const response = await api.get<ClienteDto>(`/clientes/${rut}`);
    return response.data;
  },

  create: async (cliente: ClienteCreateDto): Promise<ClienteDto> => {
    const response = await api.post<ClienteDto>('/clientes', cliente);
    return response.data;
  },

  update: async (rut: number, cliente: ClienteupdateDto): Promise<void> => {
    await api.put(`/clientes/${rut}`, cliente);
  },

  delete: async (rut: number): Promise<void> => {
    await api.delete(`/clientes/${rut}`);
  },

  // Teléfonos
  getTelefonos: async (rut: number): Promise<ClienteTelefonoDto[]> => {
    const response = await api.get<ClienteTelefonoDto[]>(`/clientes/${rut}/telefonos`);
    return response.data;
  },

  addTelefono: async (rut: number, telefono: ClienteTelefonoCreateDto): Promise<void> => {
    await api.post(`/clientes/${rut}/telefonos`, telefono);
  },

  deleteTelefono: async (rut: number, tipo: number, numero: string): Promise<void> => {
    await api.delete(`/clientes/${rut}/telefonos/${tipo}/${encodeURIComponent(numero)}`);
  },

  // Contactos
  getContactos: async (rut: number): Promise<ClienteContactoDto[]> => {
    const response = await api.get<ClienteContactoDto[]>(`/clientes/${rut}/contactos`);
    return response.data;
  },

  addContacto: async (rut: number, contacto: ClienteContactoCreateDto): Promise<void> => {
    await api.post(`/clientes/${rut}/contactos`, contacto);
  },

  updateContacto: async (rut: number, numeroContacto: number, contacto: ClienteContactoCreateDto): Promise<void> => {
    await api.put(`/clientes/${rut}/contactos/${numeroContacto}`, contacto);
  },

  deleteContacto: async (rut: number, numeroContacto: number): Promise<void> => {
    await api.delete(`/clientes/${rut}/contactos/${numeroContacto}`);
  },

  // Bancos
  getBancos: async (rut: number): Promise<ClienteBancoDto[]> => {
    const response = await api.get<ClienteBancoDto[]>(`/clientes/${rut}/bancos`);
    return response.data;
  },

  addBanco: async (rut: number, banco: ClienteBancoCreateDto): Promise<void> => {
    await api.post(`/clientes/${rut}/bancos`, banco);
  },

  deleteBanco: async (rut: number, codigoBanco: number, numeroCuenta: string): Promise<void> => {
    await api.delete(`/clientes/${rut}/bancos/${codigoBanco}/${encodeURIComponent(numeroCuenta)}`);
  },
};

// =============================================
// Utilidades de RUT chileno
// =============================================

export const rutUtils = {
  /**
   * Calcula el dígito verificador de un RUT
   */
  calcularDV: (rut: number): string => {
    let suma = 0;
    let multiplicador = 2;
    let rutTemp = rut;

    while (rutTemp > 0) {
      suma += (rutTemp % 10) * multiplicador;
      rutTemp = Math.floor(rutTemp / 10);
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);

    if (resto === 11) return '0';
    if (resto === 10) return 'K';
    return resto.toString();
  },

  /**
   * Formatea un RUT con puntos y guión
   */
  formatear: (rut: number, dv?: string): string => {
    const dvCalculado = dv || rutUtils.calcularDV(rut);
    return `${rut.toLocaleString('es-CL')}-${dvCalculado}`;
  },

  /**
   * Limpia un RUT (quita puntos y guión) y retorna número y DV
   */
  limpiar: (rutStr: string): { rut: number; dv: string } | null => {
    const limpio = rutStr.replace(/\./g, '').replace(/-/g, '').trim().toUpperCase();
    if (limpio.length < 2) return null;

    const dv = limpio.slice(-1);
    const rutNum = parseInt(limpio.slice(0, -1), 10);

    if (isNaN(rutNum)) return null;

    return { rut: rutNum, dv };
  },

  /**
   * Valida un RUT chileno
   */
  validar: (rutStr: string): boolean => {
    const parsed = rutUtils.limpiar(rutStr);
    if (!parsed) return false;

    const dvCalculado = rutUtils.calcularDV(parsed.rut);
    return dvCalculado === parsed.dv;
  },
};

// =============================================
// Tipos para Organigrama - Migrado de F_CC1750.frm
// =============================================

export interface ClienteOrganigramaDto {
  rutCliente: number;
  numeroOrganigrama: number;
  nombrePersona: string;
  rutPersona?: number;
  digitoVerificador?: string;
  rutFormateado: string;
  codigoCargo?: number;
  descripcionCargo?: string;
  atributoFirma: boolean;
  estado: number;
  activo: boolean;
}

export interface ClienteOrganigramaCreateDto {
  nombrePersona: string;
  rutPersona?: number;
  digitoVerificador?: string;
  codigoCargo?: number;
  atributoFirma: boolean;
}

export interface ClienteOrganigramaupdateDto {
  nombrePersona: string;
  rutPersona?: number;
  digitoVerificador?: string;
  codigoCargo?: number;
  atributoFirma: boolean;
  estado: number;
}

// =============================================
// Tipos para Empresas Relacionadas - Migrado de F_CC1760.frm
// =============================================

export interface ClienteEmpresaDto {
  rutCliente: number;
  rutEmpresa: number;
  digitoVerificador?: string;
  rutFormateado: string;
  razonSocial: string;
  fechaSituacion?: string;
  montoDeudaDirecta: number;
  montoDeudaIndirecta: number;
  situacionDicom: boolean;
  estadoDicom: string;
  estado: number;
  activo: boolean;
}

export interface ClienteEmpresaCreateDto {
  rutEmpresa: number;
  digitoVerificador?: string;
  razonSocial: string;
  fechaSituacion?: string;
  montoDeudaDirecta: number;
  montoDeudaIndirecta: number;
  situacionDicom: boolean;
}

export interface ClienteEmpresaupdateDto {
  razonSocial: string;
  fechaSituacion?: string;
  montoDeudaDirecta: number;
  montoDeudaIndirecta: number;
  situacionDicom: boolean;
  estado: number;
}

// =============================================
// Servicios de Organigrama
// =============================================

export const organigramaService = {
  getByCliente: async (rutCliente: number): Promise<ClienteOrganigramaDto[]> => {
    const response = await api.get<ClienteOrganigramaDto[]>(`/clientes/${rutCliente}/organigrama`);
    return response.data;
  },

  create: async (rutCliente: number, data: ClienteOrganigramaCreateDto): Promise<void> => {
    await api.post(`/clientes/${rutCliente}/organigrama`, data);
  },

  update: async (rutCliente: number, numero: number, data: ClienteOrganigramaupdateDto): Promise<void> => {
    await api.put(`/clientes/${rutCliente}/organigrama/${numero}`, data);
  },

  delete: async (rutCliente: number, numero: number): Promise<void> => {
    await api.delete(`/clientes/${rutCliente}/organigrama/${numero}`);
  },
};

// =============================================
// Servicios de Empresas Relacionadas
// =============================================

export const empresaService = {
  getByCliente: async (rutCliente: number): Promise<ClienteEmpresaDto[]> => {
    const response = await api.get<ClienteEmpresaDto[]>(`/clientes/${rutCliente}/empresas`);
    return response.data;
  },

  create: async (rutCliente: number, data: ClienteEmpresaCreateDto): Promise<void> => {
    await api.post(`/clientes/${rutCliente}/empresas`, data);
  },

  update: async (rutCliente: number, rutEmpresa: number, data: ClienteEmpresaupdateDto): Promise<void> => {
    await api.put(`/clientes/${rutCliente}/empresas/${rutEmpresa}`, data);
  },

  delete: async (rutCliente: number, rutEmpresa: number): Promise<void> => {
    await api.delete(`/clientes/${rutCliente}/empresas/${rutEmpresa}`);
  },
};
