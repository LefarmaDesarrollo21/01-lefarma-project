# External Integrations

**Analysis Date:** 2026-03-30

## APIs & External Services

**Email:**
- SMTP - Email notifications (mail.grupolefarma.com.mx)
  - SDK/Client: MailKit 4.15.1
  - Auth: Username/password in `EmailSettings.Smtp` config section
  - Implementation: `lefarma.backend/src/Lefarma.API/Features/Notifications/Services/Channels/EmailNotificationChannel.cs`

**Telegram:**
- Telegram Bot API - Push notifications via Telegram bots
  - SDK/Client: HttpClient (no SDK)
  - Auth: Bot token in `TelegramSettings.BotToken`
  - Implementation: `lefarma.backend/src/Lefarma.API/Features/Notifications/Services/Channels/TelegramNotificationChannel.cs`

**In-App Notifications:**
- Server-Sent Events (SSE) - Real-time notifications to frontend
  - Implementation: `lefarma.backend/src/Lefarma.API/Infrastructure/Middleware/SseMiddleware.cs`
  - Frontend client: `lefarma.frontend/src/services/sseService.ts`

## Data Storage

**Databases:**
- SQL Server - Primary relational database
  - Connection 1: `DefaultConnection` → Lefarma database
  - Connection 2: `AsokamConnection` → Asokam database
  - Server: 192.168.4.2
  - Client: Entity Framework Core 10.0.2
  - Config location: `appsettings.json` → `ConnectionStrings` section
  - Migrations: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Migrations/`

**File Storage:**
- Local filesystem - Static files (help images, uploaded documents)
  - Path: `wwwroot/media/archivos`
  - Max file size: 10 MB
  - Allowed extensions: .pdf, .xlsx, .docx, .pptx, .jpg, .jpeg, .png, .gif, .webp
  - Implementation: `lefarma.backend/src/Lefarma.API/Features/Archivos/Services/ArchivoService.cs`

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Active Directory (LDAP) - Corporate directory authentication
  - Implementation: `lefarma.backend/src/Lefarma.API/Services/Identity/ActiveDirectoryService.cs`
  - SDK: System.DirectoryServices.Protocols 9.0.0 (cross-platform LDAP)
  - Configured domains:
    - Asokam: 192.168.4.2:389
    - Artricenter: 192.168.1.7:389
  - Base DN: com.mx
  - Timeout: 10 seconds

**JWT Tokens:**
- JWT (JSON Web Tokens) - API authentication tokens
  - Implementation: `lefarma.backend/src/Lefarma.API/Services/Identity/TokenService.cs`
  - SDK: Microsoft.AspNetCore.Authentication.JwtBearer 10.0.2
  - Auth: Secret key, issuer, audience in `JwtSettings` config
  - Token expiration: 60 minutes (access), 7 days (refresh)

**Master Password:**
- Development bypass: `tt01tt` for local testing
  - Config: `Auth:MasterPassword` in appsettings.json
  - Implementation: Dev token middleware

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Serilog - Structured logging
  - Implementation: `lefarma.backend/src/Lefarma.API/Program.cs`
  - Sinks: Console (development), File (JSON rolling logs)
  - Log levels: Information (Lefarma.API), Warning (Microsoft), Fatal (Microsoft.EntityFrameworkCore)
  - File path: `logs/wide-events-.json`
  - Retention: 30 days
  - Roll interval: Daily

## CI/CD & Deployment

**Hosting:**
- Not detected (project appears to be in development phase)

**CI Pipeline:**
- Not detected

## Environment Configuration

**Required env vars (Backend - via appsettings.json):**
- `ConnectionStrings:DefaultConnection` - SQL Server connection string for Lefarma DB
- `ConnectionStrings:AsokamConnection` - SQL Server connection string for Asokam DB
- `JwtSettings:SecretKey` - JWT signing key (≥32 chars)
- `JwtSettings:Issuer` - JWT issuer identifier
- `JwtSettings:Audience` - JWT audience identifier
- `EmailSettings:SmtpServer` - SMTP server host
- `EmailSettings:SmtpPort` - SMTP port
- `EmailSettings:Username` - SMTP username
- `EmailSettings:Password` - SMTP password
- `TelegramSettings:BotToken` - Telegram bot API token
- `EmailSettings:Ldap:Domains[]` - Array of LDAP domain configurations

**Required env vars (Frontend - via .env):**
- `VITE_API_URL` - Backend API base URL (default: http://localhost:5134/)
- `VITE_APP_NAME` - Application name (default: Lefarma)
- `VITE_APP_VERSION` - Application version (default: 1.0.0)

**Secrets location:**
- Backend: JSON configuration files (`appsettings.json`, `appsettings.Development.json`)
- Frontend: `.env` files (gitignored)
- Note: .env files are gitignored and contain sensitive credentials

## Webhooks & Callbacks

**Incoming:**
- None detected (webhook endpoints not found)

**Outgoing:**
- None detected (outgoing webhook integrations not found)

**Real-time:**
- Server-Sent Events (SSE) - Unidirectional push notifications to frontend
  - Implementation: Custom SSE middleware
  - Frontend: EventSource in sseService.ts

---

*Integration audit: 2026-03-30*
