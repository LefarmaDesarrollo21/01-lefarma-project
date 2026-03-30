# AGENTS.md — Lefarma Project

Pharmaceutical management system: .NET 10 backend API + React 19 frontend. Modular monolith with feature-based organization.

## Build & Run Commands

### Backend (from repo root)

```bash
# Run API (port 5134)
cd lefarma.backend/src/Lefarma.API && fuser -k 5134/tcp 2>/dev/null; dotnet run

# Build
dotnet build lefarma.backend/src/Lefarma.API

# Run ALL tests
dotnet test lefarma.backend

# Run single test project
dotnet test lefarma.backend/tests/Lefarma.Tests
dotnet test lefarma.backend/tests/Lefarma.UnitTests
dotnet test lefarma.backend/tests/Lefarma.IntegrationTests

# Run single test by name
dotnet test lefarma.backend --filter "FullyQualifiedName~NotificationServiceTests.SendAsync_ValidRequest"

# Run single test by trait
dotnet test lefarma.backend --filter "Category=Unit"

# EF Core migrations (from Lefarma.API directory)
dotnet ef migrations add <Name>
dotnet ef database update
dotnet ef database update 0          # Rollback all
dotnet ef migrations remove          # Remove last
```

### Frontend (from repo root)

```bash
cd lefarma.frontend

npm install                          # Install deps
npm run dev                          # Dev server (port 5173)
npm run build                        # Production build (tsc + vite)
npm run lint                         # ESLint (max-warnings 0)
npm run format                       # Prettier write
npx tsc --noEmit                     # Type-check only
```

## Project Structure

### Backend (`lefarma.backend/src/Lefarma.API/`)

```
Domain/           → Entities + Interfaces (per module: Auth, Catalogos, etc.)
Features/         → Self-contained feature modules
  Auth/           → Controllers, Services, DTOs, Validators
  Catalogos/      → [Feature]/ → Controller, Service, IService, Validator, DTOs/, Extensions/
  Notifications/  → Services, Channels, DTOs
Infrastructure/   → Data (DbContext, Repositories, Configurations, Seeding), Filters, Middleware
Services/         → Identity (AD, JWT, Token)
Shared/           → Auth, Constants, Errors, Extensions, Logging, Models, Services
```

### Frontend (`lefarma.frontend/src/`)

```
components/ui/    → shadcn/ui components (new-york style, Radix + TailwindCSS)
components/layout/→ Header, Sidebar, MainLayout
pages/            → Feature pages (auth/, catalogos/, configuracion/)
routes/           → AppRoutes, ProtectedRoute, PublicOnlyRoute
services/         → api.ts (Axios + JWT interceptors), authService.ts
store/            → Zustand stores (authStore, pageStore, etc.)
hooks/            → usePageTitle, use-toast, useNotifications
types/            → TypeScript definitions (*.types.ts)
lib/              → Utilities (utils.ts with cn() helper)
```

## Code Style — Backend (C#)

### Naming Conventions
- **PascalCase**: Classes, methods, properties, public fields
- **camelCase**: Local variables, parameters, private fields (prefixed with `_`)
- **DTO naming**: `{Entity}Response`, `Create{Entity}Request`, `Update{Entity}Request`
- **Files**: One class per file, file name matches class name

### Patterns (MANDATORY)
- **ErrorOr<T>** for service return types — services return `ErrorOr<T>`, never throw for business logic
- **Constructor injection** — no `new` for dependencies; register in `Program.cs`
- **FluentValidation** for all request DTOs — register validators in DI
- **XML docs** (`///`) on all public methods and classes
- **Swagger annotations** (`[SwaggerOperation]`, `[SwaggerResponse]`) on all controller endpoints
- **`ApiResponse<T>`** wrapper on all controller responses
- **`result.ToActionResult(this, ...)`** extension to convert ErrorOr results to IActionResult
- **Async suffix**: All async methods end with `Async`
- **`required` keyword**: Use `required` for non-nullable DTO properties
- **`CancellationToken`**: Always accept and pass through in async methods

### Adding a New Catalog Feature
1. Entity in `Domain/Entities/Catalogos/`
2. EF config in `Infrastructure/Data/Configurations/Catalogos/`
3. Interface in `Domain/Interfaces/Catalogos/I{Feature}Repository.cs`
4. Repository in `Infrastructure/Data/Repositories/Catalogos/{Feature}Repository.cs`
5. Service interface + impl in `Features/Catalogos/{Feature}/`
6. Validator in `Features/Catalogos/{Feature}/`
7. DTOs in `Features/Catalogos/{Feature}/DTOs/`
8. Controller in `Features/Catalogos/{Feature}/` — route: `api/catalogos/[controller]`
9. Register all in `Program.cs`

## Code Style — Frontend (TypeScript/React)

### Formatting (enforced by Prettier)
- Single quotes, semicolons, 2-space indent, trailing commas (ES5), printWidth 100
- Tailwind class sorting via `prettier-plugin-tailwindcss`

### TypeScript
- **Strict mode** enabled (`strict: true`)
- Path aliases: `@/*` → `./src/*` (configured in tsconfig + vite-tsconfig-paths)
- Type files: `*.types.ts` convention
- No `any` — use `unknown` or proper types

### Component Patterns
- **Functional components** only — no class components
- **Default exports** for page components
- **shadcn/ui** for all UI primitives — check `components/ui/` before building custom
- **React Hook Form + Zod** for all forms — define schema with Zod, infer type
- **`usePageTitle(title, subtitle?)`** called at top of every page component
- **Zustand** for global state (auth, page title), **Jotai** for atomic state
- **Sonner** for toast notifications (`toast.success()`, `toast.error()`)

### API Integration
- Use `API` from `@/services/api` — Axios instance with JWT auto-attach and 401 refresh
- API base URL: `VITE_API_URL` (default: `http://localhost:5134/api`)

### Import Order (convention)
1. React / third-party libraries
2. UI components (`@/components/ui/`)
3. App components (`@/components/layout/`, etc.)
4. Services, stores, hooks (`@/services/`, `@/store/`, `@/hooks/`)
5. Types (`@/types/`)
6. Utilities (`@/lib/`)

## Testing

### Backend (xUnit + FluentAssertions + Moq)
```csharp
[Fact]
public async Task MethodName_Scenario_ExpectedResult()
{
    // Arrange
    var mockRepo = new Mock<IRepository>();
    var service = new Service(mockRepo.Object);

    // Act
    var result = await service.MethodAsync();

    // Assert
    result.Should().NotBeNull();
}
```

### Frontend (Playwright)
```bash
npx playwright test                              # Run all E2E tests
npx playwright test --grep "test name"           # Run specific test
```

## Key Conventions

- **Port**: Backend 5134, Frontend 5173, Swagger at 5134 in Development
- **Database**: SQL Server with EF Core 10, `AsNoTracking` for reads
- **Auth**: LDAP + JWT, master password `tt01tt` for dev bypass
- **Git**: Conventional commits (`feat:`, `fix:`, `docs:`, etc.). No "Co-Authored-By" tags.
- **Validation messages**: In Spanish
- **Docs**: Update `lefarma.docs/` when changing entities, endpoints, pages, or components
- **Keep CLAUDE.md and AGENTS.md synchronized** when modifying either
