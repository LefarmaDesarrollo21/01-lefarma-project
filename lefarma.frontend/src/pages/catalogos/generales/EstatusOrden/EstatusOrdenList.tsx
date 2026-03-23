import { useState, useEffect } from 'react';
import { API } from '@/services/api';
import { ApiResponse } from '@/types/api.types';
import { usePageTitle } from '@/hooks/usePageTitle';

interface EstatusOrden {
  idEstatusOrden: number;
  nombre: string;
  descripcion?: string;
  siguienteEstatusId?: number;
  requiereAccion: boolean;
  activo: boolean;
  fechaCreacion: string;
}

export default function EstatusOrdenList() {
  usePageTitle('Estatus de Orden', 'Flujo de autorizaciones - READ ONLY');
  const [estatus, setEstatus] = useState<EstatusOrden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEstatus();
  }, []);

  const fetchEstatus = async () => {
    try {
      setLoading(true);
      const response = await API.get<ApiResponse<EstatusOrden[]>>('/catalogos/EstatusOrden');
      if (response.data.success) {
        setEstatus(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error al cargar estatus de orden:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Estatus de Orden</h1>
        <p className="text-muted-foreground">Flujo de autorizaciones del sistema (READ-ONLY)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando estatus...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Nombre</th>
                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                <th className="px-4 py-3 text-left font-medium">Req. Acción</th>
              </tr>
            </thead>
            <tbody>
              {estatus.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No hay estatus registrados
                  </td>
                </tr>
              ) : (
                estatus.map((est) => (
                  <tr key={est.idEstatusOrden} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">{est.idEstatusOrden}</td>
                    <td className="px-4 py-3 font-medium">{est.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{est.descripcion || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        est.requiereAccion
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {est.requiereAccion ? 'Sí' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
