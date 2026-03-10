import { API } from './api';
import { LoginCredentials, LoginResponse, User, Empresa, Sucursal } from '@/types/auth.types';
import { ApiResponse } from '@/types/api.types';

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await API.post<ApiResponse<LoginResponse>>(
      'api/auth/login',
      credentials
    );
    
    // Guardar token en localStorage
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('empresa');
    localStorage.removeItem('sucursal');
  },

  /**
   * Obtener usuario actual desde localStorage
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Obtener token desde localStorage
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Verificar si hay una sesión activa
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  /**
   * Guardar empresa seleccionada
   */
  setEmpresa: (empresa: Empresa) => {
    localStorage.setItem('empresa', JSON.stringify(empresa));
  },

  /**
   * Obtener empresa seleccionada
   */
  getEmpresa: (): Empresa | null => {
    const empresaStr = localStorage.getItem('empresa');
    if (!empresaStr) return null;
    
    try {
      return JSON.parse(empresaStr) as Empresa;
    } catch {
      return null;
    }
  },

  /**
   * Guardar sucursal seleccionada
   */
  setSucursal: (sucursal: Sucursal) => {
    localStorage.setItem('sucursal', JSON.stringify(sucursal));
  },

  /**
   * Obtener sucursal seleccionada
   */
  getSucursal: (): Sucursal | null => {
    const sucursalStr = localStorage.getItem('sucursal');
    if (!sucursalStr) return null;
    
    try {
      return JSON.parse(sucursalStr) as Sucursal;
    } catch {
      return null;
    }
  },

  /**
   * Obtener empresas disponibles para el usuario
   */
  getEmpresas: async (): Promise<Empresa[]> => {
    const response = await API.get<ApiResponse<Empresa[]>>('/auth/empresas');
    return response.data.data;
  },

  /**
   * Obtener sucursales de una empresa
   */
  getSucursales: async (empresaId: string): Promise<Sucursal[]> => {
    const response = await API.get<ApiResponse<Sucursal[]>>(
      `/empresas/${empresaId}/sucursales`
    );
    return response.data.data;
  },
};
