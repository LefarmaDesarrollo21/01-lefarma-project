import { create } from 'zustand';
import {
  AuthState,
  UserInfo,
  Empresa,
  Sucursal,
} from '@/types/auth.types';
import type { SseUserInfo } from '@/types/sse.types';
import { authService } from '@/services/authService';
import { useConfigStore } from './configStore';

const LEGACY_TOKEN_KEY = 'token';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  empresa: null,
  sucursal: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  loginStep: 1,
  availableDomains: [],
  requiresDomainSelection: false,
  displayName: null,
  pendingUsername: null,
  empresas: [],
  sucursales: [],
  authFlowCompleted: false,

  loginStepOne: async (username: string) => {
    set({ isLoading: true });
    try {
      const response = await authService.loginStepOne(username);
      set({
        loginStep: 2,
        availableDomains: response.domains,
        requiresDomainSelection: response.requiresDomainSelection,
        displayName: response.displayName || null,
        pendingUsername: username,
        isLoading: false,
      });

      sessionStorage.setItem(
        'loginFlow',
        JSON.stringify({
          step: 2,
          username,
          domains: response.domains,
          requiresDomainSelection: response.requiresDomainSelection,
          displayName: response.displayName,
        })
      );
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginStepTwo: async (password: string, domain: string) => {
    const { pendingUsername } = get();
    if (!pendingUsername) {
      throw new Error('No hay usuario pendiente');
    }

    set({ isLoading: true });
    try {
      const response = await authService.loginStepTwo({
        username: pendingUsername,
        password,
        domain,
      });

      sessionStorage.removeItem('loginFlow');

      // Cargar empresas y sucursales para el paso 3
      const [empresas, sucursales] = await Promise.all([
        authService.getEmpresas(),
        authService.getSucursales(),
      ]);

      // Sincronizar con configStore
      useConfigStore.getState().updatePerfil({
        nombre: response.user.nombre || '',
        correo: response.user.correo || '',
      });

      set({
        user: response.user,
        token: response.accessToken,
        isAuthenticated: false, // No autenticado hasta seleccionar empresa/sucursal
        isLoading: false,
        loginStep: 3, // Pasar al paso 3
        availableDomains: [],
        requiresDomainSelection: false,
        displayName: null,
        pendingUsername: null,
        empresas,
        sucursales,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginStepThree: async (empresaId: string, sucursalId: string) => {
    const { empresas, sucursales } = get();

    const empresa = empresas.find((e) => String(e.idEmpresa) === String(empresaId));
    const sucursal = sucursales.find((s) => String(s.idSucursal) === String(sucursalId));

    if (!empresa || !sucursal) {
      throw new Error('Empresa o sucursal no encontrada');
    }

    // Persist to localStorage
    authService.setEmpresa(empresa);
    authService.setSucursal(sucursal);
    authService.setAuthFlowCompleted(true);

    set({
      empresa,
      sucursal,
      isAuthenticated: true,
      authFlowCompleted: true,
      loginStep: 1,
      empresas: [],
      sucursales: [],
    });
  },

  resetLoginFlow: () => {
    sessionStorage.removeItem('loginFlow');
    set({
      loginStep: 1,
      availableDomains: [],
      requiresDomainSelection: false,
      displayName: null,
      pendingUsername: null,
      empresas: [],
      sucursales: [],
    });
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      token: null,
      empresa: null,
      sucursal: null,
      isAuthenticated: false,
      authFlowCompleted: false,
      loginStep: 1,
      empresas: [],
      sucursales: [],
    });

    // Redirect to login after logout
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  },

  setEmpresa: (empresa: Empresa) => {
    authService.setEmpresa(empresa);
    set({ empresa });
  },

  setSucursal: (sucursal: Sucursal) => {
    authService.setSucursal(sucursal);
    set({ sucursal });
  },

  changeEmpresaSucursal: (empresa: Empresa, sucursal: Sucursal) => {
    authService.setEmpresa(empresa);
    authService.setSucursal(sucursal);
    set({ empresa, sucursal });
  },

  setToken: (token: string) => {
    localStorage.setItem('accessToken', token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user: UserInfo) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  updateUserFromSse: (sseUser: SseUserInfo) => {
    const user: UserInfo = {
      id: sseUser.id,
      username: sseUser.username,
      nombre: sseUser.nombre,
      correo: sseUser.correo,
      dominio: sseUser.dominio,
      roles: sseUser.roles.map((r) => ({
        idRol: r.idRol,
        nombreRol: r.nombreRol,
        descripcion: r.descripcion,
      })),
      permisos: sseUser.permisos.map((p) => ({
        idPermiso: p.idPermiso,
        codigoPermiso: p.codigoPermiso,
        nombrePermiso: p.nombrePermiso,
        categoria: p.categoria,
        recurso: p.recurso,
        accion: p.accion,
      })),
    };
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  initialize: () => {
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacyToken && !localStorage.getItem('accessToken')) {
      localStorage.setItem('accessToken', legacyToken);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }

    const token = authService.getAccessToken();
    const user = authService.getCurrentUser();
    const empresa = authService.getEmpresa();
    const sucursal = authService.getSucursal();
    const authFlowCompleted = authService.getAuthFlowCompleted();

    if (token && user) {
      // Backward compatibility: if user has token but no authFlowCompleted flag,
      // treat as authenticated (pre-existing session)
      const isFullyAuthenticated = authFlowCompleted || Boolean(empresa && sucursal);

      set({
        token,
        user,
        empresa,
        sucursal,
        isAuthenticated: true,
        authFlowCompleted: isFullyAuthenticated,
      });

      // If backward compatibility case, set the flag for future sessions
      if (!authFlowCompleted && isFullyAuthenticated) {
        authService.setAuthFlowCompleted(true);
      }

      // Sincronizar perfil con configStore
      useConfigStore.getState().updatePerfil({
        nombre: user.nombre || '',
        correo: user.correo || '',
      });
    } else {
      // No auth data
      set({
        isAuthenticated: false,
        authFlowCompleted: false,
      });
    }

    const loginFlowStr = sessionStorage.getItem('loginFlow');
    if (loginFlowStr) {
      try {
        const loginFlow = JSON.parse(loginFlowStr);
        set({
          loginStep: loginFlow.step,
          pendingUsername: loginFlow.username,
          availableDomains: loginFlow.domains,
          requiresDomainSelection: loginFlow.requiresDomainSelection,
          displayName: loginFlow.displayName,
        });
      } catch {
        sessionStorage.removeItem('loginFlow');
      }
    }

    set({ isInitialized: true });
  },
}));
