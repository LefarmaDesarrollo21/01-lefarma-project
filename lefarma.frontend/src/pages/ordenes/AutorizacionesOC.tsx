import { useEffect, useMemo, useRef, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { API } from '@/services/api';
import type { ApiResponse } from '@/types/api.types';
import { DataTable } from '@/components/ui/data-table';
import type { ColumnDef } from '@/components/ui/data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, Search, RefreshCcw, ChevronDown, ChevronRight, CheckCircle2, X, Paperclip, FileIcon, Eye, Download } from 'lucide-react';
import type { Archivo, ArchivoListItem } from '@/types/archivo.types';
import { FileUploader } from '@/components/archivos/FileUploader';
import { FileViewer } from '@/components/archivos/FileViewer';
import { archivoService } from '@/services/archivoService';
import { toast } from 'sonner';

interface OrdenCompraPartidaResponse {
  idPartida: number;
  numeroPartida: number;
  descripcion: string;
  cantidad: number;
  idUnidadMedida: number;
  precioUnitario: number;
  descuento: number;
  porcentajeIva: number;
  totalRetenciones: number;
  otrosImpuestos: number;
  deducible: boolean;
  total: number;
}

interface OrdenCompraResponse {
  idOrden: number;
  folio: string;
  idEmpresa?: number;
  idSucursal?: number;
  idArea?: number;
  idTipoGasto?: number;
  idFormaPago?: number;
  estado: string;
  idPasoActual?: number | null;
  sinDatosFiscales?: boolean;
  razonSocialProveedor: string;
  rfcProveedor?: string;
  codigoPostalProveedor?: string;
  personaContacto?: string;
  notaFormaPago?: string;
  fechaSolicitud: string;
  fechaLimitePago: string;
  subtotal: number;
  totalIva: number;
  total: number;
  notasGenerales?: string;
  idCentroCosto?: number | null;
  centroCostoNombre?: string | null;
  idCuentaContable?: number | null;
  cuentaContableNumero?: string | null;
  cuentaContableDescripcion?: string | null;
  requiereComprobacionPago: boolean;
  requiereComprobacionGasto: boolean;
  partidas: OrdenCompraPartidaResponse[];
}

interface AccionDisponibleResponse {
  idAccion: number;
  nombreAccion: string;
  tipoAccion: string;
  claseEstetica: string;
}

interface HistorialWorkflowItemResponse {
  idEvento: number;
  idOrden: number;
  idPaso: number;
  nombrePaso?: string | null;
  idAccion: number;
  nombreAccion?: string | null;
  idUsuario: number;
  nombreUsuario?: string | null;
  comentario?: string | null;
  datosSnapshot?: string | null;
  fechaEvento: string;
}

interface WorkflowListItem {
  idWorkflow: number;
  codigoProceso: string;
  nombre: string;
}

interface WorkflowHandlerConfig {
  idHandler: number;
  handlerKey: string;
  configuracionJson?: string | null;
  ordenEjecucion: number;
  activo: boolean;
  idWorkflowCampo?: number | null;
  campo?: WorkflowCampoConfig | null;
}

interface WorkflowAccionConfig {
  idAccion: number;
  nombreAccion: string;
  tipoAccion: string;
  handlers: WorkflowHandlerConfig[];
}

interface WorkflowCampoConfig {
  idWorkflowCampo: number;
  nombreTecnico: string;
  etiquetaUsuario: string;
  tipoControl: string; // 'Texto' | 'Numero' | 'Booleano' | 'Checkbox' | 'Selector' | 'Fecha' | 'Archivo'
  sourceCatalog?: string | null;
  propiedadEntidad?: string | null;
  validarFiscal?: boolean;
  activo: boolean;
}

interface WorkflowPasoConfig {
  idPaso: number;
  orden: number;
  nombrePaso: string;
  descripcionAyuda?: string | null;
  esInicio: boolean;
  esFinal: boolean;
  acciones: WorkflowAccionConfig[];
}

interface WorkflowConfigResponse {
  idWorkflow: number;
  codigoProceso: string;
  pasos: WorkflowPasoConfig[];
  campos: WorkflowCampoConfig[];
}

const ESTADO_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Creada: 'outline',
  EnRevisionF2: 'secondary',
  EnRevisionF3: 'secondary',
  EnRevisionF4: 'secondary',
  EnRevisionF5: 'secondary',
  Autorizada: 'default',
  EnTesoreria: 'default',
  Pagada: 'default',
  EnComprobacion: 'outline',
  Cerrada: 'default',
  Rechazada: 'destructive',
  Cancelada: 'outline',
};

const ESTADO_LABEL: Record<string, string> = {
  Creada: 'Creada',
  EnRevisionF2: 'En revisión - Firma 2',
  EnRevisionF3: 'En revisión - Firma 3',
  EnRevisionF4: 'En revisión - Firma 4',
  EnRevisionF5: 'En revisión - Firma 5',
  Autorizada: 'Autorizada',
  EnTesoreria: 'En tesorería',
  Pagada: 'Pagada',
  EnComprobacion: 'En comprobación',
  Cerrada: 'Cerrada',
  Rechazada: 'Rechazada',
  Cancelada: 'Cancelada',
};

const ESTADO_BADGE_CLASS: Record<string, string> = {
  Creada: 'border-slate-300 text-slate-700 bg-slate-50 dark:bg-slate-900/40',
  EnRevisionF2: 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/30',
  EnRevisionF3: 'border-indigo-300 text-indigo-700 bg-indigo-50 dark:bg-indigo-950/30',
  EnRevisionF4: 'border-violet-300 text-violet-700 bg-violet-50 dark:bg-violet-950/30',
  EnRevisionF5: 'border-fuchsia-300 text-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-950/30',
  Autorizada: 'border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30',
  EnTesoreria: 'border-cyan-300 text-cyan-700 bg-cyan-50 dark:bg-cyan-950/30',
  Pagada: 'border-teal-300 text-teal-700 bg-teal-50 dark:bg-teal-950/30',
  EnComprobacion: 'border-amber-300 text-amber-800 bg-amber-50 dark:bg-amber-950/30',
  Cerrada: 'border-green-400 text-green-800 bg-green-100 dark:bg-green-950/40',
  Rechazada: 'border-red-400 text-red-800 bg-red-100 dark:bg-red-950/40',
  Cancelada: 'border-zinc-400 text-zinc-700 bg-zinc-100 dark:bg-zinc-900/50',
};

type CampoFormItem = { campo: WorkflowCampoConfig; requerido: boolean; inputKey: string };

function getCamposParaAccion(
  accionConfig: WorkflowAccionConfig | null
): CampoFormItem[] {
  if (!accionConfig) return [];
  const result: CampoFormItem[] = [];
  const seen = new Set<string>();

  const handlers = [...(accionConfig.handlers || [])]
    .filter(h => h.activo)
    .sort((a, b) => a.ordenEjecucion - b.ordenEjecucion);

  for (const handler of handlers) {
    try {
      // RequiredFields: valida presencia — incluye Archivo, Selector, Checkbox, Texto
      if (handler.handlerKey === 'RequiredFields' && handler.campo) {
        const inputKey = handler.campo.nombreTecnico;
        if (!seen.has(inputKey)) {
          seen.add(inputKey);
          result.push({ campo: handler.campo, requerido: true, inputKey });
        }
      }

      // FieldUpdater: guarda el valor — no duplicar si RequiredFields ya lo mostró
      if (handler.handlerKey === 'FieldUpdater' && handler.campo) {
        const inputKey = handler.campo.nombreTecnico;
        if (!seen.has(inputKey)) {
          seen.add(inputKey);
          // Checkbox siempre es requerido (el usuario debe interactuar explícitamente)
          const requerido = handler.campo.tipoControl === 'Checkbox' || handler.campo.tipoControl === 'Booleano';
          result.push({ campo: handler.campo, requerido, inputKey });
        }
      }
    } catch { /* handler sin campo o JSON inválido */ }
  }
  return result;
}

export default function AutorizacionesOC() {
  usePageTitle('Autorizaciones OC', 'Bandeja de firmas y detalle de autorización');

  const [loadingDetail, setLoadingDetail] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenCompraResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedOrden, setSelectedOrden] = useState<OrdenCompraResponse | null>(null);
  const [acciones, setAcciones] = useState<AccionDisponibleResponse[]>([]);
  const [historial, setHistorial] = useState<HistorialWorkflowItemResponse[]>([]);
  const [pasosWorkflow, setPasosWorkflow] = useState<WorkflowPasoConfig[]>([]);
  const [workflowCampos, setWorkflowCampos] = useState<WorkflowCampoConfig[]>([]);
  const [accionesConfig, setAccionesConfig] = useState<Map<number, WorkflowAccionConfig>>(new Map());
  const [expandedPasoId, setExpandedPasoId] = useState<number | null>(null);
  const [expandedPartidaId, setExpandedPartidaId] = useState<number | null>(null);
  const pasosContainerRef = useRef<HTMLDivElement | null>(null);

  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('all');
  const [isFirmarModalOpen, setIsFirmarModalOpen] = useState(false);
  const [isSubmittingFirma, setIsSubmittingFirma] = useState(false);
  const [accionSeleccionada, setAccionSeleccionada] = useState<AccionDisponibleResponse | null>(null);
  const [comentarioFirma, setComentarioFirma] = useState('');
  // Dynamic campo values for the action modal (key = inputKey from handler config)
  const [camposValues, setCamposValues] = useState<Record<string, unknown>>({});
  const [catalogos, setCatalogos] = useState<Record<string, { value: string; label: string }[]>>({});
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);
  // File upload for DocumentRequired handlers
  const [archivoSubidos, setArchivoSubidos] = useState<Record<string, Archivo>>({});
  // Archivos adjuntos de la orden seleccionada
  const [archivosOrden, setArchivosOrden] = useState<ArchivoListItem[]>([]);
  const [loadingArchivos, setLoadingArchivos] = useState(false);
  const [viewerArchivoId, setViewerArchivoId] = useState<number | null>(null);

  const estados = useMemo(() => {
    const values = Array.from(new Set(ordenes.map(o => o.estado))).sort();
    return ['all', ...values];
  }, [ordenes]);

  const getEstadoLabel = (estado: string) => ESTADO_LABEL[estado] || estado;
  const formatCurrency = (value: number) => value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  const fetchOrdenes = async () => {
    try {
      const res = await API.get<ApiResponse<OrdenCompraResponse[]>>('/ordenes');
      const data = res.data.data || [];
      setOrdenes(data);
      console.log('Órdenes obtenidas:', data);
      if (data.length > 0 && selectedId == null) setSelectedId(data[0].idOrden);
    } catch (error: any) {
      toast.error(error?.message ?? 'Error al cargar bandeja de órdenes');
    }
  };

  const fetchDetalle = async (idOrden: number) => {
    try {
      setLoadingDetail(true);
      const [ordenRes, accionesRes, historialRes] = await Promise.all([
        API.get<ApiResponse<OrdenCompraResponse>>(`/ordenes/${idOrden}`),
        API.get<ApiResponse<AccionDisponibleResponse[]>>(`/ordenes/${idOrden}/acciones`).catch(() => ({ data: { data: [] } })),
        API.get<ApiResponse<HistorialWorkflowItemResponse[]>>(`/ordenes/${idOrden}/historial-workflow`).catch(() => ({ data: { data: [] } })),
      ]);

      setSelectedOrden(ordenRes.data.data || null);
      setAcciones((accionesRes as any).data?.data || []);
      setHistorial((historialRes as any).data?.data || []);

      // Cargar archivos adjuntos de la orden
      fetchArchivosOrden(idOrden);
    } catch (error: any) {
      toast.error(error?.message ?? 'Error al cargar detalle de orden');
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchArchivosOrden = async (idOrden: number) => {
    try {
      setLoadingArchivos(true);
      const archivos = await archivoService.getAll({ entidadTipo: 'OrdenCompra', entidadId: idOrden, soloActivos: true });
      setArchivosOrden(archivos);
    } catch {
      setArchivosOrden([]);
    } finally {
      setLoadingArchivos(false);
    }
  };

  const fetchPasosWorkflow = async () => {
    try {
      const listRes = await API.get<ApiResponse<WorkflowListItem[]>>('/config/workflows');
      const workflows = listRes.data.data || [];
      const workflowOc = workflows.find(w => w.codigoProceso === 'ORDEN_COMPRA');
      if (!workflowOc) return;

      const detailRes = await API.get<ApiResponse<WorkflowConfigResponse>>(`/config/workflows/${workflowOc.idWorkflow}`);
      const data = detailRes.data.data;
      if (!data) return;

      const pasos = (data.pasos || []).slice().sort((a, b) => a.orden - b.orden);
      setPasosWorkflow(pasos);
      setWorkflowCampos((data.campos || []).filter(c => c.activo));

      // Build idAccion → WorkflowAccionConfig map for fast lookup
      const map = new Map<number, WorkflowAccionConfig>();
      for (const paso of pasos) {
        for (const accion of paso.acciones || []) {
          map.set(accion.idAccion, accion);
        }
      }
      setAccionesConfig(map);
    } catch {
      setPasosWorkflow([]);
    }
  };

  useEffect(() => {
    fetchOrdenes();
    fetchPasosWorkflow();
  }, []);

  useEffect(() => {
    if (selectedId != null) fetchDetalle(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedOrden) return;
    setExpandedPasoId(selectedOrden.idPasoActual ?? null);
    setExpandedPartidaId(selectedOrden.partidas[0]?.idPartida ?? null);
  }, [selectedOrden]);

  const abrirModalFirma = (accion: AccionDisponibleResponse) => {
    setAccionSeleccionada(accion);
    setComentarioFirma('');

    // Pre-populate campos with existing values from the order
    const accionCfg = accionesConfig.get(accion.idAccion) ?? null;
    const campos = getCamposParaAccion(accionCfg);
    const initialValues: Record<string, unknown> = {};
    if (selectedOrden) {
      const ordenAny = selectedOrden as unknown as Record<string, unknown>;
      // Convert snake_case nombreTecnico to camelCase for lookup in the TS response object
      const snakeToCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
      for (const { campo, inputKey } of campos) {
        const existing = ordenAny[campo.nombreTecnico] ?? ordenAny[snakeToCamel(campo.nombreTecnico)];
        if (existing !== undefined && existing !== null) {
          initialValues[inputKey] = existing;
        } else if (campo.tipoControl === 'Booleano' || campo.tipoControl === 'Checkbox') {
          initialValues[inputKey] = false;
        }
      }
    }
    setCamposValues(initialValues);
    setArchivoSubidos({});

    // Fetch catalogs for Selector campos that aren't already loaded
    const selectorCampos = campos.filter(c => c.campo.tipoControl === 'Selector' && c.campo.sourceCatalog);
    if (selectorCampos.length > 0) {
      setLoadingCatalogos(true);
      const fetches = selectorCampos
        .filter(c => !catalogos[c.campo.sourceCatalog!])
        .map(async ({ campo }) => {
          try {
            const res = await API.get<ApiResponse<Record<string, unknown>[]>>(campo.sourceCatalog!);
            const items = res.data.data || [];
            const LABEL_KEYS = ['nombre', 'name', 'etiqueta', 'label', 'titulo'];
            const normalized = items.map(item => {
              // Find numeric id field (e.g. idCentroCosto, idArea, id, ...)
              const idKey = Object.keys(item).find(k => /^id/i.test(k) && typeof item[k] === 'number');
              // Special case: if item has 'cuenta' field, combine with descripcion
              const labelValue = 'cuenta' in item
                ? `${item['cuenta']}${'descripcion' in item ? ` — ${item['descripcion']}` : ''}`
                : (() => {
                    const labelKey = Object.keys(item).find(k => LABEL_KEYS.includes(k.toLowerCase()))
                      ?? Object.keys(item).find(k => k.toLowerCase() === 'descripcion');
                    return labelKey ? String(item[labelKey]) : '';
                  })();
              return {
                value: idKey ? String(item[idKey]) : '',
                label: labelValue,
              };
            }).filter(i => i.value && i.label);
            setCatalogos(prev => ({ ...prev, [campo.sourceCatalog!]: normalized }));
          } catch { /* silencio: campo quedará como texto libre */ }
        });
      Promise.all(fetches).finally(() => setLoadingCatalogos(false));
    }

    setIsFirmarModalOpen(true);
  };

  const cerrarModalFirma = () => {
    setIsFirmarModalOpen(false);
    setAccionSeleccionada(null);
    setComentarioFirma('');
    setArchivoSubidos({});
  };

  const esRechazo = accionSeleccionada?.tipoAccion === 'RECHAZO';
  const esRetorno = accionSeleccionada?.tipoAccion === 'RETORNO';
  const colorAccion = esRechazo ? 'text-red-600' : esRetorno ? 'text-amber-600' : 'text-emerald-600';
  const bgAccion = esRechazo
    ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
    : esRetorno
      ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
      : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800';

  // Dynamic campos for the modal based on the selected action's handlers
  const accionConfig = accionSeleccionada ? (accionesConfig.get(accionSeleccionada.idAccion) ?? null) : null;
  const camposParaAccion = useMemo(
    () => getCamposParaAccion(accionConfig),
    [accionConfig, workflowCampos]
  );

  const enviarFirma = async () => {
    if (!selectedOrden || !accionSeleccionada) return;
    setIsSubmittingFirma(true);
    try {
      const datosAdicionales: Record<string, unknown> = {};

      // Validate required campos and build datosAdicionales dynamically
      for (const { campo, requerido, inputKey } of camposParaAccion) {
        if (campo.tipoControl === 'Archivo') {
          if (requerido && !archivoSubidos[inputKey]) {
            toast.error(`Debes adjuntar: ${campo.etiquetaUsuario}`);
            setIsSubmittingFirma(false);
            return;
          }
          continue; // archivos no van en datosAdicionales (ya están en BD)
        }
        const val = camposValues[inputKey];
        const isEmpty = val === undefined || val === null || val === '';
        if (requerido && isEmpty) {
          toast.error(`${campo.etiquetaUsuario} es obligatorio`);
          setIsSubmittingFirma(false);
          return;
        }
        if (!isEmpty) datosAdicionales[inputKey] = val;
      }

      // Add content type from last uploaded file (for SmartAudit)
      const archivosList = Object.values(archivoSubidos);
      if (archivosList.length > 0) {
        datosAdicionales['archivoContentType'] = archivosList[0].tipoMime;
      }

      if ((esRechazo || esRetorno) && !comentarioFirma.trim()) {
        toast.error('Para rechazo o devolución el comentario es obligatorio');
        setIsSubmittingFirma(false);
        return;
      }

      await API.post(`/ordenes/${selectedOrden.idOrden}/firmar`, {
        idAccion: accionSeleccionada.idAccion,
        comentario: comentarioFirma || null,
        datosAdicionales: Object.keys(datosAdicionales).length > 0 ? datosAdicionales : null,
      });

      toast.success(`Acción "${accionSeleccionada.nombreAccion}" ejecutada correctamente`);
      cerrarModalFirma();
      await Promise.all([fetchOrdenes(), fetchDetalle(selectedOrden.idOrden)]);
    } catch (error: any) {
      toast.error(error?.message ?? 'No fue posible procesar la firma');
    } finally {
      setIsSubmittingFirma(false);
    }
  };

  const textoBotonConfirmar = accionSeleccionada
    ? `Confirmar ${accionSeleccionada.nombreAccion.toLowerCase()}`
    : 'Confirmar';

  const pasosMap = useMemo(
    () => new Map(pasosWorkflow.map(paso => [paso.idPaso, paso])),
    [pasosWorkflow]
  );

  const currentPasoOrden = useMemo(() => {
    if (!selectedOrden?.idPasoActual) return null;
    return pasosMap.get(selectedOrden.idPasoActual)?.orden ?? null;
  }, [selectedOrden?.idPasoActual, pasosMap]);

  const getTipoEvento = (item: HistorialWorkflowItemResponse) => {
    const actionName = (item.nombreAccion || '').toLowerCase();
    if (actionName.includes('rechaz')) return 'rechazo';
    if (actionName.includes('devol') || actionName.includes('retorn')) return 'retorno';
    if (actionName.includes('autor') || actionName.includes('enviar') || actionName.includes('marcar')) return 'aprobacion';
    return 'otro';
  };

  const progresoPasos = useMemo(() => {
    if (!pasosWorkflow.length) return [];
    const pasoActualConfig = selectedOrden?.idPasoActual ? pasosMap.get(selectedOrden.idPasoActual) : null;
    const flujoFinalizado = Boolean(pasoActualConfig?.esFinal);
    const eventosPorPasoLocal = new Map<number, HistorialWorkflowItemResponse[]>();
    for (const item of historial) {
      const arr = eventosPorPasoLocal.get(item.idPaso) ?? [];
      arr.push(item);
      eventosPorPasoLocal.set(item.idPaso, arr);
    }

    return pasosWorkflow.map(paso => {
      const eventosPaso = eventosPorPasoLocal.get(paso.idPaso) || [];
      const ultimoEvento = eventosPaso[eventosPaso.length - 1];
      const tipoUltimoEvento = ultimoEvento ? getTipoEvento(ultimoEvento) : null;
      const isActual = selectedOrden?.idPasoActual === paso.idPaso;
      const isRechazado = !isActual && tipoUltimoEvento === 'rechazo';
      const isDevuelto = !isActual && tipoUltimoEvento === 'retorno';
      const isCompletado = !isActual && tipoUltimoEvento === 'aprobacion';
      const isOmitido = !isActual && !isCompletado && !isRechazado && !isDevuelto && (
        (flujoFinalizado && paso.idPaso !== pasoActualConfig?.idPaso) ||
        (currentPasoOrden !== null && paso.orden < currentPasoOrden)
      );
      return {
        ...paso,
        estadoVisual: isActual
          ? 'actual'
          : isRechazado
            ? 'rechazado'
            : isDevuelto
              ? 'devuelto'
          : isCompletado
            ? 'completado'
            : isOmitido
              ? 'omitido'
              : 'pendiente' as 'actual' | 'completado' | 'pendiente' | 'omitido' | 'rechazado' | 'devuelto',
      };
    });
  }, [pasosWorkflow, historial, selectedOrden?.idPasoActual, currentPasoOrden, pasosMap]);

  const historialOrdenado = useMemo(
    () => [...historial].sort((a, b) => new Date(a.fechaEvento).getTime() - new Date(b.fechaEvento).getTime()),
    [historial]
  );

  const eventosPorPaso = useMemo(() => {
    const map = new Map<number, HistorialWorkflowItemResponse[]>();
    for (const item of historialOrdenado) {
      const arr = map.get(item.idPaso) ?? [];
      arr.push(item);
      map.set(item.idPaso, arr);
    }
    return map;
  }, [historialOrdenado]);

  useEffect(() => {
    if (!selectedOrden?.idPasoActual) return;
    const container = pasosContainerRef.current;
    if (!container) return;
    const target = container.querySelector(`[data-paso-id="${selectedOrden.idPasoActual}"]`) as HTMLElement | null;
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedOrden?.idPasoActual, progresoPasos.length]);

  const renderNombreAccion = (item: HistorialWorkflowItemResponse) => {
    return item.nombreAccion || `Acción ${item.idAccion}`;
  };

  const renderMovimientoEvento = (item: HistorialWorkflowItemResponse) => {
    if (!item.datosSnapshot) return null;
    try {
      const snapshot = JSON.parse(item.datosSnapshot) as { idPasoAnterior?: number | null; idPasoNuevo?: number | null };
      const from = snapshot.idPasoAnterior ? pasosMap.get(snapshot.idPasoAnterior)?.nombrePaso : null;
      const to = snapshot.idPasoNuevo ? pasosMap.get(snapshot.idPasoNuevo)?.nombrePaso : null;
      if (!from && !to) return null;
      if (from && to && from !== to) return `De ${from} a ${to}`;
      return to ? `Permanece en ${to}` : null;
    } catch {
      return null;
    }
  };

  const filtered = useMemo(() => {
    return ordenes.filter(o => {
      const matchEstado = estadoFilter === 'all' || o.estado === estadoFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        q.length === 0 ||
        o.folio.toLowerCase().includes(q) ||
        o.razonSocialProveedor.toLowerCase().includes(q) ||
        (o.personaContacto || '').toLowerCase().includes(q);
      return matchEstado && matchSearch;
    });
  }, [ordenes, estadoFilter, search]);

  const columns: ColumnDef<OrdenCompraResponse>[] = [
    {
      accessorKey: 'folio',
      header: 'Folio',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.folio}</span>
          <span className="text-xs text-muted-foreground">{row.original.razonSocialProveedor}</span>
        </div>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Paso actual',
      cell: ({ row }) => (
        <Badge
          variant={ESTADO_BADGE[row.original.estado] || 'outline'}
          className={ESTADO_BADGE_CLASS[row.original.estado]}
        >
          {getEstadoLabel(row.original.estado)}
        </Badge>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Monto',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.total.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
        </span>
      ),
    },
    {
      accessorKey: 'fechaSolicitud',
      header: 'Fecha solicitud',
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.fechaSolicitud).toLocaleDateString('es-MX')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acción',
      cell: ({ row }) => (
        <Button size="sm" variant="outline" onClick={() => setSelectedId(row.original.idOrden)}>
          Revisar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filtros de Bandeja</CardTitle>
              <CardDescription>Filtra por estado o búsqueda rápida</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por folio, proveedor o contacto"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                {estados.map(e => (
                  <option key={e} value={e}>{e === 'all' ? 'Todos los estados' : getEstadoLabel(e)}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={filtered}
            title="Órdenes pendientes para autorización"
            subtitle={`Total: ${filtered.length}`}
            pagination
            pageSize={10}
            globalFilter={false}
            showRefreshButton
            onRefresh={fetchOrdenes}
            filterConfig={{
              tableId: 'autorizaciones-oc',
              searchableColumns: ['folio', 'razonSocialProveedor', 'personaContacto'],
              defaultSearchColumns: ['folio'],
            }}
            onRowClick={(row) => setSelectedId((row as OrdenCompraResponse).idOrden)}
            height={460}
          />
        </div>

        <div className="xl:col-span-5 space-y-4">
          <Card className="xl:sticky xl:top-4 xl:h-[calc(100vh-6.5rem)] xl:min-h-[680px] xl:max-h-[calc(100vh-6.5rem)] xl:flex xl:flex-col">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" /> Detalle de orden de compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 xl:flex-1 xl:min-h-0">
              {loadingDetail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Cargando detalle...
                </div>
              )}

              {!loadingDetail && !selectedOrden && (
                <p className="text-sm text-muted-foreground">Selecciona una orden para ver detalle.</p>
              )}

              {!loadingDetail && selectedOrden && (
                <>
                  <Tabs defaultValue="detalle" className="xl:flex xl:h-full xl:min-h-0 xl:flex-col">
                    <div className="rounded-lg border bg-muted/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{selectedOrden.folio}</p>
                          <p className="text-xs text-muted-foreground">Proveedor: {selectedOrden.razonSocialProveedor}</p>
                        </div>
                        <Badge
                          variant={ESTADO_BADGE[selectedOrden.estado] || 'outline'}
                          className={ESTADO_BADGE_CLASS[selectedOrden.estado]}
                        >
                          {getEstadoLabel(selectedOrden.estado)}
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-[11px] text-muted-foreground">Subtotal</p>
                          <p className="text-sm font-semibold">{formatCurrency(selectedOrden.subtotal)}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-[11px] text-muted-foreground">Total</p>
                          <p className="text-sm font-semibold">{formatCurrency(selectedOrden.total)}</p>
                        </div>
                      </div>
                    </div>

                    <TabsList className="grid w-full grid-cols-3 mt-3 h-10 p-1 bg-muted/70 border">
                      <TabsTrigger
                        value="detalle"
                        className="font-semibold text-xs border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm"
                      >
                        Detalle completo
                      </TabsTrigger>
                      <TabsTrigger
                        value="autorizar"
                        className="font-semibold text-xs border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm"
                      >
                        Firmar
                      </TabsTrigger>
                      <TabsTrigger
                        value="archivos"
                        className="font-semibold text-xs border border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm"
                      >
                        Archivos
                        {archivosOrden.length > 0 && (
                          <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-primary-foreground/20 data-[state=active]:bg-white/20 px-1.5 py-0.5 text-[10px] font-bold leading-none">
                            {archivosOrden.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="detalle" className="mt-3 space-y-3 xl:flex-1 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">RFC proveedor</p>
                          <p className="font-medium">{selectedOrden.rfcProveedor || 'Sin dato'}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">C.P. proveedor</p>
                          <p className="font-medium">{selectedOrden.codigoPostalProveedor || 'Sin dato'}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Contacto</p>
                          <p className="font-medium">{selectedOrden.personaContacto || 'Sin dato'}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Fiscales</p>
                          <p className="font-medium">{selectedOrden.sinDatosFiscales ? 'Sin datos fiscales' : 'Con datos fiscales'}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Solicitud</p>
                          <p className="font-medium">{new Date(selectedOrden.fechaSolicitud).toLocaleDateString('es-MX')}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Límite pago</p>
                          <p className="font-medium">{new Date(selectedOrden.fechaLimitePago).toLocaleDateString('es-MX')}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Centro costo</p>
                          <p className="font-medium">
                            {selectedOrden.centroCostoNombre || (selectedOrden.idCentroCosto ? `#${selectedOrden.idCentroCosto}` : 'Sin dato')}
                          </p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Cuenta contable</p>
                          <p className="font-medium">
                            {selectedOrden.cuentaContableNumero
                              ? `${selectedOrden.cuentaContableNumero}${selectedOrden.cuentaContableDescripcion ? ` — ${selectedOrden.cuentaContableDescripcion}` : ''}`
                              : 'Sin dato'}
                          </p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Comprobación pago</p>
                          <p className="font-medium">{selectedOrden.requiereComprobacionPago ? 'Sí' : 'No'}</p>
                        </div>
                        <div className="rounded-md border bg-background px-2 py-1.5">
                          <p className="text-muted-foreground">Comprobación gasto</p>
                          <p className="font-medium">{selectedOrden.requiereComprobacionGasto ? 'Sí' : 'No'}</p>
                        </div>
                      </div>

                      {selectedOrden.notaFormaPago && (
                        <div className="rounded-md border bg-background px-3 py-2 text-xs">
                          <p className="text-muted-foreground">Nota forma de pago</p>
                          <p className="mt-1">{selectedOrden.notaFormaPago}</p>
                        </div>
                      )}

                      {selectedOrden.notasGenerales && (
                        <div className="rounded-md border bg-background px-3 py-2 text-xs">
                          <p className="text-muted-foreground">Notas generales</p>
                          <p className="mt-1">{selectedOrden.notasGenerales}</p>
                        </div>
                      )}

                      <div className="rounded-lg border">
                        <div className="flex items-center justify-between border-b px-3 py-2">
                          <p className="text-sm font-medium">Partidas</p>
                          <p className="text-xs text-muted-foreground">{selectedOrden.partidas.length} elemento(s)</p>
                        </div>
                        <div className="max-h-64 overflow-auto">
                          <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-background">
                              <tr className="border-b text-muted-foreground">
                                <th className="px-2 py-2 text-center font-medium w-8"></th>
                                <th className="px-3 py-2 text-left font-medium">#</th>
                                <th className="px-3 py-2 text-left font-medium">Descripción</th>
                                <th className="px-3 py-2 text-right font-medium">Cant.</th>
                                <th className="px-3 py-2 text-right font-medium">P. Unitario</th>
                                <th className="px-3 py-2 text-right font-medium">IVA</th>
                                <th className="px-3 py-2 text-right font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedOrden.partidas.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="px-3 py-3 text-center text-muted-foreground">
                                    Sin partidas registradas.
                                  </td>
                                </tr>
                              )}
                              {selectedOrden.partidas.map(partida => {
                                const isExpanded = expandedPartidaId === partida.idPartida;
                                const subtotalPartida = partida.cantidad * partida.precioUnitario;
                                const totalImpuestos = (subtotalPartida * partida.porcentajeIva) / 100;
                                return (
                                  <>
                                    <tr
                                      key={partida.idPartida}
                                      className="border-b cursor-pointer hover:bg-muted/30"
                                      onClick={() => setExpandedPartidaId(prev => (prev === partida.idPartida ? null : partida.idPartida))}
                                    >
                                      <td className="px-2 py-2 text-center">
                                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 inline text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 inline text-muted-foreground" />}
                                      </td>
                                      <td className="px-3 py-2">{partida.numeroPartida}</td>
                                      <td className="px-3 py-2">
                                        <p className="font-medium">{partida.descripcion}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                          Deducible: {partida.deducible ? 'Sí' : 'No'}
                                        </p>
                                      </td>
                                      <td className="px-3 py-2 text-right">{partida.cantidad}</td>
                                      <td className="px-3 py-2 text-right">{formatCurrency(partida.precioUnitario)}</td>
                                      <td className="px-3 py-2 text-right">{partida.porcentajeIva}%</td>
                                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(partida.total)}</td>
                                    </tr>
                                    {isExpanded && (
                                      <tr key={`${partida.idPartida}-detail`} className="border-b bg-muted/20">
                                        <td colSpan={7} className="px-3 py-2">
                                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                                            <div className="rounded border bg-background px-2 py-1.5">
                                              <p className="text-muted-foreground">Unidad de medida (ID)</p>
                                              <p className="font-medium">{partida.idUnidadMedida}</p>
                                            </div>
                                            <div className="rounded border bg-background px-2 py-1.5">
                                              <p className="text-muted-foreground">Subtotal partida</p>
                                              <p className="font-medium">{formatCurrency(subtotalPartida)}</p>
                                            </div>
                                            <div className="rounded border bg-background px-2 py-1.5">
                                              <p className="text-muted-foreground">Descuento</p>
                                              <p className="font-medium">{formatCurrency(partida.descuento)}</p>
                                            </div>
                                            <div className="rounded border bg-background px-2 py-1.5">
                                              <p className="text-muted-foreground">IVA calculado</p>
                                              <p className="font-medium">{formatCurrency(totalImpuestos)}</p>
                                            </div>
                                            <div className="rounded border bg-background px-2 py-1.5">
                                              <p className="text-muted-foreground">Retenciones</p>
                                              <p className="font-medium">{formatCurrency(partida.totalRetenciones)}</p>
                                            </div>
                                            <div className="rounded border bg-background px-2 py-1.5">
                                              <p className="text-muted-foreground">Otros impuestos</p>
                                              <p className="font-medium">{formatCurrency(partida.otrosImpuestos)}</p>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="autorizar" className="mt-3 space-y-4 xl:flex-1 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
                      <div className="rounded-md border bg-muted/20 p-3">
                        <p className="text-sm font-medium">Acciones del paso actual</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {acciones.length === 0 ? (
                            <p className="text-xs text-muted-foreground">No hay acciones disponibles para este usuario/paso.</p>
                          ) : acciones.map(a => (
                            <Button
                              key={a.idAccion}
                              size="sm"
                              variant={a.tipoAccion === 'RECHAZO' ? 'destructive' : 'default'}
                              onClick={() => abrirModalFirma(a)}
                            >
                              {a.nombreAccion}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm font-medium">Flujo de pasos (inicio → fin)</p>
                        {progresoPasos.length > 0 && (
                          <div ref={pasosContainerRef} className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                            {progresoPasos
                              .map((paso, index) => {
                              const isActual = paso.estadoVisual === 'actual';
                              const isCompletado = paso.estadoVisual === 'completado';
                              const isOmitido = paso.estadoVisual === 'omitido';
                              const isRechazado = paso.estadoVisual === 'rechazado';
                              const isDevuelto = paso.estadoVisual === 'devuelto';
                              const isExpanded = expandedPasoId === paso.idPaso;
                              const isActualRechazada = isActual && selectedOrden?.estado === 'Rechazada';
                              const isActualCancelada = isActual && selectedOrden?.estado === 'Cancelada';
                              const eventosPaso = eventosPorPaso.get(paso.idPaso) || [];
                              const ultimoEvento = eventosPaso[eventosPaso.length - 1];
                              const classes = isActual
                                ? isActualRechazada
                                  ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800'
                                  : isActualCancelada
                                    ? 'border-zinc-400 bg-zinc-100 dark:bg-zinc-900/50 dark:border-zinc-600'
                                    : 'border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800'
                                : isCompletado
                                  ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800'
                                  : isRechazado
                                    ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800'
                                    : isDevuelto
                                      ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800'
                                      : isOmitido
                                    ? 'border-zinc-300 bg-zinc-100 dark:bg-zinc-900/40 dark:border-zinc-700 opacity-70'
                                    : 'border-border/70 bg-muted/20 opacity-60';
                              return (
                                <button
                                  type="button"
                                  key={paso.idPaso}
                                  data-paso-id={paso.idPaso}
                                  onClick={() => setExpandedPasoId(prev => (prev === paso.idPaso ? null : paso.idPaso))}
                                  className={`w-full text-left rounded-md border p-3 transition ${classes} ${isExpanded ? 'ring-2 ring-primary/40' : ''}`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                                      <span className="text-xs font-semibold rounded-full border px-2 py-0.5">
                                        {index + 1}
                                      </span>
                                      <span className="text-sm font-medium">{paso.nombrePaso}</span>
                                    </div>
                                    {isActual ? (
                                      <Badge variant={isActualRechazada ? 'destructive' : isActualCancelada ? 'outline' : 'secondary'}>
                                        {isActualRechazada ? 'Actual · Rechazada' : isActualCancelada ? 'Actual · Cancelada' : 'Actual'}
                                      </Badge>
                                    ) : isCompletado ? (
                                      <Badge variant="default">Completado</Badge>
                                    ) : isRechazado ? (
                                      <Badge variant="destructive">Rechazado</Badge>
                                    ) : isDevuelto ? (
                                      <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/20">Devuelto</Badge>
                                    ) : isOmitido ? (
                                      <Badge variant="outline">Omitido</Badge>
                                    ) : (
                                      <Badge variant="outline">En espera</Badge>
                                    )}
                                  </div>
                                  {paso.descripcionAyuda && (
                                    <p className="text-xs text-muted-foreground mt-1">{paso.descripcionAyuda}</p>
                                  )}
                                  {eventosPaso.length > 0 && (
                                    <p className="text-[11px] text-muted-foreground mt-2">
                                      {eventosPaso.length} evento(s) · Último: {renderNombreAccion(ultimoEvento)} ·{' '}
                                      {new Date(ultimoEvento.fechaEvento).toLocaleString('es-MX')}
                                    </p>
                                  )}
                                  {isExpanded && (
                                    <div className="mt-3 space-y-2">
                                      {eventosPaso.length === 0 && (
                                        <p className="text-xs text-muted-foreground rounded border bg-background p-2">
                                          Sin eventos en este paso.
                                        </p>
                                      )}
                                      {eventosPaso.map(item => (
                                        <div key={item.idEvento} className="rounded border bg-background p-2">
                                          <div className="flex items-center justify-between gap-2">
                                            <p className="text-xs font-medium">{renderNombreAccion(item)}</p>
                                            <span className="text-[11px] text-muted-foreground">
                                              {new Date(item.fechaEvento).toLocaleString('es-MX')}
                                            </span>
                                          </div>
                                          {renderMovimientoEvento(item) && (
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                              {renderMovimientoEvento(item)}
                                            </p>
                                          )}
                                          <p className="text-[11px] text-muted-foreground mt-1">
                                            {item.nombreUsuario || `Usuario ${item.idUsuario}`}
                                          </p>
                                          {item.comentario && (
                                            <p className="text-[11px] mt-1 rounded bg-muted/30 p-2">{item.comentario}</p>
                                          )}
                                        </div>
                                      ))}

                                      {isActual && (
                                        <div className="pt-2">
                                          <p className="text-xs font-semibold mb-2">Acciones en este paso</p>
                                          <div className="flex flex-wrap gap-2">
                                            {acciones.length === 0 ? (
                                              <p className="text-xs text-muted-foreground">No hay acciones disponibles para este usuario/paso.</p>
                                            ) : acciones.map(a => (
                                              <Button
                                                key={a.idAccion}
                                                size="sm"
                                                variant={a.tipoAccion === 'RECHAZO' ? 'destructive' : 'default'}
                                                onClick={(e) => { e.stopPropagation(); abrirModalFirma(a); }}
                                              >
                                                {a.nombreAccion}
                                              </Button>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Tab: Archivos adjuntos */}
                    <TabsContent value="archivos" className="mt-3 xl:flex-1 xl:min-h-0 xl:overflow-y-auto xl:pr-1">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Documentos adjuntos
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => fetchArchivosOrden(selectedOrden.idOrden)}
                            disabled={loadingArchivos}
                          >
                            {loadingArchivos
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <RefreshCcw className="h-3 w-3" />
                            }
                          </Button>
                        </div>

                        {loadingArchivos ? (
                          <div className="flex items-center justify-center py-8 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span className="text-sm">Cargando archivos...</span>
                          </div>
                        ) : archivosOrden.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground rounded-lg border border-dashed">
                            <Paperclip className="h-8 w-8 mb-2 opacity-30" />
                            <p className="text-sm">Sin archivos adjuntos</p>
                            <p className="text-xs mt-1 opacity-70">Los documentos subidos en el flujo aparecerán aquí</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {archivosOrden.map(archivo => {
                              const etiqueta = typeof archivo.metadata === 'string'
                                ? archivo.metadata
                                : archivo.metadata
                                  ? JSON.stringify(archivo.metadata)
                                  : null;
                              const ext = archivo.extension?.toLowerCase().replace('.', '') ?? '';
                              const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
                              const isPdf = ext === 'pdf';
                              const formatSize = (b: number) =>
                                b < 1024 ? `${b} B`
                                : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB`
                                : `${(b / (1024 * 1024)).toFixed(1)} MB`;

                              return (
                                <div
                                  key={archivo.id}
                                  className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs group hover:border-primary/50 transition-colors"
                                >
                                  <div className={`shrink-0 rounded p-1.5 ${isPdf ? 'bg-red-100 text-red-600 dark:bg-red-950/40' : isImage ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/40' : 'bg-muted text-muted-foreground'}`}>
                                    <FileIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{archivo.nombreOriginal}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {etiqueta && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-medium">
                                          {etiqueta}
                                        </span>
                                      )}
                                      <span className="text-muted-foreground">{formatSize(archivo.tamanoBytes)}</span>
                                      <span className="text-muted-foreground">·</span>
                                      <span className="text-muted-foreground">
                                        {new Date(archivo.fechaCreacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      title="Ver documento"
                                      onClick={() => setViewerArchivoId(archivo.id)}
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </Button>
                                    <a
                                      href={archivoService.getDownloadUrl(archivo.id)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Descargar"
                                    >
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Download className="h-3.5 w-3.5" />
                                      </Button>
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        id="modal-firmar-oc"
        open={isFirmarModalOpen}
        setOpen={(open) => {
          setIsFirmarModalOpen(open);
          if (!open) cerrarModalFirma();
        }}
        title={accionSeleccionada ? `${accionSeleccionada.nombreAccion} orden` : 'Procesar firma'}
        size="lg"
        footer={(
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={cerrarModalFirma} disabled={isSubmittingFirma}>
              Cancelar
            </Button>
            <Button
              onClick={enviarFirma}
              disabled={isSubmittingFirma}
              variant={esRechazo ? 'destructive' : 'default'}
            >
              {isSubmittingFirma && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {textoBotonConfirmar}
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div className={`rounded-md border p-3 ${bgAccion}`}>
            <p className={`text-sm font-semibold ${colorAccion}`}>{selectedOrden?.folio}</p>
            <p className="text-xs text-muted-foreground">
              Estado actual: {selectedOrden?.estado} {accionSeleccionada ? `• Acción: ${accionSeleccionada.nombreAccion}` : ''}
            </p>
            {(esRechazo || esRetorno) && (
              <p className="text-xs mt-2 text-muted-foreground">
                Esta acción impacta el flujo y requiere justificación en el comentario.
              </p>
            )}
          </div>

          {/* Dynamic campos based on action handlers */}
          {camposParaAccion.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                Información requerida
                {loadingCatalogos && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </h4>
              {camposParaAccion.map(({ campo, requerido, inputKey }) => {
                const fieldId = `campo-${inputKey}`;
                const value = camposValues[inputKey];

                if (campo.tipoControl === 'Booleano' || campo.tipoControl === 'Checkbox') {
                  return (
                    <div key={inputKey} className="flex items-center gap-2">
                      <Checkbox
                        id={fieldId}
                        checked={Boolean(value)}
                        onCheckedChange={v => setCamposValues(prev => ({ ...prev, [inputKey]: Boolean(v) }))}
                      />
                      <Label htmlFor={fieldId}>
                        {campo.etiquetaUsuario}
                        {requerido && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                    </div>
                  );
                }

                if (campo.tipoControl === 'Selector' && campo.sourceCatalog) {
                  const options = catalogos[campo.sourceCatalog] || [];
                  return (
                    <div key={inputKey} className="space-y-1.5">
                      <Label htmlFor={fieldId}>
                        {campo.etiquetaUsuario}
                        {requerido && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {options.length > 0 ? (
                        <Select
                          value={String(value ?? '')}
                          onValueChange={v => setCamposValues(prev => ({ ...prev, [inputKey]: v }))}
                        >
                          <SelectTrigger id={fieldId}>
                            <SelectValue placeholder={`Seleccionar ${campo.etiquetaUsuario.toLowerCase()}...`} />
                          </SelectTrigger>
                          <SelectContent>
                            {options.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={fieldId}
                          value={String(value ?? '')}
                          onChange={e => setCamposValues(prev => ({ ...prev, [inputKey]: e.target.value }))}
                          placeholder={loadingCatalogos ? 'Cargando opciones...' : campo.etiquetaUsuario}
                          disabled={loadingCatalogos}
                        />
                      )}
                    </div>
                  );
                }

                if (campo.tipoControl === 'Numero') {
                  return (
                    <div key={inputKey} className="space-y-1.5">
                      <Label htmlFor={fieldId}>
                        {campo.etiquetaUsuario}
                        {requerido && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={fieldId}
                        type="number"
                        value={String(value ?? '')}
                        onChange={e => setCamposValues(prev => ({
                          ...prev,
                          [inputKey]: e.target.value === '' ? '' : Number(e.target.value)
                        }))}
                        placeholder={`Ingresa ${campo.etiquetaUsuario.toLowerCase()}`}
                      />
                    </div>
                  );
                }

                if (campo.tipoControl === 'Fecha') {
                  return (
                    <div key={inputKey} className="space-y-1.5">
                      <Label htmlFor={fieldId}>
                        {campo.etiquetaUsuario}
                        {requerido && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <Input
                        id={fieldId}
                        type="date"
                        value={String(value ?? '')}
                        onChange={e => setCamposValues(prev => ({ ...prev, [inputKey]: e.target.value }))}
                      />
                    </div>
                  );
                }

                // Archivo (DocumentRequired) — inline uploader dentro del modal
                if (campo.tipoControl === 'Archivo') {
                  const archivo = archivoSubidos[inputKey];
                  return (
                    <div key={inputKey} className="space-y-1.5">
                      <Label>
                        {campo.etiquetaUsuario}
                        {requerido && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {archivo ? (
                        <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 dark:bg-green-950/20 px-3 py-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <span className="truncate text-green-700 dark:text-green-400">{archivo.nombreOriginal}</span>
                          <button
                            type="button"
                            className="ml-auto text-muted-foreground hover:text-destructive"
                            onClick={() => setArchivoSubidos(prev => { const n = { ...prev }; delete n[inputKey]; return n; })}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        selectedOrden && (
                          <FileUploader
                            inline
                            open={true}
                            entidadTipo="OrdenCompra"
                            entidadId={selectedOrden.idOrden}
                            carpeta="ordenes-compra"
                            metadata={campo.etiquetaUsuario}
                            tiposPermitidos={['.pdf', '.xml', '.jpg', '.jpeg', '.png']}
                            descripcion="Arrastra o selecciona el documento"
                            onUploadComplete={(archivos) => {
                              if (archivos.length > 0) {
                                setArchivoSubidos(prev => ({ ...prev, [inputKey]: archivos[0] }));
                              }
                            }}
                            onClose={() => {}}
                          />
                        )
                      )}
                    </div>
                  );
                }

                // Default: Texto
                return (
                  <div key={inputKey} className="space-y-1.5">
                    <Label htmlFor={fieldId}>
                      {campo.etiquetaUsuario}
                      {requerido && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={fieldId}
                      value={String(value ?? '')}
                      onChange={e => setCamposValues(prev => ({ ...prev, [inputKey]: e.target.value }))}
                      placeholder={`Ingresa ${campo.etiquetaUsuario.toLowerCase()}`}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comentario-firma">Comentario</Label>
            <Textarea
              id="comentario-firma"
              value={comentarioFirma}
              onChange={(e) => setComentarioFirma(e.target.value)}
              placeholder={
                esRechazo
                  ? 'Motivo del rechazo (obligatorio)'
                  : esRetorno
                    ? 'Motivo de devolución/corrección (obligatorio)'
                    : 'Comentario de autorización (opcional)'
              }
              rows={4}
            />
            {(esRechazo || esRetorno) && (
              <p className="text-xs text-red-600">Comentario obligatorio para rechazo o devolución.</p>
            )}
            {camposParaAccion.length === 0 && !esRechazo && !esRetorno && (
              <p className="text-xs text-muted-foreground">
                Esta acción no requiere campos adicionales.
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* FileViewer para previsualizar archivos adjuntos */}
      {viewerArchivoId !== null && (
        <FileViewer
          archivoId={viewerArchivoId}
          open={viewerArchivoId !== null}
          onClose={() => setViewerArchivoId(null)}
        />
      )}
    </div>
  );
}

