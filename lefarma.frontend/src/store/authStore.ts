import { create } from 'zustand';
import { AuthState, LoginCredentials, User, Empresa, Sucursal } from '@/types/auth.types';
import { authService } from '@/services/authService';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  empresa: null,
  sucursal: null,
  isAuthenticated: false,
  isLoading: false,

  /**
   * Iniciar sesión
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const response = await authService.login(credentials);
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      empresa: null,
      sucursal: null,
      isAuthenticated: false,
    });
  },

  /**
   * Establecer empresa seleccionada
   */
  setEmpresa: (empresa: Empresa) => {
    authService.setEmpresa(empresa);
    set({ empresa });
  },

  /**
   * Establecer sucursal seleccionada
   */
  setSucursal: (sucursal: Sucursal) => {
    authService.setSucursal(sucursal);
    set({ sucursal });
  },

  /**
   * Establecer token manualmente
   */
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  /**
   * Establecer usuario manualmente
   */
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  /**
   * Inicializar estado desde localStorage
   */
  initialize: () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    const empresa = authService.getEmpresa();
    const sucursal = authService.getSucursal();

    if (token && user) {
      set({
        token,
        user,
        empresa,
        sucursal,
        isAuthenticated: true,
      });
    }
  },
}));
