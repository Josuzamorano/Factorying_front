// Modelos migrados de VB6

export interface LoginRequest {
  usuario: string;
  password: string;
  cambiarPassword?: boolean;
  nuevoPassword?: string;
}

export interface LoginResponse {
  exitoso: boolean;
  mensaje?: string;
  token?: string;
  usuario?: UsuarioDto;
  menu?: MenuOpcionDto[];
  requiereCambioPassword?: boolean;
  requiere2FA?: boolean;
  tokenTemporal2FA?: string;
}

export interface UsuarioDto {
  login: string;
  nombre: string;
  codigoPerfil?: number;
  codigoEjecutivo?: number;
  codigoSucursal?: number;
}

export interface MenuOpcionDto {
  codigo: number;
  nombre: string;
  descripcion?: string;
  ruta?: string;
  icono?: string;
  orden: number;
  subMenu?: MenuOpcionDto[];
}
