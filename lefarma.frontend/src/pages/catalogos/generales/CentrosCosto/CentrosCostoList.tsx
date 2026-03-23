import { useState, useEffect } from 'react';
import { API } from '@/services/api';
import { ApiResponse } from '@/types/api.types';
import { usePageTitle } from '@/hooks/usePageTitle';

interface CentroCosto {
  idCentroCosto: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
}

export default function CentrosCostoList() {
  usePageTitle('Centros de Costo', 'Gestión de centros de costo');
  const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCentrosCosto();
  }, []);

  const fetchCentrosCosto = async () => {
    try {
      setLoading(true);
      const response = await API.get<ApiResponse<CentroCosto[]>>('/catalogos/CentrosCosto');
      if (response.data.success) {
        setCentrosCosto(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error al cargar centros de costo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Centros de Costo</h1>
        <p className="text-muted-foreground">Gestión de centros de costo del catálogo general</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando centros de costo...</p>
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
                <th className="px-4 py-3 text-left font-medium">Activo</th>
              </tr>
            </thead>
            <tbody>
              {centrosCosto.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No hay centros de costo registrados
                  </td>
                </tr>
              ) : (
                centrosCosto.map((centro) => (
                  <tr key={centro.idCentroCosto} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3">{centro.idCentroCosto}</td>
                    <td className="px-4 py-3 font-medium">{centro.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{centro.descripcion || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        centro.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {centro.activo ? 'Activo' : 'Inactivo'}
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
