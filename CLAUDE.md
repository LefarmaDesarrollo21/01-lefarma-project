# CLAUDE.md - Lefarma Development Guide

## Quick Reference

**Project**: Pharmaceutical management system (.NET 10 backend + React 19 frontend)
**Architecture**: Modular monolith with feature-based organization
**Branches**: `main` (production), `dev` (development)

## Quick Start

```bash
# First time setup
./install.ps1    # Install dependencies
./init.ps1       # Start both services

# Backend (Terminal 1)
cd lefarma.backend/src/Lefarma.API
fuser -k 5134/tcp 2>/dev/null; clear; dotnet run    # Port 5134

# Frontend (Terminal 2)
cd lefarma.frontend
npm run dev      # Port 5173
```

## Backend Architecture

**Structure**:
```
Lefarma.API/
├── Domain/                    # Entities + Interfaces
├── Features/                  # Self-contained feature modules
│   ├── Auth/                  # LDAP + JWT
│   ├── Catalogos/             # Catalog CRUD
│   ├── Notifications/         # Multi-channel (Email, Telegram, SSE)
│   ├── Profile/, Admin/, Logging/, SystemConfig/
├── Infrastructure/            # Data, Repositories, Filters, Middleware
├── Services/Identity/         # AD, JWT services
├── Shared/                    # Auth, Errors, Extensions, Logging
└── Program.cs
```

**Key Patterns**:
- **Service Pattern**: Controllers delegate to services (business logic)
- **Repository Pattern**: Interfaces in `Domain/Interfaces/`, implementations in `Infrastructure/Data/Repositories/`
- **Unified Response**: `ApiResponse<T>` with Success, Message, Data, Errors
- **Validation**: FluentValidation via ValidationFilter
- **Result Pattern**: Services return `Result<T>` → `.ToActionResult()` for HTTP responses
- **Authorization**: Role-based (Administrator, Manager, etc.) + permission-based policies
- **WideEvent Logging**: One rich event per HTTP request to JSON files (30-day retention)

**Backend Modules**:
- **Auth**: Multi-domain LDAP (Asokam, Artricenter), JWT, master password bypass (tt01tt)
- **Catalogos**: Core (Empresas, Sucursales, Areas, etc.), Financieros, Proveedores, Costos, Fiscales, Operaciones
- **Notifications**: Email (MailKit), Telegram, In-App (SSE), Handlebars.Net templates, Keyed Services
- **HttpClientFactory**: External API integrations

**Commands**:
```bash
dotnet run                    # May fail if port in use
dotnet build                  # Build
dotnet test                   # Run all tests
dotnet ef migrations add <Name>    # Create migration
dotnet ef database update          # Apply migrations
dotnet ef database update 0        # Rollback all
dotnet ef migrations remove        # Remove last
```

## Frontend Architecture

**Structure**:
```
src/
├── components/
│   ├── layout/                # Header, Sidebar, MainLayout
│   └── ui/                    # shadcn/ui components
├── pages/
│   ├── auth/                  # Login
│   ├── catalogos/             # Catalog CRUD pages
│   └── configuracion/         # Config pages
├── routes/                    # AppRoutes, ProtectedRoute, etc.
├── services/                  # api.ts (Axios), authService.ts
├── store/                     # Zustand (authStore, pageStore, etc.)
├── types/                     # TypeScript definitions
├── hooks/                     # Custom hooks (usePageTitle, use-toast)
└── App.tsx
```

**Key Patterns**:
- **Route Guards**: `ProtectedRoute` (auth check), `PublicOnlyRoute` (redirect if authenticated)
- **Axios Interceptors**: Auto-add JWT, refresh on 401, redirect to login on failure
- **State**: Zustand with persist middleware (authStore persists to localStorage)
- **UI**: shadcn/ui components → composed into page components
- **Forms**: React Hook Form + Zod validation
- **SSE**: Real-time notifications via EventSource (auto-reconnect, auth headers)
- **Tables**: TanStack Table v8 with advanced filters
- **Page Titles**: `usePageTitle(title, subtitle?)` muestra título en el Header (no en document.title)
  ```typescript
  // En cualquier page component
  usePageTitle('Empresas', 'Gestión de empresas');  // subtítulo opcional
  ```

**Commands**:
```bash
npm run dev           # http://localhost:5173
npm run build         # Production build
npm run lint          # ESLint
npm run format        # Prettier
```

## Development Workflow

### 1. Adding Catalog Features

**Backend** (8 steps):
1. Entity in `Domain/Entities/`
2. EF config in `Infrastructure/Data/Configurations/`
3. Repository interface in `Domain/Interfaces/Catalogos/`
4. Repository implementation in `Infrastructure/Data/Repositories/Catalogos/`
5. Service interface + implementation in `Features/Catalogos/[Feature]/`
6. FluentValidation validator
7. Controller in `Features/Catalogos/[Feature]/`
8. Register in `Program.cs` + `dotnet ef migrations add`

**Frontend** (4 steps):
1. Types in `types/`
2. Page component in `pages/catalogos/`
3. Route in `routes/AppRoutes.tsx`
4. Sidebar item in `components/layout/Sidebar.tsx` (optional)

### 2. Validation Protocol (MANDATORY)

**Todo cambio DEBE validarse antes de commit**

Use **chrome-devtools MCP** or **agent-browser CLI**:

```bash
# agent-browser examples
agent-browser open http://localhost:5173/catalogos/empresas
agent-browser fill "#username" "54"
agent-browser fill "#password" "tt01tt"
agent-browser click "button[type='submit']"
agent-browser wait --url "**/dashboard"
agent-browser screenshot dashboard.png
```

**Checklist**:
- ✅ **Visual**: UI renders correctly
- ✅ **Functional**: CRUD works, validations fire
- ✅ **Network**: Correct API calls, payloads, auth headers
- ✅ **Console**: No JS errors or React warnings
- ✅ **Persistence**: F5 doesn't lose state (localStorage, filters)

**Special Cases**:
- **Auth/Notif**: Verify login/logout, SSE connection
- **Forms**: Test all validators, error messages in Spanish
- **Responsive**: Check mobile viewport

### 3. Git Workflow

**CRITICAL RULES**:
- **NO hagas commits hasta que el usuario te lo indique**
- **NO hagas push hasta que el usuario te lo indique**
- **NO hagas merge hasta que el usuario te lo indique**
- **NO te metas con git hasta que el usuario te lo indique**

**Branch Strategy**:
- `main`: Production (stable)
- `dev`: Development (merge to main when stable)
- `feature/*`: Temporary branches for large features

**Process**:
```bash
# 1. Create branch (optional)
git checkout -b feature/nueva-funcionalidad

# 2. Make changes + validate (browser automation)

# 3. Atomic commits (one change per commit)
git add .
git commit -m "feat: add user authentication"

# 4. Push + PR to dev
git push origin feature/nueva-funcionalidad
# Create PR: feature → dev

# 5. Merge to dev
git checkout dev && git pull && git merge feature && git push
```

**Commit Conventions**:
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting (no logic change)
refactor: code refactor (no behavior change)
test: tests
chore: build/config/dependencies
perf: performance improvement
ci: CI/CD
```

**NO "Co-Authored-By" tags** - solo conventional commits format.

## Configuration

**Backend** (`appsettings.json`):
- **Connection Strings**: DefaultConnection (primary), AsokamConnection (secondary)
- **Auth**: LDAP (Asokam, Artricenter), JWT with configurable expiry, master password `tt01tt`
- **Authorization**: 7 roles + permission-based policies
- **Notifications**: EmailSettings (SMTP), TelegramSettings (BotToken, ApiUrl)

**Frontend**:
- **VITE_API_URL**: Backend base URL (default: `http://localhost:5134/api`)
- **api.ts**: Auto-appends `/api`, 30s timeout, auto-refresh on 401

## Troubleshooting

**Backend**:
- **Port 5134 in use**: `fuser -k 5134/tcp 2>/dev/null; dotnet run`
- **Module not found**: `dotnet restore`
- **LDAP fails**: Check AD server, appsettings.json credentials, test with `54`/`tt01tt`
- **JWT expires**: Check `JwtSettings:ExpiryMinutes`

**Frontend**:
- **Module not found**: `rm -rf node_modules package-lock.json && npm install`
- **TypeScript errors**: Check `types/`, verify imports, run `npx tsc --noEmit`
- **Blank page**: Check console, verify `VITE_API_URL`, check backend on 5134
- **State not updating**: Check Zustand `set` method, look for useEffect stale closures

**Database**:
- **Migration fails**: `dotnet ef migrations list`, `dotnet ef database update 0`, `dotnet ef migrations remove`
- **Connection errors**: Verify SQL Server running, check appsettings.json, ensure `TrustServerCertificate=true`

## Debugging

**Backend**:
```csharp
_logger.LogInformation("Processing {Id}", id);

var result = await _service.GetAsync(id);
if (result.IsError) return BadRequest(result.Errors);
```

**Frontend**:
```typescript
console.log('🔍 Filtering:', { searchColumns, search });

// React DevTools Profiler → Components tab (re-render checks)
console.log('Auth state:', useAuthStore());

useDebugValue(visibleColumnIds);  // Shows in DevTools
```

**Network**:
```bash
curl http://localhost:5134/api/health
curl -H "Authorization: Bearer TOKEN" http://localhost:5134/api/catalogos/empresas
```

## Code Quality

**Backend (C#)**:
- Use `Result<T>` pattern instead of exceptions
- FluentValidation for all DTOs
- Constructor injection (no `new` in services)
- Async/await for I/O
- XML docs on public methods
- PascalCase (methods/properties), camelCase (locals)

**Frontend (TypeScript/React)**:
- Strict TypeScript (no `any` unless necessary)
- Functional components + hooks
- shadcn/ui when available
- Error boundaries around Suspense
- Zod schemas for forms
- **Vercel best practices**:
  - `rerender-dependencies`: Primitives only in useEffect
  - `async-parallel`: Promise.all() for independent async
  - `rerender-move-effect-to-event`: Event logic in handlers

**Performance**:
- **Backend**: `AsNoTracking` for reads, explicit `Include()`, pagination, caching
- **Frontend**: `useMemo` for expensive computations, `useCallback` for child callbacks, `React.lazy()` for routes, virtual scrolling (TanStack Table)

**Security**:
- **Backend**: No committed secrets, env vars for sensitive data, FluentValidation on all input, role+permission checks, parameterized SQL, audit logging
- **Frontend**: httpOnly cookies for tokens, `ProtectedRoute`, sanitize input (XSS prevention), validate API responses, no stack traces in errors, CSP headers

## When to Ask for Help

**Before asking**:
1. ✅ Read relevant docs
2. ✅ Search codebase for patterns
3. ✅ Check console/network errors
4. ✅ Try to debug yourself

**When asking**:
1. Context: What are you trying to do?
2. Errors: Screenshot or copy-paste
3. Attempts: What have you tried?
4. Hypothesis: What do you think is wrong?

## Notifications System

**Multi-channel, real-time**:
- **Channels**: Email (MailKit), Telegram, In-App (SSE)
- **SSE Endpoint**: `GET /api/notifications/sse` (JWT in Authorization header, auto-reconnect)
- **Backend**: `NotificationService.SendAsync()` with priority (Low/Normal/High/Critical) + type (Info/Success/Warning/Error)
- **Frontend**: `useNotifications()` hook manages SSE connection, updates in real-time

**Example**:
```csharp
await _notificationService.SendAsync(new SendNotificationRequest {
    Title = "Title",
    Message = "Message",
    Type = NotificationType.Info,
    Priority = NotificationPriority.Normal,
    Channels = new List<string> { "email", "in-app" },
    Recipients = new List<NotificationRecipient> { new() { UserId = 123 } }
});
```

## URLs

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:5134 |
| Swagger UI | http://localhost:5134 (dev only) |

## Tech Stack

**Backend**: .NET 10, C# 10, EF Core 10, SQL Server, FluentValidation, JWT, Serilog, Swashbuckle, SSE, ErrorOr, MailKit, Handlebars.Net, LDAP

**Frontend**: React 19, TypeScript 5.9, Vite 7, React Router v7, Zustand, Axios, EventSource, Radix UI, TailwindCSS, React Hook Form + Zod, TanStack Table v8, Sonner

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Lefarma CxP — Ordenes de Compra y Cuentas por Pagar**

Sistema web para la gestion completa del proceso de ordenes de compra y cuentas por pagar de Grupo Lefarma (5 empresas: Asokam, Lefarma, Artricenter, Construmedika, GrupoLefarma). Incluye captura de ordenes de compra con partidas, flujo de autorizaciones multinivel configurable (N firmas determinadas por monto/tipo de gasto/empresa/sucursal), procesamiento de pagos por tesoreria, comprobacion de gastos (XML/CFDI + no deducibles + depositos bancarios), reportes operativos y contables, e integracion con sistema contable para generacion de polizas automaticas y conciliacion bancaria.

**Core Value:** El flujo completo de una orden de compra — desde captura hasta cierre contable — con trazabilidad total y autorizaciones configurables.

### Constraints

- **Tech Stack**: .NET 10 backend + React 19 frontend (ya definido y en produccion)
- **Auth**: LDAP + JWT existente, no cambiar
- **Database**: SQL Server con EF Core 10
- **Patrones**: ErrorOr<T>, FluentValidation, ApiResponse<T>, ResultExtensions — OBLIGATORIO
- **Frontend**: shadcn/ui, React Hook Form + Zod, Zustand, TanStack Table — OBLIGATORIO
- **Workflow**: Usar el WorkflowEngine existente, no crear uno nuevo
- **Niveles de firma**: Configurables via WorkflowCondiciones (ya soportado por el engine) — NO hardcodear 5 firmas
- **Validation messages**: En espanol
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- C# 10.0 - Backend API (`.cs`, `.csproj`)
- TypeScript 5.9.3 - Frontend (`.ts`, `.tsx`)
- JavaScript - Frontend (via React/Vite)
## Runtime
- .NET 10.0 - Backend runtime (`net10.0` target framework)
- Node.js - Frontend runtime (implied from npm/vite)
- Backend: NuGet (.NET CLI, Visual Studio)
- Frontend: npm (package.json, package-lock.json present)
- Lockfile: `package-lock.json` present
## Frameworks
- ASP.NET Core 10.0.2 - Backend web framework
- React 19.2.0 - Frontend UI framework
- Vite 7.3.1 - Frontend build tool and dev server
- Entity Framework Core 10.0.2 - Backend ORM for database access
- xUnit 2.9.2 - Backend test runner
- Moq 4.20.72 - Backend mocking framework
- FluentAssertions 7.0.0 - Backend assertion library
- Playwright 1.58.2 - Frontend E2E testing
- coverlet.collector 6.0.2 - Backend code coverage
- Swashbuckle.AspNetCore 10.1.0 - Swagger/OpenAPI documentation
- ESLint 9.39.1 - Frontend linting
- Prettier 3.8.1 - Frontend code formatting
- TypeScript-ESLint 8.46.4 - TypeScript linting rules
## Key Dependencies
- ErrorOr 2.0.1 - Result pattern for error handling in services
- FluentValidation 12.1.1 - Request DTO validation
- Microsoft.AspNetCore.Authentication.JwtBearer 10.0.2 - JWT authentication
- Serilog.AspNetCore 10.0.0 - Structured logging
- System.DirectoryServices.Protocols 9.0.0 - LDAP/Active Directory integration
- MailKit 4.15.1 - Email (SMTP) client
- Handlebars.Net 2.1.6 - Template engine for notifications
- Radix UI - Accessible UI primitives (@radix-ui/* packages)
- @tanstack/react-table 8.21.3 - Advanced data tables
- react-hook-form 7.71.1 - Form management
- zod 4.3.6 - Schema validation
- zustand 5.0.10 - Global state management
- jotai 2.18.0 - Atomic state management
- axios 1.13.4 - HTTP client
- react-router-dom 7.13.0 - Client-side routing
- tailwindcss 3.4.19 - Utility-first CSS framework
- Microsoft.EntityFrameworkCore.SqlServer 10.0.2 - SQL Server provider
- Microsoft.EntityFrameworkCore.Tools 10.0.2 - EF Core CLI tools
- @dnd-kit/* - Drag and drop functionality
- sonner 2.0.7 - Toast notifications
- lucide-react 0.563.0 - Icon library
- @tinymce/tinymce-react 6.3.0 - Rich text editor
- reactflow 11.11.4 - Flow/React graph visualization
- recharts 2.15.4 - Charting library
## Configuration
- Backend: `appsettings.json`, `appsettings.Development.json` (.NET configuration)
- Frontend: `.env`, `.env.development`, `.env.production` (Vite environment variables)
- Multiple environments supported: Development, Production
- Backend: Connection strings, JWT settings, LDAP domains, SMTP settings, Telegram bot token
- Frontend: API base URL (`VITE_API_URL`), app name, app version
- Backend: `.csproj` files (MSBuild-based)
- Frontend: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `tailwind.config.js`
## Platform Requirements
- .NET 10.0 SDK
- Node.js 20+ (implied from TypeScript 5.9.3)
- SQL Server instance (192.168.4.2 for local development)
- Backend: .NET 10.0 runtime, Windows Server or Linux container
- Frontend: Static hosting (Vite build output)
- Database: SQL Server
- LDAP servers: 192.168.4.2 (Asokam), 192.168.1.7 (Artricenter)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Backend (C#) Conventions
### Naming Patterns
- One class per file
- File name matches class name exactly
- PascalCase for classes and files: `ProfileService.cs`, `NotificationService.cs`
- PascalCase for classes, methods, properties, public fields
- camelCase for local variables, parameters, private fields (prefixed with `_`)
- Examples: `GetProfileAsync()`, `_profileService`, `userId`
- `{Entity}Response` for response DTOs
- `Create{Entity}Request` for creation DTOs
- `Update{Entity}Request` for update DTOs
- Examples: `ProfileResponse`, `UpdateProfileRequest`
- Named `{Request}Validator`: `UpdateProfileRequestValidator`
- Inherit from `AbstractValidator<T>`
### Code Style
- XML docs (`///`) on ALL public methods and classes
- `<summary>`, `<param>`, `<returns>` tags required
- Spanish comments and validation messages
- Example: `/// <summary>/// Obtiene el perfil del usuario autenticado/// </summary>`
- All controller endpoints require `[SwaggerOperation(Summary = "...")]`
- `[ProducesResponseType]` attributes for success and error cases
- `[EndpointGroupName("Feature")]` for organization
- All async methods end with `Async` suffix
- Always accept `CancellationToken cancellationToken = default`
- Pass through to all async calls
- Example: `public async Task<ErrorOr<ProfileResponse>> GetProfileAsync(int userId, CancellationToken cancellationToken = default)`
- Constructor injection only - no `new` for dependencies
- All services registered in `Program.cs` with `AddScoped` or `AddTransient`
- Required parameters validated with `?? throw new ArgumentNullException(nameof(param))`
- **ErrorOr<T>** for ALL service return types - services never throw for business logic
- Use `CommonErrors.NotFound()`, `CommonErrors.Validation()`, etc.
- Return `ErrorOr.Error` with descriptive codes
- Examples: `return CommonErrors.NotFound("Usuario", userId.ToString());`
- **FluentValidation** for ALL request DTOs
- Validators registered in `Program.cs`: `builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());`
- Use `RuleFor()` chains with `When()` for conditional validation
- Spanish error messages: `"El correo no es válido"`
- Use `required` keyword for non-nullable DTO properties
- Example: `public required string Nombre { get; set; }`
- Use `AsNoTracking()` for read queries
- Explicit `Include()` for eager loading
- Async methods: `FirstOrDefaultAsync()`, `ToListAsync()`
### Controller Patterns
- ALL controller responses wrapped in `ApiResponse<T>`
- Use `.ToActionResult(this, data => Ok(new ApiResponse<T> { ... }))` extension
- Example:
- Controllers: `[Route("api/[controller]")]`
- Methods: `[HttpGet]`, `[HttpPut]`, `[HttpPost]`, etc.
- Attributes: `[Authorize]`, `[ApiController]`
## Frontend (TypeScript/React) Conventions
### File Organization
- Convention: `{feature}.types.ts`
- Location: `src/types/`
- Examples: `catalogo.types.ts`, `auth.types.ts`, `api.types.ts`
- Functional components only - no class components
- Default exports for page components
- shadcn/ui components in `src/components/ui/`
### Formatting
- Single quotes: `'string'`
- Semicolons: required
- Indent: 2 spaces
- Trailing commas: ES5 (always)
- Print width: 100
- Tailwind class sorting via `prettier-plugin-tailwindcss`
- Flat config format (`eslint.config.js`)
- TypeScript recommended rules
- React Hooks rules
- React Refresh for HMR
- max-warnings: 0 enforced in build
- Extensions: `.ts`, `.tsx`
### TypeScript
- `strict: true` enabled
- No `any` types - use `unknown` or proper types
- `noUnusedLocals` and `noUnusedParameters` set to `false` (deliberate)
- `@/*` → `./src/*` configured in `tsconfig.json`
- Use for all internal imports: `import { Button } from '@/components/ui/button'`
- Interface patterns for API responses:
### React Patterns
- Functional components only - no class components
- Default exports for page components
- shadcn/ui primitives for all UI elements
- Use `cn()` utility for class merging: `className={cn(buttonVariants({ variant }))}`
- **React Hook Form + Zod** for ALL forms
- Define schema with Zod first: `const schema = z.object({...})`
- Infer type: `type FormValues = z.infer<typeof schema>`
- Resolver: `zodResolver(schema)`
- **Zustand** for global state (auth, page, notifications)
- **Jotai** for atomic state
- Local state with `useState` for component-level
- React Router v7 for navigation
- Protected routes with `ProtectedRoute` wrapper
- Public routes with `PublicOnlyRoute` wrapper
- All primitives from shadcn/ui (new-york variant, Radix + TailwindCSS)
- Check `components/ui/` before building custom
- Use `cv` (class-variance-authority) for variants
### API Integration
- Use `API` from `@/services/api` - Axios instance
- Base URL from `VITE_API_URL` env var
- JWT auto-attached via interceptors
- 401 auto-refresh with token rotation
- Timeout: 30 seconds
- ApiError interface: `{ message, errors, statusCode }`
- Sonner for toasts: `toast.success()`, `toast.error()`
- 401: logout and redirect to login
- 403: "No tienes permisos" error
### Import Order
### Hooks
- `usePageTitle(title, subtitle?)` - Called at top of EVERY page component
- `use-toast` from sonner
- Other hooks in `src/hooks/`
## Cross-Cutting Patterns
### Logging
- Serilog with structured logging
- WideEvent system for business events
- Log levels: Information, Warning, Error
- Context enrichment with `EnrichWideEvent()`
- Console logging only in development
- No production logging to console
- Error tracking via API error responses
### Validation Messages
- All validation messages in **Spanish**
- User-friendly, clear descriptions
- Examples: `"El correo no es válido"`, `"El nombre debe tener al menos 3 caracteres"`
### Error Handling
- Never throw for business logic - use ErrorOr<T>
- FluentValidation for input validation
- CommonErrors helper for standard error types
- ApiResponse<T> wrapper for all HTTP responses
- Try-catch with API error handling
- Toast notifications for user feedback
- Redirect on auth failures
- Error details displayed in form fields
### Constants
- `AuthorizationConstants` - role/permission codes
- Error codes in `CommonErrors.cs`
- Feature-specific constants in feature folders
- Feature-specific constants in feature folders
- No magic strings - use named constants
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Clean Architecture with domain-centric feature modules
- Vertical slice pattern: each feature contains its own controllers, services, DTOs, and validators
- ErrorOr pattern for service layer error handling
- Separation of concerns: Domain, Features, Infrastructure, Shared
- CQRS-like service interfaces separating read/write operations
## Layers
- Purpose: Core business entities and contracts
- Location: `lefarma.backend/src/Lefarma.API/Domain/`
- Contains: `Entities/` (business entities), `Interfaces/` (repository and service contracts)
- Depends on: Nothing (domain-centric)
- Used by: Features layer (services), Infrastructure layer (repositories)
- Purpose: Self-contained feature modules implementing business logic
- Location: `lefarma.backend/src/Lefarma.API/Features/`
- Contains: Feature-specific controllers, services, DTOs, validators, handlers
- Depends on: Domain layer, Shared layer, Infrastructure layer
- Used by: API entry points (controllers)
- Purpose: External concerns and data access
- Location: `lefarma.backend/src/Lefarma.API/Infrastructure/`
- Contains: `Data/` (DbContext, repositories, configurations), `Filters/`, `Middleware/`, `Templates/`
- Depends on: Domain layer (entities)
- Used by: Features layer (repositories), Program.cs (DI configuration)
- Purpose: Cross-cutting utilities and common abstractions
- Location: `lefarma.backend/src/Lefarma.API/Shared/`
- Contains: `Authorization/`, `Constants/`, `Errors/`, `Extensions/`, `Logging/`, `Models/`
- Depends on: Nothing
- Used by: All layers
- Purpose: Infrastructure services (identity, auth, AD integration)
- Location: `lefarma.backend/src/Lefarma.API/Services/`
- Contains: `Identity/` (AD, JWT, token services)
- Depends on: Shared layer, external libraries (DirectoryServices)
- Used by: Program.cs, Features layer
## Data Flow
- Backend: EF Core DbContext with repository pattern, AsNoTracking for read operations
- Frontend: Zustand for global state (auth, notifications), Jotai for atomic state
- LocalStorage: JWT tokens, user profile, empresa/sucursal selection
## Key Abstractions
- Purpose: Type-safe error handling without exceptions
- Examples: `lefarma.backend/src/Lefarma.API/Shared/Extensions/ResultExtensions.cs`
- Pattern: Services return `ErrorOr<T>`, controllers use `.ToActionResult(this, data => ...)`
- Purpose: Consistent API response structure across all endpoints
- Examples: All controller responses in `Features/*/Controllers/*.cs`
- Pattern: `{ Success: bool, Message: string, Data?: T, Errors?: ErrorDetail[] }`
- Purpose: Data access abstraction
- Examples: `Infrastructure/Data/Repositories/Catalogos/*.cs`
- Pattern: `IRepository<T>` interface, scoped service, EF Core DbContext
- Purpose: Configurable business process orchestration
- Examples: `Features/Config/Engine/WorkflowEngine.cs`, `Features/Config/Workflows/`
- Pattern: Keyed services for step handlers, participant-based approval flows
- Purpose: Multi-channel notification system
- Examples: `Features/Notifications/Services/Channels/`
- Pattern: `INotificationChannel` interface, keyed services (email, telegram, in-app)
## Entry Points
- Location: `lefarma.backend/src/Lefarma.API/Program.cs`
- Triggers: HTTP requests on port 5134
- Responsibilities: DI container, middleware pipeline, Swagger, authentication/authorization
- Location: `lefarma.frontend/src/App.tsx`, `lefarma.frontend/src/main.tsx`
- Triggers: Browser loads React app
- Responsibilities: Router setup, auth initialization, toast notifications
- Location: `lefarma.frontend/src/routes/AppRoutes.tsx`
- Triggers: URL navigation
- Responsibilities: Route definitions, auth guards, permission checks
## Error Handling
- **Validation:** `ValidationFilter` (global) + FluentValidation per-request DTO
- **Business logic:** Services return `ErrorOr<T>` with typed errors (NotFound, Validation, Conflict, Failure)
- **API responses:** `ResultExtensions.ToActionResult()` converts ErrorOr to proper HTTP status codes
- **Frontend:** Axios interceptors handle 401 (refresh token) and 403 (no permissions)
- **Wide Events:** Rich error context logged per request with error type, code, fields, severity
## Cross-Cutting Concerns
- Serilog with JSON file output (`logs/wide-events-.json`)
- WideEvent pattern: Single rich event per request with structured context
- Microsoft logs filtered to Warning+ (except EF Core = Fatal)
- FluentValidation for all request DTOs
- ValidationFilter applies validators automatically
- XML docs (`///`) on all public methods and classes
- `required` keyword for non-nullable DTO properties
- LDAP (Active Directory) integration via `System.DirectoryServices.Protocols`
- JWT tokens (access + refresh) via `Microsoft.AspNetCore.Authentication.JwtBearer`
- Three-step login: username → domain/password → empresa/sucursal selection
- Dev token bypass in Development (`tt01tt`)
- Role-based access control (RBAC) with permissions
- Authorization policies: `RequireAdministrator`, `RequireManager`, `RequireFinance`, `RequirePaymentProcessing`
- Permission-based policies for granular access
- `PermissionGuard` component in frontend for route-level permissions
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
