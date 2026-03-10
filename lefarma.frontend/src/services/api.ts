import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api.types';

// Crear instancia de Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request - Agregar token automáticamente
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Si es error 401 (No autorizado), limpiar sesión
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('empresa');
      localStorage.removeItem('sucursal');
      
      // Redirigir al login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Si es error 403 (Forbidden)
    if (error.response?.status === 403) {
      console.error('No tienes permisos para realizar esta acción');
    }

    // Formatear el error
    const apiError: ApiError = {
      message: error.response?.data?.message || 'Error al comunicarse con el servidor',
      errors: error.response?.data?.errors,
      statusCode: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  }
);

// Exportar métodos del API
export const API = {
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  patch: apiClient.patch,
  delete: apiClient.delete,
};

export default apiClient;
