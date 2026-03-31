# Project Research Summary

**Project:** Lefarma CxP — Cuentas por Pagar (Purchase Order Accounts Payable)
**Domain:** Financial Operations — AP workflow, CFDI/XML parsing, payment processing, accounting integration
**Researched:** 2026-03-30
**Confidence:** HIGH (core), MEDIUM (CFDI ecosystem libraries)

## Executive Summary

The Lefarma CxP module completes the OrdenCompra lifecycle from authorization through payment, expense verification, and accounting integration. It is NOT a greenfield system — it extends an existing modular monolith (.NET 10 + React 19) that already has a workflow engine, notification system, file upload infrastructure, and a complete OC lifecycle with `EstadoOC` states predefined up to `Cerrada`. The challenge is adding 4 new feature modules (Tesoreria, Comprobacion, IntegracionContable, Reportes) without disrupting existing patterns.

The recommended approach is **custom CFDI XML parsing using built-in `System.Xml.Linq` + XPath** rather than third-party CFDI libraries, which are fragmented, single-maintainer, and designed for CFDI issuance (not reading). For financial document handling, `CsvHelper` (bank statements), `ClosedXML` (Excel reports), and `QuestPDF` (PDF receipts) cover the remaining needs — all MIT or community-licensed, no commercial licensing risk.

Key risks center on **monetary precision** (decimal handling in C#/EF/JS), **concurrent payment race conditions** (partial payments against the same OC), and **CFDI XML variability** (encoding issues, CFDI 3.3 vs 4.0, complemento structures). The 10 identified pitfalls are mitigable with explicit `.HasPrecision(18,2)`, optimistic concurrency on `RowVersion`, and defensive XML parsing with namespace-aware XPath.

## Key Findings

### Recommended Stack

The existing stack (ErrorOr, FluentValidation, EF Core 10, SQL Server, React 19, TanStack Table, Recharts) is fully reused with ZERO changes. Only 3 new NuGet packages are needed:

**Core technologies (NEW):**
- `System.Xml.Linq` + `System.Xml.XPath` (built-in .NET 10): CFDI 4.0 XML parsing — zero dependencies, full control over extraction logic, no risk of abandoned third-party libraries
- `CsvHelper` 33.1.0: Bank statement CSV import and contabilidad report export — 500M+ downloads, battle-tested for financial CSV with culture-aware decimal handling
- `ClosedXML` 0.105.0: Excel report generation (aging reports, payment summaries, polizas) and XLSX bank statement import — MIT licensed, no Excel installation needed
- `QuestPDF` 2026.2.4: PDF generation for payment receipts and poliza documents — community-licensed for orgs under $1M revenue, modern fluent C# API

**Explicitly NOT used:** EPPlus (restrictive commercial license), iTextSharp (AGPL viral license), tagcode.BuildCFDI (Lefarma reads CFDI, doesn't issue them), SAT real-time validation web service (unreliable, deferred to v2).

### Expected Features

Research identified 14 table-stakes features (users assume these exist), 8 differentiators (competitive advantage), and 5 anti-features (commonly requested but problematic — deliberately NOT building).

**Must have for launch (v1 — 13 P1 features):**
- Firma 5 Handler — completes authorization chain, without this OCs cannot reach Tesoreria (dead end)
- Payment Registration — N partial payments per OC, saldo tracking, EstadoOC transition to `Pagada`
- CFDI XML Upload + Auto-Extraction — parse CFDI 4.0, extract UUID/totals/RFCs/impuestos (HIGHEST complexity single feature, critical path)
- Non-Deductible Receipts — manual amount + image for expenses without CFDI
- Comprobacion Amount Validation — Gran Total rule: `Sum(XMLs) + Sum(NoDeducibles) + DepositoBancario >= OC.Total`
- CxP Validation Gate — CxP validates/rejects comprobantes, triggers cycle closure
- UUID Deduplication — prevent duplicate invoice processing via UNIQUE constraint
- Payment/Verification/Vendor Balance Reports — filtered queries on EstadoOC states
- Payment Notifications — leverage existing notification templates
- Bank Deposit Slip + Payment Receipt Upload — existing Archivo pattern

**Should have (v1.x — 8 P2 features):**
- Daily Treasury Digest Email, Aging Report, Provider Workflow, Dashboard CxP, Chart of Accounts Auto-Mapping, RFC Cross-Validation, Comprobacion Compliance Metric, Configurable Auth Levels UI

**Defer (v2+ — 5 P3 features):**
- Automatic Journal Entry Export, Bank Statement Reconciliation, Budget vs Actual Report, SAT CFDI Web Service Validation, Comprobacion Block on OC Capture

**Anti-features (NOT building):**
- Real-time SAT validation (unreliable, blocks valid work), Automatic bank execution (certification overkill), OCR receipt scanning (accuracy terrible), Full accounting system (scope explosion), Multi-currency (100% MXN), Budget hard-block (angers users), Approval via email (security nightmare), Mobile native app (PWA sufficient)

### Architecture Approach

The module integrates into the existing modular monolith as **4 separate feature modules** (not sub-modules under OrdenesCompra) that consume `OrdenCompra` via shared repository interfaces. Three new `IStepHandler` implementations extend the existing workflow engine for state transitions, while business logic lives in dedicated services. This separation prevents the existing 825-line `AutorizacionesOC.tsx` and 277-line `FirmasService` from becoming god objects.

**Major components:**
1. **Features/Tesoreria/** — Payment registration, scheduling, deposit receipt upload. Owns `Pago` entity (1:N with OrdenCompra). Service handles partial payments, saldo recalculation, and triggers `Pagada` state transition.
2. **Features/Comprobacion/** — CFDI XML upload + parsing, non-deductible receipts, bank deposit slips, CxP validation gate. Owns `Comprobacion` entity. Service handles XML extraction, amount validation, and triggers `Cerrada` state transition.
3. **Features/IntegracionContable/** — Accounting journal entry generation and export. Pure consumer — reads OCs, Pagos, and Comprobaciones to generate CSV/XML layouts for external accounting system (Contpaq/SAP). No state mutation.
4. **Features/Reportes/** — Pending payments, pending verifications, vendor balance, aging reports. Pure consumer with complex aggregation queries. No state mutation.

**Key architectural decisions:**
- Handlers in `Features/OrdenesCompra/Firmas/Handlers/` (participate in workflow pattern) delegate to services in separate feature modules
- Frontend pages are completely separate from AutorizacionesOC.tsx — new routes for Tesoreria, Comprobacion, Reportes
- New entities (`Pago`, `Comprobacion`) are separate aggregate roots, not owned by OrdenCompra
- All state transitions go through `WorkflowEngine.EjecutarAccionAsync()` — never mutate Estado directly
- `EntidadTipo/EntidadId` file pattern reused for payment receipts and comprobante attachments

### Critical Pitfalls

1. **Precision loss in monetary calculations (CRITICAL)** — All decimal properties MUST use `.HasPrecision(18, 2)` in EF configuration. Frontend MUST round to 2 decimals before sending. Use `Math.Round(value, 2, MidpointRounding.AwayFromZero)` for all calculations. A single `float` or `double` in a monetary field causes cumulative rounding errors with 16% IVA.

2. **Race condition on concurrent partial payments (HIGH)** — Two Tesoreria users can simultaneously register payments against the same OC, exceeding the total. Mitigate with optimistic concurrency (`RowVersion` on OrdenCompra already exists), atomic saldo calculation within SQL transaction, and `CHECK` constraint ensuring `Sum(Pago.Monto) <= OrdenCompra.Total`.

3. **CFDI XML encoding and structure variability (HIGH)** — XML files may have Windows-1252 encoding, missing namespaces, CFDI 3.3 (not migrated), or variable complemento structures. Force UTF-8 on load, use namespace-aware XPath, validate version 4.0 before parsing, reject 3.3 with clear message, and log original XML on parse failure.

4. **Cross-empresa cuenta contable assignment (HIGH)** — Each company (ATC, ASK, LEF, CON, GRP) has its own chart of accounts. Assigning an ATC account to an ASK OC generates incorrect polizas. Validate `CuentaContable.EmpresaId == OrdenCompra.EmpresaId` in backend + filter dropdowns by empresa on frontend.

5. **UUID duplicate in comprobantes (HIGH)** — Same CFDI uploaded to multiple OCs = double-counting expenses. UNIQUE constraint on UUID column + service-level validation before insert + clear error message showing which OC already has that UUID.

## Implications for Roadmap

Based on research, the suggested phase structure follows a strict dependency chain: entities/infrastructure first, then workflow extensions, then Tesoreria (payments), then Comprobacion (needs Pagada state), then IntegracionContable (needs Cerrada state), then Reportes (aggregates everything).

### Phase 1: Foundation (Domain + Infrastructure)
**Rationale:** All other phases depend on new entities and their database mappings. Must exist before any service or handler can be written.
**Delivers:** `Pago` entity, `Comprobacion` entity, enums (`EstadoPago`, `TipoComprobacion`, `EstadoComprobacion`), EF configurations with `.HasPrecision(18,2)`, repositories, migration, DI registration.
**Addresses:** Precision loss pitfall (PIT-01) — enforces decimal precision at schema level.
**Avoids:** Race condition groundwork (PIT-02) — RowVersion already on OC, precision baked into migration.

### Phase 2: Workflow Extension
**Rationale:** The OC lifecycle is stuck at Firma 4. Without Firma 5 Handler, TesoreriaHandler, and ComprobacionHandler, no OC can progress to payment or verification states.
**Delivers:** `Firma5Handler` (pure approval), `TesoreriaHandler` (pass-through to EnTesoreria), `ComprobacionHandler` (validates comprobacion sum, triggers closure). Workflow seeding (new pasos + acciones in database).
**Uses:** Existing `IStepHandler` keyed DI pattern, existing `WorkflowEngine`.
**Implements:** Architecture Decision 5 — new handler implementations.
**Avoids:** Anti-pattern 4 (hardcoding workflow steps) — all transitions go through engine.

### Phase 3: Tesoreria Module
**Rationale:** Payments must happen before comprobantes can be uploaded (specs section 7: comprobacion AFTER payment). The EstadoOC.Pagada state is a prerequisite for Comprobacion.
**Delivers:** `TesoreriaService` + Controller + DTOs + Validators. Frontend: `PagosBandeja.tsx` + `RegistrarPago.tsx`. Payment notifications. Partial payment support with saldo tracking.
**Uses:** `CsvHelper` (if CSV report export needed this early), existing `ArchivoService` for deposit receipts.
**Implements:** Architecture Decision 2 — 1:N Pago-to-OrdenCompra relationship.
**Avoids:** PIT-02 (concurrent payment race condition) via optimistic concurrency + atomic validation. PIT-08 (frontend complexity) via separate pages.

### Phase 4: Comprobacion Module
**Rationale:** Depends on Phase 3 — comprobantes are uploaded AFTER payment (EstadoOC.Pagada). CFDI XML parsing is the highest-complexity single feature (critical path).
**Delivers:** `ComprobacionService` + Controller + DTOs + Validators. `CfdiParserService` (XML extraction). Frontend: `SubirComprobacion.tsx` + `ValidarComprobacion.tsx` + `ComprobacionesBandeja.tsx`. UUID deduplication. Amount validation (Gran Total rule).
**Uses:** `System.Xml.Linq` + XPath for CFDI parsing.
**Implements:** Architecture Decision 3 — Comprobacion as separate aggregate root. Architecture Decision 1 — separate feature module.
**Avoids:** PIT-03 (CFDI encoding) via defensive parsing. PIT-06 (UUID duplicate) via UNIQUE constraint.

### Phase 5: Integracion Contable + Reportes
**Rationale:** Accounting integration only works on fully validated OCs (EstadoOC.Cerrada). Reports aggregate data from all prior modules.
**Delivers:** `IntegracionService` + Controller + poliza layout generation. `ReportesService` + Controller + pending payments/verifications/vendor balance reports. Frontend: `ReportesContables.tsx` + `ReportesComprobaciones.tsx`.
**Uses:** `ClosedXML` (Excel report generation), `QuestPDF` (PDF receipt generation), `CsvHelper` (poliza CSV export).
**Implements:** Architecture Decisions 4 (standalone integration module).
**Avoids:** PIT-05 (cross-empresa cuenta contable) via validation in poliza generation. PIT-10 (N+1 queries) via projected queries + proper indexing.

### Phase 6: Dashboard + P2 Features
**Rationale:** Dashboard KPIs pull from ALL modules. Building it last ensures complete data flow. P2 features (aging report, daily digest, provider workflow) enhance but don't complete the lifecycle.
**Delivers:** Dashboard CxP with KPIs. Aging report. Daily treasury digest. Provider workflow. Comprobacion compliance metric.
**Uses:** `Recharts` (already installed), existing notification system for digest emails.

### Phase Ordering Rationale

- **Phases 1→2 are sequential:** Entities must exist before handlers that reference them. Migration must run before workflow seeding.
- **Phases 2→3 are sequential:** Workflow must support `EnTesoreria` transition before TesoreriaService can register payments.
- **Phases 3→4 are sequential:** Comprobacion requires `Pagada` state (produced by Tesoreria) — users upload comprobantes AFTER payment.
- **Phases 4→5 are sequential:** IntegracionContable only exports polizas for `Cerrada` OCs (produced by Comprobacion validation).
- **Phase 6 depends on all prior phases:** Dashboard and reports need complete data flow.
- **Grouping by architectural layer:** Foundation (domain) → Extension (workflow) → Features (services + UI) → Consumers (integration + reports) → Polish (dashboard).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4:** CFDI 4.0 complemento parsing (Carta Porte, Pagos 2.0) — may need `CFDI40` NuGet package if custom XPath proves insufficient for complex complementos. Needs real CFDI samples from Grupo Lefarma's suppliers.
- **Phase 5:** External accounting system layout format — Contpaq vs SAP vs other. Must validate exact column structure and encoding (Windows-1252 for Contpaq) with the accounting team before building export.
- **Phase 5:** Bank statement import — bank-specific CSV/XLSX layouts vary. Need actual statements from Auxiliar de Pagos to define parser.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Standard EF Core entity + configuration + repository pattern. Well-documented, established in existing codebase.
- **Phase 2:** IStepHandler pattern with 3 existing implementations to follow (Firma3, Firma4).
- **Phase 3:** Standard CRUD service + controller pattern. Payment entity is straightforward.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH (core), MEDIUM (CFDI libs) | Core packages (CsvHelper, ClosedXML, QuestPDF) are battle-tested. CFDI ecosystem is fragmented — custom parser is safest but may need CFDI40 for complex complementos. |
| Features | HIGH | Derived from PROJECT.md specs (632 lines), existing codebase analysis, and Mexican AP domain knowledge. 14 table-stakes features map directly to business requirements. |
| Architecture | HIGH | All patterns (IStepHandler, ErrorOr, WorkflowEngine, EntidadTipo/EntidadId) are proven in existing codebase. No novel architectural patterns needed. |
| Pitfalls | HIGH | 10 pitfalls identified from domain expertise (financial systems + Mexican SAT requirements) and codebase analysis. All mitigable with explicit patterns. |

**Overall confidence:** HIGH

### Gaps to Address

- **CFDI complemento complexity:** Custom XPath parser handles standard CFDI 4.0. Carta Porte 3.1, Comercio Exterior, and Pagos 2.0 complementos may require the `CFDI40` typed classes. Decision point during Phase 4 implementation — evaluate with real supplier XMLs.
- **External accounting system layout:** The exact CSV/XML format for poliza export depends on which system Grupo Lefarma uses (Contpaq, AdminPAQ, SAP, or other). Must confirm with accounting team before Phase 5.
- **Bank-specific statement formats:** Each bank (BBVA, Santander, Banorte, Citibanamex) has unique CSV/XLSX layouts. Need actual files from Auxiliar de Pagos to build parsers. Deferred to v2 per PROJECT.md.
- **Forma de Pago vs Metodo de Pago clarification:** Current codebase conflates these two SAT concepts. Need to clarify if existing `FormaPago` entity maps to SAT's `c_FormaPago` or `c_MetodoPago`, and whether a new entity is needed. Address during Phase 1 entity design.

## Sources

### Primary (HIGH confidence)
- **Project codebase** — Full analysis of existing entities, workflow engine, notification system, file upload, and feature patterns. All architectural decisions validated against running code.
- **PROJECT.md** — Detailed business requirements for CxP module (sections on Tesoreria, Comprobacion, Integracion Contable).
- **AGENTS.md** — Mandatory patterns (ErrorOr<T>, FluentValidation, ApiResponse<T>, Spanish validation messages).
- **NuGet.org** — Verified versions and compatibility for: CsvHelper 33.1.0, ClosedXML 0.105.0, QuestPDF 2026.2.4, MiniExcel 1.43.0.
- **SAT (Servicio de Administracion Tributaria)** — CFDI 4.0 specification, XSD schemas, catalog references (c_FormaPago, c_MetodoPago, c_UsoCFDI).

### Secondary (MEDIUM confidence)
- **CFDI NuGet ecosystem analysis** — Reviewed top 20 CFDI packages. Determined custom parser is safer than any third-party option for the reading use case.
- **QuestPDF documentation** — License model verified: community license free for orgs under $1M revenue.
- **EPPlus license analysis** — Polyform Noncommercial 1.0.0 confirmed restrictive for commercial use. Ruled out.
- **Mexican AP domain knowledge** — Standard Cuentas por Pagar processes for mid-market pharmaceutical distribution in Mexico.

### Tertiary (LOW confidence)
- **Contpaq export format** — CSV layout structure inferred from common Contpaq integration patterns. Needs validation with actual accounting team.
- **Bank statement formats** — BBVA/Santander CSV structures inferred from public documentation. Needs actual files for verification.
- **CFDI40 package quality** — Single maintainer, last updated Jan 2022, but XSD-generated classes are stable. Low risk for reading-only use.

---
*Research completed: 2026-03-30*
*Ready for roadmap: yes*
