import { useState, useEffect } from 'react';
import { API } from '@/services/api';
import { ApiResponse } from '@/types/api.types';
import { usePageTitle } from '@/hooks/usePageTitle';

interface Proveedor {
  idProveedor: number;
  razonSocial: string;
  rfc?: string;
  codigoPostal?: string;
  regimenFiscalId?: number;
  regimenFiscalDescripcion?: string;
  sinDatosFiscales: boolean;
  autorizadoPorCxP: boolean;
  fechaRegistro: string;
}

export default function ProveedoresList() {
  usePageTitle('Proveedores', 'Catálogo de proveedores CxP');
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const response = await API.get<ApiResponse<Proveedor[]>>('/catalogos/Proveedores');
      if (response.data.success) {
        setProveedores(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Proveedores</h1>
        <p className="text-muted-foreground">Catálogo de proveedores (se llena por autorización de CxP)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando proveedores...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">RFC</th>
                <th className="px-4 py-3 text-left font-medium">Razón Social</th>
                <th className="px-4 py-3 text-left font-medium">CP</th>
                <th className="px-4 py-3 text-left font-medium">Régimen Fiscal</th>
                <th className="px-4 py-3 text-left font-medium">Sin Datos Fiscales</th>
                <th className="px-4 py-3 text-left font-medium">Autorizado CxP</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No hay proveedores registrados
                  </td>
                </tr>
              ) : (
                proveedores.map((prov) => (
                  <tr key={prov.idProveedor} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-sm">{prov.rfc || '-'}</td>
                    <td className="px-4 py-3 font-medium">{prov.razonSocial}</td>
                    <td className="px-4 py-3 text-muted-foreground">{prov.codigoPostal || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{prov.regimenFiscalDescripcion || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        prov.sinDatosFiscales
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {prov.sinDatosFiscales ? 'Sí' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        prov.autorizadoPorCxP
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {prov.autorizadoPorCxP ? 'Sí' : 'No'}
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
