# DTOs - Backend Documentation

## Índice

- [Área DTOs](#área-dtos)
- [Empresa DTOs](#empresa-dtos)
- [Sucursal DTOs](#sucursal-dtos)
- [TipoGasto DTOs](#tipogasto-dtos)
- [TipoMedida DTOs](#tipomedida-dtos)
- [UnidadMedida DTOs](#unidadmedida-dtos)

---

## Área DTOs

**Archivo:** `Features/Catalogos/Areas/DTOs/AreaDTOs.cs`

### AreaResponse

```csharp
public class AreaResponse
{
    public int IdArea { get; set; }
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public int NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
```

### CreateAreaRequest

```csharp
public class CreateAreaRequest
{
    public int IdEmpresa { get; set; }
    public int? IdSupervisorResponsable { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public int NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
}
```

### UpdateAreaRequest

```csharp
public class UpdateAreaRequest
{
    public int IdArea { get; set; }
    public int IdEmpresa { get; set; }
    public int? IdSupervisorResponsable { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public int NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
}
```

---

## Empresa DTOs

**Archivo:** `Features/Catalogos/Empresas/DTOs/EmpresaDTOs.cs`

### EmpresaResponse

```csharp
public class EmpresaResponse
{
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? RazonSocial { get; set; }
    public string? RFC { get; set; }
    public string? Direccion { get; set; }
    public string? Colonia { get; set; }
    public string? Ciudad { get; set; }
    public string? Estado { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? PaginaWeb { get; set; }
    public int? NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
```

### CreateEmpresaRequest

```csharp
public class CreateEmpresaRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? RazonSocial { get; set; }
    public string? RFC { get; set; }
    public string? Direccion { get; set; }
    public string? Colonia { get; set; }
    public string? Ciudad { get; set; }
    public string? Estado { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? PaginaWeb { get; set; }
    public int? NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
}
```

### UpdateEmpresaRequest

```csharp
public class UpdateEmpresaRequest
{
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? RazonSocial { get; set; }
    public string? RFC { get; set; }
    public string? Direccion { get; set; }
    public string? Colonia { get; set; }
    public string? Ciudad { get; set; }
    public string? Estado { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? PaginaWeb { get; set; }
    public int? NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
}
```

---

## Sucursal DTOs

**Archivo:** `Features/Catalogos/Sucursales/DTOs/SucursalDTOs.cs`

### SucursalResponse

```csharp
public class SucursalResponse
{
    public int IdSucursal { get; set; }
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? ClaveContable { get; set; }
    public string? Direccion { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Ciudad { get; set; }
    public string? Estado { get; set; }
    public string? Telefono { get; set; }
    public decimal Latitud { get; set; }
    public decimal Longitud { get; set; }
    public int NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
```

### CreateSucursalRequest

```csharp
public class CreateSucursalRequest
{
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? ClaveContable { get; set; }
    public string? Direccion { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Ciudad { get; set; }
    public string? Estado { get; set; }
    public string? Telefono { get; set; }
    public decimal Latitud { get; set; }
    public decimal Longitud { get; set; }
    public int NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
}
```

### UpdateSucursalRequest

```csharp
public class UpdateSucursalRequest
{
    public int IdSucursal { get; set; }
    public int IdEmpresa { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? ClaveContable { get; set; }
    public string? Direccion { get; set; }
    public string? CodigoPostal { get; set; }
    public string? Ciudad { get; set; }
    public string? Estado { get; set; }
    public string? Telefono { get; set; }
    public decimal Latitud { get; set; }
    public decimal Longitud { get; set; }
    public int NumeroEmpleados { get; set; }
    public bool Activo { get; set; }
}
```

---

## TipoGasto DTOs

**Archivo:** `Features/Catalogos/TipoGastos/DTOs/TipoGastoDTOs.cs`

### TipoGastoResponse

```csharp
public class TipoGastoResponse
{
    public int IdTipoGasto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? NombreNormalizado { get; set; }
    public string? Descripcion { get; set; }
    public string? DescripcionNormalizada { get; set; }
    public string? Clave { get; set; }
    public string? Concepto { get; set; }
    public string? Cuenta { get; set; }
    public string? SubCuenta { get; set; }
    public string? Analitica { get; set; }
    public string? Integracion { get; set; }
    public string? CuentaCatalogo { get; set; }
    public bool RequiereComprobacionPago { get; set; }
    public bool RequiereComprobacionGasto { get; set; }
    public bool PermiteSinDatosFiscales { get; set; }
    public int DiasLimiteComprobacion { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
```

### CreateTipoGastoRequest

```csharp
public class CreateTipoGastoRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? Concepto { get; set; }
    public string? Cuenta { get; set; }
    public string? SubCuenta { get; set; }
    public string? Analitica { get; set; }
    public string? Integracion { get; set; }
    public bool RequiereComprobacionPago { get; set; }
    public bool RequiereComprobacionGasto { get; set; }
    public bool PermiteSinDatosFiscales { get; set; }
    public int DiasLimiteComprobacion { get; set; }
    public bool Activo { get; set; }
}
```

### UpdateTipoGastoRequest

```csharp
public class UpdateTipoGastoRequest
{
    public int IdTipoGasto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Clave { get; set; }
    public string? Concepto { get; set; }
    public string? Cuenta { get; set; }
    public string? SubCuenta { get; set; }
    public string? Analitica { get; set; }
    public string? Integracion { get; set; }
    public bool RequiereComprobacionPago { get; set; }
    public bool RequiereComprobacionGasto { get; set; }
    public bool PermiteSinDatosFiscales { get; set; }
    public int DiasLimiteComprobacion { get; set; }
    public bool Activo { get; set; }
}
```

---

## TipoMedida DTOs

**Archivo:** `Features/Catalogos/TiposMedida/DTOs/TipoMedidaDTOs.cs`

### TipoMedidaResponse

```csharp
public class TipoMedidaResponse
{
    public int IdTipoMedida { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
```

### CreateTipoMedidaRequest

```csharp
public class CreateTipoMedidaRequest
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}
```

### UpdateTipoMedidaRequest

```csharp
public class UpdateTipoMedidaRequest
{
    public int IdTipoMedida { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool Activo { get; set; }
}
```

---

## UnidadMedida DTOs

**Archivo:** `Features/Catalogos/UnidadesMedida/DTOs/UnidadMedidaDTOs.cs`

### UnidadMedidaResponse

```csharp
public class UnidadMedidaResponse
{
    public int IdUnidadMedida { get; set; }
    public int IdTipoMedida { get; set; }
    public string NombreTipoMedida { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Abreviatura { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaModificacion { get; set; }
}
```

### CreateUnidadMedidaRequest

```csharp
public class CreateUnidadMedidaRequest
{
    public int IdTipoMedida { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Abreviatura { get; set; } = string.Empty;
    public bool Activo { get; set; }
}
```

### UpdateUnidadMedidaRequest

```csharp
public class UpdateUnidadMedidaRequest
{
    public int IdUnidadMedida { get; set; }
    public int IdTipoMedida { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string Abreviatura { get; set; } = string.Empty;
    public bool Activo { get; set; }
}
```

---

## Mapeo Entidad → Response

El mapeo se realiza mediante métodos de extensión en `Shared/Extensions/EntityMappings.cs`:

```csharp
public static class EntityMappings
{
    public static EmpresaResponse ToResponse(this Empresa empresa) => new()
    {
        IdEmpresa = empresa.IdEmpresa,
        Nombre = empresa.Nombre,
        // ... resto de propiedades
    };

    public static SucursalResponse ToResponse(this Sucursal sucursal) => new()
    {
        IdSucursal = sucursal.IdSucursal,
        // ... resto de propiedades
    };

    // ... etc para todas las entidades
}
```

---

## Convenciones

| Aspecto | Convención |
|---------|-----------|
| Nombres | PascalCase |
| Sufijo Response | Para respuestas API |
| Sufijo Request | Para peticiones API |
| Prefijo Create | Para creación |
| Prefijo Update | Para actualización |
| Strings vacíos | `string.Empty` por defecto |
| Nullable | Usar `?` para campos opcionales |
