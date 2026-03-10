# Routes - Frontend Documentation

## Índice

- [Configuración Principal](#configuración-principal)
- [Rutas Definidas](#rutas-definidas)
- [Protección de Rutas](#protección-de-rutas)
- [Estructura de Rutas](#estructura-de-rutas)

---

## Configuración Principal

**Archivo:** `src/routes/AppRoutes.tsx`

Componente principal de enrutamiento que define todas las rutas de la aplicación.

### Implementación

```tsx
import { Routes, Route } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { PrivateRoute } from './PrivateRoute';
import { MainLayout } from '@/components/layout/MainLayout';

export function AppRoutes() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rutas Protegidas */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/roles" element={<RolesList />} />
          <Route path="/permisos" element={<PermisosList />} />
          <Route path="/configuracion" element={<ConfiguracionGeneral />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

---

## Rutas Definidas

| Ruta | Componente | Layout | Descripción |
|------|------------|--------|-------------|
| `/login` | `Login` | - | Página de inicio de sesión |
| `/` | `Dashboard` | MainLayout | Página principal (dashboard) |
| `/roles` | `RolesList` | MainLayout | Gestión de roles |
| `/permisos` | `PermisosList` | MainLayout | Gestión de permisos |
| `/configuracion` | `ConfiguracionGeneral` | MainLayout | Configuración general |
| `/perfil` | `Perfil` | MainLayout | Perfil de usuario |
| `*` | `NotFound` | - | Página 404 |

---

## Protección de Rutas

### PrivateRoute

**Archivo:** `src/routes/PrivateRoute.tsx`

Protege rutas que requieren autenticación.

```tsx
export function PrivateRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
```

**Comportamiento:**
- Si el usuario **no está autenticado** → redirige a `/login`
- Si el usuario **está autenticado** → renderiza rutas hijas (`<Outlet />`)

### PublicRoute

**Archivo:** `src/routes/PublicRoute.tsx`

Protege rutas públicas (solo accesibles sin autenticación).

```tsx
export function PublicRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

**Comportamiento:**
- Si el usuario **está autenticado** → redirige a `/` (dashboard)
- Si el usuario **no está autenticado** → renderiza rutas hijas

---

## Estructura de Rutas

```
AppRoutes
├── PublicRoute (wrapper)
│   └── /login → Login
│
├── PrivateRoute (wrapper)
│   └── MainLayout (wrapper)
│       ├── / → Dashboard
│       ├── /roles → RolesList
│       ├── /permisos → PermisosList
│       ├── /configuracion → ConfiguracionGeneral
│       └── /perfil → Perfil
│
└── * → NotFound
```

---

## Navegación

### En Componentes

```tsx
import { useNavigate, Link } from 'react-router-dom';

// Usando Link
<Link to="/roles">Ver Roles</Link>

// Usando useNavigate
const navigate = useNavigate();
navigate('/login');
navigate(-1); // Go back
```

### Redirección Programática

```tsx
import { Navigate } from 'react-router-dom';

// En render
<Navigate to="/login" replace />

// En lógica
const navigate = useNavigate();
navigate('/dashboard', { replace: true });
```

---

## URLs del API

Las rutas del frontend se corresponden con endpoints del backend:

| Frontend | Backend API |
|----------|-------------|
| `/roles` | `GET /api/roles` |
| `/permisos` | `GET /api/permisos` |
| Dashboard stats | `GET /api/empresas`, `GET /api/sucursales`, etc. |

---

## Futuras Rutas (Planificación)

Basado en los catálogos del backend:

| Ruta Planificada | Componente | Catálogo Backend |
|------------------|------------|------------------|
| `/empresas` | `EmpresasList` | Empresas |
| `/sucursales` | `SucursalesList` | Sucursales |
| `/areas` | `AreasList` | Áreas |
| `/tipos-gasto` | `TiposGastoList` | TipoGastos |
| `/tipos-medida` | `TiposMedidaList` | TiposMedida |
| `/unidades-medida` | `UnidadesMedidaList` | UnidadesMedida |
