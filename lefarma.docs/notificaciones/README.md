# Sistema de Notificaciones - Lefarma

Documentación completa del sistema multi-canal de notificaciones para Lefarma.

## 📋 Tabla de Contenidos

- [Overview](#overview)
- [Arquitectura](#arquitectura)
- [Configuración Backend](#configuración-backend)
- [Configuración Frontend](#configuración-frontend)
- [Uso del Sistema](#uso-del-sistema)
- [API Endpoints](#api-endpoints)
- [Componentes Frontend](#componentes-frontend)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

El sistema de notificaciones de Lefarma permite enviar notificaciones a través de múltiples canales:

- **Email**: Notificaciones por correo electrónico usando SMTP (MailKit)
- **Telegram**: Notificaciones vía Telegram Bot API
- **In-App**: Notificaciones en tiempo real usando Server-Sent Events (SSE)

### Características Principales

✅ Multi-canal (email, telegram, in-app)
✅ Plantillas personalizables (Razor/Handlebars)
✅ Envío masivo a múltiples usuarios
✅ Envío por roles
✅ Programación de envío
✅ Reintentos automáticos
✅ Seguimiento de entregas
✅ Notificaciones en tiempo real (SSE)

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Notification │  │ Notification │  │   SSE Hook   │      │
│  │    Bell      │  │    List      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/SSE
┌────────────────────────────┼─────────────────────────────────┐
│                         Backend (.NET)                       │
│                            │                                 │
│  ┌───────────────────────────────────────────────────┐      │
│  │           NotificationsController                  │      │
│  └───────────────────────┬───────────────────────────┘      │
│                          │                                   │
│  ┌───────────────────────▼───────────────────────────┐      │
│  │            NotificationService                      │      │
│  │  - Orquesta envío a múltiples canales               │      │
│  │  - Gestiona plantillas                              │      │
│  │  - Controla reintentos                              │      │
│  └───┬───────────┬────────────┬──────────────────────┘      │
│      │           │            │                              │
│  ┌───▼────┐  ┌──▼─────┐  ┌───▼────────┐                   │
│  │ Email  │  │Telegram│  │ In-App     │                   │
│  │Channel │  │Channel │  │Channel     │                   │
│  └────┬───┘  └───┬────┘  └────┬───────┘                   │
│       │          │             │                           │
│  ┌────▼────┐ ┌──▼────┐  ┌────▼─────────┐                │
│  │  SMTP   │ │Telegram│ │ SSE Service  │                │
│  │ MailKit │ │   API  │ │   (SignalR)  │                │
│  └─────────┘ └────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                      Database (SQL Server)                  │
│                            │                                 │
│  ┌──────────────────────────────────────────────┐          │
│  │  - Notifications                               │          │
│  │  - NotificationChannels                        │          │
│  │  - UserNotifications                           │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Configuración Backend

### 1. Ejecutar Script SQL

Primero, ejecuta el script para crear las tablas necesarias:

```bash
# Ubicación del script
lefarma.database/create_notification_tables.sql
```

Ejecuta este script en SQL Server Management Studio o Azure Data Studio contra la base de datos `Lefarma`.

### 2. Configurar appsettings.json

El archivo `appsettings.Development.json` ya contiene la configuración necesaria:

```json
{
  "EmailSettings": {
    "Provider": "SMTP",
    "FromEmail": "autorizaciones@grupolefarma.com.mx",
    "FromName": "Grupo Lefarma",
    "Smtp": {
      "Host": "mail.grupolefarma.com.mx",
      "Port": 587,
      "EnableSsl": true,
      "Username": "autorizaciones@grupolefarma.com.mx",
      "Password": "tu-password-aqui",
      "Timeout": 30000
    }
  },
  "TelegramSettings": {
    "BotToken": "tu-bot-token-aqui",
    "ApiUrl": "https://api.telegram.org/bot"
  },
  "NotificationSettings": {
    "MaxRetryCount": 3,
    "RetryDelaySeconds": 60,
    "TemplatePath": "Views/Notifications"
  }
}
```

### 3. Servicios Registrados

Los siguientes servicios están registrados en `Program.cs`:

```csharp
// Repositorios
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// Servicios
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<ITemplateService, TemplateService>();

// Canales (Keyed Services)
builder.Services.AddKeyedScoped<INotificationChannel, EmailNotificationChannel>("email");
builder.Services.AddKeyedScoped<INotificationChannel, TelegramNotificationChannel>("telegram");
builder.Services.AddKeyedScoped<INotificationChannel, InAppNotificationChannel>("in-app");
```

## 🌐 Configuración Frontend

### 1. Tipos TypeScript

Los tipos están definidos en `src/types/notification.types.ts`:

```typescript
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'alert';
export type NotificationChannelType = 'email' | 'telegram' | 'in-app';
```

### 2. Servicio de Notificaciones

`src/services/notificationService.ts` proporciona métodos para interactuar con la API:

```typescript
import { notificationService } from '@/services/notificationService';

// Enviar notificación
await notificationService.sendNotification({
  channels: [
    { channelType: 'email', recipients: 'user@example.com' },
    { channelType: 'in-app', recipients: '1' }
  ],
  title: 'Nueva Notificación',
  message: 'Contenido de la notificación',
  type: 'info',
  priority: 'normal'
});

// Obtener notificaciones del usuario
const notifications = await notificationService.getUserNotifications(userId);

// Marcar como leída
await notificationService.markAsRead(notificationId, userId);
```

### 3. Zustand Store

`src/store/notificationStore.ts` maneja el estado de notificaciones:

```typescript
import { useNotificationStore } from '@/store/notificationStore';

const {
  notifications,
  unreadCount,
  isConnected,
  markAsRead,
  markAllAsRead,
  loadNotifications
} = useNotificationStore();
```

### 4. Componentes React

#### NotificationBell

Campana de notificaciones en el header con badge de conteo:

```tsx
import { NotificationBell } from '@/components/notifications/NotificationBell';

<NotificationBell onError={(error) => console.error(error)} />
```

#### NotificationList

Lista completa de notificaciones con filtros:

```tsx
import { NotificationList } from '@/components/notifications/NotificationList';

<NotificationList
  userId={userId}
  onNotificationClick={(notification) => {
    // Navegar a detalle de notificación
  }}
/>
```

## 🚀 Uso del Sistema

### Enviar Notificación Básica

```typescript
import { notificationService } from '@/services/notificationService';

const response = await notificationService.sendNotification({
  channels: [
    {
      channelType: 'email',
      recipients: 'user1@example.com;user2@example.com'
    },
    {
      channelType: 'in-app',
      recipients: '1;2;3' // User IDs separados por ;
    }
  ],
  title: 'Bienvenido a Lefarma',
  message: 'Tu cuenta ha sido creada exitosamente',
  type: 'success',
  priority: 'normal',
  category: 'system'
});
```

### Enviar con Plantilla

```typescript
const response = await notificationService.sendNotification({
  channels: [
    { channelType: 'email', recipients: 'user@example.com' }
  ],
  templateId: 'WelcomeEmail',
  templateData: {
    userName: 'Juan Pérez',
    companyName: 'Mi Empresa S.A.'
  },
  type: 'info'
});
```

### Enviar Notificación Programada

```typescript
const scheduledDate = new Date('2026-03-25T10:00:00');

await notificationService.sendNotification({
  channels: [
    { channelType: 'email', recipients: 'user@example.com' }
  ],
  title: 'Recordatorio de reunión',
  message: 'Tienes una reunión programada',
  scheduledFor: scheduledDate.toISOString()
});
```

### Envío Masivo

```typescript
const response = await notificationService.sendBulkNotification({
  channels: [
    { channelType: 'in-app', recipients: '' } // Se ignora para bulk
  ],
  title: 'Actualización del sistema',
  message: 'El sistema será actualizado esta noche',
  userIds: [1, 2, 3, 4, 5] // Array de user IDs
});
```

## 📡 API Endpoints

### Base URL

```
/api/notifications
```

### Endpoints Disponibles

#### POST `/api/notifications`
Envía una notificación a través de los canales especificados.

**Request:**
```json
{
  "channels": [
    {
      "channelType": "email",
      "recipients": "user@example.com",
      "channelSpecificData": {
        "cc": "cc@example.com",
        "bcc": "bcc@example.com"
      }
    }
  ],
  "title": "Título de la notificación",
  "message": "Contenido del mensaje",
  "type": "info",
  "priority": "normal",
  "category": "system",
  "scheduledFor": "2026-03-25T10:00:00Z",
  "expiresAt": "2026-03-26T10:00:00Z"
}
```

**Response:**
```json
{
  "notificationId": 123,
  "channelResults": {
    "email": {
      "success": true,
      "message": "Email sent successfully",
      "sentRecipients": ["user@example.com"],
      "externalId": "message-id-from-smtp"
    }
  },
  "createdAt": "2026-03-23T15:30:00Z"
}
```

#### POST `/api/notifications/bulk`
Envía notificaciones a múltiples usuarios.

**Request:**
```json
{
  "channels": [
    {
      "channelType": "in-app",
      "recipients": ""
    }
  ],
  "title": "Título",
  "message": "Mensaje",
  "userIds": [1, 2, 3]
}
```

#### POST `/api/notifications/by-role`
Envía notificaciones a todos los usuarios con roles específicos.

**Request:**
```json
{
  "channels": [
    {
      "channelType": "email",
      "recipients": ""
    }
  ],
  "title": "Título",
  "message": "Mensaje",
  "roles": ["Administrador", "GerenteArea"]
}
```

#### POST `/api/notifications/broadcast`
Envía una notificación a todos los canales configurados.

**Request:**
```json
{
  "title": "Título",
  "message": "Mensaje",
  "recipients": "1;2;3"
}
```

#### GET `/api/notifications/user/{userId}`
Obtiene las notificaciones de un usuario.

**Query Params:**
- `unreadOnly` (boolean): Solo notificaciones no leídas

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "notificationId": 123,
      "userId": 1,
      "isRead": false,
      "readAt": null,
      "notification": {
        "id": 123,
        "title": "Notificación",
        "message": "Contenido",
        "type": "info",
        "priority": "normal"
      }
    }
  ]
}
```

#### POST `/api/notifications/{notificationId}/read/{userId}`
Marca una notificación como leída.

#### POST `/api/notifications/read-all/{userId}`
Marca todas las notificaciones del usuario como leídas.

#### GET `/api/notifications/sse`
Endpoint SSE para recibir notificaciones en tiempo real.

**Query Params:**
- `token` (string): JWT token de autenticación

## 🎨 Componentes Frontend

### NotificationBell

Componente de campana que muestra el conteo de notificaciones no leídas.

**Props:**
- `onError?: (error: Error) => void` - Callback para errores

**Ubicación:** Header de la aplicación

### NotificationList

Lista completa con filtros y acciones masivas.

**Props:**
- `userId?: number` - ID del usuario
- `onNotificationClick?: (notification: UserNotification) => void` - Callback al hacer click

**Filtros disponibles:**
- Solo no leídas
- Tipo (info, warning, error, success, alert)
- Categoría (system, orders, payments, catalogs, security)
- Prioridad (low, normal, high, urgent)

### useNotifications Hook

Hook personalizado para manejar la conexión SSE.

**Opciones:**
```typescript
{
  autoConnect?: boolean;      // Conectar automáticamente (default: true)
  onNotification?: (notification) => void;
  onConnectionChange?: (isConnected) => void;
}
```

**Retorna:**
```typescript
{
  isConnected: boolean;
  error: string | null;
  disconnect: () => void;
  reconnect: () => void;
}
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Notificación de Nueva Orden

```typescript
await notificationService.sendNotification({
  channels: [
    { channelType: 'in-app', recipients: '1' },
    { channelType: 'email', recipients: 'gerente@empresa.com' }
  ],
  title: 'Nueva Orden Creada',
  message: 'La orden #ORD-2026-001 ha sido creada exitosamente',
  type: 'success',
  priority: 'normal',
  category: 'orders',
  templateId: 'NewOrder',
  templateData: {
    orderNumber: 'ORD-2026-001',
    customerName: 'Cliente Ejemplo',
    totalAmount: '$1,250.00'
  }
});
```

### Ejemplo 2: Alerta de Pago Pendiente

```typescript
await notificationService.sendNotification({
  channels: [
    { channelType: 'email', recipients: 'tesoreria@empresa.com' },
    { channelType: 'telegram', recipients: 'chat-id-123' }
  ],
  title: '⚠️ Pago Pendiente - Vencido',
  message: 'El pago PROV-2026-001 está vencido. Monto: $5,000.00',
  type: 'alert',
  priority: 'urgent',
  category: 'payments'
});
```

### Ejemplo 3: Notificación de Sistema

```typescript
await notificationService.sendBulkNotification({
  channels: [
    { channelType: 'in-app', recipients: '' }
  ],
  title: '🔄 Mantenimiento Programado',
  message: 'El sistema estará en mantenimiento esta noche de 10pm a 12am',
  type: 'warning',
  priority: 'high',
  category: 'system',
  userIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
});
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Las notificaciones no se muestran en tiempo real

**Síntoma:** La campana no muestra notificaciones nuevas.

**Soluciones:**
- Verifica que el backend esté corriendo
- Verifica que el SSE endpoint esté accesible: `/api/notifications/sse`
- Revisa la consola del navegador para errores de conexión SSE
- Verifica que el token JWT sea válido

**Debug:**
```typescript
// En el hook useNotifications, revisa:
console.log('SSE Connected:', isConnected);
console.log('Notifications count:', notifications.length);
```

#### 2. Email no se envía

**Síntoma:** El canal email retorna error.

**Soluciones:**
- Verifica la configuración SMTP en `appsettings.Development.json`
- Verifica que el servidor SMTP sea accesible desde el backend
- Revisa los logs del backend para errores específicos
- Prueba con un cliente SMTP externo (telnet) para validar credenciales

**Log típico:**
```
[14:30:15 INF] Sending email notification to user@example.com
[14:30:16 ERR] Failed to send email via SMTP
```

#### 3. Telegram no funciona

**Síntoma:** El canal telegram retorna error.

**Soluciones:**
- Configura el BotToken en `appsettings.Development.json`
- Asegúrate de que el bot esté iniciado (envía `/start` al bot desde Telegram)
- Verifica que el chatId sea correcto
- Usa `@userinfobot` en Telegram para obtener tu chatId

#### 4. Error de compilación en el backend

**Síntoma:** El proyecto no compila después de agregar notificaciones.

**Soluciones:**
- Asegúrate de haber ejecutado `dotnet restore`
- Verifica que todos los paquetes NuGet estén instalados:
  - `MailKit`
  - `Microsoft.AspNetCore.SignalR`
  - `Serilog`

```bash
dotnet restore
dotnet clean
dotnet build
```

#### 5. Las tablas no se crean

**Síntoma:** Error al acceder al repositorio de notificaciones.

**Solución:**
Ejecuta manualmente el script SQL en SSMS o Azure Data Studio.

```sql
-- Ubicación: lefarma.database/create_notification_tables.sql
-- Ejecutar contra la base de datos Lefarma
```

### Logs y Debugging

#### Backend Logs

Los logs de notificaciones se escriben en `logs/wide-events-.json`:

```bash
# Buscar errores de notificaciones
cat logs/wide-events-*.json | jq 'select(.Message | contains("Notification"))'
```

#### Frontend Debug

```typescript
// Habilitar debug mode en el store
const { notifications, isConnected } = useNotificationStore();

console.table(notifications.map(n => ({
  id: n.id,
  title: n.notification?.title,
  isRead: n.isRead,
  type: n.notification?.type
})));
```

### Performance Tips

1. **Usar filtros en el API:**
   ```typescript
   // ❌ Mal: Traer todas y filtrar en frontend
   const all = await notificationService.getUserNotifications(userId);
   const unread = all.filter(n => !n.isRead);

   // ✅ Bien: Filtrar en el backend
   const unread = await notificationService.getUserNotifications(userId, {
     unreadOnly: true
   });
   ```

2. **Evitar reconexiones excesivas:**
   ```typescript
   // El hook useNotifications maneja reconexión automática
   // No lo instancies múltiples veces
   ```

3. **Usar paginación para listas grandes:**
   ```typescript
   // Implementar paginación en el backend y frontend
   // para usuarios con muchas notificaciones
   ```

## 📚 Referencias Adicionales

- [MailKit Documentation](https://documentation.mailkit.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/)

## 🤝 Soporte

Para problemas o preguntas:

1. Revisa los logs en `logs/wide-events-.json`
2. Revisa la consola del navegador
3. Verifica la configuración en `appsettings.Development.json`
4. Ejecuta el script SQL si las tablas no existen

---

**Versión:** 1.0.0
**Fecha:** 23 de Marzo, 2026
**Autores:** Equipo de Desarrollo Lefarma
