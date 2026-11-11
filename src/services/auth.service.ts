import api from './api';
import type { LoginRequest, LoginResponse, MenuOpcionDto, UsuarioDto } from '../types/auth.types';

/**
 * Servicio de Autenticación - Migrado de F_AC1000.frm
 */
export const authService = {
  /**
   * Login - Equivalente a CommandAceptar_Click en F_AC1000.frm
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', request);

    if (response.data.exitoso && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      localStorage.setItem('menu', JSON.stringify(response.data.menu));
    }

    return response.data;
  },

  async verificar2FA(usuario: string, codigo: string, tokenTemporal: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/verificar-2fa', {
      usuario,
      codigo,
      tokenTemporal,
    });

    if (response.data.exitoso && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      localStorage.setItem('menu', JSON.stringify(response.data.menu));
    }

    return response.data;
  },

  /**
   * Logout - Equivalente a CB3_PRIN_Click en F_PRIN.frm
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      localStorage.removeItem('menu');
    }
  },

  /**
   * Cambiar password
   */
  async cambiarPassword(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/cambiar-password', request);
    
    if (response.data.exitoso && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      localStorage.setItem('menu', JSON.stringify(response.data.menu));
    }
    
    return response.data;
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isLoggedIn(): boolean {
    return !!this.getToken();
  },

  getUsuario(): UsuarioDto | null {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  getMenu(): MenuOpcionDto[] {
    const menu = localStorage.getItem('menu');
    return menu ? JSON.parse(menu) : [];
  },
};
