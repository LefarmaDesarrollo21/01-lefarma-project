# Stack Research

**Domain:** Cuentas por Pagar — CFDI/XML Parsing, Payment Processing, Accounting Integration
**Researched:** 2026-03-30
**Confidence:** HIGH (core), MEDIUM (CFDI libraries — see rationale below)

## Executive Summary

This research covers the NEW libraries and patterns needed for the CxP module on top of the existing .NET 10 + React 19 system. The existing stack (ErrorOr, FluentValidation, EF Core 10, SQL Server, MailKit, Serilog, Handlebars) is solid and fully reused — no changes needed.

The CFDI parsing space in .NET is fragmented with small, single-maintainer libraries. For Lefarma's use case (READING supplier invoices, not issuing them), a **custom XML parser using built-in `System.Xml.Linq`** is the safest long-term bet, with optional typed classes from `CFDI40` for complex scenarios.

Payment scheduling, accounting journal entries, and bank reconciliation are **domain modeling problems**, not library problems. No external packages needed — just well-designed entities and services following the existing `ErrorOr<T>` + `IStepHandler` patterns.

---

## Recommended Stack

### Core Technologies (NEW additions to existing stack)

| Technology | Version | Purpose | Confidence | Why Recommended |
|------------|---------|---------|------------|-----------------|
| `System.Xml.Linq` (built-in) | net10.0 | CFDI 4.0 XML parsing — extract UUID, RFC, amounts, taxes, complementos | **HIGH** | Zero dependencies. CFDI XML is well-documented by SAT. Full control over extraction logic. No risk of abandoned third-party lib. Already included in .NET 10 BCL. |
| `System.Xml.XPath` (built-in) | net10.0 | XPath queries for navigating complex CFDI XML nodes (complementos, impuestos) | **HIGH** | Built-in, no dependency. XPath is the natural way to query CFDI's deeply nested structure (Comprobante > Conceptos > Concepto > Impuestos > Traslados). |
| `CsvHelper` | 33.1.0 | Bank statement CSV import, CSV report export (polizas contables) | **HIGH** | Industry standard. 500M+ downloads. NetStandard 2.0 (compatible with net10.0). Battle-tested for financial CSV parsing with culture-aware decimal/date handling. Essential for Mexican bank statement formats (Bancomer, Banamex, Santander export CSV). |
| `ClosedXML` | 0.105.0 | Excel report generation (polizas, aging reports, payment summaries) and Excel bank statement import | **HIGH** | 20M+ downloads. No Excel installation needed. Most intuitive API for .xlsx manipulation. Used by nopCommerce, ABP, and enterprise apps. NetStandard 2.0 compatible with net10.0. |
| `QuestPDF` | 2026.2.4 | PDF generation for payment receipts, poliza documents, accounting reports | **HIGH** | Modern fluent API. Free under $1M revenue (Lefarma qualifies). No HTML-to-PDF hacks. Supports net10.0 natively. Source-available on GitHub. Much better than iTextSharp for new projects. |

### Supporting Libraries (optional / future phases)

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| `CFDI40` | 1.0.0 | Typed CFDI 4.0 classes generated from SAT XSD schemas | If custom XML parsing gets too complex for complementos (Carta Porte, Pagos 2.0). Provides `Comprobante` class with all SAT-defined properties. | **MEDIUM** — single maintainer (CERAND/Marco Cervantes), last updated Jan 2022, but XSD classes don't change often. |
| `tagcode.ReadCFDI` | 2.8.3.315 | Pre-built CFDI 3.3 and 4.0 reader with complemento support | If you want a ready-made parser instead of writing custom XPath. Supports Pagos 2.0, Carta Porte 3.1, Nómina 1.2. | **MEDIUM** — commercial product by tagcodemx. NetStandard 2.0. 2.9K downloads (low community). Last updated Mar 2023. |
| `tagcode.BuildCFDI` | 4.7.5.212 | Build and sign CFDI 4.0 XML | **NOT NEEDED** — Lefarma receives CFDI from suppliers, doesn't issue them. Only relevant if they start issuing invoices in future. | N/A for v1 |
| `MiniExcel` | 1.43.0 | Low-memory Excel import for very large bank statement files | Only if bank statements exceed 100K rows and ClosedXML causes memory pressure. Stream-based, <400KB library. | **HIGH** as backup |
| `ZXing.Net` | latest | QR/barcode generation for payment reference numbers | If payment receipts need scannable reference codes. | **MEDIUM** |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| SAT CFDI Validation Service | Verify CFDI UUID validity against SAT database | Free public API at `verificacfdi.facturaelectronica.sat.gob.mx`. HTTP GET with RFC emisor, RFC receptor, total, UUID. Phase 2 (out of scope for v1). |
| XSD schemas from SAT | Reference schemas for CFDI 4.0 structure | Download from `sat.gob.mx` — use as documentation reference, not runtime dependency. |

---

## Installation

```bash
# Core (add to Lefarma.API.csproj)
dotnet add package CsvHelper --version 33.1.0
dotnet add package ClosedXML --version 0.105.0
dotnet add package QuestPDF --version 2026.2.4

# No installation needed (built-in .NET 10):
# System.Xml.Linq      — already in BCL
# System.Xml.XPath     — already in BCL
# System.Xml.Schema    — for XSD validation if needed (Phase 2)

# Optional — only if custom parser proves insufficient:
dotnet add package CFDI40 --version 1.0.0

# QuestPDF license configuration (in Program.cs):
# QuestPDF.Settings.License = LicenseType.Community;
# (Free for orgs under $1M revenue)
```

---

## Architecture Decisions by Module

### 1. CFDI/XML Parsing — Custom XPath Parser

**WHY custom over libraries:**

The CFDI NuGet ecosystem is dominated by libraries designed for CFDI **issuance** (timbrado, sellado, facturacion). Lefarma needs the opposite: **reading** supplier invoices and extracting data. Here's the landscape:

| Package | Downloads | Purpose | Last Updated | Issue |
|---------|-----------|---------|--------------|-------|
| `CFDI40` | 8K | XSD-generated classes | Jan 2022 | Single maintainer. Designed for building, not reading. Classes are fine but incomplete for reading. |
| `tagcode.ReadCFDI` | 2.9K | Read CFDI fields/nodes | Mar 2023 | Commercial. Low adoption. Depends on `tagcode.Core`. |
| `tagcode.BuildCFDI` | 15.7K | Build CFDI 4.0 | Feb 2025 | For ISSUING. Irrelevant for reading. |
| `APICERAND.CFDI.TRANSFORMADORES` | 9.3K | XSLT cadena original | Jun 2022 | For cadena original generation, not reading. |

**The pattern to use:**

```csharp
// Features/CuentasPorPagar/Comprobacion/Services/CfdiParserService.cs
public class CfdiParserService : ICfdiParserService
{
    public ErrorOr<CfdiData> ParseXmlAsync(Stream xmlStream, CancellationToken ct)
    {
        var doc = XDocument.Load(xmlStream);
        
        // CFDI 4.0 namespace
        var ns = new XmlNamespaceManager(new NameTable());
        ns.AddNamespace("cfdi", "http://www.sat.gob.mx/cfd/4");
        ns.AddNamespace("tfd", "http://www.sat.gob.mx/TimbreFiscalDigital");
        
        var comprobante = doc.Root!;
        
        return new CfdiData
        {
            Version = comprobante.Attribute("Version")?.Value,
            UUID = comprobante.XPathSelectElement("//tfd:TimbreFiscalDigital", ns)?
                      .Attribute("UUID")?.Value ?? string.Empty,
            RfcEmisor = comprobante.XPathSelectElement("//cfdi:Emisor", ns)?
                           .Attribute("Rfc")?.Value ?? string.Empty,
            RfcReceptor = comprobante.XPathSelectElement("//cfdi:Receptor", ns)?
                            .Attribute("Rfc")?.Value ?? string.Empty,
            SubTotal = decimal.Parse(comprobante.Attribute("SubTotal")?.Value ?? "0"),
            Total = decimal.Parse(comprobante.Attribute("Total")?.Value ?? "0"),
            IVA = ExtractImpuestos(comprobante, ns, "002"),  // 002 = IVA
            Retenciones = ExtractImpuestos(comprobante, ns, "001"), // 001 = ISR
            Fecha = DateTime.Parse(comprobante.Attribute("Fecha")?.Value ?? ""),
            Moneda = comprobante.Attribute("Moneda")?.Value ?? "MXN",
            TipoComprobante = comprobante.Attribute("TipoDeComprobante")?.Value,
            MetodoPago = comprobante.Attribute("MetodoPago")?.Value,
            FormaPago = comprobante.Attribute("FormaPago")?.Value,
        };
    }
}
```

**What fields to extract from CFDI 4.0 XML:**

| Field | XPath | CFDI Node | Use in Lefarma |
|-------|-------|-----------|----------------|
| UUID | `//tfd:TimbreFiscalDigital/@UUID` | TimbreFiscalDigital | Unique key for deduplication |
| RFC Emisor | `//cfdi:Emisor/@Rfc` | Comprobante > Emisor | Match against Proveedor catalog |
| Nombre Emisor | `//cfdi:Emisor/@Nombre` | Comprobante > Emisor | Display name |
| RFC Receptor | `//cfdi:Receptor/@Rfc` | Comprobante > Receptor | Validate against company RFC |
| SubTotal | `/cfdi:Comprobante/@SubTotal` | Comprobante | Pre-tax amount |
| Total Impuestos Trasladados | `//cfdi:Impuestos/@TotalImpuestosTrasladados` | Impuestos | IVA amount |
| Total Impuestos Retenidos | `//cfdi:Impuestos/@TotalImpuestosRetenidos` | Impuestos | ISR/IVA retenido |
| Total | `/cfdi:Comprobante/@Total` | Comprobante | Grand total (match against OC Total) |
| Fecha | `/cfdi:Comprobante/@Fecha` | Comprobante | Invoice date |
| Moneda | `/cfdi:Comprobante/@Moneda` | Comprobante | Currency (MXN, USD) |
| Tipo de Comprobante | `/cfdi:Comprobante/@TipoDeComprobante` | Comprobante | I=Ingreso, E=Egreso, N=Nómina, P=Pago |
| Metodo Pago | `/cfdi:Comprobante/@MetodoPago` | Comprobante | PUE=Single payment, PPD=Deferred |
| Uso CFDI | `//cfdi:Receptor/@UsoCFDI` | Receptor | G01-G03 for deducibility |

### 2. Payment Processing — Domain-Driven Design

**No library needed.** This is pure entity + service design:

```
Domain/Entities/CuentasPorPagar/
├── Pago.cs                    — Individual payment (partial or total)
├── ProgramacionPago.cs        — Scheduled payment with date/amount
├── ComprobanteGasto.cs        — CFDI + non-deductible receipt
├── ComprobantePago.cs         — Bank deposit proof
└── PolizaContable.cs          — Accounting journal entry

Features/CuentasPorPagar/
├── Tesoreria/
│   ├── TesoreriaHandler.cs    — IStepHandler for "EnTesoreria" step
│   ├── ITesoreriaService.cs
│   ├── TesoreriaService.cs    — Payment scheduling + execution
│   ├── DTOs/
│   └── Validator.cs
├── Comprobacion/
│   ├── ComprobacionHandler.cs — IStepHandler for "EnComprobacion" step
│   ├── CfdiParserService.cs   — XML parsing (see above)
│   ├── IComprobacionService.cs
│   ├── ComprobacionService.cs — Expense verification logic
│   ├── DTOs/
│   └── Validators/
└── Contabilidad/
    ├── PolizaGenerator.cs     — Auto-generates polizas from events
    ├── BancoConciliacion.cs   — Bank statement import + matching
    ├── Reportes/              — Export services
    └── DTOs/
```

**Key Entity: Pago**

```csharp
public class Pago
{
    public int IdPago { get; set; }
    public int IdOrden { get; set; }
    public int IdMedioPago { get; set; }      // Transfer, Check, Cash
    public int IdBanco { get; set; }
    public string? ReferenciaPago { get; set; } // Bank reference number
    public string? CuentaOrigen { get; set; }
    public string? CuentaDestino { get; set; }
    
    public decimal MontoPago { get; set; }
    public DateTime FechaPago { get; set; }
    public DateTime? FechaProgramada { get; set; }
    
    public EstatusPago Estatus { get; set; }  // Programado, Pagado, Cancelado
    public string? ComprobanteDeposito { get; set; } // File path
    
    public DateTime FechaCreacion { get; set; }
    public int IdUsuarioPago { get; set; }     // Tesoreria user who executed
    
    // Navigation
    public virtual OrdenCompra Orden { get; set; } = null!;
}
```

**Key Entity: PolizaContable**

```csharp
public class PolizaContable
{
    public int IdPoliza { get; set; }
    public string NumeroPoliza { get; set; }    // Auto-generated
    public int IdEmpresa { get; set; }
    public int IdSucursal { get; set; }
    public int? IdOrden { get; set; }           // Source OC
    public int? IdPago { get; set; }            // Source payment
    
    public TipoPoliza Tipo { get; set; }        // Ingreso, Egreso, Diario
    public string Concepto { get; set; } = null!;
    public DateTime Fecha { get; set; }
    public decimal TotalDebe { get; set; }      // Sum of debits
    public decimal TotalHaber { get; set; }     // Sum of credits
    
    public DateTime FechaCreacion { get; set; }
    public bool Exportada { get; set; }         // Flag for external system
    
    public virtual ICollection<MovimientoPoliza> Movimientos { get; set; } = [];
}

public class MovimientoPoliza
{
    public int IdMovimiento { get; set; }
    public int IdPoliza { get; set; }
    public string CuentaContable { get; set; } = null!; // "ATC-103-101-601-001"
    public int? IdCentroCosto { get; set; }
    public decimal Debe { get; set; }           // Debit amount
    public decimal Haber { get; set; }          // Credit amount
    public string? Referencia { get; set; }     // Folio OC or payment ref
    public string? Concepto { get; set; }
}
```

### 3. Bank Statement Import/Reconciliation Pattern

**Two import formats to support:**

1. **CSV** (most Mexican banks: BBVA, Santander, Banorte, Citibanamex) → `CsvHelper`
2. **XLSX** (some banks and accounting systems) → `ClosedXML`

**Pattern:**

```csharp
public interface IEstadoCuentaParser
{
    string FormatoSoportado { get; } // "BBVA-CSV", "Santander-CSV", etc.
    ErrorOr<List<MovimientoBancario>> ParseAsync(Stream file, CancellationToken ct);
}

public class MovimientoBancario
{
    public DateTime Fecha { get; set; }
    public DateTime? FechaConciliacion { get; set; }
    public string? Referencia { get; set; }
    public string Descripcion { get; set; } = null!;
    public decimal Cargo { get; set; }       // Debit (money out)
    public decimal Abono { get; set; }        // Credit (money in)
    public decimal Saldo { get; set; }
}
```

**Conciliation matching rules:**
- Match by: Reference number + Amount + Date (within tolerance)
- Unmatched items flagged for manual review
- Support for N:1 matching (multiple payments to one bank movement)

### 4. Accounting Journal Entry (Poliza) Generation

**Automatic poliza generation triggers:**

| Event | Debit Account | Credit Account | Amount |
|-------|--------------|----------------|--------|
| Payment executed | CxP (proveedor) | Banco | Payment total |
| Expense verified (CFDI) | Gasto (601-604) | CxP (proveedor) | CFDI SubTotal |
| IVA from CFDI | IVA Acreditable | CxP (proveedor) | IVA amount |
| ISR Retention | CxP (proveedor) | ISR por Pagar | Retention amount |
| Non-deductible expense | Gasto No Deducible | CxP/Efectivo | Manual amount |

**Export format:** CSV layout compatible with external accounting system (Contpaq, AdminPAQ, or SAP). The layout is configurable per company.

```csharp
// Export format example (Contpaq-compatible CSV):
// TipoPoliza, Numero, Fecha, Cuenta, CentroCosto, Debe, Haber, Referencia, Concepto
// Egreso, P-2026-00001, 2026-03-30, ATC-103-101-601-001, 101, 15000.00, 0, OC-2026-00015, Pago proveedor XYZ
// Egreso, P-2026-00001, 2026-03-30, ATC-103-101-102-001, 102, 0, 15000.00, OC-2026-00015, Pago proveedor XYZ
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Custom XPath parser (`System.Xml.Linq`) | `CFDI40` NuGet package | If complemento parsing gets complex (Carta Porte, Comercio Exterior, Pago en Especie). CFDI40 gives typed classes from XSD. Trade-off: 3rd-party dependency vs. type safety. |
| Custom XPath parser | `tagcode.ReadCFDI` | If you want a pre-built reader with complemento support out of the box. Trade-off: commercial dependency, low community, last updated 2023. |
| `CsvHelper` 33.1.0 | Custom CSV parser | NEVER. CsvHelper handles edge cases (quoted fields, escaped delimiters, culture-specific decimals) that bite you in financial data. 500M downloads for a reason. |
| `ClosedXML` 0.105.0 | `MiniExcel` 1.43.0 | Use MiniExcel if importing massive Excel files (>100K rows). ClosedXML loads entire file into memory. MiniExcel streams. For reports (writing), ClosedXML has better API. |
| `ClosedXML` 0.105.0 | `EPPlus` 8.5.1 | EPPlus requires a commercial license (Polyform Noncommercial 1.0.0 for free tier). ClosedXML is MIT-licensed. For a commercial pharmaceutical company, ClosedXML avoids license compliance risk. |
| `QuestPDF` 2026.2.4 | iTextSharp/iText7 | iText has aggressive AGPL licensing. QuestPDF is community-licensed for <$1M revenue, source-available, modern fluent API. |
| `QuestPDF` 2026.2.4 | Rotativa / Puppeteer Sharp (HTML-to-PDF) | Only if team insists on HTML-based layouts. QuestPDF's fluent C# API is cleaner for structured financial documents. |
| Domain entities for payments | Hangfire / Quartz.NET for scheduling | If payment scheduling needs background jobs with retry/recovery. For v1, simple date-based queries are sufficient. Can add Hangfire in Phase 2 if needed. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `EPPlus` 8.x | Polyform Noncommercial license is restrictive. Commercial use requires paid license. Lefarma is a commercial enterprise. | `ClosedXML` (MIT license, no restrictions) |
| `tagcode.BuildCFDI` | Designed for CFDI issuance (timbrado). Lefarma reads CFDI from suppliers, doesn't issue them. | Custom XPath parser for reading |
| `SW-sdk-45` | Targets .NET Framework 4.5. Incompatible with .NET 10. Solicta web service SDK, not a parser. | N/A |
| `iTextSharp` / `iText7` | AGPL license is viral — requires open-sourcing your entire application, or purchasing a expensive commercial license. | `QuestPDF` (Community license for <$1M) |
| `Microsoft.Interop.Excel` | Requires Excel installed on server. 3+ hours for 100K rows. Never use on servers. | `ClosedXML` or `MiniExcel` |
| Hardcoded 5 signature levels | PROJECT.md explicitly says "NO hardcodear 5 firmas". Levels vary by amount/type/empresa. | Existing `WorkflowEngine` with conditions |
| Newtonsoft.Json for XML parsing | Don't use JSON tools for XML. CFDI has namespaces, attributes, nested schemas. | `System.Xml.Linq.XDocument` + XPath |
| SAT CFDI validation service (v1) | Out of scope per PROJECT.md: "validacion CFDI en v2". | Manual validation by CxP in v1 |

---

## Stack Patterns by Variant

**If importing bank statements from BBVA Mexico (CSV):**
- Use `CsvHelper` with custom class map
- BBVA format: `Fecha, Referencia, Descripcion, Cargo, Abono, Saldo`
- Configure `CultureInfo` to `es-MX` for decimal parsing (comma as thousands separator)

**If importing bank statements from Santander (XLSX):**
- Use `ClosedXML` to read `.xlsx`
- Map columns to `MovimientoBancario` entity
- Note: Santander exports with header rows that need skipping

**If external accounting system is Contpaq:**
- Export polizas as CSV with Contpaq-specific layout
- Each poliza = 2+ rows (debit + credit movements)
- Encoding: Windows-1252 (Contpaq doesn't handle UTF-8 well)

**If external accounting system is SAP:**
- Export as BAPI_ACC_DOCUMENT_POST compatible IDoc
- Or use SAP .NET Connector (separate license)

**If Lefarma starts ISSUING CFDI (future phase):**
- Use `tagcode.BuildCFDI` 4.7.5.212 for XML construction
- Need PAC (Proveedor Autorizado de Certificacion) service for timbrado
- Options: SW Sapien, Facturama, CFDI Global (API-based, per-document cost)

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `CsvHelper` 33.1.0 | .NET 10.0 (via NetStandard 2.0) | Verified on NuGet. No breaking changes in 33.x. |
| `ClosedXML` 0.105.0 | .NET 10.0 (via NetStandard 2.0) | Depends on `DocumentFormat.OpenXml` 3.1.1. Compatible. |
| `QuestPDF` 2026.2.4 | .NET 10.0 (native target!) | Explicitly targets net10.0. Zero dependencies on that TFM. |
| `CFDI40` 1.0.0 | .NET 10.0 (via net5.0) | Generated classes, no runtime behavior. Safe. |
| `MiniExcel` 1.43.0 | .NET 10.0 (native target!) | Explicitly targets net10.0. Zero dependencies on that TFM. |
| All packages + EF Core 10.0.2 | Compatible | No conflicts. All use standard BCL types. |

---

## Frontend Considerations

No new frontend dependencies needed for v1. The existing stack handles everything:

| Need | Existing Tool | Notes |
|------|---------------|-------|
| Payment forms | React Hook Form + Zod | Same pattern as OC capture forms |
| Payment table | TanStack Table | Same DataTable with filterConfig pattern |
| File upload (CFDI XML, deposit receipts) | Existing FileUploader component | `entidadTipo/entidadId` pattern already works |
| CxP validation UI | Same as AutorizacionesOC.tsx | Master-detail with timeline |
| Reports | TanStack Table + export buttons | Backend generates Excel/PDF, frontend downloads |
| Dashboard | Recharts (already installed) | Charts for aging, pending payments |

**Future consideration:** If PDF viewing is needed in-browser (viewing payment receipts), use `<iframe>` or browser's built-in PDF viewer. No React PDF library needed.

---

## Sources

- **NuGet.org** — Verified versions for: CsvHelper 33.1.0, ClosedXML 0.105.0, QuestPDF 2026.2.4, MiniExcel 1.43.0, CFDI40 1.0.0, tagcode.ReadCFDI 2.8.3.315, tagcode.BuildCFDI 4.7.5.212, EPPlus 8.5.1
- **NuGet.org search** — Queried "cfdi 4.0" sorted by relevance, reviewed top 20 packages
- **Project codebase** — Verified existing patterns: IStepHandler, WorkflowEngine, EstadoOC enum, OrdenCompra entity, FileUploader, NotificationService
- **AGENTS.md** — Existing conventions: ErrorOr<T>, FluentValidation, ApiResponse<T>, Spanish validation messages
- **SAT (Servicio de Administracion Tributaria)** — CFDI 4.0 specification, XSD schemas, TimbreFiscalDigital namespace
- **QuestPDF docs** — License model verified: free for organizations under $1M revenue
- **EPPlus license** — Polyform Noncommercial 1.0.0 confirmed restrictive for commercial use

---
*Stack research for: Cuentas por Pagar module (CFDI parsing, payment processing, accounting integration)*
*Researched: 2026-03-30*
