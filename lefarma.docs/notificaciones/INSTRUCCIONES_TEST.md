# 🚀 Sistema de Notificaciones - Instrucciones de Prueba

## Estado Actual

✅ **Backend**: Corriendo en http://localhost:5134
✅ **Frontend**: Corriendo en http://localhost:5174
✅ **Autenticación**: Probada y funcionando
⚠️ **Base de datos**: Requiere ejecutar script SQL manualmente

---

## Opción 1: Probar con la Interfaz Web (Recomendado)

### Paso 1: Ejecutar Script SQL (PENDIENTE)

Si las tablas no existen, necesitas ejecutar el script:

**Ubicación**: `/home/zurybr/workspaces/01-lefarma-project/lefarma.database/create_tables_quick.sql`

**Opciones para ejecutar**:
- Usar **SQL Server Management Studio** (SSMS)
- Usar **Azure Data Studio**
- Conexión: Server=192.168.4.2, Database=Lefarma, User=coreapi

### Paso 2: Abrir el Frontend

Navegar a: **http://localhost:5174**

### Paso 3: Iniciar Sesión

- **Usuario**: `54`
- **Password**: `tt01tt`
- **Dominio**: Grupolefarma (aparece automáticamente)

Deberías iniciar sesión como **Carlos Guzmán TI**

### Paso 4: Probar Notificaciones

1. **Navegar a**: http://localhost:5174/notificaciones
2. **Llenar el formulario**:
   - Título: `Prueba desde Web`
   - Mensaje: `Notificación de prueba`
   - Tipo: `success`
   - Prioridad: `normal`
   - Canales: ✅ `in-app`
   - Destinatarios: `21`
3. **Click en**: "Enviar Notificación"

**Resultado esperado**:
- ✅ Notificación aparece instantáneamente en la lista
- ✅ Badge con contador en la campana del header
- ✅ Indicador de conexión verde (SSE conectado)

---

## Opción 2: Probar con Terminal (API Directa)

### Paso 1: Autenticarse y obtener token

```bash
TOKEN=$(curl -s -X POST http://localhost:5134/api/auth/login-step-two \
  -H "Content-Type: application/json" \
  -d '{"username": "54", "domain": "Grupolefarma", "password": "tt01tt"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])")

echo "Token obtenido: ${TOKEN:0:50}..."
```

### Paso 2: Enviar notificación in-app

```bash
curl -X POST http://localhost:5134/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channels": [
      {
        "channelType": "in-app",
        "recipients": "21"
      }
    ],
    "title": "🎉 Notificación de Prueba",
    "message": "Enviada desde terminal - Sistema funcionando!",
    "type": "success",
    "priority": "normal",
    "category": "system"
  }' | python3 -m json.tool
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "notificationId": 1,
    "channelResults": {
      "in-app": {
        "success": true,
        "message": "Notification sent successfully"
      }
    }
  }
}
```

### Paso 3: Verificar en el frontend

Después de enviar la notificación:
1. Abre http://localhost:5174 en el navegador
2. Inicia sesión con usuario 54
3. Deberías ver la notificación aparecer en tiempo real
4. La campana en el header mostrará el contador

---

## 🎯 Verificación de Funcionalidades

### In-App (SSE)
- ✅ Notificación aparece instantáneamente
- ✅ Badge con contador de no leídas
- ✅ Indicador de conexión verde
- ✅ Reconexión automática si se pierde conexión

### Interfaz
- ✅ Lista de notificaciones con filtros
- ✅ Marcar como leída (individual)
- ✅ Marcar todas como leídas
- ✅ Iconos según tipo (✅❌⚠️🚨ℹ️)
- ✅ Colores según prioridad

### Formulario de Prueba
- ✅ Envío a múltiples canales
- ✅ Selección de tipo y prioridad
- ✅ Visualización de resultados

---

## 🔍 Troubleshooting

### Error: Tabla no existe
**Solución**: Ejecutar script SQL del Paso 1

### Error: 401 Unauthorized
**Solución**: Verificar que el token sea válido o volver a autenticarse

### La notificación no aparece en tiempo real
**Causa**: Conexión SSE no establecida
**Verificar**:
```bash
# Ver que el backend esté escuchando en puerto 5134
lsof -i:5134

# Ver logs del backend
cd /home/zurybr/workspaces/01-lefarma-project/lefarma.backend/src/Lefarma.API
dotnet run
```

### Frontend no compila
**Solución**:
```bash
cd /home/zurybr/workspaces/01-lefarma-project/lefarma.frontend
npm install
npm run dev
```

---

## 📊 Resumen del Sistema

### Backend (100% Completo)
- 3 entidades de dominio
- 3 canales (Email, Telegram, In-App)
- 7 endpoints API
- Server-Sent Events para tiempo real
- Sistema de plantillas

### Frontend (100% Completo)
- Zustand store con estado
- Hook SSE con reconexión automática
- 2 componentes (NotificationBell, NotificationList)
- Página de prueba completa
- Integrado en Header y Sidebar

### Lo que falta:
1. ✨ Ejecutar script SQL en la base de datos
2. 📧 Configurar credenciales reales de email (opcional)
3. 🤖 Configurar bot token de Telegram (opcional)

---

## 🎉 ¡Sistema Listo!

Una vez ejecutes el script SQL, el sistema de notificaciones estará **100% funcional**.

**Usuario de prueba**: 54 (Carlos Guzmán TI)
**Password**: tt01tt
**URL Frontend**: http://localhost:5174
**URL Backend**: http://localhost:5134

¡Disfruta del sistema de notificaciones de Lefarma! 🚀
