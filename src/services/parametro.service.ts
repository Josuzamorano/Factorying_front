import api from './api';

// =============================================
// Tipos para Parámetros
// =============================================

export interface ParametroDto {
  codigoTabla: number;
  codigoElemento: number;
  descripcion: string;
  codigoAuxiliar?: string;
  valorNumerico?: number;
  valorTexto?: string;
  estado: number;
}

// =============================================
// Servicio de Parámetros
// =============================================

export const parametroService = {
  /**
   * Obtiene todos los parámetros de una tabla
   */
  async getByTabla(codigoTabla: number): Promise<ParametroDto[]> {
    const response = await api.get<ParametroDto[]>(`/parametros/tabla/${codigoTabla}`);
    return response.data;
  },

  /**
   * Obtiene un parámetro específico
   */
  async getById(codigoTabla: number, codigoElemento: number): Promise<ParametroDto> {
    const response = await api.get<ParametroDto>(`/parametros/${codigoTabla}/${codigoElemento}`);
    return response.data;
  }
};

export default parametroService;
