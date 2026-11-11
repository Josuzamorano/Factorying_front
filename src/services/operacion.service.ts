import api from './api';

// =============================================
// Tipos para Operaciones - Versión simplificada
// =============================================

export interface Operacion {
  correlativoOperacion: number;
  rutCliente: number;
  nombreCliente?: string;
  tipoDocumento: number;
  nombreTipoDocumento?: string;
  fechaOperacion: string;
  fechaOtorgamiento?: string;
  estadoOperacion: number;
  nombreEstado?: string;
  tipoMoneda: number;
  nombreMoneda?: string;
  montoTotal: number;
  valorDolar: number;
  porcentajeAdelanto: number;
  montoAdelanto: number;
  montoGastos: number;
  montoIva: number;
  montoGiro: number;
  montoRetencion: number;
  codigoBanco?: number;
  nombreBanco?: string;
  cuentaBancaria?: string;
  observaciones?: string;
  fechaCreacion?: string;
}

export interface OperacionCompleta extends Operacion {
  facturas: DocumentoDto[];
  cheques: DocumentoDto[];
  letras: DocumentoDto[];
  otros: DocumentoDto[];
  gastos: GastoDto[];
}

export interface DocumentoDto {
  correlativoOperacion: number;
  correlativoDocumento: number;
  tipoDocumento: string;
  rutDeudor: number;
  nombreDeudor: string;
  numeroDocumento: string;
  fechaEmision?: string;
  fechaVencimiento: string;
  montoDocumento: number;
  montoAbonado: number;
  montoSaldo: number;
  estadoDocumento: number;
  nombreEstado: string;
  tipoMoneda: number;
  codigoBanco?: number;
  nombreBanco?: string;
  observaciones?: string;
}

export interface GastoDto {
  correlativoOperacion: number;
  correlativoGasto: number;
  codigoGasto: number;
  descripcionGasto: string;
  montoGasto: number;
  afectoIva: boolean;
}

export interface TipoGasto {
  codigoGasto: number;
  descripcionGasto: string;
  porcentajeGasto: number;
  montoGasto: number;
  afectoIva: boolean;
  estadoGasto: number;
}

export interface CreateOperacionDto {
  rutCliente: number;
  tipoDocumento: number;
  fechaOperacion: string;
  tipoMoneda: number;
  valorDolar: number;
  porcentajeAdelanto: number;
  codigoBanco?: number;
  cuentaBancaria?: string;
  observaciones?: string;
  facturas: CreateDocumentoDto[];
  cheques: CreateDocumentoDto[];
  letras: CreateDocumentoDto[];
  otros: CreateDocumentoDto[];
  gastos: CreateGastoDto[];
}

export interface CreateDocumentoDto {
  rutDeudor: number;
  numeroDocumento: string;
  tipoDocumento?: number;
  fechaEmision?: string;
  fechaVencimiento: string;
  montoDocumento: number;
  tipoMoneda: number;
  codigoBanco?: number;
  observaciones?: string;
}

export interface CreateGastoDto {
  codigoGasto: number;
  montoGasto: number;
  afectoIva: boolean;
}

export interface updateOperacionDto {
  correlativoOperacion: number;
  tipoDocumento: number;
  fechaOperacion: string;
  tipoMoneda: number;
  valorDolar: number;
  porcentajeAdelanto: number;
  codigoBanco?: number;
  cuentaBancaria?: string;
  observaciones?: string;
}

export interface OperacionSearchDto {
  fechaDesde?: string;
  fechaHasta?: string;
  rutCliente?: number;
  estado?: number;
  tipoDocumento?: number;
}

export interface OtorgarOperacionDto {
  correlativoOperacion: number;
  fechaOtorgamiento: string;
}

export interface CambiarEstadoDto {
  correlativoOperacion: number;
  nuevoEstado: number;
}

// =============================================
// Servicio de Operaciones
// =============================================

export const operacionService = {
  // Obtener todas las operaciones
  getAll: async (): Promise<Operacion[]> => {
    const response = await api.get('/operaciones');
    return response.data;
  },

  // Obtener operación por correlativo
  getById: async (correlativo: number): Promise<OperacionCompleta> => {
    const response = await api.get(`/operaciones/${correlativo}`);
    return response.data;
  },

  // Obtener operaciones por cliente
  getByCliente: async (rutCliente: number): Promise<Operacion[]> => {
    const response = await api.get(`/operaciones/cliente/${rutCliente}`);
    return response.data;
  },

  // Buscar operaciones con filtros
  search: async (params: OperacionSearchDto): Promise<Operacion[]> => {
    const response = await api.post('/operaciones/search', params);
    return response.data;
  },

  // Crear nueva operación
  create: async (operacion: CreateOperacionDto): Promise<Operacion> => {
    const response = await api.post('/operaciones', operacion);
    return response.data;
  },

  // Actualizar operación
  update: async (correlativo: number, operacion: updateOperacionDto): Promise<void> => {
    await api.put(`/operaciones/${correlativo}`, operacion);
  },

  // Eliminar operación
  delete: async (correlativo: number): Promise<void> => {
    await api.delete(`/operaciones/${correlativo}`);
  },

  // Cambiar estado de operación
  cambiarEstado: async (correlativo: number, nuevoEstado: number): Promise<void> => {
    await api.put(`/operaciones/${correlativo}/estado`, { correlativoOperacion: correlativo, nuevoEstado });
  },

  // Otorgar operación
  otorgar: async (correlativo: number, fechaOtorgamiento: string): Promise<void> => {
    await api.put(`/operaciones/${correlativo}/otorgar`, { correlativoOperacion: correlativo, fechaOtorgamiento });
  },

  // Obtener siguiente número de operación
  getSiguienteNumero: async (): Promise<number> => {
    const response = await api.get('/operaciones/siguiente-numero');
    return response.data;
  },

  // Obtener tipos de gasto
  getTiposGasto: async (): Promise<TipoGasto[]> => {
    const response = await api.get('/operaciones/tipos-gasto');
    return response.data;
  }
};

export default operacionService;
