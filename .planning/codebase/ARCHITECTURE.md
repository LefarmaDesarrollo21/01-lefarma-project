# Architecture

**Analysis Date:** 2026-03-30

## Pattern Overview

**Overall:** Modular Monolith with Feature-Based Organization

**Key Characteristics:**
- Clean Architecture with domain-centric feature modules
- Vertical slice pattern: each feature contains its own controllers, services, DTOs, and validators
- ErrorOr pattern for service layer error handling
- Separation of concerns: Domain, Features, Infrastructure, Shared
- CQRS-like service interfaces separating read/write operations

## Layers

**Domain Layer (`Domain/`):**
- Purpose: Core business entities and contracts
- Location: `lefarma.backend/src/Lefarma.API/Domain/`
- Contains: `Entities/` (business entities), `Interfaces/` (repository and service contracts)
- Depends on: Nothing (domain-centric)
- Used by: Features layer (services), Infrastructure layer (repositories)

**Features Layer (`Features/`):**
- Purpose: Self-contained feature modules implementing business logic
- Location: `lefarma.backend/src/Lefarma.API/Features/`
- Contains: Feature-specific controllers, services, DTOs, validators, handlers
- Depends on: Domain layer, Shared layer, Infrastructure layer
- Used by: API entry points (controllers)

**Infrastructure Layer (`Infrastructure/`):**
- Purpose: External concerns and data access
- Location: `lefarma.backend/src/Lefarma.API/Infrastructure/`
- Contains: `Data/` (DbContext, repositories, configurations), `Filters/`, `Middleware/`, `Templates/`
- Depends on: Domain layer (entities)
- Used by: Features layer (repositories), Program.cs (DI configuration)

**Shared Layer (`Shared/`):**
- Purpose: Cross-cutting utilities and common abstractions
- Location: `lefarma.backend/src/Lefarma.API/Shared/`
- Contains: `Authorization/`, `Constants/`, `Errors/`, `Extensions/`, `Logging/`, `Models/`
- Depends on: Nothing
- Used by: All layers

**Services Layer (`Services/`):**
- Purpose: Infrastructure services (identity, auth, AD integration)
- Location: `lefarma.backend/src/Lefarma.API/Services/`
- Contains: `Identity/` (AD, JWT, token services)
- Depends on: Shared layer, external libraries (DirectoryServices)
- Used by: Program.cs, Features layer

## Data Flow

**Request → Response Flow:**

1. HTTP request hits controller action
2. `ValidationFilter` validates request DTOs using FluentValidation
3. Controller calls service method (via interface)
4. Service validates business logic and calls repository (via interface)
5. Repository queries `ApplicationDbContext` (EF Core)
6. Returns `ErrorOr<T>` result through layers
7. `ResultExtensions.ToActionResult()` converts ErrorOr to IActionResult
8. `ApiResponse<T>` wrapper ensures consistent JSON response structure
9. `WideEventLoggingMiddleware` logs rich event metadata per request

**State Management:**
- Backend: EF Core DbContext with repository pattern, AsNoTracking for read operations
- Frontend: Zustand for global state (auth, notifications), Jotai for atomic state
- LocalStorage: JWT tokens, user profile, empresa/sucursal selection

## Key Abstractions

**ErrorOr\<T> Pattern:**
- Purpose: Type-safe error handling without exceptions
- Examples: `lefarma.backend/src/Lefarma.API/Shared/Extensions/ResultExtensions.cs`
- Pattern: Services return `ErrorOr<T>`, controllers use `.ToActionResult(this, data => ...)`

**ApiResponse\<T> Wrapper:**
- Purpose: Consistent API response structure across all endpoints
- Examples: All controller responses in `Features/*/Controllers/*.cs`
- Pattern: `{ Success: bool, Message: string, Data?: T, Errors?: ErrorDetail[] }`

**Repository Pattern:**
- Purpose: Data access abstraction
- Examples: `Infrastructure/Data/Repositories/Catalogos/*.cs`
- Pattern: `IRepository<T>` interface, scoped service, EF Core DbContext

**Workflow Engine:**
- Purpose: Configurable business process orchestration
- Examples: `Features/Config/Engine/WorkflowEngine.cs`, `Features/Config/Workflows/`
- Pattern: Keyed services for step handlers, participant-based approval flows

**Notification Channels:**
- Purpose: Multi-channel notification system
- Examples: `Features/Notifications/Services/Channels/`
- Pattern: `INotificationChannel` interface, keyed services (email, telegram, in-app)

## Entry Points

**Backend API:**
- Location: `lefarma.backend/src/Lefarma.API/Program.cs`
- Triggers: HTTP requests on port 5134
- Responsibilities: DI container, middleware pipeline, Swagger, authentication/authorization

**Frontend App:**
- Location: `lefarma.frontend/src/App.tsx`, `lefarma.frontend/src/main.tsx`
- Triggers: Browser loads React app
- Responsibilities: Router setup, auth initialization, toast notifications

**Frontend Routes:**
- Location: `lefarma.frontend/src/routes/AppRoutes.tsx`
- Triggers: URL navigation
- Responsibilities: Route definitions, auth guards, permission checks

## Error Handling

**Strategy:** ErrorOr pattern + FluentValidation + ApiResponse wrapper

**Patterns:**
- **Validation:** `ValidationFilter` (global) + FluentValidation per-request DTO
- **Business logic:** Services return `ErrorOr<T>` with typed errors (NotFound, Validation, Conflict, Failure)
- **API responses:** `ResultExtensions.ToActionResult()` converts ErrorOr to proper HTTP status codes
- **Frontend:** Axios interceptors handle 401 (refresh token) and 403 (no permissions)
- **Wide Events:** Rich error context logged per request with error type, code, fields, severity

## Cross-Cutting Concerns

**Logging:**
- Serilog with JSON file output (`logs/wide-events-.json`)
- WideEvent pattern: Single rich event per request with structured context
- Microsoft logs filtered to Warning+ (except EF Core = Fatal)

**Validation:**
- FluentValidation for all request DTOs
- ValidationFilter applies validators automatically
- XML docs (`///`) on all public methods and classes
- `required` keyword for non-nullable DTO properties

**Authentication:**
- LDAP (Active Directory) integration via `System.DirectoryServices.Protocols`
- JWT tokens (access + refresh) via `Microsoft.AspNetCore.Authentication.JwtBearer`
- Three-step login: username → domain/password → empresa/sucursal selection
- Dev token bypass in Development (`tt01tt`)

**Authorization:**
- Role-based access control (RBAC) with permissions
- Authorization policies: `RequireAdministrator`, `RequireManager`, `RequireFinance`, `RequirePaymentProcessing`
- Permission-based policies for granular access
- `PermissionGuard` component in frontend for route-level permissions

---

*Architecture analysis: 2026-03-30*
