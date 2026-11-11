import api from './api';

// ===================== Interfaces =====================

export interface GiroDto {
  girNumGir: number;
  girRutCli: string;
  girNumOpe: number;
  girTipGir: number;
  girFecGir: string;
  girMonGir: number;
  girCtaCte: string;
  girCodBco: string;
  girBenGir: string;
  girEstGir: number;
  girForCan: string;
  girUsrCre: string;
  girFecCre: string;
  girUsrMod: string | null;
  girFecMod: string | null;
  nombreCliente: string;
  nombreBanco: string;
  descripcionTipoGiro: string;
  descripcionEstado: string;
}

export interface GiroCreateDto {
  girRutCli: string;
  girNumOpe: number;
  girTipGir: number;
  girFecGir: string;
  girMonGir: number;
  girCtaCte: string;
  girCodBco: string;
  girBenGir: string;
  girForCan: string;
  girUsrCre: string;
}

export interface GiroupdateDto {
  girRutCli: string;
  girNumOpe: number;
  girTipGir: number;
  girFecGir: string;
  girMonGir: number;
  girCtaCte: string;
  girCodBco: string;
  girBenGir: string;
  girForCan: string;
  girUsrMod: string;
}

export interface MovimientoDto {
  movNumMov: number;
  movFecMov: string;
  movTipMov: string;
  movRutCli: string;
  movNumOpe: number;
  movNumGir: number;
  movMonMov: number;
  movGlsMov: string;
  movCodBco: string;
  movCtaBco: string;
  movEstMov: number;
  movUsrCre: string;
  movFecCre: string;
  movUsrMod: string | null;
  movFecMod: string | null;
  nombreCliente: string;
  nombreBanco: string;
  descripcionTipo: string;
  descripcionEstado: string;
}

export interface MovimientoCreateDto {
  movFecMov: string;
  movTipMov: string;
  movRutCli: string;
  movNumOpe: number;
  movNumGir: number;
  movMonMov: number;
  movGlsMov: string;
  movCodBco: string;
  movCtaBco: string;
  movUsrCre: string;
}

export interface MovimientoupdateDto {
  movFecMov: string;
  movTipMov: string;
  movRutCli: string;
  movNumOpe: number;
  movNumGir: number;
  movMonMov: number;
  movGlsMov: string;
  movCodBco: string;
  movCtaBco: string;
  movUsrMod: string;
}

export interface FiltroTesoreriaDto {
  fechaDesde?: string;
  fechaHasta?: string;
  rutCliente?: string;
  numOperacion?: number;
  codBanco?: string;
}

export interface ResumenGirosDto {
  fecha: string;
  cantidadGiros: number;
  montoTotal: number;
  montoAdelanto: number;
  montoOtorgamiento: number;
  girosDigitados: number;
  girosEmitidos: number;
  girosAnulados: number;
}

export interface ResumenMovimientosDto {
  fecha: string;
  cantidadMovimientos: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoNeto: number;
}

// ===================== Giro Service =====================

export const giroService = {
  getAll: async (): Promise<GiroDto[]> => {
    const response = await api.get<GiroDto[]>('/Giros');
    return response.data;
  },

  getById: async (id: number): Promise<GiroDto> => {
    const response = await api.get<GiroDto>(`/Giros/${id}`);
    return response.data;
  },

  getByCliente: async (rutCliente: string): Promise<GiroDto[]> => {
    const response = await api.get<GiroDto[]>(`/Giros/cliente/${rutCliente}`);
    return response.data;
  },

  getByOperacion: async (numOperacion: number): Promise<GiroDto[]> => {
    const response = await api.get<GiroDto[]>(`/Giros/operacion/${numOperacion}`);
    return response.data;
  },

  getByFecha: async (fechaInicio: string, fechaFin: string): Promise<GiroDto[]> => {
    const response = await api.get<GiroDto[]>(`/Giros/fecha/${fechaInicio}/${fechaFin}`);
    return response.data;
  },

  getByFiltro: async (filtro: FiltroTesoreriaDto): Promise<GiroDto[]> => {
    const response = await api.post<GiroDto[]>('/Giros/filtro', filtro);
    return response.data;
  },

  getResumen: async (fecha: string): Promise<ResumenGirosDto> => {
    const response = await api.get<ResumenGirosDto>(`/Giros/resumen/${fecha}`);
    return response.data;
  },

  create: async (giro: GiroCreateDto): Promise<number> => {
    const response = await api.post<number>('/Giros', giro);
    return response.data;
  },

  update: async (id: number, giro: GiroupdateDto): Promise<boolean> => {
    const response = await api.put<boolean>(`/Giros/${id}`, giro);
    return response.data;
  },

  emitir: async (id: number, usuario: string): Promise<boolean> => {
    const response = await api.patch<boolean>(`/Giros/${id}/emitir?usuario=${usuario}`);
    return response.data;
  },

  anular: async (id: number, usuario: string): Promise<boolean> => {
    const response = await api.patch<boolean>(`/Giros/${id}/anular?usuario=${usuario}`);
    return response.data;
  },

  delete: async (id: number): Promise<boolean> => {
    const response = await api.delete<boolean>(`/Giros/${id}`);
    return response.data;
  },
};

// ===================== Movimiento Service =====================

export const movimientoService = {
  getAll: async (): Promise<MovimientoDto[]> => {
    const response = await api.get<MovimientoDto[]>('/Movimientos');
    return response.data;
  },

  getById: async (id: number): Promise<MovimientoDto> => {
    const response = await api.get<MovimientoDto>(`/Movimientos/${id}`);
    return response.data;
  },

  getByFecha: async (fecha: string): Promise<MovimientoDto[]> => {
    const response = await api.get<MovimientoDto[]>(`/Movimientos/fecha/${fecha}`);
    return response.data;
  },

  getPizarra: async (fechaInicio: string, fechaFin: string): Promise<MovimientoDto[]> => {
    const response = await api.get<MovimientoDto[]>(`/Movimientos/pizarra/${fechaInicio}/${fechaFin}`);
    return response.data;
  },

  getByFiltro: async (filtro: FiltroTesoreriaDto): Promise<MovimientoDto[]> => {
    const response = await api.post<MovimientoDto[]>('/Movimientos/filtro', filtro);
    return response.data;
  },

  getResumen: async (fecha: string): Promise<ResumenMovimientosDto> => {
    const response = await api.get<ResumenMovimientosDto>(`/Movimientos/resumen/${fecha}`);
    return response.data;
  },

  create: async (movimiento: MovimientoCreateDto): Promise<number> => {
    const response = await api.post<number>('/Movimientos', movimiento);
    return response.data;
  },

  update: async (id: number, movimiento: MovimientoupdateDto): Promise<boolean> => {
    const response = await api.put<boolean>(`/Movimientos/${id}`, movimiento);
    return response.data;
  },

  delete: async (id: number): Promise<boolean> => {
    const response = await api.delete<boolean>(`/Movimientos/${id}`);
    return response.data;
  },
};

// ===================== Interfaces Arqueo =====================

export interface ArqueoDocumentoDto {
  tipoDocumento: string;
  numeroOperacion: number;
  numeroDocumento: number;
  rutDeudor: number;
  fechaVencimiento: string | null;
  montoDocumento: number;
  estadoDocumento: number;
  rutCliente: number;
  nombreCliente: string | null;
  nombreDeudor: string | null;
  codigoBanco: string | null;
  cuentaCorriente: string | null;
  nombreBanco: string | null;
  descripcionTipoDocumento: string | null;
  descripcionEstado: string | null;
}

export interface FiltroArqueoDto {
  fechaDesde: string;
  fechaHasta: string;
  rutCliente?: number;
  tipoDocumento?: string;
  estado?: number;
  soloRetencion?: boolean;
}

export interface ResumenArqueoDto {
  fechaDesde: string;
  fechaHasta: string;
  totalDocumentos: number;
  montoTotal: number;
  totalFacturas: number;
  montoFacturas: number;
  totalCheques: number;
  montoCheques: number;
  totalLetras: number;
  montoLetras: number;
  documentosVigentes: number;
  documentosMorosos: number;
  documentosCancelados: number;
}

// ===================== Arqueo Service =====================

export const arqueoService = {
  consultar: async (filtro: FiltroArqueoDto): Promise<ArqueoDocumentoDto[]> => {
    const response = await api.post<ArqueoDocumentoDto[]>('/Arqueo/consultar', filtro);
    return response.data;
  },

  getByCliente: async (rutCliente: number, fechaDesde: string, fechaHasta: string): Promise<ArqueoDocumentoDto[]> => {
    const response = await api.get<ArqueoDocumentoDto[]>(`/Arqueo/cliente/${rutCliente}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
    return response.data;
  },

  getByTipoDocumento: async (tipoDocumento: string, fechaDesde: string, fechaHasta: string): Promise<ArqueoDocumentoDto[]> => {
    const response = await api.get<ArqueoDocumentoDto[]>(`/Arqueo/tipo/${tipoDocumento}?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`);
    return response.data;
  },

  getResumen: async (filtro: FiltroArqueoDto): Promise<ResumenArqueoDto> => {
    const response = await api.post<ResumenArqueoDto>('/Arqueo/resumen', filtro);
    return response.data;
  },

  getDocumentosVencidos: async (fechaCorte?: string): Promise<ArqueoDocumentoDto[]> => {
    const params = fechaCorte ? `?fechaCorte=${fechaCorte}` : '';
    const response = await api.get<ArqueoDocumentoDto[]>(`/Arqueo/vencidos${params}`);
    return response.data;
  },

  getDocumentosPorVencer: async (fechaDesde?: string, fechaHasta?: string): Promise<ArqueoDocumentoDto[]> => {
    let params = '';
    if (fechaDesde) params += `?fechaDesde=${fechaDesde}`;
    if (fechaHasta) params += `${params ? '&' : '?'}fechaHasta=${fechaHasta}`;
    const response = await api.get<ArqueoDocumentoDto[]>(`/Arqueo/por-vencer${params}`);
    return response.data;
  },
};
