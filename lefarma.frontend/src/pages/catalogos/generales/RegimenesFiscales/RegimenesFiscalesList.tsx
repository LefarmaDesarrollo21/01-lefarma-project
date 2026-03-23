import { useState, useEffect } from 'react';
import { API } from '@/services/api';
import { ApiResponse } from '@/types/api.types';
import { usePageTitle } from '@/hooks/usePageTitle';

interface RegimenFiscal {
  idRegimenFiscal: number;
  clave: string;
  descripcion: string;
  tipoPersona: string;
  activo: boolean;
  fechaCreacion: string;
}

export default function RegimenesFiscalesList() {
  usePageTitle('Regímenes Fiscales', 'Catálogo SAT CFDI 4.0');
  const [regimenes, setRegimenes] = useState<RegimenFiscal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegimenes();
  }, []);

  const fetchRegimenes = async () => {
    try {
      setLoading(true);
      const response = await API.get<ApiResponse<RegimenFiscal[]>>('/catalogos/RegimenesFiscales');
      if (response.data.success) {
        setRegimenes(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error al cargar regímenes fiscales:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Regímenes Fiscales SAT</h1>
        <p className="text-muted-foreground">Catálogo oficial SAT CFDI 4.0 (~30 regímenes)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando regímenes fiscales...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Clave</th>
                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                <th className="px-4 py-3 text-left font-medium">Tipo</th>
                <th className="px-4 py-3 text-left font-medium">Activo</th>
              </tr>
            </thead>
            <tbody>
              {regimenes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No hay regímenes fiscales registrados
                  </td>
                </tr>
              ) : (
                regimenes.map((regimen) => (
                  <tr key={regimen.idRegimenFiscal} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-sm">{regimen.clave}</td>
                    <td className="px-4 py-3">{regimen.descripcion}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        regimen.tipoPersona === 'Moral'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {regimen.tipoPersona}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        regimen.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {regimen.activo ? 'Activo' : 'Inactivo'}
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
