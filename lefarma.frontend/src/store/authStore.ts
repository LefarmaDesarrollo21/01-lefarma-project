import { create } from 'zustand';
import { AuthState, LoginCredentials, User, Empresa, Sucursal } from '@/types/auth.types';
import { authService } from '@/services/authService';
import type { SseUserInfo } from '@/types/sse.types';

function sseUserInfoToUser(sseUser: SseUserInfo): User {
  return {
    id: String(sseUser.id),
    username: sseUser.username,
    email: sseUser.correo || '',
    firstName: sseUser.nombre?.split(' ')[0] || '',
    lastName: sseUser.nombre?.split(' ').slice(1).join(' ') || '',
    roles: sseUser.roles.map(r => r.nombreRol),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  empresa: null,
  sucursal: null,
  isAuthenticated: false,
  isLoading: false,

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

  setEmpresa: (empresa: Empresa) => {
    authService.setEmpresa(empresa);
    set({ empresa });
  },

  setSucursal: (sucursal: Sucursal) => {
    authService.setSucursal(sucursal);
    set({ sucursal });
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  updateUserFromSse: (sseUser: SseUserInfo) => {
    const user = sseUserInfoToUser(sseUser);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

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
