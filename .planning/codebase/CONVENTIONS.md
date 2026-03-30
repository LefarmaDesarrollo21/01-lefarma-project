# Coding Conventions

**Analysis Date:** 2026-03-30

## Backend (C#) Conventions

### Naming Patterns

**Files:**
- One class per file
- File name matches class name exactly
- PascalCase for classes and files: `ProfileService.cs`, `NotificationService.cs`

**Classes and Methods:**
- PascalCase for classes, methods, properties, public fields
- camelCase for local variables, parameters, private fields (prefixed with `_`)
- Examples: `GetProfileAsync()`, `_profileService`, `userId`

**DTOs:**
- `{Entity}Response` for response DTOs
- `Create{Entity}Request` for creation DTOs
- `Update{Entity}Request` for update DTOs
- Examples: `ProfileResponse`, `UpdateProfileRequest`

**Validators:**
- Named `{Request}Validator`: `UpdateProfileRequestValidator`
- Inherit from `AbstractValidator<T>`

### Code Style

**XML Documentation:**
- XML docs (`///`) on ALL public methods and classes
- `<summary>`, `<param>`, `<returns>` tags required
- Spanish comments and validation messages
- Example: `/// <summary>/// Obtiene el perfil del usuario autenticado/// </summary>`

**Swagger Annotations:**
- All controller endpoints require `[SwaggerOperation(Summary = "...")]`
- `[ProducesResponseType]` attributes for success and error cases
- `[EndpointGroupName("Feature")]` for organization

**Async Pattern:**
- All async methods end with `Async` suffix
- Always accept `CancellationToken cancellationToken = default`
- Pass through to all async calls
- Example: `public async Task<ErrorOr<ProfileResponse>> GetProfileAsync(int userId, CancellationToken cancellationToken = default)`

**Dependency Injection:**
- Constructor injection only - no `new` for dependencies
- All services registered in `Program.cs` with `AddScoped` or `AddTransient`
- Required parameters validated with `?? throw new ArgumentNullException(nameof(param))`

**Error Handling:**
- **ErrorOr<T>** for ALL service return types - services never throw for business logic
- Use `CommonErrors.NotFound()`, `CommonErrors.Validation()`, etc.
- Return `ErrorOr.Error` with descriptive codes
- Examples: `return CommonErrors.NotFound("Usuario", userId.ToString());`

**Validation:**
- **FluentValidation** for ALL request DTOs
- Validators registered in `Program.cs`: `builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());`
- Use `RuleFor()` chains with `When()` for conditional validation
- Spanish error messages: `"El correo no es válido"`

**Required Properties:**
- Use `required` keyword for non-nullable DTO properties
- Example: `public required string Nombre { get; set; }`

**Database Queries:**
- Use `AsNoTracking()` for read queries
- Explicit `Include()` for eager loading
- Async methods: `FirstOrDefaultAsync()`, `ToListAsync()`

### Controller Patterns

**Response Wrapping:**
- ALL controller responses wrapped in `ApiResponse<T>`
- Use `.ToActionResult(this, data => Ok(new ApiResponse<T> { ... }))` extension
- Example:
```csharp
return result.ToActionResult(this, data => Ok(new ApiResponse<ProfileResponse>
{
    Success = true,
    Data = data
}));
```

**Route Attributes:**
- Controllers: `[Route("api/[controller]")]`
- Methods: `[HttpGet]`, `[HttpPut]`, `[HttpPost]`, etc.
- Attributes: `[Authorize]`, `[ApiController]`

## Frontend (TypeScript/React) Conventions

### File Organization

**Type Files:**
- Convention: `{feature}.types.ts`
- Location: `src/types/`
- Examples: `catalogo.types.ts`, `auth.types.ts`, `api.types.ts`

**Component Files:**
- Functional components only - no class components
- Default exports for page components
- shadcn/ui components in `src/components/ui/`

### Formatting

**Prettier Configuration:**
- Single quotes: `'string'`
- Semicolons: required
- Indent: 2 spaces
- Trailing commas: ES5 (always)
- Print width: 100
- Tailwind class sorting via `prettier-plugin-tailwindcss`

**ESLint:**
- Flat config format (`eslint.config.js`)
- TypeScript recommended rules
- React Hooks rules
- React Refresh for HMR
- max-warnings: 0 enforced in build
- Extensions: `.ts`, `.tsx`

### TypeScript

**Strict Mode:**
- `strict: true` enabled
- No `any` types - use `unknown` or proper types
- `noUnusedLocals` and `noUnusedParameters` set to `false` (deliberate)

**Path Aliases:**
- `@/*` → `./src/*` configured in `tsconfig.json`
- Use for all internal imports: `import { Button } from '@/components/ui/button'`

**Type Definitions:**
- Interface patterns for API responses:
```typescript
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  errors?: string[];
}
```

### React Patterns

**Components:**
- Functional components only - no class components
- Default exports for page components
- shadcn/ui primitives for all UI elements
- Use `cn()` utility for class merging: `className={cn(buttonVariants({ variant }))}`

**Forms:**
- **React Hook Form + Zod** for ALL forms
- Define schema with Zod first: `const schema = z.object({...})`
- Infer type: `type FormValues = z.infer<typeof schema>`
- Resolver: `zodResolver(schema)`

**State Management:**
- **Zustand** for global state (auth, page, notifications)
- **Jotai** for atomic state
- Local state with `useState` for component-level

**Routing:**
- React Router v7 for navigation
- Protected routes with `ProtectedRoute` wrapper
- Public routes with `PublicOnlyRoute` wrapper

**UI Components:**
- All primitives from shadcn/ui (new-york variant, Radix + TailwindCSS)
- Check `components/ui/` before building custom
- Use `cv` (class-variance-authority) for variants

### API Integration

**HTTP Client:**
- Use `API` from `@/services/api` - Axios instance
- Base URL from `VITE_API_URL` env var
- JWT auto-attached via interceptors
- 401 auto-refresh with token rotation
- Timeout: 30 seconds

**Error Handling:**
- ApiError interface: `{ message, errors, statusCode }`
- Sonner for toasts: `toast.success()`, `toast.error()`
- 401: logout and redirect to login
- 403: "No tienes permisos" error

### Import Order

**Convention:**
1. React / third-party libraries
2. UI components (`@/components/ui/`)
3. App components (`@/components/layout/`, etc.)
4. Services, stores, hooks (`@/services/`, `@/store/`, `@/hooks/`)
5. Types (`@/types/`)
6. Utilities (`@/lib/`)

**Example:**
```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { API } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ApiResponse } from '@/types/api.types';
import { cn } from '@/lib/utils';
```

### Hooks

**Custom Hooks:**
- `usePageTitle(title, subtitle?)` - Called at top of EVERY page component
- `use-toast` from sonner
- Other hooks in `src/hooks/`

**Page Pattern:**
```typescript
export default function SomePage() {
  usePageTitle('Page Title', 'Optional subtitle');

  const [state, setState] = useState();

  // ... rest of component
}
```

## Cross-Cutting Patterns

### Logging

**Backend:**
- Serilog with structured logging
- WideEvent system for business events
- Log levels: Information, Warning, Error
- Context enrichment with `EnrichWideEvent()`

**Frontend:**
- Console logging only in development
- No production logging to console
- Error tracking via API error responses

### Validation Messages

**Language:**
- All validation messages in **Spanish**
- User-friendly, clear descriptions
- Examples: `"El correo no es válido"`, `"El nombre debe tener al menos 3 caracteres"`

### Error Handling

**Backend:**
- Never throw for business logic - use ErrorOr<T>
- FluentValidation for input validation
- CommonErrors helper for standard error types
- ApiResponse<T> wrapper for all HTTP responses

**Frontend:**
- Try-catch with API error handling
- Toast notifications for user feedback
- Redirect on auth failures
- Error details displayed in form fields

### Constants

**Backend:**
- `AuthorizationConstants` - role/permission codes
- Error codes in `CommonErrors.cs`
- Feature-specific constants in feature folders

**Frontend:**
- Feature-specific constants in feature folders
- No magic strings - use named constants

---

*Convention analysis: 2026-03-30*
