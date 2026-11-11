import api from './api';

export interface Banco {
  codigoBanco: number;
  nombreBanco: string;
  codigoPlaza?: number;
  nombrePlaza?: string;
  estado?: number;
}

export const bancoService = {
  getAll: async (): Promise<Banco[]> => {
    const response = await api.get<Banco[]>('/bancos');
    return response.data;
  },

  getById: async (codigo: number): Promise<Banco> => {
    const response = await api.get<Banco>(`/bancos/${codigo}`);
    return response.data;
  },
};

export default bancoService;
