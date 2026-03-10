// Tipos para Permisos

export interface Permiso {
  id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface CreatePermisoDto {
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdatePermisoDto {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  activo?: boolean;
}
