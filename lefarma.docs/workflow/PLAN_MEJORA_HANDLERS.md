# Plan de Mejora: Arquitectura de Handlers Dinámicos y Motor de Auditoría

**Estado:** Propuesta de Implementación Técnica  
**Fecha:** 28 de Marzo de 2026  
**Módulo:** Motor de Workflows (Grupo Lefarma)

---

## 🎯 1. Objetivo
Evolucionar el sistema de validaciones estáticas a un motor de **Funciones de Negocio Dinámicas** (Handlers) que permita orquestar lógica compleja, integraciones externas y gestión de documentos desde la configuración del Workflow, sin modificar el núcleo del Backend.

---

## 🗃️ 2. Arquitectura de Datos (snake_case)
Se implementarán las siguientes tablas para soportar la configuración dinámica:

### 2.1. `config.workflow_accion_handlers`
Almacena las funciones que se disparan al ejecutar una acción (ej: "Autorizar").
- `id_handler`: PK.
- `id_accion`: FK a `config.workflow_acciones`.
- `handler_key`: Identificador del código en C# (ej: `SmartAudit`).
- `configuracion_json`: Parámetros específicos del handler.
- `orden_ejecucion`: Secuencia de disparo (Firma -> Valida -> Aplica).

### 2.2. `config.workflow_campos`
Define qué campos de la entidad (ej: `id_centro_costo`) son visibles/editables para un workflow.
- `id_workflow_campo`: PK.
- `id_workflow`: FK a `config.workflows`.
- `nombre_tecnico`: Nombre en C# / Columna SQL.
- `etiqueta_usuario`: Nombre para mostrar en UI.
- `tipo_control`: Selector, Checkbox, Texto, Moneda.

---

## ⚙️ 3. Implementación del Backend (.NET 10)

### 3.1. Refactorización de la Interfaz de Handlers
Se propone una interfaz genérica que reciba un objeto de configuración tipado:
```csharp
public interface IWorkflowActionHandler
{
    string HandlerKey { get; }
    // Valida y/o aplica lógica antes de completar la transición
    Task<HandlerResult> ProcessAsync(WorkflowHandlerContext context, string configJson);
}
```

### 3.2. Relación entre HandlerKey y Configuración
El `handler_key` actúa como el "Cerebro" (la lógica en C#) y el `configuracion_json` actúa como las "Instrucciones" (los datos del administrador).

| `handler_key` | Ejemplo de `configuracion_json` | Qué hace la lógica en C# |
| :--- | :--- | :--- |
| `RequiredFields` | `{"fields": ["id_cc", "cuenta"]}` | Busca esos campos específicos en la orden y valida que no sean nulos. |
| `SmartAudit` | `{"level": "intelligent", "timeout": 30}` | Toma los archivos de la orden y los envía al WebService externo. |
| `FieldUpdater` | `{"field": "urgente", "value": true}` | Ejecuta un `Update` automático en la base de datos al firmar. |

**Beneficio:** No creamos un handler por cada campo nuevo. Creamos un handler genérico de "Validación de Campos" y el usuario decide qué campos validar vía JSON.

### 3.3. Factoría Dinámica (Handler Factory)
El sistema utilizará `IServiceProvider` para resolver múltiples handlers por acción:
1.  El `WorkflowEngine` consulta la tabla `workflow_accion_handlers`.
2.  Por cada registro, invoca al handler correspondiente mediante su `handler_key`.
3.  Si un handler de "Validación" falla, se aborta la transición y se devuelve el error al usuario.

### 3.3. API de Metadatos de Negocio
Se creará un servicio encargado de proveer al Frontend los campos disponibles configurados en `workflow_campos`, eliminando la dependencia de la reflexión en tiempo de ejecución.

---

## 🔮 4. Integración con el Motor de Auditoría (WebService Externo)
Este es un componente especial que se dejará **listo para conectar** (Plug-and-Play).

1.  **El Conector (`SmartAuditHandler`):** Se implementará un handler que actúe como cliente.
2.  **Uso de WebService Externo:** 
    - El handler detectará si la validación es "Inteligente" en su `configuracion_json`.
    - Solo si está activo, enviará los archivos adjuntos (XML/PDF/Imágenes) a la URL de un WebService de Auditoría externo.
3.  **Abstracción mediante Interfaz:** Se definirá la interfaz `ISmartAuditProvider`. 
    - *Fase 1:* Retornará éxito automático (Mock).
    - *Fase 2:* Se implementará el cliente HTTP real que consuma el servicio de validación de comprobantes (SAT/OCR).

---

## 📂 5. Gestión de Documentos y Adjuntos
Integración nativa con el **Módulo de Gestión de Archivos**:
- Los handlers de tipo "Documento Requerido" verificarán la existencia de registros en `operaciones.archivos` ligados a la `OrdenCompra`.
- Se utilizará el campo `metadata` (JSON) para marcar qué archivo es un "Comprobante de Pago" o "Factura XML".

---

## 🖥️ 6. Experiencia de Usuario (Frontend)

### 6.1. Configuración de Flujo (Admin)
Se añadirá una pestaña **"Handlers"** al editor de diagramas para:
- Seleccionar funciones predefinidas (ej: "Asignar Cuenta", "Validar Fiscalmente").
- Configurar los parámetros JSON mediante formularios dinámicos.

### 6.2. Modal de Firma Dinámico
El modal de autorización ya no será estático. Se construirá en tiempo real:
- Si la acción tiene un `RequiredFieldsHandler`, el modal mostrará los campos solicitados.
- Si requiere comprobante, mostrará el área de carga de archivos.

---

## 🚀 7. Beneficios Técnicos
1.  **Atomicidad:** Las transiciones de estado solo ocurren si todos los handlers (incluyendo auditoría externa) dan luz verde.
2.  **Escalabilidad:** Se pueden añadir nuevas reglas de negocio (handlers) sin modificar el `WorkflowEngine`.
3.  **Desacoplamiento:** El motor de auditoría fiscal vive fuera del ERP, permitiendo actualizaciones de reglas del SAT sin desplegar el backend principal.

---
*Este documento constituye la especificación final de la mejora para el sistema de Workflows de Lefarma.*
