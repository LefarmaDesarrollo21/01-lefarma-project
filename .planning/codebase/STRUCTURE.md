# Codebase Structure

**Analysis Date:** 2026-03-30

## Directory Layout

```
[project-root]/
├── lefarma.backend/           # .NET 10 backend API
│   ├── src/Lefarma.API/      # Main API project
│   │   ├── Domain/           # Core entities and interfaces
│   │   ├── Features/         # Self-contained feature modules
│   │   ├── Infrastructure/   # Data access and external concerns
│   │   ├── Services/         # Identity and auth services
│   │   ├── Shared/           # Cross-cutting utilities
│   │   └── wwwroot/         # Static files (help images, uploads)
│   └── tests/                # Test projects (Unit, Integration, E2E)
├── lefarma.frontend/         # React 19 frontend
│   ├── src/
│   │   ├── components/       # React components (ui, layout, features)
│   │   ├── pages/           # Page components organized by feature
│   │   ├── routes/          # Routing configuration
│   │   ├── services/        # API clients (Axios, auth)
│   │   ├── store/           # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── types/           # TypeScript type definitions
│   │   ├── lib/             # Utilities (cn() helper, etc.)
│   │   └── constants/       # App constants
│   └── tests/               # Playwright E2E tests
├── lefarma.docs/             # Documentation
├── lefarma.database/         # Database scripts and migrations
└── .planning/               # GSD workflow artifacts
```

## Directory Purposes

**`lefarma.backend/src/Lefarma.API/Domain/`**: Core business entities and contracts
- Contains: `Entities/` (Poco classes), `Interfaces/` (repository and service contracts)
- Purpose: Domain model, business rules, data contracts
- Key files: `Entities/Catalogos/*.cs`, `Interfaces/*/*.cs`

**`lefarma.backend/src/Lefarma.API/Features/`**: Self-contained feature modules (vertical slices)
- Contains: `Auth/`, `Catalogos/` (Areas, Empresas, Gastos, etc.), `Config/`, `Notifications/`, `OrdenesCompra/`, `Profile/`
- Each feature has: Controller, Service, IService, Validator, DTOs/, Extensions/
- Purpose: Feature-specific business logic, API endpoints
- Key files: `Catalogos/Empresas/EmpresasController.cs`, `Config/Workflows/IWorkflowService.cs`

**`lefarma.backend/src/Lefarma.API/Infrastructure/`**: Data access and external concerns
- Contains: `Data/` (DbContext, repositories, configurations, seeding), `Filters/`, `Middleware/`, `Templates/`
- Purpose: Database operations, HTTP filters, middleware, email templates
- Key files: `Data/ApplicationDbContext.cs`, `Data/Repositories/*/*.cs`, `Filters/ValidationFilter.cs`

**`lefarma.backend/src/Lefarma.API/Services/`**: Infrastructure services
- Contains: `Identity/` (AD, JWT, token services)
- Purpose: LDAP integration, JWT token generation/validation
- Key files: `Identity/AdService.cs`, `Identity/JwtTokenService.cs`

**`lefarma.backend/src/Lefarma.API/Shared/`**: Cross-cutting utilities
- Contains: `Authorization/` (policies, handlers), `Constants/`, `Errors/`, `Extensions/`, `Logging/`, `Models/`
- Purpose: Reusable abstractions, error handling, logging models
- Key files: `Extensions/ResultExtensions.cs`, `Authorization/PermissionHandler.cs`, `Models/ApiResponse.cs`

**`lefarma.frontend/src/components/`**: React components
- Contains: `ui/` (shadcn/ui primitives), `layout/` (Header, Sidebar, MainLayout), feature components
- Purpose: Reusable UI components, layout structure
- Key files: `ui/button.tsx`, `layout/MainLayout.tsx`, `ui/sonner.tsx` (toasts)

**`lefarma.frontend/src/pages/`**: Page components organized by feature
- Contains: `auth/` (Login, SelectEmpresaSucursal), `admin/` (Usuarios, Roles, Permisos), `catalogos/` (Empresas, Gastos, etc.), `configuracion/`, `workflows/`, `ordenes/`, `help/`
- Purpose: Route-level page components
- Key files: `auth/Login.tsx`, `catalogos/Empresas/EmpresasList.tsx`

**`lefarma.frontend/src/routes/`**: Routing configuration
- Contains: `AppRoutes.tsx`, `LandingRoute.tsx`, `PrivateRoute.tsx`, `PublicOnlyRoute.tsx`
- Purpose: Route definitions, auth guards
- Key files: `AppRoutes.tsx` (all routes defined here)

**`lefarma.frontend/src/services/`**: API clients
- Contains: `api.ts` (Axios instance with interceptors), `authService.ts`, feature-specific services
- Purpose: HTTP communication with backend, auth management
- Key files: `api.ts`, `authService.ts`

**`lefarma.frontend/src/store/`**: Zustand state stores
- Contains: `authStore.ts`, `configStore.ts`, `helpStore.ts`, `notificationStore.ts`, `pageStore.ts`
- Purpose: Global state management
- Key files: `authStore.ts` (auth, empresa, sucursal state)

**`lefarma.frontend/src/types/`**: TypeScript type definitions
- Contains: `*.types.ts` files (api.types.ts, auth.types.ts, etc.)
- Purpose: Type safety across frontend
- Key files: `api.types.ts`, `auth.types.ts`

## Key File Locations

**Entry Points:**
- `lefarma.backend/src/Lefarma.API/Program.cs`: Backend API entry point (DI, middleware, Swagger)
- `lefarma.frontend/src/main.tsx`: Frontend React entry point
- `lefarma.frontend/src/App.tsx`: Main app component (router, toast, auth init)

**Configuration:**
- `lefarma.backend/src/Lefarma.API/appsettings.json`: Backend configuration
- `lefarma.frontend/.env`: Frontend environment variables (VITE_API_URL)
- `lefarma.frontend/vite.config.ts`: Vite configuration

**Core Logic:**
- `lefarma.backend/src/Lefarma.API/Features/`: All feature services and controllers
- `lefarma.backend/src/Lefarma.API/Infrastructure/Data/`: Data access
- `lefarma.frontend/src/services/`: API clients
- `lefarma.frontend/src/store/`: State management

**Testing:**
- `lefarma.backend/tests/`: Test projects (Lefarma.UnitTests, Lefarma.IntegrationTests, Lefarma.Tests)
- `lefarma.frontend/tests/`: Playwright E2E tests

## Naming Conventions

**Files:**
- PascalCase: C# classes match file name (`EmpresaService.cs`, `EmpresasController.cs`)
- kebab-case: React components (`empresas-list.tsx`, `login.tsx`)
- camelCase: TypeScript utilities and hooks (`api.ts`, `useAuthStore.ts`)
- `*.types.ts`: Type definition files
- `*.types.ts`: Type definitions in frontend

**Directories:**
- PascalCase: C# directories (`Domain/`, `Features/`, `Infrastructure/`)
- kebab-case: Frontend directories (`components/`, `pages/`, `services/`)
- Plural for collections: `Entities/`, `Repositories/`, `Interfaces/`

**C# Classes:**
- PascalCase: Classes, methods, properties, public fields
- camelCase: Local variables, parameters, private fields (prefixed with `_`)
- Interfaces: Prefixed with `I` (`IEmpresaService`, `IRepository`)
- DTO naming: `{Entity}Response`, `Create{Entity}Request`, `Update{Entity}Request`
- Async methods: Suffix `Async` (`GetByIdAsync`, `CreateAsync`)

**React Components:**
- PascalCase: Component names (`EmpresasList`, `Login`)
- kebab-case: File names (`empresas-list.tsx`)

## Where to Add New Code

**New Feature (Backend):**
- Entity: `Domain/Entities/[Feature]/{Entity}.cs`
- EF config: `Infrastructure/Data/Configurations/[Feature]/{Entity}Configuration.cs`
- Interface: `Domain/Interfaces/[Feature]/I{Feature}Repository.cs` and `I{Feature}Service.cs`
- Repository: `Infrastructure/Data/Repositories/[Feature]/{Feature}Repository.cs`
- Service: `Features/[Feature]/{Feature}Service.cs` and `I{Feature}Service.cs`
- Validator: `Features/[Feature]/{Feature}Validator.cs`
- DTOs: `Features/[Feature]/DTOs/*.cs`
- Controller: `Features/[Feature]/{Feature}Controller.cs` (route: `api/[parent]/[controller]`)
- Register all in `Program.cs`

**New Feature (Frontend):**
- Page component: `pages/[feature]/[Feature]List.tsx` or `[Feature]Form.tsx`
- Types: `types/[feature].types.ts`
- Service: `services/[feature]Service.ts`
- Store (if needed): `store/[feature]Store.ts`

**New Catalog Feature:**
- Backend: Follow pattern in `Features/Catalogos/[FeatureName]/`
- Frontend: Follow pattern in `pages/catalogos/[FeatureName]/`

**New Component:**
- UI primitive: Check `components/ui/` first (shadcn/ui), add if missing
- Layout component: `components/layout/[Component].tsx`
- Feature component: `components/[feature]/[Component].tsx`

**Utilities:**
- Backend helpers: `Shared/Extensions/[Name]Extensions.cs`
- Frontend helpers: `lib/utils.ts` (cn() helper), `lib/[name].ts`
- Custom hooks: `hooks/use[Name].ts`

## Special Directories

**`lefarma.backend/src/Lefarma.API/Infrastructure/Data/Migrations/`**: EF Core migrations
- Purpose: Database schema migrations
- Generated: Yes (by `dotnet ef migrations add`)
- Committed: Yes

**`lefarma.backend/src/Lefarma.API/wwwroot/media/`**: Static files
- Purpose: Help images, file uploads
- Generated: Yes (user uploads via API)
- Committed: Yes

**`lefarma.frontend/src/components/ui/`**: shadcn/ui components
- Purpose: Reusable UI primitives (Radix UI + TailwindCSS)
- Generated: Semi-generated (via shadcn CLI, customized)
- Committed: Yes

**`.planning/`**: GSD workflow artifacts
- Purpose: Phase plans, specs, research, codebase docs
- Generated: Yes (by GSD commands)
- Committed: Yes

**`lefarma.docs/`**: Project documentation
- Purpose: Specs, research, reports, workflow docs
- Generated: Yes (by documentation workflows)
- Committed: Yes

---

*Structure analysis: 2026-03-30*
