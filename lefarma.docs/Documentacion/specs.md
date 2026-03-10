# Especificaciones del Sistema de Ordenes de Compra
## Grupo Lefarma - Cuentas por Pagar

**Version:** 1.0  
**Fecha:** Marzo 2026  
**Documento base:** requerimientos.docx

---

## 1. Resumen del Sistema

Sistema web para la gestion del proceso de ordenes de compra y cuentas por pagar de Grupo Lefarma, incluyendo flujo de autorizaciones, comprobacion de gastos y conciliacion de pagos.

---

## 2. Empresas del Grupo

| # | Empresa | Sucursales |
|---|---------|------------|
| 1 | Asokam | Antonio Maura, Cedis, Guadalajara |
| 2 | Lefarma | Planta, Mancera |
| 3 | Artricenter | Viaducto, La Raza, Atizapan |
| 4 | Construmedika | - |
| 5 | GrupoLefarma (Corporativo) | - |

---

## 3. Flujo de Autorizaciones

```
┌─────────────────┐
│   CAPTURISTA    │  Crea orden de compra
│   (Solicitante) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    FIRMA 2      │  Gerente General de Empresa (x sucursal)
│                 │  - Lefarma GDL: Martha Anaya
│                 │  - Lefarma CDMX: Alfredo Corona
└────────┬────────┘
         │ Si autoriza
         ▼
┌─────────────────┐
│    FIRMA 3      │  Polo (CxP) - Revisa formato, soportes, tiempos
│                 │  Asigna: Centro de costo + Cuenta contable
└────────┬────────┘
         │ Si autoriza
         ▼
┌─────────────────┐
│    FIRMA 4      │  Gerente de Administracion y Finanzas
│                 │  Check: Requiere comprobacion de pago/gasto
└────────┬────────┘
         │ Si autoriza
         ▼
┌─────────────────┐
│    FIRMA 5      │  Direccion Corporativa (Lic. Hector Velez Rivera)
│                 │  Autorizacion final
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    TESORERIA    │  Realiza pago
│                 │  Sube comprobante de deposito
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   COMPROBACION  │  Usuario sube XML/PDF o comprobantes
│                 │  CxP valida y cierra ciclo
└─────────────────┘
```

---

## 4. Modulo: Captura de Orden de Compra

### 4.1 Datos Generales

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| Empresa | Select | Si | Asokam, Lefarma, Artricenter, Construmedika, GrupoLefarma |
| Sucursal | Select | Si | Segun empresa seleccionada |
| Area | Select | Si | Solicitar a RH |
| Tipo de gasto | Select | Si | Catalogo pendiente por definir |
| Fecha limite de pago | Date | Si | - |
| Fecha de solicitud | Date | Auto | La toma el sistema |
| Elaborado por | Text | Auto | Usuario logueado |

### 4.2 Datos del Proveedor

| Campo | Tipo | Requerido | Notas |
|-------|------|-----------|-------|
| Sin datos fiscales | Check | No | Si marcado, desactiva RFC, CP, Regimen |
| Razon social / Nombre | Text | Si | - |
| RFC | Text | Condicional | Desactivado si "sin datos fiscales" |
| Codigo postal | Text | Condicional | Desactivado si "sin datos fiscales" |
| Regimen fiscal | Select | Condicional | Desactivado si "sin datos fiscales" |
| Persona de contacto | Text | No | Nombre, telefono, email |
| Nota forma de pago | Text | No | Ej: "50% anticipo" |
| Notas generales | Text | No | - |

**Nota:** El proveedor solo se registra en el catalogo si CxP autoriza.

### 4.3 Partidas (Detalle de Compra)

| Campo | Tipo | Requerido | Default |
|-------|------|-----------|---------|
| Descripcion del producto | Text | Si | - |
| Cantidad | Decimal(2) | Si | - |
| Unidad de medida | Select | Si | Piezas, Servicio, Kilos, Litros, Metros |
| Precio unitario | Decimal(2) | Si | - |
| Descuento total | Decimal(2) | No | 0 |
| % IVA | Decimal(2) | No | 16 |
| Retenciones totales | Decimal(2) | No | 0 |
| Otros impuestos totales | Decimal(2) | No | 0 |
| Deducible | Check | No | Si (entregan factura) |

**Formula de Total:**
```
Total = ((Precio unitario * Cantidad) - Descuento) * (1 + IVA/100) - Retenciones + OtrosImpuestos
```

**Reglas:**
- Minimo 1 partida obligatoria
- Se pueden agregar N partidas

### 4.4 Forma de Pago

| Opcion | Descripcion |
|--------|-------------|
| Pago a contado | Pago total al momento |
| Pago a credito | Pago diferido segun acuerdo con proveedor |
| Pago parcial | Anticipo + saldo pendiente |

### 4.5 Documentos Adjuntos

- Hasta 4 cotizaciones (PDF, Excel, Word)
- Opcionales

### 4.6 Al Guardar

- Generar folio automatico consecutivo irrepetible

---

## 5. Modulo: Autorizaciones

### 5.1 Firma 2 - Gerente General de Empresa

**Asignacion por sucursal:**
- Lefarma Guadalajara: Martha Anaya
- Lefarma CDMX: Alfredo Corona
- (Otros por definir)

**Acciones:**
| Accion | Resultado |
|--------|-----------|
| Autoriza | Pasa a Firma 3 |
| Rechaza | Avisa al usuario (motivo obligatorio) |

### 5.2 Firma 3 - CxP (Polo)

**Responsabilidades:**
- Revisar formato
- Verificar soportes documentales
- Verificar tiempos calendario
- Asignar centro de costo (obligatorio)
- Asignar cuenta contable (obligatorio)

**Acciones:**
| Accion | Resultado |
|--------|-----------|
| Autoriza | Pasa a Firma 4 |
| Rechaza | Avisa a usuario + jefe (motivo obligatorio) |

### 5.3 Firma 4 - Gerente Admon y Finanzas

**Checks adicionales:**
| Check | Default |
|-------|---------|
| Requiere comprobacion de pago | Marcado |
| Requiere comprobacion de gasto | Marcado |

**Acciones:**
| Accion | Resultado |
|--------|-----------|
| Autoriza | Pasa a Firma 5 |
| Rechaza | Avisa a los 3 anteriores (motivo obligatorio) |

### 5.4 Firma 5 - Direccion Corporativa

**Acciones:**
| Accion | Resultado |
|--------|-----------|
| Autoriza | Avisa a usuario + gerente + persona que paga |
| Rechaza | Avisa a los 4 anteriores (motivo obligatorio) |

---

## 6. Modulo: Tesoreria (Pagos)

### 6.1 Notificaciones

- Correo diario con pagos pendientes autorizados por Direccion
- Solo si tiene marcado "Requiere comprobacion de pago"
- Reporte consultable bajo demanda

### 6.2 Proceso de Pago

1. Recibir orden autorizada
2. Programar pago segun acuerdo con proveedor
3. Realizar pago
4. Subir comprobante de deposito (imagen)
5. Capturar importe pagado
6. Avisar al usuario que genero el gasto

**Reglas:**
- Puede hacer multiples pagos hasta completar
- Cada pago notifica al usuario

---

## 7. Modulo: Comprobacion de Gastos

### 7.1 Tipos de Comprobante

| Tipo | Descripcion | Importe |
|------|-------------|---------|
| XML/PDF (CFDI) | Factura electronica | Se extrae automatico del XML |
| No deducible | Tickets, recibos | Se captura manual + imagen |
| Deposito bancario | Ficha de deposito | Se captura manual |

### 7.2 Reglas de Comprobacion

- Se pueden subir multiples comprobantes hasta llegar al importe
- Se permite exceder el importe de la solicitud original
- **No se permite** capturar menos del importe

**Formula del Gran Total:**
```
Gran Total = Suma(XMLs) + Suma(No deducibles) + Deposito bancario
```

### 7.3 Validacion CxP

| Accion | Resultado |
|--------|-----------|
| Valida | Ciclo cerrado |
| Rechaza | Notifica usuario para corregir |

---

## 8. Reportes

### 8.1 Comprobaciones Pendientes

Filtros:
- De pago
- De comprobar

### 8.2 Comprobaciones Liberadas

Filtros:
- Empresa
- Sucursal
- Fechas
- Usuario
- Tipo de gasto

---

## 9. Catalogos Requeridos

### 9.1 Catalogos Pendientes de Definir

| Catalogo | Responsable | Autoriza |
|----------|-------------|----------|
| Tipos de gasto | Polo | Gerencia Admon |
| Cuentas contables | Polo | Gerencia Admon |
| Centros de costo | Polo | Gerencia Admon |
| Areas | RH | - |
| Sucursales | Diego | - |

---

## 10. Alertas y Notificaciones

### 10.1 Alertas por Correo

| Evento | Destinatarios |
|--------|---------------|
| Nueva orden creada | Gerente de area (Firma 2) |
| Orden autorizada (cada nivel) | Siguiente firmante |
| Orden rechazada | Usuario + firmantes anteriores |
| Pago realizado | Usuario que genero el gasto |
| Pago pendiente (diario) | Persona que debe pagar |
| Comprobacion subida | CxP |
| Comprobacion validada/rechazada | Usuario |

### 10.2 Sistema de Alertas

- Considerar alertas para la persona que debe pagar
- Excepto si esta marcado "No requiere comprobacion de pago"

---

## 11. Reglas de Negocio Futuras

### 11.1 Bloqueo de Captura (Fase 2)

- Bloquear nuevas solicitudes si:
  - Usuario tiene mas de X comprobaciones pendientes
  - Usuario tiene al menos 1 comprobacion con mas de Y dias sin comprobar

---

## 12. Roles del Sistema

| Rol | Descripcion |
|-----|-------------|
| Capturista/Solicitante | Crea ordenes de compra |
| Gerente de Area | Firma 2 - Autorizacion inicial |
| CxP (Polo) | Firma 3 - Revision y asignacion contable |
| Gerente Admon/Finanzas | Firma 4 - Revision financiera |
| Direccion Corporativa | Firma 5 - Autorizacion final |
| Tesoreria | Realiza pagos |
| Auxiliar de pagos | Apoyo en conciliaciones |

---

## 13. Documentos de Referencia

| Codigo | Documento |
|--------|-----------|
| LEF-AYF-DDP-002 | Diagrama del proceso de cuentas por pagar |
| LEF-AYF-MGP-002 | Mapa general del proceso de cuentas por pagar |

---

## 14. Responsables del Proceso

| Puesto | Nombre |
|--------|--------|
| Analista de Metodos y Procedimientos | ING. Javier Vazquez Martinez |
| Analista de cuentas por pagar | CP. Marco Polo Narvaez Oropeza |
| Gerente de Administracion y Finanzas | CP. Diego Angel Villaseñor Garduño |
| Gerente de calidad | QFB. Daniel Gasca |
| Director corporativo | Lic. Hector Velez Rivera |

---

## 15. Empresas del Proceso

1. Construmedika
2. Artricenter
3. Lefarma
4. Asokam
5. Corporativo
6. Consolidado

---

**Documento generado:** Marzo 2026  
**Fuente:** requerimientos.docx, LEF-AYF-DDP-002, LEF-AYF-MGP-002
