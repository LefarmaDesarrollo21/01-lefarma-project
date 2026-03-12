---
status: closed
created: 2026-03-11
updated: 2026-03-12
assignee: Sisyphus
completed: 2026-03-12
---

# Task-001: Sincronización de Usuario en Tiempo Real con SSE

## Descripción

Implementar un mecanismo de sincronización bidireccional entre el backend y frontend para mantener los datos del usuario actualizados en tiempo real. Cuando ocurran cambios en el nombre o permisos del usuario, el backend debe notificar al frontend mediante Server-Sent Events (SSE) para refrescar la información de inmediato.

## Problema Actual

El frontend almacena los datos del usuario en Zustand y localStorage, pero no existe un mecanismo para actualizar estos datos cuando cambian en el backend. Esto puede causar:
- Información desactualizada del usuario (nombre, avatar, etc.)
- Permisos obsoletos que no reflejan cambios recientes
- Necesidad de recargar la página para ver cambios

## Requisitos

### Backend

- [x] Crear endpoint SSE para suscripción a eventos de usuario
- [x] Implementar servicio de notificación de cambios de usuario
- [x] Detectar cambios en:
  - Nombre del usuario
  - Permisos/roles asignados
  - Información de perfil
- [x] Enviar eventos SSE cuando detecte cambios

### Frontend

- [x] Implementar conexión SSE en el cliente
- [x] Sincronizar datos en 2 pasos:
  1. **Paso 1**: Actualizar Zustand store (estado reactivo)
  2. **Paso 2**: Persistir en localStorage (persistencia)
- [x] Manejar reconexión automática si se pierde la conexión SSE
- [x] Actualizar UI inmediatamente al recibir eventos

## Criterios de Aceptación

- [x] Cuando un administrador cambia el nombre de un usuario, el frontend del usuario afectado se actualiza sin recargar
- [x] Cuando se modifican permisos de un usuario, su frontend refleja los nuevos permisos inmediatamente
- [x] Los datos del usuario persisten en localStorage y se cargan al iniciar la aplicación
- [x] La conexión SSE se reconecta automáticamente si falla
- [x] El token JWT sigue siendo válido durante la sesión
- [x] No hay parpadeos ni inconsistencias en la UI durante actualizaciones

## Flujo de Sincronización

```
┌─────────────┐      Cambio        ┌─────────────┐
│   Admin     │ ──────────────────>│   Backend   │
│  (Modifica) │                     │   (Detecta) │
└─────────────┘                     └──────┬──────┘
                                           │
                                           │ SSE Event
                                           ▼
                                    ┌─────────────┐
                                    │  Frontend   │
                                    │  (Recibe)   │
                                    └──────┬──────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        ▼                  ▼                  ▼
                 ┌──────────┐      ┌────────────┐     ┌──────────┐
                 │  Paso 1  │      │   Paso 2   │     │   Paso 3 │
                 │ Zustand  │─────>│ localStorage│────>│   UI     │
                 │  Update  │      │   Persist  │     │  Refresh │
                 └──────────┘      └────────────┘     └──────────┘
```

## Endpoints Propuestos

### Backend

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `api/auth/sse` | Conexión SSE para eventos de usuario |

### Eventos SSE

```json
{
  "event": "user.updated",
  "data": {
    "type": "profile" | "permissions",
    "user": {
      "id": "guid",
      "nombre": "string",
      "email": "string",
      "permisos": ["string"]
    }
  }
}
```

## Dependencias

- Ninguna (primera tarea)

## Estimación

- **Backend**: 4 horas
- **Frontend**: 3 horas
- **Testing**: 2 horas
- **Total**: ~9 horas

## Notas Técnicas

### Consideraciones

1. **Escalabilidad**: Considerar usar Redis Pub/Sub si hay múltiples instancias del backend
2. **Seguridad**: Validar que el usuario solo se suscriba a sus propios eventos
3. **Performance**: Usar heartbeat para mantener conexiones activas
4. **Fallback**: Si SSE no está disponible, usar polling como alternativa

### Tecnologías a Usar

- **Backend**: ASP.NET Core Server-Sent Events
- **Frontend**: EventSource API nativa del navegador

## Referencias

- [MDN: Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [ASP.NET Core SSE](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/signalr)

---

## Completion Summary

**Completed**: 2026-03-12

### Commits
1. `d2b0dc2` - feat(auth): Add SSE real-time user synchronization
2. `fc7fc57` - fix(frontend): Fix TypeScript config and demo component types
3. `b5e7716` - docs(task): Complete Task-001 SSE implementation

### Files Created/Modified

**Backend:**
- `Features/Auth/SseService.cs` - SSE service implementation with connection management
- `Features/Auth/ISseService.cs` - Service interface
- `Features/Auth/AuthController.cs` - SSE endpoint added
- `Program.cs` - DI registration

**Frontend:**
- `services/sseService.ts` - SSE client with auto-reconnect
- `hooks/useUserSync.ts` - React hook for user synchronization
- `types/sse.types.ts` - TypeScript types for SSE events
- `store/authStore.ts` - Zustand integration for SSE updates

**Config:**
- `tsconfig.json` - Fixed bundler mode configuration
