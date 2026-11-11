import api from './api';

// ==================== INTERFACES ====================

export interface FiltroAnticiposCursados {
  fechaDesde: string;
  fechaHasta: string;
  tipoDocumento?: string;
  rutCliente?: number;
  rutEjecutivo?: number;
  formato?: number;
}

export interface FiltroProtestosDiarios {
  fechaDesde: string;
  fechaHasta: string;
  rutEjecutivo?: number;
  formato?: number;
}

export interface FiltroDocumentosDeudor {
  rutDeudor?: number;
  tipoDocumento?: string;
  tipoDetalle?: number;
  formato?: number;
}

export interface FiltroCarteraCliente {
  rutCliente?: number;
  estado?: string;
  fechaCorte?: string;
  formato?: number;
}

export interface FiltroDevengamiento {
  fechaCorte: string;
  centroCosto?: number;
  rutCliente?: number;
  formato?: number;
}

export interface FiltroAdelantos {
  fechaDesde: string;
  fechaHasta: string;
  rutCliente?: number;
  estado?: string;
  formato?: number;
}

export interface FiltroCupoCliente {
  rutCliente?: number;
  utilizacionMinima?: number;
  formato?: number;
}

export interface FiltroVolumenOperaciones {
  anio: number;
  mes?: number;
  formato?: number;
}

export interface FiltroExcedentes {
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  rutCliente?: number;
  formato?: number;
}

export interface FiltroConcentracionTerceros {
  porcentajeMinimo?: number;
  formato?: number;
}

// ==================== SERVICIO ====================

export const informesService = {
  // Catálogo de informes disponibles
  getCatalogo: () =>
    api.get('/informes/catalogo'),

  // Resumen general para dashboard
  getResumen: () =>
    api.get('/informes/resumen'),

  // Historial de informes generados
  getHistorial: (fechaDesde?: string, fechaHasta?: string, usuarioId?: number) =>
    api.get('/informes/historial', {
      params: { fechaDesde, fechaHasta, usuarioId }
    }),

  // Informe de Anticipos Cursados
  getAnticiposCursados: (filtro: FiltroAnticiposCursados) =>
    api.post('/informes/anticipos-cursados', filtro),

  // Informe de Protestos Diarios
  getProtestosDiarios: (filtro: FiltroProtestosDiarios) =>
    api.post('/informes/protestos-diarios', filtro),

  // Informe de Documentos por Deudor
  getDocumentosDeudor: (filtro: FiltroDocumentosDeudor) =>
    api.post('/informes/documentos-deudor', filtro),

  // Informe de Cartera Cliente
  getCarteraCliente: (filtro: FiltroCarteraCliente) =>
    api.post('/informes/cartera-cliente', filtro),

  // Informe de Devengamiento
  getDevengamiento: (filtro: FiltroDevengamiento) =>
    api.post('/informes/devengamiento', filtro),

  // Informe de Adelantos
  getAdelantos: (filtro: FiltroAdelantos) =>
    api.post('/informes/adelantos', filtro),

  // Informe de Cupo Cliente
  getCupoClientes: (filtro: FiltroCupoCliente) =>
    api.post('/informes/cupo-cliente', filtro),

  // Informe de Volumen de Operaciones
  getVolumenOperaciones: (filtro: FiltroVolumenOperaciones) =>
    api.post('/informes/volumen-operaciones', filtro),

  // Informe de Excedentes
  getExcedentes: (filtro: FiltroExcedentes) =>
    api.post('/informes/excedentes', filtro),

  // Informe de Concentración de Terceros
  getConcentracionTerceros: (filtro: FiltroConcentracionTerceros) =>
    api.post('/informes/concentracion-terceros', filtro),

  // Exportar a Excel
  exportarExcel: (tipoInforme: string, filtro: any) =>
    api.post(`/informes/${tipoInforme}/excel`, filtro, {
      responseType: 'blob'
    }),

  // Exportar a PDF
  exportarPdf: (tipoInforme: string, filtro: any) =>
    api.post(`/informes/${tipoInforme}/pdf`, filtro, {
      responseType: 'blob'
    }),
};

export default informesService;
