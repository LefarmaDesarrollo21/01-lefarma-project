# Technology Stack

**Analysis Date:** 2026-03-30

## Languages

**Primary:**
- C# 10.0 - Backend API (`.cs`, `.csproj`)
- TypeScript 5.9.3 - Frontend (`.ts`, `.tsx`)

**Secondary:**
- JavaScript - Frontend (via React/Vite)

## Runtime

**Environment:**
- .NET 10.0 - Backend runtime (`net10.0` target framework)
- Node.js - Frontend runtime (implied from npm/vite)

**Package Manager:**
- Backend: NuGet (.NET CLI, Visual Studio)
- Frontend: npm (package.json, package-lock.json present)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- ASP.NET Core 10.0.2 - Backend web framework
- React 19.2.0 - Frontend UI framework
- Vite 7.3.1 - Frontend build tool and dev server
- Entity Framework Core 10.0.2 - Backend ORM for database access

**Testing:**
- xUnit 2.9.2 - Backend test runner
- Moq 4.20.72 - Backend mocking framework
- FluentAssertions 7.0.0 - Backend assertion library
- Playwright 1.58.2 - Frontend E2E testing
- coverlet.collector 6.0.2 - Backend code coverage

**Build/Dev:**
- Swashbuckle.AspNetCore 10.1.0 - Swagger/OpenAPI documentation
- ESLint 9.39.1 - Frontend linting
- Prettier 3.8.1 - Frontend code formatting
- TypeScript-ESLint 8.46.4 - TypeScript linting rules

## Key Dependencies

**Critical (Backend):**
- ErrorOr 2.0.1 - Result pattern for error handling in services
- FluentValidation 12.1.1 - Request DTO validation
- Microsoft.AspNetCore.Authentication.JwtBearer 10.0.2 - JWT authentication
- Serilog.AspNetCore 10.0.0 - Structured logging
- System.DirectoryServices.Protocols 9.0.0 - LDAP/Active Directory integration
- MailKit 4.15.1 - Email (SMTP) client
- Handlebars.Net 2.1.6 - Template engine for notifications

**Critical (Frontend):**
- Radix UI - Accessible UI primitives (@radix-ui/* packages)
- @tanstack/react-table 8.21.3 - Advanced data tables
- react-hook-form 7.71.1 - Form management
- zod 4.3.6 - Schema validation
- zustand 5.0.10 - Global state management
- jotai 2.18.0 - Atomic state management
- axios 1.13.4 - HTTP client
- react-router-dom 7.13.0 - Client-side routing
- tailwindcss 3.4.19 - Utility-first CSS framework

**Infrastructure (Backend):**
- Microsoft.EntityFrameworkCore.SqlServer 10.0.2 - SQL Server provider
- Microsoft.EntityFrameworkCore.Tools 10.0.2 - EF Core CLI tools

**UI/UX (Frontend):**
- @dnd-kit/* - Drag and drop functionality
- sonner 2.0.7 - Toast notifications
- lucide-react 0.563.0 - Icon library
- @tinymce/tinymce-react 6.3.0 - Rich text editor
- reactflow 11.11.4 - Flow/React graph visualization
- recharts 2.15.4 - Charting library

## Configuration

**Environment:**
- Backend: `appsettings.json`, `appsettings.Development.json` (.NET configuration)
- Frontend: `.env`, `.env.development`, `.env.production` (Vite environment variables)
- Multiple environments supported: Development, Production

**Key configs required:**
- Backend: Connection strings, JWT settings, LDAP domains, SMTP settings, Telegram bot token
- Frontend: API base URL (`VITE_API_URL`), app name, app version

**Build:**
- Backend: `.csproj` files (MSBuild-based)
- Frontend: `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `tailwind.config.js`

## Platform Requirements

**Development:**
- .NET 10.0 SDK
- Node.js 20+ (implied from TypeScript 5.9.3)
- SQL Server instance (192.168.4.2 for local development)

**Production:**
- Backend: .NET 10.0 runtime, Windows Server or Linux container
- Frontend: Static hosting (Vite build output)
- Database: SQL Server
- LDAP servers: 192.168.4.2 (Asokam), 192.168.1.7 (Artricenter)

---

*Stack analysis: 2026-03-30*
