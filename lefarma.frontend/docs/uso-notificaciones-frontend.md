# Guía del Frontend - Sistema de Notificaciones

Esta guía explica cómo usar el sistema de notificaciones desde el frontend (React/TypeScript).

## Servicio de Notificaciones (Frontend)

El servicio `notificationService` está ubicado en `src/services/notificationService.ts`.

### Métodos Disponibles

```typescript
class NotificationService {
  sendNotification(request: SendNotificationRequest): Promise<SendNotificationResponse>
  sendBulkNotification(request: BulkNotificationRequest): Promise<SendNotificationResponse>
  sendByRole(request: RoleNotificationRequest): Promise<SendNotificationResponse>
  getUserNotifications(userId: number, filter?: NotificationFilter): Promise<UserNotification[]>
  markAsRead(notificationId: number, userId: number): Promise<void>
  markAllAsRead(userId: number): Promise<void>
  getUnreadCount(userId: number): Promise<number>
  sendTestNotification(channelType: 'email' | 'telegram' | 'in-app'): Promise<SendNotificationResponse>
}
```

---

## Ejemplo Rápido

```typescript
import { notificationService } from '@/services/notificationService';
import { useAuthStore } from '@/store/authStore';

function EnviarNotificacionButton() {
  const { user } = useAuthStore();

  const handleEnviar = async () => {
    await notificationService.sendNotification({
      channels: [
        { channelType: 'in-app', userIds: [user?.id || 0] },
        { channelType: 'email', userIds: [user?.id || 0] }
      ],
      title: '✅ Gasto Aprobado',
      message: '<p>Tu solicitud ha sido <strong>aprobada</strong></p>',
      type: 'success',
      priority: 'normal',
      category: 'gastos'
    });
  };

  return <button onClick={handleEnviar}>Enviar Notificación</button>;
}
```

---

## SSE - Conexión en Tiempo Real

Las notificaciones llegan automáticamente vía SSE. No necesitas hacer polling.

```typescript
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationList } from '@/hooks/useNotifications';

function MiComponente() {
  // Conexión SSE (automática cuando estás autenticado)
  const { isConnected, error } = useNotifications();

  // Lista de notificaciones con contador automático
  const { notifications, unreadCount, markAsRead } = useNotificationList();

  return (
    <div>
      <div>Estado SSE: {isConnected ? '🟢' : '🔴'}</div>
      <div>Notificaciones: {unreadCount}</div>
      {notifications.map(n => (
        <div key={n.id}>{n.notification?.title}</div>
      ))}
    </div>
  );
}
```

---

## Referencias

- **Servicio**: `src/services/notificationService.ts`
- **Tipos**: `src/types/notification.types.ts`
- **Hook SSE**: `src/hooks/useNotifications.ts`
- **Store**: `src/store/notificationStore.ts`
