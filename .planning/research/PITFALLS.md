# Research: Pitfalls — Lefarma CxP

**Dimension:** Pitfalls
**Date:** 2026-03-30
**Confidence:** High (domain-specific, codebase-informed)

## Critical Pitfalls

### PIT-01: Precision loss en calculos financieros
**Severity:** CRITICAL
**Phase:** Phase A (entities), Phase C (payments), Phase D (comprobacion)

**Description:** Usar `float` o `double` en cualquier campo monetario causa errores de redondeo acumulativos. En un sistema con IVA (16%), retenciones, e impuestos, estos errores se amplifican.

**Warning signs:**
- Entity con propiedades `decimal` pero sin explicit precision en EF config
- Frontend enviando numeros como `number` sin controlar decimales
- Calculos de total en JavaScript (number es float64)

**Prevention:**
- Todos los campos monetarios en C# como `decimal` (ya es el caso en OrdenCompraPartida)
- EF Core: `.HasPrecision(18, 2)` en todas las propiedades decimal
- Frontend: Redondear a 2 decimales ANTES de enviar al backend
- Backend: `Math.Round(value, 2, MidpointRounding.AwayFromZero)` en todos los calculos

---

### PIT-02: Race condition en pagos parciales concurrentes
**Severity:** HIGH
**Phase:** Phase C (Tesoreria)

**Description:** Dos personas de Tesoreria pueden intentar registrar pago para la misma OC simultaneamente. Sin control, ambos podrian registrar $50K contra una OC de $60K, resultando en $100K pagados contra $60K autorizados.

**Warning signs:**
- No hay row-level locking en la tabla OrdenCompra
- El calculo de "saldo pendiente" se hace en memoria antes de insertar
- No hay validacion de monto disponible al momento del INSERT

**Prevention:**
- Usar optimistic concurrency: `RowVersion` en OrdenCompra (ya existe el campo)
- Calcular saldo dentro de una transaccion SQL
- Validar `Monto <= SaldoPendiente` atomicamente
- Constraint en DB: `CHECK ((SELECT SUM(Monto) FROM Pagos WHERE OrdenCompraId = @id) <= (SELECT Total FROM OrdenesCompra WHERE Id = @id))`

---

### PIT-03: CFDI XML con encoding incorrecto o estructura invalida
**Severity:** HIGH
**Phase:** Phase D (Comprobacion)

**Description:** Los CFDI XML pueden venir con encoding incorrecto (Windows-1252 vs UTF-8), namespaces faltantes, o estructura de complementos variable. Si el parser no maneja estos casos, falla silenciosamente o extrae montos incorrectos.

**Warning signs:**
- Parser asume estructura fija sin manejar namespaces variables
- No hay validacion del NodoRaiz (debe ser `cfdi:Comprobante` con version 4.0)
- No se maneja el caso de CFDI 3.3 (proveedores que no han migrado)

**Prevention:**
- Forzar UTF-8 al cargar XML: `XDocument.Load(stream, LoadOptions.None)`
- Usar XPath con namespaces explícitos: `nm.AddNamespace("cfdi", "http://www.sat.gob.mx/cfd/4")`
- Validar version antes de parsear (rechazar 3.3 con mensaje claro)
- Log del XML original cuando el parseo falle (para debugging)
- Tests con CFDI reales de diferentes proveedores

---

### PIT-04: Confusion entre Forma de Pago y Metodo de Pago (SAT)
**Severity:** MEDIUM
**Phase:** Phase A (entities), Phase C (payments)

**Description:** El SAT distingue entre:
- **Metodo de Pago**: PUE (Pago en Una Exhibicion) o PPD (Pago en Parcialidades o Diferido) — se declara en el CFDI
- **Forma de Pago**: Efectivo, Transferencia, Cheque, etc. — se declara al momento de pagar

La codebase actual tiene `FormaPago` y `MedioPago` como catalogos separados pero la relacion con SAT no esta clara.

**Warning signs:**
- Los catalogos no tienen campo `ClaveSAT` para match con catalogos oficiales
- La OC captura "forma de pago" pero no distingue si es PUE o PPD
- La comprobacion no valida que el metodo del CFDI coincida con lo pactado

**Prevention:**
- Agregar `ClaveSAT` a los catalogos existentes
- Validar al subir CFDI que el Metodo de Pago coincida con el de la OC
- Documentar claramente la distincion para el equipo

---

### PIT-05: Asignacion incorrecta de cuenta contable multi-empresa
**Severity:** HIGH
**Phase:** Phase A (entities), Phase E (integracion contable)

**Description:** Cada empresa tiene su propio catalogo contable con prefijo (ATC-, ASK-, LEF-, CON-, GRP-). Una cuenta contable asignada incorrectamente (ej: ATC-101 en una OC de ASK) genera polizas contables erroneas que son muy dificiles de corregir.

**Warning signs:**
- No hay validacion de que la cuenta contable pertenezca a la empresa de la OC
- El catalogo de cuentas no filtra por empresa activa
- La interfaz permite seleccionar cualquier cuenta sin importar contexto

**Prevention:**
- Validacion backend: CuentaContable.EmpresaId == OrdenCompra.EmpresaId
- Frontend: Filtrar dropdown de cuentas por empresa de la OC
- Constraint en DB o service layer
- Test especifico para este caso

---

### PIT-06: UUID duplicado en comprobantes
**Severity:** HIGH
**Phase:** Phase D (Comprobacion)

**Description:** El mismo CFDI (mismo UUID del SAT) puede subirse a multiples OCs por error o fraude. Sin deteccion de duplicados, el mismo gasto se contabiliza multiples veces.

**Warning signs:**
- No hay UNIQUE constraint en la tabla Comprobantes para el campo UUID
- No se verifica UUID antes de aceptar el comprobante
- El sistema permite subir el mismo XML a diferentes OCs

**Prevention:**
- `UNIQUE` constraint en columna UUID de la tabla Comprobantes
- Validacion en service: verificar UUID no existe antes de insertar
- Mensaje de error claro: "Este CFDI ya fue registrado en la OC-XXXX"
- Incluir OC de origen en el mensaje para auditoria

---

### PIT-07: Falta de trazabilidad en transiciones financieras
**Severity:** MEDIUM
**Phase:** Phase B (workflow), Phase C (payments)

**Description:** Las transiciones financieras (Autorizada → EnTesoreria → Pagada → EnComprobacion → Cerrada) deben tener bitacora completa. Si se pierde quien autorizo, cuando pago, o cuanto pago, hay un problema de auditoria grave.

**Warning signs:**
- WorkflowBitacora no captura datos financieros (monto, referencia bancaria)
- Pagos sin timestamp de cuando se realizo vs cuando se registro
- No hay snapshot del estado anterior al cambio

**Prevention:**
- Ya existe WorkflowBitacora con DatosSnapshot JSON — usarlo
- Incluir datos financieros relevantes en el snapshot de cada transicion
- Pago entity debe tener FechaPago (real) vs FechaRegistro (sistema)
- Reporte de auditoria por OC con timeline completo

---

### PIT-08: Frontend AutorizacionesOC.tsx ya en el limite de complejidad
**Severity:** MEDIUM
**Phase:** All frontend phases

**Description:** El archivo `AutorizacionesOC.tsx` tiene 825 lineas. Extenderlo con mas funcionalidad de tesoreria/comprobacion lo hace inmanejable.

**Warning signs:**
- Archivo crece por encima de 1000 lineas
- Logica de UI mezclada con logica de negocio
- Componentes no reutilizables porque todo esta inline

**Prevention:**
- NO extender AutorizacionesOC.tsx — crear paginas nuevas
- Extraer componentes compartidos: `WorkflowTimeline`, `StatusBadge`, `FirmaModal`
- Tesoreria y Comprobacion tienen sus propias paginas
- Reutilizar componentes extraidos, no el page component

---

### PIT-09: Conciliacion bancaria con formatos no estandarizados
**Severity:** MEDIUM
**Phase:** Phase E (integracion contable)

**Description:** Cada banco mexicano tiene su propio formato de estado de cuenta (SPEI layout, CSV con columnas variables, Excel con hojas multiples). Si se asume un formato unico, la conciliacion no funciona.

**Warning signs:**
- Parser asume columnas fijas
- No hay mapeo configurable banco → formato
- El monto no considera signos (cargos vs abonos)

**Prevention:**
- Empezar con el banco principal de Grupo Lefarma
- Disenar con parser pluggable: un parser por banco
- Mapeo configurable de columnas
- Tests con estados de cuenta reales de cada banco
- Marcar transacciones que no matchean ningun pago (excepciones)

---

### PIT-10: N+1 queries en reportes contables
**Severity:** LOW
**Phase:** Phase F (reportes)

**Description:** Los reportes contables cruzan OC + Partidas + Pagos + Comprobaciones + CuentasContables por empresa/sucursal/periodo. Sin queries optimizadas, un reporte de un mes puede tardar minutos.

**Warning signs:**
- Query que carga OCs y luego itera para obtener sus pagos
- Lazy loading activado para reportes
- No hay indices en columnas de fecha y estado

**Prevention:**
- Usar `AsNoTracking` (ya es convencion)
- Queries proyectadas: `Select()` con solo los campos necesarios
- Indices en: OrdenCompra(EmpresaId, SucursalId, Estado, FechaSolicitud, FechaLimitePago)
- Indices en: Pago(OrdenCompraId, FechaPago, Estatus)
- Considerar vista materializada o query dedicada para reportes

---

## Summary Table

| ID | Pitfall | Severity | Phase | Detection |
|----|---------|----------|-------|-----------|
| PIT-01 | Precision loss monetaria | CRITICAL | A,C,D | Code review decimal usage |
| PIT-02 | Race condition pagos | HIGH | C | Load testing concurrent payments |
| PIT-03 | CFDI XML encoding/estructura | HIGH | D | Tests con CFDIs reales |
| PIT-04 | Forma vs Metodo Pago SAT | MEDIUM | A,C | Review catalog SAT claves |
| PIT-05 | Cuenta contable cross-empresa | HIGH | A,E | Test: OC empresa A + cuenta empresa B |
| PIT-06 | UUID duplicado | HIGH | D | UNIQUE constraint en DB |
| PIT-07 | Trazabilidad financiera | MEDIUM | B,C | Review bitacora snapshot data |
| PIT-08 | Frontend complejidad | MEDIUM | All | File line count > 800 |
| PIT-09 | Formatos bancarios | MEDIUM | E | Tests con archivos reales |
| PIT-10 | N+1 en reportes | LOW | F | Performance test con datos voluminosos |

---
*Pitfalls researched: 2026-03-30*
