# Architecture Research

**Domain:** CxP (Accounts Payable) Module Integration
**Researched:** 2026-03-30
**Confidence:** HIGH

## System Overview

The existing Lefarma system is a modular monolith with a **single ORDEN_COMPRA workflow** that already defines states for the complete lifecycle: creation through approval (Firmas 2-5), payment (Tesoreria), expense verification (Comprobacion), and closure. The EstadoOC enum already contains `EnTesoreria`, `Pagada`, `EnComprobacion`, and `Cerrada`.

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ Autorizacio- │  │ Tesoreria   │  │ Comprobacio-│  │ Reportes   │ │
│  │ nesOC (825L) │  │ (NEW)       │  │ n (NEW)     │  │ (NEW)      │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
├─────────┴────────────────┴────────────────┴────────────────┴────────┤
│                        API Layer (Controllers)                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  ┌────────────┐ │
│  │ Firmas   │  │ Tesoreria    │  │ Comprobacion  │  │ Reportes   │ │
│  │ Controller│  │ Controller   │  │ Controller    │  │ Controller │ │
│  └─────┬────┘  └──────┬───────┘  └───────┬───────┘  └─────┬──────┘ │
├────────┴───────────────┴──────────────────┴────────────────┴────────┤
│                     Service Layer (Business Logic)                    │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  ┌────────────┐ │
│  │ Firmas   │  │ Tesoreria    │  │ Comprobacion  │  │ Integracion│ │
│  │ Service  │  │ Service      │  │ Service       │  │ Contable   │ │
│  └─────┬────┘  └──────┬───────┘  └───────┬───────┘  └─────┬──────┘ │
│         │               │                  │                │        │
│  ┌──────┴───────────────┴──────────────────┴────────────────┴──────┐│
│  │              Workflow Engine (IWorkflowEngine)                   ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐ ││
│  │  │ Firma3   │ │ Firma4   │ │ Firma5   │ │ TesoreriaHandler   │ ││
│  │  │ Handler  │ │ Handler  │ │ Handler  │ │ (NEW)              │ ││
│  │  └──────────┘ └──────────┘ └──────────┘ ├────────────────────┤ ││
│  │                                          │ ComprobacionHandler│ ││
│  │  IStepHandler (Keyed DI)                 │ (NEW)              │ ││
│  │                                          └────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────────┤
│                     Domain Layer (Entities)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐             │
│  │ OrdenCompra  │  │ Pago (NEW)   │  │ Comprobante   │             │
│  │ Partida      │  │              │  │ (NEW)          │             │
│  │ EstadoOC     │  │              │  │                │             │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘             │
├─────────┴─────────────────┴──────────────────┴───────────────────────┤
│                Infrastructure Layer (Data Access)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐             │
│  │ OC Repository│  │ Pago Repo    │  │ Comprobacion  │             │
│  │ (exists)     │  │ (NEW)        │  │ Repo (NEW)    │             │
│  └──────────────┘  └──────────────┘  └───────────────┘             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              ApplicationDbContext (EF Core 10)                │   │
│  └──────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│                    Cross-Cutting Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐             │
│  │ Notification │  │ Archivo      │  │ Integracion   │             │
│  │ Service      │  │ Service      │  │ Contable (NEW)│             │
│  │ (exists)     │  │ (exists)     │  │               │             │
│  └──────────────┘  └──────────────┘  └───────────────┘             │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Boundaries — The 6 Key Decisions

### Decision 1: Separate Feature Modules (NOT sub-modules under OrdenesCompra)

**Verdict: Tesoreria and Comprobacion are SEPARATE feature modules at `Features/Tesoreria/` and `Features/Comprobacion/`**

Rationale:
- `Features/OrdenesCompra/` currently contains `Captura/` and `Firmas/` — these handle the ORDER LIFECYCLE (creation + approval)
- Tesoreria handles PAYMENT EXECUTION — a fundamentally different domain concern with its own entity (`Pago`), its own service, and its own controller
- Comprobacion handles EXPENSE VERIFICATION — another distinct domain with its own entities (`ComprobanteCFDI`, `ComprobanteNoDeducible`, `FichaDeposito`)
- Both modules reference `OrdenCompra` but don't own it — they CONSUME the order via `IOrdenCompraRepository`

The `IStepHandler` implementations for Tesoreria and Comprobacion live INSIDE `Features/OrdenesCompra/Firmas/Handlers/` because they ARE part of the workflow step pattern — but their SERVICE logic lives in the separate feature module. The handler delegates to the service.

```
Features/
├── OrdenesCompra/
│   ├── Captura/           # OC CRUD
│   └── Firmas/
│       ├── Handlers/
│       │   ├── IStepHandler.cs
│       │   ├── Firma3Handler.cs       # exists
│       │   ├── Firma4Handler.cs       # exists
│       │   ├── Firma5Handler.cs       # NEW (minimal, no extra data)
│       │   ├── TesoreriaHandler.cs    # NEW (delegates to TesoreriaService)
│       │   └── ComprobacionHandler.cs # NEW (delegates to ComprobacionService)
│       ├── FirmasService.cs           # exists — extends to handle new handlers
│       └── DTOs/
├── Tesoreria/                         # NEW feature module
│   ├── TesoreriaController.cs
│   ├── ITesoreriaService.cs
│   ├── TesoreriaService.cs
│   ├── DTOs/
│   └── Validators/
├── Comprobacion/                      # NEW feature module
│   ├── ComprobacionController.cs
│   ├── IComprobacionService.cs
│   ├── ComprobacionService.cs
│   ├── DTOs/
│   └── Validators/
├── IntegracionContable/               # NEW feature module
│   ├── IntegracionController.cs
│   ├── IIntegracionService.cs
│   ├── IntegracionService.cs
│   ├── DTOs/
│   └── Validators/
└── Reportes/                          # NEW feature module
    ├── ReportesController.cs
    ├── IReportesService.cs
    ├── ReportesService.cs
    └── DTOs/
```

### Decision 2: Pago Entity — 1:N Relationship with OrdenCompra

**Verdict: `Pago` is a separate entity with N payments per OrdenCompra (partial payments)**

Rationale:
- PROJECT.md explicitly states "parciales/totales, multiples pagos hasta completar"
- A single OC of $100K could be paid in 3 partial payments of $30K, $30K, $40K
- The `OrdenCompra.Estado` transitions: `Autorizada → EnTesoreria → Pagada` (Pagada when sum(Pago.Monto) >= OrdenCompra.Total)

```
Pago (NEW entity)
├── IdPago (PK)
├── IdOrden (FK → OrdenCompra)
├── Monto (decimal)
├── FechaPago (DateTime)
├── IdFormaPago (FK → FormaPago)
├── Referencia (string?) — cheque #, transfer ref
├── ComprobanteDeposito (Archivo? — via EntidadTipo/EntidadId pattern)
├── EstadoPago (enum: Programado, Ejecutado, Cancelado)
├── IdUsuarioRegistra (int)
├── FechaCreacion / FechaModificacion
└── Notas (string?)
```

EF Configuration at: `Infrastructure/Data/Configurations/Operaciones/PagoConfiguration.cs`

The `TesoreriaHandler` (IStepHandler) does NOT execute the payment — it only transitions the OC to `EnTesoreria`. Actual payment execution happens via `TesoreriaService.RegistrarPagoAsync()` which:
1. Creates `Pago` record
2. Recalculates `Sum(Pago.Monto)` for the OC
3. If sum >= OC.Total → transitions OC to `Pagada` via workflow engine
4. Triggers notification to creator

### Decision 3: Comprobacion Entities — Self-Contained Aggregate Root

**Verdict: `Comprobacion` is a separate aggregate root with 1:N relationship to Pago and OrdenCompra**

Rationale:
- A comprobacion verifies that expenses match the OC amount
- Multiple types of comprobantes: CFDI/XML (automatic extraction), non-deductible (manual), bank deposit slip
- The comprobacion is validated by CxP (not by the user who uploaded it)
- The entity tracks its own lifecycle: Pendiente, Validada, Rechazada

```
Comprobacion (NEW entity)
├── IdComprobacion (PK)
├── IdOrden (FK → OrdenCompra)
├── IdPago (FK → Pago?) — optional, links to specific payment
├── TipoComprobacion (enum: CFDI, NoDeducible, FichaDeposito)
├── Estado (enum: Pendiente, Validada, Rechazada)
├── Monto (decimal) — extracted from XML or manual entry
├── UUID (string?) — CFDI UUID for SAT tracking
├── RFCEmisor (string?) — extracted from CFDI
├── SerieFolio (string?) — CFDI serie + folio
├── FechaCFDI (DateTime?) — date on the CFDI
├── IdArchivo (int?) — FK to Archivo (uploaded XML/PDF/image)
├── Descripcion (string?) — for non-deductible items
├── IdUsuarioCarga (int) — who uploaded
├── IdUsuarioValida (int?) — CxP who validates
├── FechaCarga / FechaValidacion (DateTime?)
├── MotivoRechazo (string?)
└── Notas (string?)
```

The validation rule: `Sum(Comprobacion.Monto WHERE Estado=Validada AND IdOrden=X) >= OrdenCompra.Total`

When this condition is met AND the OC is `Pagada`, the OC transitions to `Cerrada`.

### Decision 4: Accounting Integration — Standalone Service Module

**Verdict: `Features/IntegracionContable/` is a standalone feature module**

Rationale:
- Accounting integration is a CONSUMER of data, not a producer — it reads OrdenesCompra, Pagos, and Comprobaciones to generate polizas
- It has NO workflow steps — it doesn't participate in the approval flow
- It generates export files (CSV/XML layouts) for the external accounting system
- It could be triggered manually (on-demand export) or automatically (when OC reaches Cerrada)

```
Features/IntegracionContable/
├── IntegracionController.cs       # api/integracion/polizas, api/integracion/conciliacion
├── IIntegracionService.cs
├── IntegracionService.cs          # Reads OC+Pagos+Comprobaciones, generates layout
├── DTOs/
│   ├── PolizaExportRequest.cs     # Filters: empresa, sucursal, fecha range
│   └── PolizaExportResponse.cs    # Generated file path or content
└── Layouts/
    └── PolizaLayout.cs            # CSV/XML layout definition
```

This module depends on `IOrdenCompraRepository`, `IPagoRepository` (NEW), and `IComprobacionRepository` (NEW) but nothing depends on IT.

### Decision 5: Workflow Engine Extension — New IStepHandler Implementations

The existing workflow pattern is:
1. `WorkflowPaso.HandlerKey` → maps to a keyed DI service
2. `FirmasService.FirmarAsync()` resolves handler via `IServiceProvider.GetKeyedService<IStepHandler>(handlerKey)`
3. Handler's `ValidarAsync()` checks business rules, `AplicarAsync()` mutates the entity
4. Then `WorkflowEngine.EjecutarAccionAsync()` transitions state and logs to bitacora

New handlers to add:

| Handler | HandlerKey | ValidarAsync | AplicarAsync |
|---------|-----------|--------------|--------------|
| Firma5Handler | "Firma5Handler" | No extra validation needed (DireccionCorp just approves) | No mutation (pure approval) |
| TesoreriaHandler | "TesoreriaHandler" | Validate OC is in `Autorizada` state | Transition to `EnTesoreria` (workflow does this, handler is pass-through) |
| ComprobacionHandler | "ComprobacionHandler" | Validate sum of comprobaciones >= OC.Total | Transition to `Cerrada` |

**Critical detail:** The `TesoreriaHandler` does NOT create Pagos — payment creation is a separate API call to `TesoreriaController`. The handler only handles the workflow transition when the OC enters the Tesoreria queue. The actual payment execution + OC state update to `Pagada` happens in `TesoreriaService`.

Similarly, `ComprobacionHandler` handles the transition when CxP validates all comprobantes. The individual comprobante uploads are separate API calls.

### Decision 6: Frontend Architecture — Separate Page Modules

**Verdict: New pages under `pages/` — NOT extending AutorizacionesOC.tsx**

Rationale:
- `AutorizacionesOC.tsx` is already 825 lines — the inbox/detail for approval signatures
- Tesoreria needs a fundamentally different UI: payment queue, payment form, payment history per OC
- Comprobacion needs another different UI: upload zone, CFDI preview, validation status
- Reportes is its own section entirely

Frontend structure:
```
pages/
├── ordenes/
│   ├── AutorizacionesOC.tsx      # exists — approval inbox
│   ├── CapturaOC.tsx             # NEW — OC creation form (extracted from AutorizacionesOC if needed)
│   └── index.ts
├── tesoreria/                    # NEW
│   ├── PagosBandeja.tsx          # Payment queue: OCs in EnTesoreria state
│   ├── RegistrarPago.tsx         # Payment form: amount, reference, file upload
│   └── index.ts
├── comprobacion/                 # NEW
│   ├── ComprobacionesBandeja.tsx # Comprobacion inbox (for CxP to validate)
│   ├── SubirComprobacion.tsx     # Upload form (CFDI + non-deductible + deposit slip)
│   ├── ValidarComprobacion.tsx   # CxP validation view
│   └── index.ts
├── reportes/                     # NEW
│   ├── ReportesComprobaciones.tsx
│   ├── ReportesContables.tsx
│   └── index.ts
└── dashboard/                    # NEW (or extend existing Dashboard.tsx)
    └── DashboardCxP.tsx
```

## Recommended Project Structure

### Backend New Files

```
Domain/
├── Entities/
│   └── Operaciones/
│       ├── EstadoOC.cs                    # EXISTS — add no new states (already complete)
│       ├── OrdenCompra.cs                 # EXISTS — add navigation: Pagos, Comprobaciones
│       ├── OrdenCompraPartida.cs          # EXISTS
│       ├── Pago.cs                        # NEW
│       ├── EstadoPago.cs                  # NEW (enum: Programado, Ejecutado, Cancelado)
│       ├── Comprobacion.cs                # NEW
│       ├── TipoComprobacion.cs            # NEW (enum: CFDI, NoDeducible, FichaDeposito)
│       └── EstadoComprobacion.cs          # NEW (enum: Pendiente, Validada, Rechazada)
├── Interfaces/
│   └── Operaciones/
│       ├── IOrdenCompraRepository.cs      # EXISTS — add GetByEstadosAsync, UpdatePagadoState
│       ├── IPagoRepository.cs             # NEW
│       └── IComprobacionRepository.cs     # NEW

Features/
├── OrdenesCompra/
│   └── Firmas/Handlers/
│       ├── Firma5Handler.cs               # NEW
│       ├── TesoreriaHandler.cs            # NEW
│       └── ComprobacionHandler.cs         # NEW
├── Tesoreria/
│   ├── TesoreriaController.cs             # NEW (route: api/tesoreria)
│   ├── ITesoreriaService.cs               # NEW
│   ├── TesoreriaService.cs                # NEW
│   ├── DTOs/
│   │   ├── RegistrarPagoRequest.cs        # NEW
│   │   ├── PagoResponse.cs                # NEW
│   │   └── PagoBandejaResponse.cs         # NEW
│   └── Validators/
│       └── RegistrarPagoValidator.cs      # NEW
├── Comprobacion/
│   ├── ComprobacionController.cs          # NEW (route: api/comprobacion)
│   ├── IComprobacionService.cs            # NEW
│   ├── ComprobacionService.cs             # NEW
│   ├── DTOs/
│   │   ├── SubirComprobacionRequest.cs    # NEW
│   │   ├── ValidarComprobacionRequest.cs  # NEW
│   │   └── ComprobacionResponse.cs        # NEW
│   └── Validators/
│       ├── SubirComprobacionValidator.cs  # NEW
│       └── ValidarComprobacionValidator.cs # NEW
├── IntegracionContable/
│   ├── IntegracionController.cs           # NEW (route: api/integracion)
│   ├── IIntegracionService.cs             # NEW
│   ├── IntegracionService.cs              # NEW
│   └── DTOs/
│       ├── PolizaExportRequest.cs         # NEW
│       └── PolizaExportResponse.cs        # NEW
└── Reportes/
    ├── ReportesController.cs              # NEW (route: api/reportes)
    ├── IReportesService.cs                # NEW
    ├── ReportesService.cs                 # NEW
    └── DTOs/
        ├── FiltrosReporteRequest.cs       # NEW
        └── ReporteResponse.cs             # NEW

Infrastructure/
├── Data/
│   ├── Configurations/Operaciones/
│   │   ├── PagoConfiguration.cs           # NEW
│   │   └── ComprobacionConfiguration.cs   # NEW
│   ├── Repositories/Operaciones/
│   │   ├── PagoRepository.cs              # NEW
│   │   └── ComprobacionRepository.cs      # NEW
│   └── Seeding/
│       └── DatabaseSeeder.cs              # MODIFY — add workflow pasos + comprobacion perms

Shared/
├── Constants/
│   └── AuthorizationConstants.cs          # MODIFY — add Tesoreria + Comprobacion permissions
```

### Frontend New Files

```
src/
├── pages/
│   ├── tesoreria/
│   │   ├── PagosBandeja.tsx
│   │   ├── RegistrarPago.tsx
│   │   └── index.ts
│   ├── comprobacion/
│   │   ├── ComprobacionesBandeja.tsx
│   │   ├── SubirComprobacion.tsx
│   │   ├── ValidarComprobacion.tsx
│   │   └── index.ts
│   └── reportes/
│       ├── ReportesComprobaciones.tsx
│       ├── ReportesContables.tsx
│       └── index.ts
├── services/
│   ├── tesoreriaService.ts
│   ├── comprobacionService.ts
│   ├── reportesService.ts
│   └── integracionService.ts
├── types/
│   ├── tesoreria.types.ts
│   ├── comprobacion.types.ts
│   └── reportes.types.ts
├── store/                               # Only if needed (probably not initially)
│   └── tesoreriaStore.ts                # Optional: payment queue state
├── components/
│   └── comprobacion/
│       ├── CfdiUploader.tsx             # XML upload + auto-extract
│       └── ComprobantePreview.tsx
└── routes/
    └── AppRoutes.tsx                    # MODIFY — add new routes
```

### Structure Rationale

- **Features/Tesoreria/**: Owns payment CRUD. References OrdenCompra but doesn't own it. Owns the `Pago` entity lifecycle.
- **Features/Comprobacion/**: Owns comprobante CRUD. References OrdenCompra and Pago. Owns the `Comprobacion` entity lifecycle.
- **Features/IntegracionContable/**: Pure consumer. Reads all entities. Generates exports. Has no entity of its own (or minimal export log).
- **Features/Reportes/**: Pure consumer. Complex queries but no state mutation.
- **Handlers in Firmas/**: They participate in the workflow pattern (keyed DI via IStepHandler), so they live where the workflow lives. But they delegate business logic to the corresponding feature service.

## Data Flow

### Complete OC Lifecycle

```
Capturista creates OC
    ↓ EstadoOC.Creada
WorkflowEngine transitions to Firma2
    ↓ EstadoOC.EnRevisionF2
GerenteArea approves (Firma2)
    ↓ EstadoOC.EnRevisionF3
CxP approves (Firma3Handler: assigns CentroCosto + CuentaContable)
    ↓ EstadoOC.EnRevisionF4
GAF approves (Firma4Handler: sets RequiereComprobacion flags)
    ↓ [if conditions met → Firma5, else → Autorizada]
DireccionCorp approves (Firma5Handler: pure approval)
    ↓ EstadoOC.Autorizada
TesoreriaHandler transitions to EnTesoreria
    ↓ EstadoOC.EnTesoreria
TesoreriaService.RegistrarPagoAsync() [can be called N times]
    ↓ Creates Pago record
    ↓ When Sum(Pago.Monto) >= OC.Total → EstadoOC.Pagada
Capturista uploads comprobantes (SubirComprobacion)
    ↓ Comprobacion records created (Estado: Pendiente)
CxP validates comprobantes (ValidarComprobacion)
    ↓ Comprobacion.Estado → Validada
    ↓ When Sum(Comprobacion.Monto WHERE Validada) >= OC.Total → EstadoOC.EnComprobacion → Cerrada
    ↓ ComprobacionHandler triggers closure
IntegracionContable generates poliza (on-demand or auto)
    ↓ Reads OC + Pagos + Comprobaciones
    ↓ Exports CSV/XML layout
```

### Payment Data Flow

```
[Tesoreria User] → PagosBandeja.tsx → TesoreriaController
    → ITesoreriaService.RegistrarPagoAsync(idOrden, request)
        → IOrdenCompraRepository.GetWithPartidasAsync(idOrden)
        → Validate: OC.Estado == EnTesoreria
        → Validate: Sum(existing Pagos) + request.Monto <= OC.Total
        → Create Pago entity
        → IPagoRepository.AddAsync(pago)
        → Recalculate Sum(Pago.Monto) for this OC
        → If fully paid:
            → IWorkflowEngine.EjecutarAccionAsync(ctx) [transition to Pagada]
            → Update OC.Estado = Pagada
        → INotificationService → notify OC creator
    ← PagoResponse (ErrorOr<PagoResponse>)
```

### Comprobacion Data Flow

```
[Capturista] → SubirComprobacion.tsx → ComprobacionController
    → IComprobacionService.SubirAsync(idOrden, request)
        → If TipoComprobacion == CFDI:
            → Parse XML → extract Monto, UUID, RFC, SerieFolio
        → Create Comprobacion entity (Estado: Pendiente)
        → IArchivoService.UploadAsync() — save the file
        → INotificationService → notify CxP

[CxP User] → ValidarComprobacion.tsx → ComprobacionController
    → IComprobacionService.ValidarAsync(idComprobacion, request)
        → Update Comprobacion.Estado = Validada/Rechazada
        → Recalculate Sum(Comprobacion.Monto WHERE Validada AND IdOrden=X)
        → If sum >= OC.Total AND OC.Estado == Pagada:
            → IWorkflowEngine.EjecutarAccionAsync(ctx) [transition to Cerrada]
            → Update OC.Estado = Cerrada
        → INotificationService → notify creator
```

### Accounting Integration Data Flow

```
[Admin/CxP] → ReportesContables.tsx → IntegracionController
    → IIntegracionService.ExportarPolizaAsync(request)
        → Read OrdenesCompra WHERE Estado == Cerrada AND FechaCierre IN range
        → Read related Pagos + Comprobaciones
        → Map to Poliza layout (CSV/XML with cuenta contable, centro costo, monto)
        → Return file content or save and return path
    ← PolizaExportResponse (file download)
```

### State Management (Frontend)

```
[Zustand authStore] ←→ empresa/sucursal/user context (exists)
[Zustand pageStore] ←→ page title (exists)
[Local component state] ←→ payment form, comprobacion form (no new store needed initially)
[Optional: tesoreriaStore] ←→ payment queue filters, pagination (if complexity warrants)
```

## Architectural Patterns

### Pattern 1: IStepHandler Strategy with Delegation

**What:** Workflow step handlers implement `IStepHandler` (keyed DI) but delegate business logic to feature-specific services.

**When to use:** Every workflow step that needs domain-specific behavior beyond simple state transitions.

**Trade-offs:**
- Pro: Separation of concerns — handlers stay thin, services own the domain logic
- Pro: Testable — service can be tested independently of workflow infrastructure
- Con: Indirection — handler calls service, need to trace two files

**Example:**
```csharp
// Features/OrdenesCompra/Firmas/Handlers/TesoreriaHandler.cs
public class TesoreriaHandler : IStepHandler
{
    public string HandlerKey => "TesoreriaHandler";

    public Task<string?> ValidarAsync(OrdenCompra orden, Dictionary<string, object>? datos)
        => Task.FromResult<string?>(null); // Validation happens in TesoreriaService

    public Task AplicarAsync(OrdenCompra orden, Dictionary<string, object>? datos)
        => Task.CompletedTask; // State transition handled by WorkflowEngine
}

// Features/Tesoreria/TesoreriaService.cs — owns the real payment logic
public class TesoreriaService : BaseService, ITesoreriaService
{
    public async Task<ErrorOr<PagoResponse>> RegistrarPagoAsync(int idOrden, RegistrarPagoRequest request, int idUsuario)
    {
        var orden = await _ordenRepo.GetWithPartidasAsync(idOrden);
        // ... business validation, create Pago, check if fully paid ...
    }
}
```

### Pattern 2: EntidadTipo/EntidadId File Attachment

**What:** The existing `Archivo` entity uses a polymorphic association pattern (`EntidadTipo` + `EntidadId`) to link files to any entity type.

**When to use:** Comprobante file uploads (CFDI XML, non-deductible receipt images, deposit slips).

**Trade-offs:**
- Pro: No schema changes needed for new file associations
- Pro: Existing `ArchivoService` and `FileUploader` component handle everything
- Con: No FK constraint — application-level integrity only

**Example:**
```csharp
// When uploading a CFDI for a comprobacion:
await _archivoService.UploadAsync(new ArchivoUploadRequest
{
    EntidadTipo = "Comprobacion",
    EntidadId = comprobacion.IdComprobacion,
    File = file
});
```

### Pattern 3: Workflow-Driven State Machine

**What:** All state transitions go through `WorkflowEngine.EjecutarAccionAsync()`, which records immutable bitacora entries and resolves conditional routing.

**When to use:** EVERY state change on OrdenCompra — never mutate `Estado` directly outside the workflow.

**Trade-offs:**
- Pro: Complete audit trail in WorkflowBitacora
- Pro: Conditional routing (e.g., skip Firma5 for small amounts)
- Con: Requires workflow configuration in database (Pasos, Acciones, Condiciones)
- Con: All transitions must go through FirmasService (single chokepoint)

### Pattern 4: ErrorOr<T> Service Returns

**What:** All service methods return `ErrorOr<T>`. Controllers use `result.ToActionResult(this, data => new ApiResponse<T> { Data = data })`.

**When to use:** EVERY new service method — this is MANDATORY per AGENTS.md.

**Trade-offs:**
- Pro: Type-safe error handling, no exceptions for business logic
- Pro: Automatic HTTP status code mapping via ResultExtensions
- Con: Verbose — every call needs `if (result.IsError) return result.Errors`

### Pattern 5: Notification Templates per Workflow Action

**What:** `WorkflowNotificacion` entities link to `WorkflowAccion` and define templates per destination step. The `FirmasService` resolves which notification to send based on `(idAccion, idPasoDestino)`.

**When to use:** New workflow steps need notification templates configured in the database.

**Example new notification configs needed:**
- OC → EnTesoreria: Notify Tesoreria role (daily digest of pending payments)
- OC → Pagada: Notify OC creator ("Your order has been paid")
- Comprobante uploaded: Notify CxP role
- Comprobante validated/rejected: Notify OC creator

## Component Communication Map

### Internal Boundaries

| Boundary | Communication Pattern | Direction | Notes |
|----------|----------------------|-----------|-------|
| TesoreriaService ↔ IOrdenCompraRepository | Direct DI injection | Tesoreria reads OC | Read-only access to orders |
| TesoreriaService ↔ IWorkflowEngine | Direct DI injection | Tesoreria drives transitions | Triggers state change on full payment |
| ComprobacionService ↔ IOrdenCompraRepository | Direct DI injection | Comprobacion reads OC | Read-only access to orders |
| ComprobacionService ↔ IPagoRepository | Direct DI injection | Comprobacion reads Pagos | Optional link to specific payment |
| ComprobacionService ↔ IWorkflowEngine | Direct DI injection | Comprobacion drives transitions | Triggers closure when verified |
| IntegracionService ↔ All repositories | Direct DI injection | Read-only consumption | No state mutation |
| ReportesService ↔ All repositories | Direct DI injection | Read-only consumption | Complex queries, no mutation |
| IStepHandler ↔ Feature Services | NO direct dependency | Handlers are pass-through | Business logic stays in services |
| Frontend ↔ Backend | REST API (Axios) | Request/Response | Standard API calls |

### Dependency Graph (Build Order)

```
Layer 0 (no dependencies, build first):
  ├── Domain/Entities/Operaciones/Pago.cs
  ├── Domain/Entities/Operaciones/Comprobacion.cs
  ├── Domain/Entities/Operaciones/EstadoPago.cs
  ├── Domain/Entities/Operaciones/TipoComprobacion.cs
  ├── Domain/Entities/Operaciones/EstadoComprobacion.cs
  ├── Domain/Interfaces/Operaciones/IPagoRepository.cs
  └── Domain/Interfaces/Operaciones/IComprobacionRepository.cs

Layer 1 (depends on Layer 0):
  ├── Infrastructure/Data/Configurations/Operaciones/PagoConfiguration.cs
  ├── Infrastructure/Data/Configurations/Operaciones/ComprobacionConfiguration.cs
  ├── Infrastructure/Data/Repositories/Operaciones/PagoRepository.cs
  └── Infrastructure/Data/Repositories/Operaciones/ComprobacionRepository.cs

Layer 2 (depends on Layer 1):
  ├── Features/OrdenesCompra/Firmas/Handlers/Firma5Handler.cs
  ├── Features/OrdenesCompra/Firmas/Handlers/TesoreriaHandler.cs
  └── Features/OrdenesCompra/Firmas/Handlers/ComprobacionHandler.cs

Layer 3 (depends on Layer 2):
  ├── Features/Tesoreria/ (full module)
  └── Features/Comprobacion/ (full module)

Layer 4 (depends on Layer 3):
  └── Features/IntegracionContable/ (reads all prior data)

Layer 5 (depends on Layers 3-4):
  ├── Features/Reportes/ (complex queries across all modules)
  └── Frontend pages (tesoreria, comprobacion, reportes)

Layer 6 (depends on everything):
  ├── Shared/Constants/AuthorizationConstants.cs (new permissions)
  ├── Infrastructure/Data/Seeding/DatabaseSeeder.cs (workflow config)
  ├── Program.cs (DI registration)
  └── Frontend routes (AppRoutes.tsx)
```

## Build Order (Phase Implications)

### Phase A: Foundation (Domain + Infrastructure)
- New entities (Pago, Comprobacion, enums)
- New EF configurations
- New repositories
- Migration
- DI registration in Program.cs

### Phase B: Workflow Extension
- Firma5Handler (simplest — pure approval, no extra data)
- TesoreriaHandler + ComprobacionHandler (pass-through)
- Workflow seeding (new pasos + acciones in database)
- Test: Workflow transitions work end-to-end

### Phase C: Tesoreria Module
- TesoreriaService + Controller + DTOs + Validators
- Frontend: PagosBandeja + RegistrarPago
- Notifications for payment events
- **Blocker:** Requires Phase A + B complete

### Phase D: Comprobacion Module
- ComprobacionService + Controller + DTOs + Validators
- CFDI XML parsing service
- Frontend: SubirComprobacion + ValidarComprobacion + ComprobacionesBandeja
- Notifications for comprobacion events
- **Blocker:** Requires Phase C (needs Pagada state to close)

### Phase E: Integracion Contable
- IntegracionService + Controller
- Layout generation (CSV/XML)
- Frontend: ReportesContables page
- **Blocker:** Requires Phase D (reads Cerrada orders)

### Phase F: Reportes + Dashboard
- ReportesService + Controller
- Frontend: ReportesComprobaciones, DashboardCxP
- **Blocker:** Requires Phase E for full data

## Anti-Patterns

### Anti-Pattern 1: God Service — Putting Tesoreria Logic in FirmasService

**What people do:** Add payment creation logic directly into `FirmasService.FirmarAsync()`.
**Why it's wrong:** FirmasService already handles 5 different firma types. Adding payment logic violates SRP and makes the 277-line service unmaintainable.
**Do this instead:** TesoreriaService owns payment CRUD. FirmasService only handles workflow transitions. The TesoreriaHandler is a thin adapter.

### Anti-Pattern 2: OC-Scoped Repositories for Payments

**What people do:** Add payment methods to `IOrdenCompraRepository`.
**Why it's wrong:** IPagoRepository should own Pago CRUD. IOrdenCompraRepository shouldn't know about payments.
**Do this instead:** Separate repositories. TesoreriaService injects BOTH repositories and coordinates the transaction.

### Anti-Pattern 3: Extending AutorizacionesOC.tsx

**What people do:** Add payment forms and comprobacion uploads inside the existing 825-line AutorizacionesOC.tsx.
**Why it's wrong:** It's already at the complexity limit. Adding payment/comprobacion UIs would make it 1500+ lines.
**Do this instead:** Separate page components. AutorizacionesOC links to Tesoreria/Comprobacion pages via the order detail, but they are distinct routes.

### Anti-Pattern 4: Hardcoding Workflow Steps

**What people do:** Check `if (estado == EstadoOC.EnTesoreria)` in service code.
**Why it's wrong:** The workflow is configurable — steps can be added/removed via database. Hardcoding defeats the purpose of the engine.
**Do this instead:** Always use `IWorkflowEngine.EjecutarAccionAsync()` for transitions. The engine resolves the destination based on database configuration.

### Anti-Pattern 5: Putting CFDI Parsing in the Controller

**What people do:** Parse XML in the API controller before calling the service.
**Why it's wrong:** Controllers should be thin — validate DTO, call service, return result. XML parsing is business logic.
**Do this instead:** ComprobacionService handles CFDI parsing internally (or delegates to a CfdiParser helper).

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| External Accounting System | File export (CSV/XML layout) | Poliza layout format TBD — likely CSV with specific column structure |
| Email (SMTP) | INotificationChannel "email" (exists) | New templates for payment/comprobacion notifications |
| Telegram | INotificationChannel "telegram" (exists) | Optional — daily payment digest |
| SAT (future) | HTTP API (v2, out of scope) | CFDI UUID validation |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Tesoreria ↔ OrdenesCompra | IOrdenCompraRepository (DI) | Read OC + update Estado |
| Comprobacion ↔ OrdenesCompra | IOrdenCompraRepository (DI) | Read OC + update Estado |
| Comprobacion ↔ Tesoreria | IPagoRepository (DI) | Read payments for comprobacion linkage |
| Integracion ↔ All | Multiple repositories (DI) | Read-only aggregation |
| Reportes ↔ All | Multiple repositories (DI) | Read-only queries |
| Handlers ↔ Services | None (handlers are pass-through) | Handlers don't call services directly |

## Permissions Extension

New permissions to add to `AuthorizationConstants.cs`:

```csharp
public static class Tesoreria
{
    public const string View = "tesoreria.view";
    public const string Pay = "tesoreria.pay";
}

public static class Comprobacion
{
    public const string View = "comprobacion.view";
    public const string Upload = "comprobacion.upload";
    public const string Validate = "comprobacion.validate";
}

public static class Integracion
{
    public const string View = "integracion.view";
    public const string Export = "integracion.export";
}
```

Role-permission matrix additions:

| Role | New Permissions |
|------|----------------|
| Capturista | comprobacion.upload |
| CxP | comprobacion.view, comprobacion.validate, tesoreria.view, reportes.view |
| GerenteAdmon | tesoreria.view, integracion.view |
| DireccionCorp | tesoreria.view, reportes.view |
| Tesoreria | tesoreria.view, tesoreria.pay |
| AuxiliarPagos | tesoreria.view, integracion.view, integracion.export |
| Administrador | (all new permissions) |

## Sources

- Existing codebase analysis: `Features/OrdenesCompra/`, `Features/Config/Engine/`
- Domain entities: `Domain/Entities/Operaciones/EstadoOC.cs` (already has all states)
- Workflow engine: `Features/Config/Engine/WorkflowEngine.cs` (generic, configurable)
- Step handler pattern: `Features/OrdenesCompra/Firmas/Handlers/IStepHandler.cs` (keyed DI)
- PROJECT.md requirements: Sections on Tesoreria, Comprobacion, Integracion Contable
- AGENTS.md conventions: ErrorOr<T>, FluentValidation, ApiResponse<T>, ResultExtensions

---

*Architecture research for: CxP Module Integration*
*Researched: 2026-03-30*
