import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Empresa, Sucursal } from '@/types/auth.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building2, Building, AlertCircle, Loader2 } from 'lucide-react';
import logoEstatico from '@/assets/logo.png';

interface EmpresaSucursalSelectorProps {
  isOpen: boolean;
}

export default function EmpresaSucursalSelector({
  isOpen,
}: EmpresaSucursalSelectorProps) {
  const navigate = useNavigate();
  const { user, setEmpresa, setSucursal } = useAuthStore();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedSucursal, setSelectedSucursal] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSucursales, setIsLoadingSucursales] = useState(false);
  const [error, setError] = useState('');

  // Cargar empresas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadEmpresas();
    }
  }, [isOpen]);

  // Cargar sucursales cuando se selecciona una empresa
  useEffect(() => {
    if (selectedEmpresa) {
      loadSucursales(selectedEmpresa);
    } else {
      setSucursales([]);
      setSelectedSucursal('');
    }
  }, [selectedEmpresa]);

  const loadEmpresas = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.getEmpresas();
      setEmpresas(data);

      // Si solo hay una empresa, seleccionarla automáticamente
      if (data.length === 1) {
        setSelectedEmpresa(data[0].id);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar empresas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSucursales = async (empresaId: string) => {
    setIsLoadingSucursales(true);
    setError('');
    try {
      const data = await authService.getSucursales(empresaId);
      setSucursales(data);

      // Si solo hay una sucursal, seleccionarla automáticamente
      if (data.length === 1) {
        setSelectedSucursal(data[0].id);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar sucursales';
      setError(message);
    } finally {
      setIsLoadingSucursales(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedEmpresa || !selectedSucursal) {
      setError('Por favor selecciona empresa y sucursal');
      return;
    }

    const empresa = empresas.find((e) => e.id === selectedEmpresa);
    const sucursal = sucursales.find((s) => s.id === selectedSucursal);

    if (empresa && sucursal) {
      setEmpresa(empresa);
      setSucursal(sucursal);
      navigate('/dashboard', { replace: true });
    }
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    navigate('/login', { replace: true });
  };

  const empresaSeleccionada = empresas.find((e) => e.id === selectedEmpresa);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <img
              src={logoEstatico}
              alt="Grupo LeFarma"
              style={{ width: '120px', height: 'auto' }}
            />
          </div>
          <DialogTitle className="text-xl">
            Selecciona tu ubicación
          </DialogTitle>
          <DialogDescription>
            Bienvenido, {user?.nombre || user?.username}. Por favor selecciona la
            empresa y sucursal donde trabajarás.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando empresas...
              </span>
            </div>
          ) : (
            <>
              {/* Selección de Empresa */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresa
                </label>
                <Select
                  value={selectedEmpresa}
                  onValueChange={setSelectedEmpresa}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selección de Sucursal */}
              {selectedEmpresa && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Sucursal
                    {empresaSeleccionada && (
                      <span className="text-muted-foreground font-normal">
                        - {empresaSeleccionada.nombre}
                      </span>
                    )}
                  </label>
                  {isLoadingSucursales ? (
                    <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando sucursales...</span>
                    </div>
                  ) : (
                    <Select
                      value={selectedSucursal}
                      onValueChange={setSelectedSucursal}
                      disabled={isLoadingSucursales || sucursales.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una sucursal" />
                      </SelectTrigger>
                      <SelectContent>
                        {sucursales.map((sucursal) => (
                          <SelectItem key={sucursal.id} value={sucursal.id}>
                            {sucursal.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {sucursales.length === 0 && !isLoadingSucursales && (
                    <p className="text-sm text-muted-foreground">
                      No hay sucursales disponibles para esta empresa.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleConfirm}
            disabled={!selectedEmpresa || !selectedSucursal || isLoading}
            className="w-full"
          >
            {isLoading ? 'Procesando...' : 'Continuar'}
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
