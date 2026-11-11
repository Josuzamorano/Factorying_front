import api from './api';

// DTOs de filtros
export interface FiltroPagaresDto {
  rutCliente?: number;
  numeroOperacion?: number;
  numeroLinea?: number;
  estado?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  vencimientoDesde?: string;
  vencimientoHasta?: string;
  soloVigentes?: boolean;
  soloVencidos?: boolean;
}

export interface FiltroAvalesDto {
  rutCliente?: number;
  rutAval?: number;
  tipoAval?: number;
  estado?: number;
  soloActivos?: boolean;
  soloSocios?: boolean;
  consultarTodos?: boolean;
}

export interface FiltroFirmasDto {
  rutCliente?: number;
  rutFirmante?: number;
  fechaVigenciaDesde?: string;
  fechaVigenciaHasta?: string;
  soloActivas?: boolean;
  consultarTodos?: boolean;
}

// DTOs de Pagaré
export interface PagareDto {
  id: number;
  rutCliente: number;
  nombreCliente: string;
  numeroPagare: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoOriginal: number;
  montoActual: number;
  estado: number;
  estadoDescripcion: string;
  tipoEmision: number;
  numeroOperacion?: number;
  numeroLinea?: number;
  nombreDeudor?: string;
  codigoNotaria?: number;
  nombreNotaria?: string;
  impuesto: number;
  observaciones: string;
  estaVencido: boolean;
  diasParaVencimiento: number;
}

export interface CreatePagareDto {
  rutCliente: number;
  numeroOperacion?: number;
  numeroLinea?: number;
  montoOriginal: number;
  fechaEmision: string;
  fechaVencimiento: string;
  tipoEmision: number;
  codigoNotaria?: number;
  observaciones?: string;
}

export interface updatePagareDto extends CreatePagareDto {
  montoActual?: number;
}

export interface CambiarEstadoPagareDto {
  nuevoEstado: number;
  motivo?: string;
}

// DTOs de Aval
export interface AvalDto {
  id: number;
  rutCliente: number;
  nombreCliente: string;
  rutAval: number;
  nombreAval: string;
  direccion: string;
  comuna: string;
  comunaDescripcion: string;
  telefono: string;
  email: string;
  tipoAval: number;
  tipoAvalDescripcion: string;
  estadoAval: number;
  estadoAvalDescripcion: string;
  regimenMatrimonial: number;
  regimenMatrimonialDescripcion: string;
  rutConyuge?: number;
  nombreConyuge: string;
  esSocio: boolean;
  porcentajeParticipacion?: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  observaciones: string;
  activo: boolean;
}

export interface CreateAvalDto {
  rutCliente: number;
  rutAval: number;
  nombreAval: string;
  direccion?: string;
  comuna?: string;
  telefono?: string;
  email?: string;
  tipoAval: number;
  regimenMatrimonial: number;
  rutConyuge?: number;
  nombreConyuge?: string;
  esSocio: boolean;
  porcentajeParticipacion?: number;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  observaciones?: string;
}

export interface updateAvalDto extends CreateAvalDto {}

// DTOs de Firma
export interface FirmaDto {
  id: number;
  rutCliente: number;
  nombreCliente: string;
  rutFirmante: number;
  nombreFirmante: string;
  cargo: string;
  telefono: string;
  email: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  activa: boolean;
  observaciones: string;
  estaVigente: boolean;
}

export interface CreateFirmaDto {
  rutCliente: number;
  rutFirmante: number;
  nombreFirmante: string;
  cargo: string;
  telefono?: string;
  email?: string;
  fechaVigenciaDesde: string;
  fechaVigenciaHasta?: string;
  observaciones?: string;
}

export interface updateFirmaDto extends CreateFirmaDto {}

// DTOs de Resumen
export interface ResumenLegalDto {
  totalPagaresVigentes: number;
  totalPagaresPorVencer: number;
  totalPagaresVencidos: number;
  montoTotalPagaresVigentes: number;
  totalAvales: number;
  totalAvalesActivos: number;
  totalAvalesPorVencer: number;
  totalFirmas: number;
  totalFirmasVigentes: number;
  totalFirmasPorVencer: number;
}

export interface ResumenGarantiasClienteDto {
  rutCliente: number;
  nombreCliente: string;
  totalPagaresVigentes: number;
  totalPagaresPorVencer: number;
  totalPagaresVencidos: number;
  montoTotalGarantias: number;
  totalAvalesActivos: number;
  totalFirmasVigentes: number;
  tieneDocumentosVencidos: boolean;
}

// Servicio Legal
export const legalService = {
  // Resumen
  getResumenGeneral: async (): Promise<ResumenLegalDto> => {
    const response = await api.get('/legal/resumen');
    return response.data;
  },

  getResumenByCliente: async (rutCliente: number): Promise<ResumenGarantiasClienteDto> => {
    const response = await api.get(`/legal/resumen/cliente/${rutCliente}`);
    return response.data;
  },

  getResumenTodosClientes: async (): Promise<ResumenGarantiasClienteDto[]> => {
    const response = await api.get('/legal/resumen/todos');
    return response.data;
  },

  // Pagarés
  consultarPagares: async (filtro: FiltroPagaresDto): Promise<PagareDto[]> => {
    const response = await api.post('/legal/pagares/consultar', filtro);
    return response.data;
  },

  getPagareById: async (id: number): Promise<PagareDto> => {
    const response = await api.get(`/legal/pagares/${id}`);
    return response.data;
  },

  getPagaresByCliente: async (rutCliente: number): Promise<PagareDto[]> => {
    const response = await api.get(`/legal/pagares/cliente/${rutCliente}`);
    return response.data;
  },

  getPagaresVigentes: async (): Promise<PagareDto[]> => {
    const response = await api.get('/legal/pagares/vigentes');
    return response.data;
  },

  getPagaresVencidos: async (): Promise<PagareDto[]> => {
    const response = await api.get('/legal/pagares/vencidos');
    return response.data;
  },

  getPagaresPorVencer: async (dias: number = 30): Promise<PagareDto[]> => {
    const response = await api.get(`/legal/pagares/por-vencer?dias=${dias}`);
    return response.data;
  },

  createPagare: async (data: CreatePagareDto): Promise<PagareDto> => {
    const response = await api.post('/legal/pagares', data);
    return response.data;
  },

  updatePagare: async (id: number, data: updatePagareDto): Promise<PagareDto> => {
    const response = await api.put(`/legal/pagares/${id}`, data);
    return response.data;
  },

  cambiarEstadoPagare: async (id: number, nuevoEstado: number, motivo?: string): Promise<void> => {
    await api.post(`/legal/pagares/${id}/cambiar-estado`, { nuevoEstado, motivo });
  },

  deletePagare: async (id: number): Promise<void> => {
    await api.delete(`/legal/pagares/${id}`);
  },

  getSiguienteNumeroPagare: async (): Promise<{ siguienteNumero: string }> => {
    const response = await api.get('/legal/pagares/siguiente-numero');
    return response.data;
  },

  // Avales
  consultarAvales: async (filtro: FiltroAvalesDto): Promise<AvalDto[]> => {
    const response = await api.post('/legal/avales/consultar', filtro);
    return response.data;
  },

  getAvalById: async (id: number): Promise<AvalDto> => {
    const response = await api.get(`/legal/avales/${id}`);
    return response.data;
  },

  getAvalesByCliente: async (rutCliente: number): Promise<AvalDto[]> => {
    const response = await api.get(`/legal/avales/cliente/${rutCliente}`);
    return response.data;
  },

  getAvalesActivos: async (): Promise<AvalDto[]> => {
    const response = await api.get('/legal/avales/activos');
    return response.data;
  },

  getAvalesPorVencer: async (dias: number = 30): Promise<AvalDto[]> => {
    const response = await api.get(`/legal/avales/por-vencer?dias=${dias}`);
    return response.data;
  },

  createAval: async (data: CreateAvalDto): Promise<AvalDto> => {
    const response = await api.post('/legal/avales', data);
    return response.data;
  },

  updateAval: async (id: number, data: updateAvalDto): Promise<AvalDto> => {
    const response = await api.put(`/legal/avales/${id}`, data);
    return response.data;
  },

  cambiarEstadoAval: async (id: number, nuevoEstado: number): Promise<void> => {
    await api.post(`/legal/avales/${id}/cambiar-estado?nuevoEstado=${nuevoEstado}`);
  },

  deleteAval: async (id: number): Promise<void> => {
    await api.delete(`/legal/avales/${id}`);
  },

  // Firmas
  consultarFirmas: async (filtro: FiltroFirmasDto): Promise<FirmaDto[]> => {
    const response = await api.post('/legal/firmas/consultar', filtro);
    return response.data;
  },

  getFirmaById: async (id: number): Promise<FirmaDto> => {
    const response = await api.get(`/legal/firmas/${id}`);
    return response.data;
  },

  getFirmasByCliente: async (rutCliente: number): Promise<FirmaDto[]> => {
    const response = await api.get(`/legal/firmas/cliente/${rutCliente}`);
    return response.data;
  },

  getFirmasVigentes: async (): Promise<FirmaDto[]> => {
    const response = await api.get('/legal/firmas/vigentes');
    return response.data;
  },

  getFirmasPorVencer: async (dias: number = 30): Promise<FirmaDto[]> => {
    const response = await api.get(`/legal/firmas/por-vencer?dias=${dias}`);
    return response.data;
  },

  createFirma: async (data: CreateFirmaDto): Promise<FirmaDto> => {
    const response = await api.post('/legal/firmas', data);
    return response.data;
  },

  updateFirma: async (id: number, data: updateFirmaDto): Promise<FirmaDto> => {
    const response = await api.put(`/legal/firmas/${id}`, data);
    return response.data;
  },

  activarDesactivarFirma: async (id: number, activa: boolean): Promise<void> => {
    await api.post(`/legal/firmas/${id}/activar?activa=${activa}`);
  },

  deleteFirma: async (id: number): Promise<void> => {
    await api.delete(`/legal/firmas/${id}`);
  }
};

export default legalService;
