# Feature Research

**Domain:** Cuentas por Pagar (Accounts Payable) — Treasury, Expense Verification, Reporting, Accounting Integration, Dashboard
**Researched:** 2026-03-30
**Confidence:** HIGH

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete. These are the minimum for a CxP system in Mexican pharma distribution.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Payment Registration (Registro de Pagos)** | Tesoreria must register payments against authorized OCs. Without this, money moves but the system doesn't know. | MEDIUM | Multiple payments per OC, partial payments, tracking saldo pendiente. New `Pago` entity linked to `OrdenCompra`. EstadoOC transitions: EnTesoreria → Pagada. |
| **Payment Scheduling (Programacion de Pagos)** | Tesoreria needs to plan when to pay based on FechaLimitePago and cash flow. | LOW | Date field + daily email digest of pending payments. Leverage existing notification system. |
| **Payment Methods — Transfer/Check/Cash** | Mexican companies pay via transfer (99% of B2B), check, or cash. Must record which method + reference. | LOW | `MedioPago` catalog already exists with `CodigoSAT`, `RequiereReferencia`, `RequiereAutorizacion`. Link payment to MedioPago. |
| **Payment Receipt Upload (Comprobante de Deposito)** | Every payment needs a deposit slip/transfer receipt for audit trail. | LOW | Existing `Archivo` entity with `EntidadTipo/EntidadId` pattern already handles this. Just needs UI hookup for "PAGO" entidadTipo. |
| **CFDI XML Upload + Auto-Extraction** | Mexican tax law requires CFDI (factura electronica). Users upload XML, system must parse UUID, RFC emisor/receptor, conceptos, impuestos, total. | HIGH | XML parsing of CFDI 4.0 structure. Extract: `UUID`, `Emisor/Rfc`, `Receptor/Rfc`, `Total`, `SubTotal`, `Impuestos`, `Conceptos`. Validate against OC amount. |
| **Non-Deductible Receipts (No Deducibles)** | Not all expenses have CFDI (taxis, parking, small purchases). Must capture manual amount + photo. | MEDIUM | Manual entry of amount + image upload. No XML parsing. Linked to OC comprobacion. |
| **Bank Deposit Slip (Ficha de Deposito)** | Separate comprobante type for cash deposits to bank. Manual amount entry. | LOW | Simple amount capture + optional image. Part of comprobacion gran total calculation. |
| **Comprobacion Amount Validation** | Gran Total (XMLs + no deducibles + deposito) must be >= OC Total. Otherwise cycle cannot close. | MEDIUM | Business rule: `Sum(XMLs) + Sum(NoDeducibles) + DepositoBancario >= OC.Total`. Error if insufficient. Allow excess (specs say allowed). |
| **CxP Validation of Comprobantes** | CxP (Polo) reviews uploaded comprobantes and validates or rejects. This is the gate to cycle closure. | MEDIUM | EstadoOC transition: EnComprobacion → Cerrada (validate) or back to EnComprobacion (reject with reason). Notification to user on both outcomes. |
| **Pending Payments Report** | "What do we owe and to whom?" — most basic AP question. | LOW | Filter by date range, empresa, sucursal. Shows OCs in EnTesoreria/Pagada (partial) state. |
| **Pending Verifications Report** | "Who hasn't turned in their receipts?" — compliance critical. | LOW | Filter by user, aging (30/60/90+ days). Shows OCs in EnComprobacion state. |
| **Vendor Balance Report (Saldos de Proveedores)** | "How much do we owe each vendor?" — basic AP ledger. | MEDIUM | Aggregate payments vs OC totals per Proveedor. Aging buckets (current, 30, 60, 90+). |
| **Notification: Payment Made** | User who created OC must know when Tesoreria pays. | LOW | Existing notification system + templates. Just add `notificacion_pago` template. |
| **Notification: Comprobacion Required** | User must know they need to upload receipts after payment. | LOW | Triggered on EstadoOC → Pagada transition. Existing notification infrastructure. |
| **Firma 5 Handler (Direccion Corporativa)** | Current workflow stops at Firma 4. Need final authorization step before Tesoreria. | LOW | New `Firma5Handler : IStepHandler`. EstadoOC transition: EnRevisionF5 → Autorizada → EnTesoreria. Same pattern as Firma3/Firma4 handlers. |

### Differentiators (Competitive Advantage)

Features that set Lefarma CxP apart from basic AP tools. Not strictly required, but add significant operational value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **CFDI UUID Deduplication** | Prevents duplicate invoice processing — a real problem when vendors send the same factura multiple times or users upload the same XML to different OCs. | LOW | Extract UUID from XML, check `ComprobanteCFDI` table for uniqueness. Simple UNIQUE constraint. |
| **RFC Cross-Validation (Emisor vs Proveedor)** | Validates that the CFDI emisor RFC matches the OC's proveedor RFC. Catches misattributed expenses. | LOW | Parse `Emisor/Rfc` from XML, compare against `OrdenCompra.RfcProveedor`. Warn if mismatch, don't block. |
| **Aging Report (Antiguedad de Saldos)** | Shows how old payables are — critical for cash flow management and avoiding late payment penalties. | MEDIUM | Buckets: 0-30, 31-60, 61-90, 90+ days from FechaLimitePago. Per vendor, per empresa. |
| **Automatic Journal Entry Generation (Polizas Automaticas)** | Instead of manual data entry in the accounting system, generate the journal entry automatically from the OC + comprobacion data. | HIGH | Map OC data to chart of accounts: debit expense account (CuentaContable from Firma 3), credit accounts payable/bank. Export as CSV/XML layout for external accounting system. |
| **Chart of Accounts Auto-Mapping** | CxP assigns CentroCosto + CuentaContable at Firma 3. The full account string is deterministic: `EMPRESA-SUCURSAL-CENTROCOSTO-CUENTA`. | MEDIUM | Build account string from: Empresa.Prefijo + Sucursal.Codigo + CentroCosto.Id + CuentaContable.Cuenta. Already have all catalog entities. |
| **Dashboard CxP — KPIs** | Executive view: total pending payments, overdue items, comprobacion compliance rate, monthly spend trend. | MEDIUM | Aggregate queries over OC states. Cards + charts. React components with recharts or similar. |
| **Budget vs Actual Report (Presupuesto vs Real)** | Compare planned spending by account vs actual. Identifies overspending early. | HIGH | Requires budget input mechanism (CSV import or manual entry per account/period). Then compare against aggregated OC totals. Deferred to v1.x per PROJECT.md. |
| **Bank Statement Import + Reconciliation** | Import bank statement (layout bancario), match with registered payments. Identifies unmatched items. | HIGH | Parse bank-specific CSV/XML layout. Fuzzy match on amount + date + reference. Flag unmatched. Separate reconciliation workflow. |
| **Daily Treasury Digest Email** | Automated email to Tesoreria every morning with list of OCs pending payment. | LOW | Scheduled job (Hangfire/worker) querying OCs in EnTesoreria state. Leverage existing email notification channel. |
| **Comprobacion Compliance Metric** | Track what % of OCs get their comprobantes uploaded within X days. Gamify compliance. | LOW | Simple ratio: OCs with comprobacion complete within N days / total OCs requiring comprobacion. Display on dashboard. |
| **Configurable Authorization Levels** | Different OC amounts or expense types route through different approval chains. Already supported by WorkflowEngine conditions. | MEDIUM | UI for configuring WorkflowCondiciones (e.g., Total > 100k → require Firma 5). Engine already evaluates conditions. Need admin config page. |
| **Provider Workflow (Aprobacion de Proveedores)** | New providers from OC capture start with `AutorizadoPorCxP = false`. CxP reviews and promotes to official catalog. | LOW | `Proveedor.AutorizadoPorCxP` flag already exists. Need CxP inbox view + approve/reject actions. Notification to capturista. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Deliberately NOT building these.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time SAT CFDI Validation (Consulta CFDI)** | "Let's validate every XML against SAT's web service in real-time" | SAT's webservice is unreliable, rate-limited, and adds latency. Validation errors from SAT outages block users from uploading valid invoices. Also requires Firma electronica credentials + certificacion. | Validate XML structure locally (well-formed + CFDI 4.0 schema). UUID dedup within system. Defer SAT web service to v2. |
| **Automatic Payment Execution** | "Let the system initiate bank transfers automatically" | Integrating with bank APIs (SPEI) requires certification, security audits, and legal compliance. Not worth it for 5 companies with manual treasury. | System tracks and records payments. Treasury executes manually at the bank. Upload deposit slip as proof. |
| **OCR Receipt Scanning** | "Auto-extract amounts from photos of receipts" | OCR accuracy on crumpled taxi receipts is terrible. False extractions are worse than manual entry — creates audit risk. | Manual amount entry for non-deductible receipts. Photo is just for record-keeping, not data extraction. |
| **Full Accounting System** | "Why not replace the external accounting system?" | Building a full accounting system (polizas, balanza, diario, mayor, NIF compliance) is a separate product. Scope explosion. | Generate journal entry exports (CSV/XML) that feed into the existing external accounting system. |
| **Multi-Currency** | "What if we buy from foreign suppliers?" | Grupo Lefarma operates 100% in MXN. Adding multi-currency adds complexity to every calculation, report, and reconciliation for zero current value. | MXN only. If foreign suppliers appear, handle conversion at OC capture time with fixed rate. |
| **Budget Hard-Block** | "Block OC creation when budget is exceeded" | Premature constraint that angers users. Budget data is often incomplete or outdated. Blocking operations on bad data = system gets bypassed. | Budget vs Actual report shows overspend. Soft alert, not hard block. Phase 2 consideration. |
| **Approval via Email Reply** | "Let managers approve by replying to the notification email" | Security nightmare — email spoofing, no audit trail for "reply", authentication challenges. Also requires email parsing infrastructure. | In-app approval with proper auth. Email notifications link to the app where approval happens securely. |
| **Mobile Native App** | "We need an iOS/Android app for approvals" | PWA works fine for this use case. Native app means 2 codebases, app store reviews, version fragmentation. 8 users, not 8 million. | Responsive web app. PWA-capable if needed. Authored approvals work on mobile browser. |

---

## Feature Dependencies

```
[Firma 5 Handler]
    └──enables──> [Tesoreria Module (Payment Processing)]
                       ├──enables──> [Payment Notifications]
                       └──enables──> [Comprobacion Module (Expense Verification)]
                                          ├──requires──> [CFDI XML Parsing]
                                          ├──requires──> [Non-Deductible Receipts]
                                          ├──requires──> [Amount Validation (Gran Total)]
                                          └──enables──> [CxP Validation Gate]
                                                              └──enables──> [Cycle Closure]

[CFDI XML Parsing]
    ├──enables──> [UUID Deduplication]
    └──enables──> [RFC Cross-Validation]

[Tesoreria Module]
    └──enables──> [Pending Payments Report]

[Comprobacion Module]
    ├──enables──> [Pending Verifications Report]
    └──enables──> [Comprobacion Compliance Metric]

[CxP Validation Gate + Cycle Closure]
    └──enables──> [Accounting Integration (Journal Entries)]
                      └──enables──> [Bank Reconciliation]

[All Modules]
    └──feeds──> [CxP Dashboard (KPIs)]

[Chart of Accounts Auto-Mapping]
    └──enhances──> [Accounting Integration]

[Configurable Authorization Levels]
    └──enhances──> [Firma 5 Handler (conditional routing)]

[Provider Workflow]
    └──independent──> [Can build anytime after Firma 3 exists]
```

### Dependency Notes

- **Firma 5 requires WorkflowEngine:** The IStepHandler pattern is established (Firma3Handler, Firma4Handler). Firma5Handler follows the same keyed DI registration. Must exist before Tesoreria can receive OCs.
- **Tesoreria requires Firma 5:** Payment processing only happens on OCs that have passed all authorization levels. The EstadoOC.Autorizada → EnTesoreria transition is the gateway.
- **Comprobacion requires Tesoreria:** Users can only upload comprobantes AFTER payment (specs section 7). EstadoOC.Pagada → EnComprobacion transition triggers the notification to upload.
- **CFDI XML Parsing is the critical path:** This is the highest-complexity single feature. It blocks the entire comprobacion module. Start this early.
- **Accounting Integration requires Cycle Closure:** Journal entries should only be generated for fully validated OCs (EstadoOC.Cerrada). Generating entries for in-process OCs creates reconciliation nightmares.
- **Dashboard aggregates everything:** KPIs pull from all modules. Build dashboard LAST, after data from all modules is flowing.
- **Provider Workflow is independent:** The `Proveedor.AutorizadoPorCxP` flag already exists. The workflow can be built at any time without blocking other features.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to complete the full OC lifecycle end-to-end.

- [ ] **Firma 5 Handler** — Without this, OCs can't reach Tesoreria. Dead end. (LOW effort, leverages existing IStepHandler pattern)
- [ ] **Tesoreria: Payment Registration** — Register single and multiple payments against OCs. Partial payments, saldo tracking. (MEDIUM effort, new Pago entity + service)
- [ ] **Tesoreria: Payment Receipt Upload** — Deposit slip/transfer receipt as proof. (LOW effort, existing Archivo pattern)
- [ ] **Tesoreria: Payment Notifications** — Alert user when payment registered. (LOW effort, existing notification templates)
- [ ] **Comprobacion: CFDI XML Upload + Parsing** — Parse CFDI 4.0 XML, extract UUID/totals/RFCs. (HIGH effort, CFDI 4.0 schema knowledge required)
- [ ] **Comprobacion: Non-Deductible Receipts** — Manual amount + image upload. (MEDIUM effort, new entity + UI)
- [ ] **Comprobacion: Bank Deposit Slip** — Manual amount capture. (LOW effort, part of comprobacion entity)
- [ ] **Comprobacion: Amount Validation (Gran Total)** — Business rule enforcement. (MEDIUM effort, aggregation logic)
- [ ] **CxP Validation Gate** — CxP validates/rejects comprobantes. Cycle closure. (MEDIUM effort, EstadoOC transition + notification)
- [ ] **UUID Deduplication** — Prevent duplicate invoice processing. (LOW effort, unique constraint on UUID)
- [ ] **Pending Payments Report** — What's owed. (LOW effort, filtered query on EstadoOC)
- [ ] **Pending Verifications Report** — Who hasn't turned in receipts. (LOW effort, filtered query on EstadoOC)
- [ ] **Vendor Balance Report** — How much per vendor. (MEDIUM effort, aggregation by Proveedor)

### Add After Validation (v1.x)

Features to add once core lifecycle is working in production.

- [ ] **Daily Treasury Digest Email** — Trigger: Tesoreria asks for morning report. (Scheduled job)
- [ ] **Aging Report** — Trigger: Finance asks for cash flow visibility. (Aggregation + buckets)
- [ ] **Provider Workflow (CxP Aprobacion)** — Trigger: CxP notices providers from OCs aren't in catalog. (Inbox + approve/reject)
- [ ] **Dashboard CxP** — Trigger: Management wants visual summary instead of reports. (Cards + charts)
- [ ] **Chart of Accounts Auto-Mapping** — Trigger: CxP wants the full account string generated, not manually typed. (String builder from catalogs)
- [ ] **Configurable Authorization Levels UI** — Trigger: Admin wants to adjust approval chains without code changes. (Admin config page)
- [ ] **RFC Cross-Validation** — Trigger: CxP catches misattributed expense. (Warn on mismatch)
- [ ] **Comprobacion Compliance Metric** — Trigger: Management wants to track receipt submission speed. (Dashboard metric)

### Future Consideration (v2+)

Features to defer until core CxP is battle-tested.

- [ ] **Automatic Journal Entry Export** — Why defer: Needs understanding of external accounting system's expected format. Export layout must be validated with the accounting team first.
- [ ] **Bank Statement Import + Reconciliation** — Why defer: Bank layout parsing is bank-specific and brittle. Requires Auxiliar de Pagos to define the exact layout from their bank.
- [ ] **Budget vs Actual Report** — Why defer: Requires budget input mechanism. Need to define who enters budgets, at what level (empresa/sucursal/cuenta), and at what frequency. (PROJECT.md already scopes to v1 report only)
- [ ] **SAT CFDI Web Service Validation** — Why defer: Requires Firma electronica, SAT certification, and handling of SAT outages. Out of scope per PROJECT.md.
- [ ] **Comprobacion Block on OC Capture** — Why defer: Blocking new OCs when comprobaciones are pending is a Phase 2 requirement per specs section 16.1. Premature now.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Firma 5 Handler | HIGH | LOW | P1 |
| Payment Registration | HIGH | MEDIUM | P1 |
| Payment Receipt Upload | HIGH | LOW | P1 |
| CFDI XML Upload + Parsing | HIGH | HIGH | P1 |
| Non-Deductible Receipts | HIGH | MEDIUM | P1 |
| Amount Validation (Gran Total) | HIGH | MEDIUM | P1 |
| CxP Validation Gate | HIGH | MEDIUM | P1 |
| Payment Notifications | HIGH | LOW | P1 |
| UUID Deduplication | MEDIUM | LOW | P1 |
| Pending Payments Report | HIGH | LOW | P1 |
| Pending Verifications Report | HIGH | LOW | P1 |
| Vendor Balance Report | HIGH | MEDIUM | P1 |
| Bank Deposit Slip | MEDIUM | LOW | P1 |
| Daily Treasury Digest | MEDIUM | LOW | P2 |
| Provider Workflow | MEDIUM | LOW | P2 |
| Aging Report | MEDIUM | MEDIUM | P2 |
| Dashboard CxP | MEDIUM | MEDIUM | P2 |
| RFC Cross-Validation | LOW | LOW | P2 |
| Chart of Accounts Auto-Mapping | MEDIUM | MEDIUM | P2 |
| Comprobacion Compliance Metric | LOW | LOW | P2 |
| Configurable Auth Levels UI | MEDIUM | MEDIUM | P2 |
| Journal Entry Export | HIGH | HIGH | P3 |
| Bank Reconciliation | MEDIUM | HIGH | P3 |
| Budget vs Actual | MEDIUM | HIGH | P3 |
| SAT CFDI Validation | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch — completes the OC lifecycle end-to-end
- P2: Should have, add when possible — operational efficiency
- P3: Nice to have, future consideration — integration + advanced reporting

---

## Mexican-Specific Requirements (SAT / CFDI 4.0)

### CFDI 4.0 XML Structure (Required for Parsing)

Key elements the system must extract from uploaded XML files:

```xml
<cfdi:Comprobante Version="4.0" UUID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  Total="1160.00" SubTotal="1000.00"
                  Fecha="2026-03-30T10:00:00">
  <cfdi:Emisor Rfc="ABC123456789" Nombre="Proveedor SA de CV"
               RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="XYZ987654321" Nombre="Artricenter SA de CV"
                 RegimenFiscalReceptor="601"
                 UsoCFDI="G01"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="12345678" Cantidad="10"
                   Unidad="PZA" Descripcion="Material medico"
                   ValorUnitario="100.00" Importe="1000.00">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="1000.00" Impuesto="002"
                         TipoFactor="Tasa" TasaOCuota="0.160000"
                         Importe="160.00"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="160.00">
    <cfdi:Traslados>
      <cfdi:Traslado Impuesto="002" TipoFactor="Tasa"
                     TasaOCuota="0.160000" Importe="160.00"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
</cfdi:Comprobante>
```

### Fields to Extract

| XML Path | Field Name | Purpose |
|----------|------------|---------|
| `@UUID` (from timbreFiscal) | UUID | Deduplication key |
| `Comprobante/@Total` | Total | Amount validation vs OC |
| `Comprobante/@SubTotal` | SubTotal | Before taxes |
| `Comprobante/@Fecha` | FechaEmision | Record date |
| `Comprobante/@Moneda` | Moneda | Should be MXN |
| `Comprobante/@TipoCambio` | TipoCambio | 1 for MXN |
| `Comprobante/@TipoDeComprobante` | TipoComprobante | Should be "I" (Ingreso) |
| `Emisor/@Rfc` | RfcEmisor | Cross-validate vs Proveedor.RFC |
| `Emisor/@Nombre` | NombreEmisor | Display |
| `Emisor/@RegimenFiscal` | RegimenFiscalEmisor | Record |
| `Receptor/@Rfc` | RfcReceptor | Should match Empresa.RFC |
| `Receptor/@UsoCFDI` | UsoCFDI | Typically "G01" (adquisicion) |
| `Conceptos/Concepto/@Descripcion` | Descripcion | Match vs OC partidas |
| `Impuestos/Traslados/Traslado/@Importe` | IVA | Verify tax amount |
| `Complemento/TimbreFiscalDigital/@UUID` | UUID (timbre) | SAT seal - true UUID source |

### SAT Catalog References

| Catalog | Purpose | Mapping in System |
|---------|---------|-------------------|
| **Forma de Pago (c_FormaPago)** | How payment is made (transfer, check, cash) | `FormaPago` entity + `Clave` field (e.g., "03" = transferencia, "02" = cheque, "01" = efectivo) |
| **Metodo de Pago (c_MetodoPago)** | When payment is made (PUE = one-time, PPD = deferred) | Currently in OC as `IdFormaPago` — may need separate MetodoPago distinction. PUE = contado, PPD = credito |
| **Uso CFDI (c_UsoCFDI)** | Purpose of invoice (G01 = adquisicion mercancias) | New field on comprobante entity. Default "G01" |
| **Regimen Fiscal (c_RegimenFiscal)** | Tax regime of emisor/receptor | `RegimenFiscal` entity already exists with `Clave` |
| **Clave Prod/Serv (c_ClaveProdServ)** | Product/service classification | Not in system — could be extracted from CFDI for record-keeping |
| **Unidad de Medida (c_Unidad)** | Unit of measure SAT codes | `Medida` entity exists. CFDI uses SAT codes, system uses internal IDs |

### Key SAT Validation Rules (Local, Not Web Service)

| Rule | Implementation |
|------|----------------|
| XML must be well-formed | Try XDocument.Parse, fail gracefully |
| Must be CFDI version 4.0 | Check `Comprobante/@Version = "4.0"` |
| Must have TimbreFiscalDigital | Check for UUID in complement |
| Emisor RFC must match OC Proveedor RFC | Extract Emisor/@Rfc, compare vs OC.RfcProveedor |
| Receptor RFC must match OC Empresa RFC | Extract Receptor/@Rfc, compare vs Empresa.RFC |
| Total must be positive decimal | Parse and validate > 0 |
| Moneda should be MXN for domestic | Warn if not MXN |
| UUID must not already exist in system | UNIQUE constraint on ComprobanteCFDI.UUID |

### Forma de Pago vs Metodo de Pago (Critical Distinction)

These are DIFFERENT SAT concepts often confused:

| Concept | SAT Catalog | Values | In System |
|---------|-------------|--------|-----------|
| **Forma de Pago** | c_FormaPago | 01=Efectivo, 02=Cheque nominativo, 03=Transferencia, 04=Tarjeta credito, 05=Monedero, 28=Subsidio, 99=Por definir | `FormaPago` entity with `Clave` field |
| **Metodo de Pago** | c_MetodoPago | PUE=Pago en una exhibicion, PPD=Pago en parcialidades o diferido | Currently conflated with FormaPago in OC. Need to clarify. PUE maps to "contado", PPD maps to "credito/parcial" from specs section 4.4 |

**Important:** Metodo de Pago (PUE/PPD) determines WHEN the CFDI is issued:
- PUE: Invoice issued when goods/service delivered (single payment)
- PPD: Invoice issued when payment happens (partial/deferred payments)

This affects comprobacion flow — PPD OCs may have the CFDI generated AFTER payment.

---

## Competitor Feature Analysis

| Feature | SAP Concur | Oracle AP | QuickBooks Mexico | Our Approach |
|---------|------------|-----------|-------------------|--------------|
| CFDI XML Parsing | Full + SAT validation | Full + SAT validation | Full + SAT validation | Local parsing + UUID dedup. No real-time SAT (anti-feature). |
| Payment Methods | All + virtual cards | All + automated | Basic (transfer/check) | Transfer/Check/Cash. Manual execution, system tracks. |
| Approval Workflow | Configurable N levels | Configurable N levels | Basic 1-2 levels | WorkflowEngine with N levels + conditions by amount/type. Already built. |
| Multi-Company | Yes (complex) | Yes (complex) | Limited | 5 companies, shared catalog, per-empresa filtering. Simple multi-tenant. |
| Accounting Integration | Full bi-directional | Full bi-directional | Native (it IS accounting) | One-way export (CSV/XML). External system remains source of truth. |
| Bank Reconciliation | Automated + rules | Automated + AI | Manual matching | Import statement + manual match. v2+ feature. |
| Reporting | Extensive | Extensive | Basic | Targeted reports for specific roles. No ad-hoc query builder. |
| Mobile | Full native app | Full native app | Basic responsive | Responsive web. No native app (anti-feature). |

**Our differentiator:** Opinionated workflow tailored to Grupo Lefarma's exact process (5 signatures, specific people, chart of accounts structure). Zero configuration tax — the system IS their process.

---

## Entity Design Notes (New Entities Needed)

### Pago (Payment)
```
Pago
├── IdPago (PK)
├── IdOrden (FK → OrdenCompra)
├── IdMedioPago (FK → MedioPago)
├── Monto (decimal)
├── FechaPago (DateTime)
├── Referencia (string?) — check #, transfer ref
├── Notas (string?)
├── IdUsuarioRegistra (FK → Usuario)
├── FechaCreacion (DateTime)
└── Archivos (via Archivo entity, EntidadTipo="PAGO")
```

### Comprobante (Expense Verification)
```
Comprobante
├── IdComprobante (PK)
├── IdOrden (FK → OrdenCompra)
├── TipoComprobante (enum: CFDI, NoDeducible, DepositoBancario)
├── Monto (decimal)
├── FechaComprobante (DateTime)
├── Estatus (enum: Pendiente, Validado, Rechazado)
├── MotivoRechazo (string?)
├── IdUsuarioSube (FK → Usuario)
├── IdUsuarioValida (FK → Usuario, CxP)
├── FechaCreacion (DateTime)
├── FechaValidacion (DateTime?)
│
├── [CFDI-specific fields]
│   ├── UUID (string, UNIQUE)
│   ├── RfcEmisor (string)
│   ├── RfcReceptor (string)
│   ├── SubtotalXml (decimal)
│   ├── TotalIvaXml (decimal)
│   ├── TotalRetencionesXml (decimal)
│   ├── TotalXml (decimal)
│   ├── FechaEmisionXml (DateTime)
│   ├── UsoCFDI (string)
│   ├── RegimenFiscalEmisor (string)
│   ├── XmlOriginal (string/text — store full XML for audit)
│   └── ConceptosJson (string? — serialized conceptos for display)
│
└── Archivos (via Archivo entity, EntidadTipo="COMPROBANTE")
    ├── XML file (for CFDI type)
    ├── Image/PDF (for NoDeducible type)
    └── Image/PDF (for DepositoBancario type)
```

### ComprobacionSummary (Computed/View, not persisted)
```
Per OrdenCompra:
├── TotalXMLs = SUM(Comprobante.Monto WHERE TipoComprobante = CFDI AND Estatus = Validado)
├── TotalNoDeducibles = SUM(Comprobante.Monto WHERE TipoComprobante = NoDeducible AND Estatus = Validado)
├── TotalDepositoBancario = SUM(Comprobante.Monto WHERE TipoComprobante = DepositoBancario)
├── GranTotal = TotalXMLs + TotalNoDeducibles + TotalDepositoBancario
├── TotalOC = OrdenCompra.Total
├── Saldo = TotalOC - GranTotal
└── ComprobacionCompleta = GranTotal >= TotalOC
```

---

## Sources

- **Internal specs:** `lefarma.docs/Documentacion/specs.md` — Detailed business requirements (632 lines)
- **Existing codebase analysis:** All entity files in `Domain/Entities/`, workflow engine, notification system, file upload system
- **PROJECT.md:** Validated and active requirements, constraints, key decisions
- **SAT CFDI 4.0:** Anexo 20 of SAT Resolucion Miscelnea Fiscal — CFDI 4.0 XML schema structure
- **SAT Catalogs:** c_FormaPago, c_MetodoPago, c_UsoCFDI, c_RegimenFiscal, c_ClaveProdServ
- **Mexican AP best practices:** Standard CxP processes for Mexican mid-market enterprises (multi-company pharmaceutical distribution)

---
*Feature research for: Lefarma CxP — Cuentas por Pagar*
*Researched: 2026-03-30*
