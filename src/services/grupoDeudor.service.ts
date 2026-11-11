// =============================================
// grupoDeudor.service.ts
// Service for Grupos de Deudores - F_CD1300.frm
// =============================================

import axios from 'axios';
import { API_BASE_URL } from './api';

// =============================================
// Types
// =============================================

export interface GrupoDeudorDto {
  rutGrupo: number;
  digitoVerificador: string;
  razonSocial: string;
  montoLineaAprobada: number;
  fechaVencimiento: string | null;
  fechaCreacion: string;
  fechaModificacion: string | null;
  cantidadDeudores: number;
  montoOcupado: number;
  montoDisponible: number;
}

export interface CreateGrupoDeudorDto {
  rutGrupo: number;
  razonSocial: string;
  montoLineaAprobada: number;
  fechaVencimiento: string | null;
}

export interface updateGrupoDeudorDto {
  razonSocial: string;
  montoLineaAprobada: number;
  fechaVencimiento: string | null;
}

export interface DeudorGrupoDto {
  id: number;
  rutGrupo: number;
  nombreGrupo: string;
  rutDeudor: number;
  digitoVerificador: string;
  nombreDeudor: string;
  nombreFantasia: string | null;
  giro: string | null;
  fechaCreacion: string;
}

export interface CreateDeudorGrupoDto {
  rutGrupo: number;
  rutDeudor: number;
}

export interface CupoGrupoDto {
  rutGrupo: number;
  razonSocial: string;
  montoLinea: number;
  montoOcupado: number;
  montoDisponible: number;
  porcentajeUtilizacion: number;
}

// =============================================
// Helper para obtener token
// =============================================

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// =============================================
// Servicios de Grupo Deudor
// =============================================

export const grupoDeudorService = {
  // Obtener todos los grupos
  getAll: async (): Promise<GrupoDeudorDto[]> => {
    const response = await axios.get(`${API_BASE_URL}/grupos-deudor`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Buscar grupos
  search: async (term: string): Promise<GrupoDeudorDto[]> => {
    const response = await axios.get(`${API_BASE_URL}/grupos-deudor/search`, {
      params: { term },
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Obtener un grupo por RUT
  getByRut: async (rut: number): Promise<GrupoDeudorDto> => {
    const response = await axios.get(`${API_BASE_URL}/grupos-deudor/${rut}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Obtener cupo del grupo
  getCupo: async (rut: number): Promise<CupoGrupoDto> => {
    const response = await axios.get(`${API_BASE_URL}/grupos-deudor/${rut}/cupo`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Crear grupo
  create: async (dto: CreateGrupoDeudorDto): Promise<GrupoDeudorDto> => {
    const response = await axios.post(`${API_BASE_URL}/grupos-deudor`, dto, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Actualizar grupo
  update: async (rut: number, dto: updateGrupoDeudorDto): Promise<GrupoDeudorDto> => {
    const response = await axios.put(`${API_BASE_URL}/grupos-deudor/${rut}`, dto, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Eliminar grupo
  delete: async (rut: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/grupos-deudor/${rut}`, {
      headers: getAuthHeader()
    });
  }
};

// =============================================
// Servicios de Deudores del Grupo
// =============================================

export const deudorGrupoService = {
  // Obtener deudores de un grupo
  getByGrupo: async (rutGrupo: number): Promise<DeudorGrupoDto[]> => {
    const response = await axios.get(`${API_BASE_URL}/grupos-deudor/${rutGrupo}/deudores`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // Agregar deudor a un grupo
  add: async (rutGrupo: number, rutDeudor: number): Promise<DeudorGrupoDto> => {
    const response = await axios.post(
      `${API_BASE_URL}/grupos-deudor/${rutGrupo}/deudores`,
      { rutGrupo, rutDeudor },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Eliminar deudor de un grupo por ID
  deleteById: async (rutGrupo: number, id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/grupos-deudor/${rutGrupo}/deudores/${id}`, {
      headers: getAuthHeader()
    });
  },

  // Eliminar deudor de un grupo por RUT
  deleteByRut: async (rutGrupo: number, rutDeudor: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/grupos-deudor/${rutGrupo}/deudores/rut/${rutDeudor}`, {
      headers: getAuthHeader()
    });
  }
};

// =============================================
// Helper para formatear RUT
// =============================================

export const formatRutGrupo = (rut: number, dv: string): string => {
  const rutStr = rut.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${rutStr}-${dv}`;
};

// =============================================
// Helper para formatear moneda
// =============================================

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};
