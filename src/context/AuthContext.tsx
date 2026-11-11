import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UsuarioDto, MenuOpcionDto, LoginRequest, LoginResponse } from '../types/auth.types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  usuario: UsuarioDto | null;
  menu: MenuOpcionDto[];
  isAuthenticated: boolean;
  loading: boolean;
  login: (request: LoginRequest) => Promise<LoginResponse>;
  verificar2FA: (usuario: string, codigo: string, tokenTemporal: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  cambiarPassword: (request: LoginRequest) => Promise<LoginResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<UsuarioDto | null>(null);
  const [menu, setMenu] = useState<MenuOpcionDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar sesión al iniciar
    const storedUsuario = authService.getUsuario();
    const storedMenu = authService.getMenu();
    
    if (storedUsuario) {
      setUsuario(storedUsuario);
      setMenu(storedMenu);
    }
    setLoading(false);
  }, []);

  const login = async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await authService.login(request);

    if (response.exitoso) {
      setUsuario(response.usuario || null);
      setMenu(response.menu || []);
    }

    return response;
  };

  const verificar2FA = async (usuario: string, codigo: string, tokenTemporal: string): Promise<LoginResponse> => {
    const response = await authService.verificar2FA(usuario, codigo, tokenTemporal);

    if (response.exitoso) {
      setUsuario(response.usuario || null);
      setMenu(response.menu || []);
    }

    return response;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUsuario(null);
    setMenu([]);
  };

  const cambiarPassword = async (request: LoginRequest): Promise<LoginResponse> => {
    const response = await authService.cambiarPassword(request);
    
    if (response.exitoso) {
      setUsuario(response.usuario || null);
      setMenu(response.menu || []);
    }
    
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        menu,
        isAuthenticated: !!usuario,
        loading,
        login,
        verificar2FA,
        logout,
        cambiarPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
