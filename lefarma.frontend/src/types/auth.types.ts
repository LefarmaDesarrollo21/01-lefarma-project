import type { SseUserInfo } from './sse.types';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface Empresa {
  id: string;
  nombre: string;
  codigo: string;
  activo: boolean;
}

export interface Sucursal {
  id: string;
  empresaId: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  telefono?: string;
  activo: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  empresas: Empresa[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  empresa: Empresa | null;
  sucursal: Sucursal | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setEmpresa: (empresa: Empresa) => void;
  setSucursal: (sucursal: Sucursal) => void;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  updateUserFromSse: (sseUser: SseUserInfo) => void;
  initialize: () => void;
}
