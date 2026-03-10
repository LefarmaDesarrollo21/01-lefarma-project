// Tipos para Roles

export interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  permisos?: string[];
  fechaCreacion: string;
  fechaModificacion?: string;
}

export interface CreateRolDto {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  permisoIds?: string[];
}

export interface UpdateRolDto {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  permisoIds?: string[];
}
