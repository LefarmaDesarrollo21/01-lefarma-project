# Plan: Login en 2 Pasos + Hero Landing Page

**Generated**: 2026-03-12

## Overview

Implementar un sistema de autenticación en 2 pasos que conecte con los endpoints existentes del backend, más una página Hero/Landing para usuarios no autenticados que explique las funcionalidades del sistema.

### Flujo de Usuario Final

1. **No autenticado en `/`**: Ve el Hero con features + botón "Iniciar Sesión"
2. **Click en "Iniciar Sesión"**: Navega a `/login`
3. **Paso 1 - Username**: Ingresa su username → Backend busca en Active Directory
4. **Si múltiples dominios**: Muestra selector de dominio
5. **Si un solo dominio**: Oculta el paso 1, va directo a paso 2
6. **Paso 2 - Password + Dominio**: Ingresa password y selecciona/confirmar dominio
7. **Autenticación exitosa**: Redirige a `/` (Dashboard)
8. **Ya autenticado en `/login`**: Redirige a `/` (Dashboard)

## Prerequisites

- Backend funcionando con endpoints de auth en 2 pasos
- React Router v7 configurado
- Zustand para estado
- Componentes UI de Radix/shadcn

## Dependency Graph

```
T1 ─────────────────────────────┐
T2 ─────────────────────────────┤
T3 ─────────────────────────────┤
                                ├──► T5 ──► T6 ──► T7
T4 ─────────────────────────────┘
```

## Tasks

### T1: Actualizar Types para Login 2 Pasos

- **depends_on**: []
- **location**: `lefarma.frontend/src/types/auth.types.ts`
- **description**: 
  - Agregar tipos para el flujo de login en 2 pasos:
    - `LoginStepOneRequest`: `{ username: string }`
    - `LoginStepOneResponse`: `{ domains: string[], requiresDomainSelection: boolean, displayName?: string }`
    - `LoginStepTwoRequest`: `{ username: string, password: string, domain: string }`
    - `LoginStepTwoResponse`: `{ accessToken: string, refreshToken: string, tokenType: string, expiresIn: number, user: UserInfo }`
    - `UserInfo`: `{ id: number, username: string, nombre?: string, correo?: string, dominio?: string, roles: RoleInfo[], permisos: PermissionInfo[] }`
  - Actualizar `User` para que coincida con `UserInfo` del backend
  - Actualizar `LoginCredentials` si es necesario
- **validation**: `npx tsc --noEmit` sin errores
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

---

### T2: Actualizar authService para 2 Pasos

- **depends_on**: []
- **location**: `lefarma.frontend/src/services/authService.ts`
- **description**: 
  - Agregar método `loginStepOne(username: string)`: llama `POST /api/auth/login-step-one`
  - Agregar método `loginStepTwo(request: LoginStepTwoRequest)`: llama `POST /api/auth/login-step-two`
  - Actualizar método `login()` para que use el flujo de 2 pasos o deprecarlo
  - Agregar método `refreshToken(refreshToken: string)`: llama `POST /api/auth/refresh`
  - Actualizar `logout()` para que llame al endpoint del backend
  - Guardar tanto `accessToken` como `refreshToken` en localStorage
  - Manejar mensajes de error claros desde el backend
- **validation**: `npx tsc --noEmit` sin errores
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

---

### T3: Actualizar authStore para Flujo 2 Pasos

- **depends_on**: []
- **location**: `lefarma.frontend/src/store/authStore.ts`
- **description**: 
  - Agregar estado para el flujo de login:
    - `loginStep: 1 | 2`
    - `availableDomains: string[]`
    - `requiresDomainSelection: boolean`
    - `displayName: string | null`
    - `pendingUsername: string | null`
  - Agregar acciones:
    - `loginStepOne(username)` → llama authService.loginStepOne, actualiza estado
    - `loginStepTwo(password, domain)` → llama authService.loginStepTwo, completa auth
    - `resetLoginFlow()` → limpia estado del flujo
  - Actualizar `initialize()` para cargar refresh token
  - Actualizar tipos de User para coincidir con backend
- **validation**: `npx tsc --noEmit` sin errores
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

---

### T4: Crear Componente Hero/Landing Page

- **depends_on**: []
- **location**: `lefarma.frontend/src/pages/Hero.tsx`
- **description**: 
  - Crear página Hero con:
    - Header con logo de Lefarma
    - Título: "Sistema de Gestión Farmacéutica"
    - Descripción breve del sistema
    - Grid de features/cards con iconos:
      - Gestión de Catálogos
      - Control de Inventarios
      - Reportes y Análisis
      - Gestión de Usuarios
      - Seguridad Avanzada
      - Multi-empresa
    - Botón prominente "Iniciar Sesión" que navega a `/login`
    - Footer con versión del sistema
  - Usar componentes Card existentes
  - Usar iconos de Lucide React
- **validation**: `npm run build` compila sin errores
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

---

### T5: Rediseñar Login.tsx con Stepper 2 Pasos

- **depends_on**: [T1, T2, T3]
- **location**: `lefarma.frontend/src/pages/auth/Login.tsx`
- **description**: 
  - Rediseñar completamente el login con flujo de 2 pasos:
  
  **Paso 1 - Ingresar Usuario:**
  - Campo de texto para username
  - Botón "Continuar"
  - Loader mientras busca dominios
  - Mostrar error si usuario no encontrado
  
  **Paso 2 - Ingresar Password y Dominio:**
  - Mostrar "Hola, {displayName}" si está disponible
  - Si `requiresDomainSelection === true`: Mostrar selector de dominios
  - Si `requiresDomainSelection === false`: Ocultar selector (dominio único)
  - Campo de password
  - Botón "Iniciar Sesión"
  - Link "Volver" para cambiar usuario
  
  **UI/UX:**
  - Usar stepper visual (Step 1, Step 2) en la parte superior
  - Transiciones suaves entre pasos
  - Mensajes de error claros desde el backend
  - Estados de loading apropiados
  - Mantener logo y branding actual
- **validation**: `npm run build` compila, flujo funciona end-to-end
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

---

### T6: Actualizar Sistema de Rutas

- **depends_on**: [T4, T5]
- **location**: `lefarma.frontend/src/routes/AppRoutes.tsx`, `PrivateRoute.tsx`, `PublicRoute.tsx`
- **description**: 
  - **AppRoutes.tsx**:
    - Reorganizar rutas para que `/` sea Hero si NO autenticado, Dashboard si autenticado
    - `/login` solo accesible si NO autenticado (redirige a `/` si ya auth)
    - Rutas protegidas usan PrivateRoute
    - Eliminar rutas duplicadas actuales
  
  - **PrivateRoute.tsx**:
    - Mantener lógica actual (redirige a `/login` si no auth)
  
  - **PublicRoute.tsx**:
    - Modificar para que rutas públicas redirijan a `/` (que mostrará Dashboard) si ya autenticado
    - O crear nueva ruta para Hero
  
  - **Estructura final**:
    ```
    / → Hero (no auth) | Dashboard (auth)
    /login → Login 2 pasos (solo no auth)
    /catalogos/* → Protegido
    /configuracion → Protegido
    /perfil → Protegido
    ```
- **validation**: Navegación funciona correctamente en ambos estados (auth/no auth)
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

---

### T7: Actualizar api.ts para Manejar Refresh Token

- **depends_on**: [T2, T5]
- **location**: `lefarma.frontend/src/services/api.ts`
- **description**: 
  - Implementar refresh token automático en el interceptor de response:
    - Cuando收到 401, intentar refrescar el token con el refresh token almacenado
    - Si el refresh es exitoso, reintentar la petición original
    - Si el refresh falla, hacer logout y redirigir a login
  - Guardar `accessToken` y `refreshToken` por separado
  - Actualizar header Authorization con el nuevo access token
- **validation**: Token refresh funciona automáticamente, no hay loops infinitos
- **status**: Not Completed
- **log**: 
- **files edited/created**: 

---

## Parallel Execution Groups

| Wave | Tasks | Can Start When |
|------|-------|----------------|
| 1 | T1, T2, T3, T4 | Immediately |
| 2 | T5 | T1, T2, T3 complete |
| 3 | T6 | T4, T5 complete |
| 4 | T7 | T2, T5 complete |

## Testing Strategy

### Backend (ya implementado)
1. `POST /api/auth/login-step-one` con username válido → retorna dominios
2. `POST /api/auth/login-step-one` con username inválido → error 404
3. `POST /api/auth/login-step-two` con credenciales correctas → retorna tokens
4. `POST /api/auth/login-step-two` con password incorrecto → error 401
5. `POST /api/auth/refresh` con refresh token válido → nuevos tokens
6. `POST /api/auth/logout` → cierra sesión

### Frontend
1. Usuario no autenticado ve Hero en `/`
2. Click en "Iniciar Sesión" navega a `/login`
3. Login Paso 1: username válido muestra paso 2
4. Login Paso 1: usuario único salta selector de dominio
5. Login Paso 2: credenciales correctas redirigen a Dashboard
6. Login Paso 2: credenciales incorrectas muestran error claro
7. Usuario autenticado ve Dashboard en `/`
8. Usuario autenticado en `/login` redirige a `/`
9. Refresh token automático funciona
10. Logout limpia todo y redirige a Hero

## Risks & Mitigations

| Riesgo | Mitigación |
|--------|------------|
| Backend no responde | Mostrar mensaje claro "Servicio no disponible" |
| Usuario en múltiples dominios | Selector claro con nombres de dominio amigables |
| Token expira durante uso | Refresh automático transparente |
| Estado de auth inconsistente | Limpiar localStorage en errores críticos |
| Mensajes de error confusos | Mapear errores del backend a mensajes user-friendly |

## Backend Messages Reference

El backend ya envía mensajes claros en español:
- `"Usuario encontrado exitosamente."` - Paso 1 OK, un dominio
- `"Usuario encontrado en multiples dominios. Seleccione un dominio."` - Paso 1 OK, múltiples dominios
- `"Usuario no encontrado"` - Error 404
- `"Autenticacion exitosa."` - Login completo
- `"Credenciales invalidas"` - Error 401
- `"Token refrescado exitosamente."` - Refresh OK
- `"Sesion cerrada exitosamente."` - Logout OK

Estos mensajes deben mostrarse directamente al usuario o usarse para determinar el estado del flujo.
