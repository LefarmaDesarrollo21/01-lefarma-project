# Lefarma Project Documentation

Documentación completa del proyecto Lefarma - Sistema de gestión para farmacéutica.

## Estructura del Proyecto

```
lefarma-project/
├── lefarma.backend/          # API .NET 10
├── lefarma.frontend/         # React + TypeScript + Vite
├── lefarma.database/         # Scripts de base de datos
└── lefarma.docs/            # Esta documentación
```

## Sistema de Tasks (Desarrollo)

La carpeta [`task/`](./task/) contiene los **PRDs y archivos de tareas** para desarrollo de módulos:

| Elemento | Descripción |
|----------|-------------|
| [`task/README.md`](./task/README.md) | Guía del sistema de tasks |
| [`task/000-template.md`](./task/000-template.md) | Template para nuevos tasks |
| `task/XXX-nombre-modulo.md` | Tasks con consecutivo numérico |

### Para Claude/Agents

Al desarrollar nuevos módulos:
1. Buscar en `lefarma.docs/task/` el último consecutivo
2. Crear nuevo task con formato `XXX-nombre-del-modulo.md`
3. Actualizar estado: `pending` → `in_progress` → `completed`

## Documentación por Módulo

### Backend (.NET 10)

| Documento | Descripción |
|-----------|-------------|
| [API Routes](./backend/api-routes.md) | Endpoints REST, controladores y rutas |
| [Entities](./backend/entities.md) | Entidades de dominio y EF Core |
| [Services](./backend/services.md) | Servicios de negocio e interfaces |
| [DTOs](./backend/dtos.md) | Objetos de transferencia de datos |

### Frontend (React + TypeScript)

| Documento | Descripción |
|-----------|-------------|
| [Routes](./frontend/routes.md) | Sistema de enrutamiento y protección de rutas |
| [Pages](./frontend/pages.md) | Páginas y vistas de la aplicación |
| [Components](./frontend/components.md) | Componentes reutilizables (UI + Layout) |
| [Services](./frontend/services.md) | Servicios API y autenticación |
| [Types](./frontend/types.md) | Tipos TypeScript y interfaces |

## Stack Tecnológico

### Backend
- .NET 10 con C# 10
- Entity Framework Core 10
- SQL Server
- FluentValidation
- Serilog (WideEvent logging)
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- React 19
- TypeScript 5
- Vite 7
- TailwindCSS
- Radix UI (shadcn/ui)
- Zustand (estado)
- React Router v7
- Axios
- React Hook Form + Zod

## Comandos de Desarrollo

### Backend
```bash
cd lefarma.backend/src/Lefarma.API
dotnet run
```

### Frontend
```bash
cd lefarma.frontend
npm run dev
```

### Ambos (PowerShell)
```powershell
./init.ps1
```

---

*Documentación generada automáticamente. Última actualización: 2026-02-24*
