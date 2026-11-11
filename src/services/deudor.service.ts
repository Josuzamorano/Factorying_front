// =============================================
// Servicio para Módulo 3 - Carpeta Deudor
// Cliente API para gestión de deudores
// =============================================

import api from './api';

// ========================================
// Interfaces
// ========================================

export interface Deudor {
  rutCliente: number;
  rutDeudor: number;
  digitoVerificador?: string;
  rutFormateado: string;
  razonSocial: string;
  direccion?: string;
  codigoComuna?: number;
  nombreComuna?: string;
  estadoDeudor?: number;
  contactoCobranza?: string;
  porcentajeVentas?: number;
  notificacion?: string;
  montoOtorgado: number;
  montoOcupado: number;
  categoriaRiesgo?: number;
  descripcionCategoriaRiesgo?: string;
  giroDeudor?: string;
  nombreCliente?: string;
  fechaCreacion?: string;
  telefonos?: DeudorTelefono[];
  documentos?: DeudorDocumento[];
}

export interface DeudorList {
  rutCliente: number;
  rutDeudor: number;
  rutFormateado: string;
  razonSocial: string;
  estado: string;
  montoOtorgado: number;
  montoOcupado: number;
  categoriaRiesgo: number;
  nombreCliente?: string;
}

export interface DeudorCreate {
  rutCliente: number;
  rutDeudor: string;
  razonSocial: string;
  direccion?: string;
  codigoComuna?: number;
  contactoCobranza?: string;
  porcentajeVentas?: number;
  notificacion?: string;
  montoOtorgado?: number;
  categoriaRiesgo?: number;
  giroDeudor?: string;
  telefonos?: DeudorTelefonoCreate[];
}

export interface Deudorupdate {
  razonSocial?: string;
  direccion?: string;
  codigoComuna?: number;
  estadoDeudor?: number;
  contactoCobranza?: string;
  porcentajeVentas?: number;
  notificacion?: string;
  montoOtorgado?: number;
  categoriaRiesgo?: number;
  giroDeudor?: string;
}

export interface DeudorTelefono {
  tipoComunicacion: number;
  descripcion?: string;
  numeroComunicacion: string;
}

export interface DeudorTelefonoCreate {
  tipoComunicacion: number;
  descripcion?: string;
  numeroComunicacion: string;
}

export interface DeudorDocumento {
  numeroDocumento?: number;
  tipoDocumento?: number;
  nombreDocumento?: string;
  rutaDocumento?: string;
  fechaDocumento?: string;
  observaciones?: string;
}

export interface DeudorSearchParams {
  rutCliente?: number;
  rutDeudor?: string;
  razonSocial?: string;
  estado?: number;
  categoriaRiesgo?: number;
  page?: number;
  pageSize?: number;
}

export interface DeudorSearchResult {
  items: DeudorList[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ========================================
// Servicios de API
// ========================================

const deudorService = {
  /**
   * Obtiene todos los deudores
   */
  async getAll(): Promise<DeudorList[]> {
    const response = await api.get<DeudorList[]>('/deudores');
    return response.data;
  },

  /**
   * Obtiene deudores de un cliente específico
   */
  async getByCliente(rutCliente: number): Promise<DeudorList[]> {
    const response = await api.get<DeudorList[]>(`/deudores/cliente/${rutCliente}`);
    return response.data;
  },

  /**
   * Busca deudores con filtros y paginación
   */
  async search(params: DeudorSearchParams): Promise<DeudorSearchResult> {
    const response = await api.get<DeudorSearchResult>('/deudores/search', { params });
    return response.data;
  },

  /**
   * Obtiene un deudor por su identificador
   */
  async getById(rutCliente: number, rutDeudor: number): Promise<Deudor> {
    const response = await api.get<Deudor>(`/deudores/${rutCliente}/${rutDeudor}`);
    return response.data;
  },

  /**
   * Crea un nuevo deudor
   */
  async create(deudor: DeudorCreate): Promise<Deudor> {
    const response = await api.post<Deudor>('/deudores', deudor);
    return response.data;
  },

  /**
   * Actualiza un deudor existente
   */
  async update(rutCliente: number, rutDeudor: number, data: Deudorupdate): Promise<void> {
    await api.put(`/deudores/${rutCliente}/${rutDeudor}`, data);
  },

  /**
   * Elimina (desactiva) un deudor
   */
  async delete(rutCliente: number, rutDeudor: number): Promise<void> {
    await api.delete(`/deudores/${rutCliente}/${rutDeudor}`);
  },

  // ========================================
  // Teléfonos
  // ========================================

  /**
   * Obtiene teléfonos de un deudor
   */
  async getTelefonos(rutCliente: number, rutDeudor: number): Promise<DeudorTelefono[]> {
    const response = await api.get<DeudorTelefono[]>(`/deudores/${rutCliente}/${rutDeudor}/telefonos`);
    return response.data;
  },

  /**
   * Agrega un teléfono al deudor
   */
  async addTelefono(rutCliente: number, rutDeudor: number, telefono: DeudorTelefonoCreate): Promise<void> {
    await api.post(`/deudores/${rutCliente}/${rutDeudor}/telefonos`, telefono);
  },

  /**
   * Elimina un teléfono del deudor
   */
  async deleteTelefono(rutCliente: number, rutDeudor: number, tipo: number, numero: string): Promise<void> {
    await api.delete(`/deudores/${rutCliente}/${rutDeudor}/telefonos/${tipo}/${encodeURIComponent(numero)}`);
  },

  // ========================================
  // Documentos
  // ========================================

  /**
   * Obtiene documentos de un deudor
   */
  async getDocumentos(rutCliente: number, rutDeudor: number): Promise<DeudorDocumento[]> {
    const response = await api.get<DeudorDocumento[]>(`/deudores/${rutCliente}/${rutDeudor}/documentos`);
    return response.data;
  },

  /**
   * Agrega un documento al deudor
   */
  async addDocumento(rutCliente: number, rutDeudor: number, documento: DeudorDocumento): Promise<void> {
    await api.post(`/deudores/${rutCliente}/${rutDeudor}/documentos`, documento);
  },

  /**
   * Elimina un documento del deudor
   */
  async deleteDocumento(rutCliente: number, rutDeudor: number, numeroDoc: number): Promise<void> {
    await api.delete(`/deudores/${rutCliente}/${rutDeudor}/documentos/${numeroDoc}`);
  }
};

export default deudorService;

// Tipos de comunicación para teléfonos
export const tiposComunicacion = [
  { value: 1, label: 'Teléfono Fijo' },
  { value: 2, label: 'Celular' },
  { value: 3, label: 'Fax' },
  { value: 4, label: 'Email' },
  { value: 5, label: 'WhatsApp' }
];

// Categorías de riesgo
export const categoriasRiesgo = [
  { value: 1, label: 'A - Bajo Riesgo' },
  { value: 2, label: 'B - Riesgo Medio' },
  { value: 3, label: 'C - Riesgo Alto' },
  { value: 4, label: 'D - Riesgo Muy Alto' },
  { value: 5, label: 'E - Riesgo Crítico' }
];

// Estados de deudor
export const estadosDeudor = [
  { value: 1, label: 'Activo' },
  { value: 0, label: 'Inactivo' }
];

// Utilidades para formateo
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value);
};

export const getMontoDisponible = (montoOtorgado: number, montoOcupado: number): number => {
  return Math.max(0, montoOtorgado - montoOcupado);
};

export const getCategoriaColor = (categoria: number): 'success' | 'warning' | 'error' | 'default' => {
  switch (categoria) {
    case 1: return 'success';
    case 2: return 'success';
    case 3: return 'warning';
    case 4: return 'error';
    case 5: return 'error';
    default: return 'default';
  }
};
