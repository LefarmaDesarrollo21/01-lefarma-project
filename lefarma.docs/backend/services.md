# Services - Backend Documentation

## Índice

- [Arquitectura de Servicios](#arquitectura-de-servicios)
- [Servicios de Catálogos](#servicios-de-catálogos)
  - [AreaService](#areaservice)
  - [EmpresaService](#empresaservice)
  - [SucursalService](#sucursalservice)
  - [TipoGastoService](#tipogastoservice)
  - [TipoMedidaService](#tipomedidaservice)
  - [UnidadMedidaService](#unidadmedidaservice)
- [Repositorios](#repositorios)
- [BaseService](#baseservice)

---

## Arquitectura de Servicios

```
┌─────────────────┐
│   Controller    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IService       │ ← Interfaz
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service        │ ← Implementación
│  (hereda de     │
│   BaseService)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IRepository    │ ← Interfaz
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │ ← Implementación
│  (hereda de     │
│   BaseRepository)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   DbContext     │
└─────────────────┘
```

---

## Servicios de Catálogos

Todos los servicios de catálogos implementan el mismo patrón CRUD:

### Interfaz Común

```csharp
public interface ICatalogoService<TResponse, TCreate, TUpdate>
{
    Task<ErrorOr<IEnumerable<TResponse>>> GetAllAsync();
    Task<ErrorOr<TResponse>> GetByIdAsync(int id);
    Task<ErrorOr<TResponse>> CreateAsync(TCreate request);
    Task<ErrorOr<TResponse>> UpdateAsync(int id, TUpdate request);
    Task<ErrorOr<bool>> DeleteAsync(int id);
}
```

---

## AreaService

**Archivo:** `Features/Catalogos/Areas/AreaService.cs`
**Interfaz:** `Features/Catalogos/Areas/IAreaService.cs`

### Dependencias

- `IAreaRepository`
- `IEmpresaRepository`
- `IWideEventAccessor`
- `ILogger<AreaService>`

### Métodos

| Método | Descripción |
|--------|-------------|
| `GetAllAsync()` | Obtiene todas las áreas activas |
| `GetByIdAsync(id)` | Obtiene área por ID con validación de existencia |
| `CreateAsync(request)` | Crea nueva área, valida empresa existente |
| `UpdateAsync(id, request)` | Actualiza área, valida empresa existente |
| `DeleteAsync(id)` | Elimina área con validación de existencia |

### Reglas de Negocio

- El nombre es obligatorio (3-255 caracteres)
- La empresa debe existir
- El nombre se normaliza a mayúsculas automáticamente

---

## EmpresaService

**Archivo:** `Features/Catalogos/Empresas/EmpresaService.cs`
**Interfaz:** `Features/Catalogos/Empresas/IEmpresaService.cs`

### Dependencias

- `IEmpresaRepository`
- `IWideEventAccessor`
- `ILogger<EmpresaService>`

### Métodos

| Método | Descripción |
|--------|-------------|
| `GetAllAsync()` | Obtiene todas las empresas activas |
| `GetByIdAsync(id)` | Obtiene empresa por ID |
| `CreateAsync(request)` | Crea nueva empresa |
| `UpdateAsync(id, request)` | Actualiza empresa |
| `DeleteAsync(id)` | Elimina empresa con validación de sucursales |

### Reglas de Negocio

- Nombre: 3-255 caracteres
- RFC: 12-13 caracteres (formato válido)
- Email: formato válido
- Código Postal: 5 dígitos
- Teléfono: 10 dígitos

---

## SucursalService

**Archivo:** `Features/Catalogos/Sucursales/SucursalService.cs`
**Interfaz:** `Features/Catalogos/Sucursales/ISucursalService.cs`

### Dependencias

- `ISucursalRepository`
- `IEmpresaRepository`
- `IWideEventAccessor`
- `ILogger<SucursalService>`

### Métodos

| Método | Descripción |
|--------|-------------|
| `GetAllAsync()` | Obtiene todas las sucursales |
| `GetByIdAsync(id)` | Obtiene sucursal por ID |
| `CreateAsync(request)` | Crea nueva sucursal |
| `UpdateAsync(id, request)` | Actualiza sucursal |
| `DeleteAsync(id)` | Elimina sucursal |

### Reglas de Negocio

- Nombre: 3-255 caracteres
- Descripción: máx. 500 caracteres
- Código Postal: 5 dígitos
- Teléfono: 10 dígitos
- Latitud: entre -90 y 90
- Longitud: entre -180 y 180
- La empresa debe existir

---

## TipoGastoService

**Archivo:** `Features/Catalogos/TipoGastos/TipoGastoService.cs`
**Interfaz:** `Features/Catalogos/TipoGastos/ITipoGastoService.cs`

### Dependencias

- `ITipoGastoRepository`
- `IWideEventAccessor`
- `ILogger<TipoGastoService>`

### Métodos

| Método | Descripción |
|--------|-------------|
| `GetAllAsync()` | Obtiene todos los tipos de gasto |
| `GetByIdAsync(id)` | Obtiene tipo de gasto por ID |
| `CreateAsync(request)` | Crea nuevo tipo de gasto |
| `UpdateAsync(id, request)` | Actualiza tipo de gasto |
| `DeleteAsync(id)` | Elimina tipo de gasto |

### Reglas de Negocio

- Nombre: 3-255 caracteres
- Clave: máx. 10 caracteres
- Cuenta: exactamente 3 dígitos
- SubCuenta: máx. 20 caracteres
- Analitica: máx. 20 caracteres
- Integracion: máx. 50 caracteres

---

## TipoMedidaService

**Archivo:** `Features/Catalogos/TiposMedida/TipoMedidaService.cs`
**Interfaz:** `Features/Catalogos/TiposMedida/ITipoMedidaService.cs`

### Dependencias

- `ITipoMedidaRepository`
- `IWideEventAccessor`
- `ILogger<TipoMedidaService>`

### Métodos

| Método | Descripción |
|--------|-------------|
| `GetAllAsync()` | Obtiene todos los tipos de medida |
| `GetByIdAsync(id)` | Obtiene tipo de medida por ID |
| `CreateAsync(request)` | Crea nuevo tipo de medida |
| `UpdateAsync(id, request)` | Actualiza tipo de medida |
| `DeleteAsync(id)` | Elimina tipo de medida con validación de unidades |

### Reglas de Negocio

- Nombre: máx. 80 caracteres
- No se puede eliminar si tiene unidades de medida asociadas

---

## UnidadMedidaService

**Archivo:** `Features/Catalogos/UnidadesMedida/UnidadMedidaService.cs`
**Interfaz:** `Features/Catalogos/UnidadesMedida/IUnidadMedidaService.cs`

### Dependencias

- `IUnidadMedidaRepository`
- `ITipoMedidaRepository`
- `IWideEventAccessor`
- `ILogger<UnidadMedidaService>`

### Métodos

| Método | Descripción |
|--------|-------------|
| `GetAllAsync()` | Obtiene todas las unidades de medida |
| `GetByIdAsync(id)` | Obtiene unidad de medida por ID |
| `CreateAsync(request)` | Crea nueva unidad de medida |
| `UpdateAsync(id, request)` | Actualiza unidad de medida |
| `DeleteAsync(id)` | Elimina unidad de medida |

### Reglas de Negocio

- Nombre: máx. 80 caracteres
- Abreviatura: máx. 10 caracteres
- El tipo de medida debe existir

---

## Repositorios

### IBaseRepository<T>

**Archivo:** `Domain/Interfaces/IBaseRepository.cs`

```csharp
public interface IBaseRepository<T> where T : class
{
    Task<ICollection<T>> GetAllAsync();
    Task<T?> GetByIdAsync(int id);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task<bool> DeleteAsync(T entity);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
}
```

### Repositorios Específicos

| Interfaz | Implementación | Entidad |
|----------|----------------|---------|
| `IAreaRepository` | `AreaRepository` | Area |
| `IEmpresaRepository` | `EmpresaRepository` | Empresa |
| `ISucursalRepository` | `SucursalRepository` | Sucursal |
| `ITipoGastoRepository` | `TipoGastoRepository` | TipoGasto |
| `ITipoMedidaRepository` | `TipoMedidaRepository` | TipoMedida |
| `IUnidadMedidaRepository` | `UnidadMedidaRepository` | UnidadMedida |

### Ubicaciones

- **Interfaces:** `Domain/Interfaces/Catalogos/`
- **Implementaciones:** `Infrastructure/Data/Repositories/Catalogos/`

---

## BaseService

**Archivo:** `Shared/BaseService.cs`

Clase abstracta que proporciona funcionalidad base para todos los servicios.

### Propiedades Protegidas

```csharp
protected readonly IWideEventAccessor WideEvent;
protected readonly ILogger Logger;
```

### Métodos Protegidos

| Método | Descripción |
|--------|-------------|
| `EnrichWideEvent(action, entity, additionalData)` | Enriquece el contexto de logging |
| `LogOperation(operation, entity, success)` | Loguea operaciones con WideEvent |

### Uso

```csharp
public class MiServicio : BaseService, IMiServicio
{
    public MiServicio(
        IWideEventAccessor wideEvent,
        ILogger<MiServicio> logger) : base(wideEvent, logger)
    { }

    public async Task HacerAlgo()
    {
        // Usar WideEvent para logging estructurado
        EnrichWideEvent("Create", entity, new { CampoExtra = valor });
    }
}
```

---

## Manejo de Errores

Todos los servicios usan `ErrorOr<T>` para manejo de errores:

```csharp
// Éxito
return area.ToResponse();

// Error
return Error.NotFound("Area.NotFound", $"Área con ID {id} no encontrada");

// Múltiples errores de validación
return Error.Validation("Area.Validation", "Mensaje de error");
```

### Tipos de Error Comunes

| Tipo | Descripción |
|------|-------------|
| `Error.NotFound` | Entidad no existe |
| `Error.Validation` | Error de validación de negocio |
| `Error.Conflict` | Conflicto (ej: duplicado) |
| `Error.Unexpected` | Error interno no esperado |
