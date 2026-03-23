import { useState, useEffect } from 'react';
import { API } from '@/services/api';
import { ApiResponse } from '@/types/api.types';
import { usePageTitle } from '@/hooks/usePageTitle';

interface CuentaContable {
  idCuentaContable: number;
  cuenta: string;
  descripcion: string;
  nivel1: string;
  nivel2: string;
  empresaPrefijo?: string;
  centroCostoId?: number;
  centroCostoNombre?: string;
  activo: boolean;
  fechaCreacion: string;
}

export default function CuentasContablesList() {
  usePageTitle('Cuentas Contables', 'Catálogo contable del sistema');
  const [cuentas, setCuentas] = useState<CuentaContable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCuentas();
  }, []);

  const fetchCuentas = async () => {
    try {
      setLoading(true);
      const response = await API.get<ApiResponse<CuentaContable[]>>('/catalogos/CuentasContables');
      if (response.data.success) {
        setCuentas(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error al cargar cuentas contables:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cuentas Contables</h1>
        <p className="text-muted-foreground">Catálogo contable del sistema (~60 cuentas de nivel 1-2)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Cargando cuentas contables...</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Cuenta</th>
                <th className="px-4 py-3 text-left font-medium">Descripción</th>
                <th className="px-4 py-3 text-left font-medium">Nivel 1</th>
                <th className="px-4 py-3 text-left font-medium">Nivel 2</th>
                <th className="px-4 py-3 text-left font-medium">Centro Costo</th>
                <th className="px-4 py-3 text-left font-medium">Activo</th>
              </tr>
            </thead>
            <tbody>
              {cuentas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No hay cuentas contables registradas
                  </td>
                </tr>
              ) : (
                cuentas.map((cuenta) => (
                  <tr key={cuenta.idCuentaContable} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-sm">{cuenta.cuenta}</td>
                    <td className="px-4 py-3">{cuenta.descripcion}</td>
                    <td className="px-4 py-3 font-mono text-xs">{cuenta.nivel1}</td>
                    <td className="px-4 py-3 font-mono text-xs">{cuenta.nivel2}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cuenta.centroCostoNombre || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        cuenta.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cuenta.activo ? 'Activo' : 'Inactivo'}
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
