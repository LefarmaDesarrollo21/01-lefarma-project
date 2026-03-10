# Entities - Backend Documentation

## Índice

- [Área](#área)
- [Empresa](#empresa)
- [Sucursal](#sucursal)
- [TipoGasto](#tipogasto)
- [TipoMedida](#tipomedida)
- [UnidadMedida](#unidadmedida)

---

## Área

**Archivo:** `Domain/Entities/Catalogos/Area.cs`

**Tabla:** `catalogos.areas`

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| IdArea | int | Clave primaria |
| IdEmpresa | int | FK a Empresa |
| IdSupervisorResponsable | int? | ID del supervisor (nullable) |
| Nombre | string | Nombre del área |
| NombreNormalizado | string? | Nombre en mayúsculas |
| Descripcion | string? | Descripción del área |
| DescripcionNormalizada | string? | Descripción en mayúsculas |
| Clave | string? | Clave corta del área |
| NumeroEmpleados | int | Cantidad de empleados |
| Activo | bool | Estado activo/inactivo |
| FechaCreacion | DateTime | Fecha de creación |
| FechaModificacion | DateTime? | Fecha de última modificación |

### Navegación

- `Empresa` → `Empresa?`

---

## Empresa

**Archivo:** `Domain/Entities/Catalogos/Empresa.cs`

**Tabla:** `catalogos.empresas`

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| IdEmpresa | int | Clave primaria |
| Nombre | string | Nombre comercial |
| NombreNormalizado | string? | Nombre en mayúsculas |
| Descripcion | string? | Descripción de la empresa |
| DescripcionNormalizada | string? | Descripción en mayúsculas |
| Clave | string? | Clave corta |
| RazonSocial | string? | Razón social fiscal |
| RFC | string? | Registro Federal de Contribuyentes |
| Direccion | string? | Dirección fiscal |
| Colonia | string? | Colonia |
| Ciudad | string? | Ciudad |
| Estado | string? | Estado |
| CodigoPostal | string? | Código postal |
| Telefono | string? | Teléfono de contacto |
| Email | string? | Correo electrónico |
| PaginaWeb | string? | Sitio web |
| NumeroEmpleados | int? | Cantidad de empleados |
| Activo | bool | Estado activo/inactivo |
| FechaCreacion | DateTime | Fecha de creación |
| FechaModificacion | DateTime? | Fecha de última modificación |

### Navegación

- `Sucursales` → `ICollection<Sucursal>`
- `Areas` → `ICollection<Area>`

### Métodos de Dominio

- `Activar()` - Activa la empresa
- `Desactivar()` - Desactiva la empresa
- `ActualizarNombreNormalizado()` - Normaliza el nombre a mayúsculas

---

## Sucursal

**Archivo:** `Domain/Entities/Catalogos/Sucursal.cs`

**Tabla:** `catalogos.sucursales`

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| IdSucursal | int | Clave primaria |
| IdEmpresa | int | FK a Empresa |
| Nombre | string | Nombre de la sucursal |
| NombreNormalizado | string? | Nombre en mayúsculas |
| Descripcion | string? | Descripción |
| DescripcionNormalizada | string? | Descripción en mayúsculas |
| Clave | string? | Clave corta |
| ClaveContable | string? | Clave para sistema contable |
| Direccion | string? | Dirección física |
| CodigoPostal | string? | Código postal |
| Ciudad | string? | Ciudad |
| Estado | string? | Estado |
| Telefono | string? | Teléfono |
| Latitud | decimal | Coordenada de latitud |
| Longitud | decimal | Coordenada de longitud |
| NumeroEmpleados | int | Cantidad de empleados |
| Activo | bool | Estado activo/inactivo |
| FechaCreacion | DateTime | Fecha de creación |
| FechaModificacion | DateTime? | Fecha de última modificación |

### Navegación

- `Empresa` → `Empresa?`

---

## TipoGasto

**Archivo:** `Domain/Entities/Catalogos/TipoGasto.cs`

**Tabla:** `catalogos.tipos_gasto`

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| IdTipoGasto | int | Clave primaria |
| Nombre | string | Nombre del tipo de gasto |
| NombreNormalizado | string? | Nombre en mayúsculas |
| Descripcion | string? | Descripción |
| DescripcionNormalizada | string? | Descripción en mayúsculas |
| Clave | string? | Clave corta |
| Concepto | string? | Concepto contable |
| Cuenta | string? | Cuenta contable (3 dígitos) |
| SubCuenta | string? | Subcuenta contable |
| Analitica | string? | Código analítico |
| Integracion | string? | Sistema de integración |
| CuentaCatalogo | string? | Cuenta en catálogo |
| RequiereComprobacionPago | bool | Requiere comprobante de pago |
| RequiereComprobacionGasto | bool | Requiere comprobante de gasto |
| PermiteSinDatosFiscales | bool | Permite CFDI sin datos fiscales |
| DiasLimiteComprobacion | int | Días límite para comprobar |
| Activo | bool | Estado activo/inactivo |
| FechaCreacion | DateTime | Fecha de creación |
| FechaModificacion | DateTime? | Fecha de última modificación |

---

## TipoMedida

**Archivo:** `Domain/Entities/Catalogos/TipoMedida.cs`

**Tabla:** `catalogos.tipos_medida`

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| IdTipoMedida | int | Clave primaria |
| Nombre | string | Nombre del tipo (ej: Longitud, Peso) |
| NombreNormalizado | string? | Nombre en mayúsculas |
| Descripcion | string? | Descripción |
| DescripcionNormalizada | string? | Descripción en mayúsculas |
| Activo | bool | Estado activo/inactivo |
| FechaCreacion | DateTime | Fecha de creación |
| FechaModificacion | DateTime? | Fecha de última modificación |

### Navegación

- `UnidadMedidas` → `ICollection<UnidadMedida>`

---

## UnidadMedida

**Archivo:** `Domain/Entities/Catalogos/UnidadMedida.cs`

**Tabla:** `catalogos.unidades_medida`

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| IdUnidadMedida | int | Clave primaria |
| IdTipoMedida | int | FK a TipoMedida |
| Nombre | string | Nombre de la unidad (ej: Metro) |
| NombreNormalizado | string? | Nombre en mayúsculas |
| Descripcion | string? | Descripción |
| DescripcionNormalizada | string? | Descripción en mayúsculas |
| Abreviatura | string | Abreviatura (ej: m, kg, L) |
| Activo | bool | Estado activo/inactivo |
| FechaCreacion | DateTime | Fecha de creación |
| FechaModificacion | DateTime? | Fecha de última modificación |

### Navegación

- `TipoMedida` → `TipoMedida?`

---

## Diagrama de Relaciones

```
┌─────────────┐     1:N     ┌─────────────┐
│   Empresa   │─────────────│  Sucursal   │
└─────────────┘             └─────────────┘
       │
       │ 1:N
       ▼
┌─────────────┐
│    Area     │
└─────────────┘

┌─────────────┐     1:N     ┌─────────────┐
│ TipoMedida  │─────────────│UnidadMedida │
└─────────────┘             └─────────────┘

┌─────────────┐
│ TipoGasto   │  (Independiente)
└─────────────┘
```

---

## Campos Comunes

Todas las entidades comparten estos campos:

- `Activo` (bool) - Default: true
- `FechaCreacion` (DateTime) - Default: GETDATE()
- `FechaModificacion` (DateTime?) - Nullable

## Convenciones de Nombres

- Tablas: snake_case (ej: `tipos_gasto`)
- Columnas: snake_case (ej: `nombre_normalizado`)
- Clases: PascalCase (ej: `TipoGasto`)
- Propiedades: PascalCase (ej: `NombreNormalizado`)
- Schema: `catalogos` para todas las tablas de catálogos
